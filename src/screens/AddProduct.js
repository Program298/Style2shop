import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Image, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

export default function AddProduct() {
  const [photo, setPhoto] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState(""); // Add a state for uid
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [condition, setCondition] = useState("");
  const [defectCount, setDefectCount] = useState(0);
  const [defectPhotos, setDefectPhotos] = useState([]);
  const [defectDetails, setDefectDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid); // Use user.uid instead of user.email
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username);
          setEmail(user.email);
          setUid(user.uid); // Set the uid
          console.log(`User document for ${user.email}: `, userData);
        } else {
          Alert.alert('Error', 'ไม่เจอบัญชี');
        }
      } else {
        Alert.alert('User not logged in');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      const imageUri = selectedAsset.uri;
      const imageName = imageUri.substring(imageUri.lastIndexOf('/') + 1);

      try {
        setLoading(true);
        const storageRef = ref(storage, 'productImages/' + imageName);
        const img = await fetch(imageUri);
        const bytes = await img.blob();

        await uploadBytes(storageRef, bytes);
        const imageURL = await getDownloadURL(storageRef);
        setPhoto(imageURL);
        Alert.alert('สำเร็จ', 'อัพโหลดรูปสำเร็จ');
      } catch (error) {
        console.error('Error uploading image: ', error);
        Alert.alert('Error', 'Error uploading image.');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Error', 'No image selected or image URI is undefined.');
    }
  };

  const handleDefectImagePick = async (index) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      const imageUri = selectedAsset.uri;
      const imageName = imageUri.substring(imageUri.lastIndexOf('/') + 1);

      try {
        setLoading(true);
        const storageRef = ref(storage, 'defectImages/' + imageName);
        const img = await fetch(imageUri);
        const bytes = await img.blob();

        await uploadBytes(storageRef, bytes);
        const imageURL = await getDownloadURL(storageRef);
        const updatedDefectPhotos = [...defectPhotos];
        updatedDefectPhotos[index] = imageURL;
        setDefectPhotos(updatedDefectPhotos);
        Alert.alert('สำเร็จ', 'อัพโหลดสำเร็จ');
      } catch (error) {
        console.error('Error uploading defect image: ', error);
        Alert.alert('Error', 'Error uploading defect image.');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Error', 'ไม่เจอURLของรูปในฐานข้อมูล');
    }
  };

  const handleDefectDetailChange = (text, index) => {
    const updatedDefectDetails = [...defectDetails];
    updatedDefectDetails[index] = text;
    setDefectDetails(updatedDefectDetails);
  };


  ///Data create
  const addProduct = async () => {
    if (!title || !details || !type || !price || !photo || (condition === "มีตำหนิ" && (defectPhotos.length < defectCount || defectDetails.length < defectCount))) {
      Alert.alert('Error', 'Please fill in all fields and add a photo.');
      return;
    }

    try {
      setLoading(true);
      const productRef = collection(db, 'Product');
      await addDoc(productRef, {
        title,
        details,
        type,
        price,
        imgUrl: photo,
        user: username,
        userEmail: email,
        uid, // Include the uid
        condition,
        defectPhotos,
        defectDetails,
        timestamp: serverTimestamp(),
      });
      Alert.alert('สำเร็จ', 'เพิ่มสินค้าสำเร็จ');
      console.log('title:', title, 'details:', details, 'type:', type, 'price:', price, 'photo:', photo, 'username:', username, 'email:', email, 'condition:', condition, 'defectPhotos:', defectPhotos, 'defectDetails:', defectDetails, 'uid:', uid);
      navigation.goBack();
    } catch (error) {
      console.error('Error adding product: ', error);
      Alert.alert('Error', 'Error adding product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.header}>เพิ่มสินค้า</Text>
        <View style={styles.form}>
          <TouchableOpacity style={styles.ProductImageContainer} onPress={handleImagePick}>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : photo ? (
              <Image source={{ uri: photo }} style={styles.img} />
            ) : (
              <Text style={styles.test}>เพิ่มรูปสินค้า</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>ชื่อสินค้า</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder=""
          />
          <Text style={styles.label}>รายละเอียด</Text>
          <TextInput
            style={styles.input}
            value={details}
            onChangeText={setDetails}
            placeholder=""
          />
          <Text style={styles.label}>ประเภท</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => setType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="ผู้ชาย" value="ผู้ชาย" />
              <Picker.Item label="ผู้หญิง" value="ผู้หญิง" />
              <Picker.Item label="เด็ก" value="เด็ก" />
              {/* Add more Picker.Item as needed */}
            </Picker>
          </View>
          <Text style={styles.label}>ราคา</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder=""
            keyboardType="numeric"
          />
          <Text style={styles.label}>สภาพสินค้า</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={condition}
              onValueChange={(itemValue) => setCondition(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="สภาพดี" value="สภาพดี" />
              <Picker.Item label="มีตำหนิ" value="มีตำหนิ" />
            </Picker>
          </View>
          {condition === "มีตำหนิ" && (
            <>
              <Text style={styles.label}>จำนวนตำหนิ</Text>
              <TextInput
                style={styles.input}
                value={defectCount}
                onChangeText={(text) => setDefectCount(Number(text))}
                placeholder=""
                keyboardType="numeric"
              />
              {Array.from({ length: Math.min(defectCount, 5) }).map((_, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.ProductImageContainer}
                    onPress={() => handleDefectImagePick(index)}
                  >
                    {loading ? (
                      <ActivityIndicator size="large" color="#0000ff" />
                    ) : defectPhotos[index] ? (
                      <Image source={{ uri: defectPhotos[index] }} style={styles.img} />
                    ) : (
                      <Text style={styles.test}>เพิ่มรูปตำหนิ {index + 1}</Text>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.label}>รายละเอียดตำหนิ {index + 1}</Text>
                  <TextInput
                    style={styles.input}
                    value={defectDetails[index] || ''}
                    onChangeText={(text) => handleDefectDetailChange(text, index)}
                    placeholder=""
                  />
                </View>
              ))}
            </>
          )}
          <TouchableOpacity style={styles.button} onPress={addProduct} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>บันทึก</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    textAlign: 'center',
    fontSize: 30,
    marginVertical: 10,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ProductImageContainer: {
    marginTop: 10,
    width: 300,
    height: 300,
    borderRadius: 10,
    backgroundColor: '#dcdcdc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  img: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
  },
  label: {
    fontSize: 18,
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  test: {
    textAlign: 'center',
    fontSize: 20,
  },
});
