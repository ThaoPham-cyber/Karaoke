// File: ui/Customer/Customer.js

console.log(">>> Customer.js LOADED. Bắt đầu render demo.");

// Demo dữ liệu khách hàng
let demoCustomers = [
    { maKH: "KH001", tenKH: "Nguyễn Văn A", sdt: "0912345678", diem: 550 },
    { maKH: "KH002", tenKH: "Trần Thị B", sdt: "0909876543", diem: 1200 },
    { maKH: "KH003", tenKH: "Lê Văn C", sdt: "0977112233", diem: 80 }
];

function renderCustomerTable() {
    const tbody = document.getElementById("customerTableBody");
    if (!tbody) {
        console.error("Không tìm thấy tbody#customerTableBody.");
        return;
    }

    tbody.innerHTML = "";

    demoCustomers.forEach(cust => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${cust.maKH}</td>
            <td>${cust.tenKH}</td>
            <td>${cust.sdt}</td>
            <td>${cust.diem} điểm</td>
        `;
        tbody.appendChild(tr);
    });
}

// ⚠️ Gọi hàm render ngay lập tức sau khi script được nạp
renderCustomerTable();