
async function checkAccess(requiredRole) {
    const { data: sessionData } =
        await supabase.auth.getSession();

    const user = sessionData.session?.user;

    if (!user) {
        window.location.replace("../login.html");
        return false;
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("display_id, role")
        .eq("id", user.id)
        .single();

    if (error || !profile || profile.role !== requiredRole) {
        window.location.replace("../login.html");
        return false;
    }

    return true;
}
