import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, serverUrl, token, functionsVersion } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID ?? appId,
  serverUrl: import.meta.env.VITE_BASE44_APP_BASE_URL ?? serverUrl,
  appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL ?? serverUrl,
  token,
  functionsVersion,
  requiresAuth: false
});