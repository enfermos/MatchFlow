import { getData, patchData, getSession } from './api.js';

let currentUser = null;

// Configuración de planes
const PLANES = {
    free: {
        nombre: 'Gratuito',
        precio: 0,
        limiteMatches: 3,
        prioridad: 0,
        badge: 'FREE'
    },
    pro1: {
        nombre: 'Pro Nivel 1',
        precio: 19,
        limiteMatches: 10,
        prioridad: 1,
        badge: 'PRO LEVEL 1'
    },
    pro2: {
        nombre: 'Pro Nivel 2',
        precio: 49,
        limiteMatches: -1, // ilimitado
        prioridad: 2,
        badge: 'PRO LEVEL 2'
    }
};

// Inicializar página
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = getSession();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Solo candidatos pueden ver planes
    if (currentUser.role !== 'candidate') {
        alert('Esta sección es solo para candidatos');
        window.location.href = currentUser.role === 'company' ? 'dashboard-company.html' : 'dashboard.html';
        return;
    }

    await cargarDatosUsuario();
    renderizarSidebar();
    await actualizarEstadisticas();
    renderizarPlanes();
});

// Cargar datos del usuario desde el servidor
async function cargarDatosUsuario() {
    const userData = await getData(`/users/${currentUser.id}`);
    if (userData) {
        currentUser = { ...currentUser, ...userData };
        
        // Asegurar que tiene un plan (por defecto free)
        if (!currentUser.plan) {
            currentUser.plan = 'free';
            currentUser.matchesUsados = 0;
            await patchData(`/users/${currentUser.id}`, { 
                plan: 'free', 
                matchesUsados: 0 
            });
        }
    }
}

// Renderizar sidebar
function renderizarSidebar() {
    // Avatar
    const avatarElement = document.getElementById('sidebarAvatar');
    const initialElement = document.getElementById('sidebarInitial');
    
    if (currentUser.avatar) {
        avatarElement.style.backgroundImage = `url(${currentUser.avatar})`;
        avatarElement.style.backgroundSize = 'cover';
        initialElement.style.display = 'none';
    } else {
        const inicial = (currentUser.nombre || currentUser.name || 'U').charAt(0).toUpperCase();
        initialElement.textContent = inicial;
    }

    // Nombre y email
    document.getElementById('sidebarName').textContent = currentUser.nombre || currentUser.name || 'Usuario';
    document.getElementById('sidebarEmail').textContent = currentUser.correo || currentUser.email || '';

    // Badge del plan
    const planActual = PLANES[currentUser.plan] || PLANES.free;
    document.getElementById('topBadge').textContent = planActual.badge;

    // Links de navegación
    const nav = document.getElementById('sidebarNav');
    nav.innerHTML = `
        <a href="dashboard.html" class="nav-link">
            <i class="bi bi-house-door"></i>
            <span>Panel Principal</span>
        </a>
        <a href="planes.html" class="nav-link active">
            <i class="bi bi-award"></i>
            <span>Gestión de Planes</span>
        </a>
        <a href="profile_user.html" class="nav-link">
            <i class="bi bi-person"></i>
            <span>Configuración</span>
        </a>
    `;
}

