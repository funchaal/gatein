import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncAnnouncementImageCache } from '../announcementImageCache';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    getItem: jest.fn(async (key) => store[key] || null),
    setItem: jest.fn(async (key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(async (key) => {
      delete store[key];
    }),
    multiGet: jest.fn(async (keys) => keys.map((key) => [key, store[key] || null])),
    multiSet: jest.fn(async (keyValuePairs) => {
      keyValuePairs.forEach(([k, v]) => {
        store[k] = String(v);
      });
    }),
    multiRemove: jest.fn(async (keys) => {
      keys.forEach((k) => delete store[k]);
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
    _getStore: () => store,
  };
});

describe('syncAnnouncementImageCache', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('returns empty array if input is empty or invalid', async () => {
    expect(await syncAnnouncementImageCache(null)).toEqual([]);
    expect(await syncAnnouncementImageCache([])).toEqual([]);
  });

  test('downloads new images and updates AsyncStorage manifest & cached items', async () => {
    const fakeImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // Mock fetch response for image download
    global.fetch.mockResolvedValue({
      ok: true,
      blob: async () => ({
        size: 100,
        type: 'image/png',
      }),
    });

    // Mock FileReader behavior
    originalFileReader = global.FileReader;
    class MockFileReader {
      readAsDataURL() {
        this.onloadend && this.onloadend();
      }
      get result() {
        return fakeImageData;
      }
    }
    global.FileReader = MockFileReader;

    const inputAnnouncements = [
      {
        id: 'ann-1',
        image_url: 'https://example.com/banner1.png',
        company_logo_url: 'https://example.com/logo1.png',
      },
    ];

    const result = await syncAnnouncementImageCache(inputAnnouncements);

    expect(result[0].image_url).toBe(fakeImageData);
    expect(result[0].company_logo_url).toBe(fakeImageData);
    expect(AsyncStorage.multiSet).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@announcement_cached_url_manifest',
      JSON.stringify(['https://example.com/banner1.png', 'https://example.com/logo1.png'])
    );
  });

  test('deletes orphaned cached images when server response no longer contains them', async () => {
    const oldManifest = ['https://example.com/old_banner.png', 'https://example.com/keep_logo.png'];
    const oldBannerKey = '@announcement_img:' + encodeURIComponent('https://example.com/old_banner.png');
    const keepLogoKey = '@announcement_img:' + encodeURIComponent('https://example.com/keep_logo.png');

    await AsyncStorage.setItem('@announcement_cached_url_manifest', JSON.stringify(oldManifest));
    await AsyncStorage.setItem(oldBannerKey, 'data:image/png;base64,oldData');
    await AsyncStorage.setItem(keepLogoKey, 'data:image/png;base64,keepData');

    const newAnnouncements = [
      {
        id: 'ann-2',
        company_logo_url: 'https://example.com/keep_logo.png',
      },
    ];

    const result = await syncAnnouncementImageCache(newAnnouncements);

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([oldBannerKey]);
    expect(await AsyncStorage.getItem(oldBannerKey)).toBeNull();
    expect(await AsyncStorage.getItem(keepLogoKey)).toBe('data:image/png;base64,keepData');
    expect(result[0].company_logo_url).toBe('data:image/png;base64,keepData');
  });
});
