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
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses.bg} p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${colorClasses.text}`} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );
};

export default StatCard;
