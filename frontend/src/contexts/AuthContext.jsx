import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Helper to safely read user from localStorage
const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser);
    // Validate that user object actually has required fields
    if (parsed && parsed.name && parsed.email) {
      return parsed;
    }
    // Invalid/incomplete user data — clear it
    console.warn('[AuthContext] Stored user missing name/email, clearing:', parsed);
    localStorage.removeItem('user');
    return null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

// Helper to safely read token, but only if user also exists
const getStoredToken = () => {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  if (token && !user) {
    localStorage.removeItem('token');
    return null;
  }
  return token || null;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(getStoredUser);
  const [profileCompleted, setProfileCompleted] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = useCallback(async () => {
    const storedUserStr = localStorage.getItem('user');
    if (!localStorage.getItem('token') || !storedUserStr) {
      setProfileCompleted(null);
      setLoadingProfile(false);
      return;
    }
    try {
      setLoadingProfile(true);
      const response = await api.get('/profile');
      setProfileCompleted(response.data.profileCompleted);
      
      // Sync the user's name and avatarSeed from their profile to the global auth state
      const profileName = response.data.name || response.data.fullName;
      const profileAvatarSeed = response.data.avatarSeed;
      if (profileName || profileAvatarSeed) {
        const currentUser = JSON.parse(storedUserStr);
        let updated = false;
        const updatedUser = { ...currentUser };
        if (profileName && currentUser.name !== profileName) {
          updatedUser.name = profileName;
          updated = true;
        }
        if (profileAvatarSeed && currentUser.avatarSeed !== profileAvatarSeed) {
          updatedUser.avatarSeed = profileAvatarSeed;
          updated = true;
        }
        if (updated) {
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Error fetching profile status:', err);
      // Only mark profile as incomplete if 404 Not Found (meaning profile is not created yet)
      // For any 500 server error, network timeout, or connection error, do NOT force user to update-profile
      if (err.response && err.response.status === 404) {
        setProfileCompleted(false);
      } else {
        // Fallback to true so the user is not kicked to the update-profile page on server errors
        setProfileCompleted(true);
      }
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      fetchProfile();
    } else {
      setProfileCompleted(null);
      setLoadingProfile(false);
    }
  }, [token, user, fetchProfile]);

  const saveAuthData = useCallback((jwtToken, userData) => {
    // Write to localStorage FIRST
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('[AuthContext] saveAuthData - token:', jwtToken ? 'SET' : 'EMPTY');
    console.log('[AuthContext] saveAuthData - user:', userData);
    // Then update React state
    setToken(jwtToken);
    setUser(userData);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      console.log('[AuthContext] LOGIN - Response data:', data);
      const token = data.token || data.jwt || data.accessToken;
      const rawUser = data.user || data;
      const userData = {
        id: rawUser.id,
        name: rawUser.name || rawUser.username || email.split('@')[0],
        email: rawUser.email || email,
        role: rawUser.role || 'USER',
        avatarSeed: rawUser.avatarSeed || 'default-avatar',
        token: token
      };
      if (token) {
        saveAuthData(token, userData);
        return { success: true };
      } else {
        return { success: false, error: 'No authentication token received' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message || 'Login failed';
      return { success: false, error: typeof msg === 'string' ? msg : 'Login failed' };
    }
  }, [saveAuthData]);

  const sendOtp = useCallback(async (email) => {
    try {
      await authService.sendOtp(email);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message || 'Failed to send OTP';
      return { success: false, error: typeof msg === 'string' ? msg : 'Failed to send OTP' };
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    try {
      await authService.verifyOtp(email, otp);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message || 'Invalid OTP';
      return { success: false, error: typeof msg === 'string' ? msg : 'Invalid OTP' };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      console.log('[AuthContext] REGISTER - Response data:', data);
      const token = data.token || data.jwt || data.accessToken;
      const rawUser = data.user || data;
      const userData = {
        id: rawUser.id,
        name: rawUser.name || rawUser.username || name,
        email: rawUser.email || email,
        role: rawUser.role || 'USER',
        avatarSeed: rawUser.avatarSeed || 'default-avatar',
        token: token
      };
      if (token) {
        sessionStorage.setItem('justRegistered', 'true');
        localStorage.setItem('justRegistered', 'true');
        saveAuthData(token, userData);
        return { success: true };
      } else {
        return { success: false, error: 'No authentication token received' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message || 'Registration failed';
      return { success: false, error: typeof msg === 'string' ? msg : 'Registration failed' };
    }
  }, [saveAuthData]);

  const googleLogin = useCallback(async (idToken) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      const data = response.data;
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatarSeed: data.avatarSeed || 'default-avatar',
        token: data.token
      };
      saveAuthData(data.token, userData);
      return { success: true, user: userData };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message || 'Google login failed';
      return { success: false, error: typeof msg === 'string' ? msg : 'Google login failed' };
    }
  }, [saveAuthData]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setProfileCompleted(null);
    setLoadingProfile(false);
    window.location.hash = '#/signin';
  }, []);

  const value = {
    token,
    user,
    setUser,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    googleLogin,
    sendOtp,
    verifyOtp,
    register,
    profileCompleted,
    loadingProfile,
    fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
