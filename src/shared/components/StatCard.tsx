import React from 'react';
import { LucideIcon } from 'lucide-react';
import { getStatCardColorClasses } from '../utils/statusUtils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, delay = 0 }) => {
  const colorClasses = getStatCardColorClasses(color);

  return (
    <div
      className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`${colorClasses.bg} p-2 sm:p-3 rounded-lg`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colorClasses.text}`} />
        </div>
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-xs sm:text-sm">{title}</p>
    </div>
  );
};

export default StatCard;
