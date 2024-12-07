import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignUpScreen() {
    const router = useRouter();
    const [tenantId, setTenantId] = useState('');
    const [studentId, setStudentId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');

    const handleRegister = async () => {
        if (!tenantId || !studentId || !email || !password || !name || !gender) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('https://6mgme2hqqi.execute-api.us-east-1.amazonaws.com/dev/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenant_id: tenantId,
                    student_id: studentId,
                    student_email: email,
                    password: password,
                    student_name: name,
                    gender: gender,
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Account created successfully!');
                router.replace('/sign-in'); // Redirige al inicio de sesión
            } else {
                const error = await response.json();
                Alert.alert('Error', error.message || 'Failed to create account');
            }
        } catch (error) {
            console.error('Network or unexpected error:', error);
            Alert.alert('Error', 'Connection error. Please try again.');
        }
    };

    return (
        <LinearGradient
            colors={['#1A374D', '#406882']}
            style={{ flex: 1 }} // Asegura que el gradiente ocupe toda la pantalla
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
                        Create Your Account
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                        Fill the details below to register
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
                    <Picker
                        selectedValue={tenantId}
                        onValueChange={(itemValue) => setTenantId(itemValue)}
                        style={{ color: 'white', marginBottom: 16 }}
                        dropdownIconColor="white"
                    >
                        <Picker.Item label="Select institution" value="" color="#7ABDDD" />
                        <Picker.Item label="UTEC" value="UTEC" color="#7ABDDD" />
                        <Picker.Item label="PUCP" value="PUCP" color="#7ABDDD" />
                        <Picker.Item label="UPAO" value="UPAO" color="#7ABDDD" />
                        <Picker.Item label="UPC" value="UPC" color="#7ABDDD" />
                        <Picker.Item label="UNMSM" value="UNMSM" color="#7ABDDD" />
                    </Picker>

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
                        placeholder="Student ID"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={studentId}
                        onChangeText={setStudentId}
                    />

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
                        placeholder="Full Name"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={name}
                        onChangeText={setName}
                    />

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
                        placeholder="Email"
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
                            marginBottom: 16,
                            paddingHorizontal: 16,
                            color: 'white',
                        }}
                        placeholder="Password"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Picker
                        selectedValue={gender}
                        onValueChange={(itemValue) => setGender(itemValue)}
                        style={{ color: 'white', marginBottom: 24 }}
                        dropdownIconColor="white"
                    >
                        <Picker.Item label="Select Gender" value="" color="#7ABDDD" />
                        <Picker.Item label="Male" value="M" color="#7ABDDD" />
                        <Picker.Item label="Female" value="F" color="#7ABDDD" />
                    </Picker>

                    <TouchableOpacity
                        onPress={handleRegister}
                        style={{
                            width: '100%',
                            backgroundColor: '#2F9F91',
                            borderRadius: 8,
                            paddingVertical: 12,
                            alignItems: 'center',
                        }}
                        activeOpacity={0.9}
                    >
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Register</Text>
                    </TouchableOpacity>
                </View>

                {/* Pie de Página */}
                <View style={{ alignItems: 'center', marginTop: 16 }}>
                    <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                        Already have an account?{' '}
                        <Text style={{ color: '#E9C76E' }} onPress={() => router.push('/sign-in')}>
                            Sign in
                        </Text>
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
}
