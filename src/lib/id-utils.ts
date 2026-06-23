
export const generateUUID = (): string => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {
    // Ignore and fallback
  }
  
  // Fallback for older environments or non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const generateShortId = (prefix?: string): string => {
  const id = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}-${id}` : id;
};
