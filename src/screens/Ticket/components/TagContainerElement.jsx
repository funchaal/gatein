import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './TagContainerElement.styles';

export default function TagContainerElement({ data, props }) {
    const tags = props.tags || [];
    if (!tags.length) return null;
    const colorMap = {
        purple: { bg: '#7C3AED20', text: '#7C3AED' },
        blue:   { bg: '#3B82F620', text: '#3B82F6' },
        green:  { bg: '#10B98120', text: '#10B981' },
        yellow: { bg: '#EAB30820', text: '#EAB308' },
        red:    { bg: '#EF444420', text: '#EF4444' },
        gray:   { bg: '#64748B20', text: '#64748B' },
    };
    return (
        <View style={styles.tagContainer}>
            {props.label && <Text style={styles.tagContainerLabel}>{props.label}</Text>}
            <View style={styles.tagRow}>
                {tags.map((tag, i) => {
                    const c = colorMap[tag.color] || colorMap.gray;
                    return (
                        <View key={i} style={[styles.tag, { backgroundColor: c.bg }]}>
                            {tag.icon && <Icon name={tag.icon} size={15} color={c.text} style={{ marginRight: 4, flexShrink: 0 }} />}
                            <Text style={[styles.tagText, { color: c.text }]}>{tag.label ? tag.label.toUpperCase() : ''}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
