import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

export default function EditProduct() {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;

  const [title, setTitle] = useState(product.title);
  const [details, setDetails] = useState(product.details);
  const [price, setPrice] = useState(product.price);
  const [imgUrl, setImgUrl] = useState(product.imgUrl);
  const [type, setType] = useState(product.type);
  const [condition, setCondition] = useState(product.condition);
  const [defectPhotos, setDefectPhotos] = useState(product.defectPhotos || []);
  const [defectDetails, setDefectDetails] = useState(product.defectDetails || []);
  const [defectCount, setDefectCount] = useState(defectPhotos.length || 0);
  const [loading, setLoading] = useState(false);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
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
        setImgUrl(imageURL);
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
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

  //Data update
  const handleSave = async () => {
    if (!title || !details || !price || !type || !imgUrl || (condition === "มีตำหนิ" && (defectPhotos.length < defectCount || defectDetails.length < defectCount))) {
      Alert.alert('Error', 'Please fill in all fields and add a photo.');
      return;
    }

    try {
      setLoading(true);
      const productRef = doc(db, 'Product', product.id);
      await updateDoc(productRef, {
        title,
        details,
        type,
        price,
        imgUrl,
        condition,
        defectPhotos,
        defectDetails,
      });
      Alert.alert('สำเร็จ', 'อัพเดตสินค้าสำเร็จ');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating product: ', error);
      Alert.alert('Error', 'Error updating product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>แก้ไขสินค้า</Text>
        <TouchableOpacity style={styles.ProductImageContainer} onPress={handleImagePick}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : imgUrl ? (
            <Image source={{ uri: imgUrl }} style={styles.img} />
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
              value={defectCount.toString()}
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
        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>บันทึก</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20, // เพิ่ม paddingBottom เพื่อให้ ScrollView สามารถเลื่อนขึ้นมาเห็นปุ่มได้
  },
  header: {
    textAlign: 'center',
    fontSize: 30,
    marginVertical: 10,
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
