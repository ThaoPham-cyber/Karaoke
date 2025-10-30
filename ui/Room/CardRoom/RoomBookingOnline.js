// ui/Room/CardRoom/RoomBookingOnline.js
(function(){
  function parseIdFromQuery(){
    const q = location.search;
    if(!q) return null;
    const params = new URLSearchParams(q);
    return params.get('id') || localStorage.getItem('selectedRoom');
  }

  function loadMock(roomId){
    // mô phỏng: nếu có dữ liệu đặt trước -> trả về object
    const sample = {
      103: { id:103, name:"Phòng 103", status:"booked", customer:"Trần Văn T", phone:"0912345678", start:"2025-08-25T20:00" },
      104: { id:104, name:"Phòng 104 (VIP)", status:"booked", customer:"VIP Khách", phone:"0900001122", start:"2025-08-26T08:30" }
    };
    return sample[roomId] || { id:roomId, name:`Phòng ${roomId}`, status:"booked", customer:"", phone:"", start:"" };
  }

  function init(){
    const id = parseIdFromQuery();
    const data = loadMock(id);

    document.getElementById('bo_roomName').textContent = data.name;
    document.getElementById('bo_status').textContent = data.status;
    document.getElementById('bo_customerName').value = data.customer || "";
    document.getElementById('bo_customerPhone').value = data.phone || "";
    if(data.start) {
      // convert "YYYY-MM-DDTHH:MM" already format
      document.getElementById('bo_startTime').value = data.start;
    }

    document.getElementById('bo_save').addEventListener('click', ()=> {
      // ở đây gọi API lưu hoặc lưu tạm
      alert('Lưu đặt trước thành công (mô phỏng).');
    });

    document.getElementById('bo_cancel').addEventListener('click', ()=> {
      if(confirm('Xác nhận hủy đặt phòng?')){
        alert('Đã hủy đặt (mô phỏng).');
        goBack();
      }
    });

    document.getElementById('bo_checkin').addEventListener('click', ()=> {
      // khi check-in thì chuyển sang RoomDetail (inuse)
      const detailPath = `RoomDetail.html?id=${id}`;
      // nếu được load trong vùng content parent, hãy fetch parent content thay vì location.href
      if(window.parent && window.parent !== window){
        location.href = detailPath; // fallback
      } else {
        location.href = detailPath;
      }
    });

    document.getElementById('bo_back').addEventListener('click', goBack);
  }

  function goBack(){
    // quay về Room list
    if(window.parent && window.parent.document.getElementById('content')){
      fetch("../Room.html").then(r => r.text()).then(html=>{
        const content = window.parent.document.getElementById('content');
        content.innerHTML = html;
        // nạp Room.js từ parent context: giả sử parent loader đã lo
      });
    } else {
      location.href = "../Room.html";
    }
  }document.getElementById("btnBack").addEventListener("click", () => {
  javaBridge.loadPage("D:/VSCode/ui/Room/Room.html");
});

  // public init
  window.initRoomBookingOnline = init;
})();
