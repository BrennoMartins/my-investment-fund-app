import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  valueColor?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, valueColor = 'text-white' }: KPICardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-500 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400">{title}</p>
          <p className={`text-xl font-bold mt-1 truncate ${valueColor}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg bg-gray-700 text-blue-400 shrink-0">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
