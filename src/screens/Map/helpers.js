export const getUpdateMapJsCode = (latitude, longitude, heading, isFollowingUser, accuracy = 10) => {
    return `
        if (window.updateMapState) {
            window.updateMapState(${latitude}, ${longitude}, ${heading}, ${isFollowingUser}, ${accuracy});
        }
    `;
};

export const getCenterMapJsCode = (latitude, longitude) => {
    return `
        if (window.map && !window.mapInitialized) {
            map.setView([${latitude}, ${longitude}], 17);
            window.mapInitialized = true;
        }
    `;
};

export const parseWebViewMessage = (data) => {
    if (data === 'USER_DRAGGED_MAP') {
        return { type: 'USER_DRAGGED_MAP' };
    }
    
    try {
        const parsed = JSON.parse(data);
        return parsed;
    } catch (e) {
        return null;
    }
};

export const getClearRouteJsCode = () => {
    return 'window.clearRoute();';
};