const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../apps/web/public/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const targetOldStart = `    let storefrontCategoryFilter = 'ALL';

    function filterCustomerCategory(catKey) {`;

const targetOldEnd = `    function renderKitchenKDS() {`;

const newKfcLogic = `    let kfcCategoryFilter = 'Delicious Deals';
    let kfcSearchQuery = '';
    let currentCustomProd = null;
    let customQty = 1;

    function handleKfcSearch(e) {
      kfcSearchQuery = (e.target.value || '').toLowerCase().trim();
      renderStorefront();
    }

    function filterKfcCategory(catKey) {
      kfcCategoryFilter = catKey;
      const headingEl = document.getElementById('kfcSectionHeading');
      if (headingEl) {
        headingEl.innerText = catKey === 'ALL' ? 'All Menu & Deals' : catKey;
      }
      renderStorefront();
    }

    // -------------------------------------------------------------
    // SUB-AGENT ON-PAGE CUSTOMIZATION ACTION PANEL CONTROLLER
    // -------------------------------------------------------------
    function openCustomizationOverlay(prodId, event) {
      if (event) {
        event.stopPropagation();
      }
      const prod = products.find(p => p.id === prodId);
      if (!prod) return;

      currentCustomProd = prod;
      customQty = 1;

      // Populate deal header info
      document.getElementById('customModalImage').src = getProductImage(prod);
      document.getElementById('customModalTitle').innerText = prod.name;
      document.getElementById('customModalDesc').innerText = prod.desc || 'Crispy fast food favorite meal deal.';
      document.getElementById('customModalBasePrice').innerText = \`PKR \${prod.price.toLocaleString()}\`;
      document.getElementById('customModalCalories').innerText = \`\${prod.calories || 650} kcal\`;

      // Reset Required Drink Radio Group (default to Pepsi)
      const drinkRadios = document.getElementsByName('customDrinkChoice');
      if (drinkRadios && drinkRadios.length > 0) {
        drinkRadios[0].checked = true;
      }

      // Reset Add-ons
      ['addon-piece', 'addon-sauce', 'addon-fries', 'addon-cheese'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
      });

      // Reset Notes & Fallback
      const notesEl = document.getElementById('customNotesInput');
      if (notesEl) notesEl.value = '';
      const notesCounter = document.getElementById('customNotesCounter');
      if (notesCounter) notesCounter.innerText = '0 / 140';

      const fallbackEl = document.getElementById('customFallbackSelect');
      if (fallbackEl) fallbackEl.value = 'REMOVE';

      document.getElementById('customQtyDisplay').innerText = '1';

      recalculateCustomPrice();

      const modal = document.getElementById('customizationOverlayModal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeCustomizationOverlay() {
      const modal = document.getElementById('customizationOverlayModal');
      if (modal) modal.classList.add('hidden');
      currentCustomProd = null;
    }

    function adjustCustomQty(delta) {
      customQty += delta;
      if (customQty < 1) customQty = 1;
      if (customQty > 20) customQty = 20;
      document.getElementById('customQtyDisplay').innerText = customQty;
      recalculateCustomPrice();
    }

    function recalculateCustomPrice() {
      if (!currentCustomProd) return;
      let unitPrice = currentCustomProd.price;

      // Add-ons calculation
      if (document.getElementById('addon-piece')?.checked) unitPrice += 320;
      if (document.getElementById('addon-sauce')?.checked) unitPrice += 120;
      if (document.getElementById('addon-fries')?.checked) unitPrice += 190;
      if (document.getElementById('addon-cheese')?.checked) unitPrice += 90;

      const total = unitPrice * customQty;
      const btnEl = document.getElementById('customFinalPriceButton');
      if (btnEl) btnEl.innerText = \`PKR \${total.toLocaleString()}\`;
    }

    function updateInstructionsCounter(e) {
      const len = e.target.value.length;
      const counterEl = document.getElementById('customNotesCounter');
      if (counterEl) counterEl.innerText = \`\${len} / 140\`;
    }

    function commitCustomizedItemToCart() {
      if (!currentCustomProd) return;

      // Required Drink Radio verification
      const drinkRadios = document.getElementsByName('customDrinkChoice');
      let chosenDrink = 'Pepsi 345ml';
      for (const r of drinkRadios) {
        if (r.checked) {
          chosenDrink = r.value;
          break;
        }
      }

      // Addons array
      let selectedAddons = [];
      let extraUnitCost = 0;
      if (document.getElementById('addon-piece')?.checked) { selectedAddons.push('Extra Chicken Piece (+320)'); extraUnitCost += 320; }
      if (document.getElementById('addon-sauce')?.checked) { selectedAddons.push('Garlic Mayo Dip (+120)'); extraUnitCost += 120; }
      if (document.getElementById('addon-fries')?.checked) { selectedAddons.push('Cheesy Fries Upgrade (+190)'); extraUnitCost += 190; }
      if (document.getElementById('addon-cheese')?.checked) { selectedAddons.push('Extra Cheddar (+90)'); extraUnitCost += 90; }

      const notes = document.getElementById('customNotesInput')?.value.trim() || '';
      const fallback = document.getElementById('customFallbackSelect')?.value || 'REMOVE';

      // Item descriptor for cart
      const customId = currentCustomProd.id + '-c' + Date.now().toString().slice(-4);
      const customItem = {
        id: customId,
        baseId: currentCustomProd.id,
        name: \`\${currentCustomProd.name} (\${chosenDrink.split(' ')[0]})\`,
        price: currentCustomProd.price + extraUnitCost,
        drink: chosenDrink,
        addons: selectedAddons,
        notes: notes,
        fallback: fallback,
        calories: currentCustomProd.calories,
        imageUrl: getProductImage(currentCustomProd)
      };

      // Add to products temporary registry if customized
      products.push(customItem);
      currentCart[customId] = (currentCart[customId] || 0) + customQty;

      saveState();
      closeCustomizationOverlay();
      renderAll();

      // Show alert confirmation
      alert(\`🍗 Added to Order!\n\${currentCustomProd.name} (x\${customQty})\nDrink: \${chosenDrink}\${selectedAddons.length > 0 ? '\nAdd-ons: ' + selectedAddons.join(', ') : ''}\${notes ? '\nNotes: ' + notes : ''}\`);
    }

    // -------------------------------------------------------------
    // CUSTOMER CHECKOUT MODAL DRAWER CONTROLLER
    // -------------------------------------------------------------
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
        list.innerHTML = '<div class="py-8 text-center text-xs text-slate-400">Your cart is currently empty. Add hot deals from the menu!</div>';
        return;
      }

      let html = '';
      itemIds.forEach(id => {
        const prod = products.find(p => p.id === id);
        if (prod) {
          const qty = currentCart[id];
          const lineTotal = prod.price * qty;
          const imgUrl = getProductImage(prod);
          html += \`
            <div class="p-3 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-xs text-xs">
              <img src="\${imgUrl}" alt="\${prod.name}" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100">
              <div class="flex-1 min-w-0 pr-1">
                <span class="font-extrabold text-slate-900 block truncate">\${prod.name}</span>
                \${prod.drink ? \`<span class="text-[10px] text-slate-500 block truncate">Drink: \${prod.drink}</span>\` : ''}
                \${prod.addons && prod.addons.length > 0 ? \`<span class="text-[9px] text-orange-600 block truncate">\${prod.addons.join(', ')}</span>\` : ''}
                <span class="text-xs font-mono font-black text-slate-900 block mt-0.5">PKR \${lineTotal.toLocaleString()}</span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button onclick="removeFromCart('\${prod.id}'); renderCheckoutDrawerList();" class="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center font-black text-xs text-slate-700 hover:bg-slate-200 transition">-</button>
                <span class="font-mono font-bold text-xs w-4 text-center">\${qty}</span>
                <button onclick="addToCart('\${prod.id}'); renderCheckoutDrawerList();" class="w-6 h-6 rounded-lg bg-orange-600 text-white shadow-xs flex items-center justify-center font-black text-xs hover:bg-orange-700 transition">+</button>
              </div>
            </div>
          \`;
        }
      });
      list.innerHTML = html;
    }

    // -------------------------------------------------------------
    // MAIN KFC-INSPIRED DUAL-COLUMN STOREFRONT RENDERER
    // -------------------------------------------------------------
    function renderStorefront() {
      const tabsBar = document.getElementById('kfcCategoryTabs');
      const grid = document.getElementById('kfcDealsGrid');
      const activeStoreName = document.getElementById('storefrontActiveStoreName');
      const kdsMetric = document.getElementById('subagentKdsMetric');

      if (activeStoreName) activeStoreName.innerText = storeConfig.storeName;
      if (kdsMetric) {
        const liveCooking = orders.filter(o => o.status === 'PLACED' || o.status === 'COOKING').length;
        kdsMetric.innerText = \`\${liveCooking} \${liveCooking === 1 ? 'Ticket' : 'Tickets'}\`;
      }

      if (!tabsBar || !grid) return;

      // 1. Render Category Tabs (Popular, Delicious Deals, Strong Pepsi Deals, Burgers, Pizzas, etc.)
      const kfcCategories = [
        'Delicious Deals',
        'Strong Pepsi Deals',
        'Single Deals',
        'Special Deals',
        'Burgers',
        'Signature Pizza',
        'Crispy Chicken & Wings',
        'Fries',
        'ALL'
      ];

      tabsBar.innerHTML = kfcCategories.map(cat => {
        const isActive = kfcCategoryFilter === cat;
        return \`
          <button onclick="filterKfcCategory('\${cat}')" class="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition \${isActive ? 'bg-slate-900 text-white shadow-subtle' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}">
            \${cat === 'ALL' ? 'All Items' : cat}
          </button>
        \`;
      }).join('');

      // 2. Filter products based on active tab and search query
      let filtered = products;

      if (kfcCategoryFilter !== 'ALL') {
        if (kfcCategoryFilter === 'Delicious Deals') {
          filtered = products.filter(p => 
            (p.category && (p.category.includes('Deal') || p.category.includes('Feast'))) ||
            p.name.toLowerCase().includes('deal') ||
            p.name.toLowerCase().includes('feast') ||
            p.name.toLowerCase().includes('box') ||
            p.name.toLowerCase().includes('combo')
          );
        } else if (kfcCategoryFilter === 'Strong Pepsi Deals') {
          filtered = products.filter(p => 
            p.name.toLowerCase().includes('deal') || 
            p.desc.toLowerCase().includes('drink') || 
            p.desc.toLowerCase().includes('pepsi') ||
            (p.category && p.category.includes('Deal'))
          );
        } else {
          filtered = products.filter(p => (p.category || '').toLowerCase().includes(kfcCategoryFilter.toLowerCase()));
        }
      }

      if (kfcSearchQuery) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(kfcSearchQuery) || 
          (p.desc && p.desc.toLowerCase().includes(kfcSearchQuery)) ||
          (p.category && p.category.toLowerCase().includes(kfcSearchQuery))
        );
      }

      // Fallback if empty
      if (filtered.length === 0) {
        filtered = products.slice(0, 8);
      }

      document.getElementById('kfcItemCountLabel').innerText = \`Showing \${filtered.length} Dishes\`;

      // 3. Render Dual-Column Cards matching KFC screenshot
      grid.innerHTML = filtered.map(p => {
        const qty = currentCart[p.id] || 0;
        const imgUrl = getProductImage(p);
        const isFromVariant = p.price < 400 && !p.name.toLowerCase().includes('pack');
        const priceDisplay = isFromVariant ? \`from PKR \${p.price.toLocaleString()}\` : \`PKR \${p.price.toLocaleString()}\`;

        return \`
          <div onclick="openCustomizationOverlay('\${p.id}', event)" class="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-400 hover:shadow-card p-4 sm:p-5 transition cursor-pointer flex flex-row items-center justify-between gap-4 group relative select-none">
            
            <!-- Left Column: Item Name, Price, Composition Summary & Badges -->
            <div class="flex-1 min-w-0 pr-1 space-y-1.5">
              <h4 class="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-orange-600 transition leading-snug line-clamp-2">
                \${p.name}
              </h4>
              
              <div class="font-mono font-black text-xs sm:text-sm text-slate-900">
                \${priceDisplay}
              </div>

              <p class="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                \${p.desc || 'Crispy delicious chicken fillet with seasoned fries and soft drink.'}
              </p>

              <!-- Metric & Rating Tags -->
              <div class="flex items-center gap-2 pt-1 flex-wrap">
                <span class="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60 flex items-center gap-1">
                  <i class="fa-solid fa-fire text-orange-500 text-[9px]"></i> Popular
                </span>
                <span class="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  \${p.calories || 750} kcal
                </span>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 hidden sm:inline-flex items-center gap-1">
                  <i class="fa-solid fa-thumbs-up text-emerald-600 text-[9px]"></i> 96% Match
                </span>
              </div>
            </div>

            <!-- Right Column: Food Image Asset + Embedded Floating '+' Action Circle -->
            <div class="w-28 sm:w-36 h-28 sm:h-32 rounded-2xl relative shrink-0 overflow-hidden bg-slate-100 border border-slate-200/70">
              <img src="\${imgUrl}" alt="\${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
              
              <!-- Direct Floating Action '+' Circle embedded on bottom-right corner -->
              <button onclick="openCustomizationOverlay('\${p.id}', event)" class="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-slate-900 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition transform hover:scale-110 active:scale-95 group/btn" title="Customize Deal">
                <i class="fa-solid fa-plus text-xs"></i>
              </button>

              \${qty > 0 ? \`
                <span class="absolute top-2 left-2 w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-md ring-2 ring-white">
                  \${qty}
                </span>
              \` : ''}
            </div>

          </div>
        \`;
      }).join('');

      // 4. Update Cart Totals & Floating Bar
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
      const headerCartCount = document.getElementById('storefrontHeaderCartCount');
      if (headerCartCount) headerCartCount.innerText = count;

      // Update Floating Bottom Bar
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
  html = html.substring(0, startIdx) + newKfcLogic + html.substring(endIdx + targetOldEnd.length);
  console.log("Successfully patched index.html with KFC dual-column and Sub-Agent customization logic!");
} else {
  console.error("Could not find start or end index for storefront JS logic replacement!");
}

fs.writeFileSync(indexPath, html, 'utf8');
const publicIndexPath = path.join(__dirname, '../public/index.html');
fs.writeFileSync(publicIndexPath, html, 'utf8');
