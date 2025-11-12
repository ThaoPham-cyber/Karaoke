// ======================================================
// 📁 File: ui/Room/CardRoom/RoomDetail.js
// ======================================================

let currentRoomId = null;
let currentRoom = null;

document.addEventListener("DOMContentLoaded", () => {
    initRoomDetailPage();
});

// ===========================================
// 🚀 KHỞI TẠO TRANG CHI TIẾT PHÒNG
// ===========================================
function initRoomDetailPage() {
    currentRoomId = localStorage.getItem('selectedRoomId');
    if (!currentRoomId) {
        alert("Không tìm thấy ID phòng được chọn!");
        window.loadContentPage('Room', 'Room');
        return;
    }

    const data = localStorage.getItem('karaokeRoomData');
    if (!data) {
        alert("Không có dữ liệu trong hệ thống.");
        window.loadContentPage('Room', 'Room');
        return;
    }

    const parsed = JSON.parse(data);
    currentRoom = parsed.rooms.find(r => r.id === parseInt(currentRoomId));
    if (!currentRoom) {
        alert("Không tìm thấy thông tin phòng!");
        window.loadContentPage('Room', 'Room');
        return;
    }

    // Gán dữ liệu vào input
    document.getElementById("detailRoomTitle").textContent = `Chi tiết ${currentRoom.name}`;
    document.getElementById("roomName").value = currentRoom.name;
    document.getElementById("bookerName").value = currentRoom.booker || "";
    document.getElementById("bookerPhone").value = currentRoom.phone || "";
    document.getElementById("bookingDate").value = currentRoom.bookingDate || "";
    document.getElementById("startTime").value = currentRoom.startTime || "";
    document.getElementById("endTime").value = currentRoom.endTime || "";
    document.getElementById("customerQuantity").value = currentRoom.quantity || 1;
    document.getElementById("deposit").value = currentRoom.deposit || 0;

    // Nút sự kiện
    document.getElementById("btnSaveChanges").addEventListener("click", handleSaveChanges);
    document.getElementById("btnReturnRoom").addEventListener("click", handleReturnRoom);
    document.getElementById("btnBackToRoom").addEventListener("click", () => {
        window.loadContentPage('Room', 'Room');
    });
}

// ===========================================
// 💾 Lưu thay đổi (cập nhật thông tin đặt phòng)
// ===========================================
function handleSaveChanges() {
    const data = JSON.parse(localStorage.getItem("karaokeRoomData"));
    const index = data.rooms.findIndex(r => r.id === currentRoom.id);

    if (index === -1) {
        alert("Không thể lưu: Phòng không tồn tại!");
        return;
    }

    // Lấy dữ liệu từ input
    data.rooms[index].booker = document.getElementById("bookerName").value.trim();
    data.rooms[index].phone = document.getElementById("bookerPhone").value.trim();
    data.rooms[index].bookingDate = document.getElementById("bookingDate").value;
    data.rooms[index].startTime = document.getElementById("startTime").value;
    data.rooms[index].endTime = document.getElementById("endTime").value;
    data.rooms[index].quantity = document.getElementById("customerQuantity").value;
    data.rooms[index].deposit = document.getElementById("deposit").value;

    localStorage.setItem("karaokeRoomData", JSON.stringify(data));
    alert("✅ Đã lưu thay đổi thông tin phòng!");
}

// ===========================================
// 🏁 Trả phòng (đặt về trạng thái 'trống')
// ===========================================
function handleReturnRoom() {
    if (!confirm(`Xác nhận TRẢ PHÒNG ${currentRoom.name}?`)) return;

    const data = JSON.parse(localStorage.getItem("karaokeRoomData"));
    const index = data.rooms.findIndex(r => r.id === currentRoom.id);

    if (index !== -1) {
        data.rooms[index].status = "normal";
        data.rooms[index].booker = "";
        data.rooms[index].phone = "";
        data.rooms[index].startTime = "";
        data.rooms[index].endTime = "";
        data.rooms[index].bookingDate = "";
        data.rooms[index].quantity = 0;
        data.rooms[index].deposit = 0;

        localStorage.setItem("karaokeRoomData", JSON.stringify(data));
        alert(`🏁 Phòng ${currentRoom.name} đã được TRẢ và sẵn sàng đón khách mới.`);
        window.loadContentPage("Room", "Room");
    }
}
