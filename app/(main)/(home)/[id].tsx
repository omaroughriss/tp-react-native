import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';

type Meal = {
    id: string;
    ingredients: any[];
    date: string;
};

export default function MealDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [meal, setMeal] = useState<Meal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMeal = async () => {
            try {
                const storedMeals = await AsyncStorage.getItem('meals');
                if (storedMeals) {
                    const mealsArray: Meal[] = JSON.parse(storedMeals);
                    const foundMeal = mealsArray.find((m) => m.id === id);
                    setMeal(foundMeal || null);
                }
            } catch (error) {
                console.error("Erreur lors du chargement du repas", error);
            } finally {
                setLoading(false);
            }
        };

        loadMeal();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#1a56ef" />
            </SafeAreaView>
        );
    }

    if (!meal) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Repas non trouvé</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerTitle}>
                    Repas du {new Date(meal.date).toLocaleDateString()}
                </Text>
                {meal.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientContainer}>
                        {ingredient.image ? (
                            <Image source={{ uri: ingredient.image }} style={styles.ingredientImage} />
                        ) : (
                            <View style={styles.noImage}>
                                <Text style={styles.noImageText}>No Image</Text>
                            </View>
                        )}
                        <View style={styles.ingredientInfo}>
                            <Text style={styles.ingredientLabel}>{ingredient.label}</Text>
                            <Text style={styles.ingredientCalories}>
                                Calories: {ingredient.nutrients?.ENERC_KCAL ?? 'N/A'} kcal
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a56ef',
        marginBottom: 16,
        textAlign: 'center',
    },
    ingredientContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    ingredientImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    noImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    noImageText: {
        fontSize: 10,
        color: '#555',
    },
    ingredientInfo: {
        flex: 1,
    },
    ingredientLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    ingredientCalories: {
        fontSize: 16,
        color: '#555',
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        color: 'red',
    },
});
