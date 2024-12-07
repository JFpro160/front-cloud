import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Spinner from "react-native-loading-spinner-overlay";

interface RockieData {
    experience?: number;
    rockie_data?: {
        evolution?: string;
        rockie_name?: string;
    };
    rockie_name?: string;
    level?: number;
    tenant_id?: string;
    student_id?: string;
    creation_date?: string;
}

export default function RockieScreen() {
    const [rockieData, setRockieData] = useState<RockieData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRockieData();
    }, []);

    const fetchRockieData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                setError("Authentication token not found.");
                setIsLoading(false);
                return;
            }

            console.log("Token found:", token);

            const response = await fetch("https://jmkaqyjkuk.execute-api.us-east-1.amazonaws.com/dev/rockie", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
            });

            console.log("GET Response Status:", response.status);

            const data = await response.json();
            console.log("GET API Response:", data);

            if (response.status === 200 && data.body && data.body.rockie_data) {
                setRockieData(data.body); // Update Rockie data
            } else if (response.status === 404 || !data.body.rockie_data) {
                setRockieData(null);
                setError("No Rockie found.");
            } else {
                setError("Unexpected error: " + JSON.stringify(data.body));
            }
        } catch (error) {
            console.error("Unexpected error during GET request:", error);
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const createDefaultRockie = async () => {
        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            console.log("Attempting to create default Rockie...");

            const response = await fetch("https://jmkaqyjkuk.execute-api.us-east-1.amazonaws.com/dev/rockie", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
                body: JSON.stringify({
                    rockie_name: "FireRockie2", // Default name
                }),
            });

            console.log("POST Response Status:", response.status);

            if (response.status === 200) {
                const data = await response.json();
                console.log("POST API Response (Rockie Created):", data);
                setRockieData(data.body); // Update Rockie data
            } else {
                const errorText = await response.text();
                console.error("Error creating Rockie:", errorText);
                setError("Failed to create Rockie.");
            }
        } catch (error) {
            console.error("Unexpected error during POST request:", error);
            setError("An unexpected error occurred.");
        }
    };

    // Custom Button Component
    const CustomButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <Spinner
                visible={isLoading}
                textContent="Loading Rockie data..."
                textStyle={styles.loadingText}
            />
        );
    }

    return (
        <LinearGradient colors={["#2A4955", "#528399"]} style={styles.gradient}>
            <View style={styles.scrollContainer}>
                <LinearGradient colors={["#3A5E73", "#2A4955"]} style={styles.infoContainer}>
                    <Text style={styles.header}>Rockie Profile</Text>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <CustomButton title="Dismiss" onPress={() => setError(null)} />
                        </View>
                    )}

                    {rockieData && rockieData.rockie_data ? (
                        <>
                            <Text style={styles.label}>
                                <Icon name="account-circle" size={20} color="#E9C76E" /> Name:
                            </Text>
                            <Text style={styles.value}>
                                {rockieData.rockie_data.rockie_name || "Not provided"}
                            </Text>

                            <Text style={styles.label}>
                                <Icon name="star" size={20} color="#E9C76E" /> Level:
                            </Text>
                            <Text style={styles.value}>
                                {rockieData.level ?? "Not provided"}
                            </Text>

                            <Text style={styles.label}>
                                <Icon name="chart-line" size={20} color="#E9C76E" /> Experience:
                            </Text>
                            <Text style={styles.value}>
                                {rockieData.experience ?? "Not provided"}
                            </Text>

                            <Text style={styles.label}>
                                <Icon name="leaf" size={20} color="#E9C76E" /> Evolution:
                            </Text>
                            <Text style={styles.value}>
                                {rockieData.rockie_data.evolution || "Not provided"}
                            </Text>
                        </>
                    ) : (
                        <View style={styles.noRockieContainer}>
                            <Text style={styles.noRockieText}>No Rockie found.</Text>
                            <CustomButton title="Create Rockie" onPress={createDefaultRockie} />
                        </View>
                    )}
                </LinearGradient>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    loadingText: {
        color: "#FFF",
        fontSize: 18,
    },
    infoContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        fontSize: 24,
        color: "#E9C76E",
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    label: {
        color: "#FFF",
        fontSize: 16,
        marginTop: 10,
    },
    value: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    noRockieContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    noRockieText: {
        color: "#FFF",
        fontSize: 18,
        marginBottom: 10,
    },
    errorContainer: {
        backgroundColor: "rgba(255, 0, 0, 0.5)",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    errorText: {
        color: "#FFF",
        fontSize: 16,
    },
    button: {
        backgroundColor: "#E9C76E",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#2A4955",
        fontSize: 16,
        fontWeight: "bold",
    },
});

