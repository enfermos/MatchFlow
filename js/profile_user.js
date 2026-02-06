import {
  getData,
  putData,
  patchData,
  getSession,
  clearSession,
} from "./api.js";

let isEditMode = false;
let originalData = {};
let currentUser = getSession();

if (!currentUser) location.href = "index.html";

// Función para actualizar el sidebar y header
function actualizarSidebarYHeader() {
  const session = getSession();
  const userName = session.nombre || session.name || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase();
  const roleLabel =
    session.role === "candidate"
      ? "Candidato"
      : session.role === "company"
        ? "Empresa"
        : "Usuario";

  const userBox = document.getElementById("user-box");
  if (userBox) {
    userBox.innerHTML = `
            <div class="avatar">${userInitial}</div>
            <div class="user-details">
                <strong>${userName}</strong>
                <small>${roleLabel}</small>
            </div>
        `;
  }

  const headerAvatar = document.getElementById("headerAvatar");
  if (headerAvatar) {
    headerAvatar.innerHTML = userInitial;
  }
}

// Llenar user-box del sidebar al cargar
actualizarSidebarYHeader();

// Botón de logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearSession();
    location.href = "./index.html";
  });
}

// Función global de logout para el dropdown
window.logout = function () {
  clearSession();
  location.href = "./index.html";
};

// CARGA INICIAL
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();

  document.getElementById("editProfileBtn").onclick = toggleEditMode;
  document.getElementById("cancelBtn").onclick = cancelEdit;
  document.getElementById("profileForm").onsubmit = guardarPerfil;
  document.getElementById("changeAvatarBtn").onclick = () =>
    document.getElementById("avatarInput").click();
  document.getElementById("avatarInput").onchange = cambiarAvatar;

  // Event listener para el toggle de openToWork
  const openToWorkToggle = document.getElementById("openToWorkToggle");
  if (openToWorkToggle) {
    openToWorkToggle.addEventListener("change", async (e) => {
      const nuevoEstado = e.target.checked;

      // Actualizar en la base de datos usando PATCH (actualización parcial)
      const resultado = await patchData(`/users/${currentUser.id}`, {
        openToWork: nuevoEstado,
        disponibilidad: nuevoEstado ? "DISPONIBLE" : "NO_DISPONIBLE",
      });

      if (resultado) {
        const mensaje = nuevoEstado
          ? "Ahora eres visible para las empresas"
          : "Ya no eres visible para las empresas";
        alert(mensaje);
        loadUserProfile();
      } else {
        alert("Error al actualizar estado");
        e.target.checked = !nuevoEstado;
      }
    });
  }
});

// CARGAR PERFIL
async function loadUserProfile() {
  const users = await getData(`/users?id=${currentUser.id}`);
  if (!users?.[0]) return;

  const u = users[0];
  const disp = u.disponibilidad || "DISPONIBLE";

  // Mostrar toggle openToWork solo para candidatos
  if (u.role === "candidate") {
    const container = document.getElementById("openToWorkContainer");
    if (container) {
      container.style.display = "block";
      const toggle = document.getElementById("openToWorkToggle");
      if (toggle) {
        toggle.checked = u.openToWork === true;
      }
    }
  }

  // Avatar
  if (u.avatar) {
    document.getElementById("profileAvatar").innerHTML =
      `<img src="${u.avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover">`;
  }

  // Actualizar UI
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === "INPUT" || el.tagName === "SELECT") el.value = val;
    else el.textContent = val;
  };

  set("headerUserName", u.nombre || u.name || "Usuario");
  set("headerUserRole", u.profesion || "Sin profesión");
  set("profileName", u.nombre || u.name || "Usuario");
  set("profileUsername", `@${u.username || "usuario"}`);
  set("profileEmail", u.correo || u.email || "");
  set("profileProfesion", u.profesion || "Sin profesión");
  set("infoNombre", u.nombre || u.name || "");
  set("infoUsername", u.username || "");
  set("infoCorreo", u.correo || u.email || "");
  set("infoEdad", u.edad || "");
  set("infoExperiencia", u.experiencia || "");
  set("infoProfesion", u.profesion || "");
  set("infoDisponibilidad", disp);
  set("infoProceso", u.proceso || "SIN_ASIGNAR");

  // Badge - actualizar según openToWork
  const badge = document.getElementById("profileDisponibilidad");
  if (u.role === "candidate") {
    const badgeText = u.openToWork ? "ABIERTO A TRABAJAR" : "NO DISPONIBLE";
    const badgeClass = u.openToWork ? "bg-success" : "bg-secondary";
    badge.textContent = badgeText;
    badge.className = `badge mb-3 ${badgeClass}`;
  } else {
    badge.textContent = disp;
    badge.className = `badge mb-3 ${disp === "DISPONIBLE" ? "bg-success" : disp === "RESERVADO" ? "bg-warning text-dark" : "bg-secondary"}`;
  }

  originalData = {
    nombre: u.nombre || u.name || "",
    username: u.username || "",
    correo: u.correo || u.email || "",
    edad: u.edad || "",
    experiencia: u.experiencia || "",
    profesion: u.profesion || "",
    disponibilidad: disp,
  };
}

