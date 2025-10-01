```sql
-- Create a SECURITY DEFINER function to check if the current user is an active sales_rep
-- This function runs with elevated privileges, bypassing RLS on the employees table
CREATE OR REPLACE FUNCTION public.is_sales_rep()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  BEGIN
    RETURN EXISTS (
      SELECT 1
      FROM public.employees
      WHERE id = auth.uid() AND role = 'sales_rep' AND status = 'active'
    );
  END;
$function$;

-- Drop the existing policy to avoid conflicts and ensure a clean update
DROP POLICY IF EXISTS "Sales reps can view designers" ON public.employees;

-- Create or replace the RLS policy to allow sales reps to view active designers
-- This policy uses the new is_sales_rep() function to prevent recursion
CREATE POLICY "Sales reps can view designers" ON public.employees
  FOR SELECT USING (
    (role = 'designer'::text AND status = 'active'::text) AND public.is_sales_rep()
  );

-- Ensure the policy is enabled (it should be by default if RLS is enabled on the table)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
```