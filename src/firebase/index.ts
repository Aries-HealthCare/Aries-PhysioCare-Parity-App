'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Always use config in development and production
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Firebase initialization failed with config.', e);
      }
      throw e;
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp)
  };
}

export {
  FirebaseContext,
  FirebaseProvider,
  useFirebase,
  useAuth,
  useFirebaseApp,
  useMemoFirebase,
} from './provider';

export * from './client-provider';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export { useUser } from './auth/use-user';
