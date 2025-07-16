interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export default function MenuItem({ icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition text-left w-full ${danger ? 'text-red-400' : 'text-white'}`}
      onClick={onClick}
    >
      <span>{icon}</span>
      <span className="font-semibold text-base">{label}</span>
    </button>
  );
} 