// File: ui/Room/Room.js

// Lấy các phần tử DOM (Đảm bảo việc lấy DOM diễn ra bên trong initRoomPage)
let roomContainer, roomDialog, selectRoomDialog;
let dialogTitle, roomNameInput, roomTypeSelect, roomPriceDiv, roomPriceInput, btnConfirmAction, btnCancelDialog;
let selectDialogTitle, roomSelectToDeleteEdit, btnConfirmSelect, btnCancelSelect;
let btnAddRoom, btnEditRoom, btnDeleteRoom;


// --- TRẠNG THÁI VÀ DỮ LIỆU BỀN VỮNG ---
const LOCAL_STORAGE_KEY = 'karaokeRoomData';
const defaultRoomsData = [
    { id: 1, name: "Phòng 101", status: "normal", price: 50000 },
    { id: 2, name: "Phòng 102", status: "inuse", price: 80000, currentCost: "350,000 VNĐ", duration: "4h 30m" },
    { id: 3, name: "Phòng 103", status: "vip", price: 120000 },
    { id: 4, name: "Phòng 104", status: "booked", price: 100000, booker: "Nguyễn Văn A" },
    { id: 5, name: "Phòng 105", status: "repair", price: 50000 },
    { id: 6, name: "Phòng 106", status: "normal", price: 50000 },
];

let allRoomsData = [];
let nextRoomId = 1;
let currentAction = ''; 
let roomToEditId = null;

