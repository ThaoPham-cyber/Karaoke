// File: ui/Account/Account.js (ĐÃ SỬA để render ngay lập tức)

console.log(">>> Account.js LOADED. Bắt đầu render demo.");

// Demo dữ liệu
let demoAccounts = [
    { username: "admin", role: "Quản trị viên", status: "Hoạt động" },
    { username: "nv_kara01", role: "Nhân viên", status: "Khóa" },
    { username: "ketoan", role: "Kế toán", status: "Hoạt động" }
];

// Hàm Render bảng
function renderAccountTable() {
    const tbody = document.getElementById("accountTableBody");
    if (!tbody) {
        console.error("Không tìm thấy tbody#accountTableBody. HTML chưa được nạp đủ.");
        return;
    }

    tbody.innerHTML = "";

    demoAccounts.forEach(acc => {
        const tr = document.createElement("tr");
        
        // Tạo class màu cho trạng thái (optional)
        const statusClass = acc.status === 'Khóa' ? 'status-locked' : 'status-active';
        
        tr.innerHTML = `
            <td>${acc.username}</td>
            <td>${acc.role}</td>
            <td class="${statusClass}">${acc.status}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ⚠️ GỌI HÀM RENDER NGAY LẬP TỨC 
// (Vì UI.html đã đảm bảo JS này được nạp sau khi HTML của trang Account được inject)
renderAccountTable();

// ----------------------------------------------------------------------
// Thêm style cho trạng thái vào HEAD để đảm bảo màu hiển thị (Nếu cần)
const style = document.createElement('style');
style.innerHTML = `
    .status-active { color: green; font-weight: bold; }
    .status-locked { color: red; font-weight: bold; }
`;
document.head.appendChild(style);
// ----------------------------------------------------------------------