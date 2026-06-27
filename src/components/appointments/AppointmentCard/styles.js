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

    // Linha do Cabeçalho (Data e ID)
    headerRow: {
        flexDirection: 'row', // display: flex; flex-direction: row;
        justifyContent: 'space-between', // justify-content: space-between;
        alignItems: 'center', // align-items: center;
        marginBottom: 10, // margin-bottom: 10px
    },
    dateText: {
        fontSize: 14, // font-size: 14px
        fontWeight: '700', // font-weight: 700
        color: THEME.slate600, // color: #475569
        letterSpacing: 0.2, // letter-spacing: 0.2px
    },
    idText: {
        fontSize: 14, // font-size: 14px
        fontWeight: '500', // font-weight: 500
        color: THEME.slate400, // color: #94A3B8
    },

    companyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
        marginLeft: 8,
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
        paddingHorizontal: 10, // padding-left: 10px; padding-right: 10px;
        paddingVertical: 4, // padding-top: 4px; padding-bottom: 4px;
        borderRadius: 8, // border-radius: 8px
        marginLeft: 12, // margin-left: 12px
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
        justifyContent: 'space-between',
        marginBottom: 8,
        marginTop: 4,
    },
    cardRouteCity: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        maxWidth: '40%',
    },
    cardRoutePathContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    cardRouteLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#cbd5e1',
    },
    cardRouteIcon: {
        marginHorizontal: 4,
    }
});
