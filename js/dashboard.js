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

const session = getSession();

const userBox = document.querySelector("#user-box");
const navLinks = document.querySelector("#nav-links");
const logoutBtn = document.querySelector("#logout-btn");

const offersGrid = document.querySelector("#offers-grid");
const appliedGrid = document.querySelector("#applied-grid");
const adminOffersGrid = document.querySelector("#admin-offers-grid");

const offerForm = document.querySelector("#offer-form");
const offerFormTitle = document.querySelector("#offer-form-title");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");

const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const typeFilter = document.querySelector("#type-filter");
const clearFilters = document.querySelector("#clear-filters");

let offers = [];
let applications = [];
let editingId = null;

userBox.innerHTML = `
  <strong>${session.name}</strong>
  <small>${session.role === "admin" ? "Administrador" : session.role === "candidate" ? "Candidato" : "Empresa"}</small>
`;

if (session.role === "admin") {
  navLinks.innerHTML = `
    <a href="#" data-section="section-admin-offers">Ofertas</a>
    <a href="#" data-section="section-admin-form">Crear oferta</a>
    <a href="#" data-section="section-admin-applications">Postulaciones</a>
    <a href="profile_user.html">Mi Perfil</a>
  `;
} else if (session.role === "candidate") {
  navLinks.innerHTML = `
    <a href="#" data-section="section-all-offers">Todas las ofertas</a>
    <a href="#" data-section="section-applied">Mis postulaciones</a>
    <a href="profile_user.html">Mi Perfil</a>
  `;
} else if (session.role === "company") {
  navLinks.innerHTML = `  
    <a href="#" data-section="section-company-dashboard">Dashboard</a>
    <a href="#" data-section="section-company-offers">Mis ofertas</a>
    <a href="#" data-section="section-company-form">Crear oferta</a>
  `;
}

const showSection = (id) => {
  document.querySelectorAll(".section").forEach((s) => {
    s.style.display = s.id === id ? "block" : "none";
  });
};

navLinks.addEventListener("click", (e) => {
  const link = e.target.closest("[data-section]");
  if (!link) return;
  showSection(link.dataset.section);
});

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
          <p>${o.company}</p>
          <p>${o.location}</p>
          <button class="btn btn-accent" data-apply="${o.id}">
            Aplicar
          </button>
        </article>
      `,
        )
        .join("")
    : `<p>No hay ofertas</p>`;
};

offersGrid?.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-apply]");
  if (!btn) return;

  const offerId = btn.dataset.apply;

  const already = applications.some(
    (a) =>
      String(a.userId) === String(session.id) &&
      String(a.offerId) === String(offerId),
  );

  if (already) return;

  await postData("/applications", {
    userId: session.id,
    offerId,
    date: new Date().toLocaleDateString(),
  });

  applications = await getData("/applications");
  renderApplied();
});

const renderApplied = () => {
  if (!appliedGrid) return;

  const mine = applications.filter(
    (a) => String(a.userId) === String(session.id),
  );

  appliedGrid.innerHTML = mine.length
    ? mine
        .map((a) => {
          const offer = offers.find((o) => String(o.id) === String(a.offerId));
          if (!offer) return "";
          return `
          <article class="card">
            <h4>${offer.title}</h4>
            <p>${offer.company}</p>
            <small>Aplicado el ${a.date}</small>
          </article>
        `;
        })
        .join("")
    : `<p>No has aplicado a ninguna oferta</p>`;
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

adminOffersGrid?.addEventListener("click", async (e) => {
  const editBtn = e.target.closest("[data-edit]");
  const deleteBtn = e.target.closest("[data-delete]");

  if (editBtn) {
    if (!hasRole("admin")) {
      alert("No tienes permisos para realizar esta acción");
      return;
    }

    const id = editBtn.dataset.edit;
    const offer = offers.find((o) => String(o.id) === String(id));
    if (!offer) return;

    editingId = id;

    offerForm.querySelector("#title").value = offer.title;
    offerForm.querySelector("#company").value = offer.company;
    offerForm.querySelector("#location").value = offer.location;
    offerForm.querySelector("#category").value = offer.category;
    offerForm.querySelector("#type").value = offer.type;
    offerForm.querySelector("#salary").value = offer.salary;
    offerForm.querySelector("#description").value = offer.description;

    offerFormTitle.textContent = "Editar oferta";
    showSection("section-admin-form");
  }

  if (deleteBtn) {
    if (!hasRole("admin")) {
      alert("No tienes permisos para realizar esta acción");
      return;
    }

    const id = deleteBtn.dataset.delete;
    if (!confirm("¿Eliminar esta oferta?")) return;
    await deleteData(`/offers/${id}`);
    loadData();
  }
});

offerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!hasRole("admin")) {
    alert("No tienes permisos para realizar esta acción");
    return;
  }

  const data = {
    title: offerForm.querySelector("#title").value.trim(),
    company: offerForm.querySelector("#company").value.trim(),
    location: offerForm.querySelector("#location").value.trim(),
    category: offerForm.querySelector("#category").value.trim(),
    type: offerForm.querySelector("#type").value.trim(),
    salary: offerForm.querySelector("#salary").value.trim(),
    description: offerForm.querySelector("#description").value.trim(),
  };

  if (editingId) {
    await putData(`/offers/${editingId}`, { id: editingId, ...data });
  } else {
    await postData("/offers", data);
  }

  editingId = null;
  offerForm.reset();
  offerFormTitle.textContent = "Crear oferta";

  showSection("section-admin-offers");
  loadData();
});

cancelEditBtn?.addEventListener("click", () => {
  editingId = null;
  offerForm.reset();
  offerFormTitle.textContent = "Crear oferta";
  showSection("section-admin-offers");
});

logoutBtn.addEventListener("click", () => {
  clearSession();
  location.href = "./index.html";
});

[searchInput, categoryFilter, typeFilter].forEach((el) =>
  el?.addEventListener("input", renderOffers),
);

clearFilters?.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";
  typeFilter.value = "";
  renderOffers();
});

if (!hasRole("admin")) {
  protectElements('[data-section^="section-admin"]', ["admin"]);
}

if (!hasRole("candidate")) {
  protectElements('[data-section^="section-candidate"]', ["candidate"]);
}

if (!hasRole("company")) {
  protectElements('[data-section^="section-company"]', ["company"]);
}

showSection(
  session.role === "admin" ? "section-admin-offers" : 
  session.role === "candidate" ? "section-all-offers" : 
  "section-company-dashboard",
);

loadData();
