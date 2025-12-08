// Statistics.js - reads localStorage keys, filters by date/granularity and renders Chart.js charts + top services

(() => {
  // ---- CONFIG: keys used by your other modules ----
  const KEY_ROOMS = "karaoke_rooms_v1";        // Room.js stored key
  const KEY_SERVICES = "karaoke_services_v1";  // Service.js stored key
  const KEY_CUSTOMERS = "customers_v1";        // optional if you store customers separately

  // DOM
  const fromDateEl = document.getElementById("fromDate");
  const toDateEl = document.getElementById("toDate");
  const granularityEl = document.getElementById("granularity");
  const applyBtn = document.getElementById("applyFilterBtn");
  const resetBtn = document.getElementById("resetBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  const totalRevenueEl = document.getElementById("totalRevenue");
  const customerCountEl = document.getElementById("customerCount");
  const roomCountEl = document.getElementById("roomCount");
  const roomUsageEl = document.getElementById("roomUsage");
  const avgPerMonthEl = document.getElementById("avgPerMonth");

  const topServicesList = document.getElementById("topServicesList");

  // chart contexts
  const ctxRevenue = document.getElementById("revenueChart").getContext("2d");
  const ctxCustomer = document.getElementById("customerChart").getContext("2d");
  const ctxRoomPie = document.getElementById("roomPieChart").getContext("2d");

  // Chart instances
  let revenueChart = null, customerChart = null, roomPieChart = null;

  // utility
  function safeParse(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }

  function toDateSafe(v) {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }

  // normalize service records
  // expected service object fields: { name, price, sold, date } (date ISO string)
  function normalizeServices(raw) {
    return (raw || []).map(s => {
      return {
        name: s.name || s.tenDV || s.ten || "Unknown",
        price: Number(s.price || s.gia || s.priceNumber || 0),
        sold: Number(s.sold || s.soluong || s.count || 0),
        date: s.date || s.ngay || s.createdAt || null
      };
    });
  }

  function normalizeRooms(raw) {
    return (raw || []).map(r => ({
      id: r.id,
      name: r.name || r.ten || r.roomName,
      type: r.type || r.loai || "Standard",
      status: r.status || r.trangthai || "available"
    }));
  }

  // filter list by date range (inclusive)
  function filterByDate(list, from, to) {
    if (!from && !to) return list;
    return list.filter(item => {
      const d = item.date ? new Date(item.date) : null;
      if (!d) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  // compute totals + monthly/periodic breakdown
  function aggregateByPeriod(services, granularity, from, to) {
    // granularity: "month" | "day" | "year"
    const buckets = new Map();

    const addToBucket = (k, amount) => buckets.set(k, (buckets.get(k) || 0) + amount);

    services.forEach(s => {
      const d = s.date ? new Date(s.date) : null;
      if (!d) return;
      let key;
      if (granularity === "day") {
        key = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
      } else if (granularity === "year") {
        key = `${d.getFullYear()}`;
      } else { // month
        key = `${d.getFullYear()}-${pad2(d.getMonth()+1)}`;
      }
      addToBucket(key, (s.price || 0) * (s.sold || 1));
    });

    // produce sorted arrays (keys ascending)
    const entries = Array.from(buckets.entries()).sort((a,b)=> a[0] < b[0] ? -1 : 1);
    const labels = entries.map(e => e[0]);
    const values = entries.map(e => e[1]);
    return { labels, values };
  }

  function pad2(n){ return (n<10? "0":"") + n; }

  // render functions
  function renderTopServices(servicesFiltered) {
    // aggregate by service name
    const map = new Map();
    servicesFiltered.forEach(s => {
      const name = s.name || "Unknown";
      const sold = Number(s.sold || 0);
      const rev = (Number(s.price || 0) * sold) || 0;
      if (!map.has(name)) map.set(name, { sold:0, rev:0 });
      const cur = map.get(name);
      cur.sold += sold;
      cur.rev += rev;
    });

    const arr = Array.from(map.entries()).map(([name, v]) => ({ name, sold: v.sold, rev: v.rev }));
    arr.sort((a,b) => b.sold - a.sold);
    const top5 = arr.slice(0,5);

    topServicesList.innerHTML = "";
    top5.forEach((t, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <div style="font-weight:600">${idx+1}. ${escapeHtml(t.name)}</div>
          <div class="meta">${t.sold} đã bán</div>
        </div>
        <strong>${t.rev.toLocaleString()}đ</strong>
      `;
      topServicesList.appendChild(li);
    });
  }

  function escapeHtml(s){ return (s==null?"":String(s)).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function renderSummary(servicesFiltered, roomsRaw, customersRaw) {
    const totalRev = servicesFiltered.reduce((sum,s) => sum + ((s.price||0) * (s.sold||1)), 0);
    totalRevenueEl.textContent = totalRev.toLocaleString() + " VND";

    customerCountEl.textContent = (customersRaw && customersRaw.length) ? customersRaw.length : 0;
    roomCountEl.textContent = (roomsRaw && roomsRaw.length) ? roomsRaw.length + " phòng" : "0 phòng";

    const activeRooms = (roomsRaw || []).filter(r => (r.status === "using" || r.status === "Đang sử dụng" || r.status === "using")).length;
    const usage = roomsRaw && roomsRaw.length ? Math.round((activeRooms / roomsRaw.length) * 100) : 0;
    roomUsageEl.textContent = usage + "% đang dùng";

    avgPerMonthEl.textContent = (totalRev / 12).toLocaleString() + " VND";
  }

  // draw charts using Chart.js
  function drawCharts(servicesFiltered, roomsRaw, granularity) {
    // revenue series aggregated by chosen granularity
    const ag = aggregateByPeriod(servicesFiltered, granularity);
    const labels = ag.labels.length ? ag.labels : defaultLabelsForGranularity(granularity);
    const values = ag.values.length ? ag.values : Array(labels.length).fill(0);

    // revenueChart (bar)
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctxRevenue, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Doanh thu', backgroundColor: '#8A5CF6', data: values }]
      },
      options: {
        responsive:true,
        plugins: { legend:{ display:false } },
        scales: {
          y: { ticks:{ callback: v=> formatShortCurrency(v) } }
        }
      }
    });

    // customerChart (line) - we use customers count per period derived from services sold (approx)
    const custValues = labels.map((lab, i) => {
      // approximate: number of sold items in same period
      // we can count sold per period similarly
      return values[i] ? Math.round(values[i] / 100000) : 0;
    });
    if (customerChart) customerChart.destroy();
    customerChart = new Chart(ctxCustomer, {
      type: 'line',
      data: {
        labels,
        datasets:[{
          label:'Khách (approx)',
          data: custValues,
          borderColor:'#3b82f6',
          tension:0.3,
          fill:false,
          pointRadius:4
        }]
      },
      options:{ responsive:true, plugins:{ legend:{display:false} } }
    });

    // roomPieChart
    const roomTypes = (roomsRaw || []).reduce((m,r) => {
      const t = r.type || r.loai || 'Standard';
      m[t] = (m[t]||0) + 1;
      return m;
    }, {});
    const rLabels = Object.keys(roomTypes);
    const rValues = Object.values(roomTypes);
    if (roomPieChart) roomPieChart.destroy();
    roomPieChart = new Chart(ctxRoomPie, {
      type:'pie',
      data:{
        labels:rLabels,
        datasets:[{ data:rValues, backgroundColor:['#3d7bff','#ffb300','#ff4081','#34d399'] }]
      },
      options:{ responsive:true, plugins:{ legend:{position:'right'} } }
    });
  }

  function formatShortCurrency(v){
    if (v >= 1000000) return (v/1000000).toFixed(1)+'M';
    if (v >= 1000) return (v/1000).toFixed(0)+'k';
    return v;
  }

  function defaultLabelsForGranularity(g){
    const now = new Date();
    if (g === 'day') {
      // last 7 days
      const arr = [];
      for(let i=6;i>=0;i--){
        const d = new Date(now); d.setDate(now.getDate() - i);
        arr.push(`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`);
      }
      return arr;
    } else if (g === 'year') {
      const year = now.getFullYear();
      return [String(year-4), String(year-3), String(year-2), String(year-1), String(year)];
    } else {
      // months of current year
      return ['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => `${now.getFullYear()}-${m}`);
    }
  }

  function pad2(n){ return (n<10? '0':'') + n; }

  // main refresh pipeline
  function refreshAll() {
    // load raw
    const rawRooms = safeParse(KEY_ROOMS);
    const rawServices = safeParse(KEY_SERVICES);
    const rawCustomers = safeParse(KEY_CUSTOMERS);

    // normalize
    const rooms = normalizeRooms(rawRooms);
    const services = normalizeServices(rawServices);

    // date filter
    const from = toDateSafe(fromDateEl.value);
    const to = toDateSafe(toDateEl.value);
    // if user picks to date only, set to end of day
    if (to) to.setHours(23,59,59,999);

    const servicesFiltered = filterByDate(services, from, to);

    // render summary
    renderSummary(servicesFiltered, rooms, rawCustomers);

    // render top services
    renderTopServices(servicesFiltered);

    // draw charts
    drawCharts(servicesFiltered, rooms, granularityEl.value);
  }

  // normalize helper reuse functions (copied for module scope)
  function normalizeServices(raw){ return (raw||[]).map(s=>({ name: s.name||s.tenDV||s.tenDV||s.ten||s.title, price: Number(s.price||s.gia||s.amount||0), sold: Number(s.sold||s.soluong||s.qty||0), date: s.date||s.ngay||s.createdAt||null })); }
  function normalizeRooms(raw){ return (raw||[]).map(r=>({ id:r.id, name:r.name||r.ten||r.roomName, type:r.type||r.loai||'Standard', status:r.status||r.trangthai||'available' })); }

  // events
  applyBtn.addEventListener("click", refreshAll);
  refreshBtn.addEventListener("click", refreshAll);
  resetBtn.addEventListener("click", ()=> {
    fromDateEl.value = "";
    toDateEl.value = "";
    granularityEl.value = "month";
    refreshAll();
  });

  // auto refresh when localStorage changes from other tabs/pages (useful when Room/Service update)
  window.addEventListener("storage", (ev)=>{
    if ([KEY_ROOMS, KEY_SERVICES, KEY_CUSTOMERS].includes(ev.key)) {
      // slight delay to allow other script to finish saving
      setTimeout(refreshAll, 200);
    }
  });

  // initial render
  refreshAll();

  // expose for console debug
  window.StatsModule = { refresh: refreshAll };
  document.addEventListener("DOMContentLoaded", () => {
    const raw = localStorage.getItem("revenueData");
    if (!raw) return;

    const revenue = JSON.parse(raw);

    const labels = Object.keys(revenue);
    const values = Object.values(revenue);

    new Chart(document.getElementById("chartRevenue"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Doanh thu",
                data: values
            }]
        }
    });
});


})();
