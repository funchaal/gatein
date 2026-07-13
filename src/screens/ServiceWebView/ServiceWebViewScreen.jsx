import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { secureStorage } from '../../services/secureStorage';
import { COLORS } from '../../constants/colors';

export default function ServiceWebViewScreen() {
    const route = useRoute();
    const { url, title, integrationToken } = route.params;
    const navigation = useNavigation();
    const [token, setToken] = useState(integrationToken || null);
    const [isLoadingToken, setIsLoadingToken] = useState(!integrationToken);

    useEffect(() => {
        if (title) {
            navigation.setOptions({ title });
        }

        if (!integrationToken) {
            const fetchToken = async () => {
                const storedToken = await secureStorage.getToken();
                setToken(storedToken);
                setIsLoadingToken(false);
            };
            fetchToken();
        }
    }, [title, navigation, integrationToken]);

    if (isLoadingToken) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const INJECTED_JAVASCRIPT = `
        (function() {
            window.localStorage.setItem('auth_token', '${token || ''}'); // Commonly used keys
        })();
        true;
    `;

    return (
        <View style={styles.container}>
            <WebView 
                source={{ uri: url }}
                injectedJavaScript={INJECTED_JAVASCRIPT}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />
                )}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                style={styles.webview}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -18,
        marginTop: -18,
    }
});