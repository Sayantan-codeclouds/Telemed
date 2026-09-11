import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "bg-blue-600",
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-slate-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {value}
          </h2>

          <p className="text-green-600 mt-2 text-sm flex items-center gap-1">
            <ArrowUpRight size={15} />
            {subtitle}
          </p>

        </div>

        <div className={`${color} text-white p-4 rounded-2xl`}>
          {icon}
        </div>

      </div>

    </div>
  );
}