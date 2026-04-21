import DeviceInfo from 'react-native-device-info';

export const getDeviceId = async () => {
  try {
    
    // Retorna um ID único do dispositivo
    const deviceId = await DeviceInfo.getUniqueId();

    return deviceId;
  } catch (error) {

    console.error('Error getting device ID:', error);

    return null;
  }
};