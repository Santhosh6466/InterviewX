import React, { useState, useEffect } from 'react';
import Hero from './pages/Hero';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import ExperienceDetails from './pages/ExperienceDetails';
import ShareExperience from './pages/ShareExperience';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
import UpdateProfile from './pages/UpdateProfile';
import CompleteProfile from './pages/CompleteProfile';
import PublicProfile from './pages/PublicProfile';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import MyContributions from './pages/MyContributions';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [route, setRoute] = useState(window.location.hash);
  const { isAuthenticated, profileCompleted, loadingProfile } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return true; // Default to dark theme for this app
    }
    return true;
  });

  useEffect(() => {
    const isLandingPage = route === '' || route === '#/';
    if (isDark || isLandingPage) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (!isLandingPage) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    // Also trigger a custom event so Settings can read the current state if needed
    window.dispatchEvent(new Event('themechange'));
  }, [isDark, route]);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    
    // Listen for theme toggle from anywhere
    const toggleTheme = () => setIsDark(prev => !prev);
    window.addEventListener('toggleTheme', toggleTheme);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('toggleTheme', toggleTheme);
    };
  }, []);

  // Auth guard: redirect unauthenticated users away from protected routes
  const isPublicRoute = route === '' || route === '#/' || route === '#/signin' || route === '#/signup';

  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      window.location.hash = '#/signin';
      return;
    }
    
    if (isAuthenticated) {
      if (loadingProfile) return;

      const justRegistered = sessionStorage.getItem('justRegistered') === 'true' || localStorage.getItem('justRegistered') === 'true';
      const onboardingSkipped = sessionStorage.getItem('onboardingSkipped') === 'true' || localStorage.getItem('onboardingSkipped') === 'true';

      if (justRegistered) {
        if (route !== '#/complete-profile') {
          window.location.hash = '#/complete-profile';
        }
      } else if (profileCompleted === false && !onboardingSkipped) {
        if (route !== '#/update-profile') {
          window.location.hash = '#/update-profile';
        }
      } else {
        if (route === '#/signin' || route === '#/signup' || route === '#/complete-profile') {
          window.location.hash = '#/dashboard';
        }
      }
    }
  }, [isAuthenticated, route, isPublicRoute, loadingProfile, profileCompleted]);

  // Determine if the app is globally loading or redirecting
  let isAppLoading = false;
  if (!isAuthenticated && !isPublicRoute) {
    isAppLoading = true;
  } else if (isAuthenticated && (route === '#/signin' || route === '#/signup' || route === '#/complete-profile')) {
    const justRegistered = sessionStorage.getItem('justRegistered') === 'true' || localStorage.getItem('justRegistered') === 'true';
    if (!justRegistered || route !== '#/complete-profile') {
      isAppLoading = true;
    }
  } else if (isAuthenticated && loadingProfile) {
    isAppLoading = true;
  }

  if (route === '' || route === '#/') {
    return (
      <>
        <PageLoader isLoading={isAppLoading} />
        {!isAppLoading && <Hero />}
      </>
    );
  }

  const renderContent = () => {
    if (route === '#/signin') return <SignIn />;
    if (route === '#/signup') return <SignUp />;
    if (route === '#/dashboard') return <Dashboard />;
    if (route === '#/companies') return <Companies />;
    if (route.startsWith('#/company/')) return <CompanyDetails />;
    if (route.startsWith('#/experience/')) return <ExperienceDetails />;
    if (route === '#/experiences') return <SearchResults />;
    if (route === '#/share') return <ShareExperience />;
    if (route === '#/bookmarks') return <Bookmarks />;
    if (route === '#/profile') return <Profile sidebarTab="Profile" />;
    if (route === '#/contributions') return <MyContributions />;
    if (route === '#/search') return <SearchResults />;
    if (route === '#/settings') {
      window.location.hash = '#/dashboard';
      return null;
    }
    if (route === '#/update-profile') return <UpdateProfile />;
    if (route === '#/complete-profile') return <CompleteProfile />;
    if (route.startsWith('#/users/')) return <PublicProfile />;
    if (route === '#/notifications') return <Notifications />;
    
    return <NotFound />;
  };

  return (
    <>
      <PageLoader isLoading={isAppLoading} />
      {!isAppLoading && (
        <div key={route} className="page-transition min-h-screen">
          <ErrorBoundary key={route}>
            {renderContent()}
          </ErrorBoundary>
        </div>
      )}
    </>
  );
}

export default App;
