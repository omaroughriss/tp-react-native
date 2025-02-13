import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, Button, View, StyleSheet } from 'react-native'
import React from 'react'

export const unstable_settings = {
    headerShown: false,
};

export default function Page() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')

    const onSignInPress = React.useCallback(async () => {
        if (!isLoaded) return

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace('/')
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }, [isLoaded, emailAddress, password])

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Se connecter</Text>
            <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Entrez votre email"
                onChangeText={setEmailAddress}
            />
            <TextInput
                style={styles.input}
                value={password}
                placeholder="Entrez votre mot de passe"
                secureTextEntry
                onChangeText={setPassword}
            />
            <View style={styles.buttonContainer}>
                <Button title="Se connecter" onPress={onSignInPress} color="#1a56ef" />
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Vous n'avez pas de compte ?</Text>
                <Link href="/sign-up">
                    <Text style={styles.linkText}>S'inscrire</Text>
                </Link>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a56ef',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    buttonContainer: {
        marginVertical: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#333',
    },
    linkText: {
        fontSize: 16,
        color: '#1a56ef',
        fontWeight: 'bold',
        marginLeft: 5,
    },
})
