import { Tabs, Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const colorScheme = 'light';

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const token = await SecureStore.getItemAsync('authToken');
                setIsAuthenticated(!!token);
            } catch (error) {
                console.error('Authentication check failed:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuthentication();
    }, []);

    // Return null while checking authentication
    if (isAuthenticated === null) {
        return null;
    }

    // Redirect to sign-in if not authenticated
    if (!isAuthenticated) {
        return <Redirect href="/sign-in" />;
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme].tint,
                tabBarInactiveTintColor: Colors[colorScheme].inactiveTint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                        height: 60,
                        backgroundColor: '#40B3A2',
                    },
                    default: {
                        height: 60,
                        backgroundColor: '#40B3A2',
                    },
                }),
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="activities"
                options={{
                    title: 'Activities',
                    tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
                }}
            />
            <Tabs.Screen
                name="rockie"
                options={{
                    title: 'Rockie',
                    tabBarIcon: ({ focused }) => (
                        <View style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: '#FFFFFF',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 30,
                            borderWidth: 3,
                            borderColor: focused ? Colors[colorScheme].tint : '#40B3A2',
                        }}>
                            <Image
                                source={require('@/assets/images/adaptive-icon.png')}
                                style={{
                                    width: 45,
                                    height: 45,
                                    borderRadius: 22.5,
                                }}
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="store"
                options={{
                    title: 'Store',
                    tabBarIcon: ({ color }) => <IconSymbol size={24} name="bag.fill" color={color} />,
                }}
            />
        </Tabs>
    );
}