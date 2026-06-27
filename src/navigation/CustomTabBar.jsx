/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useEffect } from 'react';
import { View, Pressable, Text, StyleSheet, Animated, Keyboard, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import CheckinBar from '../components/ActionBar/CheckinBar';
import TicketBar from '../components/ActionBar/TicketBar';
import { selectIsDriverCheckedIn } from '../store/slices/activitySlice';
import { useActiveTerminal } from '../components/ActionBar/CheckinBar/useActiveTerminal';
import { Home, ClipboardList, User } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function TabButton({ route, isFocused, label, onPress, onLongPress, options }) {
    const scaleY = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        onPress();

        scaleY.setValue(1.0);
        Animated.sequence([
            Animated.timing(scaleY, {
                toValue: 0.8,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(scaleY, {
                toValue: 1.0,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const activeColor = '#F97316';
    const inactiveColor = 'gray';
    const tintColor = isFocused ? activeColor : inactiveColor;

    let IconComponent;
    if (route.name === 'Home') {
        IconComponent = Home;
    } else if (route.name === 'Atividade') {
        IconComponent = ClipboardList;
    } else if (route.name === 'Perfil') {
        IconComponent = User;
    } else {
        IconComponent = Home;
    }

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={handlePress}
            onLongPress={onLongPress}
            style={styles.tabButton}
        >
            <Animated.View style={[styles.tabIconContainer, { transform: [{ scaleY }] }]}>
                <IconComponent
                    size={24}
                    color={tintColor}
                    strokeWidth={isFocused ? 2.5 : 2}
                />
            </Animated.View>
            <Text style={[
                styles.tabLabel, 
                { color: tintColor }
            ]}>
                {label}
            </Text>
        </Pressable>
    );
}

export default function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    const isCheckedIn = useSelector(selectIsDriverCheckedIn);
    const activeTerminal = useActiveTerminal();
    
    const showActionBar = isCheckedIn || !!activeTerminal;
    const ACTION_BAR_HEIGHT = 75;

    // Animated values
    const tabBarTranslateY = useRef(new Animated.Value(300)).current;
    const actionBarHeight = useRef(new Animated.Value(showActionBar ? ACTION_BAR_HEIGHT : 0)).current;
    const actionBarTranslateY = useRef(new Animated.Value(showActionBar ? 0 : ACTION_BAR_HEIGHT)).current;

    // Slide up tab bar on mount
    useEffect(() => {
        Animated.spring(tabBarTranslateY, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, [tabBarTranslateY]);

    // Keyboard slide down / slide up
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, () => {
            Animated.timing(tabBarTranslateY, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });
        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            Animated.spring(tabBarTranslateY, {
                toValue: 0,
                tension: 45,
                friction: 9,
                useNativeDriver: true,
            }).start();
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [tabBarTranslateY]);

    // Action Bar height and slide transition (slides in from bottom)
    useEffect(() => {
        Animated.parallel([
            Animated.timing(actionBarHeight, {
                toValue: showActionBar ? ACTION_BAR_HEIGHT : 0,
                duration: 350,
                useNativeDriver: false,
            }),
            Animated.timing(actionBarTranslateY, {
                toValue: showActionBar ? 0 : ACTION_BAR_HEIGHT,
                duration: 350,
                useNativeDriver: true,
            })
        ]).start();
    }, [showActionBar, actionBarHeight, actionBarTranslateY, ACTION_BAR_HEIGHT]);

    return (
        <Animated.View style={[
            styles.container, 
            { 
                paddingBottom: insets.bottom,
                transform: [{ translateY: tabBarTranslateY }]
            }
        ]}>
            <Animated.View style={{ height: actionBarHeight, overflow: 'hidden' }}>
                <Animated.View style={{ 
                    transform: [{ translateY: actionBarTranslateY }], 
                    height: ACTION_BAR_HEIGHT,
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    backgroundColor: '#fff',
                    justifyContent: 'center'
                }}>
                    {isCheckedIn ? <TicketBar /> : <CheckinBar />}
                </Animated.View>
            </Animated.View>
            
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate({ name: route.name, merge: true });
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TabButton
                            key={route.key}
                            route={route}
                            isFocused={isFocused}
                            label={label}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            options={options}
                        />
                    );
                })}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    tabBar: {
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 0,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingTop: 8,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: 'bold',
    },
});
