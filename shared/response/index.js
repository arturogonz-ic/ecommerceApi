export const success = (data) => ({ success: true, data });
export const failure = (code, message) => ({ success: false, code, message });
