/**
 * Vercel Web Analytics Integration
 * This module initializes Vercel Web Analytics for the KW Studio website.
 */

import { inject } from './node_modules/@vercel/analytics/dist/index.mjs';

/**
 * Initialize Vercel Web Analytics
 * The inject function automatically tracks page views and sets up analytics.
 * 
 * Configuration:
 * - mode: 'auto' - automatically detects environment (production/development)
 * - debug: true - enables debug logging in development mode
 */
inject({
    mode: 'auto',
    debug: true
});

console.log('[Analytics] Vercel Web Analytics initialized successfully');
