@@ .. @@
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
-        customer:customers(full_name, email)
+        customer:customers(full_name, email, company_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      customer_name: data.customer?.full_name,
      customer_email: data.customer?.email,
+      customer_company_name: data.customer?.company_name,
    };
  } catch (error) {
    console.error('Error fetching invoice by ID:', error);
    throw error;
  }
};