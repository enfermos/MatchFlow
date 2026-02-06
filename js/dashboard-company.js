import { getData, postData, putData, deleteData, patchData, getSession, clearSession } from "./api.js";

const session = getSession();
if (!session) location.href = "./index.html";

// Redirigir no-empresas a dashboard.html
if (session.role !== 'company') {
    console.log('Non-company user detected, redirecting to dashboard.html');
    window.location.href = './dashboard.html';
}

    // Generar avatar con iniciales
    const userName = session.name || session.nombre || 'Empresa';
    const userInitial = userName.charAt(0).toUpperCase();

document.querySelector("#user-box").innerHTML = `
        <div class="avatar">${userInitial}</div>
        <div class="user-details">
            <strong>${userName}</strong>
            <small>Empresa</small>
        </div>
    `;
let candidates = [];
let offers = [];
let matches = [];
let editingOfferId = null;




function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.querySelector(`#section-${name}`).style.display = 'block';
    
    document.querySelectorAll('#nav-links a').forEach(link => {
        link.classList.toggle('active', link.dataset.section === name);
    });
    
    const titles = { candidates: 'Candidatos', offers: 'Mis Ofertas', matches: 'Match' };
    document.querySelector("#section-title").textContent = titles[name];
}

    function updateStats() {
    const statsContainer = document.querySelector('#stats-container');
    if (statsContainer) {
        const candidatesCount = candidates.length;
        const matchesCount = matches.length;
        const offersCount = offers.length;

        statsContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; background: #eff6ff; padding: 0.5rem 1rem; border-radius: 8px;">
            <i class="bi bi-people-fill" style="font-size: 1.5rem; color: #1e40af;"></i>
            <div>
            <div style="font-size: 1.25rem; font-weight: 700; color: #1e40af;">${candidatesCount}</div>
            <div style="font-size: 0.75rem; color: #64748b;">Candidatos</div>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; background: #dcfce7; padding: 0.5rem 1rem; border-radius: 8px;">
            <i class="bi bi-lightning-fill" style="font-size: 1.5rem; color: #166534;"></i>
            <div>
            <div style="font-size: 1.25rem; font-weight: 700; color: #166534;">${matchesCount}</div>
            <div style="font-size: 0.75rem; color: #64748b;">Matches</div>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; background: #fef3c7; padding: 0.5rem 1rem; border-radius: 8px;">
            <i class="bi bi-briefcase-fill" style="font-size: 1.5rem; color: #92400e;"></i>
            <div>
            <div style="font-size: 1.25rem; font-weight: 700; color: #92400e;">${offersCount}</div>
            <div style="font-size: 0.75rem; color: #64748b;">Ofertas</div>
            </div>
        </div>
        `;
    }
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
    
    // Solo mostrar candidatos (no empresas ni admins) que estén abiertos a trabajar
    candidates = users?.filter(u => u.role === 'candidate' && u.openToWork === true) || [];
    
    const tbody = document.querySelector("#candidates-table tbody");
    const empty = document.querySelector("#candidates-empty");
    
    if (candidates.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        empty.textContent = 'No hay candidatos disponibles (con openToWork activado)';
        return;
    }
    
    // Cargar reservas y matches para verificar estados
    const reservations = await getData('/reservations') || [];
    const allMatches = await getData('/matches') || [];
    
    empty.style.display = 'none';
    tbody.innerHTML = candidates.map(c => {
        // Verificar si este candidato está reservado
        const estaReservado = reservations.some(r => String(r.candidateId) === String(c.id));
        const miReserva = reservations.find(r => 
            String(r.candidateId) === String(c.id) && String(r.companyId) === String(session.id)
        );
        
        // Verificar si ya tengo un match con este candidato
        const tengoMatch = allMatches.find(m => 
            String(m.candidateId) === String(c.id) && String(m.companyId) === String(session.id)
        );
        
        // Privacidad: solo mostrar teléfono si hay match en estado contacted o mayor
        const puedeVerContacto = tengoMatch && 
            ['contacted', 'interview', 'hired'].includes(tengoMatch.status);
        
        const telefono = puedeVerContacto ? (c.telefono || 'No disponible') : '<i class="bi bi-lock-fill"></i> Oculto';
        const correo = puedeVerContacto ? (c.correo || c.email) : '<i class="bi bi-lock-fill"></i> Contacta primero';
        
        let acciones = '';
        if (miReserva) {
            acciones = `
                <span class="badge badge-warning" style="font-size: 0.75rem;">Tu reserva</span>
                <button class="btn btn-danger btn-sm" data-liberar-reserva="${c.id}">Liberar</button>
            `;
        } else if (estaReservado) {
            acciones = `<span class="badge badge-secondary" style="font-size: 0.75rem;">Reservado por otra empresa</span>`;
        } else if (tengoMatch) {
            acciones = `<span class="badge badge-info" style="font-size: 0.75rem;">Ya tienes match</span>`;
        } else {
            acciones = `
                <button class="btn btn-accent btn-sm" data-create-match="${c.id}">Crear Match</button>
                <button class="btn btn-ghost btn-sm" data-reservar="${c.id}">Reservar</button>
            `;
        }
        
        return `
        <tr>
            <td>${c.nombre || c.name || 'Sin nombre'}</td>
            <td>${c.profesion || 'Sin profesión'}</td>
            <td>${c.experiencia || 'No especificada'}</td>
            <td>${correo}</td>
            <td>${telefono}</td>
            <td>${acciones}</td>
        </tr>
    `;
    }).join('');
    
    updateStats(); // Actualizar estadísticas
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
    
    updateStats(); // Actualizar estadísticas
    }

    async function loadMatches() {
    const allMatches = await getData('/matches') || [];
    const users = await getData('/users') || [];
    const allOffers = await getData('/offers') || [];
    
    // Solo mis matches
    matches = allMatches.filter(m => String(m.companyId) === String(session.id));
    
    matches = matches.map(m => {
        const user = users.find(u => String(u.id) === String(m.candidateId));
        const offer = allOffers.find(o => String(o.id) === String(m.offerId));
        
        return {
        ...m,
        userName: user?.nombre || user?.name || 'Candidato desconocido',
        userEmail: user?.correo || user?.email || 'N/A',
        userPhone: user?.telefono || 'N/A',
        offerTitle: offer?.title || 'Oferta desconocida',
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
    tbody.innerHTML = matches.map(m => {
        // Opciones de estado
        const estados = [
            { value: 'pending', label: 'Pendiente' },
            { value: 'contacted', label: 'Contactado' },
            { value: 'interview', label: 'Entrevista' },
            { value: 'hired', label: 'Contratado' },
            { value: 'discarded', label: 'Descartado' }
        ];
        
        const selectEstado = `
            <select class="match-status-select" data-match-id="${m.id}" style="padding: 4px; font-size: 0.85rem;">
                ${estados.map(e => `
                    <option value="${e.value}" ${m.status === e.value ? 'selected' : ''}>
                        ${e.label}
                    </option>
                `).join('')}
            </select>
        `;
        
        // Mostrar contacto solo si está en contacted o superior
        const puedeVerContacto = ['contacted', 'interview', 'hired'].includes(m.status);
        const contactInfo = puedeVerContacto 
            ? `${m.userEmail}<br><small>${m.userPhone}</small>`
            : `<span style="color: #888;"><i class="bi bi-lock-fill"></i> Cambia estado a "Contactado"</span>`;
        
        return `
        <tr>
            <td>${m.userName}</td>
            <td>${m.offerTitle}</td>
            <td>${selectEstado}</td>
            <td>${contactInfo}</td>
            <td><small>${new Date(m.createdAt).toLocaleDateString()}</small></td>
        </tr>
    `;
    }).join('');
    
    // Event listener para cambio de estado
    document.querySelectorAll('.match-status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const matchId = e.target.dataset.matchId;
            const nuevoEstado = e.target.value;
            
            await putData(`/matches/${matchId}`, {
                ...matches.find(m => m.id === matchId),
                status: nuevoEstado
            });
            
            loadMatches(); // Recargar para actualizar vista
        });
    });
    
    updateStats(); // Actualizar estadísticas
    }

    document.addEventListener('click', async (e) => {
    // Crear match con candidato
    const createMatchBtn = e.target.closest('[data-create-match]');
    if (createMatchBtn) {
        const candidateId = createMatchBtn.dataset.createMatch;
        
        // VERIFICAR LÍMITE DEL PLAN DE LA EMPRESA
        const companyData = await getData(`/users/${session.id}`);
        if (!companyData) {
            alert('Error al obtener datos de la empresa');
            return;
        }
        
        // Planes de empresa y límites
        const PLANES_EMPRESA = {
            free: { limite: 5 },
            comercial: { limite: 50 },
            empresa: { limite: -1 } // ilimitado
        };
        
        const planEmpresa = companyData.plan || 'free';
        const contactosUsados = companyData.contactosUsados || 0;
        const limiteEmpresa = PLANES_EMPRESA[planEmpresa].limite;
        
        // Verificar si la empresa alcanzó su límite
        if (limiteEmpresa !== -1 && contactosUsados >= limiteEmpresa) {
            alert(`Has alcanzado tu límite de ${limiteEmpresa} contactos mensuales (Plan ${planEmpresa.toUpperCase()}). Actualiza tu plan para poder contactar más candidatos.`);
            return;
        }
        
        // VERIFICAR LÍMITE DEL PLAN DEL CANDIDATO
        const candidateData = await getData(`/users/${candidateId}`);
        if (!candidateData) {
            alert('Error al obtener datos del candidato');
            return;
        }
        
        // Planes y límites
        const PLANES = {
            free: { limite: 3 },
            pro1: { limite: 10 },
            pro2: { limite: -1 } // ilimitado
        };
        
        const planCandidato = candidateData.plan || 'free';
        const matchesUsados = candidateData.matchesUsados || 0;
        const limitePlan = PLANES[planCandidato].limite;
        
        // Verificar si alcanzó el límite
        if (limitePlan !== -1 && matchesUsados >= limitePlan) {
            alert(`Este candidato alcanzó su límite de ${limitePlan} matches mensuales (Plan ${planCandidato.toUpperCase()}). No puede recibir más matches hasta el próximo mes.`);
            return;
        }
        
        // Pedir que seleccione una oferta
        const misOfertas = offers.filter(o => String(o.companyId) === String(session.id));
        
        if (misOfertas.length === 0) {
            alert('Primero debes crear una oferta de trabajo');
            return;
        }
        
        // Mostrar opciones simples
        let opcionesHTML = 'Selecciona una oferta:\n\n';
        misOfertas.forEach((o, i) => {
            opcionesHTML += `${i + 1}. ${o.title}\n`;
        });
        
        const seleccion = prompt(opcionesHTML + '\nIngresa el número de la oferta:');
        if (!seleccion) return;
        
        const indice = parseInt(seleccion) - 1;
        if (indice < 0 || indice >= misOfertas.length) {
            alert('Selección inválida');
            return;
        }
        
        const ofertaSeleccionada = misOfertas[indice];
        
        // Crear el match
        await postData('/matches', {
            companyId: session.id,
            candidateId: candidateId,
            offerId: ofertaSeleccionada.id,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        
        // Incrementar contador de matches del candidato
        await patchData(`/users/${candidateId}`, {
            matchesUsados: matchesUsados + 1
        });
        
        // Incrementar contador de contactos de la empresa
        await patchData(`/users/${session.id}`, {
            contactosUsados: contactosUsados + 1
        });
        
        alert('Match creado exitosamente!');
        loadCandidates();
        loadMatches();
        return;
    }
    
    // Reservar candidato
    const reservarBtn = e.target.closest('[data-reservar]');
    if (reservarBtn) {
        const candidateId = reservarBtn.dataset.reservar;
        
        // Pedir que seleccione una oferta
        const misOfertas = offers.filter(o => String(o.companyId) === String(session.id));
        
        if (misOfertas.length === 0) {
            alert('Primero debes crear una oferta de trabajo');
            return;
        }
        
        let opcionesHTML = 'Selecciona una oferta para reservar:\n\n';
        misOfertas.forEach((o, i) => {
            opcionesHTML += `${i + 1}. ${o.title}\n`;
        });
        
        const seleccion = prompt(opcionesHTML + '\nIngresa el número:');
        if (!seleccion) return;
        
        const indice = parseInt(seleccion) - 1;
        if (indice < 0 || indice >= misOfertas.length) {
            alert('Selección inválida');
            return;
        }
        
        const ofertaSeleccionada = misOfertas[indice];
        
        // Crear reserva
        await postData('/reservations', {
            companyId: session.id,
            candidateId: candidateId,
            offerId: ofertaSeleccionada.id,
            createdAt: new Date().toISOString()
        });
        
        // Actualizar el campo reservadoPor del usuario
        const candidato = candidates.find(c => String(c.id) === String(candidateId));
        if (candidato) {
            await putData(`/users/${candidateId}`, {
                ...candidato,
                reservadoPor: session.id
            });
        }
        
        alert('Candidato reservado exitosamente!');
        loadCandidates();
        return;
    }
    
    // Liberar reserva
    const liberarBtn = e.target.closest('[data-liberar-reserva]');
    if (liberarBtn) {
        const candidateId = liberarBtn.dataset.liberarReserva;
        
        // Buscar la reserva
        const reservas = await getData('/reservations') || [];
        const reserva = reservas.find(r => 
            String(r.candidateId) === String(candidateId) && 
            String(r.companyId) === String(session.id)
        );
        
        if (reserva) {
            await deleteData(`/reservations/${reserva.id}`);
            
            // Limpiar el campo reservadoPor del usuario
            const candidato = candidates.find(c => String(c.id) === String(candidateId));
            if (candidato) {
                await putData(`/users/${candidateId}`, {
                    ...candidato,
                    reservadoPor: null
                });
            }
            
            alert('Reserva liberada');
            loadCandidates();
        }
        return;
    }
    
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
    loadCandidates();
    loadCompanyOffers();
    loadMatches();
