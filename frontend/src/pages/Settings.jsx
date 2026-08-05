import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  return (
    <DashboardLayout activeTab="Settings">
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto w-full fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-theme-muted text-sm">Manage your account preferences.</p>
        </div>

        <div className="flex flex-col gap-8">
          
          {/* Account Settings Box */}
          <div className="premium-card flex flex-col gap-6">
            <h2 className="text-lg font-bold pb-4 border-b border-theme-border">Account Settings</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Display Name</label>
                <input type="text" defaultValue={user?.name || ''} className="input-field" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Email Address</label>
                <input type="email" defaultValue={user?.email || ''} className="input-field" disabled />
              </div>
            </div>

            <button type="button" className="w-fit px-6 py-2.5 bg-theme-inverted text-theme-inverted-text rounded-sm text-sm font-bold hover:opacity-80 transition-all mt-2">
              Save Changes
            </button>
          </div>

          {/* Appearance Settings Box */}
          <div className="premium-card flex flex-col gap-6">
            <h2 className="text-lg font-bold pb-4 border-b border-theme-border">Appearance</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-theme-text">Light Theme</h3>
                <p className="text-xs text-theme-muted">Switch between dark and light mode.</p>
              </div>
              <button 
                type="button" 
                className={`w-12 h-6 rounded-sm relative transition-colors shadow-inner ${isDark ? 'bg-theme-main border border-theme-border' : 'bg-zinc-200 border border-zinc-300'}`}
                onClick={() => {
                  window.dispatchEvent(new Event('toggleTheme'));
                }}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-sm transition-transform ${isDark ? 'left-1 bg-zinc-500 translate-x-0' : 'left-1 bg-theme-inverted translate-x-6 shadow-sm'}`}></div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
