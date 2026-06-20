import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { isAdmin } from '../constants/admins';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
}

let state: AuthState = {
  user: null,
  loading: true,
};

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

// Initialize Firebase auth listener once
let initialized = false;
function initAuth() {
  if (initialized) return;
  initialized = true;

  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser && firebaseUser.email) {
      set({
        user: firebaseUserToProfile(firebaseUser),
        loading: false,
      });
    } else {
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
    await signInWithPopup(auth, googleProvider);
  },

  logout: async () => {
    await signOut(auth);
  },

  getFirebaseIdToken: async (): Promise<string | null> => {
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
