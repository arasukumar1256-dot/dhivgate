
async function submitExam(examId, answers) {
    const { data: sessionData } =
        await supabase.auth.getSession();

    if (!sessionData.session) {
        alert("Please sign in first.");
        window.location.href = "login.html";
        return;
    }

    const { data, error } = await supabase.rpc(
        "submit_exam",
        {
            p_exam_id: examId,
            p_answers: answers
        }
    );

    if (error) {
        alert("Submission failed: " + error.message);
        return;
    }

    sessionStorage.setItem(
        "latest_exam_result",
        JSON.stringify(data)
    );

    window.location.href = "result.html";
}
