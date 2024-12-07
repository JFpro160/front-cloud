import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Modal,
    ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

interface Activity {
    activity_id: string;
    activity_type: string;
    activity_data: { [key: string]: any };
}

export default function ActivitiesScreen() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newActivity, setNewActivity] = useState("");
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const getAuthToken = async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync("authToken");
        } catch (err) {
            console.error("Error retrieving token:", err);
            setError("Failed to retrieve authentication token.");
            return null;
        }
    };

    const fetchActivities = async () => {
        setIsLoading(true);
        const endpoint = "https://m423uvy6wj.execute-api.us-east-1.amazonaws.com/dev/activities?method=gsi&limit=10";

        try {
            const token = await getAuthToken();
            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await axios.get(endpoint, {
                headers: { Authorization: token },
            });

            if (response.data.body?.items) {
                setActivities(response.data.body.items);
                setError(null);
            } else {
                setError("Failed to fetch activities.");
            }
        } catch (err) {
            console.error("Error fetching activities:", err);
            setError("An error occurred while fetching activities.");
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
            activity_data: { time: 30 },
        };

        try {
            const token = await getAuthToken();
            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await axios.post(endpoint, payload, {
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            });

            if (response.data) {
                Alert.alert("Success", "Activity added successfully!");
                setNewActivity("");
                fetchActivities();
            } else {
                setError("Failed to add activity.");
            }
        } catch (err) {
            console.error("Error adding activity:", err);
            setError("An error occurred while adding the activity.");
        }
    };

    const deleteActivity = async (activityId: string) => {
        const endpoint = "https://m423uvy6wj.execute-api.us-east-1.amazonaws.com/dev/activities";
        const payload = { activity_id: activityId };

        try {
            const token = await getAuthToken();
            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await axios.delete(endpoint, {
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
                data: payload,
            });

            if (response.data) {
                Alert.alert("Success", "Activity deleted successfully!");
                fetchActivities();
            } else {
                setError("Failed to delete activity.");
            }
        } catch (err) {
            console.error("Error deleting activity:", err);
            setError("An error occurred while deleting the activity.");
        }
    };

    const showActivityDetails = (activity: Activity) => {
        setSelectedActivity(activity);
        setModalVisible(true);
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
                        <View style={styles.activityCard}>
                            <Text style={styles.activityText}>{item.activity_type}</Text>
                            <View style={styles.activityButtons}>
                                <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() => showActivityDetails(item)}
                                >
                                    <Text style={styles.detailsButtonText}>Details</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => deleteActivity(item.activity_id)}
                                >
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
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
                <TouchableOpacity style={styles.addButton} onPress={addActivity}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            {selectedActivity && (
                <Modal visible={modalVisible} transparent={true}>
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={styles.modalTitle}>Activity Details</Text>
                            <View style={styles.detailsContainer}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Type:</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedActivity.activity_type}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Data:</Text>
                                    <View style={styles.detailValueBox}>
                                        {Object.entries(selectedActivity.activity_data).map(
                                            ([key, value]) => (
                                                <Text key={key} style={styles.detailDataRow}>
                                                    {`${key}: ${value}`}
                                                </Text>
                                            )
                                        )}
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Modal>
            )}
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
    activityCard: {
        backgroundColor: "#FFF",
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        elevation: 3,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    activityText: {
        fontSize: 16,
        flex: 1,
        color: "#333",
    },
    activityButtons: {
        flexDirection: "row",
    },
    detailsButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 8,
    },
    detailsButtonText: {
        color: "#FFF",
        fontSize: 14,
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
    addButton: {
        backgroundColor: "#40B3A2",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
    },
    addButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.8)",
    },
    modalContent: {
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#2A4955",
    },
    closeButton: {
        backgroundColor: "#2196F3",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    detailsContainer: {
        marginVertical: 20,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    detailLabel: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#2A4955",
    },
    detailValue: {
        fontSize: 16,
        color: "#333",
        textAlign: "right",
    },
    detailValueBox: {
        backgroundColor: "#F5F5F5",
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    detailDataRow: {
        fontSize: 14,
        color: "#666",
    },
});



