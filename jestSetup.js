jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(true),
  isVisible: jest.fn().mockResolvedValue(false),
  useHideAnimation: jest.fn().mockReturnValue({ container: {}, logo: {} }),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn().mockResolvedValue('test-unique-id'),
}));

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return {
    WebView: View,
  };
});

jest.mock('react-native-sensors', () => ({
  magnetometer: { subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })) },
  accelerometer: { subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })) },
  SensorTypes: { magnetometer: 'magnetometer', accelerometer: 'accelerometer' },
  setUpdateIntervalForType: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
  check: jest.fn().mockResolvedValue('granted'),
  request: jest.fn().mockResolvedValue('granted'),
  PERMISSIONS: { ANDROID: {}, IOS: {} },
  RESULTS: { GRANTED: 'granted' },
}));

jest.mock('react-native-share', () => ({
  open: jest.fn().mockResolvedValue(true),
  shareSingle: jest.fn().mockResolvedValue(true),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn().mockResolvedValue('fake-uri'),
}));

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn().mockResolvedValue(false),
  setGenericPassword: jest.fn().mockResolvedValue(true),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  setRNConfiguration: jest.fn(),
  requestAuthorization: jest.fn(),
}));

jest.mock('@react-native-firebase/app', () => ({
  messaging: jest.fn(() => ({
    getToken: jest.fn().mockResolvedValue('test-token'),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    setBackgroundMessageHandler: jest.fn(),
  })),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getToken: jest.fn().mockResolvedValue('test-token'),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    setBackgroundMessageHandler: jest.fn(),
  })),
}));
