import React, { useEffect, useState } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useUser } from '@clerk/clerk-expo';

type TabButton = {
    href: string;
    icon: React.ComponentProps<typeof AntDesign>['name'];
    label: string;
};

const tabButtons: TabButton[] = [
    {
        href: '/(main)/(home)',
        icon: 'home' as React.ComponentProps<typeof AntDesign>['name'],
        label: 'Home',
    },
    {
        href: '/(main)/(add)',
        icon: 'plus' as React.ComponentProps<typeof AntDesign>['name'],
        label: 'Add',
    },
    {
        href: '/(main)/profile',
        icon: 'user' as React.ComponentProps<typeof AntDesign>['name'],
        label: 'Profile',
    },
];

function CustomTabBar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {tabButtons.map((item, index) => {
                    const isFocused = pathname.startsWith(item.href);
                    return (
                        <View key={index} style={styles.buttonWrapper}>
                            <TouchableOpacity
                                style={[styles.button, isFocused && styles.buttonFocused]}
                                onPress={() => {
                                    if (!isFocused) {
                                        // Utiliser replace pour éviter d'empiler une nouvelle instance
                                        router.replace(item.href);
                                    }
                                }}
                            >
                                <AntDesign name={item.icon} size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.text}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

export default function MainLayout() {
    const { isSignedIn } = useUser();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isSignedIn) {
            router.replace('/(auth)/login');
        }
    }, [mounted, isSignedIn, router]);

    if (!isSignedIn) return null;

    return (
        <Tabs
            tabBar={() => <CustomTabBar />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen
                name="(home)"
                options={{
                    title: 'Home',
                    href: '/(main)/(home)',
                }}
            />
            <Tabs.Screen
                name="(add)"
                options={{
                    title: 'Add',
                    href: '/(main)/(add)',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    href: '/(main)/profile',
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#FFF',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    buttonWrapper: {
        alignItems: 'center',
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1a56ef',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    buttonFocused: {
        backgroundColor: '#005bb5',
    },
    text: {
        fontSize: 12,
        color: '#000',
        textAlign: 'center',
    },
});
