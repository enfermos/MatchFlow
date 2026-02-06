import {getCompany, getOffers, updateOffer} from "./json.js";

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
        <div class="card">
            <div class="card-body">
                <h5>${offer.title}</h5>
                <p>${offer.salary}</p>
                <button class="btn btn-outline-primary btn-sm">View</button>
            </div>
        </div>
        `;

        card.querySelector("button").addEventListener("click", () => {
        showOfferDetail(offer);
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
};

/* Editar oferta (ejemplo simple) */
document.getElementById("edit-offer-btn").addEventListener("click", async () => {
    if (!selectedOffer) return;

    const newTitle = prompt("New title:", selectedOffer.title);
    if (!newTitle) return;

    await updateOffer(selectedOffer.id, {
    ...selectedOffer,
    title: newTitle
    });

    loadOffers();
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
