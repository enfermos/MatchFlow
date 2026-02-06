        import { getData, postData, putData, deleteData, getSession, clearSession } from "./api.js";

    const session = getSession();
    if (!session) location.href = "./index.html";

    let candidates = [];
    let offers = [];
    let matches = [];
    let editingOfferId = null;

    document.querySelector("#user-box").innerHTML = `
    <strong>${session.name || session.nombre || 'Empresa'}</strong>
    <small>Empresa</small>
    `;

    function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.querySelector(`#section-${name}`).style.display = 'block';
    
    document.querySelectorAll('#nav-links a').forEach(link => {
        link.classList.toggle('active', link.dataset.section === name);
    });
    
    const titles = { candidates: 'Candidatos', offers: 'Mis Ofertas', matches: 'Match' };
    document.querySelector("#section-title").textContent = titles[name];
    }

    document.querySelector("#nav-links").addEventListener('click', (e) => {
    const link = e.target.closest('[data-section]');
    if (link) {
        e.preventDefault();
        showSection(link.dataset.section);
    }
    });

    async function loadCandidates() {
    const users = await getData('/users');
    candidates = users?.filter(u => u.role !== 'admin') || [];
    
    const tbody = document.querySelector("#candidates-table tbody");
    const empty = document.querySelector("#candidates-empty");
    
    if (candidates.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    tbody.innerHTML = candidates.map(c => `
        <tr>
        <td>${c.nombre || c.name || 'Sin nombre'}</td>
        <td>@${c.username || 'usuario'}</td>
        <td>${c.correo || c.email || 'Sin correo'}</td>
        <td>${c.profesion || 'Sin profesión'}</td>
        <td><span class="badge ${getBadgeClass(c.disponibilidad)}">${c.disponibilidad || 'DISPONIBLE'}</span></td>
        <td>${c.proceso || 'SIN_ASIGNAR'}</td>
        <td><button class="btn btn-ghost btn-sm" data-view-profile="${c.id}">Ver perfil</button></td>
        </tr>
    `).join('');
    }

    function getBadgeClass(d) {
    return d === 'DISPONIBLE' ? 'badge-success' : d === 'RESERVADO' ? 'badge-warning' : 'badge-secondary';
    }

    async function loadCompanyOffers() {
    offers = await getData('/offers') || [];
    
    const grid = document.querySelector("#offers-grid");
    const empty = document.querySelector("#offers-empty");
    
    if (offers.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    grid.innerHTML = offers.map(o => `
        <article class="card">
        <h4>${o.title}</h4>
        <p><strong>Empresa:</strong> ${o.company}</p>
        <p><strong>Ubicación:</strong> ${o.location}</p>
        <p><strong>Modalidad:</strong> ${o.type}</p>
        <p><strong>Salario:</strong> ${o.salary}</p>
        <div style="margin-top: 1rem;">
            <button class="btn btn-ghost btn-sm" data-edit-offer="${o.id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-delete-offer="${o.id}">Eliminar</button>
        </div>
        </article>
    `).join('');
    }

    async function loadMatches() {
    const applications = await getData('/applications') || [];
    const users = await getData('/users') || [];
    const allOffers = await getData('/offers') || [];
    
    matches = applications.map(app => {
        const user = users.find(u => String(u.id) === String(app.userId));
        const offer = allOffers.find(o => String(o.id) === String(app.offerId));
        
        return {
        ...app,
        userName: user?.nombre || user?.name || 'Usuario desconocido',
        userEmail: user?.correo || user?.email || 'N/A',
        offerTitle: offer?.title || 'Oferta desconocida',
        matchStatus: 'PENDIENTE'
        };
    });
    
    const tbody = document.querySelector("#matches-table tbody");
    const empty = document.querySelector("#matches-empty");
    
    if (matches.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    tbody.innerHTML = matches.map(m => `
        <tr>
        <td>${m.userName}</td>
        <td>${m.userEmail}</td>
        <td>${m.offerTitle}</td>
        <td><span class="badge badge-info">${m.matchStatus}</span></td>
        <td>${m.date || 'N/A'}</td>
        <td><button class="btn btn-ghost btn-sm" data-view-match="${m.id}">Ver detalle</button></td>
        </tr>
    `).join('');
    }

    document.addEventListener('click', async (e) => {
    const profileBtn = e.target.closest('[data-view-profile]');
    if (profileBtn) {
        const user = candidates.find(c => String(c.id) === String(profileBtn.dataset.viewProfile));
        if (user) {
        alert(`Perfil de ${user.nombre || user.name}
    Correo: ${user.correo || user.email}
    Profesión: ${user.profesion || 'N/A'}
    Experiencia: ${user.experiencia || 'N/A'}
    Disponibilidad: ${user.disponibilidad || 'DISPONIBLE'}
    Proceso: ${user.proceso || 'SIN_ASIGNAR'}`);
        }
        return;
    }
    
    const editBtn = e.target.closest('[data-edit-offer]');
    if (editBtn) {
        const offer = offers.find(o => String(o.id) === String(editBtn.dataset.editOffer));
        if (offer) {
        editingOfferId = offer.id;
        document.querySelector('#title').value = offer.title;
        document.querySelector('#company').value = offer.company;
        document.querySelector('#location').value = offer.location;
        document.querySelector('#category').value = offer.category;
        document.querySelector('#type').value = offer.type;
        document.querySelector('#salary').value = offer.salary;
        document.querySelector('#description').value = offer.description;
        document.querySelector('#offer-form-title').textContent = 'Editar Oferta';
        document.querySelector('#offer-form-container').style.display = 'block';
        }
        return;
    }
    
    const deleteBtn = e.target.closest('[data-delete-offer]');
    if (deleteBtn) {
        if (confirm('¿Eliminar esta oferta?')) {
        await deleteData(`/offers/${deleteBtn.dataset.deleteOffer}`);
        loadCompanyOffers();
        }
        return;
    }
    
    const matchBtn = e.target.closest('[data-view-match]');
    if (matchBtn) {
        const match = matches.find(m => String(m.id) === String(matchBtn.dataset.viewMatch));
        if (match) {
        alert(`Detalle del Match
    Usuario: ${match.userName}
    Correo: ${match.userEmail}
    Oferta: ${match.offerTitle}
    Estado: ${match.matchStatus}
    Fecha: ${match.date || 'N/A'}`);
        }
        return;
    }
    });

    document.querySelector("#create-offer-btn").addEventListener('click', () => {
    editingOfferId = null;
    document.querySelector("#offer-form").reset();
    document.querySelector('#offer-form-title').textContent = 'Crear Nueva Oferta';
    document.querySelector('#offer-form-container').style.display = 'block';
    });

    document.querySelector("#offer-form").addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        title: document.querySelector('#title').value.trim(),
        company: document.querySelector('#company').value.trim(),
        location: document.querySelector('#location').value.trim(),
        category: document.querySelector('#category').value.trim(),
        type: document.querySelector('#type').value.trim(),
        salary: document.querySelector('#salary').value.trim(),
        description: document.querySelector('#description').value.trim()
    };
    
    if (editingOfferId) {
        await putData(`/offers/${editingOfferId}`, { id: editingOfferId, ...data });
    } else {
        await postData('/offers', data);
    }
    
    document.querySelector('#offer-form-container').style.display = 'none';
    document.querySelector("#offer-form").reset();
    editingOfferId = null;
    loadCompanyOffers();
    });

    document.querySelector("#cancel-offer-btn").addEventListener('click', () => {
    document.querySelector('#offer-form-container').style.display = 'none';
    document.querySelector("#offer-form").reset();
    editingOfferId = null;
    });

    document.querySelector("#logout-btn").addEventListener('click', () => {
    clearSession();
    location.href = './index.html';
    });

    showSection('candidates');
    loadMatches();
