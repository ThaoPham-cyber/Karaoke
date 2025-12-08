document.addEventListener("DOMContentLoaded", () => {
    loadData(data);
    setupSearch();
    setupFilter();
    pushToStatistics();   // kết nối thống kê
});

// ------------------ Dữ liệu Demo --------------------
const data = [
    {
        id: "HD001234",
        name: "Nguyễn Văn A",
        room: "VIP 01",
        start: "2025-01-12 14:30",
        end: "2025-01-12 17:30",
        roomPrice: 600000,
        servicePrice: 150000,
        status: "paid"
    },
    {
        id: "HD001235",
        name: "Trần Thị B",
        room: "05",
        start: "2025-01-13 15:00",
        end: "2025-01-13 18:00",
        roomPrice: 300000,
        servicePrice: 80000,
        status: "paid"
    },
    {
        id: "HD001236",
        name: "Lê Văn C",
        room: "03",
        start: "2025-01-13 13:00",
        end: "2025-01-13 15:30",
        roomPrice: 250000,
        servicePrice: 50000,
        status: "pending"
    }
];

// ------------------ Render Table --------------------
function loadData(list) {
    const body = document.getElementById("invoiceBody");
    body.innerHTML = "";

    list.forEach(item => {
        const total = item.roomPrice + item.servicePrice;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color:#a000ff; font-weight:600">${item.id}</td>
            <td>${item.name}</td>
            <td>Phòng ${item.room}</td>
            <td>${formatTime(item.start)}<br>→ ${formatTime(item.end)}</td>
            <td>${formatMoney(item.roomPrice)}</td>
            <td>${formatMoney(item.servicePrice)}</td>
            <td>${formatMoney(total)}</td>
            <td>
                <span class="${item.status === "paid" ? "status-paid" : "status-pending"}">
                    ${item.status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                </span>
            </td>
            <td class="action-icons">
                <i class="fa fa-eye view"></i>
                <i class="fa fa-download download"></i>
            </td>
        `;
        body.appendChild(tr);
    });
}

// ----- Format -----
function formatMoney(num) {
    return num.toLocaleString("vi-VN") + "đ";
}

function formatTime(str) {
    const d = new Date(str);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
           " " +
           d.toLocaleDateString("vi-VN");
}

// ------------------ Search --------------------
function setupSearch() {
    document.getElementById("searchInput").addEventListener("input", e => {
        const t = e.target.value.toLowerCase();

        const filtered = data.filter(x =>
            x.id.toLowerCase().includes(t) ||
            x.name.toLowerCase().includes(t) ||
            x.room.toLowerCase().includes(t)
        );
        loadData(filtered);
    });
}

// ------------------ Filter --------------------
function setupFilter() {
    document.getElementById("statusFilter").addEventListener("change", e => {
        if (e.target.value === "all") loadData(data);
        else loadData(data.filter(x => x.status === e.target.value));
    });
}

// ------------------ KẾT NỐI THỐNG KÊ --------------------
function pushToStatistics() {
    const revenue = {};

    data.forEach(i => {
        const day = i.start.split(" ")[0]; // yyyy-MM-dd
        const total = i.roomPrice + i.servicePrice;

        if (!revenue[day]) revenue[day] = 0;
        revenue[day] += total;
    });

    // lưu sang Statistics.js
    localStorage.setItem("revenueData", JSON.stringify(revenue));
}
