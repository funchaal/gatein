import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { clearActiveChannel, selectActiveChannelInfo, fetchChatData } from '../../store/slices/chatSlice';

import ChatList from './ChatList';
import ChatRoom from './ChatRoom';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.92; // 🔥 Modal mais alto

export default function ChatModal({ visible, onClose }) {
  const dispatch = useDispatch();
  const activeChannel = useSelector(selectActiveChannelInfo);

  const [isModalVisible, setIsModalVisible] = useState(visible);
  const pan = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  const status = useSelector((state) => state.chat.status);

  // --- A CORREÇÃO MÁGICA ---
  useEffect(() => {
    // Se ainda não carregou ou está ocioso, busca os dados
    if (status === 'idle') {
        // Passe o ID do usuário real aqui se tiver, ou string fixa para teste
        dispatch(fetchChatData('driver_me')); 
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      Animated.parallel([
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 150,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleCloseAnimation();
    }
  }, [visible]);

  const handleCloseAnimation = () => {
    Animated.parallel([
      Animated.timing(pan, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
      onClose();
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: pan } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
        const { translationY, velocityY } = event.nativeEvent;
        
        if (translationY > MODAL_HEIGHT * 0.4 || velocityY > 800) {
            handleCloseAnimation();
        } else {
            Animated.spring(pan, {
                toValue: 0,
                useNativeDriver: true,
                damping: 22,
                stiffness: 150
            }).start();
        }
    }
  };

  return (
    <Modal transparent visible={isModalVisible} animationType="none">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseAnimation}>
            <Animated.View style={[styles.backdrop, { opacity: backgroundOpacity }]} />
          </Pressable>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View
                style={[
                  styles.modalView,
                  {
                    transform: [{
                      translateY: pan.interpolate({
                        inputRange: [-200, 0, MODAL_HEIGHT],
                        outputRange: [-50, 0, MODAL_HEIGHT],
                        extrapolate: 'clamp'
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.dragArea}>
                  <View style={styles.dragHandle} />
                </View>

                <View style={styles.contentContainer}>
                  {activeChannel ? (
                    <ChatRoom onBack={() => dispatch(clearActiveChannel())} />
                  ) : (
                    <ChatList onClose={handleCloseAnimation} />
                  )}
                </View>
              </Animated.View>
            </PanGestureHandler>
          </KeyboardAvoidingView>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'black',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalView: {
        height: MODAL_HEIGHT,
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    dragArea: {
        width: '100%',
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#CBD5E1',
        borderRadius: 3,
    },
    contentContainer: {
        flex: 1,
    }
});