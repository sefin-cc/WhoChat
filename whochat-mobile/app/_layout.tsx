import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { useFonts, Rubik_400Regular, Rubik_500Medium } from '@expo-google-fonts/rubik';
import usePusher from '../hooks/usePusher';
import CustomToast from '@/components/CustomToast';
import { StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [wasConnected, setWasConnected] = useState(true);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = !!state.isConnected;

      // Show toast when going offline
      if (!isConnected && wasConnected) {
        Toast.show({
          type: 'info',
          position: 'bottom',
          text1: 'No Internet Connection!',
          visibilityTime: 10000,
          autoHide: true,
          bottomOffset: 70,
        });
      }

      // Show toast when going online
      if (isConnected && !wasConnected) {
        Toast.show({
          type: 'info',
          position: 'bottom',
          text1: 'Back Online!',
          visibilityTime: 6000,
          autoHide: true,
          bottomOffset: 70,
        });
      }

      setWasConnected(isConnected);
    });

    return () => unsubscribe();
  }, [wasConnected]);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="chatroom" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar translucent={false} barStyle="light-content" backgroundColor="#660000" />
      <PusherListener />
      <CustomToast />
    </Provider>
  );
}

function PusherListener() {
  usePusher();
  return null;
}
