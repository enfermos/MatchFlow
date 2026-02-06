import {
  getData,
  postData,
  putData,
  deleteData,
  getSession,
  clearSession,
} from "./api.js";
import { protect, protectElements, hasRole } from "./routeProtection.js";

protect("DASHBOARD");

// Variables globales
let session;
let userBox, navLinks, logoutBtn;
let offersGrid, appliedGrid, adminOffersGrid;
let offerForm, offerFormTitle, cancelEditBtn;
let searchInput, categoryFilter, typeFilter, clearFilters;

let offers = [];
let applications = [];
let editingId = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
  initializeDashboard();
});

function initializeDashboard() {
  console.log('initializeDashboard called');
  
  // Obtener sesión
  session = getSession();
  console.log('Session:', session);
  
  if (!session) {
    console.error('No session found');
    return;
  }
  
<<<<<<< HEAD
=======
  // Redirigir empresas a su dashboard específico
  if (session.role === 'company') {
    console.log('Company detected, redirecting to dashboard-company.html');
    window.location.href = './dashboard-company.html';
    return;
  }
  
>>>>>>> c7ac823 (feat: Implement user subscription plans management for candidates and companies)
  // Obtener elementos del DOM
  userBox = document.querySelector("#user-box");
  navLinks = document.querySelector("#nav-links");
  logoutBtn = document.querySelector("#logout-btn");
  
  console.log('Elements found:', { userBox, navLinks, logoutBtn });

  offersGrid = document.querySelector("#offers-grid");
  appliedGrid = document.querySelector("#applied-grid");
  adminOffersGrid = document.querySelector("#admin-offers-grid");

  offerForm = document.querySelector("#offer-form");
  offerFormTitle = document.querySelector("#offer-form-title");
  cancelEditBtn = document.querySelector("#cancel-edit-btn");

  searchInput = document.querySelector("#search-input");
  categoryFilter = document.querySelector("#category-filter");
  typeFilter = document.querySelector("#type-filter");
  clearFilters = document.querySelector("#clear-filters");

  // Inicializar sidebar
  initSidebar();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Proteger elementos por rol
  protectByRole();
  
  // Mostrar sección inicial
  showInitialSection();
  
  // Cargar datos
  loadData();
}

// Función para inicializar el sidebar
function initSidebar() {
  console.log('initSidebar called');
  console.log('Session role:', session?.role);
  console.log('navLinks element:', navLinks);
  
  // Generar avatar con iniciales
  const userName = session.name || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();
  const roleLabel = session.role === "admin" ? "Administrador" : session.role === "candidate" ? "Candidato" : "Empresa";

  if (userBox) {
    userBox.innerHTML = `
<<<<<<< HEAD
      <div class="user-avatar">${userInitial}</div>
      <div class="user-info">
        <p class="user-name">${userName}</p>
        <p class="user-role">${roleLabel}</p>
=======
      <div class="avatar">${userInitial}</div>
      <div class="user-details">
        <strong>${userName}</strong>
        <small>${roleLabel}</small>
>>>>>>> c7ac823 (feat: Implement user subscription plans management for candidates and companies)
      </div>
    `;
    console.log('userBox populated');
  } else {
    console.error('userBox element not found');
  }

  if (navLinks) {
    console.log('Populating navLinks for role:', session.role);
    
    if (session.role === "admin") {
      navLinks.innerHTML = `
        <a href="#" data-section="section-admin-offers" class="active"><i class="bi bi-briefcase-fill"></i> Ofertas</a>
        <a href="#" data-section="section-admin-form"><i class="bi bi-plus-circle-fill"></i> Crear oferta</a>
        <a href="#" data-section="section-admin-applications"><i class="bi bi-file-text-fill"></i> Postulaciones</a>
        <a href="profile_user.html"><i class="bi bi-person-circle"></i> Mi Perfil</a>
      `;
    } else if (session.role === "candidate") {
      navLinks.innerHTML = `
        <a href="#" data-section="section-all-offers" class="active"><i class="bi bi-search"></i> Ver Ofertas</a>
        <a href="#" data-section="section-applied"><i class="bi bi-lightning-fill"></i> Mis Matches</a>
<<<<<<< HEAD
=======
        <a href="planes.html"><i class="bi bi-award"></i> Gestión de Planes</a>
>>>>>>> c7ac823 (feat: Implement user subscription plans management for candidates and companies)
        <a href="profile_user.html"><i class="bi bi-person-circle"></i> Mi Perfil</a>
      `;
    } else if (session.role === "company") {
      navLinks.innerHTML = `  
        <a href="#" data-section="section-company-dashboard" class="active"><i class="bi bi-speedometer2"></i> Dashboard</a>
        <a href="#" data-section="section-company-offers"><i class="bi bi-briefcase-fill"></i> Mis ofertas</a>
        <a href="#" data-section="section-company-form"><i class="bi bi-plus-circle-fill"></i> Crear oferta</a>
      `;
    } else {
      // Rol desconocido o inválido
      console.error('Rol no válido:', session.role);
      navLinks.innerHTML = `
        <div style="padding: 1rem; color: #ef4444; text-align: center;">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <p style="margin-top: 0.5rem; font-size: 0.875rem;">Rol no válido: "${session.role}"</p>
          <p style="font-size: 0.75rem; opacity: 0.8;">Por favor, cierra sesión y vuelve a iniciar sesión</p>
        </div>
      `;
    }
    
    console.log('navLinks populated. HTML:', navLinks.innerHTML);
    console.log('Sidebar inicializado correctamente');
  } else {
    console.error('navLinks element not found');
  }
}

