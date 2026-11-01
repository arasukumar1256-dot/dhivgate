# GATE ECE Mock Exam Platform (Starter)

A mobile-friendly starter website for two students and one host/admin. It uses GitHub Pages for static hosting and Supabase for authentication, database and optional diagram storage.

## Important scope
This ZIP is a working starter scaffold, not a finished proctored examination product. The login and bulk-import flows connect to Supabase after configuration. Some modules (host reporting, persistent analytics, exam scheduling, live monitoring, diagram uploader UI) are placeholders and need further development. The included exam UI is a basic practice implementation.

## Setup
1. Create a Supabase project.
2. In Supabase SQL Editor, run `database/schema.sql`.
3. Create three Auth users: two students and one host.
4. Insert profile rows in `public.profiles` for those users. Use unique `display_id` values such as GATE001, GATE002 and ADMIN001. Set only the trusted host's `role` to `host`.
5. Copy the project URL and anon/public key from Supabase project settings into `js/config.js`. Never use the service_role key in browser code.
6. Create a public Storage bucket named `question-diagrams` for public question images, or use signed URLs if you want private diagrams.
7. Test locally using a simple static server, then publish the folder to GitHub Pages.

## GitHub Pages
Push this folder contents to a GitHub repository. In repository Settings > Pages, choose deploy from branch and select `main` / root. The website will be available at your GitHub Pages address.

## Bulk question import
Host signs in through `admin/admin-login.html`, then opens `admin/bulk-upload.html`. Upload a JSON file shaped as either an array of question objects or `{ "questions": [...] }`. Import runs in batches of 500 with upsert on `question_id`. For 10,000 questions/hour, performance depends on network, Supabase limits, row size and diagram payloads. Store diagrams as files in Storage and keep only URLs in question rows.

## Question JSON fields
- `question_id`: unique string
- `subject`, `topic`
- `type`: `MCQ`, `MSQ` or `NAT`
- `question`: object containing `text`, optional `image` or `circuit`
- `options`: array of `{id,text}` for MCQ/MSQ; empty for NAT
- `answer`: array of correct option IDs or accepted NAT answer strings
- `solution`: object containing explanation and optional image/formula
- `marks`, `negative_marks`, `tags`

## Security checklist
- Do not store host passcodes in HTML, JS, JSON or GitHub.
- Use Supabase Auth and database RLS policies.
- Never expose the Supabase service_role key in frontend code.
- Restrict host profile creation/role changes to trusted database administration.
- For a real exam, move answer keys out of student-readable rows or implement a secure server-side grading function. The starter schema currently stores answers in the question table, so do not use it for high-stakes or confidential exams without that change.
- Configure database policies carefully and test with separate student and host accounts.

## Storage and scale
50,000 text questions may fit depending on row size, but diagrams can consume storage quickly. Keep image files compressed and external to question JSON. Monitor Supabase quotas and back up question JSON exports. GitHub is for code/version control, not a database replacement.
