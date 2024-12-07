import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    Button,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";

export default function ActivitiesScreen() {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newActivity, setNewActivity] = useState("");

    // Log API Requests and Responses
    const logApiCall = (method: string, endpoint: string, payload: object | null, response: Response, responseBody: any) => {
        console.log(`API Request:
        Method: ${method}
        Endpoint: ${endpoint}
        Payload: ${JSON.stringify(payload)}
        Status: ${response.status}
        Response: ${JSON.stringify(responseBody)}`);
    };

    const fetchActivities = async () => {
        setIsLoading(true);
        const endpoint = "https://m423uvy6wj.execute-api.us-east-1.amazonaws.com/dev/activities?method=gsi&limit=10";

        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                setError("Authentication token not found.");
                setIsLoading(false);
                return;
            }

            const response = await fetch(endpoint, {
                method: "GET",
                headers: { Authorization: token },
            });

            const data = await response.json();

            logApiCall("GET", endpoint, null, response, data);

            if (response.ok) {
                setActivities(data.body.items || []);
                setError(null);
            } else {
                setError(`Failed to fetch activities: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error fetching activities:", err);
            setError("An unexpected error occurred while fetching activities.");
        } finally {
            setIsLoading(false);
        }
    };

    const addActivity = async () => {
        if (!newActivity) {
            Alert.alert("Validation Error", "Activity type cannot be empty.");
            return;
        }

        const endpoint = "https://m423uvy6wj.execute-api.us-east-1.amazonaws.com/dev/activities";
        const payload = {
            activity_type: newActivity,
            activity_data: { time: 30 }, // Example data
        };

        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            logApiCall("POST", endpoint, payload, response, data);

            if (response.ok) {
                Alert.alert("Success", "Activity added successfully!");
                setNewActivity("");
                fetchActivities(); // Refresh the activities list
            } else {
                setError(`Failed to add activity: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error adding activity:", err);
            setError("An unexpected error occurred while adding the activity.");
        }
    };

    const deleteActivity = async (activityId: string) => {
        const endpoint = "https://m423uvy6wj.execute-api.us-east-1.amazonaws.com/dev/activities";
        const payload = { activity_id: activityId };

        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            logApiCall("DELETE", endpoint, payload, response, data);

            if (response.ok) {
                Alert.alert("Success", "Activity deleted successfully!");
                fetchActivities(); // Refresh the activities list
            } else {
                setError(`Failed to delete activity: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error deleting activity:", err);
            setError("An unexpected error occurred while deleting the activity.");
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Activities</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {isLoading ? (
                <ActivityIndicator size="large" color="#40B3A2" />
            ) : (
                <FlatList
                    data={activities}
                    keyExtractor={(item) => item.activity_id}
                    renderItem={({ item }) => (
                        <View style={styles.activityItem}>
                            <Text style={styles.activityText}>{item.activity_type}</Text>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteActivity(item.activity_id)}
                            >
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="New Activity Type"
                    value={newActivity}
                    onChangeText={setNewActivity}
                />
                <Button title="Add Activity" onPress={addActivity} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F5F5F5",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    errorText: {
        color: "red",
        marginBottom: 16,
    },
    activityItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        marginVertical: 8,
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
        elevation: 2,
    },
    activityText: {
        fontSize: 16,
        color: "#333",
    },
    deleteButton: {
        backgroundColor: "#FF4D4D",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    deleteButtonText: {
        color: "#FFF",
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
    },
    input: {
        flex: 1,
        borderColor: "#CCC",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 8,
        marginRight: 8,
    },
});

