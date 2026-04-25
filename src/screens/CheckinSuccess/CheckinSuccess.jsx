import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RulesModal from '../../components/common/RulesModal';

import CheckinSuccessContent from './components/CheckinSuccessContent';
import { handleAgreeAction } from './helpers';
import { styles } from './CheckinSuccess.styles';

export default function CheckinSuccessScreen() {
    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <CheckinSuccessContent onShowModal={() => setModalVisible(true)} />
            
            <RulesModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onAgree={() => handleAgreeAction(navigation, setModalVisible)}
            />
        </SafeAreaView>
    );
}