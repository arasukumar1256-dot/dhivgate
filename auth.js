const client=getSupabase();const form=document.getElementById('loginForm');if(form)form.addEventListener('submit',async e=>{e.preventDefault();const msg=document.getElementById('message');if(!client){msg.textContent='Configure js/config.js with Supabase URL and anon key first.';return;}const {data,error}=await client.auth.signInWithPassword({email:email.value,password:password.value});if(error){msg.textContent=error.message;return;}location.href='dashboard.html';});const logout=document.getElementById('logout');if(logout)logout.onclick=async()=>{if(client)await client.auth.signOut();location.href='login.html';};

/* =================================
   PROFESSIONAL GATE ECE LOGIN PAGE
================================= */

.login-page {
    margin: 0;
    min-height: 100vh;
    font-family: "Segoe UI", Arial, sans-serif;
    background: #f1f5fb;
    color: #17233d;
}

.login-layout {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    min-height: 100vh;
}

/* LEFT SECTION */

.login-left {
    position: relative;
    padding: 45px 8%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: white;
    background:
        radial-gradient(circle at 85% 15%, #315dba 0, transparent 35%),
        linear-gradient(135deg, #101d3b, #142d59 60%, #1b4480);
    overflow: hidden;
}

.brand {
    display: flex;
    align-items: center;
    gap: 13px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 1px;
}

.brand-icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    background: #ffffff;
    color: #17428b;
    border-radius: 12px;
    font-size: 25px;
    font-weight: 800;
}

.hero-content {
    max-width: 580px;
    margin: 65px 0;
}

.hero-tag {
    display: inline-block;
    padding: 9px 15px;
    border: 1px solid #7897d4;
    border-radius: 30px;
    color: #c6d8ff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
}

.hero-content h1 {
    margin: 28px 0 20px;
    font-size: clamp(38px, 5vw, 62px);
    line-height: 1.15;
    letter-spacing: -2px;
}

.hero-content h1 span {
    color: #75a7ff;
}

.hero-content p {
    max-width: 490px;
    color: #d0dbef;
    font-size: 16px;
    line-height: 1.9;
}

.feature-list {
    display: grid;
    gap: 17px;
    margin-top: 38px;
    color: #e2eaff;
    font-size: 14px;
}

.left-footer {
    color: #aabbd9;
    font-size: 12px;
}

/* RIGHT SECTION */

.login-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 35px 25px;
}

.login-card {
    width: 100%;
    max-width: 420px;
    padding: 42px;
    background: white;
    border: 1px solid #e7ecf5;
    border-radius: 20px;
    box-shadow: 0 18px 55px rgba(27, 48, 91, 0.10);
    box-sizing: border-box;
}

.login-symbol {
    width: 53px;
    height: 53px;
    display: grid;
    place-items: center;
    border-radius: 15px;
    background: #eaf1ff;
    color: #2859ae;
    font-size: 27px;
}

.login-card h2 {
    margin: 25px 0 8px;
    font-size: 29px;
    color: #172b50;
}

.login-subtitle {
    margin: 0 0 30px;
    color: #8490a4;
    font-size: 14px;
}

.login-card label {
    display: block;
    margin-bottom: 10px;
    color: #334563;
    font-size: 13px;
    font-weight: 700;
}

.login-card input {
    width: 100%;
    height: 52px;
    padding: 0 15px;
    border: 1px solid #dce3ef;
    border-radius: 10px;
    background: #f9fbff;
    color: #172b50;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    transition: 0.2s;
}

.login-card input:focus {
    border-color: #3973d5;
    box-shadow: 0 0 0 4px rgba(57, 115, 213, 0.10);
    background: white;
}

.login-card button {
    width: 100%;
    height: 53px;
    margin-top: 22px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(100deg, #2455a9, #3979dc);
    color: white;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.25s;
}

.login-card button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(36, 85, 169, 0.25);
}

.login-card button span {
    margin-left: 8px;
    font-size: 19px;
}

.login-message {
    min-height: 18px;
    margin: 12px 0 0;
    color: #d14343;
    font-size: 13px;
}

.login-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 25px 0;
    color: #a2adbd;
    font-size: 10px;
    letter-spacing: 1.5px;
}

.login-divider::before,
.login-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #e9edf4;
}

.access-info {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    color: #63718a;
    font-size: 12px;
}

.access-info div {
    display: flex;
    align-items: center;
    gap: 7px;
}

.access-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3e83e8;
}

.admin-dot {
    background: #9a70d8;
}

.security-note {
    margin: 25px 0 0;
    color: #9aa5b5;
    text-align: center;
    font-size: 11px;
}

.right-footer {
    margin-top: 30px;
    color: #96a0b0;
    text-align: center;
    font-size: 11px;
}

/* MOBILE RESPONSIVE */

@media (max-width: 850px) {
    .login-layout {
        grid-template-columns: 1fr;
    }

    .login-left {
        min-height: 390px;
        padding: 30px 7%;
    }

    .hero-content {
        margin: 45px 0;
    }

    .hero-content h1 {
        font-size: 42px;
    }

    .login-right {
        padding: 45px 20px;
    }
}

@media (max-width: 480px) {
    .login-left {
        min-height: 350px;
    }

    .hero-content h1 {
        font-size: 35px;
    }

    .hero-content p {
        font-size: 14px;
    }

    .login-card {
        padding: 28px 22px;
    }

    .access-info {
        flex-direction: column;
        gap: 13px;
    }
}
