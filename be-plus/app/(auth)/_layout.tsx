import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,  // Hide the header
                headerTitle: '',     // Ensure no title is shown
                title: ''            // Additional safeguard against title
            }}
        >
            <Stack.Screen
                name="sign-in"
                options={{
                    headerShown: false,
                    title: ''
                }}
            />
            <Stack.Screen
                name="sign-up"
                options={{
                    headerShown: false,
                    title: ''
                }}
            />
        </Stack>
    );
}