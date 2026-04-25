import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { get } from '../utils';
import { THEME } from '../constants';

export function OldLayout({ item, config, status, statusBaseColor }) {
    const renderField = (fieldConfig, defaultStyle) => {
        if (!fieldConfig || !fieldConfig.key) return null;

        const value = get(item, fieldConfig.key);
        if (value === null || value === undefined) return null;

        const textStyle = {
            ...defaultStyle,
            fontSize: parseInt(fieldConfig.style?.fontSize || defaultStyle.fontSize || 16, 10),
            fontWeight: fieldConfig.style?.fontWeight || defaultStyle.fontWeight || 'normal',
            color: fieldConfig.style?.color || defaultStyle.color || THEME.slate900,
        };

        return (
            <View 
                key={fieldConfig.key} 
                style={{ 
                    alignItems: fieldConfig.position === 'above' ? 'flex-start' : 'baseline', 
                    flexDirection: fieldConfig.position === 'inline' ? 'row' : 'column', 
                    gap: fieldConfig.position === 'inline' ? 4 : 0 
                }}
            >
                {fieldConfig.showLabel && <Text style={[styles.infoLabel, { width: 'auto' }]}>{fieldConfig.label}</Text>}
                <Text style={textStyle}>{value}</Text>
            </View>
        );
    };

    return (
        <>
            <View style={styles.mainRow}>
                <View style={styles.mainContent}>
                    {/* Renderiza H1 e H2 a partir da estrutura antiga */}
                    {config?.main?.h1 && renderField(config.main.h1, styles.h1Default)}
                    {config?.main?.h2 && renderField(config.main.h2, styles.h2Default)}
                </View>
                
                <View style={[styles.badge, { backgroundColor: statusBaseColor + '20' }]}>
                    <Text style={[styles.badgeText, { color: statusBaseColor }]}>{status}</Text>
                </View>
            </View>

            {/* Renderiza os detalhes do card a partir de `main.details` */}
            {config?.main?.details && config.main.details.length > 0 && (
                <View style={styles.footerContainer}>
                    {config.main.details.map(detailConfig => renderField(detailConfig, styles.infoValue))}
                </View>
            )}
        </>
    );
}
