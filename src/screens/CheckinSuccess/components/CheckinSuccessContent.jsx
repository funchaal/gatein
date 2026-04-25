import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../CheckinSuccess.styles';
import MainAsyncButton from '../../../components/common/MainAsyncButton';

export default function CheckinSuccessContent({ onShowModal }) {
    return (
        <View style={styles.container}>
            <Text style={styles.successText}>
                Checkin realizado com sucesso no terminal BTP.
            </Text>
            <View style={{ marginTop: 'auto', width: '100%', padding: 20 }}>
                <MainAsyncButton
                    title="OK"
                    onPress={async () => {
                        onShowModal();
                    }}
                />
            </View>
        </View>
    );
}