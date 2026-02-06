import { getData } from "./api.js";

const $ = (s) => document.querySelector(s);

(async function renderHTML() {
  const users = await getData("/users");
  const totalUsers = users.length;
  let planStatusCounter = 0;
  let earning = 0;

  users.forEach((user) => {
    if (user.planActive) {
      planStatusCounter += 1;
    }
    if (user.plan === "Pro") {
      earning += 19.99;
    } else if (user.plan === "Premium") {
      earning += 29.99;
    }
  });

  $("#earning").textContent = "$" + earning;
  $("#active-plans").textContent = planStatusCounter;
  $("#total-users").textContent = totalUsers;
})();
