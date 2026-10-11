const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '../clients/burger-cottage/menu.json');
const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
const itemsJson = JSON.stringify(menuData.items, null, 2);

const indexPath = path.join(__dirname, '../apps/web/public/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update the Header Store Display with active tenant switcher
const oldHeaderStore = `<div class="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span>Tenant:</span>
          <strong class="text-slate-900 font-semibold" id="topStoreName">Sultan Spice Biryani & Grill</strong>
        </div>`;

const newHeaderStore = `<div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button onclick="loadPresetClientMenu('burger-cottage')" id="tenantBtnBurger" class="px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-emerald-600 text-white shadow-sm">
            🍔 Burger Cottage (97)
          </button>
          <button onclick="loadPresetClientMenu('sultan-spice')" id="tenantBtnSultan" class="px-2 py-1 rounded-lg font-medium transition text-slate-600 hover:text-slate-900">
            🍛 Sultan Spice
          </button>
        </div>`;

if (html.includes(oldHeaderStore)) {
  html = html.replace(oldHeaderStore, newHeaderStore);
}

// 2. Insert BURGER_COTTAGE_MENU at top of state storage and auto-default
const scriptStartSearch = `  <!-- JAVASCRIPT STATE ENGINE & AUTONOMOUS AGENT LOGIC -->
  <script>
    // State storage`;

const scriptReplacement = `  <!-- JAVASCRIPT STATE ENGINE & AUTONOMOUS AGENT LOGIC -->
  <script>
    // Master 97-item catalog for Burger Cottage
    const BURGER_COTTAGE_MENU = ${itemsJson};

    const SULTAN_SPICE_MENU = [
      { id: 'prod-1', name: 'Special Chicken Dum Biryani', price: 650, category: 'Biryani & Rice', desc: 'Aromatic long-grain basmati with chicken.', calories: 720, stock: 50 },
      { id: 'prod-2', name: 'Mutton Shinwari Karahi (Half KG)', price: 1750, category: 'BBQ & Grills', desc: 'Desi ghee tender mutton.', calories: 1250, stock: 25 },
      { id: 'prod-3', name: 'Mint Raita & Fresh Salad', price: 120, category: 'Sides & Drinks', desc: 'Chilled yogurt cucumber dip.', calories: 95, stock: 80 }
    ];

    // State storage`;

if (html.includes(scriptStartSearch)) {
  html = html.replace(scriptStartSearch, scriptReplacement);
}

// 3. Make products initialization smart so it NEVER stays empty!
const oldInitBlock = `    let storeConfig = JSON.parse(localStorage.getItem('storeConfig')) || {
      storeName: 'Sultan Spice Biryani & Grill',
      whatsapp: '923001234567',
      deliveryFee: 150
    };

    let users = JSON.parse(localStorage.getItem('storeUsers')) || initialUsers;
    let products = JSON.parse(localStorage.getItem('storeProducts')) || [];`;

const newInitBlock = `    // Domain / Store detection
    const urlParams = new URLSearchParams(window.location.search);
    const storeParam = urlParams.get('store');
    const hostname = window.location.hostname.toLowerCase();

    // Default to Burger Cottage unless explicitly requested
    let savedStore = localStorage.getItem('activeStore');
    let isBurgerStore = (storeParam === 'burger-cottage') || (hostname.includes('burger')) || (!savedStore || savedStore === 'burger-cottage');

    let storeConfig = JSON.parse(localStorage.getItem('storeConfig'));
    let products = JSON.parse(localStorage.getItem('storeProducts')) || [];

    if (isBurgerStore || !storeConfig || products.length === 0) {
      storeConfig = {
        storeName: 'Burger Cottage',
        whatsapp: '923054122075',
        deliveryFee: 0,
        address: 'Shop 6-7, Iqbal Park, Link-8, Main Boulevard Defence Cantt, Lahore',
        phones: ['0305-4122075', '0322-8423075', '0301-4314918', '0320-4841741']
      };
      products = [...BURGER_COTTAGE_MENU];
      localStorage.setItem('activeStore', 'burger-cottage');
      localStorage.setItem('storeConfig', JSON.stringify(storeConfig));
      localStorage.setItem('storeProducts', JSON.stringify(products));
    }

    let users = JSON.parse(localStorage.getItem('storeUsers')) || initialUsers;`;

if (html.includes(oldInitBlock)) {
  html = html.replace(oldInitBlock, newInitBlock);
}

// 4. Update loadPresetClientMenu to use BURGER_COTTAGE_MENU and SULTAN_SPICE_MENU cleanly
const oldPresetRegex = /function loadPresetClientMenu\(clientSlug\) \{[\s\S]*?alert\(`Switched active store to: \$\{storeConfig\.storeName\} with full catalog loaded!`\);\s*\}/;

const newPresetFunction = `function loadPresetClientMenu(clientSlug) {
      if (clientSlug === 'burger-cottage') {
        localStorage.setItem('activeStore', 'burger-cottage');
        storeConfig = {
          storeName: 'Burger Cottage',
          whatsapp: '923054122075',
          deliveryFee: 0,
          address: 'Shop 6-7, Iqbal Park, Link-8, Main Boulevard Defence Cantt, Lahore',
          phones: ['0305-4122075', '0322-8423075', '0301-4314918', '0320-4841741']
        };
        products = [...BURGER_COTTAGE_MENU];
      } else {
        localStorage.setItem('activeStore', 'sultan-spice');
        storeConfig = {
          storeName: 'Sultan Spice Biryani & Grill',
          whatsapp: '923001234567',
          deliveryFee: 150,
          address: 'Main Commercial Area, Lahore'
        };
        products = [...SULTAN_SPICE_MENU];
      }
      saveState();
      renderAll();
      alert('Switched active store to: ' + storeConfig.storeName + ' (' + products.length + ' items loaded!)');
    }`;

if (oldPresetRegex.test(html)) {
  html = html.replace(oldPresetRegex, newPresetFunction);
}

// 5. Update renderAll to update the header buttons
const renderAllSearch = `    function renderAll() {
      document.getElementById('topStoreName').innerText = storeConfig.storeName;`;

const newRenderAllSearch = `    function renderAll() {
      const isBC = storeConfig.storeName.includes('Burger Cottage');
      const btnBurger = document.getElementById('tenantBtnBurger');
      const btnSultan = document.getElementById('tenantBtnSultan');
      if (btnBurger && btnSultan) {
        if (isBC) {
          btnBurger.className = 'px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-emerald-600 text-white shadow-sm';
          btnSultan.className = 'px-2 py-1 rounded-lg font-medium transition text-slate-600 hover:text-slate-900';
        } else {
          btnBurger.className = 'px-2 py-1 rounded-lg font-medium transition text-slate-600 hover:text-slate-900';
          btnSultan.className = 'px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-brand-600 text-white shadow-sm';
        }
      }
      const topNameEl = document.getElementById('topStoreName');
      if (topNameEl) topNameEl.innerText = storeConfig.storeName;`;

if (html.includes(renderAllSearch)) {
  html = html.replace(renderAllSearch, newRenderAllSearch);
}

fs.writeFileSync(indexPath, html, 'utf8');
const publicIndexPath = path.join(__dirname, '../public/index.html');
fs.writeFileSync(publicIndexPath, html, 'utf8');

console.log("Successfully patched index.html with automatic Burger Cottage menu loading & top tenant switcher!");
