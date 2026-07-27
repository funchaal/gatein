import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CompanyLogo from './CompanyLogo';

export default function ListItem({ onPress, title, titleStyle, subtitles = [], rightElement, logoUrl, leftElement, hideLeft }) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            {!hideLeft && (
                leftElement ? (
                    <View style={styles.leftContainer}>
                        {leftElement}
                    </View>
                ) : (
                    <CompanyLogo
                        logoUrl={logoUrl}
                        name={title}
                        size={44}
                        style={styles.logoContainer}
                    />
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
    logoContainer: {
        marginRight: 14,
        marginTop: 2, // Aligns logo with first line of title text
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