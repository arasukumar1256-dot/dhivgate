
-- =========================================
-- GATE ECE EXAM PLATFORM
-- Supabase PostgreSQL schema
-- =========================================

create extension if not exists pgcrypto;

-- 1. USER PROFILES
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_id text unique not null,
    role text not null default 'student'
        check (role in ('student', 'host')),
    created_at timestamptz default now()
);

-- 2. EXAMS
create table if not exists public.exams (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    subject text,
    duration_minutes integer not null default 180,
    status text not null default 'draft'
        check (status in ('draft', 'published', 'closed')),
    created_at timestamptz default now()
);

-- 3. QUESTIONS
-- No answer keys are stored in this table.
create table if not exists public.questions (
    id uuid primary key default gen_random_uuid(),
    question_type text not null
        check (question_type in ('MCQ', 'MSQ', 'NAT')),
    question_text text not null,
    options jsonb,
    diagram_url text,
    marks numeric not null default 1,
    negative_marks numeric not null default 0,
    created_at timestamptz default now()
);

-- 4. PRIVATE ANSWER KEYS
create table if not exists public.question_keys (
    question_id uuid primary key
        references public.questions(id) on delete cascade,
    correct_values text[],
    correct_numeric numeric,
    tolerance numeric default 0,
    explanation text
);

-- 5. EXAM QUESTION MAPPING
create table if not exists public.exam_questions (
    exam_id uuid references public.exams(id) on delete cascade,
    question_id uuid references public.questions(id) on delete cascade,
    question_order integer not null,
    primary key (exam_id, question_id)
);

-- 6. STUDENT ATTEMPTS
create table if not exists public.attempts (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references auth.users(id),
    exam_id uuid not null references public.exams(id),
    answers jsonb not null default '{}'::jsonb,
    score numeric not null default 0,
    total_questions integer not null default 0,
    submitted_at timestamptz default now(),
    review jsonb not null default '[]'::jsonb,
    unique (student_id, exam_id)
);

-- =========================================
-- HOST CHECK
-- =========================================

create or replace function public.is_host()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'host'
    );
$$;

revoke all on function public.is_host() from public;
grant execute on function public.is_host() to authenticated;

-- =========================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================

alter table public.profiles enable row level security;
alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.question_keys enable row level security;
alter table public.exam_questions enable row level security;
alter table public.attempts enable row level security;

-- PROFILES
create policy "Users view own profile or host views all"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_host());

-- No student can change their role or display ID.
create policy "Host manages profiles"
on public.profiles for all
to authenticated
using (public.is_host())
with check (public.is_host());

-- EXAMS
create policy "Students view published exams"
on public.exams for select
to authenticated
using (status = 'published' or public.is_host());

create policy "Host manages exams"
on public.exams for all
to authenticated
using (public.is_host())
with check (public.is_host());

-- QUESTIONS
create policy "Students view questions in published exams"
on public.questions for select
to authenticated
using (
    public.is_host()
    or exists (
        select 1
        from public.exam_questions eq
        join public.exams e on e.id = eq.exam_id
        where eq.question_id = questions.id
          and e.status = 'published'
    )
);

create policy "Host manages questions"
on public.questions for all
to authenticated
using (public.is_host())
with check (public.is_host());

-- ANSWER KEYS: HOST ONLY
create policy "Host manages answer keys"
on public.question_keys for all
to authenticated
using (public.is_host())
with check (public.is_host());

-- EXAM QUESTION MAPPING
create policy "Students view published exam questions"
on public.exam_questions for select
to authenticated
using (
    public.is_host()
    or exists (
        select 1 from public.exams e
        where e.id = exam_questions.exam_id
          and e.status = 'published'
    )
);

create policy "Host manages exam question mapping"
on public.exam_questions for all
to authenticated
using (public.is_host())
with check (public.is_host());

