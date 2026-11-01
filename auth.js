
function loginWithID(userID) {
    const id = userID.trim().toUpperCase();

    if (id === "GATE001" || id === "GATE002") {
        sessionStorage.setItem("gate_user_id", id);
        sessionStorage.setItem("gate_role", "student");
        window.location.href = "dashboard.html";
    }
    else if (id === "ADMIN001") {
        sessionStorage.setItem("gate_user_id", id);
        sessionStorage.setItem("gate_role", "host");
        window.location.href = "admin/dashboard.html";
    }
    else {
        document.getElementById("message").textContent =
            "Invalid ID. Please enter a valid ID.";
    }
}
