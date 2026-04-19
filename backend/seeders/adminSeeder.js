require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    await sequelize.sync({ alter: true });

    const existing = await User.findOne({ where: { email: 'admin@smartq.com' } });
    if (existing) {
      console.log('ℹ️  Admin account already exists. Skipping seed.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@1234', 12);
    await User.create({
      name: 'System Administrator',
      email: 'admin@smartq.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin account seeded successfully!');
    console.log('   Email   : admin@smartq.com');
    console.log('   Password: Admin@1234');
    console.log('   ⚠️  Change this password immediately after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
