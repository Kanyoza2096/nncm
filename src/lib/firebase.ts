/// <reference types="vite/client" />

/**
 * Firebase Configuration
 * All credentials are loaded from environment variables for security
 * Never commit actual Firebase keys to the repository
 */

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  firebaseConfig.apiKey &&
  !firebaseConfig.projectId.includes('placeholder') &&
  !firebaseConfig.apiKey.includes('placeholder')
);

if (!isFirebaseConfigured) {
  console.warn(
    '[Firebase Client] Missing or incomplete Firebase configuration. Please set the following environment variables:\n' +
    'VITE_FIREBASE_PROJECT_ID\n' +
    'VITE_FIREBASE_APP_ID\n' +
    'VITE_FIREBASE_API_KEY\n' +
    'VITE_FIREBASE_AUTH_DOMAIN\n' +
    'VITE_FIREBASE_STORAGE_BUCKET\n' +
    'VITE_FIREBASE_MESSAGING_SENDER_ID'
  );
}

export { firebaseConfig, isFirebaseConfigured };
