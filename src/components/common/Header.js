
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Header() {
    return (
        <View style={styles.container}>
            <Image 
                source={require('../../../assets/images/logo.png')} 
                style={styles.logo}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 70,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    logo: {
        width: 150,
        height: 33.75,
        alignSelf: 'flex-start',
    },
});