const showSection = (id) => {
  document.querySelectorAll(".section").forEach((s) => {
    s.style.display = s.id === id ? "block" : "none";
  });
  
  // Actualizar clase active en los links del nav
  document.querySelectorAll("#nav-links a[data-section]").forEach(link => {
    if (link.dataset.section === id) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};

function setupEventListeners() {
  if (navLinks) {
    navLinks.addEventListener("click", (e) => {
      const link = e.target.closest("[data-section]");
      if (!link) return;
      e.preventDefault();
      showSection(link.dataset.section);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      location.href = "./index.html";
    });
  }

  if (searchInput && categoryFilter && typeFilter) {
    [searchInput, categoryFilter, typeFilter].forEach((el) =>
      el?.addEventListener("input", renderOffers),
    );
  }

  if (clearFilters) {
    clearFilters.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (categoryFilter) categoryFilter.value = "";
      if (typeFilter) typeFilter.value = "";
      renderOffers();
    });
  }

  // Formulario de admin/empresa (offer-form)
  if (offerForm) {
    offerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        title: document.querySelector("#title").value,
        company: document.querySelector("#company").value,
        location: document.querySelector("#location").value,
        category: document.querySelector("#category").value,
        type: document.querySelector("#type").value,
        salary: document.querySelector("#salary").value,
        description: document.querySelector("#description").value,
      };

      if (session.role === "admin" || session.role === "company") {
        data.companyId = session.id;
      }

      if (editingId) {
        await putData(`/offers/${editingId}`, data);
        editingId = null;
      } else {
        await postData("/offers", data);
      }

      offerForm.reset();
      loadData();
    });
  }

  // Formulario de empresa (company-offer-form) - nuevo diseño
  const companyOfferForm = document.querySelector("#company-offer-form");
  if (companyOfferForm) {
    companyOfferForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        title: document.querySelector("#company-offer-title").value.trim(),
        company: document.querySelector("#company-offer-company").value.trim(),
        location: document.querySelector("#company-offer-location").value.trim(),
        category: document.querySelector("#company-offer-category").value,
        type: document.querySelector("#company-offer-type").value,
        salary: document.querySelector("#company-offer-salary").value.trim(),
        description: document.querySelector("#company-offer-description").value.trim(),
        companyId: session.id
      };

      try {
        await postData("/offers", data);
        
        // Mostrar mensaje de éxito
        const alertDiv = document.querySelector("#company-offer-form-alert");
        if (alertDiv) {
          alertDiv.innerHTML = `
            <div style="padding: 1rem; background: #dcfce7; border: 2px solid #86efac; border-radius: 12px; color: #166534; margin-top: 1rem;">
              <i class="bi bi-check-circle-fill"></i> ¡Oferta creada exitosamente!
            </div>
          `;
          setTimeout(() => {
            alertDiv.innerHTML = "";
          }, 3000);
        }
        
        companyOfferForm.reset();
        loadData();
        
        // Cambiar a la sección de ofertas después de crear
        setTimeout(() => {
          showSection("section-company-offers");
        }, 1500);
      } catch (error) {
        const alertDiv = document.querySelector("#company-offer-form-alert");
        if (alertDiv) {
          alertDiv.innerHTML = `
            <div style="padding: 1rem; background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; color: #991b1b; margin-top: 1rem;">
              <i class="bi bi-exclamation-triangle-fill"></i> Error al crear la oferta. Intenta nuevamente.
            </div>
          `;
        }
      }
    });
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      offerForm.reset();
      editingId = null;
      if (offerFormTitle) offerFormTitle.textContent = "Crear oferta";
    });
  }

  if (adminOffersGrid) {
    adminOffersGrid.addEventListener("click", async (e) => {
      const id = e.target.dataset.delete;
      if (id && confirm("¿Eliminar oferta?")) {
        await deleteData(`/offers/${id}`);
        loadData();
      }

      const editId = e.target.dataset.edit;
      if (editId) {
        const offer = offers.find((o) => o.id == editId);
        if (offer) {
          editingId = editId;
          document.querySelector("#title").value = offer.title;
          document.querySelector("#company").value = offer.company;
          document.querySelector("#location").value = offer.location;
          document.querySelector("#category").value = offer.category;
          document.querySelector("#type").value = offer.type;
          document.querySelector("#salary").value = offer.salary;
          document.querySelector("#description").value = offer.description;
          if (offerFormTitle) offerFormTitle.textContent = "Editar oferta";
        }
      }
    });
  }
}

