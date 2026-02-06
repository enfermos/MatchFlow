import { getData, deleteData } from "./api.js";

const $ = (s) => document.querySelector(s);
const userHtml = (id, name, plan, planColor, status, statusColor) => {
  return `
  <tr class="border-t">
      <td class="p-3">${id}</td>
      <td class="p-3">${name}</td>
      <td class="p-3">
          <span
              class="px-2 py-1 rounded ${planColor}"
              >${plan}</span
          >
      </td>
      <td class="p-3 ${statusColor}">${status}</td>
      <td class="p-3 flex gap-4">
        <button class="text-blue-600 cursor-pointer" data-id="${id}" data-action="edit">EDITAR</button>
        <button class="text-red-600 cursor-pointer" data-id="${id}" data-action="delete">DELETE</button>
      </td>
  </tr>
  `;
};
const adminHtml = (id, name, plan, planColor, status, statusColor) => {
  return `
  <tr class="border-t">
      <td class="p-3">${id}</td>
      <td class="p-3">${name}</td>
      <td class="p-3">
          <span
              class="px-2 py-1 ${planColor} rounded"
              >${plan}</span
          >
      </td>
      <td class="p-3 ${statusColor}">${status}</td>
      <td class="p-3 flex gap-4">
        <button class="text-blue-600 cursor-pointer" data-id="${id}" data-action="edit">EDITAR</button>
        <button class="text-red-600 cursor-pointer" data-id="${id}" data-action="delete">DELETE</button>
      </td>
  </tr>
  `;
};

document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action) return;
  const id = e.target.dataset.id;

  switch (action) {
    case "delete":
      deleteData("/users/" + id);
      renderHTML();
  }
});

(async function renderHTML() {
  const users = await getData("/users");
  const totalUsers = users.length;
  let planStatusCounter = 0;
  let earning = 0;
  let usertableHtml = "";
  let admintableHtml = "";

  users.forEach((user) => {
    let statusColor = "text-red-600";

    if (user.planStatus === "Activo") {
      planStatusCounter += 1;
      statusColor = "text-green-600";
      if (user.plan === "Pro") {
        earning += 19.99;
      } else if (user.plan === "Premium") {
        earning += 29.99;
      }
    }

    if (user.role === "user") {
      usertableHtml += userHtml(
        user.id,
        user.name,
        user.plan,
        user.plan === "Pro"
          ? "text-blue-600 bg-blue-100"
          : user.plan === "Premium"
            ? "text-purple-600 bg-purple-100"
            : "text-gray-600 bg-gray-100",
        user.planStatus,
        statusColor,
      );
    } else {
      admintableHtml = adminHtml(
        user.id,
        user.name,
        user.plan,
        user.plan === "Pro"
          ? "text-blue-600 bg-blue-100"
          : user.plan === "Premium"
            ? "text-purple-600 bg-purple-100"
            : "text-gray-600 bg-gray-100",
        user.planStatus,
        statusColor,
      );
    }
  });

  $("#earning").textContent = "$" + earning;
  $("#active-plans").textContent = planStatusCounter;
  $("#total-users").textContent = totalUsers;
  $("#user-tbody").innerHTML = usertableHtml;
  $("#admin-tbody").innerHTML = admintableHtml;
})();
