import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, TextInput, Alert, TouchableOpacity, Text } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';


const Forgot = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const ResetPass = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('ส่งอีเมลล์เรียบร้อยแล้ว', 'กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน');
      })
      .catch((error) => {
        const errorMessage = error.message;
        Alert.alert('Reset Failed', errorMessage);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ลืมรหัสผ่าน</Text>
      <Text style={styles.subtitle}>รีเซ็ตรหัสผ่านด้วยอีเมลที่ใช้งาน</Text>
      <TextInput
        style={styles.textinput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.buttonGroup}>
        <TouchableOpacity onPress={ResetPass} style={styles.button}>
          <Text style={styles.buttonText}>ยืนยัน</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EBC0FF',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  textinput: {
    height: 40,
    backgroundColor: '#FFFFFF',
    width: '80%',
    borderRadius: 30,
    textAlign: 'center',
    fontSize: 20,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#B051D9',
    borderRadius: 50,
    paddingHorizontal: 35,
    paddingVertical: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5, // เพิ่ม elevation สำหรับ Android shadow
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Forgot;
