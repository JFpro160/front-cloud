import { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    rotationAnimation.value = withRepeat(
        withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
        4 // Run the animation 4 times
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
      <Animated.View style={animatedStyle}>
        {/* Asegúrate de que el emoji esté envuelto en un componente Text */}
        <Text style={styles.text}>👋</Text>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28, // Tamaño del emoji
    lineHeight: 32, // Asegura que la línea del emoji esté centrada
    marginTop: -6, // Ajuste de posición si es necesario
  },
});
