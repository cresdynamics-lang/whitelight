const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function updateAdminCredentials() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('🔄 Updating admin credentials...');
    
    const newUsername = 'admin@whitelightstore';
    const newEmail = 'admin@whitelightstore';
    const newPassword = 'Ibrahim@Admin';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Check if admin exists
    const [existingAdmin] = await connection.execute(
      'SELECT id, username, email FROM admins WHERE username = ? OR email = ? OR username LIKE ? OR email LIKE ?',
      ['admin', 'admin@whitelight.com', 'admin@%', '%@whitelight%']
    );

    if (existingAdmin.length > 0) {
      // Update existing admin
      const adminId = existingAdmin[0].id;
      await connection.execute(
        'UPDATE admins SET username = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newUsername, newEmail, hashedPassword, adminId]
      );
      
      console.log('✅ Admin credentials updated successfully!');
      console.log(`📧 Email: ${newEmail}`);
      console.log(`🔑 Username: ${newUsername}`);
      console.log(`🔒 Password: ${newPassword}`);
    } else {
      // Create new admin if none exists
      await connection.execute(
        'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
        [newUsername, newEmail, hashedPassword, 'super_admin']
      );
      
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${newEmail}`);
      console.log(`🔑 Username: ${newUsername}`);
      console.log(`🔒 Password: ${newPassword}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to update admin credentials:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

updateAdminCredentials();
