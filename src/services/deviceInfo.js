import DeviceInfo from 'react-native-device-info';

// Cache em memória: o UniqueId é imutável durante a vida do app,
// não há necessidade de chamar a camada nativa a cada requisição.
let _cachedDeviceId = null;

export const getDeviceId = async () => {
  if (_cachedDeviceId) return _cachedDeviceId;
  try {
    _cachedDeviceId = await DeviceInfo.getUniqueId();
    return _cachedDeviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return null;
  }
};
