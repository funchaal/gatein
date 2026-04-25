import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { getValue } from '../utils';

export function NewLayout({ item, config, status, statusBaseColor }) {
    const { header, sub_header, body_rows } = config.card_layout;

    // Header (título principal)
    const headerValue = header?.key ? getValue(item, header.key) : null;
    
    // Sub-header
    const subHeaderValue = sub_header?.key ? getValue(item, sub_header.key) : null;

    console.log('config ', config)
    console.log('item ', item)


    return (
        <>
            <View style={styles.mainRow}>
                <View style={styles.mainContent}>
                    {/* Header */}
                    {headerValue && (
                        <View>
                            {header.label && <Text style={styles.fieldLabel}>{header.label}</Text>}
                            <Text style={styles.h1Default}>{headerValue}</Text>
                        </View>
                    )}

                    {/* Sub-header */}
                    {subHeaderValue && (
                        <View style={{ marginTop: 4 }}>
                            {sub_header.label && <Text style={styles.fieldLabel}>{sub_header.label}</Text>}
                            <Text style={styles.h2Default}>{subHeaderValue}</Text>
                        </View>
                    )}
                </View>
                
                <View style={[styles.badge, { backgroundColor: statusBaseColor + '20' }]}>
                    <Text style={[styles.badgeText, { color: statusBaseColor }]}>{status}</Text>
                </View>
            </View>

            {/* Body rows */}
            {body_rows && body_rows.length > 0 && (
                <View style={styles.footerContainer}>
                    {body_rows.map((row, index) => {
                        const value = row.key ? getValue(item, row.key) : null;
                        if (!value) return null;

                        return (
                            <View key={`${row.key}-${index}`} style={styles.infoRow}>
                                {row.label && <Text style={styles.infoLabel}>{row.label}</Text>}
                                <Text style={styles.infoValue}>{value}</Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </>
    );
}
