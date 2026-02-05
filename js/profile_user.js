import { getData, putData, getSession, clearSession } from "./api.js";

let isEditMode = false;
let originalData = {};
let currentUser = getSession();

if (!currentUser) location.href = 'index.html';

// CARGA INICIAL
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    
    document.getElementById('editProfileBtn').onclick = toggleEditMode;
    document.getElementById('cancelBtn').onclick = cancelEdit;
    document.getElementById('profileForm').onsubmit = guardarPerfil;
    document.getElementById('changeAvatarBtn').onclick = () => document.getElementById('avatarInput').click();
    document.getElementById('avatarInput').onchange = cambiarAvatar;
});

// CARGAR PERFIL
async function loadUserProfile() {
    const users = await getData(`/users?id=${currentUser.id}`);
    if (!users?.[0]) return;

    const u = users[0];
    const disp = u.disponibilidad || 'DISPONIBLE';
    
    // Avatar
    if (u.avatar) {
        document.getElementById('profileAvatar').innerHTML = 
            `<img src="${u.avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover">`;
    }
    
    // Actualizar UI
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT') el.value = val;
        else el.textContent = val;
    };
    
    set('headerUserName', u.nombre || u.name || 'Usuario');
    set('headerUserRole', u.profesion || 'Sin profesión');
    set('profileName', u.nombre || u.name || 'Usuario');
    set('profileUsername', `@${u.username || 'usuario'}`);
    set('profileEmail', u.correo || u.email || '');
    set('profileProfesion', u.profesion || 'Sin profesión');
    set('infoNombre', u.nombre || u.name || '');
    set('infoUsername', u.username || '');
    set('infoCorreo', u.correo || u.email || '');
    set('infoEdad', u.edad || '');
    set('infoExperiencia', u.experiencia || '');
    set('infoProfesion', u.profesion || '');
    set('infoDisponibilidad', disp);
    set('infoProceso', u.proceso || 'SIN_ASIGNAR');
    
    // Badge
    const badge = document.getElementById('profileDisponibilidad');
    badge.textContent = disp;
    badge.className = `badge mb-3 ${disp === 'DISPONIBLE' ? 'bg-success' : disp === 'RESERVADO' ? 'bg-warning text-dark' : 'bg-secondary'}`;

    originalData = {
        nombre: u.nombre || u.name || '',
        username: u.username || '',
        correo: u.correo || u.email || '',
        edad: u.edad || '',
        experiencia: u.experiencia || '',
        profesion: u.profesion || '',
        disponibilidad: disp
    };
}

// TOGGLE EDICIÓN
function toggleEditMode(e) {
    e?.preventDefault();
    isEditMode = !isEditMode;
    
    const campos = ['infoNombre', 'infoUsername', 'infoCorreo', 'infoEdad', 'infoExperiencia', 'infoProfesion', 'infoDisponibilidad'];
    
    document.getElementById('editProfileBtn').disabled = isEditMode;
    document.getElementById('saveButtonContainer').classList.toggle('d-none', !isEditMode);
    
    campos.forEach(id => {
        const campo = document.getElementById(id);
        campo.disabled = !isEditMode || (id === 'infoDisponibilidad' && originalData.disponibilidad === 'RESERVADO');
    });
}

// CANCELAR
function cancelEdit() {
    Object.keys(originalData).forEach(key => {
        const campo = document.getElementById(`info${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (campo) campo.value = originalData[key];
    });
    isEditMode = false;
    toggleEditMode();
}

// GUARDAR
async function guardarPerfil(e) {
    e.preventDefault();
    
    const get = (id) => document.getElementById(id).value.trim();
    
    const nombre = get('infoNombre');
    const username = get('infoUsername');
    const correo = get('infoCorreo');
    const edad = get('infoEdad');
    const experiencia = get('infoExperiencia');
    const profesion = get('infoProfesion');
    const disponibilidad = get('infoDisponibilidad');
    
    if (!nombre || !username || !correo || !profesion) return alert('Completa los campos obligatorios');
    if (!correo.includes('@')) return alert('Correo no válido');
    if (edad && (isNaN(edad) || +edad < 0)) return alert('Edad no válida');
    
    const payload = { nombre, username, correo, profesion };
    if (edad) payload.edad = +edad;
    if (experiencia) payload.experiencia = experiencia;
    if (originalData.disponibilidad !== 'RESERVADO') payload.disponibilidad = disponibilidad;
    
    const resultado = await putData(`/users/${currentUser.id}`, payload);
    
    if (resultado) {
        alert('Perfil actualizado');
        Object.assign(originalData, payload);
        await loadUserProfile();
        isEditMode = false;
        toggleEditMode();
    } else {
        alert('Error al actualizar');
    }
}

// AVATAR
async function cambiarAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Selecciona una imagen válida');
    if (file.size > 2 * 1024 * 1024) return alert('Máximo 2MB');
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
        const avatar = ev.target.result;
        const resultado = await putData(`/users/${currentUser.id}`, { avatar });
        
        if (resultado) {
            document.getElementById('profileAvatar').innerHTML = 
                `<img src="${avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover">`;
            alert('Foto actualizada');
        } else {
            alert('Error al actualizar foto');
        }
    };
    reader.readAsDataURL(file);
}

// LOGOUT
window.logout = () => {
    if (confirm('¿Cerrar sesión?')) {
        clearSession();
        location.href = 'index.html';
    }
};