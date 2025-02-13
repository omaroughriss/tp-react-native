import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

export const useSearchFoods = (query: string) => {
    const [searchFoods, setSearchFoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (query.length > 2) {
            setLoading(true);
            setError(null);

            const fetchFoods = async () => {
                try {
                    const response = await axios.get(
                        'https://api.edamam.com/api/food-database/v2/parser',
                        {
                            params: {
                                app_id: '197cf05d',
                                app_key: '0c14075566ad5d8900327a1403cb5c96',
                                ingr: query,
                            },
                        }
                    );
                    setSearchFoods(response.data.hints);
                } catch (err) {
                    setError("Erreur lors de la recherche des aliments");
                } finally {
                    setLoading(false);
                }
            };

            fetchFoods();
        } else {
            setSearchFoods([]);
        }
    }, [query]);

    return { searchFoods, loading, error };
};

export default function AddMealScreen() {
    const [query, setQuery] = useState('');
    const { searchFoods, loading, error } = useSearchFoods(query);
    const [selectedFoods, setSelectedFoods] = useState<any[]>([]);
    const router = useRouter();
    const { scannedFood } = useLocalSearchParams<{ scannedFood?: string }>();

    useEffect(() => {
        if (scannedFood) {
            try {
                const food = JSON.parse(scannedFood);
                setSelectedFoods((prev) => [...prev, food]);
            } catch (err) {
                console.error("Erreur lors du parsing du food scanné", err);
            }
        }
    }, [scannedFood]);

    const handleSelectFood = (food: any) => {
        setSelectedFoods((prev) => [...prev, food]);
    };

    const handleSaveMeal = async () => {
        const newMeal = {
            id: Date.now().toString(),
            ingredients: selectedFoods,
            date: new Date().toISOString(),
        };

        try {
            const storedMeals = await AsyncStorage.getItem('meals');
            let mealsArray = storedMeals ? JSON.parse(storedMeals) : [];
            mealsArray.push(newMeal);
            await AsyncStorage.setItem('meals', JSON.stringify(mealsArray));
            console.log("Repas enregistré :", newMeal);
            setSelectedFoods([]);
            setQuery('');
            router.replace('/(main)/(home)');
        } catch (e) {
            console.error("Erreur lors de la sauvegarde du repas", e);
        }
    };

    const renderFoodItem = ({ item }: { item: any }) => {
        const food = item.food;
        return (
            <TouchableOpacity style={styles.foodItem} onPress={() => handleSelectFood(food)}>
                {food.image ? (
                    <Image source={{ uri: food.image }} style={styles.foodImage} />
                ) : (
                    <View style={styles.noImage}>
                        <Text style={{ fontSize: 10 }}>No Image</Text>
                    </View>
                )}
                <Text style={styles.foodLabel}>{food.label}</Text>
            </TouchableOpacity>
        );
    };

    const ListHeader = useMemo(() => (
        <View style={styles.headerContent}>
            <TextInput
                style={styles.input}
                placeholder="Rechercher un aliment..."
                value={query}
                onChangeText={setQuery}
            />
            {loading && <ActivityIndicator size="large" color="#1a56ef" />}
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push('/(main)/(add)/camera')}
            >
                <Text style={styles.scanButtonText}>Scanner un Code Barres</Text>
            </TouchableOpacity>
            <View style={styles.selectedContainer}>
                <Text style={styles.subtitle}>Aliments sélectionnés :</Text>
                {selectedFoods.length === 0 ? (
                    <Text>Aucun aliment sélectionné</Text>
                ) : (
                    selectedFoods.map((food, index) => (
                        <Text key={index} style={styles.selectedItem}>{food.label}</Text>
                    ))
                )}
            </View>
        </View>
    ), [query, loading, error, selectedFoods, router]);

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <View style={styles.pageHeader}>
                <Text style={styles.pageHeaderTitle}>Ajouter un repas</Text>
            </View>
            <FlatList
                data={searchFoods}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderFoodItem}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
                        <Text style={styles.saveButtonText}>Valider le repas</Text>
                    </TouchableOpacity>
                }
                contentContainerStyle={styles.listContentContainer}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pageHeader: {
        paddingVertical: 20,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    pageHeaderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a56ef',
    },
    listContentContainer: {
        padding: 16,
    },
    headerContent: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    scanButton: {
        backgroundColor: '#1a56ef',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 16,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedContainer: {
        marginVertical: 16,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    selectedItem: {
        fontSize: 16,
        marginBottom: 4,
    },
    saveButton: {
        backgroundColor: '#1a56ef',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 32,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    foodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    foodImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 8,
    },
    noImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 8,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodLabel: {
        fontSize: 16,
    },
    error: {
        color: 'red',
        marginBottom: 16,
    },
});
