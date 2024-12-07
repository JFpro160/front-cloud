import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";

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
                // Si el Rockie existe, lo mostramos
                setRockieData(data.body);  // Actualiza el estado
                setError(null); // Limpiar cualquier error
            } else if (response.status === 404 || !data.body.rockie_data) {
                // Si no se encuentra el Rockie, mostramos el mensaje
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
                    rockie_name: "FireRockie2", // Nombre por defecto
                }),
            });

            console.log("POST Response Status:", response.status);

            if (response.status === 200) {
                const data = await response.json();
                console.log("POST API Response (Rockie Created):", data);
                setRockieData(data.body); // Actualiza los datos del Rockie
                setError(null); // Limpiar error
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

    // If still loading, show the loading message
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Rockie data...</Text>
            </View>
        );
    }

    // Debugging: print the current `rockieData`
    console.log("Current Rockie Data:", rockieData);

    return (
        <LinearGradient colors={["#2A4955", "#528399"]} style={styles.gradient}>
            <View style={styles.scrollContainer}>
                <View style={styles.infoContainer}>
                    <Text style={styles.header}>Rockie Profile</Text>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Render Rockie data if available */}
                    {rockieData && rockieData.rockie_data ? (
                        <>
                            <Text style={styles.label}>Name:</Text>
                            <Text style={styles.value}>
                                {rockieData.rockie_data.rockie_name || "Not provided"}
                            </Text>

                            <Text style={styles.label}>Level:</Text>
                            <Text style={styles.value}>
                                {rockieData.level ?? "Not provided"}
                            </Text>

                            <Text style={styles.label}>Experience:</Text>
                            <Text style={styles.value}>
                                {rockieData.experience ?? "Not provided"}
                            </Text>

                            <Text style={styles.label}>Evolution:</Text>
                            <Text style={styles.value}>
                                {rockieData.rockie_data.evolution || "Not provided"}
                            </Text>

                            <Text style={styles.label}>Student ID:</Text>
                            <Text style={styles.value}>
                                {rockieData.student_id || "Not provided"}
                            </Text>

                            <Text style={styles.label}>Tenant ID:</Text>
                            <Text style={styles.value}>
                                {rockieData.tenant_id || "Not provided"}
                            </Text>

                            <Text style={styles.label}>Creation Date:</Text>
                            <Text style={styles.value}>
                                {rockieData.creation_date || "Not provided"}
                            </Text>
                        </>
                    ) : (
                        <View style={styles.noRockieContainer}>
                            <Text style={styles.noRockieText}>No Rockie found.</Text>
                            <Button title="Create Rockie" onPress={createDefaultRockie} />
                        </View>
                    )}
                </View>
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
    infoContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 20,
        padding: 20,
        marginVertical: 10,
    },
    header: {
        fontSize: 24,
        color: "#E9C76E",
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    label: {
        color: "rgba(255, 255, 255, 0.8)",
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
});
