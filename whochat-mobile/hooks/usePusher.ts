import { useEffect } from 'react';
import Pusher from 'pusher-js';
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
    if (!userId) return; // Prevent subscribing before userId is available

    // Initialize Pusher with pusher-js
    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_APP_CLUSTER,
      authEndpoint: BACKEND_URL,
    });

    // Subscribe to the private channel for the current user
    const channel = pusher.subscribe(`chat.${userId}`);

    // Listen for RandomChat messages
    channel.bind('random.chat.message', (data: any) => {
      if (data.message === 'PartnerDisconnected') {
        console.log('Your partner disconnected');
        Alert.alert('Disconnected', 'Your partner has disconnected.');

        // Reset user and partner IDs in the Redux store
        dispatch(setUserIds({ userId: userId, partnerId: null }));

        // Redirect to the waiting screen
        router.replace('/');
      } else {
        // Add the received message to the Redux store
        dispatch(addMessage({
          from: data.from,
          to: data.to,
          message: data.message,
        }));
      }
    });

    // Listen for the 'UserPaired' event to notify both users about the pairing
    channel.bind('UserPaired', (data: any) => {
      console.log('Paired event received:', data);

      // If you haven't set your userId yet, do it now
      if (!userId) {
        dispatch(setUserIds({
          userId: data.your_id,
          partnerId: data.partner_id,
        }));
      } else {
        // If userId exists, just update partner
        dispatch(setUserIds({
          userId: userId,
          partnerId: data.partner_id,
        }));
      }

      // Navigate to chatroom immediately
      router.replace('/chatroom');
    });

    // Cleanup
    return () => {
      pusher.unsubscribe(`private-chat.${userId}`);
      pusher.disconnect();
    };
  }, [userId, dispatch]);

  return null;
}
