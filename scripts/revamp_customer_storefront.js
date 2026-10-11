const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../apps/web/public/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. REPLACEMENT FOR #view-storefront MARKUP
const oldStorefrontStart = `<!-- SECTION 3: CUSTOMER STOREFRONT (Mobile-first Linear Aesthetic) -->
    <!-- ============================================================== -->
    <div id="view-storefront" class="max-w-md mx-auto space-y-5 view-section hidden">`;

const oldStorefrontEnd = `<!-- ============================================================== -->
    <!-- SECTION 3: KITCHEN PRODUCTION DISPLAY (Sub-Agent 3 Batcher)    -->`;

const newStorefrontMarkup = `<!-- SECTION 3: CUSTOMER STOREFRONT (MOBILE-APP LUXURY FAST FOOD UI) -->
    <!-- ============================================================== -->
    <div id="view-storefront" class="max-w-md md:max-w-lg mx-auto view-section hidden pb-24">
      
      <!-- Outer App Frame with Warm Cream Background -->
      <div class="bg-[#FFF9F2] text-slate-900 rounded-[36px] border border-orange-100 shadow-xl overflow-hidden p-4 md:p-6 space-y-5 font-sans">
        
        <!-- TOP APP HEADER -->
        <div class="flex items-center justify-between px-1 pt-1">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-lg shadow-md shadow-orange-500/30">
              <i class="fa-solid fa-burger"></i>
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-950 leading-tight" id="storefrontHeading">Burger Cottage</h3>
              <p class="text-[10px] text-slate-500 flex items-center gap-1">
                <i class="fa-solid fa-location-dot text-orange-500"></i> Defence Cantt, Lahore · 40 Min Delivery
              </p>
            </div>
          </div>
          <button onclick="openCustomerCheckoutModal()" class="relative p-2.5 rounded-2xl bg-white border border-orange-100 shadow-sm text-slate-700 hover:text-orange-600 transition">
            <i class="fa-solid fa-bag-shopping text-base"></i>
            <span id="storefrontCartBadgeTop" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shadow hidden">0</span>
          </button>
        </div>

        <!-- 1. HERO PROMO BANNER (HOT DEALS) -->
        <div class="relative bg-gradient-to-r from-[#FFE8D6] via-[#FFF0E5] to-[#FFEFE0] rounded-3xl p-5 overflow-hidden border border-orange-200/50 shadow-sm">
          <div class="max-w-[62%] space-y-2 z-10 relative">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-orange-600 text-[10px] font-black shadow-sm tracking-wide">
              🔥 Hot Deals
            </span>
            <h2 class="text-xl font-black text-slate-950 leading-tight tracking-tight">
              Delicious Fast Food
            </h2>
            <p class="text-[11px] text-slate-600 leading-snug">
              Get your favorite fast food at your door in 40 mins.
            </p>
            <button onclick="filterCustomerCategory('Single Deals')" class="mt-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-orange-500/30 transition">
              Order Now <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          <!-- Hero Food Image -->
          <div class="absolute -right-4 -bottom-3 w-40 h-36 pointer-events-none">
            <img src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80" alt="Fast Food Feast" class="w-full h-full object-contain drop-shadow-xl transform hover:scale-105 transition">
          </div>

          <!-- Carousel Dots -->
          <div class="flex items-center justify-center gap-1.5 pt-3 mt-1">
            <span class="w-5 h-1.5 rounded-full bg-orange-500"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-orange-200"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-orange-200"></span>
          </div>
        </div>

        <!-- 2. CIRCULAR CATEGORY PILLS BAR -->
        <div class="bg-white rounded-3xl p-3.5 border border-orange-100 shadow-sm">
          <div class="flex items-center justify-between gap-2 overflow-x-auto custom-scroll pb-1" id="storefrontCategoryPills">
            <!-- Dynamically populated category round buttons -->
          </div>
        </div>

        <!-- 3. POPULAR ITEMS SECTION -->
        <div class="space-y-3">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-base font-black text-slate-950 tracking-tight" id="storefrontSectionTitle">Popular Items</h3>
            <button onclick="filterCustomerCategory('ALL')" class="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              View All <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          <!-- Popular Items Cards Grid (2-columns on mobile, 3-cols on tablet) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5" id="customerProductsList">
            <!-- Rendered via renderStorefront() -->
          </div>
        </div>

        <!-- 4. BOTTOM FLASH OFFER PROMO BANNER -->
        <div class="bg-gradient-to-r from-amber-100/90 to-orange-100/80 rounded-3xl p-4 border border-orange-200/60 shadow-sm flex items-center justify-between gap-3">
          <div class="space-y-0.5">
            <span class="text-[10px] font-black text-orange-700 uppercase tracking-wider flex items-center gap-1">
              <i class="fa-solid fa-bolt"></i> Flash Offer
            </span>
            <h4 class="text-sm font-black text-slate-950">Get 20% OFF on your first order</h4>
            <p class="text-[10px] text-slate-500 font-medium">Use code <span class="font-bold text-orange-600">COTTAGE20</span> at checkout</p>
          </div>
          <button onclick="filterCustomerCategory('ALL')" class="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30 transition">
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>

      </div>

      <!-- FLOATING CHECKOUT BAR (WHEN CART HAS ITEMS) -->
      <div id="storefrontFloatingCart" class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-950 text-white rounded-3xl p-3.5 shadow-2xl border border-white/10 flex items-center justify-between z-40 transition-all transform duration-300 hidden">
        <div class="flex items-center gap-3 pl-2">
          <div class="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow">
            <i class="fa-solid fa-bag-shopping"></i>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block" id="floatingCartCount">0 Items in Cart</span>
            <span class="text-sm font-black text-white font-mono" id="floatingCartTotal">PKR 0</span>
          </div>
        </div>
        <button onclick="openCustomerCheckoutModal()" class="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/30 transition">
          View Cart & Order <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>

      <!-- CUSTOMER CHECKOUT MODAL DRAWER -->
      <div id="customerCheckoutModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 hidden">
        <div class="bg-[#FFF9F2] rounded-t-[36px] sm:rounded-3xl border border-orange-100 shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scroll">
          
          <div class="flex items-center justify-between border-b border-orange-100 pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center text-sm shadow-sm">
                <i class="fa-solid fa-receipt"></i>
              </div>
              <h3 class="text-base font-black text-slate-950">Aapka Order & Details</h3>
            </div>
            <button onclick="closeCustomerCheckoutModal()" class="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm border border-slate-200">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Cart Review List -->
          <div class="space-y-2 max-h-48 overflow-y-auto custom-scroll pr-1" id="checkoutItemsList">
            <!-- Rendered dynamically -->
          </div>

          <!-- Bill Summary -->
          <div class="p-3 bg-white rounded-2xl border border-orange-100 space-y-1.5 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Items Total:</span>
              <span class="font-mono font-bold text-slate-900" id="storefrontSubtotal">PKR 0</span>
            </div>
            <div class="flex justify-between">
              <span>Delivery Fee:</span>
              <span class="font-mono font-bold text-emerald-600" id="storefrontDelivFee">Free (Promo)</span>
            </div>
            <div class="border-t border-slate-100 pt-1 flex justify-between font-black text-sm text-slate-950">
              <span>Grand Total:</span>
              <span class="font-mono text-orange-600" id="storefrontCartTotal">PKR 0</span>
            </div>
          </div>

          <!-- Customer Address & Contact Form -->
          <div class="space-y-2">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Aapka Naam (Customer Name)</label>
              <input type="text" id="custNameInput" placeholder="Ali Khan" class="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-0.5">WhatsApp Number (For instant delivery updates)</label>
              <input type="tel" id="custPhoneInput" placeholder="03054122075" class="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Complete Delivery Address</label>
              <input type="text" id="custAddressInput" placeholder="House 12, Street 4, Phase 5 DHA, Lahore" class="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Payment Method</label>
              <select id="custPaymentInput" class="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none">
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

const sIdx = html.indexOf(oldStorefrontStart);
const eIdx = html.indexOf(oldStorefrontEnd);

if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx) + newStorefrontMarkup + html.substring(eIdx);
  console.log("Successfully replaced view-storefront markup with Mobile App Luxury UI!");
} else {
  console.error("Could not find view-storefront bounds in html!");
}

fs.writeFileSync(indexPath, html, 'utf8');
const publicIndexPath = path.join(__dirname, '../public/index.html');
fs.writeFileSync(publicIndexPath, html, 'utf8');
