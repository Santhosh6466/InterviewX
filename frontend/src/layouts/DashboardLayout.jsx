import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';
import profileService from '../services/profileService';
import { calculateCompletionPercentage } from '../utils/profileUtils';

export default function DashboardLayout({ children, activeTab = 'Home', searchValue, onSearchChange }) {
  const { logout, user, profileCompleted } = useAuth();
  const { unreadCount } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  useEffect(() => {
    if (user) {
      profileService.getProfile()
        .then(data => setProfileData(data))
        .catch(err => console.warn('[DashboardLayout] Error loading profile:', err));
    } else {
      setProfileData(null);
    }
  }, [user?.id, user?.email]);

  const completionPercentage = profileData ? calculateCompletionPercentage(profileData) : 100;
  const isProfileIncomplete = completionPercentage < 100;

  const getActiveIcon = (iconName, isActive) => {
    if (!isActive) return iconName;
    const mapper = {
      'lucide:home': 'ri:home-fill',
      'lucide:building-2': 'ri:building-2-fill',
      'lucide:file-text': 'ri:file-text-fill',
      'lucide:bookmark': 'ri:bookmark-fill',
      'lucide:pen-tool': 'ri:pen-tool-fill',
      'lucide:user': 'ri:user-fill'
    };
    return mapper[iconName] || iconName;
  };

  const navItems = profileCompleted === false ? [
    { icon: 'lucide:user', label: 'Update Profile', href: '#/update-profile' }
  ] : [
    { icon: 'lucide:home', label: 'Home', href: '#/dashboard' },
    { icon: 'lucide:building-2', label: 'Companies', href: '#/companies' },
    { icon: 'lucide:file-text', label: 'Experiences', href: '#/experiences' },
    { icon: 'lucide:bookmark', label: 'Bookmarks', href: '#/bookmarks' },
    { icon: 'lucide:pen-tool', label: 'My Contributions', href: '#/contributions' },
    { icon: 'lucide:user', label: 'Profile', href: '#/profile' }
  ];

  return (
    <div className="min-h-screen bg-theme-main text-theme-text flex overflow-x-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Left Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[70] w-[260px] h-screen bg-theme-sidebar border-r border-theme-border flex flex-col p-6 flex-shrink-0 transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isSidebarHidden ? 'lg:-ml-[260px]' : 'lg:ml-0'
      }`}>
        <div className="flex items-center justify-between mb-10">
          <a href="#/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo className="h-7 w-auto text-theme-text" />
            <span className="display-font text-xl font-bold tracking-tight text-theme-text">InterviewX</span>
          </a>
          <button className="lg:hidden text-theme-muted hover:text-theme-text" onClick={() => setIsMobileMenuOpen(false)}>
            <iconify-icon icon="lucide:x" className="text-2xl"></iconify-icon>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 mb-6">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.label;
              const hasDot = item.label === 'Profile' && isProfileIncomplete;
              return (
                <a 
                  key={item.label} 
                  href={item.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-sm transition-all text-sm border-l-4 ${
                    isActive 
                      ? 'bg-[#a78b71]/10 border-[#a78b71] text-[#a78b71] font-bold' 
                      : 'border-transparent text-theme-muted hover:text-theme-text hover:bg-theme-hover font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <iconify-icon icon={getActiveIcon(item.icon, isActive)} className="text-[18px]"></iconify-icon>
                    {item.label}
                  </div>
                  {hasDot && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-1" title="Profile Incomplete"></span>
                  )}
                </a>
              );
            })}

            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center text-left gap-3 px-4 py-3 rounded-sm border-l-4 border-transparent transition-all font-medium text-sm text-theme-muted hover:text-theme-text hover:bg-theme-hover cursor-pointer"
            >
              <iconify-icon icon="lucide:log-out" className="text-[18px]"></iconify-icon>
              Logout
            </button>
          </nav>
        </div>

        {/* Share Card */}
        {profileCompleted !== false && (
          <div className="mt-auto premium-card p-5 flex flex-col items-center text-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-theme-hover rounded-full blur-[40px]"></div>
            <iconify-icon icon="lucide:gift" className="text-3xl text-theme-muted"></iconify-icon>
            <p className="text-xs text-theme-muted font-medium">Share your interview experience and help thousands of candidates.</p>
            <a href="#/share" className="btn-primary w-full py-2.5 text-xs">
              Share Experience
            </a>
          </div>
        )}
      </aside>

      {/* Main Column */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="flex-shrink-0 h-20 border-b border-theme-border flex items-center justify-between px-4 sm:px-8 sticky top-0 bg-theme-main/80 backdrop-blur-md z-50 gap-4">
          
          {/* Left Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-sm text-theme-muted hover:text-theme-text hover:bg-theme-hover transition-colors flex-shrink-0 cursor-pointer" 
              onClick={() => setIsMobileMenuOpen(true)}
              title="Open Navigation"
            >
              <iconify-icon icon="lucide:menu" className="text-2xl"></iconify-icon>
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button 
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-sm text-theme-muted hover:text-theme-text hover:bg-theme-hover transition-colors flex-shrink-0 cursor-pointer" 
              onClick={() => setIsSidebarHidden(!isSidebarHidden)}
              title={isSidebarHidden ? "Show Sidebar" : "Hide Sidebar"}
            >
              <iconify-icon icon={isSidebarHidden ? "lucide:panel-left-open" : "lucide:panel-left-close"} className="text-xl"></iconify-icon>
            </button>
          </div>

          {/* Search Bar Container */}
          <div className="flex-1 max-w-xl min-w-0">
            {profileCompleted !== false && (
              <div className="relative flex items-center w-full">
                <iconify-icon icon="lucide:search" className="absolute left-4 text-[16px] text-theme-muted hidden sm:block pointer-events-none"></iconify-icon>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchValue !== undefined ? searchValue : undefined}
                  onChange={onSearchChange ? onSearchChange : undefined}
                  className="input-field w-full py-2 sm:py-2.5 px-4 sm:pl-11 sm:pr-14 rounded-sm text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (window.location.hash !== '#/search' && window.location.hash !== '#/experiences') {
                        window.location.hash = '#/search';
                      }
                    }
                  }}
                />
                <div className="absolute right-3 hidden sm:flex items-center gap-1 pointer-events-none">
                  <span className="bg-theme-main border border-theme-border text-theme-muted text-[10px] px-1.5 py-0.5 rounded-sm font-bold">⌘</span>
                  <span className="bg-theme-main border border-theme-border text-theme-muted text-[10px] px-1.5 py-0.5 rounded-sm font-bold">K</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {profileCompleted !== false && (
              <>
                <a href="#/share" className="btn-primary hidden md:inline-flex items-center gap-2 py-2 px-4 text-xs font-bold">
                  <iconify-icon icon="lucide:plus" className="text-[16px]"></iconify-icon>
                  <span>Share Experience</span>
                </a>
                <a 
                  href="#/notifications" 
                  className="w-9 h-9 rounded-sm flex items-center justify-center text-theme-muted hover:text-theme-text hover:bg-theme-hover transition-colors relative cursor-pointer hidden sm:flex"
                  title="Notifications"
                >
                  <iconify-icon icon="lucide:bell" className="text-[20px]"></iconify-icon>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                  )}
                </a>
              </>
            )}

            {/* Dark/Light Mode Toggle */}
            <button 
              type="button"
              onClick={() => window.dispatchEvent(new Event('toggleTheme'))}
              className="w-9 h-9 rounded-sm flex items-center justify-center text-theme-muted hover:text-theme-text hover:bg-theme-hover transition-colors cursor-pointer relative overflow-hidden"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              <iconify-icon 
                icon="lucide:sun" 
                className={`text-[19px] transition-all duration-300 transform ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'}`}
              ></iconify-icon>
              <iconify-icon 
                icon="lucide:moon" 
                className={`text-[19px] transition-all duration-300 transform ${!isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0 absolute'}`}
              ></iconify-icon>
            </button>

            <div className="h-6 w-[1px] bg-theme-border hidden sm:block mx-1"></div>

            <a 
              href={profileCompleted === false ? "#/update-profile" : "#/profile"} 
              className="flex items-center gap-2.5 py-1 px-1.5 rounded-sm hover:bg-theme-hover transition-colors cursor-pointer"
            >
              <div className="relative flex-shrink-0">
                <Avatar seed={user?.avatarSeed} name={user?.name} size="w-8 h-8" />
                {isProfileIncomplete && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 border-2 border-theme-sidebar rounded-full animate-pulse" title="Profile Incomplete"></span>
                )}
              </div>
              <span className="text-sm font-bold hidden sm:block truncate max-w-[120px]">{user?.name || 'Guest'}</span>
            </a>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 px-4 py-5 sm:px-8 sm:py-6">
          {children}
        </div>
      </main>

      <LogoutConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
      />
    </div>
  );
}
