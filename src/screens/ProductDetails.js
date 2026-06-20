import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function ProductDetails({ route }) {
  const { product } = route.params;
  const user = auth.currentUser;
  const navigation = useNavigation();
  const [showDefects, setShowDefects] = useState(false);
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerUID, setSellerUID] = useState('');
  const [sellerProfileImage, setSellerProfileImage] = useState('');

  useEffect(() => {
    const fetchProductData = async () => {
      if (product.id) {
        const productRef = doc(db, 'Product', product.id);
        const productDoc = await getDoc(productRef);
        if (productDoc.exists) {
          const productData = productDoc.data();
          setSellerEmail(productData.userEmail || '');
          setSellerUID(productData.uid || '');
        }
      }
    };

    const fetchSellerProfileImage = async () => {
      if (sellerUID) {
        const sellerRef = doc(db, 'users', sellerUID);
        const sellerDoc = await getDoc(sellerRef);
        if (sellerDoc.exists) {
          const sellerData = sellerDoc.data();
          setSellerProfileImage(sellerData.profileImage || '');
        }
      }
    };

    fetchProductData();
    fetchSellerProfileImage();
  }, [product.id, sellerUID]);
//สร้างข้อมูลลงตะกร้า
  const addToCart = async () => {
    if (!sellerUID) {
      Alert.alert('Error', 'Seller UID is undefined.');
      return;
    }

    if (user) {
      try {
        const cartDocRef = doc(db, 'carts', user.uid);
        const cartDocSnap = await getDoc(cartDocRef);

        if (!cartDocSnap.exists()) {
          await setDoc(cartDocRef, {
            userId: user.uid,
            username: user.displayName,
            email: user.email,
            items: []
          });
        }

        await updateDoc(cartDocRef, {
          items: arrayUnion({
            productId: product.id,
            productTitle: product.title,
            productPrice: product.price,
            productImage: product.imgUrl,
            sellerEmail: sellerEmail,
            sellerUID: sellerUID
          })
        });

        Alert.alert('สำเร็จ', 'เพิ่มลงตะกร้าแล้ว');
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Error', 'You must be logged in to add items to the cart.');
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Image source={{ uri: product.imgUrl }} style={styles.productImage} />
        <View style={styles.con}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>{product.price} บาท</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <View style={styles.sellerContainer}>
            <Image source={{ uri: sellerProfileImage }} style={styles.sellerImage} />
            <Text style={styles.sellerUsername}>Seller: {product.user}</Text>
          </View>
        </View>

        <View style={styles.con}>
          <Text style={styles.productTitle}>รายละเอียดสินค้า</Text>
          <Text style={styles.productDetails}>{product.details}</Text>

          {product.condition === 'มีตำหนิ' && (
            <View>
              <TouchableOpacity onPress={() => setShowDefects(!showDefects)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>
                  {showDefects ? 'ซ่อนรายละเอียดตำหนิ' : 'ดูรายละเอียดตำหนิ'}
                </Text>
              </TouchableOpacity>
              {showDefects && (
                <View style={styles.defectsContainer}>
                  {product.defectPhotos && product.defectPhotos.map((photo, index) => (
                    <View key={index} style={styles.defectItem}>
                      <Image source={{ uri: photo }} style={styles.defectImage} />
                      <Text style={styles.defectDescription}>{product.defectDetails[index]}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity onPress={addToCart} style={styles.Buton}>
          <Text style={styles.text}>เพิ่มลงตะกร้า</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  con: {
    borderTopWidth: 1,
    width: '110%',
    padding: 20,
    borderColor: '#989898',
  },
  productImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    color: '#333',
  },
  productDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  productDetails: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  sellerImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  sellerUsername: {
    fontSize: 16,
    color: '#888',
  },
  Buton: {
    backgroundColor: '#D7A3FF',
    height: 60,
    width: '100%',
    borderRadius: 60,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    padding: 15,
  },
  dropdownButton: {
    backgroundColor: '#D7A3FF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  defectsContainer: {
    marginTop: 10,
  },
  defectItem: {
    marginBottom: 10,
  },
  defectImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  defectDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  }
});
