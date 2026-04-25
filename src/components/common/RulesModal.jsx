import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions, Animated, ScrollView, TouchableOpacity } from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../../constants/colors';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.6;

const RulesModal = ({ visible, onClose, onAgree }) => {
    const panY = useRef(new Animated.Value(height)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: panY } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationY, velocityY } = event.nativeEvent;

            if (translationY > MODAL_HEIGHT * 0.4 || velocityY > 800) {
                handleClose();
            } else {
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150
                }).start();
            }
        }
    };

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(panY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 150 }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            panY.setValue(height);
            opacity.setValue(0);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(panY, { toValue: height, duration: 250, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            onClose();
        });
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
                        <Animated.View style={[styles.backdrop, { opacity }]} />
                    </Pressable>

                    <PanGestureHandler
                        onGestureEvent={onGestureEvent}
                        onHandlerStateChange={onHandlerStateChange}
                    >
                        <Animated.View style={[
                            styles.modalContainer,
                            {
                                transform: [{
                                    translateY: panY.interpolate({
                                        inputRange: [-200, 0, height],
                                        outputRange: [-50, 0, height],
                                        extrapolate: 'clamp'
                                    })
                                }]
                            }
                        ]}>
                            <View style={styles.handleContainer}>
                                <View style={styles.handle} />
                            </View>

                            <Text style={styles.modalTitle}>Regras do Terminal</Text>
                            <ScrollView contentContainerStyle={styles.content}>
                                <Text style={styles.modalText}>- Regra 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                                <Text style={styles.modalText}>- Regra 2: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                                <Text style={styles.modalText}>- Regra 3: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</Text>
                                <Text style={styles.modalText}>- Regra 4: Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</Text>
                                <Text style={styles.modalText}>- Regra 5: Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
                            </ScrollView>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={onAgree}
                            >
                                <Text style={styles.buttonText}>Li e concordo em prosseguir</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </PanGestureHandler>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        height: MODAL_HEIGHT,
        backgroundColor: '#ffffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        paddingHorizontal: 24,
        paddingBottom: 40
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: 'white',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 25,
        textAlign: 'center',
        color: COLORS.primary
    },
    content: {
        paddingBottom: 20,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'left',
        fontSize: 16,
        lineHeight: 24,
        color: COLORS.primaryDark
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 15,
        elevation: 2,
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default RulesModal;