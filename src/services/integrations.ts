import { IntegrationStatus } from '../types';

export interface CredentialRequirement {
  id: string;
  name: string;
  envVar: string;
  description: string;
  isConfigured: boolean;
  requiredFor: string;
  setupInstructions: string;
}

export const getIntegrationStatus = (counts: { productsCount: number; ordersCount: number; usersCount: number }): IntegrationStatus => {
  const backendUrl = import.meta.env.VITE_API_URL || null;
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || null;
  const geminiKey = import.meta.env.GEMINI_API_KEY || null;

  return {
    backendConfigured: Boolean(backendUrl && backendUrl.trim().length > 0),
    backendUrl: backendUrl || null,
    stripeConfigured: Boolean(stripeKey && stripeKey.trim().length > 0 && !stripeKey.includes('PLACEHOLDER')),
    stripeKey: stripeKey ? `${stripeKey.substring(0, 7)}...` : null,
    geminiConfigured: Boolean(geminiKey && geminiKey.trim().length > 0 && !geminiKey.includes('MY_GEMINI_API_KEY')),
    databaseType: backendUrl ? 'remote_rest_api' : 'client_indexed_db',
    persistedRecords: counts,
  };
};

export const getCredentialRequirements = (): CredentialRequirement[] => {
  const backendUrl = import.meta.env.VITE_API_URL;
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  const geminiKey = import.meta.env.GEMINI_API_KEY;

  return [
    {
      id: 'db_backend',
      name: 'External Database & API Server',
      envVar: 'VITE_API_URL',
      description: 'URL of the remote REST / GraphQL backend server (e.g. Express, Cloud SQL, NestJS).',
      isConfigured: Boolean(backendUrl && backendUrl.trim().length > 0),
      requiredFor: 'Cross-device multi-tenant sync and centralized database persistence.',
      setupInstructions: 'Set VITE_API_URL="https://api.yourdomain.com" in your environment or hosting dashboard. Currently running in standalone persistent browser database mode with local ACID-compliant storage.',
    },
    {
      id: 'stripe_gateway',
      name: 'Stripe Payment Gateway',
      envVar: 'VITE_STRIPE_PUBLIC_KEY',
      description: 'Stripe Publishable Key (pk_live_... or pk_test_...) for processing live credit card transactions.',
      isConfigured: Boolean(stripeKey && stripeKey.trim().length > 0 && !stripeKey.includes('PLACEHOLDER')),
      requiredFor: 'Credit / Debit Card processing online.',
      setupInstructions: 'Obtain your publishable key from Stripe Dashboard -> Developers -> API Keys. Add VITE_STRIPE_PUBLIC_KEY="pk_test_..." to .env. Currently, orders can be placed securely via "Cash on Delivery" or "Direct Bank Wire" to avoid mock payment deception.',
    },
    {
      id: 'gemini_api',
      name: 'Gemini AI Assistant Engine',
      envVar: 'GEMINI_API_KEY',
      description: 'Google AI Studio API key for server-side product categorization and description generation.',
      isConfigured: Boolean(geminiKey && geminiKey.trim().length > 0 && !geminiKey.includes('MY_GEMINI_API_KEY')),
      requiredFor: 'Automated AI product description enhancement and catalog assistance.',
      setupInstructions: 'Obtain an API key from Google AI Studio and configure GEMINI_API_KEY in environment variables.',
    },
  ];
};
