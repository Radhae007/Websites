// app.js - client-only storefront behavior
const PRODUCTS = [
  {
    id: 'chicken_std',
    title: 'Chicken Pickle (Standard)',
    price: 299,
    desc: 'Homestyle chicken pickle with tangy, spicy flavors — small-batch recipe.',
    img: 'https://images.unsplash.com/photo-1585496239274-7f4f3b18d36d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=476de40f2948b2f3c0f0a8e5f60ca1c9'
  },
  {
    id: 'chicken_prem',
    title: 'Chicken Pickle (Premium Boneless)',
    price: 399,
    desc: 'Premium boneless pieces, richer masala and longer marination for depth.',
    img: 'https://images.unsplash.com/photo-1604908177049-e7f2a05c9c3c?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=0f6f0dbfb2c1f2c9c12b9b892b7dc935'
  },
  {
    id: 'prawn',
    title: 'Prawn Pickle',
    price: 349,
    desc: 'Coastal prawn pickle — briny with a punch of chilies and curry leaves.',
    img: 'https://images.unsplash.com/photo-1544013169-4f6b6b67b4c9?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=e9f0f6d279e5ad8e8e1b2b7bfb0cd9a8'
  },
  {
    id: 'fish',
    title: 'Fish Pickle',
    price: 329,
    desc: 'Delicate fish pieces in a tangy and spicy masala — coastal classic.',
    img: 'https://images.unsplash.com/photo-1604908177520-93f9bf5f6b12?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b711e5f35b1a1c7b6e6d9a7a9f9b0e4'
  },
  {
    id: 'coco_powder',
    title: 'Coconut Gunpowder',
    price: 149,
    desc: 'Roasted coconut & spice powder — perfect with hot rice or idli.',
    img: 'https://images.unsplash.com/photo-1627498261784-08ed1a5b21b4?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3f3b1a3a6f34e3b2c79a6a8f6f5e2b31'
  },
  {
    id: 'banana_chips',
    title: 'Kanyakumari Banana Chips',
    price: 129,
    desc: 'Thin, crispy, lightly salted banana chips from the southern coast.',
    img: 'https://images.unsplash.com/photo-1580191945066-0cf7f3d2d3cb?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=14f0a6e4c7e78f6f5b6d9a7c3c2a1e8a'
  }
];

const selectors = {
  grid: document.getElementById('productGrid'),
  productModal: document.getElementById('productModal'),
  modalBody: document.getElementById('modalBody'),
  modalClose: document.getElementById('modalClose'),
  cartBtn: document.getElementById('cartBtn'),
  cartDrawer: document.getElementById('cartDrawer'),
  cartContent: document.getElementById('cartContent'),
  cartCount: document.getElementById('cartCount'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  checkoutModal: document.getElementById('checkoutModal'),
  checkoutClose: document.getElementById('checkoutClose'),
  payMethod: document.getElementById('payMethod'),
  cardFields: document.getElementById('cardFields'),
  topBanner: document.getElementById('top-banner'),
  menuToggle: document.getElementById('menuToggle'),
  menu: document.getElementById('menu'),
  yearEl: document.getElementById('year')
};

selectors.yearEl.textContent = new Date().getFullYear();

// Simple cart stored in localStorage
let CART = JSON.parse(localStorage.getItem('sony_cart') || '[]');

function saveCart(){
  localStorage.setItem('sony_cart', JSON.stringify(CART));
  renderCart();
}

function addToCart(productId, qty=1){
  const p = PRODUCTS.find(x => x.id === productId);
  if(!p) return;
  const existing = CART.find(i => i.id === productId);
  if(existing){
    existing.qty += qty;
  }else{
    CART.push({id:productId, qty, title:p.title, price:p.price, img:p.img});
  }
  saveCart();
  showToast(`${p.title} added to cart`);
}

function removeFromCart(productId){
  CART = CART.filter(i => i.id !== productId);
  saveCart();
}

function updateQty(productId, qty){
  const item = CART.find(i => i.id === productId);
  if(!item) return;
  item.qty = parseInt(qty) || 1;
  if(item.qty <= 0) removeFromCart(productId);
  saveCart();
}

function subtotal(){
  return CART.reduce((s,i)=> s + (i.price * i.qty), 0);
}

function renderProducts(){
  selectors.grid.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const el = document.createElement('article');
    el.className = 'product-card';
    el.innerHTML = `
      <div class="product-image" data-id="${p.id}">
        <img loading="lazy" src="${p.img}" alt="${p.title}">
      </div>
      <div>
        <div class="product-meta">
          <div class="product-title">${p.title}</div>
          <div class="product-price">₹${p.price}</div>
        </div>
        <p class="muted" style="margin:8px 0">${p.desc}</p>
        <div class="product-actions">
          <button class="btn shop-btn btn-primary" data-add="${p.id}">Shop Now</button>
          <button class="btn btn-ghost" data-view="${p.id}">View</button>
        </div>
      </div>
    `;
    selectors.grid.appendChild(el);
  });
  // attach events
  document.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click', e=> {
      const id = e.currentTarget.getAttribute('data-add');
      addToCart(id, 1);
    });
  });
  document.querySelectorAll('.product-image, [data-view]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const id = el.dataset.id || el.getAttribute('data-view');
      openProductModal(id);
    });
  });
}

