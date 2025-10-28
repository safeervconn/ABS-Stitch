import React from 'react';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const getStatusConfig = (status: string): { type: StatusType; label: string } => {
  const statusLower = status.toLowerCase();

  if (statusLower === 'completed' || statusLower === 'paid' || statusLower === 'active') {
    return { type: 'success', label: status };
  }

  if (statusLower === 'pending' || statusLower === 'awaiting_payment') {
    return { type: 'pending', label: status.replace('_', ' ') };
  }

  if (statusLower === 'in_progress' || statusLower === 'processing') {
    return { type: 'info', label: status.replace('_', ' ') };
  }

  if (statusLower === 'cancelled' || statusLower === 'failed' || statusLower === 'inactive') {
    return { type: 'error', label: status };
  }

  if (statusLower === 'on_hold' || statusLower === 'partially_paid') {
    return { type: 'warning', label: status.replace('_', ' ') };
  }

  return { type: 'default', label: status };
};

const getTypeClasses = (type: StatusType): string => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide';

  const typeClasses: Record<StatusType, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    pending: 'bg-orange-100 text-orange-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return `${baseClasses} ${typeClasses[type]}`;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, className = '' }) => {
  const config = getStatusConfig(status);
  const badgeType = type || config.type;
  const classes = getTypeClasses(badgeType);

  return (
    <span className={`${classes} ${className}`}>
      {config.label}
    </span>
  );
};
