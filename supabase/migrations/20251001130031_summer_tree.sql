```sql
-- Create or replace the is_admin function (ensure it's SECURITY DEFINER)
-- This is crucial to prevent recursion when checking the admin role in RLS policies.
-- If this function already exists and is SECURITY DEFINER, this statement will simply update it.
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  BEGIN
    RETURN EXISTS (SELECT 1 FROM public.employees WHERE id = auth.uid() AND role = 'admin');
  END;
$function$;

-- Create or replace the is_sales_rep function
-- This function will be used to check if the current user is a sales representative.
CREATE OR REPLACE FUNCTION public.is_sales_rep()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  BEGIN
    RETURN EXISTS (SELECT 1 FROM public.employees WHERE id = auth.uid() AND role = 'sales_rep');
  END;
$function$;

-- Drop the existing policy on employees if it exists to avoid conflicts
DROP POLICY IF EXISTS "Sales reps can view designers" ON public.employees;

-- Create the new policy for sales reps to view active designers
-- This policy now uses the 'is_sales_rep()' function to prevent recursion.
CREATE POLICY "Sales reps can view designers"
ON public.employees
FOR SELECT
TO authenticated
USING (
  (role = 'designer'::text) AND (status = 'active'::text) AND public.is_sales_rep()
);

-- Drop the existing policy on categories if it exists to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Create the new policy for admins to manage categories, using the is_admin() function
-- This replaces the inline EXISTS clause with a call to the SECURITY DEFINER function,
-- resolving potential recursion when fetching products (which join categories).
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (
  public.is_admin()
);

-- Ensure RLS is enabled for the employees table (if not already)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
-- Ensure RLS is enabled for the categories table (if not already)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
```