function loadRoomsData() {
    // console.log("--- Loading data ---");
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            allRoomsData = parsedData.rooms;
            const maxId = allRoomsData.length > 0 ? Math.max(...allRoomsData.map(r => r.id)) : 0;
            nextRoomId = Math.max(parsedData.nextId, maxId + 1); 
        } catch (e) {
            // console.error("Error parsing localStorage, resetting to default.", e);
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
    const dataToSave = {
        rooms: allRoomsData,
        nextId: nextRoomId
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    // console.log("Data saved. Current rooms count:", allRoomsData.length);
}

// --- HÀM RENDER ---
function getStatusLabel(status) {
    switch(status) {
        case 'normal': return 'Sẵn sàng đón khách';
        case 'vip': return 'VIP Sẵn sàng đón khách';
        case 'inuse': return 'Đang Hát';
        case 'booked': return 'Đặt trước';
        case 'repair': return 'Đang sửa chữa';
        default: return 'Không rõ';
    }
}

// ⚠️ FIX LỖI XÓA THẺ KHÔNG CẬP NHẬT: Dùng setTimeout để buộc WebView vẽ lại UI
function renderRooms() {
    if (!roomContainer) return;
    
    // Đẩy việc render vào cuối hàng đợi để đảm bảo mọi thay đổi DOM trước đó được xử lý
    setTimeout(() => {
        // Tải lại dữ liệu lần nữa (Tùy chọn, để đảm bảo đồng bộ hoàn toàn)
        // loadRoomsData(); 
        
        roomContainer.innerHTML = ''; // Xóa sạch nội dung cũ
        
        // console.log("Rendering rooms. Total:", allRoomsData.length);

        allRoomsData.forEach(room => {
            const div = document.createElement("div");
            div.className = `room-card ${room.status}`;
            div.setAttribute('data-id', room.id);

            let contentHTML = `<div class="room-name">${room.name}</div>`;
            
            if (room.status === 'inuse') {
                contentHTML += `
                    <div class="room-detail-info">
                        <p><i class="fa-solid fa-microphone"></i> Đang hát: ${room.duration || '0h 0m'}</p>
                        <p><i class="fa-solid fa-money-bill-wave"></i> Tạm tính: ${room.currentCost || '0 VNĐ'}</p>
                    </div>
                `;
            } else if (room.status === 'booked') {
                contentHTML += `
                    <div class="room-detail-info">
                        <p><i class="fa-solid fa-user-check"></i> Đặt bởi: ${room.booker || 'Không rõ'}</p>
                    </div>
                `;
            } else {
                contentHTML += `<div class="room-status-text">${getStatusLabel(room.status)}</div>`;
            }
            
            div.innerHTML = contentHTML;
            div.addEventListener('click', () => handleRoomCardClick(room));
            roomContainer.appendChild(div);
        });
    }, 0); 
}

function populateRoomSelect(selectElement) {
    selectElement.innerHTML = '';
    // Cho phép thao tác với mọi phòng trừ phòng đang sử dụng (inuse)
    const availableRooms = allRoomsData.filter(r => r.status !== 'inuse'); 

    if (availableRooms.length === 0) {
        const option = document.createElement("option");
        option.textContent = "Không có phòng để thao tác";
        selectElement.appendChild(option);
        if(btnConfirmSelect) {
            btnConfirmSelect.disabled = true;
        }
        return;
    }
    if(btnConfirmSelect) {
        btnConfirmSelect.disabled = false;
    }

    availableRooms.forEach(room => {
        const option = document.createElement("option");
        // Lưu ID phòng dưới dạng string trong value, nhưng ta sẽ dùng parseInt khi đọc
        option.value = room.id; 
        option.textContent = `${room.name} (${getStatusLabel(room.status)})`;
        selectElement.appendChild(option);
    });
}

// --- LOGIC CHUYỂN TRANG ---
function handleRoomCardClick(room) {
    let targetPage = '';
    let targetFolder = '';

    if (room.status === 'normal' || room.status === 'vip') {
        targetPage = 'RoomBooking'; 
        targetFolder = 'RoomBooking';
    } else if (room.status === 'inuse') {
        targetPage = 'RoomDetail'; 
        targetFolder = 'Room';
    } else if (room.status === 'booked') {
        targetPage = 'RoomBookingOnline'; 
        targetFolder = 'RoomBookingOnline';
    } else {
        alert(`Phòng ${room.name} đang ở trạng thái ${getStatusLabel(room.status)}. Không thể thực hiện giao dịch.`);
        return;
    }

    if (window.loadContentPage) {
        window.loadContentPage(targetPage, targetFolder);
    } else {
        console.error("Hàm window.loadContentPage không tồn tại.");
    }
}


// ===========================================
// HÀM KHỞI TẠO CHÍNH (ĐƯỢC GỌI LẠI MỖI LẦN TẢI TRANG)
// ===========================================
function initRoomPage() {
    // 1. Lấy lại tất cả các phần tử DOM mỗi lần hàm chạy
    roomContainer = document.getElementById("roomContainer");
    roomDialog = document.getElementById("roomDialog");
    selectRoomDialog = document.getElementById("selectRoomDialog");

    dialogTitle = document.getElementById("dialogTitle");
    roomNameInput = document.getElementById("roomNameInput");
    roomTypeSelect = document.getElementById("roomType");
    roomPriceDiv = document.getElementById("roomPriceDiv");
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

    // 2. Tải dữ liệu và Render
    loadRoomsData();
    renderRooms();

    // 3. Gán lại sự kiện cho tất cả các nút
    
    // Nút Thêm/Sửa/Xóa chính
    btnAddRoom.onclick = () => {
        currentAction = 'add';
        dialogTitle.textContent = "Thêm phòng mới";
        // Đặt tên gợi ý cho phòng mới
        const nextName = `Phòng ${allRoomsData.length + 1}`;
        roomNameInput.value = nextName; 
        
        roomPriceDiv.classList.remove("hidden");
        roomPriceInput.value = 50000;
        roomTypeSelect.value = 'normal';
        roomDialog.classList.remove("hidden");
    };

    btnEditRoom.onclick = () => {
        currentAction = 'edit';
        selectDialogTitle.textContent = "Chọn phòng để SỬA";
        populateRoomSelect(roomSelectToDeleteEdit);
        selectRoomDialog.classList.remove("hidden");
    };

    btnDeleteRoom.onclick = () => {
        currentAction = 'delete';
        selectDialogTitle.textContent = "Chọn phòng để XÓA";
        populateRoomSelect(roomSelectToDeleteEdit);
        selectRoomDialog.classList.remove("hidden");
    };
    
    // Nút Hủy
    btnCancelDialog.onclick = () => roomDialog.classList.add("hidden");
    btnCancelSelect.onclick = () => selectRoomDialog.classList.add("hidden");

    // Nút Xác nhận hành động Thêm/Sửa
    btnConfirmAction.onclick = () => {
        const name = roomNameInput.value.trim();
        const status = roomTypeSelect.value;
        const price = parseInt(roomPriceInput.value) || 0;

        if (!name) {
            alert("Tên phòng không được để trống!");
            return;
        }

        if (currentAction === 'add') {
            allRoomsData.push({
                id: nextRoomId++,
                name: name,
                status: status,
                price: price
            });
        } else if (currentAction === 'edit' && roomToEditId !== null) {
            const roomIndex = allRoomsData.findIndex(r => r.id === roomToEditId);
            if (roomIndex !== -1) {
                allRoomsData[roomIndex].name = name;
                if (status !== 'inuse') { 
                    allRoomsData[roomIndex].status = status;
                }
                allRoomsData[roomIndex].price = price;
            }
        }
        
        saveRoomsData(); 
        roomDialog.classList.add("hidden");
        renderRooms();
    };


    // Nút Xác nhận hành động Xóa/Sửa (Sau khi chọn phòng)
    btnConfirmSelect.onclick = () => {
        // ⚠️ Chuyển đổi giá trị select (string) sang số nguyên
        const roomId = parseInt(roomSelectToDeleteEdit.value); 
        selectRoomDialog.classList.add("hidden");

        if (currentAction === 'delete') {
            const roomToDelete = allRoomsData.find(r => r.id === roomId);
            if (!roomToDelete) {
                 alert("Không tìm thấy phòng để xóa!");
                 return;
            }

            if (confirm(`Bạn có chắc chắn muốn xóa phòng ${roomToDelete.name} không?`)) {
                // Lọc dữ liệu: Tạo mảng mới không bao gồm phòng cần xóa
                allRoomsData = allRoomsData.filter(room => room.id !== roomId);
                
                // Ghi lại dữ liệu mới vào localStorage
                saveRoomsData(); 
                
                // ⚠️ GỌI HÀM RENDER ĐÃ FIX LỖI ẨN THẺ
                renderRooms(); 
                
                alert(`Đã xóa phòng ${roomToDelete.name}!`);
            }
        } else if (currentAction === 'edit') {
            const room = allRoomsData.find(r => r.id === roomId);
            if (room) {
                roomToEditId = roomId;
                dialogTitle.textContent = `Sửa thông tin: ${room.name}`;
                roomNameInput.value = room.name;
                roomTypeSelect.value = room.status;
                roomPriceInput.value = room.price || 0;
                roomPriceDiv.classList.remove("hidden");
                roomDialog.classList.remove("hidden");
            }
        }
    };
}

// Xuất hàm khởi tạo ra ngoài Window để UI.html có thể gọi
window.initRoomPage = initRoomPage;