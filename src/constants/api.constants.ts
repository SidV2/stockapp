import { environment } from '../environments/environment';

const trimmedBase = (environment.apiBaseUrl ?? '').replace(/\/$/, '');

export const apiBaseUrl = trimmedBase;
export const stockDetailEndpoint = `${trimmedBase}/api/stocks`;
export const topPicksEndpoint = `${trimmedBase}/api/top-picks`;
export const stockListEndpoint = stockDetailEndpoint;
