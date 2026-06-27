import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { get } from '../AppointmentCard/utils';
import { THEME } from '../AppointmentCard/constants';

const ALERT_COLORS = {
    purple: { bg: '#F3E8FF', border: '#F3E8FF', text: '#7C3AED', icon: '#7C3AED' },
    blue:   { bg: '#DBEAFE', border: '#DBEAFE', text: '#1D4ED8', icon: '#2563EB' },
    green:  { bg: '#D1FAE5', border: '#D1FAE5', text: '#059669', icon: '#10B981' },
    yellow: { bg: '#FEF3C7', border: '#FEF3C7', text: '#854D0E', icon: '#CA8A04' },
    red:    { bg: '#FEE2E2', border: '#FEE2E2', text: '#991B1B', icon: '#DC2626' },
    gray:   { bg: '#F3F4F6', border: '#F3F4F6', text: '#374151', icon: '#6B7280' },
    orange: { bg: '#FFEDD5', border: '#FFEDD5', text: '#9A3412', icon: '#EA580C' },
};

const ICON_MAP = {
    'alert-circle': 'alert-circle',
    'check-bold': 'check-bold',
    'check-circle': 'check-circle',
    'information': 'information',
    'information-circle': 'information',
    'hand-right': 'hand-front-right',
    'warning': 'alert',
};

export function Section({ data, props }) {
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{props.title}</Text>
            {(props.fields || []).map((fieldProp, idx) => (
                <Field key={idx} data={data} props={fieldProp} />
            ))}
        </View>
    );
}

export function Field({ data, props }) {
    const value = get(data, props.field);
    if (!value) return null;

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{props.label}</Text>
            <Text style={styles.fieldValue}>{value}</Text>
        </View>
    );
}

export function AlertComponent({ data, props }) {
    const value = (props.useField === false && props.message) ? props.message : (props.field ? get(data, props.field) : null);
    if (!value) return null;

    const colorScheme = ALERT_COLORS[props.color] || ALERT_COLORS.orange;
    const iconName = ICON_MAP[props.icon] || 'information';

    return (
        <View style={[styles.alertContainer, { backgroundColor: colorScheme.bg, borderColor: colorScheme.bg }]}>
            <View style={styles.alertContent}>
                {props.icon && (
                    <Icon name={iconName} size={20} color={colorScheme.icon || colorScheme.text} style={styles.alertIcon} />
                )}
                <View style={styles.alertTextContainer}>
                    {props.title && (
                        <Text style={[styles.alertTitle, { color: colorScheme.text }]}>
                            {props.title}
                        </Text>
                    )}
                    
                    <Text style={[styles.alertMessage, { color: colorScheme.text }]}>
                        {value}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export function QRCodeComponent({ data, props }) {
    const value = get(data, props.field);
    if (!value) return null;

    return (
        <View style={styles.qrcodeContainer}>
            {props.title && <Text style={styles.qrcodeTitle}>{props.title}</Text>}
            <View style={styles.qrcodeWrapper}>
                <QRCode
                    value={value}
                    size={200}
                    backgroundColor="white"
                    color={THEME.slate900}
                />
            </View>
            {props.caption && <Text style={styles.qrcodeCaption}>{props.caption}</Text>}
        </View>
    );
}

export const COMPONENT_MAP = {
    section: Section,
    field: Field,
    alert: AlertComponent,
    qrcode: QRCodeComponent,
};

const styles = StyleSheet.create({
    // Estilos para o componente Section
    sectionContainer: { 
        marginTop: 18,
        marginBottom: 8,
    },
    sectionTitle: { 
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate900,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },

    // Estilos para o componente Field
    fieldContainer: { 
        paddingVertical: 6,
        marginVertical: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fieldLabel: { 
        fontSize: 16, // font-size: 16px
        color: THEME.slate400, // color
        fontWeight: '500', // font-weight: 500
        marginBottom: 2, // margin-bottom: 2px
        textTransform: 'capitalize',
    },
    fieldValue: { 
        fontSize: 16, // font-size: 16px
        color: '#334155', // color
        fontWeight: '600', // font-weight: 600
    },

    // Estilos para o componente AlertComponent
    alertContainer: { 
        borderRadius: 12, // border-radius: 12px
        borderWidth: 1, // border-width: 1px
        padding: 14, // padding: 14px
        marginVertical: 12, // margin-vertical: 12px
    },
    alertContent: { 
        flexDirection: 'row', // display: flex; flex-direction: row;
        alignItems: 'flex-start', // align-items: flex-start;
    },
    alertIcon: { 
        marginRight: 10, // margin-right: 10px
        marginTop: 1, // margin-top: 1px
    },
    alertTextContainer: { 
        flex: 1, // flex: 1
    },
    alertTitle: { 
        fontSize: 14, // font-size: 14px
        fontWeight: '700', // font-weight: 700
        marginBottom: 3, // margin-bottom: 3px
        textTransform: 'capitalize',
    },
    alertMessage: { 
        fontSize: 14, // font-size: 14px
        fontWeight: '500', // font-weight: 500
        lineHeight: 18, // line-height: 18px
    },

    // Estilos para o componente QRCodeComponent
    qrcodeContainer: { 
        alignItems: 'center', // align-items: center;
        marginTop: 30, // margin-top: 30px
        paddingVertical: 12, // padding-top: 12px; padding-bottom: 12px;
    },
    qrcodeTitle: { 
        fontSize: 15, // font-size: 15px
        fontWeight: '700', // font-weight: 700
        color: THEME.slate900, // color
        marginTop: 16, // margin-top: 16px
        textTransform: 'uppercase',
    },
    qrcodeWrapper: { 
        padding: 20, // padding: 20px
        backgroundColor: THEME.white, // background-color
        borderRadius: 16, // border-radius: 16px
    },
    qrcodeCaption: { 
        fontSize: 13, // font-size: 13px
        color: THEME.slate600, // color
        marginTop: 12, // margin-top: 12px
        textAlign: 'center', // text-align: center;
        fontWeight: '500', // font-weight: 500
    },
});
