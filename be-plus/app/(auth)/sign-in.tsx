import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignInScreen() {
    const router = useRouter();
    const [tenantId, setTenantId] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSignIn = async () => {
        if (!tenantId) {
            console.error('Validation Error: No tenant ID selected'); // Debugging
            Alert.alert('Error', 'Please select your academic institution');
            return;
        }

        console.log('Sign In Attempt - Data Sent:', { tenant_id: tenantId, student_email: email, password }); // Debugging

        try {
            const response = await fetch('https://jeh8169y9c.execute-api.us-east-1.amazonaws.com/dev/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenant_id: tenantId,
                    student_email: email,
                    password: password,
                }), // Enviar los datos como JSON string
            });

            console.log('API Response Status:', response.status); // Debugging response status

            const data = await response.json();
            console.log('API Response Body:', data); // Debugging response body

            if (response.ok) {
                const token = data.body?.token;
                console.log('Sign In Successful, Token:', token); // Debugging token

                if (token) {
                    await SecureStore.setItemAsync('authToken', String(token));
                    router.replace('/(tabs)');
                } else {
                    Alert.alert('Error', 'No token received');
                    console.error('Error: No token in API response'); // Debugging
                    console.error(data);
                }
            } else {
                Alert.alert('Error', data.message || 'Invalid credentials');
                console.error('API Error:', data.message || 'Unknown error'); // Debugging
            }
        } catch (error) {
            console.error('Network or unexpected error:', error); // Debugging network errors
            Alert.alert('Error', 'Connection error. Please try again.');
        }
    };

    return (
        <LinearGradient
            colors={['#1A374D', '#406882']}
            style={{ flex: 1 }}
        >
            <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 }}>
                {/* Logo y Mensaje */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <Image
                        source={require('@/assets/images/adaptive-icon.png')}
                        style={{ width: 112, height: 112, marginBottom: 16 }}
                        resizeMode="contain"
                    />
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
                        Welcome Back!
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                        Sign in to continue to your account
                    </Text>
                </View>

                {/* Formulario */}
                <View
                    style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 16,
                        padding: 24,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 4,
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                        Select Your Institution
                    </Text>
                    <View
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            borderWidth: 1,
                            borderRadius: 8,
                            marginBottom: 16,
                        }}
                    >
                        <Picker
                            selectedValue={tenantId}
                            onValueChange={(itemValue) => setTenantId(itemValue)}
                            style={{ color: 'white' }}
                            dropdownIconColor="white"
                        >
                            <Picker.Item label="Select institution" value="" color="#7ABDDD" />
                            <Picker.Item label="UTEC" value="UTEC" color="#7ABDDD" />
                            <Picker.Item label="PUCP" value="PUCP" color="#7ABDDD" />
                            <Picker.Item label="UPAO" value="UPAO" color="#7ABDDD" />
                            <Picker.Item label="UPC" value="UPC" color="#7ABDDD" />
                            <Picker.Item label="UNMSM" value="UNMSM" color="#7ABDDD" />
                        </Picker>
                    </View>

                    <TextInput
                        style={{
                            width: '100%',
                            height: 48,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 8,
                            marginBottom: 16,
                            paddingHorizontal: 16,
                            color: 'white',
                        }}
                        placeholder="Student Email"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={{
                            width: '100%',
                            height: 48,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 8,
                            marginBottom: 24,
                            paddingHorizontal: 16,
                            color: 'white',
                        }}
                        placeholder="Password"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        onPress={handleSignIn}
                        style={{
                            width: '100%',
                            backgroundColor: '#2F9F91',
                            borderRadius: 8,
                            paddingVertical: 12,
                            alignItems: 'center',
                        }}
                        activeOpacity={0.9}
                    >
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ marginTop: 16 }}>
                        <Text style={{ color: '#E9C76E', fontSize: 14, textAlign: 'center' }}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                {/* Pie de Página */}
                <View style={{ alignItems: 'center', marginTop: 16 }}>
                    <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                        Don't have an account?{' '}
                        <Text style={{ color: '#E9C76E' }} onPress={() => router.push('/sign-up')}>
                            Sign up
                        </Text>
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
}
