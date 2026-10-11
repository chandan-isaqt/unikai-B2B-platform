const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Address = require('../models/Address');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Salesman = require('../models/Salesman');
const Setting = require('../models/Setting');
const Cart = require('../models/Cart');
const { resetAndImportOfficialCatalogue } = require('./resetProducts');

const seedDatabase = async () => {
  const isReset = process.argv.includes('--reset');
  console.log('====================================================');
  console.log('UNIKAI B2B PLATFORM - OFFICIAL CATALOGUE SEEDER');
  console.log('====================================================');

  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to local MongoDB. Aborting seed.');
    process.exit(1);
  }

  try {
    console.log(
      isReset
        ? 'Resetting and clearing existing collections...'
        : 'Clearing existing user/order data and importing official Unikai catalogue...'
    );

    await Promise.all([
      User.deleteMany({}),
      Address.deleteMany({}),
      Order.deleteMany({}),
      OrderItem.deleteMany({}),
      Salesman.deleteMany({}),
      Setting.deleteMany({}),
      Cart.deleteMany({}),
    ]);

    // 1. Seed Admin User from .env
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@unikai.local').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(adminPassword, salt);

    const adminUser = await User.create({
      name: 'Unikai System Administrator',
      companyName: 'Unikai Foods PJSC - Head Office',
      email: adminEmail,
      phone: '+968 2450 1000',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      lastLoginAt: new Date(),
      isActive: true,
    });
    console.log(`[1/4] Admin user created: ${adminUser.email}`);

    // Seed Executive Accounts for Executive Dashboard
    const ceoPasswordHash = await bcrypt.hash('Ceo@12345', salt);
    await User.create({
      name: 'Chief Executive Officer',
      companyName: 'Unikai Foods PJSC - Executive Board',
      email: 'ceo@unikai.local',
      phone: '+968 2450 1001',
      passwordHash: ceoPasswordHash,
      role: 'CEO',
      lastLoginAt: new Date(),
      isActive: true,
    });

    const gmPasswordHash = await bcrypt.hash('Gm@12345', salt);
    await User.create({
      name: 'General Manager',
      companyName: 'Unikai Foods PJSC - Executive Management',
      email: 'gm@unikai.local',
      phone: '+968 2450 1002',
      passwordHash: gmPasswordHash,
      role: 'GM',
      lastLoginAt: new Date(),
      isActive: true,
    });

    const cmPasswordHash = await bcrypt.hash('Cm@12345', salt);
    await User.create({
      name: 'Country Manager',
      companyName: 'Unikai Foods Oman & GCC Operations',
      email: 'countrymanager@unikai.local',
      phone: '+968 2450 1003',
      passwordHash: cmPasswordHash,
      role: 'COUNTRY_MANAGER',
      lastLoginAt: new Date(),
      isActive: true,
    });
    console.log('      Executive accounts seeded (ceo@unikai.local, gm@unikai.local, countrymanager@unikai.local)');

    // 2. Seed B2B Customer Accounts & Addresses
    const customerPasswordHash = await bcrypt.hash('Customer@12345', salt);

    const demoCustomer1 = await User.create({
      name: 'Tariq Al-Balushi',
      companyName: 'Al-Maha Hypermarket LLC',
      email: 'customer@unikai.local',
      phone: '+968 9512 3456',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isActive: true,
    });

    const addr1 = await Address.create({
      user: demoCustomer1._id,
      label: 'Ruwi Central Hypermarket Warehouse',
      companyName: 'Al-Maha Hypermarket LLC',
      fullName: 'Tariq Al-Balushi',
      phone: '+968 9512 3456',
      street: 'Building 42, Way 3109, Ruwi Commercial District',
      area: 'Ruwi',
      city: 'Muscat',
      country: 'Oman',
      postalCode: '112',
      notes: 'Cold storage receiving bay #3 (7 AM - 4 PM)',
      isDefault: true,
    });

    const addr2 = await Address.create({
      user: demoCustomer1._id,
      label: 'Al Khuwair Retail Branch',
      companyName: 'Al-Maha Hypermarket LLC',
      fullName: 'Salim Al-Rashdi (Branch Manager)',
      phone: '+968 9588 7711',
      street: 'Sultan Qaboos Street, Plot 118',
      area: 'Al Khuwair',
      city: 'Muscat',
      country: 'Oman',
      postalCode: '133',
      notes: 'Rear loading dock',
      isDefault: false,
    });

    demoCustomer1.addresses = [addr1._id, addr2._id];
    await demoCustomer1.save();

    const demoCustomer2 = await User.create({
      name: 'Nasser Al-Harthy',
      companyName: 'Muscat Grand HORECA Catering',
      email: 'nasser@muscatcatering.om',
      phone: '+968 9234 8890',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      lastLoginAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      isActive: true,
    });

    const addr3 = await Address.create({
      user: demoCustomer2._id,
      label: 'Ghala Central Kitchen',
      companyName: 'Muscat Grand HORECA Catering',
      fullName: 'Nasser Al-Harthy',
      phone: '+968 9234 8890',
      street: 'Street 64, Ghala Industrial Area',
      area: 'Ghala',
      city: 'Muscat',
      country: 'Oman',
      postalCode: '130',
      isDefault: true,
    });
    demoCustomer2.addresses = [addr3._id];
    await demoCustomer2.save();

    console.log(
      `[2/4] Seeded B2B customer accounts (primary: customer@unikai.local / Customer@12345)`
    );

    // 3. Seed Salesman Sachin & Settings
    const whatsappNum = process.env.WHATSAPP_NUMBER || '+96891234567';
    const salesman = await Salesman.create({
      name: process.env.SALESMAN_NAME || 'Sachin',
      title: 'Senior B2B Key Account Executive - Oman & GCC',
      phone: process.env.SALESMAN_PHONE || whatsappNum,
      whatsappNumber: whatsappNum,
      email: process.env.SALESMAN_EMAIL || 'sachin.sales@unikai.local',
      region: 'Muscat, Batinah & Sultanate of Oman Wholesale Network',
      workingHours: 'Sun - Thu: 7:30 AM - 6:30 PM (Oman Time)',
      isActive: true,
    });

    await Setting.create({
      companyName: 'Unikai Foods PJSC - B2B Wholesale Portal',
      currency: 'OMR',
      currencySymbol: 'OMR',
      currencyDecimals: 3,
      minOrderAmount: 0,
      supportEmail: 'b2b.oman@unikai.com',
      supportPhone: '+968 2450 1234',
      headOfficeAddress: 'Ghala Industrial Estate, Muscat, Sultanate of Oman',
      whatsappOrderEnabled: true,
    });
    console.log(`[3/4] Seeded Salesman "${salesman.name}" (${salesman.whatsappNumber}) & Settings`);

    // 4. Reset & Import Official Unikai Product Catalogue (NO fake demo products or fake prices)
    const { summary } = await resetAndImportOfficialCatalogue();
    console.log(
      `[4/4] Imported ${summary.newProductsImported} official Unikai products across 4 categories`
    );

    console.log('====================================================');
    console.log('LOCAL MONGODB SEED COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log(`Database URI   : ${process.env.MONGODB_URI}`);
    console.log(`Admin Login    : ${adminEmail} / ${adminPassword}`);
    console.log(`Customer Login : customer@unikai.local / Customer@12345`);
    console.log(`Salesman       : ${salesman.name} (${salesman.whatsappNumber})`);
    console.log('====================================================');

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await closeDB();
    process.exit(1);
  }
};

seedDatabase();
