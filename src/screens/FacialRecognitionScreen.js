import React, { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import FaceDetection from '@react-native-ml-kit/face-detection';
import FaceOvalMask from '../components/common/FaceOvalMask';

export default function FacialRecognitionScreen({ navigation }) {
  const cameraRef = useRef(null);
  const device = useCameraDevice('front');
  const [status, setStatus] = useState('Procurando rosto...');
  const [validFrames, setValidFrames] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const successRef = useRef(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    };
    requestCameraPermission();
  }, []);

  const detectFace = useCallback(async () => {
    if (isProcessingRef.current || successRef.current || !cameraRef.current) {
      return;
    }
    
    isProcessingRef.current = true;

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
      });
      
      const faces = await FaceDetection.detect(`file://${photo.path}`, {
        performanceMode: 'fast',
        landmarkMode: 'none',
        contourMode: 'none',
        classificationMode: 'all',
      });
      
      if (faces && faces.length > 0) {
        const face = faces[0];
        const smileProb = face.smilingProbability ?? 0;
        const leftEyeProb = face.leftEyeOpenProbability ?? 0;
        const rightEyeProb = face.rightEyeOpenProbability ?? 0;
        
        processFaceResult(smileProb, leftEyeProb, rightEyeProb);
      } else {
        setStatus('Procurando rosto...');
        setValidFrames(0);
      }
    } catch (error) {
      console.log('Erro na detecção:', error.message);
    } finally {
      isProcessingRef.current = false;
      
      // Schedule next detection if not successful
      if (!successRef.current) {
        setTimeout(detectFace, 700);
      }
    }
  }, []);

  const processFaceResult = useCallback((smileProb, leftEyeProb, rightEyeProb) => {
    if (successRef.current) return;

    const smile = Math.round(smileProb * 100);
    const eyes = Math.round(((leftEyeProb + rightEyeProb) / 2) * 100);

    console.log(`🙂 Sorriso: ${smile}% | 👀 Olhos: ${eyes}%`);

    if (smile >= 70 && eyes >= 60) {
      setValidFrames((prev) => {
        const newCount = prev + 1;
        setStatus(`Confirmando sorriso... ${newCount}/5`);
        
        if (newCount >= 5) {
          successRef.current = true;
          setStatus('✅ Sucesso!');
          
          setTimeout(() => {
            navigation.replace('CheckinSuccess');
          }, 500);
        }
        
        return newCount;
      });
    } else {
      setValidFrames(0);
      
      if (smile < 70) {
        setStatus(`Sorria mais 😊 (${smile}%)`);
      } else if (eyes < 60) {
        setStatus(`Abra bem os olhos 👀 (${eyes}%)`);
      }
    }
  }, [navigation]);

  useEffect(() => {
    if (hasPermission && device && !successRef.current) {
      // Start first detection
      const timer = setTimeout(() => {
        detectFace();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [hasPermission, device, detectFace]);

  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00FF00" />
        <Text style={styles.permissionText}>Solicitando permissão de câmera...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00FF00" />
        <Text style={styles.permissionText}>Inicializando câmera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!successRef.current}
        photo={true}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <FaceOvalMask />
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  statusContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
  },
  statusText: { 
    color: '#00FF00', 
    fontSize: 18, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
});