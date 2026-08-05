import React from 'react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title = "Confirm Delete", message = "Are you sure you want to delete this item? This action cannot be undone.", isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="premium-card max-w-sm w-full p-6 flex flex-col gap-6 shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 text-red-500 text-xl">
            <iconify-icon icon="lucide:trash-2"></iconify-icon>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-theme-text">{title}</h3>
            <p className="text-sm text-theme-muted leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button 
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-sm border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-hover active:scale-[0.97] transition-all text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-500 text-white rounded-sm active:scale-[0.97] transition-all text-sm font-bold hover:bg-red-600 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
