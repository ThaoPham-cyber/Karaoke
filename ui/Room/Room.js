// ==========================
// ROOM.JS - QUẢN LÝ PHÒNG
// ==========================

const LOCAL_STORAGE_KEY = "karaokeRoomData";

let roomContainer;
let roomDialog, selectRoomDialog;
let dialogTitle, roomNameInput, roomTypeSelect, roomPriceInput;
let btnConfirmAction, btnCancelDialog;
let selectDialogTitle, roomSelectToDeleteEdit, btnConfirmSelect, btnCancelSelect;
let btnAddRoom, btnEditRoom, btnDeleteRoom;

let allRoomsData = [];
let nextRoomId = 1;
let currentAction = "";
let roomToEditId = null;

// Dữ liệu mẫu khi chưa có localStorage
const defaultRoomsData = [
  { id: 1, name: "Phòng 101", status: "normal", price: 50000 },
  { id: 2, name: "Phòng 102", status: "inuse", price: 80000, currentCost: "350,000 VNĐ", duration: "4h 30m" },
  { id: 3, name: "Phòng 103", status: "vip", price: 120000 },
  { id: 4, name: "Phòng 104", status: "booked", price: 100000, booker: "Nguyễn Văn A" },
  { id: 5, name: "Phòng 105", status: "repair", price: 50000 },
  { id: 6, name: "Phòng 106", status: "normal", price: 50000 },
];

// ==========================
// HÀM HỖ TRỢ
// ==========================
function getStatusLabel(status) {
  switch (status) {
    case "normal": return "Phòng trống";
    case "vip": return "Phòng VIP";
    case "inuse": return "Đang sử dụng";
    case "booked": return "Đặt trước";
    case "repair": return "Đang sửa chữa";
    default: return "Không xác định";
  }
}

// ==========================
// LOAD & SAVE LOCALSTORAGE
// ==========================
function loadRoomsData() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      allRoomsData = parsed.rooms || [];
      nextRoomId = parsed.nextId || (allRoomsData.length + 1);
    } catch {
      allRoomsData = [...defaultRoomsData];
      nextRoomId = defaultRoomsData.length + 1;
    }
  } else {
    allRoomsData = [...defaultRoomsData];
    nextRoomId = defaultRoomsData.length + 1;
    saveRoomsData();
  }
}

function saveRoomsData() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ rooms: allRoomsData, nextId: nextRoomId }));
}

// ==========================
// HIỂN THỊ DANH SÁCH PHÒNG
// ==========================
function renderRooms() {
  if (!roomContainer) return;
  roomContainer.innerHTML = "";

  allRoomsData.forEach(room => {
    const card = document.createElement("div");
    card.className = `room-card ${room.status}`;
    card.dataset.id = room.id;

    let content = `<div class="room-name">${room.name}</div>`;

    switch (room.status) {
      case "inuse":
        content += `
          <div class="room-detail-info">
            <p><i class="fa-solid fa-microphone"></i> Đang hát: ${room.duration || "0h 0m"}</p>
            <p><i class="fa-solid fa-money-bill-wave"></i> Tạm tính: ${room.currentCost || "0 VNĐ"}</p>
          </div>`;
        break;

      case "booked":
        content += `<div class="room-detail-info">
            <p><i class="fa-solid fa-user-check"></i> Đặt bởi: ${room.booker || "Không rõ"}</p>
          </div>`;
        break;

      default:
        content += `<div class="room-status-text">${getStatusLabel(room.status)}</div>`;
        break;
    }

    card.innerHTML = content;

    // ✅ Lưu ID phòng & điều hướng đúng trang
    card.addEventListener("click", () => {
      localStorage.setItem("selectedRoomId", room.id);

      let targetPage = "";
      const targetFolder = "Room/CardRoom";

      if (room.status === "normal" || room.status === "vip") targetPage = "RoomBooking";
      else if (room.status === "inuse") targetPage = "RoomDetail";
      else if (room.status === "booked") targetPage = "RoomBookingOnline";
      else return alert(`Phòng ${room.name} đang ${getStatusLabel(room.status)}, không thể mở.`);

      if (window.loadContentPage) {
        window.loadContentPage(targetPage, targetFolder);
      } else if (window.parent && window.parent.loadContentPage) {
        window.parent.loadContentPage(targetPage, targetFolder);
      } else {
        alert("Không thể tải trang chi tiết phòng.");
      }
    });

    roomContainer.appendChild(card);
  });
}

