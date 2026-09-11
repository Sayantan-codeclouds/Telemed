export default function ProfileCard({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        bg-white
        rounded-3xl
        shadow-sm
        border
        border-slate-200
        p-8
        ${className}
      `}
    >
      {children}
    </div>
  );
}