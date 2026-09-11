export default function InfoItem({
  label,
  value,
}) {
  return (
    <div className="space-y-1">

      <p className="text-sm text-slate-500">

        {label}

      </p>

      <h3 className="font-semibold text-slate-800">

        {value || "-"}

      </h3>

    </div>
  );
}