/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Service Manajemen Konfigurasi Carto Basemaps API Key
 */

export const DEFAULT_CARTO_KEY = 'cb1_50gp_1_4615d499a52f21816eccd120';
const STORAGE_CARTO_KEY = 'mbg_grobogan_carto_api_key';

export function getStoredCartoKey(): string {
  if (typeof window === 'undefined') return DEFAULT_CARTO_KEY;
  return (
    localStorage.getItem(STORAGE_CARTO_KEY) ||
    (import.meta as any).env?.VITE_CARTO_API_KEY ||
    DEFAULT_CARTO_KEY
  );
}

export function setStoredCartoKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (!key.trim()) {
      localStorage.removeItem(STORAGE_CARTO_KEY);
    } else {
      localStorage.setItem(STORAGE_CARTO_KEY, key.trim());
    }
  }
}
