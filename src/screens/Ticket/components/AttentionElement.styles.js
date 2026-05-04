import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    attentionBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        marginVertical: 12,
    },
    attentionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
    attentionText: { fontSize: 14, fontWeight: '500', lineHeight: 18 },
});
