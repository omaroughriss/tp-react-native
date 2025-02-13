import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useUser, useClerk } from '@clerk/clerk-expo'

export default function Profile() {
    const { user } = useUser()
    const clerk = useClerk()

    const handleSignOut = async () => {
        try {
            await clerk.signOut()
        } catch (err) {
            console.error('Erreur lors de la déconnexion:', err)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profil</Text>
            <Text style={styles.email}>Email: {user?.emailAddresses[0].emailAddress}</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    email: {
        fontSize: 16,
        marginBottom: 20,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
})
