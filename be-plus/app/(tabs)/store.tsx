import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

interface Product {
    product_info: {
        product_name: string;
        category: string;
        discount: number;
        image?: string;
    };
    price: number;
    product_id: string;
}

interface StudentData {
    rockie_coins?: number;
}

export default function StoreScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [studentData, setStudentData] = useState<StudentData | null>(null);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const loadProducts = async (lastKey: string | null = null) => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                setError('Authentication token not found.');
                setLoading(false);
                return;
            }

            console.log('Token found:', token);

            const params = new URLSearchParams({
                method: 'gsi',
                store_type: 'Accessories',
                limit: '10',
                lastEvaluatedKey: lastKey ? encodeURIComponent(lastKey) : 'null',
            });

            const response = await axios.get(
                `https://ehrw471qc9.execute-api.us-east-1.amazonaws.com/dev/purchasables?${params.toString()}`,
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            console.log('API Response Data:', response.data);

            const data = response.data.body;

            if (data && Array.isArray(data.items)) {
                setProducts((prevProducts) => [...prevProducts, ...data.items]);
                setLastEvaluatedKey(data.lastEvaluatedKey);
            } else {
                setError('Error: Invalid data format.');
            }
        } catch (err) {
            console.error('Error loading products:', err);
            setError('Error loading products');
        } finally {
            setLoading(false);
        }
    };

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
                console.log('Student Data:', data.body.student_data);
                setStudentData(data.body.student_data);
            } else {
                Alert.alert('Error', `Failed to fetch student data: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            Alert.alert('Error', 'An unexpected error occurred while fetching student data.');
        }
    };

    const handlePurchase = async () => {
        if (!selectedProduct || !studentData || !studentData.rockie_coins) {
            return;
        }

        if (studentData.rockie_coins < selectedProduct.price) {
            Alert.alert('Error', 'Insufficient Rockie Coins to purchase this item.');
            return;
        }

        const newRockieCoins = studentData.rockie_coins - selectedProduct.price;

        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                console.error('No authentication token found');
                Alert.alert('Error', 'No authentication token found');
                return;
            }

            console.log('Attempting to update Rockie Coins...');
            console.log('New Rockie Coins:', newRockieCoins);

            const response = await fetch('https://6mgme2hqqi.execute-api.us-east-1.amazonaws.com/dev/students', {
                method: 'PUT',
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_data: {
                        rockie_coins: newRockieCoins,
                    },
                }),

            });

            const responseData = await response.json();
            console.log('Update Response Data:', responseData);

            if (response.ok) {
                Alert.alert('Success', 'Item purchased successfully!');
                setStudentData({ ...studentData, rockie_coins: newRockieCoins });
                setModalVisible(false);
            } else {
                console.error('Error updating Rockie Coins:', responseData);
                Alert.alert('Error', `Failed to purchase item: ${responseData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating student data:', error);
            Alert.alert('Error', 'An unexpected error occurred while purchasing the item.');
        }
    };

    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value);
        setProducts([]);
        setLastEvaluatedKey(null);
        loadProducts(null);
    };

    useEffect(() => {
        loadProducts();
        fetchStudentData();
    }, []);

    const loadMoreProducts = () => {
        if (lastEvaluatedKey && !loading) {
            loadProducts(lastEvaluatedKey);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Store Screen</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Picker
                selectedValue={categoryFilter}
                onValueChange={handleCategoryChange}
                style={styles.picker}
            >
                <Picker.Item label="All Categories" value="All" />
                <Picker.Item label="Arms" value="Arms" />
                <Picker.Item label="Body" value="Body" />
                <Picker.Item label="Face" value="Face" />
                <Picker.Item label="Head" value="Head" />
            </Picker>

            <FlatList
                data={products}
                keyExtractor={(item) => item.product_id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.productItem}
                        onPress={() => {
                            setSelectedProduct(item);
                            setModalVisible(true);
                        }}
                    >
                        <Text style={styles.productName}>{item.product_info.product_name}</Text>
                        <Text>Price: ${item.price}</Text>
                        <Text>Discount: {item.product_info.discount}%</Text>
                        <Text>Category: {item.product_info.category}</Text>
                    </TouchableOpacity>
                )}
            />

            {lastEvaluatedKey && !loading && (
                <Button title="Load More" onPress={loadMoreProducts} />
            )}

            {loading && <Text>Loading...</Text>}

            {selectedProduct && (
                <Modal visible={modalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Purchase</Text>
                        <Text>Product: {selectedProduct.product_info.product_name}</Text>
                        <Text>Price: {selectedProduct.price} Rockie Coins</Text>
                        <Text>Available Coins: {studentData?.rockie_coins || 'Not provided'}</Text>
                        <Button title="Confirm Purchase" onPress={handlePurchase} />
                        <Button
                            title="Cancel"
                            onPress={() => setModalVisible(false)}
                            color="red"
                        />
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        fontSize: 24,
        marginBottom: 16,
    },
    errorText: {
        color: 'red',
    },
    picker: {
        height: 50,
        width: 150,
        marginBottom: 20,
    },
    productItem: {
        marginVertical: 10,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    productName: {
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white',
    },
});
