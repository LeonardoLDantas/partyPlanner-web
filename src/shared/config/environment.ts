const localhostFallback = 'http://localhost:5112';
const productionFallback = 'https://partyplanner-backend-efxs.onrender.com';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

const configuredUrl = import.meta.env.VITE_API_URL;

export const environment = {
  apiBaseUrl: trimTrailingSlash(
    configuredUrl ?? (import.meta.env.DEV ? localhostFallback : productionFallback)
  )
};
 