// TOGGLE EDICIÓN
function toggleEditMode(e) {
  e?.preventDefault();
  isEditMode = !isEditMode;

  const campos = [
    "infoNombre",
    "infoUsername",
    "infoCorreo",
    "infoEdad",
    "infoExperiencia",
    "infoProfesion",
    "infoDisponibilidad",
  ];

  document.getElementById("editProfileBtn").disabled = isEditMode;
  document
    .getElementById("saveButtonContainer")
    .classList.toggle("d-none", !isEditMode);

  campos.forEach((id) => {
    const campo = document.getElementById(id);
    campo.disabled =
      !isEditMode ||
      (id === "infoDisponibilidad" &&
        originalData.disponibilidad === "RESERVADO");
  });
}

// CANCELAR
function cancelEdit() {
  Object.keys(originalData).forEach((key) => {
    const campo = document.getElementById(
      `info${key.charAt(0).toUpperCase() + key.slice(1)}`,
    );
    if (campo) campo.value = originalData[key];
  });
  isEditMode = false;
  toggleEditMode();
}

// GUARDAR
async function guardarPerfil(e) {
  e.preventDefault();

  const get = (id) => document.getElementById(id).value.trim();

  const nombre = get("infoNombre");
  const username = get("infoUsername");
  const correo = get("infoCorreo");
  const edad = get("infoEdad");
  const experiencia = get("infoExperiencia");
  const profesion = get("infoProfesion");
  const disponibilidad = get("infoDisponibilidad");

  if (!nombre || !username || !correo || !profesion)
    return alert("Completa los campos obligatorios");
  if (!correo.includes("@")) return alert("Correo no válido");
  if (edad && (isNaN(edad) || +edad < 0)) return alert("Edad no válida");

  const payload = {
    nombre,
    username,
    correo,
    profesion,
    password: originalData.password,
    role: originalData.role,
  };
  if (edad) payload.edad = +edad;
  if (experiencia) payload.experiencia = experiencia;
  if (originalData.disponibilidad !== "RESERVADO")
    payload.disponibilidad = disponibilidad;

  // Usar PATCH para actualizar solo los campos modificados
  const resultado = await patchData(`/users/${currentUser.id}`, payload);

  if (resultado) {
    alert("Perfil actualizado");
    Object.assign(originalData, payload);

    // Actualizar también la sesión con los nuevos datos
    const session = getSession();
    if (session) {
      Object.assign(session, payload);
      localStorage.setItem("auth_user", JSON.stringify(session));
    }

    // Actualizar el sidebar y header con el nuevo nombre
    actualizarSidebarYHeader();

    // Recargar el perfil para mostrar los cambios en la UI
    await loadUserProfile();
    isEditMode = false;
    toggleEditMode();
  } else {
    alert("Error al actualizar perfil");
  }
}

// AVATAR
async function cambiarAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/"))
    return alert("Selecciona una imagen válida");
  if (file.size > 5 * 1024 * 1024) return alert("La imagen es muy grande");

  try {
    // Crear elemento de imagen para redimensionar
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Cargar la imagen
    const imageLoadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Error al cargar imagen"));
      img.src = URL.createObjectURL(file);
    });

    await imageLoadPromise;

    // Redimensionar a máximo 400x400 manteniendo aspecto
    const MAX_SIZE = 400;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > MAX_SIZE) {
        height = height * (MAX_SIZE / width);
        width = MAX_SIZE;
      }
    } else {
      if (height > MAX_SIZE) {
        width = width * (MAX_SIZE / height);
        height = MAX_SIZE;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // Convertir a base64 con calidad 0.8 (comprimir)
    let avatar = canvas.toDataURL("image/jpeg", 0.8);

    // Verificar que el tamaño sea menor a 90KB (para dejar margen)
    if (avatar.length > 90000) {
      // Si aún es muy grande, reducir más la calidad
      avatar = canvas.toDataURL("image/jpeg", 0.6);
      if (avatar.length > 90000) {
        alert("La imagen es demasiado grande");
        return;
      }
    }

    // Limpiar objeto URL
    URL.revokeObjectURL(img.src);

    // Actualizar en el servidor usando PATCH
    const resultado = await patchData(`/users/${currentUser.id}`, { avatar });

    if (resultado) {
      // Actualizar el avatar en la interfaz
      document.getElementById("profileAvatar").innerHTML =
        `<img src="${avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover">`;

      // Actualizar también el avatar en la sesión
      const session = getSession();
      if (session) {
        session.avatar = avatar;
        localStorage.setItem("auth_user", JSON.stringify(session));
      }

      alert("Foto actualizada");
    } else {
      alert("Error al actualizar foto");
    }
  } catch (error) {
    console.error("Error al cambiar avatar:", error);
    alert("Error al procesar la imagen");
  }
}

// LOGOUT
window.logout = () => {
  if (confirm("¿Cerrar sesión?")) {
    clearSession();
    location.href = "index.html";
  }
};
