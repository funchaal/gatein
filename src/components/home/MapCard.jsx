import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

export default function MapCard() {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={() => navigation.navigate('Map')} style={styles.container}>
            <ImageBackground
                source={require('../../../assets/images/mapa.png')}
                style={styles.imageBackground}
                imageStyle={styles.image}
            >
                <LinearGradient
                    colors={['transparent', '#253355f0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    locations={[0.0, 0.65]}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <Text style={styles.text}>Abrir mapa</Text>
                        <Icon name="map-pin" size={20} color="white" />
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 45,
        borderRadius: 25,
        overflow: 'hidden',
        marginBottom: 25,
        marginHorizontal: 15,
        elevation: 1,
    },
    imageBackground: {
        flex: 1,
    },
    image: {
        borderRadius: 10,
    },
    gradient: {
        flex: 1,
        borderRadius: 10,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 15,
    },
});