import React, { useEffect, useState } from "react";
import { Text, View, Image, StyleSheet, SafeAreaView, Alert, TouchableOpacity, Modal, TextInput, Button, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth, db, storage } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

// กำหนดคอมโพเนนต์ Profile ใช้ useState
export default function Profile() {
  const navigation = useNavigation();
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotoURL, setUploadedPhotoURL] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

//Data fetching ซึ่งถูกเรียกในเพื่อดึงข้อมูลผู้ใช้จาก Firebase Firestore เมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPhoto(userData.profileImage || null);
        setName(userData.username || '');
        setEmail(user.email);
        setNewName(userData.username || '');
      } else {
        console.log('No such document!');
      } 
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserInfo();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error signing out: ", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }
  
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!pickerResult.cancelled) {
      try {
        setUploading(true);
        const user = auth.currentUser;
        if (user) {
          const uri = pickerResult.assets[0].uri;
          const response = await fetch(uri);
          const blob = await response.blob();
          const storageRef = ref(storage, `profileImages/${user.uid}`);
          const uploadTask = uploadBytesResumable(storageRef, blob);

          uploadTask.on('state_changed',
            (snapshot) => {
              // Optional: Implement progress indicator
            },
            (error) => {
              console.error("Error uploading image: ", error);
              Alert.alert("Error", "Failed to upload image");
              setUploading(false);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setUploadedPhotoURL(downloadURL);
              setPhoto(downloadURL);
              Alert.alert('Success', 'Image uploaded successfully');
              setUploading(false);
            }
          );
        }
      } catch (error) {
        console.error("Error uploading image: ", error);
        Alert.alert("Error", "Failed to upload image");
        setUploading(false);
      }
    }
  };
//Data update
  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      setUploading(true);
      try {
        const updateData = { username: newName };
        if (uploadedPhotoURL) {
          updateData.profileImage = uploadedPhotoURL;
        }
        await updateDoc(userDocRef, updateData);
        setName(newName);
        Alert.alert('Success', 'Profile updated successfully');
        setModalVisible(false);
      } catch (error) {
        console.error("Error updating profile: ", error);
        Alert.alert("Error", "Failed to update profile");
      }
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.profileContainer}>
          <Image 
            source={photo ? { uri: photo } : require('@assets/images/profile.png')} 
            style={styles.profileImage} 
            accessibilityLabel="Profile Picture" 
          />
          <Text style={styles.userName}>{name}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ManageProducts')}>
  <Text style={styles.menuText}>จัดการสินค้า</Text>
</TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText} onPress={() => navigation.navigate('AddProduct')}>เพิ่มสินค้า</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('OrderHistory')}>
            <Text style={styles.menuText}>ประวัติการสั่งซื้อ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Order')}>
            <Text style={styles.menuText}>ติดตามสินค้าซื้อ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SellerOrderManagement')}>
            <Text style={styles.menuText}>ติดตามสินค้าขาย</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>แก้ไขโปรไฟล์</Text>
            <TouchableOpacity onPress={handleImagePick} style={styles.modalImageContainer}>
              <Image source={photo ? { uri: photo } : require('@assets/images/profile.png')} style={styles.modalImage} />
              <Text style={styles.modalChangePhotoText}>เปลี่ยนรูป</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter new name"
              value={newName}
              onChangeText={setNewName}
            />
            {uploading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Button title="Save" onPress={handleSave} />
            )}
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#D1A3FF',
  },
  logo: {
    width: 100,
    height: 40,
  },
  cartIcon: {
    width: 30,
    height: 30,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#D7A3FF',
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    marginTop: 10,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  modalChangePhotoText: {
    color: '#D7A3FF',
    fontSize: 16,
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});
