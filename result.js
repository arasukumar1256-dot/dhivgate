
const result = JSON.parse(
    sessionStorage.getItem("latest_exam_result") || "null"
);

if (!result) {
    document.body.innerHTML =
        "<h2>No submitted exam result found.</h2>";
} else {
    document.getElementById("score").textContent =
        result.score;

    document.getElementById("total").textContent =
        result.total_questions;

    const review = document.getElementById("review");

    result.review.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "review-card";

        const status = item.correct ? "Correct" : "Incorrect";

        card.innerHTML = `
            <h3>Question ${index + 1} — ${status}</h3>
            <p>Marks awarded: ${item.marks_awarded}</p>
        `;

        const explanation = document.createElement("p");
        explanation.textContent =
            item.explanation || "No explanation provided.";

        card.appendChild(explanation);
        review.appendChild(card);
    });
}
