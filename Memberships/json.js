const API_URL = "http://localhost:3000";

export const getUser = async () => {
    const res = await fetch(`${API_URL}/user`);
    return res.json();
};

export const updateUser = async (data) => {
    await fetch(`${API_URL}/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
};

export const getPlans = async () => {
    const res = await fetch(`${API_URL}/plans`);
    return res.json();
};
