import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    highlightBox: {
        borderRadius: 14,
        borderWidth: 1.5,
        padding: 16,
        alignItems: 'flex-start',
        flex: 1,
        minWidth: (width - 80) / 2,
        margin: 0,
    },
    highlightLabel: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
        opacity: 0.7,
    },
    highlightValue: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    highlightCaption: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 4,
        opacity: 0.7,
    },
});
