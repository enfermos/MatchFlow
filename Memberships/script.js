import { getUser, getPlans, updateUser } from "./json.js";

let user = null;
let plans = [];
let currentPlan = null;

const loadData = async () => {
    user = await getUser();
    plans = await getPlans();
    currentPlan = plans.find(p => p.id === user.planId);
};

const renderUserInfo = () => {
    document.getElementById("user-name").textContent = user.name;
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("current-plan").textContent = currentPlan.name;
};

const renderUsageAlert = () => {
    const alert = document.getElementById("plan-alert");
    const usedApps = document.getElementById("used-apps");
    const maxApps = document.getElementById("max-apps");

    usedApps.textContent = user.applicationsUsed;
    maxApps.textContent =
        currentPlan.applicationsLimit === -1
        ? "∞"
        : currentPlan.applicationsLimit;

    if (
        currentPlan.applicationsLimit !== -1 &&
        user.applicationsUsed >= currentPlan.applicationsLimit
    ) {
        alert.classList.remove("d-none");
    } else {
        alert.classList.add("d-none");
    }
};

const renderProgress = () => {
    const progressBar = document.querySelector(".progress-bar");

    if (currentPlan.applicationsLimit === -1) {
        progressBar.style.width = "100%";
        progressBar.classList.remove("bg-warning");
        progressBar.classList.add("bg-success");
        return;
    }

    const percent =
        (user.applicationsUsed / currentPlan.applicationsLimit) * 100;

    progressBar.style.width = `${percent}%`;
};

const setupBillingHistory = () => {
    const btn = document.getElementById("view-billing-history");

    btn.addEventListener("click", () => {
        alert("Redirecting to billing history...");
    });
};

const init = async () => {
    await loadData();
    renderUserInfo();
    renderUsageAlert();
    renderProgress();
    setupBillingHistory();
};

init();
