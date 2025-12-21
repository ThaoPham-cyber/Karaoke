let currentFoodList = [];
let currentCategory = "all";

function filterFood(category, btn) {
    currentCategory = category;

    // active button
    document.querySelectorAll(".category-tabs button")
        .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    let filtered = FoodData;

    if (category !== "all") {
        filtered = FoodData.filter(item => item.category === category);
    }

    // áp dụng search nếu đang gõ
    const keyword = document.getElementById("foodSearch").value.toLowerCase();
    if (keyword) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(keyword)
        );
    }

    currentFoodList = filtered;
    renderFood(currentFoodList);
}

function searchFood() {
    const keyword = document.getElementById("foodSearch").value.toLowerCase();

    let filtered = FoodData;

    if (currentCategory !== "all") {
        filtered = filtered.filter(item => item.category === currentCategory);
    }

    if (keyword) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(keyword)
        );
    }

    currentFoodList = filtered;
    renderFood(currentFoodList);
}

function renderFood(list) {
    const grid = document.getElementById("foodGrid");
    if (!grid) return;
    grid.innerHTML = list.map(item => `
        <div class="food-card">
            <span class="category-tag">${item.category}</span>
            <h4>${item.name}</h4>
            <p class="unit">${item.unit}</p>
            <div class="price">${item.price.toLocaleString()}đ</div>
            <button class="btn-add-cart" onclick="addToCart(${item.id})">
                <i class="fa-solid fa-plus"></i> Thêm vào giỏ
            </button>
        </div>
    `).join('');
}

function addToCart(id) {
    const product = FoodData.find(f => f.id === id);
    const inCart = CartQueue.find(c => c.id === id);
    if (inCart) {
        inCart.qty++;
    } else {
        CartQueue.push({ ...product, qty: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById("cartList");
    if (!list) return;

    list.innerHTML = CartQueue.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <strong>${item.name}</strong>
                <span>${item.price.toLocaleString()}đ x ${item.qty}</span>
            </div>
            <button class="btn-del" onclick="removeFromCart(${item.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');

    const total = CartQueue.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById("cartSubtotal").innerText = total.toLocaleString() + "đ";
    document.getElementById("cartTotal").innerText = total.toLocaleString() + "đ";
    document.getElementById("cartCount").innerText = CartQueue.length + " món";
}

function removeFromCart(id) {
    CartQueue = CartQueue.filter(item => item.id !== id);
    updateCartUI();
}

function sendOrder() {
    if (CartQueue.length === 0) return alert("Giỏ hàng trống!");
    alert("Đã gửi yêu cầu gọi món thành công!");
    CartQueue = [];
    updateCartUI();
}