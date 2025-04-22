import { router } from 'expo-router';
import { Image, StyleSheet, View, Text, TouchableHighlight, Modal, ActivityIndicator } from 'react-native';
import { useFetchStatusQuery, useConnectUserMutation, useDisconnectUserMutation } from '../services/chatApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUserIds } from '@/redux/chatSlice';
import { useEffect, useState } from 'react';
import { RootState } from '../redux/store';


export default function HomeScreen() {
  const dispatch = useDispatch();
  const [connectUser] = useConnectUserMutation(); 
  const [disconnectUser] = useDisconnectUserMutation();
  const { data: statusData } = useFetchStatusQuery(undefined, { pollingInterval: 5000 });
  const { partnerId, userId } = useSelector((state: RootState) => state.chat);
  const [waiting, setWaiting] = useState(false);

  
  const handleConnect = async () => {
    try {
      const res = await connectUser().unwrap();
      dispatch(setUserIds({ userId: res.your_id, partnerId: res.partner_id }));
      console.log(res);
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
      router.push('/chatroom');  
    }
  }, [partnerId]); 



  return (
    <View style={styles.container}>
      <Text style={styles.text}>Online Users: {statusData?.online_users ?? 0}</Text>
      <Text style={styles.text}>Waiting Users: {statusData?.waiting_users ?? 0}</Text>

      <TouchableHighlight
        onPress={handleConnect}
        style={styles.button}
        underlayColor="#DDDDDD"
      >
        <Text style={styles.buttonText}>Chat Now</Text> 
      </TouchableHighlight>

      <Modal transparent={true} visible={waiting} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="black" />
            <Text>Waiting for a Partner..</Text>
            <TouchableHighlight
              onPress={handleDisconnect}
              style={styles.button}
              underlayColor="#DDDDDD"
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
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center"
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
    borderRadius: 15
  },
  
});
