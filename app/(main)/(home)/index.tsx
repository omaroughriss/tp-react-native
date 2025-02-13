import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function MealListScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [meals, setMeals] = useState<
        Array<{
            id: string;
            ingredients: any[];
            date: string;
        }>
    >([]);

    useFocusEffect(
        useCallback(() => {
            const loadMeals = async () => {
                try {
                    const storedMeals = await AsyncStorage.getItem('meals');
                    if (storedMeals) {
                        setMeals(JSON.parse(storedMeals));
                    } else {
                        setMeals([]);
                    }
                } catch (e) {
                    console.error("Erreur lors du chargement des repas", e);
                }
            };
            loadMeals();
        }, [])
    );

    const deleteMeal = (id: string) => {
        Alert.alert(
            "Supprimer le repas",
            "Voulez-vous vraiment supprimer ce repas ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updatedMeals = meals.filter((meal) => meal.id !== id);
                            await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
                            setMeals(updatedMeals);
                        } catch (e) {
                            console.error("Erreur lors de la suppression du repas", e);
                        }
                    },
                },
            ]
        );
    };

    const renderMealItem = ({ item }: { item: typeof meals[0] }) => (
        <TouchableOpacity
            style={styles.mealItem}
            onLongPress={() => deleteMeal(item.id)}
            onPress={() => router.push(`/(home)/${item.id}`)}
        >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.ingredients.map((ingredient, index) => (
                    <Image
                        key={index}
                        source={{ uri: ingredient.image }}
                        style={styles.ingredientImage}
                    />
                ))}
            </ScrollView>
            <View style={styles.mealInfo}>
                <Text style={styles.mealName}>
                    Repas du {new Date(item.date).toLocaleDateString()}
                </Text>
                <Text>
                    {item.ingredients.length} ingrédient{item.ingredients.length > 1 ? 's' : ''}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <View style={styles.pageHeader}>
                <Text style={styles.pageHeaderTitle}>Liste des repas</Text>
            </View>
            <View style={styles.container}>
                <SignedIn>
                    <Text style={styles.welcomeText}>
                        Hello {user?.emailAddresses[0].emailAddress}
                    </Text>
                    <FlatList
                        data={meals}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMealItem}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Aucun repas enregistré</Text>
                            </View>
                        )}
                        contentContainerStyle={
                            meals.length === 0
                                ? { flex: 1, justifyContent: 'center', alignItems: 'center' }
                                : {}
                        }
                    />
                </SignedIn>
                <SignedOut>
                    <View style={styles.signedOutContainer}>
                        <Link href="/(auth)/login">
                            <Text style={styles.linkText}>Sign in</Text>
                        </Link>
                        <Link href="/(auth)/sign-up">
                            <Text style={styles.linkText}>Sign up</Text>
                        </Link>
                    </View>
                </SignedOut>
            </View>
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: 'bold',
        margin: 16,
    },
    mealItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    ingredientImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 8,
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#777',
    },
    signedOutContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        fontSize: 16,
        color: '#007AFF',
        marginVertical: 8,
    },
});