// ==========================
// CÁC HỘP THOẠI & NÚT CHỨC NĂNG
// ==========================
function populateRoomSelect(selectElement) {
  selectElement.innerHTML = "";
  allRoomsData.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = `${r.name} (${getStatusLabel(r.status)})`;
    selectElement.appendChild(opt);
  });
}

// ==========================
// KHỞI TẠO TRANG
// ==========================
function initRoomPage() {
  // Gán phần tử
  roomContainer = document.getElementById("roomContainer");
  roomDialog = document.getElementById("roomDialog");
  selectRoomDialog = document.getElementById("selectRoomDialog");
  dialogTitle = document.getElementById("dialogTitle");
  roomNameInput = document.getElementById("roomNameInput");
  roomTypeSelect = document.getElementById("roomType");
  roomPriceInput = document.getElementById("roomPriceInput");
  btnConfirmAction = document.getElementById("btnConfirmAction");
  btnCancelDialog = document.getElementById("btnCancelDialog");
  selectDialogTitle = document.getElementById("selectDialogTitle");
  roomSelectToDeleteEdit = document.getElementById("roomSelectToDeleteEdit");
  btnConfirmSelect = document.getElementById("btnConfirmSelect");
  btnCancelSelect = document.getElementById("btnCancelSelect");
  btnAddRoom = document.getElementById("btnAddRoom");
  btnEditRoom = document.getElementById("btnEditRoom");
  btnDeleteRoom = document.getElementById("btnDeleteRoom");

  // Tải dữ liệu
  loadRoomsData();
  renderRooms();

  // ===== THÊM PHÒNG =====
  btnAddRoom.onclick = () => {
    currentAction = "add";
    dialogTitle.textContent = "Thêm phòng mới";
    roomNameInput.value = `Phòng ${nextRoomId}`;
    roomTypeSelect.value = "normal";
    roomPriceInput.value = 50000;
    roomDialog.classList.remove("hidden");
  };

  // ===== SỬA PHÒNG =====
  btnEditRoom.onclick = () => {
    currentAction = "edit";
    selectDialogTitle.textContent = "Chọn phòng để sửa";
    populateRoomSelect(roomSelectToDeleteEdit);
    selectRoomDialog.classList.remove("hidden");
  };

  // ===== XÓA PHÒNG =====
  btnDeleteRoom.onclick = () => {
    currentAction = "delete";
    selectDialogTitle.textContent = "Chọn phòng để xóa";
    populateRoomSelect(roomSelectToDeleteEdit);
    selectRoomDialog.classList.remove("hidden");
  };

  // ===== NÚT HỦY =====
  btnCancelDialog.onclick = () => roomDialog.classList.add("hidden");
  btnCancelSelect.onclick = () => selectRoomDialog.classList.add("hidden");

  // ===== XÁC NHẬN THÊM / SỬA =====
  btnConfirmAction.onclick = () => {
    const name = roomNameInput.value.trim();
    const status = roomTypeSelect.value;
    const price = parseInt(roomPriceInput.value) || 0;

    if (!name) return alert("Tên phòng không được để trống!");

    if (currentAction === "add") {
      allRoomsData.push({ id: nextRoomId++, name, status, price });
    } else if (currentAction === "edit" && roomToEditId) {
      const room = allRoomsData.find(r => r.id === roomToEditId);
      if (room) {
        room.name = name;
        room.status = status;
        room.price = price;
      }
    }

    saveRoomsData();
    roomDialog.classList.add("hidden");
    renderRooms();
  };

  // ===== XÁC NHẬN XÓA / CHỌN PHÒNG =====
  btnConfirmSelect.onclick = () => {
    const roomId = parseInt(roomSelectToDeleteEdit.value);
    selectRoomDialog.classList.add("hidden");

    if (currentAction === "delete") {
      const room = allRoomsData.find(r => r.id === roomId);
      if (!room) return alert("Không tìm thấy phòng để xóa!");
      if (confirm(`Bạn có chắc muốn xóa ${room.name}?`)) {
        allRoomsData = allRoomsData.filter(r => r.id !== roomId);
        saveRoomsData();
        renderRooms();
        alert("Đã xóa phòng thành công!");
      }
    } else if (currentAction === "edit") {
      const room = allRoomsData.find(r => r.id === roomId);
      if (!room) return;
      roomToEditId = roomId;
      dialogTitle.textContent = `Sửa ${room.name}`;
      roomNameInput.value = room.name;
      roomTypeSelect.value = room.status;
      roomPriceInput.value = room.price;
      roomDialog.classList.remove("hidden");
    }
  };
}

// Gắn hàm toàn cục
window.initRoomPage = initRoomPage;