-- ATTEMPTS: OWN RECORDS ONLY
create policy "Students view own attempts"
on public.attempts for select
to authenticated
using (student_id = auth.uid() or public.is_host());

-- No direct student insert/update/delete policy.
-- Submission is handled by a secure database function.

-- =========================================
-- EXAM SUBMISSION AND AUTOMATIC GRADING
-- =========================================

create or replace function public.submit_exam(
    p_exam_id uuid,
    p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    q record;
    submitted jsonb;
    is_correct boolean;
    earned numeric;
    final_score numeric := 0;
    question_count integer := 0;
    review_items jsonb := '[]'::jsonb;
    numeric_answer numeric;
    user_values text[];
begin
    if auth.uid() is null then
        raise exception 'Authentication required';
    end if;

    if jsonb_typeof(p_answers) <> 'object' then
        raise exception 'Answers must be a JSON object';
    end if;

    if not exists (
        select 1 from public.exams
        where id = p_exam_id and status = 'published'
    ) then
        raise exception 'Exam is not available';
    end if;

    if exists (
        select 1 from public.attempts
        where student_id = auth.uid()
          and exam_id = p_exam_id
    ) then
        raise exception 'Exam already submitted';
    end if;

    for q in
        select
            qu.id,
            qu.question_type,
            qu.marks,
            qu.negative_marks,
            k.correct_values,
            k.correct_numeric,
            k.tolerance,
            k.explanation
        from public.exam_questions eq
        join public.questions qu on qu.id = eq.question_id
        join public.question_keys k on k.question_id = qu.id
        where eq.exam_id = p_exam_id
        order by eq.question_order
    loop
        question_count := question_count + 1;
        submitted := p_answers -> q.id::text;
        is_correct := false;

        if submitted is not null and submitted <> 'null'::jsonb then

            if q.question_type = 'MCQ' then
                is_correct :=
                    jsonb_typeof(submitted) = 'string'
                    and submitted #>> '{}' = q.correct_values[1];

            elsif q.question_type = 'MSQ' then
                if jsonb_typeof(submitted) = 'array' then
                    select array_agg(value order by value)
                    into user_values
                    from jsonb_array_elements_text(submitted) as x(value);

                    is_correct :=
                        coalesce(user_values, ARRAY[]::text[])
                        =
                        coalesce(
                            (select array_agg(v order by v)
                             from unnest(q.correct_values) as t(v)),
                            ARRAY[]::text[]
                        );
                end if;

            elsif q.question_type = 'NAT' then
                if jsonb_typeof(submitted) = 'number' then
                    numeric_answer := (submitted #>> '{}')::numeric;

                    is_correct :=
                        q.correct_numeric is not null
                        and abs(numeric_answer - q.correct_numeric)
                            <= coalesce(q.tolerance, 0);
                end if;
            end if;
        end if;

        if is_correct then
            earned := q.marks;
        elsif submitted is not null and submitted <> 'null'::jsonb then
            earned := -q.negative_marks;
        else
            earned := 0;
        end if;

        final_score := final_score + earned;

        review_items := review_items || jsonb_build_array(
            jsonb_build_object(
                'question_id', q.id,
                'your_answer', submitted,
                'correct', is_correct,
                'correct_values', q.correct_values,
                'correct_numeric', q.correct_numeric,
                'explanation', q.explanation,
                'marks_awarded', earned
            )
        );
    end loop;

    if question_count = 0 then
        raise exception 'No questions configured for this exam';
    end if;

    insert into public.attempts (
        student_id,
        exam_id,
        answers,
        score,
        total_questions,
        review
    )
    values (
        auth.uid(),
        p_exam_id,
        p_answers,
        final_score,
        question_count,
        review_items
    );

    return jsonb_build_object(
        'score', final_score,
        'total_questions', question_count,
        'review', review_items
    );
end;
$$;

revoke all on function public.submit_exam(uuid, jsonb) from public;
grant execute on function public.submit_exam(uuid, jsonb)
to authenticated;
