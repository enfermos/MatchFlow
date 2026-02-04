import { getData, postData, setSession, getSession, clearSession } from "./api.js";

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");

const showAlert = (el, msg, type = "error") => {
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
};

/* REDIRECCIÓN SI YA LOGUEADO */
if (getSession() && location.pathname.includes("index")) {
  location.href = "./dashboard.html";
}

/* LOGIN */
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const alertBox = document.querySelector("#login-alert");
    alertBox.innerHTML = "";

    const email = document.querySelector("#email").value.trim().toLowerCase();
    const password = document.querySelector("#password").value.trim();

    const users = await getData(`/users?email=${email}&password=${password}`);

    if (!users || users.length === 0) {
      showAlert(alertBox, "Correo o contraseña incorrectos");
      return;
    }

    const user = users[0];

    setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    location.href = "./dashboard.html";
  });
}

/* REGISTRO */
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const alertBox = document.querySelector("#register-alert");
    alertBox.innerHTML = "";

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim().toLowerCase();
    const password = document.querySelector("#password").value.trim();

    if (!name || !email || !password) {
      showAlert(alertBox, "Completa todos los campos");
      return;
    }

    const exists = await getData(`/users?email=${email}`);

    if (exists && exists.length > 0) {
      showAlert(alertBox, "Ese correo ya está registrado");
      return;
    }

    await postData("/users", {
      name,
      email,
      password,
      role: "user",
    });

    clearSession();
    showAlert(alertBox, "Registro exitoso", "success");

    setTimeout(() => {
      location.href = "./index.html";
    }, 1000);
  });
}
