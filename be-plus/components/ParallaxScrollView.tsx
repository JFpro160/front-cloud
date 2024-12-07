import type { PropsWithChildren, ReactElement } from 'react';
import Animated, {
    useAnimatedRef,
    useScrollViewOffset,
} from 'react-native-reanimated';
import { View, Dimensions } from 'react-native';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';

const HEADER_HEIGHT = 250;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = PropsWithChildren<{
    headerImage: ReactElement;
    headerBackgroundColor: string;
}>;

export default function ParallaxScrollView({
                                               children,
                                               headerImage,
                                               headerBackgroundColor,
                                           }: Props) {
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const bottom = useBottomTabOverflow();

    return (
        <View style={{ flex: 1 }}>
            <Animated.ScrollView
                ref={scrollRef}
                scrollEventThrottle={16}
                scrollIndicatorInsets={{ bottom }}
                contentContainerStyle={{
                    paddingTop: HEADER_HEIGHT,
                    paddingBottom: bottom + 16,
                }}
                style={{ flex: 1 }}
            >
                {children}
            </Animated.ScrollView>

            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: HEADER_HEIGHT,
                    backgroundColor: headerBackgroundColor,
                    overflow: 'hidden',
                    zIndex: 1,
                }}
            >
                <View style={{ width: '100%', height: '100%' }}>
                    {headerImage}
                </View>
            </View>
        </View>
    );
}