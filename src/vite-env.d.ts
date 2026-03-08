/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  readonly VITE_FIREBASE_VAPID_KEY: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Firebase global types
interface Window {
  firebase: {
    initializeApp: (config: any) => any;
    auth: () => {
      onAuthStateChanged: (callback: (user: any) => void) => () => void;
      createUserWithEmailAndPassword: (email: string, password: string) => Promise<any>;
      signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
      signOut: () => Promise<void>;
      sendPasswordResetEmail: (email: string) => Promise<void>;
      currentUser: any;
    };
    firestore: () => {
      collection: (name: string) => any;
      runTransaction: (callback: (transaction: any) => Promise<void>) => Promise<void>;
    };
    storage: () => {
      ref: (path: string) => any;
    };
    messaging: {
      isSupported: () => boolean;
      (): {
        getToken: (options?: any) => Promise<string>;
        onMessage: (callback: (payload: any) => void) => void;
      };
    };
  };
}
