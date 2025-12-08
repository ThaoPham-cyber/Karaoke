// EmployeeFile.js (fixed) 
// - Fix bug: clicking 2nd time mất dữ liệu (reset editingId, persist to localStorage)
// - Simple validation, close on backdrop click, localStorage persistence

(function () {
  const STORAGE_KEY = "employees_v1";

  // DOM
  const searchInput = document.getElementById("searchInput");
  const filterPosition = document.getElementById("filterPosition");
  const addEmployeeBtn = document.querySelector(".btn-add");
  const employeeBody = document.getElementById("employeeBody");

  const employeeModal = document.getElementById("employeeModal");
  const modalContent = document.querySelector(".employee-modal-content");
  const modalTitle = document.getElementById("modalTitle");

  const nameInput = document.getElementById("nameInput");
  const positionInput = document.getElementById("positionInput");
  const phoneInput = document.getElementById("phoneInput");
  const emailInput = document.getElementById("emailInput");
  const salaryInput = document.getElementById("salaryInput");
  const dateInput = document.getElementById("dateInput");
  const statusInput = document.getElementById("statusInput");

  // state
  let employees = [];
  let editingId = null;

  // util
  function genId() { return "EMP_" + Date.now().toString(36); }
  function saveStorage() { localStorage.setItem(STORAGE_KEY, JSON.stringify(employees)); }
  function loadStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { employees = JSON.parse(raw); return; }
      catch (e) { console.warn("Invalid storage, reseed"); }
    }
    // seed default if none
    employees = [
      { id: genId(), name: "Nguyễn Thị X", position: "Quản lý", phone: "0901111111", email: "quanly@karaoke.com", salary: 15000000, date: "2022-01-01", status: "Đang làm" },
      { id: genId(), name: "Trần Văn Y", position: "Thu ngân", phone: "0902222222", email: "thungan1@karaoke.com", salary: 8000000, date: "2023-03-15", status: "Đang làm" },
      { id: genId(), name: "Lê Thị Z", position: "Phục vụ", phone: "0903333333", email: "phucvu1@karaoke.com", salary: 6000000, date: "2023-06-01", status: "Đang làm" }
    ];
    saveStorage();
  }

  function formatDateForDisplay(dateStr) {
    if(!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  }

  // render
  function renderEmployees() {
    const q = (searchInput.value || "").toLowerCase();
    const filter = filterPosition.value;

    employeeBody.innerHTML = "";

    const list = employees
      .filter(emp => (filter === "all" ? true : emp.position === filter))
      .filter(emp => !q || emp.name.toLowerCase().includes(q) || emp.position.toLowerCase().includes(q));

    list.forEach(emp => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(emp.name)}</td>
        <td><span class="badge-position">${escapeHtml(emp.position)}</span></td>
        <td>
          <div><i class="fa-solid fa-phone"></i> ${escapeHtml(emp.phone)}</div>
          <div><i class="fa-solid fa-envelope"></i> ${escapeHtml(emp.email)}</div>
        </td>
        <td>${Number(emp.salary).toLocaleString()}đ</td>
        <td>${formatDateForDisplay(emp.date)}</td>
        <td>
          <span class="${emp.status === 'Đang làm' ? 'badge-active' : 'badge-inactive'}">
            ${escapeHtml(emp.status)}
          </span>
        </td>
        <td>
          <i class="fa-solid fa-pen action-btn action-edit" data-id="${emp.id}" title="Sửa"></i>
          <i class="fa-solid fa-trash action-btn action-delete" data-id="${emp.id}" title="Xóa"></i>
        </td>
      `;
      employeeBody.appendChild(tr);
    });

    // bind actions
    document.querySelectorAll(".action-edit").forEach(el => el.onclick = () => openEditModal(el.dataset.id));
    document.querySelectorAll(".action-delete").forEach(el => el.onclick = () => deleteEmployee(el.dataset.id));
  }

  // helpers
  function escapeHtml(s){ return (s==null?"":String(s)).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  // modal control
  function openAddModal() {
    editingId = null;                      // important: reset editingId
    modalTitle.innerText = "Thêm nhân viên";
    nameInput.value = "";
    positionInput.value = "Quản lý";
    phoneInput.value = "";
    emailInput.value = "";
    salaryInput.value = "";
    dateInput.value = "";
    statusInput.value = "Đang làm";
    employeeModal.style.display = "flex";
    setTimeout(()=> nameInput.focus(), 80);
  }

  function openEditModal(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return alert("Nhân viên không tồn tại");

    editingId = id;                        // set editingId to indicate edit mode
    modalTitle.innerText = "Chỉnh sửa nhân viên";
    nameInput.value = emp.name;
    positionInput.value = emp.position;
    phoneInput.value = emp.phone;
    emailInput.value = emp.email;
    salaryInput.value = emp.salary;
    dateInput.value = emp.date;
    statusInput.value = emp.status;
    employeeModal.style.display = "flex";
    setTimeout(()=> nameInput.focus(), 80);
  }

  function closeModal() {
    employeeModal.style.display = "none";
    // reset editing state & form for safety
    editingId = null;
    nameInput.value = "";
    positionInput.value = "Quản lý";
    phoneInput.value = "";
    emailInput.value = "";
    salaryInput.value = "";
    dateInput.value = "";
    statusInput.value = "Đang làm";
  }

  // click outside modal to close
  employeeModal.addEventListener("click", (e) => {
    if (e.target === employeeModal) closeModal();
  });

  // save
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function saveEmployee() {
    const name = nameInput.value.trim();
    const position = positionInput.value;
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const salary = Number(salaryInput.value) || 0;
    const date = dateInput.value;
    const status = statusInput.value;

    if (!name) { alert("Tên không được để trống"); nameInput.focus(); return; }
    if (email && !validateEmail(email)) { alert("Email không hợp lệ"); emailInput.focus(); return; }

    if (editingId) {
      // update
      const idx = employees.findIndex(e => e.id === editingId);
      if (idx >= 0) {
        employees[idx] = { id: editingId, name, position, phone, email, salary, date, status };
      } else {
        // fallback: if id missing, push as new
        employees.push({ id: genId(), name, position, phone, email, salary, date, status });
      }
    } else {
      // add new -> push to end (so appears last)
      employees.push({ id: genId(), name, position, phone, email, salary, date, status });
    }

    saveStorage();
    closeModal();
    renderEmployees();
  }

  // delete
  function deleteEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    if (!confirm(`Bạn có chắc muốn xóa "${emp.name}"?`)) return;
    employees = employees.filter(e => e.id !== id);
    saveStorage();
    renderEmployees();
  }

  // events
  addEmployeeBtn.addEventListener("click", openAddModal);
  document.querySelector("#employeeModal .employee-modal-content")?.addEventListener("click", e => e.stopPropagation()); // prevent close on clicks inside
  // Save button (in your HTML button calls saveEmployee() directly; but bind here if preferred)
  // document.querySelector("#employeeModal .employee-modal-content button").addEventListener("click", saveEmployee);

  document.getElementById("employeeModal").addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.getElementById("searchInput").addEventListener("input", renderEmployees);
  document.getElementById("filterPosition").addEventListener("change", renderEmployees);

  // init
  loadStorage();
  renderEmployees();

  // expose saveEmployee and closeModal for inline HTML handlers (your HTML uses onclick)
  window.saveEmployee = saveEmployee;
  window.openAddModal = openAddModal;
  window.openEditModal = openEditModal;
  window.closeModal = closeModal;
})();
