import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

// Define the structure of our student data
interface StudentData {
    student_name?: string;
    student_email?: string;
    student_id?: string;
    birthday?: string;
    gender?: string;
    telephone?: number;
    rockie_coins?: number;
    rockie_gems?: number;
    tenant_id?: string;
    creation_date?: string;
    image_url?: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                console.error('No authentication token found');
                Alert.alert('Error', 'No authentication token found');
                return;
            }

            const response = await fetch('https://6mgme2hqqi.execute-api.us-east-1.amazonaws.com/dev/students', {
                method: 'GET',
                headers: {
                    Authorization: token,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setStudentData({
                    ...data.body,
                    ...data.body.student_data,
                    image_url: data.body.image_url || '/placeholder.svg?height=120&width=120',
                });
            } else {
                Alert.alert('Error', `Failed to fetch student data: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            Alert.alert('Error', 'An unexpected error occurred while fetching student data.');
        }
    };

    const updateStudentData = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                console.error('No authentication token found');
                Alert.alert('Error', 'No authentication token found');
                return;
            }

            const response = await fetch('https://6mgme2hqqi.execute-api.us-east-1.amazonaws.com/dev/students', {
                method: 'PUT',
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Profile updated successfully');
                setIsEditing(false);
            } else {
                Alert.alert('Error', `Failed to update profile: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating student data:', error);
            Alert.alert('Error', 'An unexpected error occurred while updating the profile.');
        }
    };

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('authToken');
            router.replace('/sign-in');
        } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to logout');
        }
    };

    if (!studentData) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <LinearGradient colors={['#2A4955', '#528399']} style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileContainer}>
                    <Image
                        source={{ uri: studentData.image_url || '/placeholder.svg?height=120&width=120' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.profileName}>
                        {studentData.student_name || 'Not provided'}
                    </Text>
                    <Text style={styles.profileEmail}>
                        {studentData.student_email || 'Not provided'}
                    </Text>

                    {/* Rockie Coins and Gems */}
                    <View style={styles.rockieContainer}>
                        <View style={styles.rockieItem}>
                            <Image
                                source={require('@/assets/images/adaptive-icon.png')} // Reemplazar con la ruta real del ícono
                                style={styles.rockieIcon}
                            />
                            <Text style={styles.rockieText}>
                                {studentData.rockie_coins?.toString() || '0'}
                            </Text>
                        </View>
                        <View style={styles.rockieItem}>
                            <Image
                                source={require('@/assets/images/adaptive-icon.png')} // Reemplazar con la ruta real del ícono
                                style={styles.rockieIcon}
                            />
                            <Text style={styles.rockieText}>
                                {studentData.rockie_gems?.toString() || '0'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <InfoBlock label="Student ID" value={studentData.student_id || 'Not provided'} />
                    <InfoBlock
                        label="Birthday"
                        value={studentData.birthday || 'Not provided'}
                        editable={isEditing}
                        onPress={() => setShowDatePicker(true)}
                    />
                    <InfoBlock
                        label="Gender"
                        value={studentData.gender || 'Not provided'}
                        editable={isEditing}
                        onPress={() => {}}
                    />
                    <InfoBlock
                        label="Telephone"
                        value={studentData.telephone?.toString() || 'Not provided'}
                        editable={isEditing}
                        onPress={() => {}}
                    />
                    <InfoBlock
                        label="Tenant ID"
                        value={studentData.tenant_id || 'Not provided'}
                    />
                    <InfoBlock
                        label="Account Created"
                        value={studentData.creation_date || 'Not provided'}
                    />

                    {showDatePicker && (
                        <DateTimePicker
                            value={
                                studentData.birthday
                                    ? new Date(studentData.birthday)
                                    : new Date()
                            }
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setStudentData({
                                        ...studentData,
                                        birthday: selectedDate.toISOString().split('T')[0],
                                    });
                                }
                            }}
                        />
                    )}

                    <TouchableOpacity
                        onPress={() => {
                            if (isEditing) {
                                updateStudentData();
                            } else {
                                setIsEditing(true);
                            }
                        }}
                        style={styles.editButton}
                    >
                        <Text style={styles.editButtonText}>
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const InfoBlock = ({
                       label,
                       value,
                       editable = false,
                       onPress = () => {},
                   }: {
    label: string;
    value: string;
    editable?: boolean;
    onPress?: () => void;
}) => (
    <View style={styles.infoBlock}>
        <Text style={styles.label}>{label}</Text>
        {editable ? (
            <TouchableOpacity onPress={onPress}>
                <View style={styles.editableValueContainer}>
                    <Text style={styles.value}>{value}</Text>
                    <Ionicons name="pencil" size={16} color="#E9C76E" />
                </View>
            </TouchableOpacity>
        ) : (
            <Text style={styles.value}>{value}</Text>
        )}
    </View>
);

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2A4955',
    },
    loadingText: {
        color: '#FFF',
        fontSize: 18,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        backgroundColor: '#E9C76E',
    },
    profileName: {
        color: '#E9C76E',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profileEmail: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
    },
    rockieContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        marginBottom: 16,
    },
    rockieItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    rockieIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    rockieText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 20,
    },
    infoBlock: {
        marginBottom: 20,
    },
    label: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        color: '#FFF',
        fontSize: 18,
    },
    editableValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    editButton: {
        backgroundColor: '#2F9F91',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#E9C76E',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#2A4955',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
