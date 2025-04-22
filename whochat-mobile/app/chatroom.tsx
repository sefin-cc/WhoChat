import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setUserIds } from '../redux/chatSlice';
import { AppState } from 'react-native';

import {
  useSendMessageMutation,
  useDisconnectUserMutation,
  useReconnectUserMutation,
  useSendHeartbeatMutation
} from '../services/chatApi';

import usePusher from '../hooks/usePusher';
import { router } from 'expo-router';

export default function ChatRoom() {
  const dispatch = useDispatch();
  const { userId, partnerId, messages } = useSelector((state: RootState) => state.chat);

  const [message, setMessage] = useState('');

  const [sendMessage] = useSendMessageMutation();
  const [disconnectUser] = useDisconnectUserMutation();
  const [reconnectUser] = useReconnectUserMutation();

  const [sendHeartbeat] = useSendHeartbeatMutation();

  usePusher();

  const handleSend = async () => {
    if (message.trim() && userId && partnerId) {
      await sendMessage({ message, from: userId, to: partnerId });
      setMessage('');
    }
  };

  const handleDisconnect = async () => {
    if (userId) {
        await disconnectUser({ user_id: userId });
        dispatch(setUserIds({ userId: null , partnerId: null }));
        router.replace('/');  
    }
  };

  const handleReconnect = async () => {
    if (userId) {
      const res = await reconnectUser({ user_id: userId }).unwrap();
      dispatch(setUserIds({ userId: userId, partnerId: res.partner_id }));
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
  
    const startHeartbeat = () => {
      if (!interval && userId) {
        interval = setInterval(() => {
          sendHeartbeat({ user_id: userId });
        }, 10000); // every 10 seconds
      }
    };
  
    const stopHeartbeat = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        startHeartbeat();
      } else if (nextAppState.match(/inactive|background/)) {
        stopHeartbeat();
      }
    };
  
    const appStateListener = AppState.addEventListener('change', handleAppStateChange);
  
    // Start heartbeat initially
    startHeartbeat();
  
    return () => {
      stopHeartbeat();
      appStateListener.remove(); // Clean up listener
    };
  }, [userId]);

  return (
    <View style={styles.container}>

      <Text>Your ID: {userId}</Text>
      <Text>Partner ID: {partnerId || 'Waiting for partner...'}</Text>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Text>{item.from === userId ? 'You' : 'Partner'}: {item.message}</Text>
        )}
        style={styles.messages}
      />

      <TextInput
        placeholder="Type your message..."
        value={message}
        onChangeText={setMessage}
        style={styles.input}
      />
      <Button title="Send Message" onPress={handleSend} />
      <Button title="Reconnect" onPress={handleReconnect} color="green" />
      <Button title="Disconnect" onPress={handleDisconnect} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  messages: { flex: 1, marginVertical: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
});