function protectByRole() {
  if (!hasRole("admin")) {
    protectElements('[data-section^="section-admin"]', ["admin"]);
  }

  if (!hasRole("candidate")) {
    protectElements('[data-section^="section-candidate"]', ["candidate"]);
  }

  if (!hasRole("company")) {
    protectElements('[data-section^="section-company"]', ["company"]);
  }
}

function showInitialSection() {
  showSection(
    session.role === "admin" ? "section-admin-offers" : 
    session.role === "candidate" ? "section-all-offers" : 
    "section-company-dashboard",
  );
}

const loadData = async () => {
  offers = (await getData("/offers")) || [];
  applications = (await getData("/applications")) || [];

  renderOffers();
  renderApplied();
  renderAdminOffers();
};

const applyFilters = (list) => {
  const term = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const type = typeFilter.value;

  return list.filter(
    (o) =>
      (!term ||
        o.title.toLowerCase().includes(term) ||
        o.company.toLowerCase().includes(term)) &&
      (!category || o.category === category) &&
      (!type || o.type === type),
  );
};

const renderOffers = () => {
  if (!offersGrid) return;

  const filtered = applyFilters(offers);

  offersGrid.innerHTML = filtered.length
    ? filtered
        .map(
          (o) => `
        <article class="card">
          <h4>${o.title}</h4>
          <p><strong>Empresa:</strong> ${o.company}</p>
          <p><strong>Ubicación:</strong> ${o.location}</p>
          <p><strong>Salario:</strong> ${o.salary}</p>
          <p class="offer-desc">${o.description}</p>
          <small style="color: #888;">Las empresas te contactarán si hay match</small>
        </article>
      `,
        )
        .join("")
    : `<p>No hay ofertas disponibles</p>`;
};

// Los candidatos ya no aplican - las empresas crean los matches

// Ver mis matches (creados por empresas)
const renderApplied = async () => {
  if (!appliedGrid) return;

  // Buscar matches donde yo soy el candidato
  const allMatches = await getData("/matches") || [];
  const mine = allMatches.filter(
    (m) => String(m.candidateId) === String(session.id),
  );

  appliedGrid.innerHTML = mine.length
    ? mine
        .map((m) => {
          const offer = offers.find((o) => String(o.id) === String(m.offerId));
          if (!offer) return "";
          
          // Mostrar estado del match
          const estados = {
            pending: '<i class="bi bi-hourglass-split"></i> Pendiente',
            contacted: '<i class="bi bi-envelope-check-fill"></i> Contactado',
            interview: '<i class="bi bi-chat-left-dots-fill"></i> Entrevista',
            hired: '<i class="bi bi-check-circle-fill"></i> Contratado',
            discarded: '<i class="bi bi-x-circle-fill"></i> Descartado'
          };
          
          return `
          <article class="card">
            <h4>${offer.title}</h4>
            <p><strong>Empresa:</strong> ${offer.company}</p>
            <p><strong>Estado:</strong> ${estados[m.status] || m.status}</p>
            <small>Creado: ${new Date(m.createdAt).toLocaleDateString()}</small>
          </article>
        `;
        })
        .join("")
    : `<p>Aún no tienes matches con empresas</p>`;
};

const renderAdminOffers = () => {
  if (!adminOffersGrid) return;

  adminOffersGrid.innerHTML = offers.length
    ? offers
        .map(
          (o) => `
      <article class="card">
        <h4>${o.title}</h4>
        <p>${o.company}</p>
        <button class="btn btn-ghost" data-edit="${o.id}">Editar</button>
        <button class="btn btn-danger" data-delete="${o.id}">Eliminar</button>
      </article>
    `,
        )
        .join("")
    : `<p>No hay ofertas</p>`;
};
