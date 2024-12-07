import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await fetch("https://6mgme2hqqi.execute-api.us-east-1.amazonaws.com/dev/students", {
                method: "GET",
                headers: {
                    Authorization: token,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setStudentData({
                    ...data.body,
                    ...data.body.student_data,
                    image_url: data.body.image_url || null,
                });
            } else {
                setError(`Failed to fetch student data: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error fetching student data:", err);
            setError("An unexpected error occurred while fetching student data.");
        }
    };

    const updateStudentData = async () => {
        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await fetch("https://6mgme2hqqi.execute-api.us-east-1.amazonaws.com/dev/students", {
                method: "PUT",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(studentData),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Profile updated successfully");
                setIsEditing(false);
            } else {
                setError(`Failed to update profile: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error updating student data:", err);
            setError("An unexpected error occurred while updating the profile.");
        }
    };

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync("authToken");
            router.replace("/sign-in");
        } catch (err) {
            console.error("Error during logout:", err);
            Alert.alert("Error", "Failed to logout.");
        }
    };

    if (!studentData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E9C76E" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <LinearGradient colors={["#2A4955", "#528399"]} style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

                <View style={styles.profileContainer}>
                    <Image
                        source={{
                            uri: studentData.image_url || "https://via.placeholder.com/120",
                        }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.profileName}>{studentData.student_name || "Not provided"}</Text>
                    <Text style={styles.profileEmail}>{studentData.student_email || "Not provided"}</Text>

                    {/* Rockie Coins and Gems */}
                    <View style={styles.rockieContainer}>
                        <RockieStat icon="coins" value={studentData.rockie_coins || 0} label="Coins" />
                        <RockieStat icon="diamond" value={studentData.rockie_gems || 0} label="Gems" />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <InfoBlock label="Student ID" value={studentData.student_id || "Not provided"} />
                    <InfoBlock
                        label="Birthday"
                        value={studentData.birthday || "Not provided"}
                        editable={isEditing}
                        onPress={() => setShowDatePicker(true)}
                    />
                    <InfoBlock label="Gender" value={studentData.gender || "Not provided"} editable={isEditing} />
                    <InfoBlock
                        label="Telephone"
                        value={studentData.telephone?.toString() || "Not provided"}
                        editable={isEditing}
                    />
                    <InfoBlock label="Tenant ID" value={studentData.tenant_id || "Not provided"} />
                    <InfoBlock label="Account Created" value={studentData.creation_date || "Not provided"} />

                    {showDatePicker && (
                        <DateTimePicker
                            value={studentData.birthday ? new Date(studentData.birthday) : new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setStudentData({
                                        ...studentData,
                                        birthday: selectedDate.toISOString().split("T")[0],
                                    });
                                }
                            }}
                        />
                    )}

                    <CustomButton
                        title={isEditing ? "Save Changes" : "Edit Profile"}
                        onPress={isEditing ? updateStudentData : () => setIsEditing(true)}
                    />

                    <CustomButton title="Logout" onPress={handleLogout} variant="secondary" />
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const RockieStat = ({ icon, value, label }: { icon: string; value: number; label: string }) => (
    <View style={styles.rockieItem}>
        <Ionicons name={icon} size={24} color="#E9C76E" />
        <Text style={styles.rockieText}>
            {value} {label}
        </Text>
    </View>
);

const ErrorBanner = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <View style={styles.errorBanner}>
        <Text style={styles.errorText}>{message}</Text>
        <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-circle" size={20} color="#FFF" />
        </TouchableOpacity>
    </View>
);

const CustomButton = ({ title, onPress, variant = "primary" }: { title: string; onPress: () => void; variant?: string }) => (
    <TouchableOpacity
        style={[styles.button, variant === "secondary" && styles.buttonSecondary]}
        onPress={onPress}
    >
        <Text style={[styles.buttonText, variant === "secondary" && styles.buttonTextSecondary]}>{title}</Text>
    </TouchableOpacity>
);

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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2A4955",
    },
    loadingText: {
        color: "#FFF",
        fontSize: 18,
    },
    profileContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        backgroundColor: "#E9C76E",
    },
    profileName: {
        color: "#E9C76E",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    profileEmail: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 16,
    },
    rockieContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
        marginBottom: 16,
    },
    rockieItem: {
        alignItems: "center",
    },
    rockieText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 4,
    },
    infoContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    errorBanner: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(255, 0, 0, 0.7)",
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    errorText: {
        color: "#FFF",
        fontSize: 14,
        flex: 1,
        marginRight: 10,
    },
    button: {
        backgroundColor: "#2F9F91",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonSecondary: {
        backgroundColor: "#E9C76E",
    },
    buttonTextSecondary: {
        color: "#2A4955",
    },

    infoBlock: {
        marginBottom: 20,
    },
    label: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        color: "#FFF",
        fontSize: 18,
    },
    editableValueContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

});
