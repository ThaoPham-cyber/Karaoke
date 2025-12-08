let customers = [];
let editIndex = -1;

// ------------------------- LOAD DATA -------------------------
function loadData() {
    const saved = localStorage.getItem("CUSTOMERS");
    if (saved) {
        customers = JSON.parse(saved);
    } else {
        customers = [
            { name: "Nguyễn Văn A", phone: "0901234567", email: "a@gmail.com", type: "VIP", visits: 45, total: 12500000, date: "2023-01-15" },
            { name: "Trần Thị B", phone: "0912345678", email: "b@gmail.com", type: "Standard", visits: 20, total: 5000000, date: "2023-06-20" },
            { name: "Lê Văn C", phone: "0923456789", email: "c@gmail.com", type: "VIP", visits: 60, total: 18000000, date: "2022-11-10" }
        ];
        saveData();
    }
}

function saveData() {
    localStorage.setItem("CUSTOMERS", JSON.stringify(customers));
}

// ------------------------- RENDER TABLE -------------------------
function render() {
    const body = document.getElementById("customerTable");
    const text = document.getElementById("searchInput").value.toLowerCase();
    const type = document.getElementById("filterType").value;

    body.innerHTML = "";

    customers
        .filter(c => 
            (c.name.toLowerCase().includes(text) ||
            c.phone.includes(text) ||
            c.email.toLowerCase().includes(text)) &&

            (type === "all" || c.type === type)
        )
        .forEach((c, i) => {
            body.innerHTML += `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.phone}<br>${c.email}</td>
                    <td><span class="badge ${c.type.toLowerCase()}">${c.type}</span></td>
                    <td>${c.visits}</td>
                    <td>${c.total.toLocaleString()}đ</td>
                    <td>${c.date}</td>
                    <td>
                        <div class="actions">
                            <i class="edit" onclick="openEdit(${i})">✎</i>
                            <i class="delete" onclick="removeCus(${i})">🗑</i>
                        </div>
                    </td>
                </tr>
            `;
        });
}

// ------------------------- POPUP -------------------------
function openAdd() {
    editIndex = -1;
    document.getElementById("popupTitle").innerText = "Thêm khách hàng";
    document.getElementById("pName").value = "";
    document.getElementById("pPhone").value = "";
    document.getElementById("pEmail").value = "";
    document.getElementById("pType").value = "Standard";

    popup.classList.remove("hidden");
}

function openEdit(i) {
    editIndex = i;

    document.getElementById("popupTitle").innerText = "Sửa khách hàng";

    const c = customers[i];
    pName.value = c.name;
    pPhone.value = c.phone;
    pEmail.value = c.email;
    pType.value = c.type;

    popup.classList.remove("hidden");
}

function closePopup() {
    popup.classList.add("hidden");
}

// ------------------------- SAVE -------------------------
function save() {
    const obj = {
        name: pName.value,
        phone: pPhone.value,
        email: pEmail.value,
        type: pType.value,
        visits: 0,
        total: 0,
        date: new Date().toISOString().split("T")[0]
    };

    if (editIndex === -1) {
        customers.push(obj);
    } else {
        customers[editIndex] = {
            ...customers[editIndex],
            name: obj.name,
            phone: obj.phone,
            email: obj.email,
            type: obj.type,
        };
    }

    saveData();
    closePopup();
    render();
}

// ------------------------- REMOVE -------------------------
function removeCus(i) {
    if (confirm("Xóa khách hàng này?")) {
        customers.splice(i, 1);
        saveData();
        render();
    }
}

// ------------------------- EVENTS -------------------------
btnAdd.onclick = openAdd;
btnSave.onclick = save;
btnClose.onclick = closePopup;

searchInput.oninput = render;
filterType.onchange = render;

// ------------------------- INIT -------------------------
loadData();
render();
