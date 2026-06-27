import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { isPlaceholderUrl } from '../../utils/tools';

export default function ListItem({ onPress, title, titleStyle, subtitles = [], rightElement, logoUrl, leftElement, hideLeft }) {
    const [logoError, setLogoError] = useState(false);
    const initial = title ? title.charAt(0).toUpperCase() : '';

    // Reset error state if the URL changes (critical for FlatList recycling)
    useEffect(() => {
        setLogoError(false);
    }, [logoUrl]);

    const showSvg = logoUrl && !logoError && !isPlaceholderUrl(logoUrl);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            {!hideLeft && (
                leftElement ? (
                    <View style={styles.leftContainer}>
                        {leftElement}
                    </View>
                ) : (
                    <View style={styles.logoCircle}>
                        {showSvg ? (
                            <View style={styles.svgWrapper}>
                                <SvgUri
                                    width={32}
                                    height={32}
                                    uri={logoUrl}
                                    onError={() => setLogoError(true)}
                                />
                            </View>
                        ) : (
                            <Text style={styles.logoInitial}>{initial}</Text>
                        )}
                    </View>
                )
            )}

            <View style={styles.info}>
                <Text style={[styles.title, titleStyle]}>{title}</Text>
                {subtitles.map((sub, index) => {
                    if (!sub) return null;
                    if (typeof sub === 'string') {
                        return <Text key={index} style={styles.subtitle}>{sub}</Text>;
                    }
                    return (
                        <Text key={index} style={[styles.subtitle, sub.style]}>
                            {sub.text}
                        </Text>
                    );
                })}
            </View>
            {rightElement && (
                <View style={styles.rightContainer}>
                    {rightElement}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Aligned on top
        width: '100%',
    },
    logoCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        marginTop: 2, // Aligns logo with first line of title text
    },
    logoInitial: {
        fontSize: 18,
        fontWeight: '700',
        color: '#475569',
    },
    svgWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftContainer: {
        marginRight: 16,
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#666666',
        marginTop: 2,
    },
    rightContainer: {
        marginLeft: 12,
        justifyContent: 'center',
        alignSelf: 'center', // Keep right chevron vertically centered
    }
});