import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const router = useRouter();
    const [scanned, setScanned] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (permission) {
            setIsLoading(false);
            if (!permission.granted && permission.canAskAgain) {
                requestPermission();
            }
        }
    }, [permission]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <Text>Chargement...</Text>
            </View>
        );
    }

    if (!permission?.granted) {
        return (
            <View style={styles.centered}>
                <Text>Permission pour accéder à la caméra non accordée.</Text>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        try {
            const response = await axios.get(
                'https://api.edamam.com/api/food-database/v2/parser',
                {
                    params: {
                        app_id: '197cf05d',
                        app_key: '0c14075566ad5d8900327a1403cb5c96',
                        upc: data,
                    },
                }
            );
            
            const foodInfo = response.data.hints[0]?.food;
            if (!foodInfo) {
                Alert.alert('Aucun résultat', 'Aucun aliment trouvé pour ce code-barres');
                setScanned(false);
                return;
            }

            router.push({
                pathname: '/(main)/(add)',
                params: { scannedFood: JSON.stringify(foodInfo) },
            });
        } catch (err) {
            console.error("Erreur lors de la récupération des infos de l'aliment", err);
            Alert.alert('Erreur', 'Impossible de récupérer les informations du produit');
            setScanned(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <CameraView
                style={{ flex: 1 }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            {scanned && (
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => setScanned(false)}
                >
                    <Text style={styles.buttonText}>Re-scanner</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    button: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: '#1a56ef',
        padding: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});