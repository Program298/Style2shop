import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, Image, StyleSheet, FlatList, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore'; // Ensure getDoc is imported
import { useNavigation } from '@react-navigation/native';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchCartItems = useCallback(async () => {
    if (auth.currentUser) {
      const cartRef = collection(db, 'carts');
      const q = query(cartRef, where('email', '==', auth.currentUser.email));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.flatMap(doc => 
        doc.data().items.map(item => ({ docId: doc.id, ...item }))
      );
      setCartItems(items);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCartItems();
    setRefreshing(false);
  }, [fetchCartItems]);


  ///ลบข้อมูลออกจากตะกร้าละข้อมูลลินค้า
  const removeFromCart = async (docId, productId) => {
    try {
      const userCartRef = doc(db, 'carts', docId);
      const cartSnapshot = await getDoc(userCartRef);

      if (!cartSnapshot.exists()) {
        throw new Error("No document to update");
      }

      const cartData = cartSnapshot.data();
      const updatedItems = cartData.items.filter(item => item.productId !== productId);

      await updateDoc(userCartRef, {
        items: updatedItems
      });

      const updatedCartItems = cartItems.filter(item => !(item.docId === docId && item.productId === productId));
      setCartItems(updatedCartItems);
      Alert.alert('สำเร็จ', 'ลบสินค้าจากตะกร้าแล้ว');
    } catch (error) {
      console.error('Error removing product from cart:', error);
      Alert.alert('Error', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.productImage }} style={styles.itemImage} />
      <Text style={styles.itemTitle}>{item.productTitle}</Text>
      <Text style={styles.itemPrice}>{item.productPrice} บาท</Text>
      <TouchableOpacity onPress={() => removeFromCart(item.docId, item.productId)}>
        <Image source={require('@assets/images/trash-bin.png')} style={styles.image} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>รูปสินค้า</Text>
        <Text style={styles.headerCell}>ชื่อ</Text>
        <Text style={styles.headerCell}>ราคา</Text>
      </View>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.docId + item.productId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <TouchableOpacity onPress={() => navigation.navigate('Checkout', { cartItems })} style={styles.checkoutButton}>
        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    height: 150
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
  image: {
    height: 30,
    width: 30
  },
  checkoutButton: {
    backgroundColor: '#D7A3FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
