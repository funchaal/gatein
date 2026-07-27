import AsyncStorage from '@react-native-async-storage/async-storage';

const MANIFEST_KEY = '@announcement_cached_url_manifest';
const KEY_PREFIX = '@announcement_img:';

/**
 * Safely encodes a URL into an AsyncStorage key.
 */
const getStorageKey = (url) => `${KEY_PREFIX}${encodeURIComponent(url)}`;

/**
 * Downloads an image URL and converts it to a base64 Data URI.
 * Returns null if download fails.
 */
const downloadAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string' && reader.result.startsWith('data:image')) {
          resolve(reader.result);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`[AnnouncementImageCache] Failed to download image ${url}:`, error);
    return null;
  }
};

/**
 * Synchronizes announcement image URLs with local storage.
 * 
 * 1. Collects all image URLs (`image_url` and `company_logo_url`).
 * 2. Compares with previously stored manifest in AsyncStorage.
 * 3. Deletes any cached images whose URLs are no longer in the new server response.
 * 4. Loads existing cached images or downloads new ones.
 * 5. Saves new images and updates the manifest in AsyncStorage.
 * 6. Returns a mapped copy of announcements with local image URIs.
 * 
 * @param {Array} announcements List of raw announcement objects from server
 * @returns {Promise<Array>} List of announcements with image URLs replaced by local URIs where available.
 */
export const syncAnnouncementImageCache = async (announcements) => {
  if (!announcements || !Array.isArray(announcements) || announcements.length === 0) {
    return [];
  }

  try {
    // 1. Extract all non-empty HTTP/HTTPS image URLs
    const currentUrls = new Set();
    announcements.forEach((ann) => {
      if (ann.image_url && (ann.image_url.startsWith('http://') || ann.image_url.startsWith('https://'))) {
        currentUrls.add(ann.image_url);
      }
      if (ann.company_logo_url && (ann.company_logo_url.startsWith('http://') || ann.company_logo_url.startsWith('https://'))) {
        currentUrls.add(ann.company_logo_url);
      }
    });

    const currentUrlList = Array.from(currentUrls);

    // 2. Retrieve previously stored manifest
    const manifestJson = await AsyncStorage.getItem(MANIFEST_KEY);
    let storedManifest = [];
    if (manifestJson) {
      try {
        storedManifest = JSON.parse(manifestJson);
      } catch (e) {
        storedManifest = [];
      }
    }

    // 3. Identify and delete orphaned cached images (URLs stored before but missing from new response)
    const orphanedUrls = storedManifest.filter((url) => !currentUrls.has(url));
    if (orphanedUrls.length > 0) {
      const keysToRemove = orphanedUrls.map(getStorageKey);
      await AsyncStorage.multiRemove(keysToRemove);
    }

    // 4. Batch query existing cached images from AsyncStorage
    const storageKeys = currentUrlList.map(getStorageKey);
    const cachedPairs = await AsyncStorage.multiGet(storageKeys);
    
    // Map URL -> Base64 URI
    const urlToDataMap = {};
    const urlsToDownload = [];

    cachedPairs.forEach(([key, val], index) => {
      const originalUrl = currentUrlList[index];
      if (val) {
        urlToDataMap[originalUrl] = val;
      } else {
        urlsToDownload.push(originalUrl);
      }
    });

    // 5. Download any new URLs that are not yet cached
    if (urlsToDownload.length > 0) {
      const newItemsToStore = [];

      await Promise.all(
        urlsToDownload.map(async (url) => {
          const base64Data = await downloadAsBase64(url);
          if (base64Data) {
            urlToDataMap[url] = base64Data;
            newItemsToStore.push([getStorageKey(url), base64Data]);
          }
        })
      );

      if (newItemsToStore.length > 0) {
        await AsyncStorage.multiSet(newItemsToStore);
      }
    }

    // 6. Save updated manifest to AsyncStorage (only storing URLs that exist or were successfully cached/retained)
    const activeStoredUrls = currentUrlList.filter((url) => !!urlToDataMap[url]);
    await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(activeStoredUrls));

    // 7. Map raw announcements to replace image_url and company_logo_url with local cached URIs
    return announcements.map((ann) => ({
      ...ann,
      image_url: urlToDataMap[ann.image_url] || ann.image_url,
      company_logo_url: urlToDataMap[ann.company_logo_url] || ann.company_logo_url,
    }));
  } catch (error) {
    console.error('[AnnouncementImageCache] Error syncing image cache:', error);
    return announcements;
  }
};
