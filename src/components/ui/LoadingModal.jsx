import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Modal, Animated, Dimensions, ActivityIndicator } from "react-native";
import { COLORS } from "../../constants/colors";

const { height } = Dimensions.get('window');

const LoadingModal = ({ visible, text }) => {
    const panY = useRef(new Animated.Value(height)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    
    const [showModal, setShowModal] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.parallel([
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(panY, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                }),
            ]).start(() => {
                setShowModal(false);
            });
        }
    }, [visible]);

    if (!showModal) return null;

    return (
        <Modal transparent visible={showModal} animationType="none" statusBarTranslucent>
            <View style={modalStyles.overlay}>
                <Animated.View style={[modalStyles.backdrop, { opacity }]} />
                <Animated.View style={[
                    modalStyles.modalContainer,
                    { transform: [{ translateY: panY }] }
                ]}>
                    <View style={modalStyles.content}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={modalStyles.text}>{text || 'Carregando...'}</Text>
                    </View>
                    <View style={{ height: 20 }} /> 
                </Animated.View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 15
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.slate600 || '#475569',
    }
});

export default LoadingModal;
