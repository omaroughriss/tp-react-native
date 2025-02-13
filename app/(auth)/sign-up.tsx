import * as React from 'react'
import { Text, TextInput, Button, View, StyleSheet, SafeAreaView } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter, Link } from 'expo-router'

export const unstable_settings = {
    headerShown: false,
};

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')

    // Gestion de l'inscription
    const onSignUpPress = async () => {
        if (!isLoaded) return

        try {
            await signUp.create({
                emailAddress,
                password,
            })

            // Envoie le code de vérification par email
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Passe en mode vérification
            setPendingVerification(true)
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    // Gestion de la vérification du code
    const onVerifyPress = async () => {
        if (!isLoaded) return

        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                router.replace('/')
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    if (pendingVerification) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.header}>Vérifiez votre email</Text>
                <Text style={styles.subHeader}>
                    Un code de vérification a été envoyé à votre adresse email.
                </Text>
                <TextInput
                    style={styles.input}
                    value={code}
                    placeholder="Entrez le code"
                    onChangeText={setCode}
                    keyboardType="number-pad"
                />
                <View style={styles.buttonContainer}>
                    <Button title="Vérifier" onPress={onVerifyPress} color="#1a56ef" />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Créer un compte</Text>
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
                <Button title="Continuer" onPress={onSignUpPress} color="#1a56ef" />
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
                <Link href="/sign-in">
                    <Text style={styles.linkText}>Se connecter</Text>
                </Link>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a56ef',
        textAlign: 'center',
        marginBottom: 40,
    },
    subHeader: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
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
        marginTop: 20,
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
