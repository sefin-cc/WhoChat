import { router } from 'expo-router';
import { Image, StyleSheet, View, Text, TouchableHighlight, Modal, ActivityIndicator, StatusBar } from 'react-native';
import { useFetchStatusQuery, useConnectUserMutation, useDisconnectUserMutation } from '../services/chatApi';
import { useDispatch, useSelector } from 'react-redux';
import { clearChat, setUserIds } from '@/redux/chatSlice';
import { useEffect, useState } from 'react';
import { RootState } from '../redux/store';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import usePusher from '@/hooks/usePusher';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const [connectUser, {isLoading}] = useConnectUserMutation(); 
  const [disconnectUser] = useDisconnectUserMutation();
  const { data: statusData } = useFetchStatusQuery(undefined, { pollingInterval: 5000 });
  const { partnerId, userId } = useSelector((state: RootState) => state.chat);
  const [waiting, setWaiting] = useState(false);

  
  const handleConnect = async () => {
    try {
      const res = await connectUser().unwrap();
      dispatch(clearChat());
      dispatch(setUserIds({ userId: res.your_id, partnerId: res.partner_id }));
      // console.log(res);
      setWaiting(true);
    } catch (error) {
      console.error('Connect failed', error);
    }
    
  };

  const handleDisconnect = async () => {
    if (userId) {
      try {
        await disconnectUser({ user_id: userId }).unwrap();
        dispatch(setUserIds({ userId: null , partnerId: null }));
        setWaiting(false);
      } catch (error) {
        console.error('Disconnect failed', error);
      }
    }
  }

  useEffect(() => {
    if (partnerId) {
      setWaiting(false);
      router.replace('/chatroom');  
    }
  }, [partnerId]); 

  // usePusher(); 

  return (
    <View style={styles.container}>

    <StatusBar translucent={true} barStyle={"light-content"}/>

      <View style={{padding: 20, alignItems: "center"}}>
        <Ionicons name="chatbubble-ellipses" size={100} color="#FF9000" />
        <Text style={[styles.text, {fontSize: 50, marginBottom: -10, fontFamily: "Rubik_500Medium" }]}>WhoChat</Text>
        <Text style={[styles.text, {fontSize: 16}]}>Chat with Strangers!</Text>
      </View>


      <View style={{ flexDirection: "row"}}>
        <Text style={[styles.text, {fontSize:14, color: "#FF9000"}]}>Online : {statusData?.online_users ?? 0}</Text>
        <Text style={[styles.text, {fontSize:14, color: "#FF9000", paddingHorizontal:10 }]}>|</Text>
        <Text style={[styles.text, {fontSize:14, color: "#FF9000"}]}>Waiting : {statusData?.waiting_users ?? 0}</Text>
      </View>

    <View style={{ paddingVertical: 40, width: "100%" }}>
      <TouchableHighlight
          onPress={handleConnect}
          style={styles.button}
          underlayColor="#FF9000"
        >
          {
            isLoading ?  <ActivityIndicator size={24} color="white" />: 
            <Text style={styles.buttonText}>
              CHAT NOW  <FontAwesome6 name="fire" size={16} color="#fff" />
            </Text> 
          }

      </TouchableHighlight>
    </View>
      

      <Modal transparent={true} visible={waiting} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={60} color="black" />
            <Text style={[styles.text, {color: "#19090e", marginTop: 20}]}>Waiting for a Partner..</Text>
            <TouchableHighlight
              onPress={handleDisconnect}
              style={styles.button}
              underlayColor="#FF9000"
            >
              <Text style={styles.buttonText}>Exit</Text> 
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#660000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  text: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
    fontFamily: "Rubik_400Regular"
  },
  button: {
    backgroundColor: "#19090E",
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Rubik_500Medium"
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    padding:20,
    backgroundColor: 'white',
    borderRadius: 15,
    width:"70%",
    justifyContent: "center",
    alignItems: "center"
  },
  
});
