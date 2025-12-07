/* File: ui/Service/Service.js */
console.log(">>> Service.js FIXED & OPTIMIZED");

(() => {

  // --- DOM elements ---
  const searchInput = document.getElementById("searchInput");
  const suggestList = document.getElementById("suggestList");
  const categoryFilter = document.getElementById("categoryFilter");
  const addBtn = document.getElementById("addBtn");
  const tbody = document.getElementById("serviceTableBody");

  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const form = document.getElementById("formService");
  const modalTitle = document.getElementById("modalTitle");

  // fields in modal
  const idField = document.getElementById("serviceId");
  const nameField = document.getElementById("fieldName");
  const categoryField = document.getElementById("fieldCategory");
  const priceField = document.getElementById("fieldPrice");
  const unitField = document.getElementById("fieldUnit");
  const stockField = document.getElementById("fieldStock");
  const descField = document.getElementById("fieldDesc");

  // --- storage ---
  const STORAGE_KEY = "karaoke_services_v1";
  let services = [];

  // Unified ID generator (fix xóa bị fail)
  function genId() {
    return "DV_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 9999);
  }

  // Seed demo data
  function seedDemo() {
    services = [
      { id: genId(), name: "Nước suối", category: "Đồ uống", price: 10000, unit: "Chai", stock: 150, desc: "Nước suối Aquafina 500ml" },
      { id: genId(), name: "Bia Tiger", category: "Đồ uống", price: 20000, unit: "Lon", stock: 80, desc: "Bia Tiger lon 330ml" },
      { id: genId(), name: "Snack Oishi", category: "Đồ ăn", price: 15000, unit: "Gói", stock: 60, desc: "Snack các loại" },
      { id: genId(), name: "Mì ly", category: "Đồ ăn", price: 12000, unit: "Ly", stock: 45, desc: "Mì ly Hảo Hảo" },
      { id: genId(), name: "Trái cây dĩa", category: "Đồ ăn", price: 80000, unit: "Dĩa", stock: 20, desc: "Trái cây tươi theo mùa" }
    ];
    save();
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        services = JSON.parse(raw);
      } catch {
        seedDemo();
      }
    } else {
      seedDemo();
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  }

  // --- utils ---
  function escapeHtml(s) {
    return (s+'').replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[m]);
  }

  function formatCurrency(v) {
    return v.toLocaleString("vi-VN") + "đ";
  }

  // --- render ---
  function renderCategoryFilter() {
    categoryFilter.innerHTML = '<option value="__all">Tất cả danh mục</option>';
    [...new Set(services.map(s => s.category))].forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      categoryFilter.appendChild(opt);
    });
  }

  function getFilteredList() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = categoryFilter.value;

    return services.filter(s => {
      const matchCat = (cat === "__all" || s.category === cat);
      const matchName = !q || s.name.toLowerCase().includes(q);
      return matchCat && matchName;
    });
  }

  function stockClass(n) {
    if (n <= 10) return "stock-red";
    if (n <= 50) return "stock-yellow";
    return "stock-green";
  }

  function badgeClass(cat) {
    if (!cat) return "badge-blue";
    let c = cat.toLowerCase();
    if (c.includes("uống")) return "badge-blue";
    return "badge-pink";
  }

  function renderTable() {
    const list = getFilteredList();
    tbody.innerHTML = "";

    list.forEach(s => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${escapeHtml(s.name)}</td>
        <td><span class="badge ${badgeClass(s.category)}">${escapeHtml(s.category)}</span></td>
        <td>${formatCurrency(s.price)}</td>
        <td>${escapeHtml(s.unit)}</td>
        <td><span class="stock ${stockClass(s.stock)}">${s.stock}</span></td>
        <td>${escapeHtml(s.desc)}</td>
        <td class="action-box">
          <i class="fa fa-edit edit-btn" data-id="${s.id}"></i>
          <i class="fa fa-trash delete-btn" data-id="${s.id}"></i>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // bind actions
    tbody.querySelectorAll(".edit-btn").forEach(e => e.onclick = onEdit);
    tbody.querySelectorAll(".delete-btn").forEach(e => e.onclick = onDelete);
  }

  // --- suggestions ---
  function showSuggest() {
    suggestList.classList.remove("hidden");
    suggestList.style.opacity = 1;
  }

  function hideSuggest() {
    suggestList.style.opacity = 0;
    setTimeout(() => suggestList.classList.add("hidden"), 180);
  }

  function renderSuggestions() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return hideSuggest();

    const matches = services.filter(s => s.name.toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) return hideSuggest();

    suggestList.innerHTML = matches.map(m =>
      `<div class="item" data-id="${m.id}">${m.name}</div>`
    ).join("");

    suggestList.querySelectorAll(".item").forEach(el => {
      el.onclick = () => {
        const id = el.dataset.id;
        const svc = services.find(s => s.id === id);
        searchInput.value = svc.name;
        hideSuggest();
        renderTable();
      };
    });

    showSuggest();
  }

  // --- Modal ---
  function openModal(mode, sv = null) {
    modal.classList.remove("hidden");

    if (mode === "add") {
      modalTitle.textContent = "Thêm dịch vụ";
      form.reset();
      idField.value = "";
      priceField.value = 0;
      stockField.value = 0;
    } else {
      modalTitle.textContent = "Sửa dịch vụ";
      idField.value = sv.id;
      nameField.value = sv.name;
      categoryField.value = sv.category;
      priceField.value = sv.price;
      unitField.value = sv.unit;
      stockField.value = sv.stock;
      descField.value = sv.desc;
    }

    setTimeout(() => nameField.focus(), 100);
  }

  function closeModalFn() {
    modal.classList.add("hidden");
  }

  function onEdit(e) {
    const id = e.target.dataset.id;
    const svc = services.find(s => s.id === id);
    if (svc) openModal("edit", svc);
  }

  function onDelete(e) {
    const id = e.target.dataset.id;
    const svc = services.find(s => s.id === id);

    if (!svc) return;

    if (confirm(`Xóa dịch vụ "${svc.name}" ?`)) {
      services = services.filter(s => s.id !== id);
      save();
      renderCategoryFilter();
      renderTable();
    }
  }

  // --- Form Submit ---
  form.onsubmit = ev => {
    ev.preventDefault();

    const id = idField.value;
    const data = {
      id: id || genId(),
      name: nameField.value.trim(),
      category: categoryField.value.trim() || "Khác",
      price: Number(priceField.value),
      unit: unitField.value.trim(),
      stock: Number(stockField.value),
      desc: descField.value.trim()
    };

    if (!data.name) return alert("Tên dịch vụ không được để trống!");

    if (id) {
      let idx = services.findIndex(s => s.id === id);
      if (idx >= 0) services[idx] = data;
    } else {
      services.unshift(data);
    }

    save();
    renderCategoryFilter();
    renderTable();
    closeModalFn();
  };

  // --- Bind events ---
  closeModal.onclick = closeModalFn;
  cancelBtn.onclick = closeModalFn;
  addBtn.onclick = () => openModal("add");

  searchInput.oninput = () => {
    renderSuggestions();
    renderTable();
  };
  searchInput.onfocus = renderSuggestions;
  searchInput.onblur = () => setTimeout(hideSuggest, 150);

  categoryFilter.onchange = renderTable;

  // --- init
  load();
  renderCategoryFilter();
  renderTable();

})();
