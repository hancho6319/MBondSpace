import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Alert } from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from '../services/firebase';

function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(email, password);
      } else {
        await createUserWithEmailAndPassword(email, password);
        // Create user profile in Firestore
      }
      navigation.navigate('Profile');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(resetEmail);
      Alert.alert('Success', 'Password reset email sent!');
      setShowReset(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {showReset ? (
        <View>
          <Text>Reset Password</Text>
          <TextInput
            value={resetEmail}
            onChangeText={setResetEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button title="Send Reset Email" onPress={handleReset} />
          <Button title="Cancel" onPress={() => setShowReset(false)} />
        </View>
      ) : (
        <View>
          <Text>{isLogin ? 'Login' : 'Sign Up'}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          <Button title={isLogin ? 'Login' : 'Sign Up'} onPress={handleAuth} />
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text>
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
          {isLogin && (
            <TouchableOpacity onPress={() => setShowReset(true)}>
              <Text>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default AuthScreen;