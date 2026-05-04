import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, FlatList, Modal, Pressable, Platform } from "react-native";
import { PanGestureHandler, State, GestureHandlerRootView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { THEME } from "../../../components/appointments/AppointmentCard/constants";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import SecondaryButton from "../../../components/ui/SecondaryButton";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BottomPickerModal({ visible, onClose, items, selectedValues, onApply, title }) {
    const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [localSelected, setLocalSelected] = useState([]);

    useEffect(() => {
        if (visible) {
            setLocalSelected([...selectedValues]);
            panY.setValue(SCREEN_HEIGHT);
            opacity.setValue(0);
            Animated.parallel([
                Animated.timing(panY, { toValue: 0, duration: 250, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(panY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onClose());
    };

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: panY } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event) => {
        const { state, translationY, velocityY } = event.nativeEvent;
        if (state === State.END || state === State.CANCELLED) {
            if (translationY > SCREEN_HEIGHT * 0.25 || (translationY > 50 && velocityY > 800)) {
                handleClose();
            } else {
                Animated.timing(panY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
            }
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={pickerStyles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
                        <Animated.View style={[pickerStyles.backdrop, { opacity }]} />
                    </Pressable>
                    <Animated.View style={[
                        pickerStyles.sheet,
                        { transform: [{ translateY: panY.interpolate({ inputRange: [0, SCREEN_HEIGHT], outputRange: [0, SCREEN_HEIGHT], extrapolate: "clamp" }) }] }
                    ]}>
                        <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
                            <Animated.View style={pickerStyles.handleArea}>
                                <View style={pickerStyles.handleContainer}>
                                    <View style={pickerStyles.handle} />
                                </View>
                                <Text style={pickerStyles.title}>{title}</Text>
                            </Animated.View>
                        </PanGestureHandler>
                        <FlatList
                            data={items}
                            keyExtractor={(item) => String(item)}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={pickerStyles.listContent}
                            renderItem={({ item }) => {
                                const isSelected = localSelected.includes(item);
                                return (
                                    <TouchableOpacity
                                        style={[pickerStyles.item, isSelected && pickerStyles.itemSelected]}
                                        onPress={() => {
                                            setLocalSelected((prev) =>
                                                prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                                            );
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[pickerStyles.itemText, isSelected && pickerStyles.itemTextSelected]}>
                                            {typeof item === "number" ? String(item) : item}
                                        </Text>
                                        {isSelected && <Icon name="check" size={17} color={THEME.slate900} />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        <View style={pickerStyles.footer}>
                            <View style={pickerStyles.footerBtnWrapper}>
                                <SecondaryButton title="Limpar" onPress={() => setLocalSelected([])} />
                            </View>
                            <View style={pickerStyles.footerBtnWrapper}>
                                <MainAsyncButton title="Aplicar" onPress={() => { onApply(localSelected); handleClose(); }} />
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const pickerStyles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end" },
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.32)" },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.65,
        paddingBottom: Platform.OS === "ios" ? 32 : 16,
    },
    handleArea: { backgroundColor: "white", paddingHorizontal: 20, zIndex: 10 },
    handleContainer: { alignItems: "center", paddingVertical: 12 },
    handle: { width: 36, height: 4, backgroundColor: "#E2E8F0", borderRadius: 2 },
    title: { fontSize: 13, fontWeight: "700", color: THEME.slate900, textTransform: "uppercase", letterSpacing: 0.6, paddingBottom: 10 },
    listContent: { paddingHorizontal: 12, paddingBottom: 8 },
    item: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 13, borderRadius: 10 },
    itemSelected: { backgroundColor: "#F8FAFC" },
    itemText: { fontSize: 15, color: THEME.slate600, fontWeight: "500" },
    itemTextSelected: { color: THEME.slate900, fontWeight: "700" },
    footer: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 16, gap: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
    footerBtnWrapper: { flex: 1 },
});
