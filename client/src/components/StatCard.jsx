import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
  trend,
  subtitle,
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${colors[color]}
        text-white
        rounded-2xl
        p-6
        shadow-xl
        hover:shadow-2xl
        transition-all duration-300
        hover:-translate-y-1
      `}
    >
      {/* subtle overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>

          <p className="text-4xl font-black tracking-tight mb-2">
            {value}
          </p>

          {subtitle && (
            <p className="text-xs opacity-80">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.direction === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-200" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-200" />
              )}
              <span className="text-sm font-semibold">
                {trend.value}
              </span>
            </div>
          )}
        </div>

        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
          {icon}
        </div>
      </div>
    </div>
  );
}
