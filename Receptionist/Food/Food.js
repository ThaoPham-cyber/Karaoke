
(() => {
  const SERVICE_KEY = "karaoke_services_v1";
  const ROOM_KEY = "karaoke_rooms_v1";
  const CART_KEY = "reception_carts_v1";

  // DOM
  const roomSelector = document.getElementById("roomSelector");
  const foodGrid = document.getElementById("foodGrid");
  const foodSearch = document.getElementById("foodSearch");
  const categoryWrap = document.getElementById("categoryWrap");
  const btnViewCart = document.getElementById("btnViewCart");
  const cartCountEl = document.getElementById("cartCount");

  const cartModal = document.getElementById("cartModal");
  const closeCart = document.getElementById("closeCart");
  const cartBody = document.getElementById("cartBody");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartModalRoom = document.getElementById("cartModalRoom");
  const cartClear = document.getElementById("cartClear");
  const cartCheckout = document.getElementById("cartCheckout");

  // state
  let services = [];
  let rooms = [];
  let selectedRoomId = null;
  let carts = {}; // { roomId: [ {id, qty} ] }
  let activeCategory = "__all";

  // init
  function loadServices() {
    const raw = localStorage.getItem(SERVICE_KEY);
    if (raw) {
      try { services = JSON.parse(raw); }
      catch(e) { console.error("Invalid services storage", e); services = []; }
    } else {
      // fallback small demo if none (should be created by Service.js)
      services = [
        { id: "demo1", name: "Bia Tiger", category: "Đồ uống", price: 20000, unit: "Lon", stock: 80, desc:"" },
        { id: "demo2", name: "Coca Cola", category: "Đồ uống", price: 15000, unit: "Lon", stock: 100, desc:"" },
        { id: "demo3", name: "Snack Oishi", category: "Đồ ăn", price: 15000, unit: "Gói", stock: 60, desc:"" }
      ];
      localStorage.setItem(SERVICE_KEY, JSON.stringify(services));
    }
  }

  function loadRooms() {
    const raw = localStorage.getItem(ROOM_KEY);
    if (raw) {
      try { rooms = JSON.parse(raw); }
      catch(e) { console.error("Invalid rooms storage", e); rooms = []; }
    } else {
      rooms = [
        { id:"R_demo1", name:"Phòng VIP 01", customers:[{name:"Nguyễn Văn A"}] },
        { id:"R_demo2", name:"Phòng 04", customers:[{name:"Trần Thị B"}] },
        { id:"R_demo3", name:"Phòng 07", customers:[{name:"Lê Văn C"}] },
      ];
      localStorage.setItem(ROOM_KEY, JSON.stringify(rooms));
    }
  }

  function loadCarts() {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      try { carts = JSON.parse(raw); } catch{ carts = {}; }
    } else { carts = {}; }
  }

  function saveCarts() { localStorage.setItem(CART_KEY, JSON.stringify(carts)); }

  // render room pills
  function renderRooms() {
    roomSelector.innerHTML = "";
    rooms.forEach(r => {
      const pill = document.createElement("div");
      pill.className = "room-pill";
      if (selectedRoomId === r.id) pill.classList.add("active");
      pill.dataset.id = r.id;

      const custName = (r.customers && r.customers.length) ? r.customers[0].name : "";
      pill.innerHTML = `<div class="room-title">${r.name}</div><div class="room-sub">${custName}</div>`;
      pill.addEventListener("click", () => selectRoom(r.id));
      roomSelector.appendChild(pill);
    });
    // if no selected room, auto-select first
    if (!selectedRoomId && rooms.length) {
      selectRoom(rooms[0].id);
    }
  }

  function selectRoom(id) {
    selectedRoomId = id;
    document.querySelectorAll(".room-pill").forEach(el => el.classList.toggle("active", el.dataset.id === id));
    updateCartCount();
  }

  // categories from services
  function uniqueCategories() {
    const s = new Set(services.map(x => x.category || "Khác"));
    return ["__all", ...Array.from(s)];
  }

  function renderCategories() {
    categoryWrap.innerHTML = "";
    const cats = uniqueCategories();
    cats.forEach(c => {
      const btn = document.createElement("button");
      btn.className = "cat-btn " + (activeCategory === c ? "active": "");
      btn.textContent = (c === "__all" ? "Tất cả" : c);
      btn.dataset.cat = c;
      btn.addEventListener("click", () => {
        activeCategory = c;
        document.querySelectorAll(".cat-btn").forEach(x => x.classList.toggle("active", x.dataset.cat===c));
        renderFoods();
      });
      categoryWrap.appendChild(btn);
    });
  }

  // choose emoji/icon by category or name
  function emojiForService(s) {
    const n = (s.name || "").toLowerCase();
    if (n.includes("bia") || s.category && s.category.includes("uống")) return "🍺";
    if (n.includes("coca") || n.includes("pepsi") || n.includes("cola")) return "🥤";
    if (n.includes("snack") || s.category && s.category.includes("ăn")) return "🍟";
    if (n.includes("mì") || n.includes("phở")) return "🍜";
    return "🍽️";
  }

  // render food cards
  function renderFoods() {
    const q = (foodSearch.value || "").trim().toLowerCase();
    const cat = activeCategory;

    const list = services.filter(s => {
      if (cat !== "__all" && s.category !== cat) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || (s.desc||"").toLowerCase().includes(q);
    });

    foodGrid.innerHTML = "";
    if (!list.length) {
      foodGrid.innerHTML = `<div style="grid-column:1/-1;padding:20px;color:#666">Không có món phù hợp</div>`;
      return;
    }

    list.forEach(s => {
      const card = document.createElement("div");
      card.className = "food-card";
      card.innerHTML = `
        <div>
          <div class="food-emoji">${emojiForService(s)}</div>
          <div class="food-title">${s.name}</div>
          <div class="food-cat">${s.category || ""}</div>
          <div class="food-price">${formatCurrency(s.price)}</div>
          <div class="food-stock">Kho: ${s.stock ?? "-"}</div>
        </div>
        <button class="btn-add-food" data-id="${s.id}"><i class="fa fa-plus"></i> &nbsp; Thêm</button>
      `;
      const btn = card.querySelector(".btn-add-food");
      btn.addEventListener("click", () => addToCart(s.id));
      foodGrid.appendChild(card);
    });
  }

  function formatCurrency(v) {
    return Number(v).toLocaleString("vi-VN") + "đ";
  }

  // cart operations
  function getCartForRoom(rid) {
    if (!rid) return [];
    if (!carts[rid]) carts[rid] = [];
    return carts[rid];
  }

  function addToCart(serviceId) {
    if (!selectedRoomId) { alert("Hãy chọn phòng trước."); return; }
    const svc = services.find(s => s.id===serviceId);
    if (!svc) return;
    // push or increment
    const cart = getCartForRoom(selectedRoomId);
    const item = cart.find(i=>i.id===serviceId);
    if (item) item.qty++;
    else cart.push({ id: serviceId, qty: 1 });
    saveCarts();
    updateCartCount();
    showToast(`${svc.name} đã thêm vào giỏ của phòng`, 1400);
  }

  function updateCartCount() {
    const cart = getCartForRoom(selectedRoomId);
    const totalQty = cart.reduce((a,b)=>a+(b.qty||0),0);
    cartCountEl.textContent = totalQty;
  }

  // cart modal render
  function openCartModal() {
    if (!selectedRoomId) { alert("Hãy chọn phòng để xem giỏ"); return; }
    cartModal.classList.remove("hidden");
    renderCart();
  }

  function closeCartModal() { cartModal.classList.add("hidden"); }

  function renderCart() {
    cartBody.innerHTML = "";
    const cart = getCartForRoom(selectedRoomId);
    cartModalRoom.textContent = rooms.find(r=>r.id===selectedRoomId)?.name || selectedRoomId;

    if (!cart.length) {
      cartBody.innerHTML = `<div style="padding:20px;color:#666">Giỏ hàng trống</div>`;
      cartTotalEl.textContent = "0đ";
      return;
    }

    let total = 0;
    cart.forEach(row=>{
      const svc = services.find(s=>s.id===row.id);
      if(!svc) return;
      const line = document.createElement("div");
      line.className = "cart-row";
      const lineHtml = `
        <div class="info">
          <div style="font-weight:600">${svc.name}</div>
          <div style="color:#666;font-size:13px">${formatCurrency(svc.price)} · ${svc.unit || ""}</div>
        </div>
        <div>
          <div class="qty-controls">
            <button data-act="dec" data-id="${row.id}">-</button>
            <div style="min-width:28px;text-align:center">${row.qty}</div>
            <button data-act="inc" data-id="${row.id}">+</button>
          </div>
        </div>
        <div style="width:90px;text-align:right">${formatCurrency(svc.price * row.qty)}</div>
        <div style="width:40px;text-align:right"><button data-act="rem" data-id="${row.id}" style="background:transparent;border:none;color:#e11">${"🗑"}</button></div>
      `;
      line.innerHTML = lineHtml;
      cartBody.appendChild(line);
      total += svc.price * row.qty;
    });

    cartTotalEl.textContent = formatCurrency(total);

    // bind qty actions
    cartBody.querySelectorAll("button[data-act]").forEach(btn=>{
      const act = btn.dataset.act, id = btn.dataset.id;
      btn.onclick = () => {
        const cart = getCartForRoom(selectedRoomId);
        const item = cart.find(i=>i.id===id);
        if(!item) return;
        if (act==="inc") item.qty++;
        else if (act==="dec") { item.qty = Math.max(1, item.qty-1); }
        else if (act==="rem") {
          const idx = cart.findIndex(i=>i.id===id); if(idx>=0) cart.splice(idx,1);
        }
        saveCarts(); renderCart(); updateCartCount();
      };
    });
  }

  // clear cart
  function clearCart() {
    if (!selectedRoomId) return;
    if (!confirm("Xóa toàn bộ giỏ hàng của phòng này?")) return;
    
     renderCart(); updateCartCount();
  }

  function checkout() {
  if (!selectedRoomId) return;
  const cart = getCartForRoom(selectedRoomId);
  if (!cart.length) { alert("Giỏ trống."); return; }
  if (!confirm("Gửi món cho phòng này?")) return;
  const rooms = JSON.parse(localStorage.getItem(ROOM_KEY)) || [];
  const room = rooms.find(r => r.id === selectedRoomId);
  if (!room) return;

  if (!room.orders) room.orders = [];
  cart.forEach(item => {
    const svc = services.find(s => s.id === item.id);
    if (!svc) return;
    room.orders.push({
      id: svc.id,
      name: svc.name,
      price: svc.price,
      qty: item.qty
    });
  });
  room.hasNewOrder = true;
  localStorage.setItem(ROOM_KEY, JSON.stringify(rooms));
  carts[selectedRoomId] = [];
  saveCarts();
  renderCart();
  updateCartCount();
  closeCartModal();
  showToast("Đã gửi món cho phòng", 1600);
}


  // small toast
  function showToast(msg, ms=1200) {
    const t = document.createElement("div");
    t.style.position="fixed"; t.style.right="18px"; t.style.bottom="18px";
    t.style.background="rgba(0,0,0,0.78)"; t.style.color="#fff"; t.style.padding="10px 14px";
    t.style.borderRadius="10px"; t.style.zIndex=9999; t.style.fontSize="14px";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(()=> { t.style.opacity=0; t.style.transform="translateY(8px)"; }, ms);
    setTimeout(()=> t.remove(), ms+400);
  }

  // search handler
  foodSearch.addEventListener("input", () => renderFoods());

  // open/close cart modal
  btnViewCart.addEventListener("click", openCartModal);
  closeCart.addEventListener("click", closeCartModal);
  cartClear.addEventListener("click", clearCart);
  cartCheckout.addEventListener("click", checkout);

  // initial load and render
  function init() {
    loadServices(); loadRooms(); loadCarts();
    renderRooms();
    renderCategories();
    renderFoods();
    updateCartCount();
  }

  init();

  // expose small API for debugging
  window.ReceptionFood = {
    reload: () => { loadServices(); renderCategories(); renderFoods(); },
    getCarts: ()=> carts
  };

})();
