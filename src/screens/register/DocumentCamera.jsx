import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';

export default function DocumentCamera({ navigation }) {
  const cameraRef = useRef(null);
  const device = useCameraDevice('back');

  const [hasPermission, setHasPermission] = useState(false);
  const [status, setStatus] = useState('Posicione o documento no retângulo');
  const [validFrames, setValidFrames] = useState(0);

  const processingRef = useRef(false);
  const successRef = useRef(false);

  // ===== PERMISSÃO =====
  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    })();
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
  'worklet';  // Marca como worklet

  const width = frame.width;
  const height = frame.height;

  // Suas heurísticas aqui (ex.: resolução, proporção)
  if (width < 1200 || height < 1200) {
    runOnJS(setStatus)('Aproxime o documento');
    runOnJS(setValidFrames)(0);
    return;
  }

  const ratio = width / height;
  if (ratio < 1.3 || ratio > 1.9) {
    runOnJS(setStatus)('Alinhe o documento');
    runOnJS(setValidFrames)(0);
    return;
  }

  // Incrementa validFrames
  runOnJS(setValidFrames)((prev) => prev + 1);
}, []);

  // ===== ANALISADOR PRINCIPAL =====
  const analyzeDocument = useCallback(async () => {
  if (
    processingRef.current ||
    successRef.current ||
    !cameraRef.current
  ) {
    return;
  }

  processingRef.current = true;

  try {
    const photo = await cameraRef.current.takePhoto({
      qualityPrioritization: 'speed',
      flash: 'off',
    });

    const { width, height } = photo;

    /**
     * HEURÍSTICAS
     */

    // 1️⃣ Resolução mínima (aproximação)
    if (width < 1200 || height < 1200) {
      setStatus('Aproxime o documento');
      setValidFrames(0);
      return;
    }

    // 2️⃣ Proporção (documentos tendem a ser retangulares)
    const ratio = width / height;
    if (ratio < 1.3 || ratio > 1.9) {
      setStatus('Alinhe o documento');
      setValidFrames(0);
      return;
    }

    // 3️⃣ Estabilidade (frames consecutivos válidos)
    setValidFrames((prev) => {
      const next = prev + 1;
      setStatus(`Confirmando enquadramento... ${next}/4`);

      if (next >= 4) {
        successRef.current = true;
        setStatus('✅ Documento capturado');

        captureFinalPhoto();
      }

      return next;
    });

  } catch (error) {
    console.log('Erro análise documento:', error.message);
  } finally {
    processingRef.current = false;

    if (!successRef.current) {
      setTimeout(analyzeDocument, 800);
    }
  }
}, []);


  // ===== FOTO FINAL (QUALIDADE) =====
  const captureFinalPhoto = async () => {
    try {
      const finalPhoto = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
      });

      navigation.navigate({
        name: 'LicenseScreen',
        params: {
          documentPhoto: {
            uri: `file://${finalPhoto.path}`,
            fileName: `documento_${Date.now()}.jpg`,
            type: 'image/jpeg',
          },
        },
        merge: true,
      });

      navigation.goBack();

    } catch (e) {
      console.log('Erro foto final:', e);
    }
  };

  // ===== INICIA LOOP =====
  useEffect(() => {
    if (hasPermission && device && !successRef.current) {
      const timer = setTimeout(analyzeDocument, 600);
      return () => clearTimeout(timer);
    }
  }, [hasPermission, device, analyzeDocument]);

  // ===== UI =====
  if (!hasPermission || !device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.text}>Inicializando câmera...</Text>
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
        frameProcessor={frameProcessor}
        frameProcessorFps={5}  // FPS baixo para evitar overhead
        photo
      />

      {/* OVERLAY */}
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <View style={styles.statusBox}>
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },

  text: {
    color: 'white',
    marginTop: 10,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  frame: {
    width: '85%',
    height: '45%',
    borderWidth: 3,
    borderColor: '#00FF00',
    borderRadius: 12,
  },

  statusBox: {
    position: 'absolute',
    top: 60,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
  },

  status: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
