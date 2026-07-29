import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { selectAllTerminals } from '../../store/slices/companiesSlice';
import { useCompleteSafetyIntegrationMutation } from '../../services/api';
import { THEME } from '../../components/appointments/AppointmentCard/constants';

export default function SafetyIntegrationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { terminal_id } = route.params || {};

    const terminals = useSelector(selectAllTerminals);
    const terminal = terminals[terminal_id];
    const config = terminal?.config || {};
    const videoUrl = config.safety_integration_video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    const formUrl = config.safety_integration_form_url;

    const [completeIntegration, { isLoading }] = useCompleteSafetyIntegrationMutation();
    const [progress, setProgress] = useState(0); // 0 to 100
    const [canContinue, setCanContinue] = useState(false);

    // Simulate video watching progress (10 seconds for demo)
    useEffect(() => {
        let interval;
        if (progress < 100) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setCanContinue(true);
                        return 100;
                    }
                    return prev + 10; // increase by 10% every second (10s total)
                });
            }, 1000);
        } else {
            setCanContinue(true);
        }
        return () => clearInterval(interval);
    }, [progress]);

    const handleContinue = async () => {
        if (!canContinue || isLoading) return;
        try {
            await completeIntegration(terminal_id).unwrap();
            Alert.alert("Sucesso", "Integração concluída com sucesso!", [
                {
                    text: "OK", onPress: () => {
                        navigation.goBack();
                    }
                }
            ]);
        } catch (error) {
            Alert.alert("Erro", "Falha ao registrar integração. Tente novamente.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={THEME.slate700} />
                </Pressable>
                <Text style={styles.headerTitle}>Integração de Segurança</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.videoContainer}>
                <WebView
                    source={{ uri: videoUrl }}
                    style={{ flex: 1 }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback={true}
                />
            </View>

            <View style={styles.footer}>
                {!canContinue && (
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                )}
                
                <Pressable
                    style={[styles.button, !canContinue ? styles.buttonDisabled : styles.buttonEnabled]}
                    onPress={handleContinue}
                    disabled={!canContinue || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[styles.buttonText, !canContinue && styles.buttonTextDisabled]}>
                            {!canContinue ? 'Assista o vídeo até o final' : 'Integração concluída - Continuar'}
                        </Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.slate900,
    },
    videoContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    footer: {
        padding: 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    progressContainer: {
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#1d4ed8', // blue-700
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    buttonEnabled: {
        backgroundColor: '#1d4ed8',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    buttonTextDisabled: {
        color: '#94a3b8',
    },
});
