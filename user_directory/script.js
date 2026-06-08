const api = {
  baseURL: "https://jsonplaceholder.typicode.com",
  async getUsers() {
    const response = await fetch(`${this.baseURL}/users`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
  async getUser(id) {
    const response = await fetch(`${this.baseURL}/users/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
  async createUser(data) {
    const response = await fetch(`${this.baseURL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
  async updateUser(id, data) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
  async deleteUser(id) {
    const response = await fetch(`${this.baseURL}/users/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return true;
  },
};

const ui = {
  messageEl: document.getElementById("message"),
  listEl: document.getElementById("user-list"),
  showLoading() {
    this.messageEl.textContent = "Đang tải...";
  },
  hideLoading() {
    this.messageEl.textContent = "";
  },
  showError(message) {
    this.messageEl.textContent = message;
    this.messageEl.style.color = "#dc2626";
  },
  showSuccess(message) {
    this.messageEl.textContent = message;
    this.messageEl.style.color = "#16a34a";
  },
  renderUsers(users) {
    if (!users.length) {
      this.listEl.innerHTML = "<p>Không có user nào.</p>";
      return;
    }
    this.listEl.innerHTML = users
      .map(
        user => `
      <div class="user-card">
        <h3>${user.name}</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>
        <div class="actions">
          <button type="button" data-action="edit" data-id="${user.id}">Edit</button>
          <button type="button" data-action="delete" data-id="${user.id}">Delete</button>
        </div>
      </div>`
      )
      .join("");
  },
};

const searchInput = document.getElementById("search-input");
const reloadBtn = document.getElementById("reload-btn");
const userForm = document.getElementById("user-form");
const inputName = document.getElementById("name");
const inputEmail = document.getElementById("email");
const inputPhone = document.getElementById("phone");

let users = [];
let editingId = null;

async function loadUsers() {
  ui.showLoading();
  try {
    users = await api.getUsers();
    ui.renderUsers(users);
    ui.showSuccess("Loaded users thành công.");
  } catch (error) {
    ui.showError(`Lỗi: ${error.message}`);
  }
}

function filterUsers() {
  const query = searchInput.value.toLowerCase();
  const filtered = users.filter(
    user => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
  );
  ui.renderUsers(filtered);
}

userForm.addEventListener("submit", async event => {
  event.preventDefault();
  const userData = {
    name: inputName.value.trim(),
    email: inputEmail.value.trim(),
    phone: inputPhone.value.trim(),
  };

  try {
    ui.showLoading();
    if (editingId) {
      await api.updateUser(editingId, userData);
      ui.showSuccess("Cập nhật user thành công.");
      editingId = null;
    } else {
      await api.createUser(userData);
      ui.showSuccess("Tạo user mới thành công.");
    }
    userForm.reset();
    await loadUsers();
  } catch (error) {
    ui.showError(`Lỗi: ${error.message}`);
  }
});

reloadBtn.addEventListener("click", loadUsers);
searchInput.addEventListener("input", filterUsers);

ui.listEl.addEventListener("click", async event => {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;
  if (!action) return;

  if (action === "edit") {
    const user = users.find(item => String(item.id) === id);
    if (!user) return;
    editingId = user.id;
    inputName.value = user.name;
    inputEmail.value = user.email;
    inputPhone.value = user.phone;
    ui.showSuccess("Chế độ chỉnh sửa activated.");
  }

  if (action === "delete") {
    if (!confirm("Bạn có chắc muốn xóa user này?")) return;
    try {
      ui.showLoading();
      await api.deleteUser(id);
      ui.showSuccess("Xóa user thành công.");
      await loadUsers();
    } catch (error) {
      ui.showError(`Lỗi: ${error.message}`);
    }
  }
});

loadUsers();
