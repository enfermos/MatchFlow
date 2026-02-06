const API_URL = "http://localhost:3000";

export const getCompany = async () => {
    const res = await fetch(`${API_URL}/company`);
    return res.json();
};

export const updateCompany = async (data) => {
    await fetch(`${API_URL}/company`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
};

export const getOffers = async () => {
    const res = await fetch(`${API_URL}/offers`);
    return res.json();
};

export const createOffer = async (offer) => {
    await fetch(`${API_URL}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offer)
    });
};

export const updateOffer = async (id, data) => {
    await fetch(`${API_URL}/offers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
};
