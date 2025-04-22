import { useEffect } from 'react';
import Pusher from 'pusher-js/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { addMessage, setUserIds } from '../redux/chatSlice';
import Constants from 'expo-constants';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;
const PUSHER_APP_KEY = Constants.expoConfig?.extra?.PUSHER_APP_KEY;
const PUSHER_APP_CLUSTER = Constants.expoConfig?.extra?.PUSHER_APP_CLUSTER;

export default function usePusher() {
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.chat.userId);

  useEffect(() => {
    if (!userId) return;

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_APP_CLUSTER,
      authEndpoint: BACKEND_URL, 
    });

    const channel = pusher.subscribe(`private-chat.${userId}`);

    channel.bind('App\\Events\\RandomChat', (data: any) => {
      if (data.message === 'PartnerDisconnected') {
        console.log('Your partner disconnected');
        Alert.alert('Disconnected', 'Your partner has disconnected.');

        dispatch(setUserIds({ userId: userId, partnerId: null }));

        router.replace('/');
      } else {
        dispatch(addMessage({
          from: data.from,
          to: data.to,
          message: data.message,
        }));
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId, dispatch]);
}
