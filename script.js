const products = [
  {id:1, name:"Son Dior", price:500000, sale:350000},
  {id:2, name:"Kem dưỡng da", price:400000, sale:300000},
  {id:3, name:"Sữa rửa mặt", price:200000, sale:150000}
];

function formatVND(n){
  return n.toLocaleString("vi-VN") + "đ";
}

// Trang chủ
const home = document.getElementById("homeProducts");
if(home){
  home.innerHTML = products.map(p => `
    <div class="product-card">
      <h3>${p.name}</h3>
      <p>
        <span class="old">${formatVND(p.price)}</span><br>
        <span class="new">${formatVND(p.sale)}</span>
      </p>
      <a href="product-detail.html?id=${p.id}">Xem chi tiết</a>
    </div>
  `).join("");
}

// Trang danh mục
const list = document.getElementById("productList");
if(list){
  list.innerHTML = products.map(p => `
    <div class="product-card">
      <h3>${p.name}</h3>
      <p>${formatVND(p.sale)}</p>
      <a href="product-detail.html?id=${p.id}">Xem chi tiết</a>
    </div>
  `).join("");
}

// Trang chi tiết
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if(id){
  const p = products.find(x => x.id == id);
  const detail = document.getElementById("detail");

  if(p){
    detail.innerHTML = `
      <h2>${p.name}</h2>
      <p>
        <span class="old">${formatVND(p.price)}</span><br>
        <span class="new">${formatVND(p.sale)}</span>
      </p>

      <button onclick="inc()">+</button>
      <input id="qty" value="1">
      <button onclick="dec()">-</button>

      <br><br>
      <button>🛒 Thêm vào giỏ hàng</button>
    `;
  }
}

function inc(){
  let q = document.getElementById("qty");
  q.value++;
}

function dec(){
  let q = document.getElementById("qty");
  if(q.value > 1) q.value--;
}
