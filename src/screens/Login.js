import React, { useState } from 'react';
import { View, Image, StyleSheet, TextInput, Alert, TouchableOpacity, Text } from 'react-native';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigation.navigate('Tabnavi');
        console.log(`${email} Login successful`);
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage);
        Alert.alert('Login Failed',errorMessage);
      });
  };

  return (
    <View style={styles.container}>
      <Image source={require('@assets/images/logo.png')} style={styles.logo} />
      <TextInput
        style={styles.textinput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.textinput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        autoCapitalize="none"
      />
      <View style={{ marginTop: 30 }}>
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Forgot')} style={styles.button}>
  <Text style={styles.buttonText}>ForgotPassword</Text>
</TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
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
    padding: 20
  },
  logo: {
    width: 300,
    height: 220,
    marginBottom: 20
  },
  textinput: {
    height: 40,
    backgroundColor: '#FFFFFF',
    width: '80%',
    borderRadius: 30,
    textAlign: 'center',
    fontSize: 20,
    marginTop: 20,
    paddingHorizontal: 10
  },
  button: {
    backgroundColor: '#B051D9',
    borderRadius: 50,
    paddingHorizontal: 35,
    paddingVertical: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5, 
    marginTop: 20
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center'
  },
});

export default Login;
