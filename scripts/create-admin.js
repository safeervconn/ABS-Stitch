#!/usr/bin/env node

/**
 * Admin Creation Script
 * 
 * This is the ONLY way to create admin accounts.
 * Usage: node scripts/create-admin.js <email> <password> <full_name>
 * Example: node scripts/create-admin.js admin@absstitch.com Password@123 "Admin User"
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please check your .env file and ensure both variables are set.');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin(email, password, fullName) {
  try {
    console.log('🔧 Creating admin account...');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${fullName}`);
    console.log('');

    // Step 1: Create user in auth.users
    console.log('1️⃣ Creating user in auth system...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role: 'admin'
      }
    });

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('No user data returned from auth creation');
    }

    console.log(`✅ Auth user created with ID: ${authData.user.id}`);

    // Step 2: Create employee record
    console.log('2️⃣ Creating employee record...');
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .insert([{
        id: authData.user.id,
        full_name: fullName,
        email: email,
        role: 'admin',
        status: 'active'
      }])
      .select()
      .single();

    if (employeeError) {
      // If employee creation fails, clean up the auth user
      console.log('🧹 Cleaning up auth user due to employee creation failure...');
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create employee record: ${employeeError.message}`);
    }

    console.log('✅ Employee record created successfully');
    console.log('');
    console.log('🎉 Admin account created successfully!');
    console.log('');
    console.log('📋 Account Details:');
    console.log(`   ID: ${authData.user.id}`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${fullName}`);
    console.log(`   Role: admin`);
    console.log(`   Status: active`);
    console.log('');
    console.log('🔐 You can now log in with these credentials at /login');

  } catch (error) {
    console.error('❌ Error creating admin account:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.error('❌ Invalid usage!');
  console.error('');
  console.error('Usage: node scripts/create-admin.js <email> <password> <full_name>');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/create-admin.js admin@absstitch.com Password@123 "Admin User"');
  console.error('');
  console.error('Arguments:');
  console.error('  email     - Admin email address');
  console.error('  password  - Admin password (min 8 characters)');
  console.error('  full_name - Admin full name (use quotes if contains spaces)');
  process.exit(1);
}

const [email, password, fullName] = args;

// Basic validation
if (!email.includes('@')) {
  console.error('❌ Invalid email address');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Password must be at least 8 characters long');
  process.exit(1);
}

if (!fullName.trim()) {
  console.error('❌ Full name cannot be empty');
  process.exit(1);
}

// Create the admin
createAdmin(email, password, fullName);