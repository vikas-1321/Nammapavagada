// Persistent storage utility with memory fallback for React Native
let memoryStorage: Record<string, string> = {};

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof globalThis !== 'undefined' && (globalThis as any).sessionStorage) {
        const val = (globalThis as any).sessionStorage.getItem(key);
        if (val) return val;
      }
    } catch {
      // ignore
    }
    return memoryStorage[key] || null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof globalThis !== 'undefined' && (globalThis as any).sessionStorage) {
        (globalThis as any).sessionStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
    memoryStorage[key] = value;
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof globalThis !== 'undefined' && (globalThis as any).sessionStorage) {
        (globalThis as any).sessionStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    delete memoryStorage[key];
  },

  clear: async (): Promise<void> => {
    try {
      if (typeof globalThis !== 'undefined' && (globalThis as any).sessionStorage) {
        (globalThis as any).sessionStorage.clear();
      }
    } catch {
      // ignore
    }
    memoryStorage = {};
  },
};