function openProductModal(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  selectors.modalBody.innerHTML = `
    <img src="${p.img}" alt="${p.title}">
    <div>
      <h4>${p.title}</h4>
      <p class="muted">₹${p.price}</p>
      <p style="margin-top:12px">${p.desc}</p>
      <div style="margin-top:16px;display:flex;gap:8px">
        <input type="number" id="modalQty" min="1" value="1" style="width:84px;padding:8px;border-radius:8px;border:1px solid #eee">
        <button class="btn btn-primary" id="modalAdd">Add to Cart</button>
      </div>
    </div>
  `;
  selectors.productModal.setAttribute('aria-hidden','false');
  selectors.productModal.focus();
  document.getElementById('modalAdd').addEventListener('click', ()=>{
    const qty = parseInt(document.getElementById('modalQty').value || '1');
    addToCart(p.id, qty);
  });
}

// Modal close handlers
selectors.modalClose.addEventListener('click', ()=> selectors.productModal.setAttribute('aria-hidden','true'));
selectors.productModal.addEventListener('click', e=>{
  if(e.target === selectors.productModal) selectors.productModal.setAttribute('aria-hidden','true');
});

// Cart drawer
selectors.cartBtn.addEventListener('click', ()=> openCart());
document.getElementById('closeCart').addEventListener('click', ()=> closeCart());

function openCart(){
  selectors.cartDrawer.classList.add('open');
  selectors.cartDrawer.setAttribute('aria-hidden','false');
  renderCart();
}
function closeCart(){
  selectors.cartDrawer.classList.remove('open');
  selectors.cartDrawer.setAttribute('aria-hidden','true');
}

function renderCart(){
  selectors.cartCount.textContent = CART.reduce((a,b)=>a+b.qty,0);
  selectors.cartSubtotal.textContent = `₹${subtotal()}`;
  if(CART.length === 0){
    selectors.cartContent.innerHTML = '<div class="muted">Your cart is empty. Add something tasty!</div>';
    return;
  }
  selectors.cartContent.innerHTML = '';
  CART.forEach(item=>{
    const node = document.createElement('div');
    node.className = 'cart-item';
    node.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${item.title}</strong>
          <div>₹${item.price}</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:6px;align-items:center">
          <input type="number" min="1" value="${item.qty}" style="width:74px;padding:6px;border-radius:6px;border:1px solid #eee" data-update="${item.id}">
          <button class="btn btn-ghost" data-remove="${item.id}">Remove</button>
        </div>
      </div>
    `;
    selectors.cartContent.appendChild(node);
  });
  // events
  selectors.cartContent.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      removeFromCart(e.currentTarget.getAttribute('data-remove'));
    });
  });
  selectors.cartContent.querySelectorAll('[data-update]').forEach(input=>{
    input.addEventListener('change', e=>{
      updateQty(e.currentTarget.getAttribute('data-update'), e.currentTarget.value);
    });
  });
}

// checkout flow
selectors.checkoutBtn.addEventListener('click', ()=> {
  if(CART.length === 0){ showToast('Cart empty — add items before checkout'); return; }
  selectors.checkoutModal.setAttribute('aria-hidden','false');
});
document.getElementById('checkoutClose').addEventListener('click', ()=> selectors.checkoutModal.setAttribute('aria-hidden','true'));
document.getElementById('cancelCheckout').addEventListener('click', ()=> selectors.checkoutModal.setAttribute('aria-hidden','true'));

selectors.payMethod.addEventListener('change', e=>{
  selectors.cardFields.style.display = (e.target.value === 'card') ? 'block' : 'none';
});

document.getElementById('checkoutForm').addEventListener('submit', function(e){
  e.preventDefault();
  // simulate payment
  const name = document.getElementById('custName').value;
  const upi = document.getElementById('custUPI').value;
  const method = selectors.payMethod.value;
  // For a real store you would post to your server / payment gateway here.
  setTimeout(()=>{
    const orderId = 'ORD' + Math.floor(Math.random()*900000+100000);
    showToast(`Payment success — ${orderId}`);
    CART = [];
    saveCart();
    selectors.checkoutModal.setAttribute('aria-hidden','true');
    selectors.cartDrawer.classList.remove('open');
    alert(`Thanks ${name}! Order ${orderId} confirmed.\nPayment method: ${method}\nWe will contact ${upi} for updates.`);
  }, 700);
});

// clear cart
document.getElementById('clearCart').addEventListener('click', ()=>{
  if(!confirm('Clear the cart?')) return;
  CART = [];
  saveCart();
});

// Menu toggle (mobile)
selectors.menuToggle.addEventListener('click', ()=>{
  const open = selectors.menu.style.display === 'flex';
  selectors.menu.style.display = open ? 'none' : 'flex';
});

// top banner scroll to products
selectors.topBanner.addEventListener('click', ()=> {
  document.getElementById('products').scrollIntoView({behavior:'smooth', block:'start'});
});
selectors.topBanner.addEventListener('keypress', (e)=> {
  if(e.key === 'Enter' || e.key === ' ') document.getElementById('products').scrollIntoView({behavior:'smooth'});
});

// toast helper
function showToast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed';
  t.style.bottom = '18px';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.background = '#111';
  t.style.color = '#fff';
  t.style.padding = '10px 14px';
  t.style.borderRadius = '12px';
  t.style.zIndex = 2000;
  t.style.opacity = 0;
  t.style.transition = 'opacity .2s ease';
  document.body.appendChild(t);
  requestAnimationFrame(()=> t.style.opacity = 1);
  setTimeout(()=> {
    t.style.opacity = 0;
    setTimeout(()=> t.remove(), 300);
  }, 1800);
}

// initialize
renderProducts();
renderCart();

// close modals on Escape
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    selectors.productModal.setAttribute('aria-hidden','true');
    selectors.checkoutModal.setAttribute('aria-hidden','true');
    closeCart();
  }
});
