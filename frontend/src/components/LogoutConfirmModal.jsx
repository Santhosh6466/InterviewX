import React from 'react';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div 
        className="premium-card max-w-sm w-full p-6 flex flex-col gap-6 shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-sm bg-theme-hover border border-theme-border flex items-center justify-center flex-shrink-0 text-theme-text text-xl">
            <iconify-icon icon="lucide:log-out"></iconify-icon>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-theme-text">Confirm Logout</h3>
            <p className="text-sm text-theme-muted leading-relaxed">
              Are you sure you want to log out of your account?
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-sm border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-hover active:scale-[0.97] transition-all text-sm font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-theme-inverted text-theme-inverted-text rounded-sm active:scale-[0.97] transition-all text-sm font-bold hover:opacity-85 cursor-pointer shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
