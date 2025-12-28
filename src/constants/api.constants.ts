import { environment } from '../environments/environment';

// Default to the local API server if no base URL is configured.
const DEFAULT_API_BASE = 'http://127.0.0.1:4000';
const trimmedBase = (environment.apiBaseUrl || DEFAULT_API_BASE).replace(/\/$/, '');

export const apiBaseUrl = trimmedBase;
export const stockDetailEndpoint = `${trimmedBase}/api/stocks`;
export const stockHistoryEndpoint = stockDetailEndpoint;
export const topPicksEndpoint = `${trimmedBase}/api/top-picks`;
export const stockListEndpoint = stockDetailEndpoint;
