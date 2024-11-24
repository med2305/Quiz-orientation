import bcrypt from 'bcryptjs';
import User from '@/app/models/User';
import dbConnect from './mongodb';

export async function initializeAdmin() {
  try {
    await dbConnect();

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      email: 'admin@admin.com',
      password: hashedPassword,
      nom: 'Admin',
      prenom: 'Super',
      tel: '0123456789',
      role: 'admin',
    });

    await adminUser.save();
    console.log('Default admin user created successfully');

    // Create a default conseiller user
    const conseillerExists = await User.findOne({ role: 'conseiller' });
    if (!conseillerExists) {
      const conseillerPassword = await bcrypt.hash('conseiller123', 10);
      const conseillerUser = new User({
        email: 'conseiller@orientation.com',
        password: conseillerPassword,
        nom: 'Conseiller',
        prenom: 'Principal',
        tel: '0123456788',
        role: 'conseiller',
      });
      await conseillerUser.save();
      console.log('Default conseiller user created successfully');
    }

  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}
