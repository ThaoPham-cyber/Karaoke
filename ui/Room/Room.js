// File: ui/Room/Room.js
(function () {
  const STORAGE_KEY = "karaoke_rooms_v1";

  // ---------- DOM ----------
  const sumAvailableEl = document.getElementById("sumAvailable");
  const sumUsingEl = document.getElementById("sumUsing");
  const sumMaintenanceEl = document.getElementById("sumMaintenance");

  const searchRoom = document.getElementById("searchRoom");
  const filterStatus = document.getElementById("filterStatus");
  const addRoomBtn = document.getElementById("addRoomBtn");
  const roomListEl = document.getElementById("roomList");

  // room modal
  const roomModal = document.getElementById("roomModal");
  const roomModalTitle = document.getElementById("roomModalTitle");
  const closeRoomModal = document.getElementById("closeRoomModal");
  const roomForm = document.getElementById("roomForm");
  const roomIdInput = document.getElementById("roomId");
  const fieldRoomName = document.getElementById("fieldRoomName");
  const fieldRoomType = document.getElementById("fieldRoomType");
  const fieldCapacity = document.getElementById("fieldCapacity");
  const fieldPrice = document.getElementById("fieldPrice");
  const fieldStatus = document.getElementById("fieldStatus");
  const cancelRoom = document.getElementById("cancelRoom");

  // customer modal
  const customerModal = document.getElementById("customerModal");
  const closeCustomerModal = document.getElementById("closeCustomerModal");
  const customerForm = document.getElementById("customerForm");
  const fieldCustomerName = document.getElementById("fieldCustomerName");
  const fieldStartTime = document.getElementById("fieldStartTime");
  const cancelCustomer = document.getElementById("cancelCustomer");

  // internal state
  let rooms = [];
  let editingRoomId = null;   // for customer modal -> which room to add customer

  // ---------- utilities ----------
  function genId(prefix = "R") {
    return prefix + "_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 9000);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        rooms = JSON.parse(raw);
      } else {
        seedDemo();
      }
    } catch (e) {
      console.error("Failed to load rooms, seed demo.", e);
      seedDemo();
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  }

  function seedDemo() {
    rooms = [
      {
        id: genId(),
        name: "Phòng VIP 01",
        type: "VIP",
        capacity: 10,
        price: 200000,
        status: "using",
        customers: [{ name: "Nguyễn Văn A", start: todayTimeString("14:30") }],
        note: ""
      },
      {
        id: genId(),
        name: "Phòng VIP 02",
        type: "VIP",
        capacity: 10,
        price: 200000,
        status: "available",
        customers: [],
        note: ""
      },
      {
        id: genId(),
        name: "Phòng 03",
        type: "Standard",
        capacity: 6,
        price: 100000,
        status: "available",
        customers: [],
        note: ""
      },
      {
        id: genId(),
        name: "Phòng 04",
        type: "Standard",
        capacity: 6,
        price: 100000,
        status: "using",
        customers: [{ name: "Trần Thị B", start: todayTimeString("15:00") }],
        note: ""
      },
      {
        id: genId(),
        name: "Phòng 05",
        type: "Couple",
        capacity: 2,
        price: 80000,
        status: "maintenance",
        customers: [],
        note: ""
      }
    ];
    save();
  }

  function todayTimeString(hhmm) {
    // optional: if hhmm provided, use that; else use current time
    if (hhmm) {
      return hhmm;
    }
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function formatCurrency(v) {
    return v.toLocaleString("vi-VN") + "đ";
  }

  // ---------- render UI ----------
  function renderSummary() {
    const totalAvailable = rooms.filter(r => r.status === "available").length;
    const totalUsing = rooms.filter(r => r.status === "using").length;
    const totalMaint = rooms.filter(r => r.status === "maintenance").length;

    sumAvailableEl.textContent = `${totalAvailable} phòng`;
    sumUsingEl.textContent = `${totalUsing} phòng`;
    sumMaintenanceEl.textContent = `${totalMaint} phòng`;
  }

  function statusBadgeClass(status) {
    if (status === "available") return "status-available";
    if (status === "using") return "status-using";
    if (status === "maintenance") return "status-maintenance";
    return "status-available";
  }

  function cardBorderClass(status) {
    if (status === "using") return "red";
    if (status === "maintenance") return "yellow";
    return ""; // green by default from css
  }

  function renderRooms() {
    const keyword = (searchRoom.value || "").toLowerCase().trim();
    const filter = filterStatus.value || "__all";

    roomListEl.innerHTML = "";

    const list = rooms.filter(r => {
      if (filter !== "__all" && r.status !== filter) return false;
      if (!keyword) return true;
      return r.name.toLowerCase().includes(keyword) || (r.type || "").toLowerCase().includes(keyword);
    });

    if (list.length === 0) {
      roomListEl.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#777; padding:30px">Không có phòng nào</div>`;
    }

    list.forEach(r => {
      const card = document.createElement("div");
      card.className = `room-card ${cardBorderClass(r.status)}`;

      const statusText =
        r.status === "available" ? "Còn trống" :
        r.status === "using" ? "Đang sử dụng" :
        r.status === "maintenance" ? "Bảo trì" : r.status;

      card.innerHTML = `
        <div>
          <h3 style="margin:0 0 6px 0">${escapeHtml(r.name)}</h3>
          <div style="margin-bottom:8px; color:#6b21a8">${escapeHtml(r.type || "")}</div>

          <div style="font-size:13px; color:#555">
            <div style="margin-bottom:6px"><i class="fa-solid fa-user"></i> Sức chứa: ${r.capacity} người</div>
            <div style="margin-bottom:6px">Giá: ${formatCurrency(r.price)}/giờ</div>
            ${r.customers && r.customers.length ? `<div style="background:#f3f4f6;padding:8px;border-radius:8px;margin-top:8px">
              KH: ${escapeHtml(r.customers[0].name)}<br>
              <small>⏱ Bắt đầu: ${escapeHtml(r.customers[0].start)}</small>
            </div>` : ""}
          </div>
        </div>

        <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <div><span class="status-badge ${statusBadgeClass(r.status)}">${statusText}</span></div>

          <div class="actions">
            <button class="btn-edit" data-id="${r.id}"><i class="fa-solid fa-pen-to-square"></i> Sửa</button>
            <button class="btn-customer" data-id="${r.id}"><i class="fa-solid fa-user-plus"></i> Khách</button>
            <button class="btn-delete" data-id="${r.id}"><i class="fa-solid fa-trash"></i> Xóa</button>
          </div>
        </div>
      `;

      roomListEl.appendChild(card);
    });

    // bind events
    roomListEl.querySelectorAll(".btn-edit").forEach(b => b.addEventListener("click", onEditRoom));
    roomListEl.querySelectorAll(".btn-delete").forEach(b => b.addEventListener("click", onDeleteRoom));
    roomListEl.querySelectorAll(".btn-customer").forEach(b => b.addEventListener("click", onOpenCustomerModal));
    renderSummary();
  }

  // ---------- actions ----------
  function onAddRoomClick() {
    // open empty modal
    openRoomModal("add");
  }

  function openRoomModal(mode, room = null) {
    roomModal.classList.remove("hidden");
    if (mode === "add") {
      roomModalTitle.textContent = "Thêm phòng";
      roomForm.reset();
      roomIdInput.value = "";
      fieldRoomType.value = "VIP";
      fieldStatus.value = "available";
      fieldCapacity.value = 4;
      fieldPrice.value = 100000;
    } else {
      roomModalTitle.textContent = "Sửa phòng";
      roomIdInput.value = room.id;
      fieldRoomName.value = room.name;
      fieldRoomType.value = room.type;
      fieldCapacity.value = room.capacity;
      fieldPrice.value = room.price;
      fieldStatus.value = room.status;
    }
    setTimeout(() => fieldRoomName.focus(), 80);
  }

  function closeRoomModalFn() {
    roomModal.classList.add("hidden");
  }

  function onEditRoom(e) {
    const id = e.currentTarget.dataset.id;
    const room = rooms.find(r => r.id === id);
    if (room) openRoomModal("edit", room);
  }

  function onDeleteRoom(e) {
    const id = e.currentTarget.dataset.id;
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    if (!confirm(`Bạn có chắc muốn xóa ${room.name}?`)) return;
    rooms = rooms.filter(r => r.id !== id);
    save();
    renderRoomsAndSummary();
  }

  function onOpenCustomerModal(e) {
    const id = e.currentTarget.dataset.id;
    editingRoomId = id;
    // reset customer form
    customerForm.reset();
    fieldStartTime.value = ""; // let user choose
    customerModal.classList.remove("hidden");
    setTimeout(() => fieldCustomerName.focus(), 80);
  }

  function closeCustomerModalFn() {
    customerModal.classList.add("hidden");
    editingRoomId = null;
  }

  // ---------- form handlers ----------
  roomForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const id = roomIdInput.value;
    const data = {
      id: id || genId(),
      name: fieldRoomName.value.trim(),
      type: fieldRoomType.value,
      capacity: Number(fieldCapacity.value),
      price: Number(fieldPrice.value),
      status: fieldStatus.value,
      customers: []
    };

    if (!data.name) {
      alert("Tên phòng không được để trống");
      return;
    }

    if (id) {
      // update existing (keep customers)
      const idx = rooms.findIndex(r => r.id === id);
      if (idx >= 0) {
        data.customers = rooms[idx].customers || [];
        rooms[idx] = data;
      }
    } else {
      // add new
      rooms.push(data);
    }

    save();
    closeRoomModalFn();
    renderRoomsAndSummary();
  });

  cancelRoom.addEventListener("click", (e) => {
    e.preventDefault();
    closeRoomModalFn();
  });

  // customer form submit
  customerForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (!editingRoomId) return;

    const name = fieldCustomerName.value.trim();
    const startTime = fieldStartTime.value || todayTimeString();

    if (!name) {
      alert("Vui lòng nhập tên khách hàng");
      return;
    }

    const room = rooms.find(r => r.id === editingRoomId);
    if (!room) {
      alert("Phòng không tồn tại");
      closeCustomerModalFn();
      return;
    }

    // push customer at front
    room.customers = room.customers || [];
    room.customers.unshift({ name, start: startTime });

    // change status to using
    room.status = "using";

    save();
    closeCustomerModalFn();
    renderRoomsAndSummary();
  });

  cancelCustomer.addEventListener("click", (e) => {
    e.preventDefault();
    closeCustomerModalFn();
  });

  // ---------- helpers ----------
  function renderRoomsAndSummary() {
    renderRooms();
    renderSummary();
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // ---------- search & filter ----------
  searchRoom.addEventListener("input", () => {
    renderRooms();
  });

  filterStatus.addEventListener("change", () => {
    renderRooms();
  });

  // ---------- modal close buttons ----------
  closeRoomModal.addEventListener("click", closeRoomModalFn);
  closeCustomerModal.addEventListener("click", closeCustomerModalFn);

  // ---------- initial bind ----------
  addRoomBtn.addEventListener("click", onAddRoomClick);

  // ---------- init ----------
  function init() {
    load();
    renderRoomsAndSummary();
  }

  init();

})();
