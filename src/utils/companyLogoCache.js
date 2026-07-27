/**
 * companyLogoCache.js
 *
 * Local cache for company profile pictures.
 *
 * Differences from announcementImageCache:
 *  - Keyed by {company_id} + {name_slug} so that a renamed company gets a fresh key.
 *  - Logos NOT present in the current payload are PRESERVED (not deleted) — they may
 *    belong to other payloads (search, nearby, etc.).
 *  - TTL: entries not accessed for more than MAX_AGE_DAYS are automatically evicted on
 *    every sync call to free up storage.
 *  - "last_accessed" timestamp is updated every time a cached logo is served.
 *
 * Storage layout (AsyncStorage):
 *   @company_logo_manifest            → JSON array of ManifestEntry objects
 *   @company_logo_img:{key}           → Base64 Data URI of the image
 *
 * ManifestEntry shape:
 *   { company_id, name, key, url, last_accessed }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const MANIFEST_KEY = '@company_logo_manifest';
const IMG_PREFIX   = '@company_logo_img:';
const MAX_AGE_DAYS = 30;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts a company name to a safe slug for use in storage keys.
 * Example: "Terminal Santos Brasil" → "terminal_santos_brasil"
 */
const slugify = (str) =>
  (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

/**
 * Builds the storage key for a company logo entry.
 */
const buildKey = (company_id, name) => `${company_id}__${slugify(name)}`;

/**
 * Downloads a remote image URL and converts it to a Base64 Data URI.
 * Returns null on any failure.
 */
const downloadAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        resolve(typeof result === 'string' && result.startsWith('data:image') ? result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/**
 * Returns whether a manifest entry has expired (not accessed in MAX_AGE_DAYS).
 */
const isExpired = (entry) => {
  if (!entry.last_accessed) return true;
  const lastAccessed = new Date(entry.last_accessed).getTime();
  const ageMs = Date.now() - lastAccessed;
  return ageMs > MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
};

// ─── Manifest helpers ─────────────────────────────────────────────────────────

const readManifest = async () => {
  try {
    const raw = await AsyncStorage.getItem(MANIFEST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeManifest = async (manifest) => {
  await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Synchronizes company logo URLs with local storage.
 *
 * For each company in the array:
 *   1. If the logo URL is absent or non-HTTP, skip.
 *   2. If a valid cached entry exists → update last_accessed, return local URI.
 *   3. If not cached → download, store, add to manifest.
 *
 * Additionally:
 *   - Expired entries (not accessed for MAX_AGE_DAYS) are removed during the call.
 *   - Companies NOT in the current payload are NOT removed — only expired ones are.
 *
 * @param {Array}  companies   Array of company objects (must have id, name, logo_url)
 * @returns {Promise<Array>}   Same array with logo_url replaced by local URI when cached.
 */
export const syncCompanyLogoCache = async (companies) => {
  if (!companies || !Array.isArray(companies) || companies.length === 0) {
    return companies;
  }

  try {
    // 1. Load current manifest
    let manifest = await readManifest();

    // 2. Evict expired entries
    const now = new Date().toISOString();
    const expired = manifest.filter(isExpired);
    if (expired.length > 0) {
      const expiredImgKeys = expired.map((e) => `${IMG_PREFIX}${e.key}`);
      await AsyncStorage.multiRemove(expiredImgKeys);
      manifest = manifest.filter((e) => !isExpired(e));
    }

    // 3. Build a lookup map from storage key → manifest entry
    const manifestMap = {};
    manifest.forEach((entry) => {
      manifestMap[entry.key] = entry;
    });

    // 4. Process each company
    const updatedEntries = [];       // entries to update last_accessed in manifest
    const newDownloads = [];         // { key, url, company_id, name } to download
    const resultMap = {};            // key → local Data URI

    for (const company of companies) {
      const url = company.logo_url;
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        // No downloadable URL — skip
        continue;
      }

      const key = buildKey(company.id, company.name);
      const existing = manifestMap[key];

      if (existing && existing.url === url) {
        // Already cached with the same URL — try to read from storage
        const imgKey = `${IMG_PREFIX}${key}`;
        const cached = await AsyncStorage.getItem(imgKey);
        if (cached) {
          resultMap[company.id] = cached;
          updatedEntries.push({ ...existing, last_accessed: now });
          continue;
        }
        // Storage entry missing despite manifest entry — fall through to re-download
      }

      // Need to download
      newDownloads.push({ key, url, company_id: String(company.id), name: company.name });
    }

    // 5. Download new logos in parallel
    if (newDownloads.length > 0) {
      const downloaded = await Promise.all(
        newDownloads.map(async (item) => {
          const data = await downloadAsBase64(item.url);
          return { ...item, data };
        })
      );

      const storePairs = [];
      for (const item of downloaded) {
        if (!item.data) continue;
        resultMap[item.company_id] = item.data;
        storePairs.push([`${IMG_PREFIX}${item.key}`, item.data]);
        updatedEntries.push({
          key: item.key,
          company_id: item.company_id,
          name: item.name,
          url: item.url,
          last_accessed: now,
        });
      }

      if (storePairs.length > 0) {
        await AsyncStorage.multiSet(storePairs);
      }
    }

    // 6. Rebuild and persist updated manifest
    //    Merge updated entries (new + refreshed) into manifest, preserving others
    const updatedByKey = {};
    updatedEntries.forEach((e) => { updatedByKey[e.key] = e; });

    const newManifest = [
      ...manifest.filter((e) => !updatedByKey[e.key]),
      ...Object.values(updatedByKey),
    ];
    await writeManifest(newManifest);

    // 7. Return companies with logo_url replaced by local URIs where available
    return companies.map((company) => {
      const localUri = resultMap[String(company.id)];
      return localUri ? { ...company, logo_url: localUri } : company;
    });

  } catch (error) {
    console.error('[CompanyLogoCache] Error syncing logo cache:', error);
    return companies;
  }
};

/**
 * Returns the cached local URI for a single company logo, or null if not cached.
 * Updates last_accessed if found.
 *
 * @param {string} company_id
 * @param {string} name
 * @returns {Promise<string|null>}
 */
export const getCachedCompanyLogo = async (company_id, name) => {
  if (!company_id) return null;
  try {
    const strId = String(company_id);

    // 1. Try exact key if name is present
    if (name) {
      const key = buildKey(company_id, name);
      const imgKey = `${IMG_PREFIX}${key}`;
      const cached = await AsyncStorage.getItem(imgKey);
      if (cached) {
        return cached;
      }
    }

    // 2. Fallback: Search manifest by company_id alone
    const manifest = await readManifest();
    const entry = manifest.find((e) => String(e.company_id) === strId);
    if (entry) {
      const imgKey = `${IMG_PREFIX}${entry.key}`;
      const cached = await AsyncStorage.getItem(imgKey);
      if (cached) {
        entry.last_accessed = new Date().toISOString();
        await writeManifest(manifest);
        return cached;
      }
    }

    return null;
  } catch {
    return null;
  }
};