// Actualizar estadísticas
async function actualizarEstadisticas() {
    const planActual = PLANES[currentUser.plan] || PLANES.free;
    const matchesUsados = currentUser.matchesUsados || 0;
    const limitePlan = planActual.limiteMatches;

    // Obtener reservas del candidato
    const reservations = await getData('/reservations');
    const misReservas = reservations?.filter(r => r.candidateId === currentUser.id) || [];

    // Renderizar estadísticas
    const statsCards = document.getElementById('statsCards');
    statsCards.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon stat-primary">
                <i class="bi bi-briefcase"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">EMPRESAS QUE TE RESERVARON</span>
                <strong class="stat-value">${misReservas.length}</strong>
            </div>
        </div>
    `;

    // Mostrar alerta si alcanzó el límite
    const limitAlert = document.getElementById('limitAlert');
    const limitMessage = document.getElementById('limitMessage');
    if (limitePlan !== -1 && matchesUsados >= limitePlan) {
        limitAlert.classList.remove('hidden');
        limitMessage.textContent = `Has utilizado ${matchesUsados} de tus ${limitePlan} aplicaciones mensuales permitidas en el ${planActual.nombre}. ${planActual.prioridad < 2 ? 'Actualiza a Nivel 2 para aplicaciones ilimitadas.' : ''}`;
    } else {
        limitAlert.classList.add('hidden');
    }

    // Actualizar barra de progreso de uso
    const usageProgress = document.getElementById('usageProgress');
    const usageText = document.getElementById('usageText');
    const usageDescription = document.getElementById('usageDescription');
    
    if (limitePlan === -1) {
        usageProgress.style.width = '0%';
        usageText.textContent = `${matchesUsados} / Ilimitado`;
        usageDescription.textContent = '¡Tienes aplicaciones ilimitadas con tu plan actual!';
    } else {
        const porcentaje = (matchesUsados / limitePlan) * 100;
        usageProgress.style.width = `${Math.min(porcentaje, 100)}%`;
        usageText.textContent = `${matchesUsados} / ${limitePlan}`;
        usageDescription.textContent = porcentaje >= 100 
            ? 'Has alcanzado tu límite mensual. Mejora tu plan para más aplicaciones.'
            : `Te quedan ${limitePlan - matchesUsados} aplicaciones este mes.`;
    }

    // Actualizar visibilidad (ejemplo fijo por ahora)
    const visibilityProgress = document.getElementById('visibilityProgress');
    const visibilityText = document.getElementById('visibilityText');
    const visibilidad = planActual.prioridad === 2 ? 95 : planActual.prioridad === 1 ? 75 : 50;
    visibilityProgress.style.width = `${visibilidad}%`;
    visibilityText.textContent = `${visibilidad}%`;

    // Actualizar facturación
    const billingDate = document.getElementById('billingDate');
    const billingAmount = document.getElementById('billingAmount');
    
    if (planActual.precio === 0) {
        billingDate.textContent = 'Sin próximos cargos';
        billingAmount.textContent = 'Plan gratuito - Sin método de pago registrado';
    } else {
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);
        billingDate.textContent = nextDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        billingAmount.textContent = `Monto: $${planActual.precio}.00 USD cargado a Visa •••• 4242`;
    }
}

// Renderizar tarjetas de planes
function renderizarPlanes() {
    const planActual = currentUser.plan || 'free';
    const plansGrid = document.querySelector('.plans-grid');
    
    plansGrid.innerHTML = `
        ${renderPlanCard('free', planActual)}
        ${renderPlanCard('pro1', planActual)}
        ${renderPlanCard('pro2', planActual)}
    `;
}

function renderPlanCard(planKey, planActual) {
    const plan = PLANES[planKey];
    const isActive = planKey === planActual;
    const isFeatured = planKey === 'pro2';
    
    const features = {
        free: [
            { text: '3 Aplicaciones mensuales', active: true },
            { text: 'Perfil público básico', active: true },
            { text: 'Prioridad en búsquedas', active: false }
        ],
        pro1: [
            { text: '10 Aplicaciones mensuales', active: true },
            { text: 'Perfil destacado', active: true },
            { text: 'Estadísticas de visibilidad', active: true },
            { text: 'Soporte prioritario', active: false }
        ],
        pro2: [
            { text: 'Aplicaciones ilimitadas', active: true },
            { text: 'Posicionamiento TOP 3', active: true },
            { text: 'Soporte por expertos 24/7', active: true },
            { text: 'Acceso a red exclusiva', active: true }
        ]
    };

    const featuresList = features[planKey].map(f => `
        <li class="feature-${f.active ? 'active' : 'inactive'}">
            <i class="bi bi-${f.active ? 'check-circle-fill' : 'x-circle'}"></i>
            <span>${f.text}</span>
        </li>
    `).join('');

    let buttonHTML = '';
    if (isActive) {
        buttonHTML = '<button class="plan-btn plan-btn-active" disabled>Plan Activo</button>';
    } else if (planKey === 'free') {
        buttonHTML = '<button class="plan-btn plan-btn-outline" onclick="cambiarPlan(\'free\')">Bajar a Gratuito</button>';
    } else {
        buttonHTML = `<button class="plan-btn plan-btn-primary" onclick="cambiarPlan('${planKey}')">Mejorar Plan</button>`;
    }

    return `
        <div class="plan-card ${isActive ? 'plan-active' : ''} ${isFeatured ? 'plan-featured' : ''}">
            ${isActive ? '<div class="plan-badge">PLAN ACTUAL</div>' : ''}
            <div class="plan-header">
                <h3>${plan.nombre}</h3>
                <div class="plan-price">
                    <span class="price-amount">$${plan.precio}</span>
                    <span class="price-period">/mes</span>
                </div>
            </div>
            <ul class="plan-features">
                ${featuresList}
            </ul>
            ${buttonHTML}
        </div>
    `;
}

// Cambiar plan
window.cambiarPlan = async function(nuevoPlan) {
    const planAnterior = PLANES[currentUser.plan];
    const planNuevo = PLANES[nuevoPlan];
    
    let mensaje = '';
    if (nuevoPlan === 'free') {
        mensaje = `¿Estás seguro de que quieres cambiar de ${planAnterior.nombre} a ${planNuevo.nombre}? Perderás acceso a las funcionalidades premium.`;
    } else {
        mensaje = `¿Confirmas el cambio de ${planAnterior.nombre} a ${planNuevo.nombre} por $${planNuevo.precio}/mes?`;
    }
    
    if (!confirm(mensaje)) return;

    // Actualizar plan en el servidor
    const resultado = await patchData(`/users/${currentUser.id}`, { 
        plan: nuevoPlan,
        matchesUsados: 0 // Resetear contador al cambiar de plan
    });

    if (resultado) {
        alert(`✅ Plan actualizado exitosamente a ${planNuevo.nombre}`);
        currentUser.plan = nuevoPlan;
        currentUser.matchesUsados = 0;
        
        // Actualizar sesión
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
        
        // Recargar página para reflejar cambios
        location.reload();
    } else {
        alert('❌ Error al actualizar el plan. Intenta nuevamente.');
    }
};

// Ver historial
window.verHistorial = function() {
    alert('Funcionalidad de historial de facturas próximamente...');
};

// Logout
window.logout = function() {
    localStorage.removeItem('auth_user');
    window.location.href = 'index.html';
};
