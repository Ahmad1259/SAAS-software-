const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../apps/web/public/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const targetOldStart = `    function renderStorefront() {
      const container = document.getElementById('customerProductsList');`;

const targetOldEnd = `    function renderKitchenKDS() {`;

const newLogic = `    let storefrontCategoryFilter = 'ALL';

    function filterCustomerCategory(catKey) {
      storefrontCategoryFilter = catKey;
      const titleEl = document.getElementById('storefrontSectionTitle');
      if (titleEl) {
        titleEl.innerText = catKey === 'ALL' ? 'Popular Items' : \`\${catKey} Menu\`;
      }
      renderStorefront();
    }

    function openCustomerCheckoutModal() {
      const modal = document.getElementById('customerCheckoutModal');
      if (modal) {
        modal.classList.remove('hidden');
        renderCheckoutDrawerList();
      }
    }

    function closeCustomerCheckoutModal() {
      const modal = document.getElementById('customerCheckoutModal');
      if (modal) modal.classList.add('hidden');
    }

    function renderCheckoutDrawerList() {
      const list = document.getElementById('checkoutItemsList');
      if (!list) return;

      const itemIds = Object.keys(currentCart);
      if (itemIds.length === 0) {
        list.innerHTML = '<div class="py-6 text-center text-xs text-slate-400">Cart is empty. Add your favorite dishes!</div>';
        return;
      }

      let html = '';
      itemIds.forEach(id => {
        const prod = products.find(p => p.id === id);
        if (prod) {
          const qty = currentCart[id];
          const imgUrl = getProductImage(prod);
          html += \`
            <div class="p-2.5 bg-white rounded-2xl border border-orange-100 flex items-center justify-between gap-2 shadow-sm text-xs">
              <img src="\${imgUrl}" alt="\${prod.name}" class="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100">
              <div class="flex-1 min-w-0 pr-1">
                <span class="font-bold text-slate-900 block truncate">\${prod.name}</span>
                <span class="text-[10px] text-orange-600 font-mono font-bold">PKR \${(prod.price * qty).toLocaleString()}</span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                <button onclick="removeFromCart('\${prod.id}'); renderCheckoutDrawerList();" class="w-5 h-5 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-xs text-slate-700">-</button>
                <span class="font-mono font-bold text-xs w-4 text-center">\${qty}</span>
                <button onclick="addToCart('\${prod.id}'); renderCheckoutDrawerList();" class="w-5 h-5 rounded-lg bg-orange-500 text-white shadow-sm flex items-center justify-center font-black text-xs">+</button>
              </div>
            </div>
          \`;
        }
      });
      list.innerHTML = html;
    }

    function renderStorefront() {
      const pillsContainer = document.getElementById('storefrontCategoryPills');
      const container = document.getElementById('customerProductsList');
      if (!pillsContainer || !container) return;

      // 1. Render Circular Category Avatars (Matching Reference Screenshot)
      const categories = [
        { key: 'ALL', label: 'All', icon: 'fa-solid fa-burger', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&auto=format&fit=crop&q=80' },
        { key: 'Burgers', label: 'Burger', icon: 'fa-solid fa-burger', img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=120&auto=format&fit=crop&q=80' },
        { key: 'Signature Pizza', label: 'Pizza', icon: 'fa-solid fa-pizza-slice', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=80' },
        { key: 'Crispy Chicken & Wings', label: 'Chicken', icon: 'fa-solid fa-drumstick-bite', img: 'https://images.unsplash.com/photo-1527477321055-43615b629c95?w=120&auto=format&fit=crop&q=80' },
        { key: 'Fries', label: 'Snacks', icon: 'fa-solid fa-fire', img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=120&auto=format&fit=crop&q=80' },
        { key: 'Single Deals', label: 'Drinks & Deals', icon: 'fa-solid fa-glass-water', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&auto=format&fit=crop&q=80' }
      ];

      pillsContainer.innerHTML = categories.map(c => {
        const isActive = storefrontCategoryFilter === c.key;
        return \`
          <button onclick="filterCustomerCategory('\${c.key}')" class="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none">
            <div class="w-14 h-14 rounded-full p-0.5 border-2 transition transform duration-200 \${isActive ? 'border-orange-500 scale-105 shadow-md shadow-orange-500/25 bg-orange-500' : 'border-slate-100 bg-slate-50 group-hover:border-orange-200'} flex items-center justify-center overflow-hidden">
              <img src="\${c.img}" alt="\${c.label}" class="w-full h-full object-cover rounded-full">
            </div>
            <span class="text-[11px] font-extrabold tracking-tight \${isActive ? 'text-orange-600' : 'text-slate-600 group-hover:text-slate-900'}">\${c.label}</span>
          </button>
        \`;
      }).join('');

      // 2. Filter products
      let filtered = storefrontCategoryFilter === 'ALL' 
        ? products 
        : products.filter(p => (p.category || '').toLowerCase().includes(storefrontCategoryFilter.toLowerCase()));

      if (filtered.length === 0) {
        filtered = products; // Fallback so screen never looks empty
      }

      // 3. Render Product Cards Matching Screenshot
      container.innerHTML = filtered.map(p => {
        const qty = currentCart[p.id] || 0;
        const imgUrl = getProductImage(p);
        return \`
          <div class="bg-white rounded-3xl p-3.5 border border-orange-100/70 shadow-sm hover:shadow-md transition flex flex-col justify-between relative group">
            <!-- Favorite Heart Icon -->
            <button class="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-300 hover:text-rose-500 flex items-center justify-center text-[10px] transition z-10">
              <i class="fa-solid fa-heart"></i>
            </button>

            <!-- Centered Food Image Cutout -->
            <div class="w-full h-24 mb-2 flex items-center justify-center overflow-hidden rounded-2xl bg-orange-50/40 relative">
              <img src="\${imgUrl}" alt="\${p.name}" class="w-24 h-24 object-cover rounded-2xl group-hover:scale-105 transition duration-300">
              
              <!-- Subtle kcal badge -->
              <span class="absolute bottom-1 left-1.5 text-[8px] font-bold text-orange-600 bg-white/90 px-1.5 py-0.5 rounded-md shadow-xs">
                \${p.calories || 450} kcal
              </span>
            </div>

            <!-- Title & Short Description -->
            <div>
              <h4 class="text-xs font-black text-slate-900 leading-tight line-clamp-1">\${p.name}</h4>
              <p class="text-[10px] text-slate-400 line-clamp-1 mt-0.5">\${p.desc || 'Crispy fast food favorite'}</p>
            </div>

            <!-- Price & Add Button Row -->
            <div class="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-50">
              <span class="text-xs font-black text-orange-600 font-mono">PKR \${p.price.toLocaleString()}</span>
              
              \${qty > 0 ? \`
                <div class="flex items-center gap-1 bg-orange-50 p-0.5 rounded-full border border-orange-200">
                  <button onclick="removeFromCart('\${p.id}')" class="w-5 h-5 rounded-full bg-white text-orange-600 font-black text-xs flex items-center justify-center shadow-xs">-</button>
                  <span class="text-[11px] font-bold text-orange-700 w-4 text-center font-mono">\${qty}</span>
                  <button onclick="addToCart('\${p.id}')" class="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-xs">+</button>
                </div>
              \` : \`
                <button onclick="addToCart('\${p.id}')" class="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-orange-500/25 transition">
                  <i class="fa-solid fa-plus text-[10px]"></i>
                </button>
              \`}
            </div>
          </div>
        \`;
      }).join('');

      // 4. Calculate Subtotal and Update Floating Trays
      let subtotal = 0;
      let count = 0;
      Object.keys(currentCart).forEach(id => {
        const prod = products.find(p => p.id === id);
        if (prod) {
          subtotal += prod.price * currentCart[id];
          count += currentCart[id];
        }
      });

      const deliveryFee = storeConfig.deliveryFee || 0;
      const grandTotal = count > 0 ? subtotal + deliveryFee : 0;

      // Update Top Cart Badge
      const topBadge = document.getElementById('storefrontCartBadgeTop');
      if (topBadge) {
        if (count > 0) {
          topBadge.innerText = count;
          topBadge.classList.remove('hidden');
        } else {
          topBadge.classList.add('hidden');
        }
      }

      // Update Floating Bottom Cart Bar
      const floatingCart = document.getElementById('storefrontFloatingCart');
      if (floatingCart) {
        if (count > 0) {
          floatingCart.classList.remove('hidden');
          document.getElementById('floatingCartCount').innerText = \`\${count} \${count === 1 ? 'Item' : 'Items'} in Cart\`;
          document.getElementById('floatingCartTotal').innerText = \`PKR \${grandTotal.toLocaleString()}\`;
        } else {
          floatingCart.classList.add('hidden');
        }
      }

      // Update Modal Totals
      const subEl = document.getElementById('storefrontSubtotal');
      const delEl = document.getElementById('storefrontDelivFee');
      const totEl = document.getElementById('storefrontCartTotal');
      if (subEl) subEl.innerText = \`PKR \${subtotal.toLocaleString()}\`;
      if (delEl) delEl.innerText = deliveryFee === 0 ? 'Free (Promo)' : \`PKR \${deliveryFee.toLocaleString()}\`;
      if (totEl) totEl.innerText = \`PKR \${grandTotal.toLocaleString()}\`;
    }

    function renderKitchenKDS() {`;

const startIdx = html.indexOf(targetOldStart);
const endIdx = html.indexOf(targetOldEnd);

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + newLogic + html.substring(endIdx + targetOldEnd.length);
  console.log("Successfully updated renderStorefront and customer logic in index.html!");
} else {
  console.error("Could not locate renderStorefront bounds in html!");
}

fs.writeFileSync(indexPath, html, 'utf8');
const publicIndexPath = path.join(__dirname, '../public/index.html');
fs.writeFileSync(publicIndexPath, html, 'utf8');
