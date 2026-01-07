import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { magnetometer, accelerometer, SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';

export const useCompass = () => {
    const [heading, setHeading] = useState(0);
    const magnetometerData = useRef({ x: 0, y: 0, z: 0 });
    const accelerometerData = useRef({ x: 0, y: 0, z: 0 });
    const headingHistory = useRef([]);
    const smoothedHeading = useRef(null);

    // Função de suavização do heading
    const smoothHeading = (newHeading) => {
        const ALPHA = 0.25;
        const HISTORY_SIZE = 8;
        
        if (smoothedHeading.current === null) {
            smoothedHeading.current = newHeading;
            return newHeading;
        }
        
        headingHistory.current.push(newHeading);
        if (headingHistory.current.length > HISTORY_SIZE) {
            headingHistory.current.shift();
        }

        let current = smoothedHeading.current;
        let delta = newHeading - current;
        
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        
        current = current + ALPHA * delta;
        current = (current + 360) % 360;
        
        smoothedHeading.current = current;
        return current;
    };

    const calculateHeading = () => {
        const { x: mx, y: my, z: mz } = magnetometerData.current;
        const { x: ax, y: ay, z: az } = accelerometerData.current;
        
        const norm = Math.sqrt(ax * ax + ay * ay + az * az);
        if (norm === 0) return;
        
        const axNorm = ax / norm;
        const ayNorm = ay / norm;
        const azNorm = az / norm;
        
        const isFlat = Math.abs(azNorm) > 0.9; // Aumentado de 0.7 para 0.9 - só considera flat quando REALMENTE deitado
        
        let azimuth;
        
        if (isFlat) {
            azimuth = Math.atan2(mx, my) * (180 / Math.PI);
            azimuth = (azimuth + 360) % 360;
        } else {
            const pitch = Math.asin(axNorm);
            const roll = Math.asin(-ayNorm / Math.cos(pitch));
            
            const xh = mx * Math.cos(pitch) + mz * Math.sin(pitch);
            const yh = mx * Math.sin(roll) * Math.sin(pitch) + my * Math.cos(roll) - mz * Math.sin(roll) * Math.cos(pitch);
            
            azimuth = Math.atan2(yh, xh) * (180 / Math.PI);
            azimuth = (azimuth + 360) % 360;
        }
        
        if (Platform.OS === 'android') {
            azimuth = (360 - azimuth) % 360;
        }
        
        const smoothed = smoothHeading(azimuth);
        setHeading(smoothed);
    };

    useEffect(() => {
        let magnetometerSubscription;
        let accelerometerSubscription;

        setUpdateIntervalForType(SensorTypes.magnetometer, 16);
        setUpdateIntervalForType(SensorTypes.accelerometer, 16);

        magnetometerSubscription = magnetometer.subscribe(({ x, y, z }) => {
            magnetometerData.current = { x, y, z };
            calculateHeading();
        });

        accelerometerSubscription = accelerometer.subscribe(({ x, y, z }) => {
            accelerometerData.current = { x, y, z };
        });

        return () => {
            if (magnetometerSubscription) magnetometerSubscription.unsubscribe();
            if (accelerometerSubscription) accelerometerSubscription.unsubscribe();
        };
    }, []);

    return heading;
};