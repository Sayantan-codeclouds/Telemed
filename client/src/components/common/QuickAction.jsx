export default function QuickAction({
  icon,
  title,
  description,
}) {
  return (
    <button
      className="
      bg-white
      rounded-3xl
      p-6
      shadow-sm
      hover:shadow-xl
      hover:-translate-y-1
      transition-all
      text-left
      border
      border-slate-100
      "
    >
      <div className="text-blue-600 mb-5">

        {icon}

      </div>

      <h3 className="font-semibold text-lg">

        {title}

      </h3>

      <p className="text-slate-500 mt-2 text-sm">

        {description}

      </p>

    </button>
  );
}