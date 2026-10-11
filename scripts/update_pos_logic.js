const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../apps/web/public/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const oldLogicStart = `    let posCart = {}; // { [productId]: qty }
    let posOrderType = 'DINE_IN'; // 'DINE_IN', 'TAKEAWAY', 'DELIVERY'
    let posCategoryFilter = 'ALL';`;

const targetFunctionEnd = `    function getPosOrderDetails() {`;

const newLogic = `    let posCart = {}; // { [productId]: qty }
    let posOrderType = 'DINE_IN'; // 'DINE_IN', 'TAKEAWAY', 'DELIVERY'
    let posCategoryFilter = 'ALL';
    let posSearchQuery = '';

    function handlePosSearch(e) {
      posSearchQuery = (e.target.value || '').toLowerCase().trim();
      renderPosGrid();
    }

    // High quality food imagery mapped to categories & items
    function getProductImage(prod) {
      if (prod.imageUrl && prod.imageUrl.startsWith('http')) return prod.imageUrl;
      const name = (prod.name || '').toLowerCase();
      const cat = (prod.category || '').toLowerCase();
      
      if (name.includes('zinger') || name.includes('xinger')) {
        return 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80';
      }
      if (name.includes('double') || name.includes('tower') || name.includes('mighty')) {
        return 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80';
      }
      if (name.includes('black') || name.includes('special')) {
        return 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('burger') || name.includes('burger')) {
        return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('pizza') || name.includes('pizza')) {
        return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('deal') || cat.includes('combo') || name.includes('deal') || name.includes('feast')) {
        return 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('shawarma') || cat.includes('wrap') || name.includes('shawarma') || name.includes('wrap') || name.includes('donner')) {
        return 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('paratha') || name.includes('paratha')) {
        return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('wing') || cat.includes('nugget') || name.includes('wing') || name.includes('chicken') || name.includes('nugget')) {
        return 'https://images.unsplash.com/photo-1527477321055-43615b629c95?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('fries') || name.includes('fries')) {
        return 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('pasta') || name.includes('pasta')) {
        return 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('sandwich') || name.includes('sandwich')) {
        return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80';
      }
      if (cat.includes('drink') || name.includes('drink') || name.includes('ltr')) {
        return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80';
      }
      return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80';
    }

    function setPosOrderType(type) {
      posOrderType = type;
      const btnDinein = document.getElementById('pos-btn-dinein');
      const btnTakeaway = document.getElementById('pos-btn-takeaway');
      const btnDelivery = document.getElementById('pos-btn-delivery');

      [btnDinein, btnTakeaway, btnDelivery].forEach(b => {
        if (b) {
          b.className = 'py-2 rounded-lg text-xs font-medium text-[#889898] hover:text-white transition flex items-center justify-center gap-1';
        }
      });

      const activeBtn = type === 'DINE_IN' ? btnDinein : (type === 'TAKEAWAY' ? btnTakeaway : btnDelivery);
      if (activeBtn) {
        activeBtn.className = 'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 bg-[#EA7C69] text-white shadow';
      }

      const tableCont = document.getElementById('posTableNoContainer');
      const custCont = document.getElementById('posCustomerNameContainer');
      const delivCont = document.getElementById('posDeliveryDetailsContainer');
      const badge = document.getElementById('posTicketTypeBadge');

      if (tableCont && custCont && delivCont && badge) {
        if (type === 'DINE_IN') {
          tableCont.classList.remove('hidden');
          custCont.classList.add('hidden');
          delivCont.classList.add('hidden');
          const tVal = document.getElementById('posTableNoInput')?.value || 'Table 1';
          badge.innerText = '🍽️ ' + tVal;
        } else if (type === 'TAKEAWAY') {
          tableCont.classList.add('hidden');
          custCont.classList.remove('hidden');
          delivCont.classList.add('hidden');
          badge.innerText = '🛍️ Counter Takeaway';
        } else if (type === 'DELIVERY') {
          tableCont.classList.add('hidden');
          custCont.classList.add('hidden');
          delivCont.classList.remove('hidden');
          badge.innerText = '🛵 Delivery Courier';
        }
      }

      renderPosTicket();
    }

    function addToPosCart(prodId) {
      posCart[prodId] = (posCart[prodId] || 0) + 1;
      renderPosTicket();
      renderPosGrid();
    }

    function removeFromPosCart(prodId) {
      if (posCart[prodId]) {
        posCart[prodId]--;
        if (posCart[prodId] <= 0) delete posCart[prodId];
      }
      renderPosTicket();
      renderPosGrid();
    }

    function clearPosCart() {
      posCart = {};
      renderPosTicket();
      renderPosGrid();
    }

    function filterPosCategory(cat) {
      posCategoryFilter = cat;
      renderPosGrid();
    }

    function renderPos() {
      const activeStoreLabel = document.getElementById('posActiveStoreLabel');
      if (activeStoreLabel) {
        activeStoreLabel.innerHTML = \`\${storeConfig.storeName} <span class="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#EA7C69]/20 text-[#EA7C69] border border-[#EA7C69]/30">Open 2 PM - 4 AM</span>\`;
      }
      renderPosGrid();
      renderPosTicket();
    }

    function renderPosGrid() {
      const filterBar = document.getElementById('posCategoryFilters');
      const grid = document.getElementById('posProductsGrid');
      if (!filterBar || !grid) return;

      const categoryIcons = {
        'ALL': 'fa-solid fa-border-all',
        'Single Deals': 'fa-solid fa-gift',
        'Special Deals': 'fa-solid fa-tags',
        'Jumbo Deals': 'fa-solid fa-crown',
        'Burgers': 'fa-solid fa-burger',
        'Shawarma': 'fa-solid fa-utensils',
        'Paratha': 'fa-solid fa-bread-slice',
        'Wraps': 'fa-solid fa-scroll',
        'Sandwiches': 'fa-solid fa-cubes',
        'Platters': 'fa-solid fa-plate-wheat',
        'Crispy Chicken & Wings': 'fa-solid fa-drumstick-bite',
        'Fries': 'fa-solid fa-fire',
        'Pasta': 'fa-solid fa-bowl-food',
        'Signature Pizza': 'fa-solid fa-pizza-slice',
        'Traditional Pizza': 'fa-solid fa-pizza-slice',
        'Sides & Drinks': 'fa-solid fa-wine-glass',
        'General': 'fa-solid fa-utensils'
      };

      const categories = ['ALL', ...new Set(products.map(p => p.category || 'General'))];
      filterBar.innerHTML = categories.map(cat => {
        const isActive = posCategoryFilter === cat;
        const iconClass = categoryIcons[cat] || 'fa-solid fa-bowl-food';
        return \`
          <button onclick="filterPosCategory('\${cat}')" class="px-4 py-2 rounded-2xl text-xs whitespace-nowrap transition flex items-center gap-2 border \${isActive ? 'bg-[#EA7C69] text-white border-[#EA7C69] font-bold shadow-lg shadow-[#EA7C69]/20' : 'bg-[#252836] text-[#889898] hover:text-white border-[#2D303E] font-medium'}">
            <i class="\${iconClass} text-xs"></i>
            <span>\${cat}</span>
          </button>
        \`;
      }).join('');

      let filteredProducts = posCategoryFilter === 'ALL' ? products : products.filter(p => (p.category || 'General') === posCategoryFilter);

      if (posSearchQuery) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(posSearchQuery) || 
          (p.category && p.category.toLowerCase().includes(posSearchQuery))
        );
      }

      if (filteredProducts.length === 0) {
        grid.innerHTML = \`
          <div class="col-span-4 py-16 text-center bg-[#252836] rounded-3xl border border-[#2D303E] p-6 space-y-3">
            <i class="fa-solid fa-magnifying-glass text-3xl text-slate-600"></i>
            <p class="text-sm font-bold text-white">No dishes found matching "\${posSearchQuery || posCategoryFilter}"</p>
            <p class="text-xs text-[#889898]">Try another category or clear the search filter.</p>
            <button onclick="posSearchQuery=''; document.getElementById('posSearchInput').value=''; filterPosCategory('ALL');" class="mt-2 px-4 py-2 bg-[#EA7C69] text-white rounded-xl text-xs font-bold transition">
              Show All \${products.length} Items
            </button>
          </div>
        \`;
        return;
      }

      grid.innerHTML = filteredProducts.map(p => {
        const qty = posCart[p.id] || 0;
        const imgUrl = getProductImage(p);
        return \`
          <div onclick="addToPosCart('\${p.id}')" class="bg-[#252836] hover:bg-[#282B3B] p-3 rounded-2xl border \${qty > 0 ? 'border-[#EA7C69] shadow-lg shadow-[#EA7C69]/15' : 'border-[#2D303E]'} hover:border-[#EA7C69] cursor-pointer transition select-none flex flex-col justify-between group relative">
            
            <!-- Food Image Thumbnail with Hover Zoom -->
            <div class="w-full h-28 rounded-xl overflow-hidden mb-2.5 bg-[#1F1D2B] relative">
              <img src="\${imgUrl}" alt="\${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
              
              <!-- Cart Badge -->
              \${qty > 0 ? \`<span class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#EA7C69] text-white text-xs font-black flex items-center justify-center shadow-lg ring-2 ring-[#1F1D2B]">\${qty}</span>\` : ''}
              
              <!-- Calories Badge on Image -->
              <span class="absolute bottom-1.5 left-1.5 bg-[#1F1D2B]/85 backdrop-blur-sm text-[#EA7C69] text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/5">
                \${p.calories || 450} kcal
              </span>
            </div>

            <!-- Item Name -->
            <h4 class="text-xs font-bold text-white line-clamp-1 group-hover:text-[#EA7C69] transition">\${p.name}</h4>
            
            <!-- Price and Details -->
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-[#2D303E]/60">
              <div>
                <span class="text-sm font-black text-white font-mono">PKR \${p.price.toLocaleString()}</span>
              </div>
              <span class="text-[10px] text-[#889898]">\${p.stock || 50} in stock</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderPosTicket() {
      const list = document.getElementById('posTicketItemsList');
      const subtotalEl = document.getElementById('posSubtotal');
      const delivEl = document.getElementById('posDeliveryFee');
      const delivRow = document.getElementById('posDeliveryRow');
      const totalEl = document.getElementById('posGrandTotal');
      if (!list || !subtotalEl || !delivEl || !totalEl) return;

      const itemIds = Object.keys(posCart);
      if (itemIds.length === 0) {
        list.innerHTML = \`
          <div class="py-16 text-center text-[#889898] text-xs space-y-2">
            <i class="fa-solid fa-burger text-3xl text-slate-700 block"></i>
            <p class="font-medium text-slate-300">No items added to ticket yet.</p>
            <p class="text-[10px] text-[#889898]">Tap dishes on the left to punch order.</p>
          </div>
        \`;
        subtotalEl.innerText = 'PKR 0';
        delivEl.innerText = 'PKR 0';
        totalEl.innerText = 'PKR 0';
        return;
      }

      let subtotal = 0;
      let html = '';

      itemIds.forEach(id => {
        const prod = products.find(p => p.id === id);
        if (prod) {
          const qty = posCart[id];
          const lineTotal = prod.price * qty;
          subtotal += lineTotal;
          const imgUrl = getProductImage(prod);
          html += \`
            <div class="p-2.5 bg-[#252836] rounded-xl border border-[#2D303E] flex items-center justify-between text-xs gap-2">
              <img src="\${imgUrl}" alt="\${prod.name}" class="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/5">
              <div class="flex-1 min-w-0 pr-1">
                <span class="font-bold text-white block truncate">\${prod.name} (\${qty}x)</span>
                <span class="text-[10px] text-[#889898] font-mono">PKR \${prod.price.toLocaleString()} each</span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="removeFromPosCart('\${prod.id}')" class="w-6 h-6 rounded-lg bg-[#2D303E] hover:bg-[#EA7C69] hover:text-white text-slate-300 text-xs font-bold flex items-center justify-center transition">-</button>
                <span class="font-bold text-xs w-4 text-center text-white font-mono">\${qty}</span>
                <button onclick="addToPosCart('\${prod.id}')" class="w-6 h-6 rounded-lg bg-[#2D303E] hover:bg-[#EA7C69] hover:text-white text-slate-300 text-xs font-bold flex items-center justify-center transition">+</button>
                <span class="font-mono font-black text-white ml-1 w-14 text-right">PKR \${lineTotal.toLocaleString()}</span>
              </div>
            </div>
          \`;
        }
      });

      list.innerHTML = html;

      const deliveryFee = posOrderType === 'DELIVERY' ? (storeConfig.deliveryFee || 150) : 0;
      const grandTotal = subtotal + deliveryFee;

      subtotalEl.innerText = \`PKR \${subtotal.toLocaleString()}\`;
      delivEl.innerText = \`PKR \${deliveryFee.toLocaleString()}\`;
      if (posOrderType === 'DELIVERY') {
        if (delivRow) delivRow.classList.remove('hidden');
      } else {
        if (delivRow) delivRow.classList.add('hidden');
      }
      totalEl.innerText = \`PKR \${grandTotal.toLocaleString()}\`;
    }

`;

const sIdx = html.indexOf(oldLogicStart);
const eIdx = html.indexOf(targetFunctionEnd);

if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx) + newLogic + html.substring(eIdx);
  console.log("Successfully updated POS logic in index.html!");
} else {
  console.error("Could not find start or end index for logic replacement!");
}

fs.writeFileSync(indexPath, html, 'utf8');
const publicIndexPath = path.join(__dirname, '../public/index.html');
fs.writeFileSync(publicIndexPath, html, 'utf8');
