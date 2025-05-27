import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';

export default function SplashScreen({ onComplete }) {
  const rotateAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    // Wait a moment, then start the twirl animation
    const timer = setTimeout(() => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 800);

    // Start fade out before transitioning
    const fadeTimer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [{ rotate: rotateInterpolate }],
            }
          ]}
        >
          <Image
            source={require('../../assets/drop_card_logo2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 280,
  },
}); 