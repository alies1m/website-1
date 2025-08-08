export function GradeBadge({ status, score, total, small = false }) {
  const color = status === "full" ? "bg-green-500" : status === "none" ? "bg-red-500" : "bg-orange-500";
  const size = small ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full text-white ${color} ${size}`}>
      <span className="font-semibold">{score}/{total}</span>
      <span className="opacity-90 capitalize">{status}</span>
    </span>
  );
}