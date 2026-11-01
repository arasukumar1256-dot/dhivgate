
function requireStudent() {
    const id = sessionStorage.getItem("gate_user_id");
    const role = sessionStorage.getItem("gate_role");

    if (!id || role !== "student") {
        window.location.replace("login.html");
    }
}

function requireHost() {
    const id = sessionStorage.getItem("gate_user_id");
    const role = sessionStorage.getItem("gate_role");

    if (id !== "ADMIN001" || role !== "host") {
        window.location.replace("../login.html");
    }
}
