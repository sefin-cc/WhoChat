import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast, { ToastConfigParams } from 'react-native-toast-message';

interface CustomToastProps {
  text1: string;
  text2?: string;
}

const CustomToast = () => {
  const customToastConfig = {
    success: ({ text1, text2 }: ToastConfigParams<CustomToastProps>) => (
      <View style={[styles.toast, styles.success]}>
        <Text style={styles.text}>{text1}</Text>
        {text2 && <Text style={[styles.text, styles.subtext]}>{text2}</Text>}
      </View>
    ),
    error: ({ text1, text2 }: ToastConfigParams<CustomToastProps>) => (
      <View style={[styles.toast, styles.error]}>
        <Text style={styles.text}>{text1}</Text>
        {text2 && <Text style={[styles.text, styles.subtext]}>{text2}</Text>}
      </View>
    ),
    info: ({ text1, text2 }: ToastConfigParams<CustomToastProps>) => (
      <View style={[styles.toast, styles.info]}>
        <Text style={styles.text}>{text1}</Text>
        {text2 && <Text style={[styles.text, styles.subtext]}>{text2}</Text>}
      </View>
    ),
  };

  return (
    <Toast config={customToastConfig} />
  );
};

const styles = StyleSheet.create({
  toast: {
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  success: {
    backgroundColor: '#28a745',
  },
  error: {
    backgroundColor: '#dc3545',
  },
  info: {
    backgroundColor: '#19090e',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontFamily: "Rubik_500Medium"
  },
  subtext: {
    fontSize: 14,
  },
});

export default CustomToast;
