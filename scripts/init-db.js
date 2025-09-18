/**
 * Database Initialization Script
 * 
 * This script helps initialize the database and provides information
 * about creating the admin user.
 */

import { supabase, ensureAdminUser } from '../src/lib/supabase.js';

async function initializeDatabase() {
  console.log('🚀 Initializing ABS STITCH Database...\n');
  
  try {
    // Test database connection
    const { data, error } = await supabase.from('user_profiles').select('count').single();
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n📋 Setup Instructions:');
      console.log('1. Make sure you have set up Supabase project');
      console.log('2. Run the migration file: supabase/migrations/create_complete_schema.sql');
      console.log('3. Set your environment variables in .env file');
      return;
    }
    
    console.log('✅ Database connection successful!');
    
    // Check for admin user
    console.log('\n👤 Checking for admin user...');
    const adminUser = await ensureAdminUser();
    
    if (!adminUser) {
      console.log('\n📋 Admin User Setup:');
      console.log('1. Go to: http://localhost:5173/signup');
      console.log('2. Sign up with email: admin@absstitch.com');
      console.log('3. Use any password (minimum 8 characters)');
      console.log('4. The system will automatically assign admin role');
      console.log('\n🔐 Admin Login Credentials:');
      console.log('Email: admin@absstitch.com');
      console.log('Password: [whatever you set during signup]');
    } else {
      console.log('✅ Admin user exists and is ready!');
    }
    
    // Check sample data
    const { data: products } = await supabase.from('products').select('count').single();
    console.log(`\n📦 Sample products in database: ${products?.count || 0}`);
    
    console.log('\n🎉 Database initialization complete!');
    console.log('\n🌐 Application URLs:');
    console.log('- Homepage: http://localhost:5173/');
    console.log('- Login: http://localhost:5173/login');
    console.log('- Signup: http://localhost:5173/signup');
    console.log('- Catalog: http://localhost:5173/catalog');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
  }
}

// Run initialization
initializeDatabase();