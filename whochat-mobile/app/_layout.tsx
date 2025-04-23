
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { useFonts, Rubik_400Regular, Rubik_500Medium  } from '@expo-google-fonts/rubik';
import usePusher from '../hooks/usePusher';
import CustomToast from '@/components/CustomToast';
import { StatusBar } from 'react-native';
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
     
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="chatroom" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    
      <StatusBar translucent={false} barStyle={"light-content"}  backgroundColor="#660000" />
      <PusherListener />
      <CustomToast />
    </Provider>
  );
}

// Create a new component for Pusher Listener
function PusherListener() {
  usePusher(); 
  return null;
}
