
let currentRoomId = null;
let currentRoom = null;

document.addEventListener("DOMContentLoaded", () => {
    initRoomBookingPage();
});

function initRoomBookingPage() {
    currentRoomId = localStorage.getItem("selectedRoomId");
    if (!currentRoomId) {
        alert("Không tìm thấy phòng được chọn!");
        window.loadContentPage("Room", "Room");
        return;
    }
    const storageData = localStorage.getItem("karaokeRoomData");
    if (!storageData) {
        alert("Không có dữ liệu phòng trong hệ thống!");
        window.loadContentPage("Room", "Room");
        return;
    }
    const parsedData = JSON.parse(storageData);
    currentRoom = parsedData.rooms.find(r => r.id === parseInt(currentRoomId));

    if (!currentRoom) {
        alert("Phòng này không tồn tại trong dữ liệu!");
        window.loadContentPage("Room", "Room");
        return;
    }
    const titleSpan = document.getElementById("currentRoomName");
    if (titleSpan) {
        titleSpan.textContent = currentRoom.name;
    }
    if (typeof flatpickr !== "undefined") {
        flatpickr("#startDate", {
            dateFormat: "Y-m-d",
            allowInput: true,
            onChange: function (selectedDates, dateStr) {
                document.getElementById("startDate").value = dateStr;
            }
        });
    } else {
        console.warn("⚠️ Flatpickr chưa được tải hoặc không tồn tại!");
    }
    const btnConfirm = document.getElementById("btnConfirmBooking");
    const btnCancel = document.getElementById("btnCancelBooking");

    if (btnConfirm) btnConfirm.addEventListener("click", handleConfirmBooking);
    if (btnCancel) btnCancel.addEventListener("click", handleCancelBooking);
    const today = new Date();
    const dateInput = document.getElementById("startDate");
    const startTimeInput = document.getElementById("startTime");
    const endTimeInput = document.getElementById("endTime");

    if (dateInput) dateInput.valueAsDate = today;
    const startHour = today.getHours() + 1;
    if (startTimeInput) startTimeInput.value = `${String(startHour).padStart(2, "0")}:00`;
    if (endTimeInput) endTimeInput.value = `${String(startHour + 2).padStart(2, "0")}:00`;
}
function handleConfirmBooking() {
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("phoneNumber").value.trim();
    const date = document.getElementById("startDate").value.trim();
    const startTime = document.getElementById("startTime").value.trim();
    const endTime = document.getElementById("endTime").value.trim();
    const quantity = document.getElementById("customerQuantity").value;
    const deposit = document.getElementById("deposit").value;

    if (!name || !phone || !date || !startTime || !endTime) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc!");
        return;
    }

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
        alert("⚠️ Giờ kết thúc phải lớn hơn giờ bắt đầu!");
        return;
    }

    if (!confirm(`Xác nhận mở phòng ${currentRoom.name} cho ${name} từ ${startTime} đến ${endTime}?`)) {
        return;
    }

    const data = JSON.parse(localStorage.getItem("karaokeRoomData"));
    const index = data.rooms.findIndex(r => r.id === parseInt(currentRoomId));
    if (index === -1) {
        alert("Không tìm thấy phòng trong dữ liệu hệ thống!");
        return;
    }

    data.rooms[index] = {
        ...data.rooms[index],
        status: "inuse",
        booker: name,
        phone,
        bookingDate: date,
        startTime,
        endTime,
        quantity,
        deposit
    };
    localStorage.setItem("karaokeRoomData", JSON.stringify(data));

    alert(`✅ Phòng ${data.rooms[index].name} đã được mở cho khách hàng ${name}.`);
    window.loadContentPage("Room", "Room");
}

function handleCancelBooking() {
    if (confirm("Bạn có chắc muốn hủy và quay lại trang Quản lý phòng không?")) {
        window.loadContentPage("Room", "Room");
    }
}
