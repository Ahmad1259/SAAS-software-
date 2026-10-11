const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../apps/web/public/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. REPLACEMENT FOR #view-storefront MARKUP
const oldStorefrontStart = `<!-- SECTION 3: CUSTOMER STOREFRONT (MOBILE-APP LUXURY FAST FOOD UI) -->
    <!-- ============================================================== -->
    <div id="view-storefront" class="max-w-md md:max-w-lg mx-auto view-section hidden pb-24">`;

const oldStorefrontEnd = `<!-- ============================================================== -->
    <!-- SECTION 3: KITCHEN PRODUCTION DISPLAY (Sub-Agent 3 Batcher)    -->`;

const newKfcStorefrontMarkup = `<!-- SECTION 3: INTERACTIVE STOREFRONT (KFC-INSPIRED DUAL-COLUMN WITH SUB-AGENTS) -->
    <!-- ============================================================== -->
    <div id="view-storefront" class="max-w-5xl mx-auto view-section hidden pb-28 space-y-7">
      
      <!-- 1. TOP SUB-AGENTS MONITORING ROW (Autonomous Ecosystem Live) -->
      <div class="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-subtle space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span class="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Sub-Agent Network Synchronized
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <span id="storefrontHeading">Burger Cottage</span>
              <span class="text-xs font-bold text-slate-400 font-mono bg-slate-100 px-2.5 py-1 rounded-xl">KFC-Tier Storefront</span>
            </h2>
            <p class="text-xs text-slate-500">Autonomous multi-agent architecture: real-time live monitoring paired with on-page instant deal customization.</p>
          </div>

          <!-- Quick Cart Trigger -->
          <div class="flex items-center gap-2 self-start sm:self-center">
            <button onclick="openCustomerCheckoutModal()" class="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2.5 shadow-subtle transition">
              <i class="fa-solid fa-basket-shopping text-orange-400"></i>
              <span>Active Cart</span>
              <span id="storefrontHeaderCartCount" class="w-5 h-5 rounded-full bg-orange-600 text-white font-black text-[10px] flex items-center justify-center">0</span>
            </button>
          </div>
        </div>

        <!-- EXACTLY 4 SPECIALIZED SYSTEM SUB-AGENTS STATUS CARDS -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- 1. Co-Pilot Grid (Active / Optimization State) -->
          <div onclick="switchTab('copilot')" class="p-3.5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-subtle transition cursor-pointer group">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Agent 01</span>
              <span class="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
              </span>
            </div>
            <h4 class="text-xs font-black text-slate-900 group-hover:text-orange-600 transition flex items-center gap-1.5">
              <i class="fa-solid fa-wand-magic-sparkles text-orange-500 text-[11px]"></i> Co-Pilot Grid
            </h4>
            <p class="text-[10px] text-slate-500 mt-0.5">Optimization State</p>
            <div class="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono">
              <span class="text-slate-400">Reliability:</span>
              <span class="font-bold text-emerald-600">99.98% OK</span>
            </div>
          </div>

          <!-- 2. Cashier POS (Ready / Processing State) -->
          <div onclick="switchTab('pos')" class="p-3.5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-subtle transition cursor-pointer group">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Agent 02</span>
              <span class="flex items-center gap-1 text-[9px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Ready
              </span>
            </div>
            <h4 class="text-xs font-black text-slate-900 group-hover:text-teal-600 transition flex items-center gap-1.5">
              <i class="fa-solid fa-cash-register text-teal-500 text-[11px]"></i> Cashier POS
            </h4>
            <p class="text-[10px] text-slate-500 mt-0.5">Processing State</p>
            <div class="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono">
              <span class="text-slate-400">Terminal:</span>
              <span class="font-bold text-teal-600">Online 0ms</span>
            </div>
          </div>

          <!-- 3. Kitchen KDS (Live Queue Monitoring State) -->
          <div onclick="switchTab('kitchen')" class="p-3.5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-subtle transition cursor-pointer group">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Agent 03</span>
              <span class="flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Live Queue
              </span>
            </div>
            <h4 class="text-xs font-black text-slate-900 group-hover:text-amber-600 transition flex items-center gap-1.5">
              <i class="fa-solid fa-fire-burner text-amber-500 text-[11px]"></i> Kitchen KDS
            </h4>
            <p class="text-[10px] text-slate-500 mt-0.5">Monitoring State</p>
            <div class="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono">
              <span class="text-slate-400">Queued:</span>
              <span class="font-bold text-amber-600" id="subagentKdsMetric">0 Tickets</span>
            </div>
          </div>

          <!-- 4. Dispatch & Riders (Route Optimization State) -->
          <div onclick="switchTab('dispatch')" class="p-3.5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-subtle transition cursor-pointer group">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Agent 04</span>
              <span class="flex items-center gap-1 text-[9px] font-bold text-cyan-700 bg-cyan-100/70 px-2 py-0.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Proximity
              </span>
            </div>
            <h4 class="text-xs font-black text-slate-900 group-hover:text-cyan-600 transition flex items-center gap-1.5">
              <i class="fa-solid fa-motorcycle text-cyan-500 text-[11px]"></i> Dispatch & Riders
            </h4>
            <p class="text-[10px] text-slate-500 mt-0.5">Route Optimization</p>
            <div class="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono">
              <span class="text-slate-400">Fleet ETA:</span>
              <span class="font-bold text-cyan-600">40 Min Avg</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. KFC-INSPIRED SEARCH & CATEGORY NAVIGATION BAR -->
      <div class="bg-white rounded-3xl border border-slate-200/80 p-3 sm:p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input type="text" id="kfcSearchInput" oninput="handleKfcSearch(event)" placeholder="Search Burger Cottage deals & menu..." class="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 text-slate-900 text-xs border border-slate-200 focus:bg-white focus:border-orange-500 focus:outline-none transition">
        </div>

        <!-- Horizontal Scrollable Category Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scroll" id="kfcCategoryTabs">
          <!-- Dynamically populated category buttons -->
        </div>
      </div>

      <!-- 3. MAIN DUAL-COLUMN DEALS & PRODUCT LISTINGS GRID -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-lg font-black text-slate-900 tracking-tight" id="kfcSectionHeading">Delicious Deals</h3>
          <span class="text-xs font-semibold text-slate-400" id="kfcItemCountLabel">Showing Deals</span>
        </div>

        <!-- Dual-Column Responsive Grid (KFC Pakistan Layout) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="kfcDealsGrid">
          <!-- Dynamically rendered KFC style deal cards -->
        </div>
      </div>

      <!-- 4. FLOATING CHECKOUT BAR (WHEN CART HAS ITEMS) -->
      <div id="storefrontFloatingCart" class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-slate-950 text-white rounded-3xl p-3.5 shadow-2xl border border-white/10 flex items-center justify-between z-40 transition-all transform duration-300 hidden">
        <div class="flex items-center gap-3 pl-2">
          <div class="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow">
            <i class="fa-solid fa-bag-shopping"></i>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block" id="floatingCartCount">0 Items in Cart</span>
            <span class="text-sm font-black text-white font-mono" id="floatingCartTotal">PKR 0</span>
          </div>
        </div>
        <button onclick="openCustomerCheckoutModal()" class="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition">
          View Cart & Order <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>

      <!-- 5. ON-PAGE SUB-AGENT CUSTOMIZATION ACTION PANEL / DRAWER -->
      <div id="customizationOverlayModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 hidden">
        <div class="bg-white rounded-t-[36px] sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Modal Header -->
          <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">Sub-Agent 01 Contextual Configurator</span>
            </div>
            <button onclick="closeCustomizationOverlay()" class="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-900 border border-slate-200 flex items-center justify-center text-sm transition">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Scrollable Customization Content -->
          <div class="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scroll flex-1">
            
            <!-- Deal Summary Card Header -->
            <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <img id="customModalImage" src="" alt="Deal" class="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0">
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-black text-slate-950 leading-tight" id="customModalTitle">Zinger, Strips N Dips</h3>
                <p class="text-xs text-slate-500 mt-0.5 line-clamp-2" id="customModalDesc">4 Zingers, 8 Strips, 3 Dips & 1.5Ltr Drink</p>
                <div class="flex items-center gap-2 mt-1.5">
                  <span class="text-sm font-black text-slate-950 font-mono" id="customModalBasePrice">PKR 620.00</span>
                  <span class="text-[10px] font-bold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-full" id="customModalCalories">840 kcal</span>
                </div>
              </div>
            </div>

            <!-- SECTION A: REQUIRED CHOICE SELECTION ("Choose Your Soft Drink") -->
            <div class="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-black text-slate-900 flex items-center gap-2">
                    <i class="fa-solid fa-glass-water text-orange-500"></i> Choose Your Soft Drink
                  </h4>
                  <p class="text-[11px] text-slate-500">Select 1 beverage included in your meal</p>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider">
                  Required
                </span>
              </div>

              <!-- Radio Group for Drinks -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 cursor-pointer transition bg-slate-50/50 hover:bg-orange-50/30">
                  <div class="flex items-center gap-2.5">
                    <input type="radio" name="customDrinkChoice" value="Pepsi 345ml Regular" checked onchange="recalculateCustomPrice()" class="text-orange-600 focus:ring-orange-500">
                    <span class="font-bold text-slate-800">Pepsi 345ml</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400">Included</span>
                </label>

                <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 cursor-pointer transition bg-slate-50/50 hover:bg-orange-50/30">
                  <div class="flex items-center gap-2.5">
                    <input type="radio" name="customDrinkChoice" value="7Up 345ml Regular" onchange="recalculateCustomPrice()" class="text-orange-600 focus:ring-orange-500">
                    <span class="font-bold text-slate-800">7Up 345ml</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400">Included</span>
                </label>

                <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 cursor-pointer transition bg-slate-50/50 hover:bg-orange-50/30">
                  <div class="flex items-center gap-2.5">
                    <input type="radio" name="customDrinkChoice" value="Mirinda 345ml Regular" onchange="recalculateCustomPrice()" class="text-orange-600 focus:ring-orange-500">
                    <span class="font-bold text-slate-800">Mirinda 345ml</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400">Included</span>
                </label>

                <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 cursor-pointer transition bg-slate-50/50 hover:bg-orange-50/30">
                  <div class="flex items-center gap-2.5">
                    <input type="radio" name="customDrinkChoice" value="Mountain Dew 345ml" onchange="recalculateCustomPrice()" class="text-orange-600 focus:ring-orange-500">
                    <span class="font-bold text-slate-800">Mountain Dew</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400">Included</span>
                </label>
              </div>
            </div>

            <!-- SECTION B: ADD-ONS & UPGRADES (Checkboxes with Incremental Modifiers) -->
            <div class="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-black text-slate-900 flex items-center gap-2">
                    <i class="fa-solid fa-plus-circle text-orange-500"></i> Add-ons & Upgrades
                  </h4>
                  <p class="text-[11px] text-slate-500">Custom modifiers handled by Kitchen KDS Batcher</p>
                </div>
                <span class="text-[10px] font-semibold text-slate-400">Optional</span>
              </div>

              <div class="space-y-2 text-xs pt-1">
                <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-400 cursor-pointer transition bg-slate-50/40">
                  <div class="flex items-center gap-2.5">
                    <input type="checkbox" id="addon-piece" value="320" onchange="recalculateCustomPrice()" class="rounded text-orange-600 focus:ring-orange-500">
                    <div>
                      <span class="font-bold text-slate-900 block">Extra Crispy Chicken Piece</span>
                      <span class="text-[10px] text-slate-400">+290 kcal</span>
                    </div>
                  </div>
                  <span class="font-mono font-bold text-slate-800">+ PKR 320.00</span>
                </label>

                <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-400 cursor-pointer transition bg-slate-50/40">
                  <div class="flex items-center gap-2.5">
                    <input type="checkbox" id="addon-sauce" value="120" onchange="recalculateCustomPrice()" class="rounded text-orange-600 focus:ring-orange-500">
                    <div>
                      <span class="font-bold text-slate-900 block">Colonel's Secret Garlic Mayo Dip</span>
                      <span class="text-[10px] text-slate-400">+80 kcal</span>
                    </div>
                  </div>
                  <span class="font-mono font-bold text-slate-800">+ PKR 120.00</span>
                </label>

                <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-400 cursor-pointer transition bg-slate-50/40">
                  <div class="flex items-center gap-2.5">
                    <input type="checkbox" id="addon-fries" value="190" onchange="recalculateCustomPrice()" class="rounded text-orange-600 focus:ring-orange-500">
                    <div>
                      <span class="font-bold text-slate-900 block">Cheesy Loaded Fries Upgrade</span>
                      <span class="text-[10px] text-slate-400">+210 kcal</span>
                    </div>
                  </div>
                  <span class="font-mono font-bold text-slate-800">+ PKR 190.00</span>
                </label>

                <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-400 cursor-pointer transition bg-slate-50/40">
                  <div class="flex items-center gap-2.5">
                    <input type="checkbox" id="addon-cheese" value="90" onchange="recalculateCustomPrice()" class="rounded text-orange-600 focus:ring-orange-500">
                    <div>
                      <span class="font-bold text-slate-900 block">Extra Melted Cheddar Slice</span>
                      <span class="text-[10px] text-slate-400">+60 kcal</span>
                    </div>
                  </div>
                  <span class="font-mono font-bold text-slate-800">+ PKR 90.00</span>
                </label>
              </div>
            </div>

            <!-- SECTION C: SPECIAL INSTRUCTIONS (Max 140 Chars) -->
            <div class="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 class="text-xs font-black text-slate-900 flex items-center gap-2">
                <i class="fa-solid fa-pen-to-square text-orange-500"></i> Special Instructions
              </h4>
              <textarea id="customNotesInput" maxlength="140" oninput="updateInstructionsCounter(event)" placeholder="e.g., no mayo, extra crispy skin, well done, extra napkins" rows="2" class="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:outline-none transition resize-none"></textarea>
              <div class="flex justify-between text-[10px] text-slate-400">
                <span>Direct transmission to Kitchen KDS</span>
                <span id="customNotesCounter">0 / 140</span>
              </div>
            </div>

            <!-- SECTION D: DYNAMIC FALLBACK ROUTINE -->
            <div class="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 class="text-xs font-black text-slate-900 flex items-center gap-2">
                <i class="fa-solid fa-arrows-split-up-and-left text-orange-500"></i> If this product is not available:
              </h4>
              <select id="customFallbackSelect" class="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-orange-500 focus:outline-none transition">
                <option value="REMOVE">Remove it from my order</option>
                <option value="CALL">Call me to confirm alternative</option>
                <option value="SUBSTITUTE">Substitute with nearest equivalent deal</option>
              </select>
            </div>

          </div>

          <!-- PERSISTENT BOTTOM ACTION BAR (Step Counter + Full Width Add to Cart) -->
          <div class="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center gap-3 shrink-0 shadow-elevated">
            <!-- Step Counter [-] 1 [+] -->
            <div class="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200/80 shrink-0">
              <button onclick="adjustCustomQty(-1)" class="w-9 h-9 rounded-xl bg-white shadow-xs hover:bg-slate-200 flex items-center justify-center font-black text-sm text-slate-700 transition">-</button>
              <span id="customQtyDisplay" class="w-8 text-center font-mono font-black text-sm text-slate-900">1</span>
              <button onclick="adjustCustomQty(1)" class="w-9 h-9 rounded-xl bg-white shadow-xs hover:bg-slate-200 flex items-center justify-center font-black text-sm text-slate-700 transition">+</button>
            </div>

            <!-- Full-width CTA Add to Cart -->
            <button onclick="commitCustomizedItemToCart()" class="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between px-5 shadow-lg shadow-orange-600/30 transition">
              <span>Add to Cart</span>
              <span id="customFinalPriceButton" class="font-mono font-black">PKR 620.00</span>
            </button>
          </div>

        </div>
      </div>

      <!-- 6. CUSTOMER CHECKOUT MODAL DRAWER -->
      <div id="customerCheckoutModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 hidden">
        <div class="bg-white rounded-t-[36px] sm:rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto custom-scroll">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center text-sm shadow-sm">
                <i class="fa-solid fa-receipt"></i>
              </div>
              <h3 class="text-base font-black text-slate-950">Aapka Order & Details</h3>
            </div>
            <button onclick="closeCustomerCheckoutModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Cart Review List -->
          <div class="space-y-2 max-h-48 overflow-y-auto custom-scroll pr-1" id="checkoutItemsList">
            <!-- Rendered dynamically -->
          </div>

          <!-- Bill Summary -->
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Items Total:</span>
              <span class="font-mono font-bold text-slate-900" id="storefrontSubtotal">PKR 0</span>
            </div>
            <div class="flex justify-between">
              <span>Delivery Fee:</span>
              <span class="font-mono font-bold text-emerald-600" id="storefrontDelivFee">Free (Promo)</span>
            </div>
            <div class="border-t border-slate-200 pt-1 flex justify-between font-black text-sm text-slate-950">
              <span>Grand Total:</span>
              <span class="font-mono text-orange-600" id="storefrontCartTotal">PKR 0</span>
            </div>
          </div>

          <!-- Customer Address & Contact Form -->
          <div class="space-y-2">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Aapka Naam (Customer Name)</label>
              <input type="text" id="custNameInput" placeholder="Ali Khan" class="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-0.5">WhatsApp Number (For instant delivery updates)</label>
              <input type="tel" id="custPhoneInput" placeholder="03054122075" class="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Complete Delivery Address</label>
              <input type="text" id="custAddressInput" placeholder="House 12, Street 4, Phase 5 DHA, Lahore" class="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Payment Method</label>
              <select id="custPaymentInput" class="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="COD">💵 Cash on Delivery (COD)</option>
                <option value="JAZZCASH">📱 JazzCash / Easypaisa</option>
                <option value="BANK_TRANSFER">🏦 Bank Transfer / Raast</option>
              </select>
            </div>
          </div>

          <!-- Checkout Button -->
          <button onclick="placeCustomerOrder()" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition">
            <i class="fa-brands fa-whatsapp text-base"></i> Confirm & Send Order on WhatsApp
          </button>
        </div>
      </div>

    </div>

    <!-- ============================================================== -->`;

const startIdx = html.indexOf(oldStorefrontStart);
const endIdx = html.indexOf(oldStorefrontEnd);

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + newKfcStorefrontMarkup + html.substring(endIdx);
  console.log("Successfully replaced view-storefront with KFC-tier layout!");
} else {
  console.error("Could not find start or end index for view-storefront!");
}

fs.writeFileSync(indexPath, html, 'utf8');
const publicIndexPath = path.join(__dirname, '../public/index.html');
fs.writeFileSync(publicIndexPath, html, 'utf8');
