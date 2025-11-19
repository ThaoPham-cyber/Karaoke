// File: ui/Service/Service.js

console.log(">>> Service.js LOADED. Bắt đầu render demo.");

// Demo dữ liệu dịch vụ
let demoServices = [
    { maDV: "DV001", tenDV: "Nước suối", gia: "15,000 VND", dvt: "Chai" },
    { maDV: "DV002", tenDV: "Bia Heineken", gia: "25,000 VND", dvt: "Lon" },
    { maDV: "DV003", tenDV: "Mì xào hải sản", gia: "60,000 VND", dvt: "Phần" },
    { maDV: "DV004", tenDV: "Trái cây đĩa lớn", gia: "100,000 VND", dvt: "Đĩa" }
];

function renderServiceTable() {
    const tbody = document.getElementById("serviceTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    demoServices.forEach(sv => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${sv.maDV}</td>
            <td>${sv.tenDV}</td>
            <td>${sv.gia}</td>
            <td>${sv.dvt}</td>
        `;
        tbody.appendChild(tr);
    });
}

renderServiceTable();