import { StyleSheet } from 'react-native';
import { THEME } from './constants';

export const styles = StyleSheet.create({
    // Estilos principais do Card
    card: {
        backgroundColor: THEME.white, // background-color: #ffffff
        borderRadius: 20, // border-radius: 20px
        padding: 16, // padding: 16px
        marginBottom: 12, // margin-bottom: 12px
        borderWidth: 1, // border-width: 1px
        borderColor: THEME.border, // border-color: #E2E8F0
    },
    cardPressed: {
        backgroundColor: '#F8FAFC', // background-color: #F8FAFC
        borderColor: '#CBD5E1', // border-color: #CBD5E1
    },

    safetyIntegrationTag: {
        backgroundColor: '#eff6ff', // blue-50
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#bfdbfe', // blue-200
        flexDirection: 'row',
    },
    safetyIntegrationText: {
        color: '#1d4ed8', // blue-700
        fontSize: 12,
        fontWeight: '600',
    },

    topTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statusAndRefRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dayTagText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    dateText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: 0.2,
    },
    idText: {
        fontSize: 14,
        fontWeight: '500',
        color: THEME.slate400,
    },

    countdownBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countdownBadgeWindow: {},
    countdownText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#c2410c', // orange-700
    },
    countdownTextWindow: {
        color: '#15803d', // green-700
    },

    companyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    companyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    companyLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    companyPlaceholderLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    companyPlaceholderText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#64748b',
    },
    companyNameText: {
        fontSize: 12, // reduzido levemente de 13px para 12px
        fontWeight: '500',
        color: '#64748b',
        flex: 1,
    },
    titlesRow: {
        marginBottom: 12,
        gap: 2,
    },
    
    // Tipografia da Linha Principal
    h1Default: {
        fontSize: 26, // font-size: 26px
        fontWeight: '800', // font-weight: 800
        color: THEME.slate900, // color: #0F172A
    },
    h2Default: {
        fontSize: 20, // font-size: 20px
        fontWeight: '500', // font-weight: 500
        color: THEME.slate600, // color: #475569
    },
    fieldLabel: {
        fontSize: 14, // font-size: 14px
        color: THEME.slate400, // color: #94A3B8
        fontWeight: '500', // font-weight: 500
        marginBottom: 2, // margin-bottom: 2px
    },

    // Badge de Status
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12, // font-size: 12px
        fontWeight: '700', // font-weight: 700
        textTransform: 'uppercase', // text-transform: uppercase
    },

    // Container do Footer (Linhas Adicionais)
    footerContainer: {
        borderTopWidth: 1, // border-top-width: 1px
        borderTopColor: '#F1F5F9', // border-top-color: #F1F5F9
        paddingTop: 12, // padding-top: 12px
        gap: 4, // gap: 4px
    },
    
    // Antigas Linhas de Info (se existirem)
    infoRow: {
        flexDirection: 'row', // display: flex; flex-direction: row;
        justifyContent: 'space-between', // justify-content: space-between;
        marginBottom: 2, // margin-bottom: 2px
    },
    infoLabel: {
        fontSize: 14, // font-size: 14px
        color: THEME.slate400, // color: #94A3B8
        fontWeight: '500', // font-weight: 500
    },
    infoValue: {
        fontSize: 14, // font-size: 14px
        color: THEME.slate900, // color: #0F172A
        fontWeight: '600' // font-weight: 600
    },
    tripCardAccent: {
        borderLeftWidth: 4,
        borderLeftColor: '#9778ff', // lightPurple
    },
    cardRouteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 4,
    },
    cardDestinationIcon: {
        marginRight: 6,
    },
    cardDestinationLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginRight: 2,
    },
    cardRouteCity: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        flex: 1,
    }
});
