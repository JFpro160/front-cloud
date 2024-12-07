import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { HelloWave } from '@/components/HelloWave';
import axios from 'axios';

export default function HomeScreen() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await SecureStore.getItemAsync('authToken');
                setIsAuthenticated(!!token);

                if (token) {
                    const response = await axios.get(
                        'https://6mgme2hqqi.execute-api.us-east-1.amazonaws.com/dev/students',
                        {
                            headers: { Authorization: token },
                        }
                    );

                    if (response.data?.body?.student_data?.student_name) {
                        setUserName(response.data.body.student_data.student_name);
                    } else {
                        setUserName('Guest');
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.alert('Error', 'Failed to fetch user data.');
                setUserName('Guest');
            }
        };

        fetchData();
    }, []);

    if (isAuthenticated === null) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2F9F91" />
                <Text style={styles.loadingText}>Checking Authentication...</Text>
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/sign-in" />;
    }

    return <HomeContent userName={userName} />;
}

function HomeContent({ userName }: { userName: string | null }) {
    const handleLearnMore = () => {
        Alert.alert(
            'App Information',
            'This app is designed to make your experience seamless and enjoyable. Explore features, track progress, and much more!'
        );
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor="#A1CEDC"
            headerImage={
                <LinearGradient
                    colors={['#2A4955', '#528399']}
                    style={styles.headerGradient}
                >
                    <Image
                        source={require('@/assets/images/partial-react-logo.png')}
                        style={styles.headerImage}
                    />
                    <Text style={styles.headerTitle}>Welcome to BE+!</Text>
                    <Text style={styles.headerSubtitle}>
                        Your companion for learning and growth.
                    </Text>
                </LinearGradient>
            }
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <HelloWave />
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>
                        Hello, {userName || 'Guest'}!
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Ready to explore your personalized dashboard?
                    </Text>
                    <TouchableOpacity
                        style={styles.learnMoreButton}
                        onPress={handleLearnMore}
                    >
                        <Text style={styles.learnMoreText}>Learn More</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.featureSection}>
                    <Text style={styles.featureTitle}>Features</Text>
                    <View style={styles.featureContainer}>
                        <FeatureCard
                            title="Track Progress"
                            description="Monitor your performance and milestones."
                            image={require('@/assets/images/progress.png')}
                        />
                        <FeatureCard
                            title="Explore Activities"
                            description="Engage in curated activities to boost skills."
                            image={require('@/assets/images/activities.png')}
                        />
                        <FeatureCard
                            title="Customize"
                            description="Personalize your experience with tailored options."
                            image={require('@/assets/images/customize.png')}
                        />
                    </View>
                </View>
            </ScrollView>
        </ParallaxScrollView>
    );
}

function FeatureCard({
                         title,
                         description,
                         image,
                     }: {
    title: string;
    description: string;
    image: any;
}) {
    return (
        <View style={styles.featureCard}>
            <Image source={image} style={styles.featureImage} />
            <Text style={styles.featureCardTitle}>{title}</Text>
            <Text style={styles.featureCardDescription}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2A4955',
    },
    loadingText: {
        marginTop: 10,
        color: '#FFF',
        fontSize: 16,
    },
    headerGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 250,
    },
    headerImage: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: 'bold',
        marginTop: -40,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E9C76E',
        marginTop: 10,
    },
    scrollContent: {
        padding: 16,
    },
    heroSection: {
        marginVertical: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 8,
    },
    heroTitle: {
        fontSize: 22,
        color: '#2A4955',
        fontWeight: 'bold',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginVertical: 10,
    },
    learnMoreButton: {
        backgroundColor: '#2F9F91',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: 10,
    },
    learnMoreText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    featureSection: {
        marginTop: 20,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#2A4955',
    },
    featureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    featureCard: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    featureImage: {
        width: 80,
        height: 80,
        marginBottom: 8,
    },
    featureCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#2A4955',
    },
    featureCardDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});

