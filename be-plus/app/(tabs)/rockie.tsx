import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from "react-native";
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
    level?: number;
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

            const response = await fetch(
                "https://jmkaqyjkuk.execute-api.us-east-1.amazonaws.com/dev/rockie",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                }
            );

            const data = await response.json();
            if (response.status === 200 && data.body?.rockie_data) {
                setRockieData(data.body);
            } else {
                setError(data.message || "No Rockie found.");
            }
        } catch (error) {
            console.error("Error fetching Rockie data:", error);
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

            const response = await fetch(
                "https://jmkaqyjkuk.execute-api.us-east-1.amazonaws.com/dev/rockie",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    body: JSON.stringify({
                        rockie_name: "FireRockie2",
                    }),
                }
            );

            if (response.status === 200) {
                const data = await response.json();
                setRockieData(data.body);
            } else {
                setError("Failed to create Rockie.");
            }
        } catch (error) {
            console.error("Error creating Rockie:", error);
            setError("An unexpected error occurred.");
        }
    };

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
                            <Text style={styles.value}>{rockieData.level ?? "Not provided"}</Text>

                            <Text style={styles.label}>
                                <Icon name="chart-line" size={20} color="#E9C76E" /> Experience:
                            </Text>
                            <Text style={styles.value}>{rockieData.experience ?? "Not provided"}</Text>

                            <Text style={styles.label}>
                                <Icon name="leaf" size={20} color="#E9C76E" /> Evolution:
                            </Text>
                            <Text style={styles.value}>{rockieData.rockie_data.evolution || "Not provided"}</Text>
                        </>
                    ) : (
                        <View style={styles.noRockieContainer}>
                            <Text style={styles.noRockieText}>No Rockie found.</Text>
                            <CustomButton title="Create Rockie" onPress={createDefaultRockie} />
                        </View>
                    )}
                </LinearGradient>

                {/* Additional Section */}
                <View style={styles.additionalContainer}>
                    <Text style={styles.additionalHeader}>Meet Rockie!</Text>
                    <Image
                        source={require('@/assets/images/rocky_sample.png')}
                        style={styles.rockieImage}
                    />
                    <Text style={styles.additionalText}>
                        Rockie is your virtual companion. Grow and evolve together!
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    scrollContainer: { flexGrow: 1, padding: 20 },
    loadingText: { color: "#FFF", fontSize: 18 },
    infoContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    header: { fontSize: 24, color: "#E9C76E", fontWeight: "bold", marginBottom: 20 },
    label: { color: "#FFF", fontSize: 16, marginTop: 10 },
    value: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    noRockieContainer: { alignItems: "center", justifyContent: "center", marginTop: 20 },
    noRockieText: { color: "#FFF", fontSize: 18, marginBottom: 10 },
    errorContainer: { backgroundColor: "rgba(255, 0, 0, 0.5)", padding: 10, borderRadius: 5, marginBottom: 10 },
    errorText: { color: "#FFF", fontSize: 16 },
    button: { backgroundColor: "#E9C76E", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: "center", marginTop: 10 },
    buttonText: { color: "#2A4955", fontSize: 16, fontWeight: "bold" },
    additionalContainer: {
        alignItems: "center",
        marginTop: 20,
        padding: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 15,
    },
    additionalHeader: { fontSize: 20, color: "#E9C76E", fontWeight: "bold", marginBottom: 10 },
    rockieImage: { width: 150, height: 150, resizeMode: "contain", marginBottom: 10 },
    additionalText: { fontSize: 16, color: "#FFF", textAlign: "center" },
});


