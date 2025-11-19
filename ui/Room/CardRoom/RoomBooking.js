// ==========================
// RoomBooking.js
// ==========================

let currentRoomId = null;
let currentRoom = null;
let roomNameElement;
let timeWarningElement;
let btnConfirmBooking;

// === KHỞI TẠO TRANG ===
function initRoomBookingPage() {
  // 1️⃣ Lấy ID phòng đang chọn
  currentRoomId = localStorage.getItem("selectedRoomId");
  if (!currentRoomId) {
    alert("⚠️ Không tìm thấy ID phòng được chọn.");
    window.loadContentPage?.("Room", "Room");
    return;
  }

  // 2️⃣ Lấy dữ liệu phòng từ Local Storage
  const data = JSON.parse(localStorage.getItem("karaokeRoomData")) || { rooms: [], nextId: 1 };
  currentRoom = data.rooms.find((r) => r.id === parseInt(currentRoomId));

  if (!currentRoom) {
    alert("⚠️ Không tìm thấy dữ liệu cho phòng này.");
    window.loadContentPage?.("Room", "Room");
    return;
  }

  // 3️⃣ Hiển thị tên phòng trên tiêu đề
  roomNameElement = document.getElementById("currentRoomName");
  timeWarningElement = document.getElementById("timeWarning");
  btnConfirmBooking = document.getElementById("btnConfirmBooking");
  roomNameElement.textContent = currentRoom.name;

  // 4️⃣ Thiết lập ngày/giờ mặc định
  const today = new Date();
  const dateInput = document.getElementById("startDate");
  const startTimeInput = document.getElementById("startTime");

  dateInput.value = today.toISOString().split("T")[0];
  startTimeInput.value = `${String(today.getHours() + 1).padStart(2, "0")}:00`;

  // 5️⃣ Gán sự kiện
  btnConfirmBooking.addEventListener("click", handleConfirmBooking);
  document.getElementById("btnCancelBooking").addEventListener("click", () => {
    if (confirm("Bạn có chắc muốn hủy đặt phòng này và quay lại danh sách phòng?")) {
      window.loadContentPage?.("Room", "Room");
    }
  });

  document.getElementById("startTime").addEventListener("change", validateTime);
  document.getElementById("endTime").addEventListener("change", validateTime);
}

// === KIỂM TRA THỜI GIAN ===
function validateTime() {
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;

  if (!start || !end) {
    timeWarningElement.textContent = "";
    return false;
  }

  if (end <= start) {
    timeWarningElement.textContent = "⚠️ Giờ kết thúc phải lớn hơn giờ bắt đầu!";
    btnConfirmBooking.disabled = true;
    return false;
  }

  timeWarningElement.textContent = "";
  btnConfirmBooking.disabled = false;
  return true;
}

// === XỬ LÝ XÁC NHẬN ĐẶT PHÒNG ===
function handleConfirmBooking() {
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("phoneNumber").value.trim();
  const date = document.getElementById("startDate").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const quantity = document.getElementById("customerQuantity").value;
  const deposit = document.getElementById("deposit").value;

  // 🔍 Kiểm tra nhập liệu
  if (!name || !phone || !date || !startTime || !endTime) {
    alert("⚠️ Vui lòng nhập đầy đủ các trường bắt buộc (*)");
    return;
  }

  if (!validateTime()) {
    alert("⚠️ Giờ kết thúc phải lớn hơn giờ bắt đầu!");
    return;
  }

  // ✅ Xác nhận hành động
  if (!confirm(`Xác nhận mở phòng ${currentRoom.name} cho khách hàng ${name}?`)) {
    return;
  }

  // === LƯU DỮ LIỆU BOOKING ===
  const allData = JSON.parse(localStorage.getItem("karaokeRoomData")) || { rooms: [], nextId: 1 };
  const roomIndex = allData.rooms.findIndex((r) => r.id === parseInt(currentRoomId));

  if (roomIndex !== -1) {
    allData.rooms[roomIndex].status = "inuse";
    allData.rooms[roomIndex].booker = name;
    allData.rooms[roomIndex].booking = {
      customerName: name,
      phone,
      date,
      startTime,
      endTime,
      quantity,
      deposit,
      total: 0, // Tổng tiền (tính trong RoomDetail)
    };
  }

  // Lưu vào localStorage
  localStorage.setItem("karaokeRoomData", JSON.stringify(allData));

  // Ghi thêm log booking riêng (nếu cần thống kê)
  const allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  allBookings.push({
    roomId: currentRoom.id,
    roomName: currentRoom.name,
    name,
    phone,
    date,
    startTime,
    endTime,
    quantity,
    deposit,
    status: "inuse",
  });
  localStorage.setItem("bookings", JSON.stringify(allBookings));

  alert(`✅ Phòng ${currentRoom.name} đã được mở cho khách hàng ${name}!`);

  // Quay lại danh sách phòng
  if (window.loadContentPage) window.loadContentPage("Room", "Room");
  else if (window.parent && window.parent.loadContentPage)
    window.parent.loadContentPage("Room", "Room");
}

// === EXPORT ===
window.initRoomBookingPage = initRoomBookingPage;
