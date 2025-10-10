export type OrderStatus = 'new' | 'in_progress' | 'under_review' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid' | 'partially_paid';

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-purple-100 text-purple-800';
    case 'under_review':
      return 'bg-orange-100 text-orange-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'unpaid':
      return 'bg-red-100 text-red-800';
    case 'partially_paid':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatStatusLabel = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const getStatCardColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  };

  return colorMap[color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};
