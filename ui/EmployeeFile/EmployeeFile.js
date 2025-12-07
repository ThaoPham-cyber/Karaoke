let employeeList = [
    {
        id: 1,
        name: "Nguyễn Thị X",
        position: "Quản lý",
        phone: "0901111111",
        email: "quanly@karaoke.com",
        salary: 15000000,
        date: "2022-01-01",
        status: "Đang làm"
    },
    {
        id: 2,
        name: "Trần Văn Y",
        position: "Thu ngân",
        phone: "0902222222",
        email: "thungan1@karaoke.com",
        salary: 8000000,
        date: "2023-03-15",
        status: "Đang làm"
    },
    {
        id: 3,
        name: "Lê Thị Z",
        position: "Phục vụ",
        phone: "0903333333",
        email: "phucvu1@karaoke.com",
        salary: 6000000,
        date: "2023-06-01",
        status: "Đang làm"
    }
];

let editingId = null;

// Load danh sách
function loadEmployees() {
    const tbody = document.getElementById("employeeBody");
    const search = document.getElementById("searchInput").value.toLowerCase();
    const filter = document.getElementById("filterPosition").value;

    tbody.innerHTML = "";

    employeeList
        .filter(emp => emp.name.toLowerCase().includes(search))
        .filter(emp => filter === "all" ? true : emp.position === filter)
        .forEach(emp => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${emp.name}</td>
                <td><span class="badge-position">${emp.position}</span></td>
                <td>
                    <div><i class="fa-solid fa-phone"></i> ${emp.phone}</div>
                    <div><i class="fa-solid fa-envelope"></i> ${emp.email}</div>
                </td>
                <td>${emp.salary.toLocaleString()}đ</td>
                <td>${formatDate(emp.date)}</td>
                <td>
                    <span class="${emp.status === 'Đang làm' ? 'badge-active' : 'badge-inactive'}">
                        ${emp.status}
                    </span>
                </td>
                <td>
                    <i class="fa-solid fa-pen action-btn action-edit" onclick="openEditModal(${emp.id})"></i>
                    <i class="fa-solid fa-trash action-btn action-delete" onclick="deleteEmployee(${emp.id})"></i>
                </td>
            `;

            tbody.appendChild(tr);
        });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/* ============================
        MODAL CONTROL
============================ */

function openAddModal() {
    editingId = null;

    document.getElementById("modalTitle").innerText = "Thêm nhân viên";

    document.getElementById("nameInput").value = "";
    document.getElementById("positionInput").value = "Quản lý";
    document.getElementById("phoneInput").value = "";
    document.getElementById("emailInput").value = "";
    document.getElementById("salaryInput").value = "";
    document.getElementById("dateInput").value = "";
    document.getElementById("statusInput").value = "Đang làm";

    document.getElementById("employeeModal").style.display = "flex";
}

function openEditModal(id) {
    editingId = id;
    const emp = employeeList.find(e => e.id === id);

    document.getElementById("modalTitle").innerText = "Chỉnh sửa nhân viên";

    document.getElementById("nameInput").value = emp.name;
    document.getElementById("positionInput").value = emp.position;
    document.getElementById("phoneInput").value = emp.phone;
    document.getElementById("emailInput").value = emp.email;
    document.getElementById("salaryInput").value = emp.salary;
    document.getElementById("dateInput").value = emp.date;
    document.getElementById("statusInput").value = emp.status;

    document.getElementById("employeeModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("employeeModal").style.display = "none";
}

/* ============================
        SAVE EMPLOYEE
============================ */

function saveEmployee() {
    const name = document.getElementById("nameInput").value.trim();
    const position = document.getElementById("positionInput").value;
    const phone = document.getElementById("phoneInput").value;
    const email = document.getElementById("emailInput").value;
    const salary = Number(document.getElementById("salaryInput").value);
    const date = document.getElementById("dateInput").value;
    const status = document.getElementById("statusInput").value;

    if (name === "") {
        alert("Tên không được để trống!");
        return;
    }

    if (editingId) {
        // Sửa
        const emp = employeeList.find(e => e.id === editingId);
        emp.name = name;
        emp.position = position;
        emp.phone = phone;
        emp.email = email;
        emp.salary = salary;
        emp.date = date;
        emp.status = status;
    } else {
        // Thêm mới
        employeeList.push({
            id: Date.now(),
            name, position, phone, email, salary, date, status
        });
    }

    closeModal();
    loadEmployees();
}

/* ============================
        DELETE
============================ */

function deleteEmployee(id) {
    if (confirm("Bạn chắc chắn muốn xóa?")) {
        employeeList = employeeList.filter(emp => emp.id !== id);
        loadEmployees();
    }
}

/* ============================
        FILTER & SEARCH
============================ */

document.getElementById("searchInput").addEventListener("input", loadEmployees);
document.getElementById("filterPosition").addEventListener("change", loadEmployees);

/* INIT */
loadEmployees();
