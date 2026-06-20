// Checkout.js
import React, { useState } from 'react';
import { Text, View, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../config/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import MapModal from './MapModal';
import * as Location from 'expo-location';

export default function Checkout({ route }) {
  const { cartItems } = route.params;
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('เงินสดหรือปลายทาง');
  const [phone, setPhone] = useState('');
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleOrder = async () => {
    if (auth.currentUser) {
      try {
        console.log("Placing order for user:", auth.currentUser.email);

        const orderItems = await Promise.all(cartItems.map(async (item) => {
          const productRef = doc(db, 'Product', item.productId);
          const productDoc = await getDoc(productRef);

          if (productDoc.exists) {
            const productData = productDoc.data();
            const sellerEmail = productData.userEmail || productData.user || 'Unknown Seller';
            console.log(`Product ${item.productTitle} sold by ${sellerEmail}`);

            return {
              ...item,
              sellerEmail: sellerEmail
            };
          } else {
            console.log(`Product ${item.productId} does not exist.`);
            return { ...item, sellerEmail: 'Unknown Seller' };
          }
        }));

      //นำข้อมูลในตะกร้าส่งไปยังออเออร์
        const orderRef = collection(db, 'orders');
        await addDoc(orderRef, {
          userId: auth.currentUser.uid,
          email: auth.currentUser.email,
          items: orderItems,
          address,
          paymentMethod,
          phone,
          status: 'Pending',
          timestamp: new Date()
        });

        // Remove each product from the products collection
        await Promise.all(cartItems.map(async (item) => {
          const productRef = doc(db, 'Product', item.productId);
          await deleteDoc(productRef);
        }));

        
        const userCartRef = doc(db, 'carts', auth.currentUser.uid);
        await updateDoc(userCartRef, { items: [] });

        Alert.alert('สำเร็จ', 'สั่งซื้อ แล้ว!');
        navigation.navigate('Tabnavi'); 
      } catch (error) {
        console.error('Error placing order:', error);
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Error', 'You must be logged in to place an order.');
    }
  };

  const handleLocationSelect = async (location) => {
    const address = await Location.reverseGeocodeAsync(location);
    if (address.length > 0) {
      const { street, city, region, postalCode } = address[0];
      setAddress(`${street}, ${city}, ${region}, ${postalCode}`);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.productImage }} style={styles.itemImage} />
      <Text style={styles.itemTitle}>{item.productTitle}</Text>
      <Text style={styles.itemPrice}>{item.productPrice} บาท</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>รายการสินค้า</Text>
      <View style={styles.list}>
        {cartItems.map((item) => (
          <View key={item.docId + item.productId}>
            {renderItem({ item })}
          </View>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="ที่อยู่"
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity onPress={() => setMapModalVisible(true)} style={styles.mapButton}>
        <Image source={require('@assets/images/map.png')} style={{height:30,width:30}} />
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={paymentMethod}
          onValueChange={(itemValue) => setPaymentMethod(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="เงินสดหรือปลายทาง" value="เงินสดหรือปลายทาง" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="เบอร์มือถือ"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity onPress={handleOrder} style={styles.button}>
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>

      <MapModal
        visible={mapModalVisible}
        onClose={() => setMapModalVisible(false)}
        onLocationSelect={handleLocationSelect}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  mapButton: {
    marginBottom:20,
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pickerContainer: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#D7A3FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  itemTitle: {
    flex: 2,
    fontSize: 16,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});
