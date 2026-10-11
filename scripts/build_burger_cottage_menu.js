const fs = require('fs');
const path = require('path');

const burgerCottageData = {
  clientName: "Burger Cottage",
  slug: "burger-cottage",
  address: "Shop 6-7, Iqbal Park, Link-8, Main Boulevard Defence Cantt, Lahore",
  timings: "Open 7 days, 2:00 PM – 4:00 AM",
  deliveryNote: "Free home delivery (40 min)",
  phones: ["0305-4122075", "0322-8423075", "0301-4314918", "0320-4841741"],
  primaryWhatsApp: "923054122075"
};

const menuItems = [
  // --- SINGLE DEALS ---
  { id: "bc-deal-1", name: "Hot Deal (Xinger)", category: "Single Deals", price: 550, calories: 920, desc: "1 Xinger Burger, 1 Reg. Fries, 1 Half Ltr Cold Drink", stock: 100 },
  { id: "bc-deal-2", name: "Tower Deal", category: "Single Deals", price: 800, calories: 1150, desc: "1 Tower Burger, 1 Reg. Fries, 1 Half Ltr Cold Drink", stock: 100 },
  { id: "bc-deal-3", name: "Super Deal (Patty)", category: "Single Deals", price: 500, calories: 840, desc: "1 Patty Burger, 1 Reg. Fries, 1 Half Ltr Cold Drink", stock: 100 },
  { id: "bc-deal-4", name: "Famous Deal (Kabab)", category: "Single Deals", price: 500, calories: 860, desc: "1 Kabab Burger, 1 Reg. Fries, 1 Half Ltr Cold Drink", stock: 100 },
  { id: "bc-deal-5", name: "Hot Grill Deal", category: "Single Deals", price: 600, calories: 890, desc: "1 Grill Burger, 1 Reg. Fries, 1 Half Ltr Cold Drink", stock: 100 },
  { id: "bc-deal-6", name: "Rocket Deal", category: "Single Deals", price: 600, calories: 910, desc: "1 Rocket Burger, 1 Reg. Fries, 1 Half Ltr Cold Drink", stock: 100 },
  { id: "bc-deal-7", name: "Donner Feast Deal", category: "Single Deals", price: 550, calories: 880, desc: "1 Donner, 1 Reg. Fries, 1 Half Ltr Cold Drink", stock: 100 },
  { id: "bc-deal-8", name: "Pizza Burger Deal (Grill/Zinger)", category: "Single Deals", price: 700, calories: 1050, desc: "1 Pizza Burger Grill/Zinger, 1 Reg. Fries, 1 Half Ltr Drink", stock: 100 },
  { id: "bc-deal-9", name: "Pizza Burger Deal (Kabab/Patty)", category: "Single Deals", price: 650, calories: 990, desc: "1 Pizza Kabab/Patty Burger, 1 Reg. Fries, 1 Half Ltr Drink", stock: 100 },

  // --- FEAST & SPECIAL DEALS ---
  { id: "bc-fst-1", name: "Xinger Feast", category: "Special Deals", price: 830, calories: 1180, desc: "1 Xinger Burger, 1 Pc Crispy Chicken, 1 Reg. Fries, 1 Half Ltr Drink", stock: 80 },
  { id: "bc-fst-2", name: "Saving Deal", category: "Special Deals", price: 730, calories: 1040, desc: "1 Patty Burger, 1 Pc Crispy Chicken, 1 Reg. Fries, 1 Half Ltr Drink", stock: 80 },
  { id: "bc-fst-3", name: "Double Deal", category: "Special Deals", price: 1050, calories: 1840, desc: "2 Xinger Burgers, 2 Reg. Fries, 2 Half Ltr Drinks", stock: 80 },
  { id: "bc-fst-4", name: "Wing Feasta", category: "Special Deals", price: 750, calories: 950, desc: "10 Hot Wings, 1 Half Ltr Cold Drink", stock: 80 },
  { id: "bc-fst-5", name: "Grill Wings Deal", category: "Special Deals", price: 750, calories: 880, desc: "10 Pc Grill Wings, 1 Half Ltr Cold Drink", stock: 80 },
  { id: "bc-fst-6", name: "Chicken Feast", category: "Special Deals", price: 750, calories: 890, desc: "3 Pc Crispy Chicken, 1 Half Ltr Cold Drink", stock: 80 },
  { id: "bc-fst-7", name: "Best Deal", category: "Special Deals", price: 950, calories: 1420, desc: "1 Xinger Burger, 1 Small Pizza, 1 Half Ltr Cold Drink", stock: 60 },
  { id: "bc-fst-8", name: "Chatpata Baked Combo", category: "Special Deals", price: 900, calories: 980, desc: "3 Oven Baked Pcs, 1 Tortilla Bread, 1 Dip Sauce + Salad, 500ml Drink", stock: 60 },

  // --- JUMBO DEALS ---
  { id: "bc-jmb-1", name: "Jumbo 1 Deal", category: "Jumbo Deals", price: 1500, calories: 2350, desc: "2 Xinger Burgers, 2 Pc Chicken, 2 Reg. Fries, 2 Half Ltr Drinks", stock: 50 },
  { id: "bc-jmb-2", name: "Jumbo 2 Deal", category: "Jumbo Deals", price: 1530, calories: 2450, desc: "1 Medium Pizza, 2 Pc Chicken, 2 Half Ltr Drinks", stock: 50 },
  { id: "bc-jmb-3", name: "Jumbo 3 Deal", category: "Jumbo Deals", price: 1650, calories: 3400, desc: "5 Xinger Burgers, 1.5 Ltr Jumbo Drink", stock: 50 },
  { id: "bc-jmb-4", name: "Jumbo 4 Deal", category: "Jumbo Deals", price: 2300, calories: 3600, desc: "10 Pc Crispy Chicken, 1 Family Fries, 1.5 Ltr Drink", stock: 40 },
  { id: "bc-jmb-5", name: "Jumbo 5 Deal", category: "Jumbo Deals", price: 2600, calories: 4200, desc: "1 Large Pizza, 3 Xinger Burgers, 1 Large Fries, 1.5 Ltr Drink", stock: 40 },
  { id: "bc-jmb-6", name: "Jumbo 6 Deal", category: "Jumbo Deals", price: 2600, calories: 4350, desc: "1 Large Pizza, 10 Hot Wings, 10 Nuggets, 1 Large Fries, 1.5 Ltr Drink", stock: 40 },

  // --- BURGERS ---
  { id: "bc-bgr-1", name: "Xinger Burger", category: "Burgers", price: 350, calories: 650, desc: "Signature crispy fried chicken breast fillet with fresh lettuce and sauce.", stock: 100 },
  { id: "bc-bgr-2", name: "Tower Burger", category: "Burgers", price: 560, calories: 880, desc: "Crispy chicken fillet layered with hash brown patty, cheese & mayo.", stock: 70 },
  { id: "bc-bgr-3", name: "Mighty Burger", category: "Burgers", price: 650, calories: 960, desc: "Double crisp chicken fillets with double cheese and creamy sauce.", stock: 60 },
  { id: "bc-bgr-4", name: "Patty Burger", category: "Burgers", price: 280, calories: 480, desc: "Classic seasoned minced chicken patty in toasted sesame bun.", stock: 100 },
  { id: "bc-bgr-5", name: "Kabab Burger", category: "Burgers", price: 280, calories: 510, desc: "Grilled desi spiced seekh kabab with chutney and onions in burger bun.", stock: 90 },
  { id: "bc-bgr-6", name: "Tikka Burger", category: "Burgers", price: 250, calories: 460, desc: "Smoky chicken tikka chunks with signature garlic sauce.", stock: 90 },
  { id: "bc-bgr-7", name: "Yumpum Burger", category: "Burgers", price: 480, calories: 720, desc: "Special house recipe juicy burger loaded with delicious sauces.", stock: 70 },
  { id: "bc-bgr-8", name: "Classic Burger", category: "Burgers", price: 450, calories: 690, desc: "Chef's gourmet style grilled burger with fresh veggies and cheddar.", stock: 70 },
  { id: "bc-bgr-9", name: "Double Patty Burger", category: "Burgers", price: 450, calories: 750, desc: "Two seasoned chicken patties stacked high with double dressing.", stock: 70 },
  { id: "bc-bgr-10", name: "Double Kabab Burger", category: "Burgers", price: 450, calories: 780, desc: "Twin spicy seekh kababs inside toasted soft buns.", stock: 70 },
  { id: "bc-bgr-11", name: "Donner", category: "Burgers", price: 350, calories: 590, desc: "Turkish style seasoned shredded chicken donner in pita/bun.", stock: 80 },
  { id: "bc-bgr-12", name: "2 Zinger Burgers Pack", category: "Burgers", price: 650, calories: 1300, desc: "Two signature crispy Xinger burgers (Super saver bundle).", stock: 60 },
  { id: "bc-bgr-13", name: "2 Patty Burgers Pack", category: "Burgers", price: 530, calories: 960, desc: "Two classic chicken patty burgers bundle.", stock: 60 },
  { id: "bc-bgr-14", name: "2 Donner Pack", category: "Burgers", price: 650, calories: 1180, desc: "Two authentic spiced chicken donners bundle.", stock: 60 },

  // --- SHAWARMA ---
  { id: "bc-shw-1", name: "Arabian Shawarma", category: "Shawarma", price: 280, calories: 420, desc: "Tender seasoned chicken ribbons wrapped in pita with tahini sauce.", stock: 90 },
  { id: "bc-shw-2", name: "Bar B Q Shawarma", category: "Shawarma", price: 300, calories: 450, desc: "Charcoal grilled BBQ chicken with spicy smoky dressing.", stock: 90 },
  { id: "bc-shw-3", name: "Smoked Shawarma", category: "Shawarma", price: 300, calories: 440, desc: "Wood-smoked chicken shawarma wrapped with pickled cucumbers.", stock: 80 },
  { id: "bc-shw-4", name: "Xinger Shawarma", category: "Shawarma", price: 320, calories: 510, desc: "Crunchy crispy fried chicken strips rolled in pita wrap.", stock: 90 },
  { id: "bc-shw-5", name: "Grilled Shawarma", category: "Shawarma", price: 400, calories: 490, desc: "Oven-toasted panini style pressed grilled shawarma.", stock: 70 },
  { id: "bc-shw-6", name: "Supreme Shawarma", category: "Shawarma", price: 370, calories: 530, desc: "Extra loaded chicken, melted cheese slice and olives wrap.", stock: 70 },

  // --- PARATHA ROLLS ---
  { id: "bc-prt-1", name: "Xinger Paratha", category: "Paratha", price: 350, calories: 640, desc: "Crispy fried zinger strip inside crispy golden paratha.", stock: 80 },
  { id: "bc-prt-2", name: "Kabab Paratha", category: "Paratha", price: 300, calories: 580, desc: "Spiced seekh kabab rolled in hot paratha with mint sauce.", stock: 80 },
  { id: "bc-prt-3", name: "Chicken Paratha", category: "Paratha", price: 300, calories: 540, desc: "Seasoned tender chicken chunks inside crispy fried paratha.", stock: 80 },
  { id: "bc-prt-4", name: "Bar B Q Paratha", category: "Paratha", price: 300, calories: 560, desc: "Smoky BBQ boti chicken inside buttery crisp paratha.", stock: 80 },
  { id: "bc-prt-5", name: "Malai Botti Paratha", category: "Paratha", price: 300, calories: 610, desc: "Creamy malai boti chicken rolled with sweet & tangy mayo.", stock: 80 },

  // --- WRAPS ---
  { id: "bc-wrp-1", name: "Xinger Wrap", category: "Wraps", price: 600, calories: 690, desc: "Jumbo tortilla filled with crispy zinger, shredded cheese & sauce.", stock: 60 },
  { id: "bc-wrp-2", name: "Chicken Wrap", category: "Wraps", price: 550, calories: 580, desc: "Toasted flour tortilla with juicy chicken cubes & fresh salad.", stock: 60 },
  { id: "bc-wrp-3", name: "Grill Wrap", category: "Wraps", price: 650, calories: 620, desc: "Herb grilled chicken breast, grilled veggies and chipotle sauce.", stock: 50 },
  { id: "bc-wrp-4", name: "Malai Boti Wrap", category: "Wraps", price: 600, calories: 670, desc: "Rich melt-in-mouth creamy malai boti wrapped in soft tortilla.", stock: 50 },

  // --- SANDWICHES ---
  { id: "bc-snd-1", name: "Tikka Sandwich", category: "Sandwiches", price: 550, calories: 580, desc: "Triple layer toasted bread with spicy tikka chicken & coleslaw.", stock: 60 },
  { id: "bc-snd-2", name: "Club Sandwich", category: "Sandwiches", price: 550, calories: 620, desc: "Classic club with egg, shredded chicken, cucumber and cheese.", stock: 60 },
  { id: "bc-snd-3", name: "Grilled Chicken Sandwich", category: "Sandwiches", price: 550, calories: 540, desc: "Charbroiled chicken breast slices with honey mustard sauce.", stock: 60 },
  { id: "bc-snd-4", name: "Cheese Sandwich", category: "Sandwiches", price: 550, calories: 510, desc: "Golden toasted sandwich filled with hot melted mozzarella & cheddar.", stock: 60 },

  // --- PLATTERS ---
  { id: "bc-plt-1", name: "Chicken Platter", category: "Platters", price: 600, calories: 850, desc: "Generous serving of boneless spiced chicken, pita bread, sauces & salad.", stock: 50 },
  { id: "bc-plt-2", name: "Arabian Platter", category: "Platters", price: 650, calories: 920, desc: "Authentic Middle Eastern seasoned chicken with garlic mayo & warm pita.", stock: 50 },
  { id: "bc-plt-3", name: "Bar B Q Platter", category: "Platters", price: 750, calories: 970, desc: "Assorted BBQ chicken boti, seekh bites, grilled tomatoes & pita.", stock: 40 },
  { id: "bc-plt-4", name: "Malai Boti Platter", category: "Platters", price: 750, calories: 1020, desc: "Silky creamy malai chicken with herb dressing and fresh sides.", stock: 40 },
  { id: "bc-plt-5", name: "Jambo Platter", category: "Platters", price: 900, calories: 1250, desc: "Feast platter with double meat, cheese fries, pita and special dips.", stock: 30 },

  // --- HOT & CRISPY CHICKEN, WINGS & NUGGETS ---
  { id: "bc-ch-1", name: "1 Pc Crispy Fried Chicken", category: "Crispy Chicken & Wings", price: 250, calories: 290, desc: "Golden crunchy battered chicken piece (tender & juicy).", stock: 100 },
  { id: "bc-ch-2", name: "5 Pc Crispy Fried Chicken", category: "Crispy Chicken & Wings", price: 1100, calories: 1450, desc: "Family box of 5 pieces golden crispy fried chicken.", stock: 50 },
  { id: "bc-ch-3", name: "5 Pc Hot Wings", category: "Crispy Chicken & Wings", price: 350, calories: 420, desc: "5 pieces spicy crunchy chicken wings.", stock: 80 },
  { id: "bc-ch-4", name: "10 Pc Hot Wings", category: "Crispy Chicken & Wings", price: 600, calories: 840, desc: "10 pieces spicy crunchy chicken wings with dipping sauce.", stock: 60 },
  { id: "bc-ch-5", name: "5 Pc Oven Baked Wings", category: "Crispy Chicken & Wings", price: 350, calories: 360, desc: "5 pieces healthily oven baked glazed wings.", stock: 60 },
  { id: "bc-ch-6", name: "10 Pc Oven Baked Wings", category: "Crispy Chicken & Wings", price: 600, calories: 720, desc: "10 pieces oven baked marinated savory wings.", stock: 50 },
  { id: "bc-ch-7", name: "5 Pc Chicken Nuggets", category: "Crispy Chicken & Wings", price: 300, calories: 260, desc: "5 pieces tender golden chicken nuggets.", stock: 80 },
  { id: "bc-ch-8", name: "10 Pc Chicken Nuggets", category: "Crispy Chicken & Wings", price: 550, calories: 520, desc: "10 pieces tender golden chicken nuggets with dip.", stock: 60 },
  { id: "bc-ch-9", name: "5 Pc Cheese Ball", category: "Crispy Chicken & Wings", price: 350, calories: 380, desc: "5 pieces fried molten mozzarella cheese balls.", stock: 70 },
  { id: "bc-ch-10", name: "10 Pc Cheese Ball", category: "Crispy Chicken & Wings", price: 600, calories: 760, desc: "10 pieces fried molten mozzarella cheese balls.", stock: 50 },

  // --- FRIES ---
  { id: "bc-fr-1", name: "Regular French Fries", category: "Fries", price: 180, calories: 280, desc: "Crispy salted potato fries.", stock: 120 },
  { id: "bc-fr-2", name: "Large French Fries", category: "Fries", price: 300, calories: 450, desc: "Large box hot crispy potato fries.", stock: 100 },
  { id: "bc-fr-3", name: "Family French Fries", category: "Fries", price: 450, calories: 720, desc: "Extra large family sharing bucket of fries.", stock: 80 },
  { id: "bc-fr-4", name: "Loader Fries – Large", category: "Fries", price: 500, calories: 650, desc: "Fries topped with hot cheese sauce, jalapeños & chicken chunks.", stock: 70 },
  { id: "bc-fr-5", name: "Loader Fries – Family", category: "Fries", price: 650, calories: 920, desc: "Massive fries platter loaded with cheese, chicken and sauces.", stock: 50 },

  // --- CHICKEN CHEESE PASTA ---
  { id: "bc-pst-1", name: "Chicken Cheese Pasta (Medium)", category: "Pasta", price: 500, calories: 680, desc: "Penne pasta baked in creamy white sauce with grilled chicken & cheese.", stock: 50 },
  { id: "bc-pst-2", name: "Chicken Cheese Pasta (Large)", category: "Pasta", price: 700, calories: 980, desc: "Large baked penne pasta loaded with thick melted cheese layer.", stock: 40 },

  // --- SIGNATURE PIZZA ---
  { id: "bc-piz-1", name: "Lazzania Pizza (Medium)", category: "Signature Pizza", price: 1150, calories: 1550, desc: "Layered lasagna meat sauce, pasta sheets & mozzarella crust.", stock: 40 },
  { id: "bc-piz-2", name: "Lazzania Pizza (Large)", category: "Signature Pizza", price: 1450, calories: 2150, desc: "Jumbo layered lasagna flavored thick crust pizza.", stock: 30 },
  { id: "bc-piz-3", name: "Kabab Crust Pizza (Medium)", category: "Signature Pizza", price: 1200, calories: 1680, desc: "Stuffed seekh kabab baked directly into the outer crust.", stock: 40 },
  { id: "bc-piz-4", name: "Kabab Crust Pizza (Large)", category: "Signature Pizza", price: 1700, calories: 2350, desc: "Large gourmet pizza ringed with spicy seekh kabab crust.", stock: 30 },
  { id: "bc-piz-5", name: "Fritti Pizza (Medium)", category: "Signature Pizza", price: 1100, calories: 1520, desc: "Crispy fried crust style pizza with rich topping.", stock: 40 },
  { id: "bc-piz-6", name: "Fritti Pizza (Large)", category: "Signature Pizza", price: 1400, calories: 2100, desc: "Large crispy crusted signature pizza.", stock: 30 },
  { id: "bc-piz-7", name: "Cheese Crust Pizza (Medium)", category: "Signature Pizza", price: 1200, calories: 1750, desc: "Mozzarella and cheddar string cheese stuffed crust.", stock: 40 },
  { id: "bc-piz-8", name: "Cheese Crust Pizza (Large)", category: "Signature Pizza", price: 1700, calories: 2450, desc: "Gooey cheesy burst stuffed crust large pizza.", stock: 30 },
  { id: "bc-piz-9", name: "Crown Crust Pizza (Medium)", category: "Signature Pizza", price: 1200, calories: 1700, desc: "Royal crown shaped crust dumplings stuffed with kabab & cheese.", stock: 40 },
  { id: "bc-piz-10", name: "Crown Crust Pizza (Large)", category: "Signature Pizza", price: 1700, calories: 2400, desc: "Large crown shaped outer pockets pizza.", stock: 30 },
  { id: "bc-piz-11", name: "Limo Pizza (4 Flavours in 1)", category: "Signature Pizza", price: 2500, calories: 3600, desc: "Grand metre-long pizza with 4 distinct chef's specialty quarters.", stock: 20 },

  // --- SUPER DELICIOUS PIZZA (SINGLE) ---
  { id: "bc-sup-1", name: "Super Delicious Pizza (Small)", category: "Traditional Pizza", price: 550, calories: 650, desc: "Small pan pizza in choice of Tikka, Fajita, Supreme or Malai Boti.", stock: 80 },
  { id: "bc-sup-2", name: "Super Delicious Pizza (Medium)", category: "Traditional Pizza", price: 1000, calories: 1400, desc: "Medium 10-inch hand tossed pizza with generous chicken toppings.", stock: 70 },
  { id: "bc-sup-3", name: "Super Delicious Pizza (Large)", category: "Traditional Pizza", price: 1350, calories: 2100, desc: "Large 13-inch pizza loaded with cheese, chicken and veggies.", stock: 60 },
  { id: "bc-sup-4", name: "Super Delicious Pizza (Family)", category: "Traditional Pizza", price: 2300, calories: 3400, desc: "Massive 16-inch family party pizza.", stock: 30 },

  // --- SUPER DELICIOUS PIZZA (DOUBLE PIZZA DEALS) ---
  { id: "bc-sup-5", name: "Double Pizza Pack (2 Small)", category: "Traditional Pizza", price: 1000, calories: 1300, desc: "Bundle of 2 Small Pizzas of any flavour.", stock: 50 },
  { id: "bc-sup-6", name: "Double Pizza Pack (2 Medium)", category: "Traditional Pizza", price: 1850, calories: 2800, desc: "Bundle of 2 Medium 10-inch Pizzas of any flavour.", stock: 40 },
  { id: "bc-sup-7", name: "Double Pizza Pack (2 Large)", category: "Traditional Pizza", price: 2550, calories: 4200, desc: "Bundle of 2 Large 13-inch Pizzas of any flavour.", stock: 30 },
  { id: "bc-sup-8", name: "Double Pizza Pack (2 Family)", category: "Traditional Pizza", price: 4200, calories: 6800, desc: "Bundle of 2 Giant Family 16-inch Pizzas.", stock: 20 }
];

console.log(`Total Burger Cottage Items Generated: ${menuItems.length}`);

// Write menu.json
const menuJsonPath = path.join(__dirname, '../clients/burger-cottage/menu.json');
fs.writeFileSync(menuJsonPath, JSON.stringify({
  client: "Burger Cottage",
  currency: "PKR",
  totalItems: menuItems.length,
  items: menuItems
}, null, 2), 'utf-8');

// Write client.json
const clientJsonPath = path.join(__dirname, '../clients/burger-cottage/client.json');
const currentClient = JSON.parse(fs.readFileSync(clientJsonPath, 'utf-8'));
currentClient.status = "ACTIVE";
currentClient.owner.phone = "0305-4122075";
currentClient.owner.whatsapp = "923054122075";
currentClient.location.address = burgerCottageData.address;
currentClient.location.branch = "Iqbal Park, Defence Cantt, Lahore";
currentClient.operational = {
  timings: burgerCottageData.timings,
  deliveryNote: burgerCottageData.deliveryNote,
  allPhones: burgerCottageData.phones
};
fs.writeFileSync(clientJsonPath, JSON.stringify(currentClient, null, 2), 'utf-8');

console.log("Updated clients/burger-cottage/client.json and menu.json successfully!");
