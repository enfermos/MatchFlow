import {getCompany, getOffers, createOffer, updateOffer} from "./json.js";


const companyName = document.getElementById("company-name");
const companySpec = document.getElementById("company-specialization");
const companyEmail = document.getElementById("company-email");
const companyDesc = document.getElementById("company-description");
const offerCount = document.getElementById("offer-count");

const offersContainer = document.getElementById("offers-container");

const offerTitle = document.getElementById("offer-title");
const offerSalary = document.getElementById("offer-salary");
const offerDescription = document.getElementById("offer-description");

let selectedOffer = null;

/* Load company data */
const loadCompany = async () => {
    const company = await getCompany();
    companyName.textContent = company.name;
    companySpec.textContent = company.specialization;
    companyEmail.textContent = company.email;
    companyDesc.textContent = company.description;
};

/* Load offers job */
const loadOffers = async () => {
    const offers = await getOffers();
    offerCount.textContent = `Offers: ${offers.length}`;
    offersContainer.innerHTML = "";

    offers.forEach(offer => {
    const card = document.createElement("div");
    card.classList.add("col-12");

    card.innerHTML = `
        <div class="card position-relative">
        <div class="card-body">

            <button
            class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 delete-offer-btn" data-id="${offer.id}" title="Delete offer">
            <i class="bi bi-trash"></i>
            </button>

            <h5>${offer.title}</h5>
            <p>${offer.salary}</p>

            <button class="btn btn-outline-primary btn-sm view-offer-btn">View</button>
        </div>
        </div>
    `;

    /* VIEW */
    card.querySelector(".view-offer-btn").addEventListener("click", () => {
        showOfferDetail(offer);
    });

    /* DELETE */
    card.querySelector(".delete-offer-btn").addEventListener("click", async () => {
        const confirmDelete = confirm("¿Eliminar esta oferta?");
        if (!confirmDelete) return;

        await deleteOffer(offer.id);
    });

    offersContainer.appendChild(card);
});
};

/* Watch description */
const showOfferDetail = (offer) => {
    selectedOffer = offer;

    offerTitle.textContent = offer.title;
    offerSalary.textContent = offer.salary;
    offerDescription.textContent = offer.description;

        editOfferBtn.disabled = false;
    editOfferForm.classList.add("d-none");
};



/* Edit offer */
const editOfferBtn = document.getElementById("edit-offer-btn");
const editOfferForm = document.getElementById("edit-offer-form");

const editTitleInput = document.getElementById("edit-title-input");
const editSalaryInput = document.getElementById("edit-salary-input");
const editDescriptionInput = document.getElementById("edit-description-input");

editOfferBtn.addEventListener("click", () => {
    if (!selectedOffer) return;

    editTitleInput.value = selectedOffer.title;
    editSalaryInput.value = selectedOffer.salary;
    editDescriptionInput.value = selectedOffer.description;

    editOfferForm.classList.toggle("d-none");
});

editOfferForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedOffer) return;

    const updatedOffer = {
        ...selectedOffer,
        title: editTitleInput.value,
        salary: editSalaryInput.value,
        description: editDescriptionInput.value
    };

    await updateOffer(selectedOffer.id, updatedOffer);

    selectedOffer = updatedOffer;

    showOfferDetail(updatedOffer);
    loadOffers();

    editOfferForm.classList.add("d-none");
});


loadCompany();
loadOffers();

const createOfferBtn = document.getElementById("create-offer-btn");
const offerForm = document.getElementById("offer-form");

const titleInput = document.getElementById("offer-title-input");
const salaryInput = document.getElementById("offer-salary-input");
const descriptionInput = document.getElementById("offer-description-input");

createOfferBtn.addEventListener("click", () => {
    offerForm.classList.toggle("d-none");
});


/**Create new Offer */
offerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newOffer = {
        title: titleInput.value,
        salary: salaryInput.value,
        description: descriptionInput.value,
        companyId: 1
    };

    await createOffer(newOffer);

    offerForm.reset();
    offerForm.classList.add("d-none");

    loadOffers();
});

/* Delete offer */
const deleteOffer = async (id) => {
    await fetch(`http://localhost:3000/offers/${id}`, {
        method: "DELETE",
    });

    if (selectedOffer && selectedOffer.id === id) {
        selectedOffer = null;
        offerTitle.textContent = "";
        offerSalary.textContent = "";
        offerDescription.textContent = "";
        editOfferBtn.disabled = true;
    }

    loadOffers();
};
