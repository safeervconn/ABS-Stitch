import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]);
  const [invoiceId, setInvoiceId] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const merchantOrderId = searchParams.get('merchant-order-id');
        const refNo = searchParams.get('refno');

        if (!merchantOrderId) {
          setLoading(false);
          return;
        }

        setInvoiceId(merchantOrderId);

        let attempts = 0;
        const maxAttempts = 10;

        const checkInvoiceStatus = async (): Promise<boolean> => {
          const { data: invoice, error } = await supabase
            .from('invoices')
            .select('*, orders!inner(order_number)')
            .eq('id', merchantOrderId)
            .single();

          if (error) {
            console.error('Error fetching invoice:', error);
            return false;
          }

          if (invoice && invoice.status === 'paid') {
            const numbers = invoice.orders?.map((o: any) => o.order_number) || [];
            setOrderNumbers(numbers);
            return true;
          }

          return false;
        };

        while (attempts < maxAttempts) {
          const isPaid = await checkInvoiceStatus();
          if (isPaid) {
            break;
          }
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleGoToDashboard = () => {
    navigate('/customer/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      <Navbar />

      <div className="absolute inset-0 -z-10">
        <div className="spotlight spotlight-1"></div>
        <div className="spotlight spotlight-2"></div>
        <div className="spotlight spotlight-3"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-2xl shadow-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="loading-spinner mx-auto mb-6" style={{ width: '60px', height: '60px' }}></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Verifying Payment...
                </h2>
                <p className="text-gray-600">
                  Please wait while we confirm your payment
                </p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                  <p className="text-green-100">
                    Your payment has been processed successfully
                  </p>
                </div>

                <div className="p-8">
                  {orderNumbers.length > 0 ? (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start space-x-3">
                          <Package className="h-6 w-6 text-green-600 mt-1" />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              Order{orderNumbers.length > 1 ? 's' : ''} Confirmed
                            </h3>
                            <div className="space-y-2">
                              {orderNumbers.map((orderNumber, index) => (
                                <div key={index} className="flex items-center justify-between bg-white rounded px-4 py-2">
                                  <span className="font-medium text-gray-700">Order #{orderNumber}</span>
                                  <span className="text-sm text-green-600 font-medium">Paid</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">What happens next?</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Your order{orderNumbers.length > 1 ? 's are' : ' is'} now being processed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Design files will be available in your dashboard</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Track progress in your customer dashboard</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                      <p className="text-yellow-800">
                        Payment received! Your order details will be available shortly in your dashboard.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleGoToDashboard}
                    className="w-full btn-primary btn-large"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
