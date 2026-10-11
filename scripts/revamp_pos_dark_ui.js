const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../apps/web/public/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. REPLACEMENT FOR #view-pos MARKUP
const oldPosStart = `<div id="view-pos" class="space-y-6 view-section hidden">`;
const oldPosEnd = `<!-- SPLIT PAYMENT MODAL -->`;

const newPosMarkup = `<!-- ============================================================== -->
    <!-- SECTION 2: PRO TOUCHSCREEN POS TERMINAL (DARK LUXURY UI)      -->
    <!-- ============================================================== -->
    <div id="view-pos" class="view-section hidden">
      <!-- Outer Dark Slate Container matching reference design -->
      <div class="bg-[#1F1D2B] text-slate-100 rounded-3xl border border-[#2D303E] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[780px]">
        
        <!-- PANE 1: LEFT VERTICAL ICON SIDEBAR -->
        <aside class="w-full lg:w-24 bg-[#1F1D2B] border-b lg:border-b-0 lg:border-r border-[#2D303E] flex lg:flex-col items-center justify-between p-4 lg:py-6 shrink-0">
          <!-- Top Brand Logo -->
          <div class="flex items-center gap-2 lg:flex-col">
            <div class="w-12 h-12 rounded-2xl bg-[#EA7C69]/20 border border-[#EA7C69]/40 flex items-center justify-center text-[#EA7C69] text-xl shadow-lg shadow-[#EA7C69]/10">
              <i class="fa-solid fa-burger"></i>
            </div>
            <span class="text-[10px] font-black tracking-wider text-slate-400 uppercase hidden lg:block text-center mt-1">BC POS</span>
          </div>

          <!-- Vertical Navigation Buttons -->
          <nav class="flex lg:flex-col items-center gap-2 lg:gap-5 my-auto">
            <button onclick="switchTab('pos')" class="w-12 h-12 rounded-2xl bg-[#EA7C69] text-white flex flex-col items-center justify-center text-xs shadow-lg shadow-[#EA7C69]/30 transition" title="POS Home">
              <i class="fa-solid fa-house text-sm"></i>
              <span class="text-[8px] font-bold mt-0.5">Home</span>
            </button>
            <button onclick="filterPosCategory('ALL')" class="w-12 h-12 rounded-2xl text-[#889898] hover:text-white hover:bg-[#252836] flex flex-col items-center justify-center text-xs transition" title="All Menu">
              <i class="fa-solid fa-utensils text-sm"></i>
              <span class="text-[8px] font-medium mt-0.5">Menu</span>
            </button>
            <button onclick="switchTab('copilot')" class="w-12 h-12 rounded-2xl text-[#889898] hover:text-white hover:bg-[#252836] flex flex-col items-center justify-center text-xs transition" title="Live Orders">
              <i class="fa-solid fa-clock-rotate-left text-sm"></i>
              <span class="text-[8px] font-medium mt-0.5">Orders</span>
            </button>
            <button onclick="filterPosCategory('Single Deals')" class="w-12 h-12 rounded-2xl text-[#889898] hover:text-white hover:bg-[#252836] flex flex-col items-center justify-center text-xs transition" title="Deals & Promos">
              <i class="fa-solid fa-tags text-sm"></i>
              <span class="text-[8px] font-medium mt-0.5">Deals</span>
            </button>
            <button onclick="switchTab('kitchen')" class="w-12 h-12 rounded-2xl text-[#889898] hover:text-white hover:bg-[#252836] flex flex-col items-center justify-center text-xs transition" title="Kitchen Screen">
              <i class="fa-solid fa-fire-burner text-sm"></i>
              <span class="text-[8px] font-medium mt-0.5">Kitchen</span>
            </button>
          </nav>

          <!-- Bottom Tools -->
          <div class="flex lg:flex-col items-center gap-3">
            <button onclick="loadPresetClientMenu('burger-cottage')" class="w-10 h-10 rounded-xl bg-[#252836] hover:bg-[#2D303E] text-slate-300 hover:text-white flex items-center justify-center text-xs transition" title="Reload Burger Cottage Menu">
              <i class="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>
        </aside>

        <!-- PANE 2: MAIN PRODUCTS & CATALOG AREA -->
        <main class="flex-1 bg-[#1F1D2B] p-5 lg:p-7 flex flex-col justify-between overflow-hidden">
          <div>
            <!-- Top Restaurant Header & Live Search Bar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#2D303E]">
              <div>
                <h2 class="text-2xl font-black text-white tracking-tight flex items-center gap-2" id="posActiveStoreLabel">
                  Burger Cottage
                  <span class="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#EA7C69]/20 text-[#EA7C69] border border-[#EA7C69]/30">Open 2 PM - 4 AM</span>
                </h2>
                <p class="text-xs text-[#889898] mt-0.5">Shop 6-7, Iqbal Park, Main Blvd Defence Cantt, Lahore · 97 Items</p>
              </div>

              <!-- Search Bar -->
              <div class="relative w-full sm:w-80">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input type="text" id="posSearchInput" oninput="handlePosSearch(event)" placeholder="Search menu here..." class="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#2D303E] text-white text-xs border border-transparent focus:border-[#EA7C69] focus:outline-none placeholder-slate-400 transition">
              </div>
            </div>

            <!-- Category Pills Row (Horizontal Scroll) -->
            <div class="flex items-center gap-2.5 overflow-x-auto py-4 custom-scroll" id="posCategoryFilters">
              <!-- Dynamically rendered pills -->
            </div>

            <!-- Products Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[580px] overflow-y-auto pr-1 custom-scroll" id="posProductsGrid">
              <!-- Dynamically populated product cards -->
            </div>
          </div>
        </main>

        <!-- PANE 3: RIGHT SIDE ACTIVE ORDER TICKET -->
        <aside class="w-full lg:w-96 bg-[#1F1D2B] lg:border-l border-[#2D303E] p-5 lg:p-6 flex flex-col justify-between shrink-0">
          <div class="space-y-4">
            <!-- Order Header & Mode Selector -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-black text-white">Order</h3>
                <span class="text-[11px] font-bold text-[#EA7C69]" id="posTicketTypeBadge">🍽️ Table 1</span>
              </div>
              <button onclick="clearPosCart()" class="text-xs text-[#889898] hover:text-rose-400 font-semibold flex items-center gap-1 transition">
                <i class="fa-solid fa-trash-can text-[10px]"></i> Clear
              </button>
            </div>

            <!-- Dine-in / Takeaway / Delivery Switcher -->
            <div class="grid grid-cols-3 gap-1.5 p-1 bg-[#252836] rounded-xl border border-[#2D303E]">
              <button onclick="setPosOrderType('DINE_IN')" id="pos-btn-dinein" class="py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 bg-[#EA7C69] text-white shadow">
                🍽️ Dine In
              </button>
              <button onclick="setPosOrderType('TAKEAWAY')" id="pos-btn-takeaway" class="py-2 rounded-lg text-xs font-medium text-[#889898] hover:text-white transition flex items-center justify-center gap-1">
                🛍️ To Go
              </button>
              <button onclick="setPosOrderType('DELIVERY')" id="pos-btn-delivery" class="py-2 rounded-lg text-xs font-medium text-[#889898] hover:text-white transition flex items-center justify-center gap-1">
                🛵 Delivery
              </button>
            </div>

            <!-- Table / Token Inputs -->
            <div id="posContextInputs" class="space-y-2">
              <div id="posTableNoContainer">
                <input type="text" id="posTableNoInput" placeholder="Table Number (e.g. Table 1, Table 4)" value="Table 1" class="w-full text-xs p-2.5 rounded-xl border border-[#2D303E] bg-[#252836] text-white focus:border-[#EA7C69] focus:outline-none transition">
              </div>
              <div id="posCustomerNameContainer" class="hidden">
                <input type="text" id="posCustomerNameInput" placeholder="Walk-in Customer / Token Name" class="w-full text-xs p-2.5 rounded-xl border border-[#2D303E] bg-[#252836] text-white focus:border-[#EA7C69] focus:outline-none transition">
              </div>
              <div id="posDeliveryDetailsContainer" class="hidden space-y-2">
                <input type="tel" id="posDeliveryPhoneInput" placeholder="WhatsApp / Phone (03xxxxxxxxx)" class="w-full text-xs p-2.5 rounded-xl border border-[#2D303E] bg-[#252836] text-white focus:border-[#EA7C69] focus:outline-none transition">
                <input type="text" id="posDeliveryAddressInput" placeholder="Delivery Address (House / Street / Cantt)" class="w-full text-xs p-2.5 rounded-xl border border-[#2D303E] bg-[#252836] text-white focus:border-[#EA7C69] focus:outline-none transition">
              </div>
            </div>

            <!-- Ticket Items List -->
            <div class="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scroll" id="posTicketItemsList">
              <div class="py-12 text-center text-[#889898] text-xs space-y-2">
                <i class="fa-solid fa-burger text-3xl text-slate-700"></i>
                <p>No items in ticket yet.</p>
                <p class="text-[10px] text-slate-500">Tap any food card on the left to add.</p>
              </div>
            </div>
          </div>

          <!-- Bottom Totals & Payment Actions -->
          <div class="pt-4 border-t border-[#2D303E] space-y-3">
            <div class="space-y-1.5 text-xs text-[#889898]">
              <div class="flex justify-between">
                <span>Sub Total</span>
                <span class="font-mono font-bold text-white" id="posSubtotal">PKR 0</span>
              </div>
              <div class="flex justify-between" id="posDeliveryRow">
                <span>Delivery Fee</span>
                <span class="font-mono font-bold text-white" id="posDeliveryFee">PKR 0</span>
              </div>
              <div class="border-b border-dashed border-[#2D303E] my-1"></div>
              <div class="flex justify-between text-base font-extrabold text-white pt-1">
                <span>Total</span>
                <span class="font-mono text-xl text-white font-black" id="posGrandTotal">PKR 0</span>
              </div>
            </div>

            <!-- Big Coral "Print bills" CTA Button from screenshot -->
            <button onclick="punchPosOrder('CASH')" class="w-full py-3.5 bg-[#EA7C69] hover:bg-[#d86b59] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-[#EA7C69]/20">
              <i class="fa-solid fa-print text-sm"></i> Print bills & Settle Cash
            </button>

            <!-- Fast Digital & Split Payment Buttons -->
            <div class="grid grid-cols-2 gap-2">
              <button onclick="punchPosOrder('DIGITAL')" class="py-2.5 bg-[#252836] hover:bg-[#2D303E] border border-[#2D303E] text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-mobile-screen-button text-[#EA7C69]"></i> JazzCash/Bank
              </button>
              <button onclick="openSplitPaymentModal()" class="py-2.5 bg-[#252836] hover:bg-[#2D303E] border border-[#2D303E] text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-arrows-split-up-and-left text-emerald-400"></i> Split Payment
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>

    <!-- SPLIT PAYMENT MODAL -->`;

const startIndex = html.indexOf(oldPosStart);
const endIndex = html.indexOf(oldPosEnd);

if (startIndex !== -1 && endIndex !== -1) {
  html = html.substring(0, startIndex) + newPosMarkup + html.substring(endIndex + oldPosEnd.length);
  console.log("Successfully replaced view-pos HTML markup!");
} else {
  console.error("Could not find view-pos block in html!");
}

fs.writeFileSync(indexPath, html, 'utf8');
const publicIndexPath = path.join(__dirname, '../public/index.html');
fs.writeFileSync(publicIndexPath, html, 'utf8');
