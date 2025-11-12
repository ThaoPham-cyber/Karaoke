// ======================================================
// 📁 File: ui/Room/CardRoom/RoomBookingOnline.js
// ======================================================

let currentRoomId = null;
let currentRoom = null;

document.addEventListener("DOMContentLoaded", () => {
    initRoomBookingOnlinePage();
});

// ===============================================
// 🚀 KHỞI TẠO TRANG ĐẶT PHÒNG TRƯỚC
// ===============================================
function initRoomBookingOnlinePage() {
    // 1️⃣ Lấy ID phòng được chọn
    currentRoomId = localStorage.getItem('selectedRoomId');
    if (!currentRoomId) {
        alert("Không tìm thấy ID phòng.");
        window.loadContentPage("Room", "Room");
        return;
    }

    // 2️⃣ Lấy dữ liệu phòng từ Local Storage
    const data = localStorage.getItem("karaokeRoomData");
    if (!data) {
        alert("Không có dữ liệu hệ thống!");
        return;
    }

    const parsed = JSON.parse(data);
    currentRoom = parsed.rooms.find(r => r.id === parseInt(currentRoomId));

    if (!currentRoom) {
        alert("Không tìm thấy phòng được chọn.");
        window.loadContentPage("Room", "Room");
        return;
    }

    document.getElementById("currentRoomName").textContent = currentRoom.name;

    // 3️⃣ Khởi tạo Flatpickr cho input ngày
    if (typeof flatpickr !== "undefined") {
        flatpickr("#startDate", {
            dateFormat: "Y-m-d",
            locale: "vn"
        });
    }

    // 4️⃣ Nút Xác nhận
    document.getElementById("btnConfirmBookingOnline").addEventListener("click", handleConfirmBookingOnline);
    // 5️⃣ Nút Hủy
    document.getElementById("btnCancelBookingOnline").addEventListener("click", () => {
        if (confirm("Bạn có chắc muốn hủy và quay lại trang Quản lý phòng?")) {
            window.loadContentPage("Room", "Room");
        }
    });
}

// ===============================================
// 💾 XỬ LÝ ĐẶT PHÒNG TRƯỚC
// ===============================================
function handleConfirmBookingOnline() {
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("phoneNumber").value.trim();
    const date = document.getElementById("startDate").value.trim();
    const startTime = document.getElementById("startTime").value.trim();
    const endTime = document.getElementById("endTime").value.trim();
    const quantity = document.getElementById("customerQuantity").value;
    const deposit = document.getElementById("deposit").value;

    if (!name || !phone || !date || !startTime || !endTime) {
        alert("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
    }

    const data = JSON.parse(localStorage.getItem("karaokeRoomData"));
    const index = data.rooms.findIndex(r => r.id === parseInt(currentRoomId));
    if (index === -1) {
        alert("Không tìm thấy phòng trong cơ sở dữ liệu.");
        return;
    }

    // ✅ Cập nhật dữ liệu phòng
    data.rooms[index] = {
        ...data.rooms[index],
        booker: name,
        phone,
        bookingDate: date,
        startTime,
        endTime,
        quantity,
        deposit,
        status: "booked" // Cập nhật trạng thái
    };

    localStorage.setItem("karaokeRoomData", JSON.stringify(data));

    alert(`✅ Phòng ${data.rooms[index].name} đã được đặt trước cho ${name}.`);
    window.loadContentPage("Room", "Room");
}
