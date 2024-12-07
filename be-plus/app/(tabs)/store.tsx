import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
    Image,
    ActivityIndicator,
    Button, // Import Button here
} from 'react-native';
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

    // Fetch token utility
    const getAuthToken = async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync('authToken');
        } catch (err) {
            console.error('Error retrieving authentication token:', err);
            setError('Failed to retrieve authentication token.');
            return null;
        }
    };

    const loadProducts = async (lastKey: string | null = null) => {
        console.log('Loading products...');
        setLoading(true);
        setError(null);

        try {
            const token = await getAuthToken();
            if (!token) {
                setError('Authentication token not found.');
                return;
            }

            const response = await axios.get(
                `https://ehrw471qc9.execute-api.us-east-1.amazonaws.com/dev/purchasables`,
                {
                    headers: { Authorization: token },
                    params: {
                        method: 'gsi',
                        store_type: 'Accessories',
                        limit: 10,
                        lastEvaluatedKey: lastKey || undefined,
                    },
                }
            );

            const data = response.data.body;

            if (data && Array.isArray(data.items)) {
                setProducts((prevProducts) => [...prevProducts, ...data.items]);
                setLastEvaluatedKey(data.lastEvaluatedKey || null);
            } else {
                setError('Invalid data format received from API.');
            }
        } catch (err) {
            console.error('Error loading products:', err);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentData = async () => {
        console.log('Fetching student data...');
        setError(null);

        try {
            const token = await getAuthToken();
            if (!token) {
                setError('Authentication token not found.');
                return;
            }

            const response = await axios.get('https://6mgme2hqqi.execute-api.us-east-1.amazonaws.com/dev/students', {
                headers: { Authorization: token },
            });

            setStudentData(response.data.body?.student_data || null);
        } catch (err) {
            console.error('Error fetching student data:', err);
            setError('Failed to fetch student data. Please try again later.');
        }
    };

    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value);
        setProducts([]);
        setLastEvaluatedKey(null);
        loadProducts(null);
    };

    useEffect(() => {
        (async () => {
            console.log('Initializing Store Screen...');
            await fetchStudentData();
            await loadProducts();
        })();
    }, []);

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => {
                setSelectedProduct(item);
                setModalVisible(true);
            }}
        >
            <Image
                source={item.product_info.image ? { uri: item.product_info.image } : require('@/assets/images/placeholder.png')}
                style={styles.productImage}
            />
            <Text style={styles.productName}>{item.product_info.product_name}</Text>
            <Text style={styles.productPrice}>Price: {item.price} Rockie Coins</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Store</Text>
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
            {loading ? (
                <ActivityIndicator size="large" color="#2F9F91" />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.product_id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                />
            )}
            <Modal visible={modalVisible} transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Purchase</Text>
                        <Text>{selectedProduct?.product_info.product_name}</Text>
                        <Text>Price: {selectedProduct?.price} Rockie Coins</Text>
                        <Text>Available Coins: {studentData?.rockie_coins}</Text>
                        <Button title="Buy" onPress={() => Alert.alert('Purchase successful!')} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    errorText: { color: 'red', fontSize: 14, marginVertical: 8 },
    picker: { marginBottom: 20 },
    productCard: { flex: 1, margin: 8, backgroundColor: '#FFF', borderRadius: 8, padding: 12, alignItems: 'center' },
    productImage: { width: 100, height: 100, marginBottom: 8 },
    productName: { fontSize: 16, fontWeight: 'bold' },
    productPrice: { fontSize: 14, color: '#666' },
    row: { justifyContent: 'space-between' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 8, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});



