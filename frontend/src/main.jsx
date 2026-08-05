import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: 'var(--theme-card)',
              color: 'var(--theme-text)',
              border: '1px solid var(--theme-border)',
              borderRadius: '12px',
              fontFamily: 'Satoshi, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: 'var(--theme-text)',
                secondary: 'var(--theme-card)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--theme-text)',
                secondary: 'var(--theme-card)',
              },
            },
          }}
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
