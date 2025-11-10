let allRoomsData = [
  { id: 1, name: "Phòng 101", status: "normal", price: 50000 },
  { id: 2, name: "Phòng 102", status: "vip", price: 80000 },
  { id: 3, name: "Phòng 103", status: "booked", price: 100000 },
  { id: 4, name: "Phòng 104", status: "repair", price: 0 },
];
let nextRoomId = 5;
let currentAction = '';
let roomToEditId = null;

function getStatusLabel(status) {
  switch (status) {
    case 'normal': return 'Sẵn sàng đón khách';
    case 'vip': return 'VIP Sẵn sàng';
    case 'booked': return 'Đặt trước';
    case 'repair': return 'Đang sửa chữa';
    default: return 'Không rõ';
  }
}

function renderRooms() {
  const container = document.getElementById("roomContainer");
  container.innerHTML = "";
  allRoomsData.forEach(room => {
    const div = document.createElement("div");
    div.className = `room-card ${room.status}`;
    div.innerHTML = `<strong>${room.name}</strong><br>${getStatusLabel(room.status)}<br><small>${room.price}đ/h</small>`;
    div.addEventListener("click", () => handleRoomClick(room));
    container.appendChild(div);
  });
}

function handleRoomClick(room) {
  let targetPage = "";
  let targetFolder = "";
  if (room.status === "normal" || room.status === "vip") {
    targetPage = "RoomBooking";
    targetFolder = "RoomBooking";
  } else if (room.status === "booked") {
    targetPage = "RoomBookingOnline";
    targetFolder = "RoomBookingOnline";
  } else if (room.status === "inuse") {
    targetPage = "RoomDetail";
    targetFolder = "Room";
  } else {
    alert(`Phòng ${room.name} đang ${getStatusLabel(room.status)}, không thể mở.`);
    return;
  }

  // 🔹 Gọi về trang cha (UI.html)
  if (window.parent && window.parent.loadContentPage) {
    window.parent.loadContentPage(targetPage, targetFolder);
  } else {
    console.error("⚠️ Không tìm thấy hàm loadContentPage trong UI.html");
  }
}

function openSelectDialog(action) {
  currentAction = action;
  const dialog = document.getElementById("selectRoomDialog");
  const select = document.getElementById("roomSelectToDeleteEdit");
  const title = document.getElementById("selectDialogTitle");
  select.innerHTML = "";
  allRoomsData.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = `${r.name} - ${getStatusLabel(r.status)}`;
    select.appendChild(opt);
  });
  title.textContent = action === 'delete' ? "Chọn phòng để Xóa" : "Chọn phòng để Sửa";
  dialog.classList.remove("hidden");
}

function initRoomPage() {
  const btnAdd = document.getElementById("btnAddRoom");
  const btnEdit = document.getElementById("btnEditRoom");
  const btnDelete = document.getElementById("btnDeleteRoom");
  const btnConfirmAction = document.getElementById("btnConfirmAction");
  const btnCancelDialog = document.getElementById("btnCancelDialog");
  const btnConfirmSelect = document.getElementById("btnConfirmSelect");
  const btnCancelSelect = document.getElementById("btnCancelSelect");
  const dialog = document.getElementById("roomDialog");
  const selectDialog = document.getElementById("selectRoomDialog");

  renderRooms();

  btnAdd.onclick = () => {
    currentAction = 'add';
    document.getElementById("dialogTitle").textContent = "Thêm phòng mới";
    document.getElementById("roomNameInput").value = `Phòng ${nextRoomId}`;
    dialog.classList.remove("hidden");
  };

  btnEdit.onclick = () => openSelectDialog('edit');
  btnDelete.onclick = () => openSelectDialog('delete');

  btnCancelDialog.onclick = () => dialog.classList.add("hidden");
  btnCancelSelect.onclick = () => selectDialog.classList.add("hidden");

  btnConfirmAction.onclick = () => {
    const name = document.getElementById("roomNameInput").value.trim();
    const type = document.getElementById("roomType").value;
    const price = parseInt(document.getElementById("roomPriceInput").value) || 0;

    if (!name) return alert("Tên phòng không được trống!");

    if (currentAction === 'add') {
      allRoomsData.push({ id: nextRoomId++, name, status: type, price });
    } else if (currentAction === 'edit' && roomToEditId != null) {
      const r = allRoomsData.find(r => r.id === roomToEditId);
      if (r) {
        r.name = name;
        r.status = type;
        r.price = price;
      }
    }
    dialog.classList.add("hidden");
    renderRooms();
  };

  btnConfirmSelect.onclick = () => {
    const id = parseInt(document.getElementById("roomSelectToDeleteEdit").value);
    selectDialog.classList.add("hidden");

    if (currentAction === 'delete') {
      allRoomsData = allRoomsData.filter(r => r.id !== id);
      renderRooms();
      alert("Đã xóa phòng!");
    } else if (currentAction === 'edit') {
      const r = allRoomsData.find(r => r.id === id);
      if (r) {
        roomToEditId = id;
        document.getElementById("dialogTitle").textContent = `Sửa ${r.name}`;
        document.getElementById("roomNameInput").value = r.name;
        document.getElementById("roomType").value = r.status;
        document.getElementById("roomPriceInput").value = r.price;
        dialog.classList.remove("hidden");
      }
    }
  };
}

document.addEventListener("DOMContentLoaded", initRoomPage);
