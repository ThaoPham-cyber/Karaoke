let roomCount = 4; // đã có 4 phòng mặc định

const btnAddRoom = document.getElementById("btnAddRoom");
const dialog = document.getElementById("addRoomDialog");
const btnConfirmAdd = document.getElementById("btnConfirmAdd");
const btnCancelAdd = document.getElementById("btnCancelAdd");
const roomContainer = document.getElementById("roomContainer");
const roomTypeSelect = document.getElementById("roomType");

// Mở hộp thoại thêm phòng
btnAddRoom.addEventListener("click", () => {
  dialog.classList.remove("hidden");
});

// Hủy thêm
btnCancelAdd.addEventListener("click", () => {
  dialog.classList.add("hidden");
});

// Xác nhận thêm phòng
// Xác nhận thêm phòng
btnConfirmAdd.addEventListener("click", () => {
  const type = roomTypeSelect.value;
  roomCount++;

  const div = document.createElement("div");
  div.className = `room-card ${type}`;

  // Gán nhãn hiển thị theo loại phòng
  let label = "";
  if (type === "vip") label = "VIP";
  else if (type === "repair") label = "Đang sửa chữa";
  else if (type === "booked") label = "Đã được đặt";
  else label = "Thường";

  div.textContent = `Phòng ${roomCount} (${label})`;
  roomContainer.appendChild(div);

  dialog.classList.add("hidden");
});
