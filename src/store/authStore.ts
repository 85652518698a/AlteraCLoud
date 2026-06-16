import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { isAdmin } from '../constants/admins';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
}

declare global {
  interface Window {
    __ANDROID_FIREBASE_TOKEN?: string;
    __ANDROID_USER_EMAIL?: string;
    __ANDROID_USER_NAME?: string;
  }
}

let state: AuthState = {
  user: null,
  loading: true,
};

let androidToken: string | null = null;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function firebaseUserToProfile(firebaseUser: User): UserProfile {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    photoURL: firebaseUser.photoURL || undefined,
    role: isAdmin(firebaseUser.email) ? 'admin' : 'user',
  };
}

function set(next: Partial<AuthState>) {
  state = { ...state, ...next };
  emit();
}

function checkAndroidAuth() {
  const token = window.__ANDROID_FIREBASE_TOKEN;
  const email = window.__ANDROID_USER_EMAIL;
  const name = window.__ANDROID_USER_NAME;
  if (token && email) {
    androidToken = token;
    set({
      user: {
        uid: 'android-' + email,
        email,
        displayName: name || email.split('@')[0],
        role: isAdmin(email) ? 'admin' : 'user',
      },
      loading: false,
    });
  }
}

// Initialize Firebase auth listener once
let initialized = false;
function initAuth() {
  if (initialized) return;
  initialized = true;

  // Listen for Android native auth injection
  if (typeof window !== 'undefined') {
    window.addEventListener('androidAuthReady', () => checkAndroidAuth());
    // Check if already injected (page loaded after injection)
    checkAndroidAuth();
  }

  onAuthStateChanged(auth, (firebaseUser) => {
    // Don't override Android auth state with null
    if (androidToken && !firebaseUser) return;
    if (firebaseUser && firebaseUser.email) {
      set({
        user: firebaseUserToProfile(firebaseUser),
        loading: false,
      });
    } else if (!androidToken) {
      set({ user: null, loading: false });
    }
  });
}

export const authStore = {
  get: () => state,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  initSession: () => {
    initAuth();
  },

  login: async () => {
    if (window.__ANDROID_FIREBASE_TOKEN) return; // Already signed in via Android
    await signInWithPopup(auth, googleProvider);
  },

  logout: async () => {
    androidToken = null;
    await signOut(auth);
  },

  getFirebaseIdToken: async (): Promise<string | null> => {
    if (androidToken) return androidToken;
    const user = auth.currentUser;
    return user ? user.getIdToken() : null;
  },
};

export function useAuthStore<SelectorOutput>(
  selector: (s: AuthState) => SelectorOutput
): SelectorOutput {
  const [slice, setSlice] = useState(() => selector(state));

  useEffect(() => {
    const unsub = authStore.subscribe(() => {
      setSlice(selector(state));
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return slice;
}
