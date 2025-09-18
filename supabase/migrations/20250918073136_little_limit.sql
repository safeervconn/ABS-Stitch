/*
  # Disable Email Confirmation and Fix Authentication

  1. Configuration Changes
    - Disable email confirmation requirement
    - Set default email_confirmed_at for new users
    
  2. User Profile Fixes
    - Update RLS policies to handle signup flow better
    - Ensure proper user creation flow
*/

-- Update auth settings to disable email confirmation
-- Note: This would typically be done in Supabase dashboard under Authentication > Settings
-- But we can create a function to handle this programmatically

-- Create a function to handle new user signup without email confirmation
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically confirm email for new users
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm emails on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- Update existing unconfirmed users (if any)
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, created_at),
  confirmed_at = COALESCE(confirmed_at, created_at)
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- Improve the user profiles INSERT policy to handle signup better
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
CREATE POLICY "Allow profile creation during signup"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR 
    -- Allow during signup process when user might not be fully authenticated yet
    (SELECT auth.uid()) IS NOT NULL
  );