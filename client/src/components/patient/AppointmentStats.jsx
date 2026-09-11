export default function AppointmentStats({
  title,
  count,
  active,
  color,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-6 text-left transition-all duration-200 ${
        active
          ? "border-green-600 bg-green-50 shadow-md"
          : "bg-white hover:shadow-md hover:border-gray-300"
      }`}
    >
      <p className="text-gray-500 text-sm font-medium">
        {title}
      </p>

      <h2
        className={`text-4xl font-bold mt-3 ${color}`}
      >
        {count}
      </h2>
    </button>
  );
}