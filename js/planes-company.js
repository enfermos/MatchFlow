import { getData, patchData, getSession } from './api.js';

let currentUser = null;

// Configuración de planes para empresas
const PLANES = {
    free: {
        nombre: 'Free',
        precio: 0,
        limiteContactos: 5,
        prioridad: 0,
        badge: 'FREE',
        caracteristicas: [
            { texto: '5 Contactos mensuales', activo: true },
            { texto: 'Filtros básicos', activo: true },
            { texto: 'Visibilidad de candidatos reservados', activo: false }
        ]
    },
    comercial: {
        nombre: 'Comercial',
        precio: 49,
        limiteContactos: 50,
        prioridad: 1,
        badge: 'COMERCIAL',
        caracteristicas: [
            { texto: '50 Contactos mensuales', activo: true },
            { texto: 'Filtros avanzados', activo: true },
            { texto: 'Ver estados de reserva', activo: true },
            { texto: 'Soporte Prioritario', activo: false }
        ]
    },
    empresa: {
        nombre: 'Empresa',
        precio: 149,
        limiteContactos: -1, // ilimitado
        prioridad: 2,
        badge: 'EMPRESA',
        caracteristicas: [
            { texto: 'Contactos ilimitados', activo: true },
            { texto: 'Soporte Prioritario 24/7', activo: true },
            { texto: 'Mensajería Directa', activo: true },
            { texto: 'Acceso a red exclusiva', activo: true }
        ]
    }
};

// Inicializar página
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = getSession();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Solo empresas pueden ver planes
    if (currentUser.role !== 'company') {
        alert('Esta sección es solo para empresas');
        window.location.href = 'dashboard.html';
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
            currentUser.contactosUsados = 0;
            await patchData(`/users/${currentUser.id}`, { 
                plan: 'free', 
                contactosUsados: 0 
            });
        }
    }
}

// Renderizar sidebar
function renderizarSidebar() {
    // Avatar
    const avatarElement = document.getElementById('sidebarAvatar');
    const initialElement = document.getElementById('sidebarInitial');
    
    const inicial = (currentUser.name || currentUser.nombre || 'E').charAt(0).toUpperCase();
    initialElement.textContent = inicial;

    // Nombre y email
    document.getElementById('sidebarName').textContent = currentUser.name || currentUser.nombre || 'Empresa';
    document.getElementById('sidebarEmail').textContent = currentUser.email || currentUser.correo || '';

    // Badge del plan
    const planActual = PLANES[currentUser.plan] || PLANES.free;
    document.getElementById('topBadge').textContent = planActual.badge;

    // Links de navegación
    const nav = document.getElementById('sidebarNav');
    nav.innerHTML = `
        <a href="dashboard-company.html" class="nav-link">
            <i class="bi bi-house-door"></i>
            <span>Panel Principal</span>
        </a>
        <a href="planes-company.html" class="nav-link active">
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
    const contactosUsados = currentUser.contactosUsados || 0;
    const limitePlan = planActual.limiteContactos;

    // Obtener matches creados por la empresa
    const matches = await getData('/matches');
    const misMatches = matches?.filter(m => m.companyId === currentUser.id) || [];

    // Renderizar estadísticas
    const statsCards = document.getElementById('statsCards');
    statsCards.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon stat-primary">
                <i class="bi bi-people"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">CANDIDATOS CONTACTADOS</span>
                <strong class="stat-value">${misMatches.length}</strong>
            </div>
        </div>
    `;

    // Mostrar alerta si alcanzó el límite
    const limitAlert = document.getElementById('limitAlert');
    const limitMessage = document.getElementById('limitMessage');
    if (limitePlan !== -1 && contactosUsados >= limitePlan) {
        limitAlert.classList.remove('hidden');
        limitMessage.textContent = `Has utilizado ${contactosUsados} de tus ${limitePlan} contactos mensuales permitidos en el plan ${planActual.nombre}. ${planActual.prioridad < 2 ? 'Actualiza a plan Empresa para contactos ilimitados.' : ''}`;
    } else {
        limitAlert.classList.add('hidden');
    }

    // Actualizar barra de progreso de uso
    const usageProgress = document.getElementById('usageProgress');
    const usageText = document.getElementById('usageText');
    const usageDescription = document.getElementById('usageDescription');
    
    if (limitePlan === -1) {
        usageProgress.style.width = '0%';
        usageText.textContent = `${contactosUsados} / Ilimitado`;
        usageDescription.textContent = '¡Tienes contactos ilimitados con tu plan actual!';
    } else {
        const porcentaje = (contactosUsados / limitePlan) * 100;
        usageProgress.style.width = `${Math.min(porcentaje, 100)}%`;
        usageText.textContent = `${contactosUsados} / ${limitePlan}`;
        usageDescription.textContent = porcentaje >= 100 
            ? 'Has alcanzado tu límite mensual. Mejora tu plan para más contactos.'
            : `Te quedan ${limitePlan - contactosUsados} contactos este mes.`;
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

// Renderizar planes
function renderizarPlanes() {
    const planActual = currentUser.plan || 'free';
    const plansGrid = document.querySelector('.plans-grid');
    
    plansGrid.innerHTML = `
        ${renderPlanCard('free', planActual)}
        ${renderPlanCard('comercial', planActual)}
        ${renderPlanCard('empresa', planActual)}
    `;
}

function renderPlanCard(planKey, planActual) {
    const plan = PLANES[planKey];
    const isActive = planKey === planActual;
    const isFeatured = planKey === 'empresa';
    
    const featuresList = plan.caracteristicas.map(f => `
        <li class="feature-${f.activo ? 'active' : 'inactive'}">
            <i class="bi bi-${f.activo ? 'check-circle-fill' : 'x-circle'}"></i>
            <span>${f.texto}</span>
        </li>
    `).join('');

    let buttonHTML = '';
    if (isActive) {
        buttonHTML = '<button class="plan-btn plan-btn-active" disabled>Plan Activo</button>';
    } else if (planKey === 'free') {
        buttonHTML = '<button class="plan-btn plan-btn-outline" onclick="cambiarPlan(\'free\')">Cambiar a Free</button>';
    } else {
        buttonHTML = `<button class="plan-btn plan-btn-primary" onclick="cambiarPlan('${planKey}')">Subir de nivel</button>`;
    }

    return `
        <div class="plan-card ${isActive ? 'plan-active' : ''} ${isFeatured ? 'plan-featured' : ''}">
            ${isActive ? '<div class="plan-badge">PLAN ACTUAL</div>' : ''}
            ${isFeatured && !isActive ? '<div class="plan-badge" style="background: #10b981;">RECOMENDADO</div>' : ''}
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
        contactosUsados: 0 // Resetear contador al cambiar de plan
    });

    if (resultado) {
        alert(`✅ Plan actualizado exitosamente a ${planNuevo.nombre}`);
        currentUser.plan = nuevoPlan;
        currentUser.contactosUsados = 0;
        
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
