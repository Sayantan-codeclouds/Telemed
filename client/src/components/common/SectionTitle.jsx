export default function SectionTitle({
  title,
  subtitle,
}) {
  return (
    <div className="mb-6">

      <h2 className="text-2xl font-bold text-slate-800">
        {title}
      </h2>

      {subtitle && (
        <p className="text-slate-500 mt-1">
          {subtitle}
        </p>
      )}

    </div>
  );
}