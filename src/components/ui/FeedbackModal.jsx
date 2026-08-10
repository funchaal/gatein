import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedbackModal({
  visible,
  onClose,
  type = 'success', // 'success' | 'error' | 'warning' | 'confirm'
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  buttonText = 'Entendido',
}) {
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      panY.setValue(SCREEN_HEIGHT);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      handleCloseAnimation();
    }
  }, [visible]);

  const handleCloseAnimation = (callback) => {
    Animated.parallel([
      Animated.timing(panY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      if (callback) callback();
      if (onClose) onClose();
    });
  };

  const handleClose = () => {
    handleCloseAnimation();
  };

  const handleConfirm = () => {
    handleCloseAnimation(() => {
      if (onConfirm) onConfirm();
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        if (event.nativeEvent.translationY < 0) panY.setValue(0);
      },
    }
  );

  const onHandlerStateChange = (event) => {
    const { state, translationY, velocityY } = event.nativeEvent;
    if (state === State.END || state === State.CANCELLED) {
      if (translationY > 100 || velocityY > 800) {
        handleClose();
      } else {
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }).start();
      }
    }
  };

  if (!modalVisible) return null;

  const isConfirm = type === 'confirm';

  const getIconConfig = () => {
    switch (type) {
      case 'error':
        return {
          name: 'alert-circle',
          color: '#EF4444',
          bgColor: '#FEE2E2',
        };
      case 'warning':
      case 'confirm':
        return {
          name: 'alert-outline',
          color: '#D97706',
          bgColor: '#FEF3C7',
        };
      case 'success':
      default:
        return {
          name: 'check-circle',
          color: '#10B981',
          bgColor: '#D1FAE5',
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity }]} />
        </Pressable>

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY: panY }],
              },
            ]}
          >
            <View style={styles.handle} />

            <View style={styles.content}>
              <View style={[styles.iconContainer, { backgroundColor: iconConfig.bgColor }]}>
                <Icon name={iconConfig.name} size={48} color={iconConfig.color} />
              </View>

              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              {isConfirm ? (
                <View style={styles.buttonRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.cancelButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleClose}
                >
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 8,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
