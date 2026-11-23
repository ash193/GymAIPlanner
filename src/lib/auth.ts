import { createInternalNeonAuth } from "@neondatabase/auth";

const auth = createInternalNeonAuth(import.meta.env.VITE_NEON_AUTH_URL);

// Preserve the existing authentication API
export const authClient = auth.adapter;

// Expose JWT retrieval separately
export const getAuthToken = () => auth.getJWTToken();
