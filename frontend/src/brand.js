/** Bundled defaults from frontend/public/ */
export const DEFAULT_LOGO_URL = '/default-logo.png';
export const DEFAULT_BACKGROUND_URL = '/default-background.png';

function trimUrl(url) {
  return typeof url === 'string' ? url.trim() : '';
}

export function resolveLogoUrl(logoUrl) {
  return trimUrl(logoUrl) || DEFAULT_LOGO_URL;
}

export function isCustomLogo(logoUrl) {
  return Boolean(trimUrl(logoUrl));
}

export function resolveBackgroundUrl(backgroundUrl) {
  return trimUrl(backgroundUrl) || DEFAULT_BACKGROUND_URL;
}

export function isCustomBackground(backgroundUrl) {
  return Boolean(trimUrl(backgroundUrl));
}
