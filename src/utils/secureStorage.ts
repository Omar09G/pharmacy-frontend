import { Capacitor } from '@capacitor/core';

/**
 * Platform-aware secure storage abstraction.
 *
 * - **Web**: localStorage (HttpOnly cookies handle real auth; this is only for
 *   persisting non-sensitive UI state like user profile).
 * - **Native (Capacitor)**: Capacitor Preferences plugin which stores data in
 *   NSUserDefaults (iOS) / SharedPreferences (Android). For production-grade
 *   token security, add `@capacitor/secure-storage` (Keychain / Keystore).
 */

const isNative = Capacitor.isNativePlatform();

async function getPreferences(): Promise<
  | { get: (key: string) => Promise<{ value: string | null }>; set: (key: string, value: string) => Promise<void>; remove: (key: string) => Promise<void> }
  | null
> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    return Preferences;
  } catch {
    return null;
  }
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isNative) {
      const prefs = await getPreferences();
      if (prefs) {
        const result = await prefs.get(key);
        return result.value;
      }
    }
    return localStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isNative) {
      const prefs = await getPreferences();
      if (prefs) {
        await prefs.set(key, value);
        return;
      }
    }
    localStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (isNative) {
      const prefs = await getPreferences();
      if (prefs) {
        await prefs.remove(key);
        return;
      }
    }
    localStorage.removeItem(key);
  },
};
