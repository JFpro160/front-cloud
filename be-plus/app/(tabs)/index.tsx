import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import {Image, View, Text, ActivityIndicator, Alert} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function HomeScreen() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    /*useEffect(() => {
    const handleDeleteToken = async () => {
        try {
            await SecureStore.deleteItemAsync('authToken');
            console.log('Auth token deleted from SecureStore');
            Alert.alert('Success', 'Auth token has been deleted.');
        } catch (error) {
            console.error('Error deleting token from SecureStore:', error);
            Alert.alert('Error', 'Failed to delete auth token.');
        }
    };
    handleDeleteToken();
    }, []);
*/
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

    // Return null until authentication state is determined
    if (isAuthenticated === null) {
        return null;
    }

    // If not authenticated, redirect to sign-in
    if (!isAuthenticated) {
        return <Redirect href="/sign-in" />;
    }else{
        // Render home screen only if authenticated
        return <HomeContent />;
    }
}

// Separate component for home content
function HomeContent() {
    return (
        <ParallaxScrollView
            headerBackgroundColor="#A1CEDC"
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    style={{ width: '100%', height: 250, resizeMode: 'contain' }}
                />
            }
        >
            <View style={{ padding: 16 }}>
                <Text>Welcome! Sergio</Text>
                <HelloWave />
            </View>
        </ParallaxScrollView>
    );
}