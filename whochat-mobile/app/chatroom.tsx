import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setUserIds } from '../redux/chatSlice';
import { AppState } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useSendMessageMutation,
  useDisconnectUserMutation,
  useReconnectUserMutation,
  useSendHeartbeatMutation
} from '../services/chatApi';

import usePusher from '../hooks/usePusher';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ChatRoom() {
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);
  const { userId, partnerId, messages } = useSelector((state: RootState) => state.chat);

  const [message, setMessage] = useState('');

  const [sendMessage] = useSendMessageMutation();
  const [disconnectUser] = useDisconnectUserMutation();
  const [reconnectUser] = useReconnectUserMutation();

  const [sendHeartbeat] = useSendHeartbeatMutation();

  const fakeMessages = [
    { from: "2", to: "1", message: "Hey, how are you?" },
    { from: null, to: "2", message: "I'm good! You?" },
    { from: "2", to: "1", message: "Doing great, just chilling 😎" },
    { from: "2", to: "1", message: "Hey, how are you?" },
    { from: null, to: "2", message: "I'm good! You?" },
    { from: "2", to: "1", message: "Doing great, just chilling 😎" },

  ];

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
    <StatusBar translucent={false} barStyle={"dark-content"}/>
    <View style={{flexDirection:"row",  width: "100%", backgroundColor: "#660000", padding: 10 }}>
        <View style={{ flex: 1 }}>
            <Text style={{color: "#fff"}}>Your ID: {userId}</Text>
            <Text style={{color: "#fff"}}>Partner ID: {partnerId || 'Waiting for partner...'}</Text>
        </View>

        <TouchableOpacity
            onPress={handleDisconnect}
            style={styles.button}
        >
           <MaterialIcons name="exit-to-app" size={30} color="#fff" />
        </TouchableOpacity>
    </View>

    {/* <View style={{ alignItems: "center" , margin: 10}}>
        <Text style={{color: "#660000"}}>Your Partner Disconnected!</Text>
    </View> */}

    <FlatList
        ref={flatListRef}
        data={fakeMessages}
        inverted 
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
            item.from === userId ? (
            <View style={{ alignSelf: 'flex-end', backgroundColor: '#A38285', margin: 5, padding: 10, paddingHorizontal:20, borderRadius: 34 }}>
                <Text style={{ color: '#fff', fontFamily: "Rubik_400Regular" }}>{item.message}</Text>
            </View>
            ) : (
            <View style={{ alignSelf: 'flex-start', backgroundColor: '#47050A', margin: 5, padding: 10, paddingHorizontal:20, borderRadius: 20 }}>
                <Text style={{ color: '#fff', fontFamily: "Rubik_400Regular" }}>{item.message}</Text>
            </View>
            )
        )}
        style={styles.messages}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />


    <View style={{flexDirection:"row",  width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 15}}>
        <TextInput
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            style={styles.input}
        />

        <TouchableOpacity
            onPress={handleSend}
            style={styles.button}
        >
            <Ionicons name="send" size={30} color="#47050a" />
        </TouchableOpacity>
    </View>


    {/* <Button title="Reconnect" onPress={handleReconnect} color="green" /> */}
    

    </View>
  );
}

const styles = StyleSheet.create({
container: { 
    flex: 1,
},
messages: { 
    flex: 1, 
    marginHorizontal: 5,
    fontFamily: "Rubik_400Regular",
    
    
},
input: { 
    borderWidth: 1, 
    padding: 10, 
    borderRadius: 20,
    borderColor: "gray",
    fontFamily: "Rubik_400Regular",
    flex: 1,
    marginLeft: 10
},
button: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
}
});
