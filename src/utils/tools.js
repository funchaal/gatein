

export const capitalize = (text) => {
  return text
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const handleRegistrationStep = (navigation, register_step, params = {}) => {
    switch (register_step) {
        case 'registered':
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login', params: { tax_id: params.tax_id }} ],
            });
            break;
        case 'driver_license':
            navigation.reset({
                index: 0,
                routes: [{ name: 'DriverLicenseNumber' } ],
            });
            break;
        case 'driver_license_pending_validation':
            navigation.reset({
                index: 0,
                routes: [{ name: 'DriverLicensePendingValidation' } ],
            });
            break;
        default:
            navigation.navigate('Name');
            break;
    }
};

