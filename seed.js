require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Settings = require('./models/Settings');
const Coupon = require('./models/Coupon');
const HeroBanner = require('./models/HeroBanner');

const categories = [
  { name: 'Wallets', icon: 'fas fa-wallet', description: 'Premium leather wallets for everyday use', sortOrder: 1 },
  { name: 'Totebags', icon: 'fas fa-shopping-bag', description: 'Spacious and stylish tote bags', sortOrder: 2 },
  { name: 'Brand Bags', icon: 'fas fa-crown', description: 'Authentic designer brand bags', sortOrder: 3 },
  { name: 'Bags', icon: 'fas fa-suitcase', description: 'Everyday bags for every style', sortOrder: 4 },
  { name: 'Keychains', icon: 'fas fa-key', description: 'Charming accessories for your bags', sortOrder: 5 }
];

const products = [
  // Wallets
  { name: 'Bifold Leather Wallet', category: 'Wallets', icon: 'fas fa-wallet', priceMmk: 18000, stock: 40, description: 'Classic bifold wallet in genuine leather with 8 card slots and coin pocket.' },
  { name: 'Zip-Around Wallet', category: 'Wallets', icon: 'fas fa-wallet', priceMmk: 24000, stock: 35, description: 'Secure zip-around wallet with RFID blocking technology. Multiple compartments.' },
  { name: 'Mini Card Holder', category: 'Wallets', icon: 'fas fa-credit-card', priceMmk: 9500, stock: 50, description: 'Slim card holder with 6 slots. Perfect for minimalist carry.' },
  { name: 'Long Continental', category: 'Wallets', icon: 'fas fa-wallet', priceMmk: 32000, stock: 22, description: 'Elegant long wallet with bill compartments and phone pocket.' },
  { name: 'Coin Purse Charm', category: 'Wallets', icon: 'fas fa-coins', priceMmk: 6500, stock: 60, description: 'Adorable coin purse with zipper closure and keychain attachment.' },
  { name: 'Travel Wallet Pro', category: 'Wallets', icon: 'fas fa-plane', priceMmk: 28000, stock: 20, description: 'Spacious travel wallet with passport holder and ticket sleeve.' },
  { name: 'Canvas Zip Wallet', category: 'Wallets', icon: 'fas fa-wallet', priceMmk: 12000, stock: 45, description: 'Durable canvas wallet with leather trim. Casual everyday essential.' },
  { name: 'RFID Blocker Wallet', category: 'Wallets', icon: 'fas fa-shield-alt', priceMmk: 22000, stock: 28, description: 'Advanced RFID blocking technology keeps your cards safe and secure.' },

  // Totebags
  { name: 'Leather Shopper Tote', category: 'Totebags', icon: 'fas fa-shopping-bag', priceMmk: 45000, stock: 18, description: 'Spacious leather shopper with inner pockets. The ultimate everyday bag.' },
  { name: 'Canvas Beach Tote', category: 'Totebags', icon: 'fas fa-umbrella-beach', priceMmk: 18000, stock: 32, description: 'Oversized canvas tote with waterproof lining. Beach days made easy.' },
  { name: 'Structured Office Tote', category: 'Totebags', icon: 'fas fa-briefcase', priceMmk: 52000, stock: 14, description: 'Professional structured tote with laptop compartment. Work in style.' },
  { name: 'Bohemian Fringe Tote', category: 'Totebags', icon: 'fas fa-feather', priceMmk: 35000, stock: 16, description: 'Free-spirited fringe tote with suede details. Boho chic at its best.' },
  { name: 'Mini Nylon Tote', category: 'Totebags', icon: 'fas fa-shopping-bag', priceMmk: 15000, stock: 40, description: 'Lightweight nylon tote that folds into your pocket. Ultra practical.' },
  { name: 'Monogram Tote', category: 'Totebags', icon: 'fas fa-crown', priceMmk: 68000, stock: 8, description: 'Luxury monogrammed tote with gold hardware. Make a statement.' },
  { name: 'Woven Rattan Tote', category: 'Totebags', icon: 'fas fa-leaf', priceMmk: 28000, stock: 20, description: 'Handcrafted rattan tote with cotton lining. Natural elegance.' },
  { name: 'Convertible Tote', category: 'Totebags', icon: 'fas fa-exchange-alt', priceMmk: 42000, stock: 12, description: 'Versatile tote that converts to a backpack. Two bags in one.' },

  // Brand Bags
  { name: 'Signature Quilted Bag', category: 'Brand Bags', icon: 'fas fa-crown', priceMmk: 185000, stock: 5, description: 'Iconic quilted design from a world-renowned fashion house. Timeless elegance.' },
  { name: 'Monogram Shoulder Bag', category: 'Brand Bags', icon: 'fas fa-crown', priceMmk: 220000, stock: 4, description: 'Classic monogram pattern with premium leather trim. A fashion investment.' },
  { name: 'Designer Saddle Bag', category: 'Brand Bags', icon: 'fas fa-gem', priceMmk: 155000, stock: 6, description: 'Elegant saddle bag shape with signature hardware. Runway to street.' },
  { name: 'Luxury Top Handle', category: 'Brand Bags', icon: 'fas fa-crown', priceMmk: 280000, stock: 3, description: 'The ultimate status symbol. Handcrafted with the finest materials.' },
  { name: 'Brand Chain Crossbody', category: 'Brand Bags', icon: 'fas fa-link', priceMmk: 142000, stock: 7, description: 'Compact crossbody with signature chain strap. Effortless luxury.' },
  { name: 'Classic Tote Designer', category: 'Brand Bags', icon: 'fas fa-crown', priceMmk: 320000, stock: 2, description: 'The iconic designer tote that never goes out of style. A forever piece.' },
  { name: 'Embossed Logo Bag', category: 'Brand Bags', icon: 'fas fa-stamp', priceMmk: 175000, stock: 5, description: 'Subtly embossed logo on premium leather. Understated luxury.' },
  { name: 'Runway Collection Bag', category: 'Brand Bags', icon: 'fas fa-star', priceMmk: 350000, stock: 1, description: 'Limited edition runway piece. Collector\'s dream with Certificate of Authenticity.' },

  // Bags
  { name: 'Everyday Backpack', category: 'Bags', icon: 'fas fa-suitcase', priceMmk: 32000, stock: 25, description: 'Durable backpack with padded laptop sleeve. Your daily companion.' },
  { name: 'Sling Bag Sport', category: 'Bags', icon: 'fas fa-running', priceMmk: 18000, stock: 30, description: 'Lightweight sport sling with breathable back panel. Active lifestyle ready.' },
  { name: 'Messenger Classic', category: 'Bags', icon: 'fas fa-envelope', priceMmk: 28000, stock: 22, description: 'Vintage-inspired messenger with adjustable strap. Cool and functional.' },
  { name: 'Duffle Weekender', category: 'Bags', icon: 'fas fa-suitcase-rolling', priceMmk: 55000, stock: 12, description: 'Spacious weekender with shoe compartment. Travel in organized style.' },
  { name: 'Bucket Bag', category: 'Bags', icon: 'fas fa-circle', priceMmk: 24000, stock: 28, description: 'Trendy bucket bag with drawstring closure. Modern silhouette.' },
  { name: 'Hobo Comfort Bag', category: 'Bags', icon: 'fas fa-cloud', priceMmk: 30000, stock: 20, description: 'Soft and slouchy hobo bag for relaxed everyday style.' },
  { name: 'Belt Bag Urban', category: 'Bags', icon: 'fas fa-shield-alt', priceMmk: 16000, stock: 35, description: 'Urban belt bag with multiple zip pockets. Street style essential.' },
  { name: 'North-South Tote', category: 'Bags', icon: 'fas fa-suitcase', priceMmk: 35000, stock: 18, description: 'Tall north-south tote with secure top zip. Sleek and spacious.' },

  // Keychains
  { name: 'Leather Tassel Charm', category: 'Keychains', icon: 'fas fa-key', priceMmk: 5500, stock: 100, description: 'Elegant leather tassel keychain in assorted colors. Adds flair to any bag.' },
  { name: 'Crystal Ball Charm', category: 'Keychains', icon: 'fas fa-gem', priceMmk: 8000, stock: 80, description: 'Sparkling crystal ball keychain with gold chain. Dazzling accessory.' },
  { name: 'Pearl Bag Charm', category: 'Keychains', icon: 'fas fa-circle', priceMmk: 7200, stock: 75, description: 'Delicate faux pearl charm cluster. Elegant touch for your handbag.' },
  { name: 'Metal Logo Tag', category: 'Keychains', icon: 'fas fa-tag', priceMmk: 4800, stock: 120, description: 'Sleek metal tag keychain with PM Shop logo. Brand with pride.' },
  { name: 'Pom Pom Fluffy', category: 'Keychains', icon: 'fas fa-cloud', priceMmk: 6500, stock: 90, description: 'Ultra-soft fluffy pom pom keychain. Fun and playful bag accessory.' },
  { name: 'Chain Link Charm', category: 'Keychains', icon: 'fas fa-link', priceMmk: 3800, stock: 150, description: 'Chunky chain link keychain in gold or silver. Minimalist and bold.' },
  { name: 'Animal Figure Charm', category: 'Keychains', icon: 'fas fa-paw', priceMmk: 7800, stock: 85, description: 'Cute animal figure keychain. Choose from cat, bear, or bunny designs.' },
  { name: 'Tassel & Bell Set', category: 'Keychains', icon: 'fas fa-bell', priceMmk: 9200, stock: 70, description: 'Decorative tassel with tiny bell. Jingles softly with every step.' }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pm-online-store');
    console.log('Connected. Starting seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Settings.deleteMany({}),
      Coupon.deleteMany({}),
      HeroBanner.deleteMany({})
    ]);

    // Create admin user
    console.log('Creating admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pmonline.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const admin = await User.create({
      name: 'PM Shop Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '+95 900000000'
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);

    // Create categories
    console.log('Creating categories...');
    const categoryMap = {};
    for (const cat of categories) {
      const created = await Category.create(cat);
      categoryMap[cat.name] = created._id;
    }
    console.log(`Created ${categories.length} categories`);

    // Create products
    console.log('Creating products...');
    for (const p of products) {
      const catId = categoryMap[p.category];
      const { category, ...productData } = p;
      await Product.create({ ...productData, category: catId });
    }
    console.log(`Created ${products.length} products`);

    // Create default settings
    console.log('Creating settings...');
    await Settings.create({
      storeName: 'PM Shop',
      storeTagline: 'Premium Handbags Store',
      currency: { primary: 'MMK', secondary: 'THB', exchangeRate: 0.016 }
    });

    // Create sample coupons
    console.log('Creating coupons...');
    await Coupon.create([
      { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderMmk: 10000, description: '10% off your first order' },
      { code: 'PM10000', discountType: 'fixed', discountValue: 10000, minOrderMmk: 100000, description: '10,000 MMK off orders over 100,000 MMK' },
      { code: 'FLASH20', discountType: 'percentage', discountValue: 20, minOrderMmk: 50000, maxDiscountMmk: 50000, description: '20% off (max 50,000 MMK) on orders 50,000 MMK+' }
    ]);

    // Create default hero banners
    console.log('Creating hero banners...');
    await HeroBanner.create([
      { title: 'Premium Handbags Collection', subtitle: 'New Season', buttonText: 'Shop Now', buttonLink: '#wallets', bgColor: '#1a0f0f', sortOrder: 1 },
      { title: 'Designer Tote Bags', subtitle: 'Trending Now', buttonText: 'Explore', buttonLink: '#totebags', bgColor: '#5c1a1a', sortOrder: 2 },
      { title: 'Brand Bags at Best Prices', subtitle: 'Exclusive', buttonText: 'View Collection', buttonLink: '#brandbags', bgColor: '#a93226', sortOrder: 3 }
    ]);

    console.log('\n===== SEED COMPLETE =====');
    console.log(`Admin Login: ${adminEmail} / ${adminPassword}`);
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
    console.log('\nStart server with: npm start');
    console.log('Admin panel: http://localhost:5000/admin');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
