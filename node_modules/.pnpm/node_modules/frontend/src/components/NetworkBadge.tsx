interface NetworkBadgeProps {
  name: string;
  logo: string;
}

export default function NetworkBadge({ name, logo }: NetworkBadgeProps) {
  return (
    <span className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 ring-1 ring-white/10 text-xs font-semibold text-blue-400">
      <img src={logo} alt={name} className="w-4 h-4 rounded-full" />
      {name}
    </span>
  );
} 