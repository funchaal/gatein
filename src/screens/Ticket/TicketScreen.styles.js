import { StyleSheet } from 'react-native';
import { THEME } from '../../components/appointments/AppointmentCard/constants';

export const screenStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    pageHeader: {
        paddingBottom: 16,
        paddingTop: 8,
        alignItems: 'flex-start',
    },
    pageTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: THEME.slate600,
    },
    scroll: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingBottom: 16,
        paddingHorizontal: 24,
    },
    topInfoContainer: {
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: 'white',
    },
    bookingStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    bookingLabel: {
        fontSize: 13,
        color: THEME.slate400,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    bookingId: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate500,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderRadius: 12,
    },
    displayTime: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.slate600,
        marginLeft: 6,
    },
    heroSection: {
        alignItems: 'flex-start',
        paddingVertical: 20,
        paddingTop: 8,
        backgroundColor: 'white',
        gap: 2,
    },
    heroLabel: {
        fontSize: 16,
        color: THEME.slate400,
        width: 110,
        fontWeight: '500'
    },
    h1Default: {
        fontSize: 26,
        fontWeight: '800',
        color: THEME.slate900
    },
    h2Default: {
        fontSize: 20,
        fontWeight: '500',
        color: THEME.slate600
    },
    ticketBody: {
        paddingVertical: 8,
        backgroundColor: '#ffffff',
    },
    layoutRef: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 11,
        color: THEME.slate400,
        fontWeight: '500',
        letterSpacing: 0.4,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
        backgroundColor: '#ffffff',
    },
    emptyIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.slate900,
    },
    emptySubtitle: {
        fontSize: 14,
        color: THEME.slate400,
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingHorizontal: 24,
        paddingTop: 12,
    },
});

export const heroStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 24,
        gap: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
});

export const perfStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderTopWidth: 2,
        borderTopColor: '#d6d6d6ff',
        borderStyle: 'dashed',
    },
});
