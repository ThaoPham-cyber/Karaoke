// File: ui/Room/CardRoom/RoomBooking.js

let currentRoomId = null;
let currentRoom = null;
let roomNameElement;
let timeWarningElement;
let btnConfirmBooking;

// Hàm khởi tạo, được gọi khi script được nạp (từ UI.html)
function initRoomBookingPage() {
    // 1. Lấy ID phòng từ localStorage
    currentRoomId = localStorage.getItem('selectedRoomId');
    if (!currentRoomId) {
        alert("Lỗi: Không tìm thấy ID phòng được chọn.");
        window.loadContentPage('Room', 'Room'); 
        return;
    }

    // 2. Lấy dữ liệu phòng từ Local Storage (Cần đồng bộ với Room.js)
    const data = localStorage.getItem('karaokeRoomData');
    if (data) {
        const parsedData = JSON.parse(data);
        currentRoom = parsedData.rooms.find(r => r.id === parseInt(currentRoomId));
    }
    
    // Nếu không tìm thấy phòng, quay lại
    if (!currentRoom) {
        alert("Lỗi: Không tìm thấy dữ liệu cho phòng này.");
        window.loadContentPage('Room', 'Room');
        return;
    }

    // 3. Cập nhật DOM
    roomNameElement = document.getElementById('currentRoomName');
    timeWarningElement = document.getElementById('timeWarning');
    btnConfirmBooking = document.getElementById('btnConfirmBooking');
    
    roomNameElement.textContent = currentRoom.name;

    // Thiết lập ngày giờ mặc định
    const today = new Date();
    const dateInput = document.getElementById('startDate');
    const startTimeInput = document.getElementById('startTime');
    
    dateInput.valueAsDate = today;
    
    // Giờ bắt đầu mặc định là giờ hiện tại (làm tròn lên)
    const startHour = today.getHours() + 1;
    startTimeInput.value = `${startHour.toString().padStart(2, '0')}:00`;

    // 4. Gán sự kiện
    btnConfirmBooking.addEventListener('click', handleConfirmBooking);
    document.getElementById('btnCancelBooking').addEventListener('click', () => {
        if (confirm("Bạn có muốn hủy thao tác đặt phòng và quay lại trang Quản lý phòng không?")) {
            window.loadContentPage('Room', 'Room');
        }
    });

    // Theo dõi thay đổi giờ
    document.getElementById('startTime').addEventListener('change', validateTime);
    document.getElementById('endTime').addEventListener('change', validateTime);
}

// Hàm kiểm tra logic thời gian
function validateTime() {
    const startTimeStr = document.getElementById('startTime').value;
    const endTimeStr = document.getElementById('endTime').value;
    
    if (!startTimeStr || !endTimeStr) {
        timeWarningElement.textContent = "";
        return false;
    }
    
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    
    const startTimeInMinutes = startH * 60 + startM;
    const endTimeInMinutes = endH * 60 + endM;

    if (endTimeInMinutes <= startTimeInMinutes) {
        timeWarningElement.textContent = "⚠️ Giờ kết thúc phải lớn hơn giờ bắt đầu.";
        btnConfirmBooking.disabled = true;
        return false;
    }

    timeWarningElement.textContent = "";
    btnConfirmBooking.disabled = false;
    return true;
}

// Hàm xử lý xác nhận đặt phòng
function handleConfirmBooking() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const date = document.getElementById('startDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const quantity = document.getElementById('customerQuantity').value;
    const deposit = document.getElementById('deposit').value;
    
    if (!name || !phone || !date || !startTime || !endTime) {
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc (*).");
        return;
    }
    
    if (!validateTime()) {
        alert("Vui lòng kiểm tra lại thời gian đặt phòng.");
        return;
    }
    
    if (!confirm(`Xác nhận đặt/mở phòng ${currentRoom.name} cho khách hàng ${name} (${phone}) từ ${startTime} đến ${endTime}?`)) {
        return;
    }

    // GỌI HÀM BRIDGE ĐỂ THỰC HIỆN LOGIC LƯU VÀ CẬP NHẬT TRẠNG THÁI PHÒNG
    // ⚠️ LƯU Ý: Nếu đây là đặt phòng trực tiếp, bạn sẽ chuyển trạng thái thành 'inuse'
    // Nếu là đặt trước (future booking), trạng thái là 'booked'

    // Ví dụ: Đặt phòng/Mở phòng trực tiếp (Giả định mở phòng ngay)
    const bookingData = {
        roomId: currentRoom.id,
        name,
        phone,
        startTime,
        endTime,
        quantity,
        deposit,
        date,
        // ... (thêm các trường khác)
    };
    
    // Cập nhật trạng thái phòng trong Local Storage (Giả định là 'inuse')
    const allRoomsData = JSON.parse(localStorage.getItem('karaokeRoomData')).rooms;
    const roomIndex = allRoomsData.findIndex(r => r.id === currentRoom.id);

    if (roomIndex !== -1) {
        allRoomsData[roomIndex].status = 'inuse';
        allRoomsData[roomIndex].booker = name; // Dùng tên khách cho thẻ
        // Lưu lại
        localStorage.setItem('karaokeRoomData', JSON.stringify({ rooms: allRoomsData, nextId: JSON.parse(localStorage.getItem('karaokeRoomData')).nextId }));
    }

    alert(`Phòng ${currentRoom.name} đã được MỞ cho khách hàng ${name}!`);

    // Quay lại trang quản lý phòng và tải lại để hiển thị trạng thái mới
    window.loadContentPage('Room', 'Room');
}

// Export hàm khởi tạo ra ngoài Window để UI.html có thể gọi
window.initRoomBookingPage = initRoomBookingPage;