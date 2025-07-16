import React from 'react';

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ActionModal: React.FC<ActionModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#232b3b] rounded-2xl shadow-2xl p-6 w-full max-w-md mx-2 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center text-white">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default ActionModal; 