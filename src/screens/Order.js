import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet, Image, Button, Alert } from 'react-native';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Order() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (auth.currentUser) {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
      }
    };

    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(orders.filter(order => order.id !== orderId));
      Alert.alert('Success', 'Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      Alert.alert('Error', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderId}>Order ID: {item.id}</Text>
      <Text style={styles.orderStatus}>Status: {item.status}</Text>
      <Text style={styles.orderDate}>Date: {new Date(item.timestamp.seconds * 1000).toLocaleDateString()}</Text>
      {item.items.map((orderItem) => (
        <View style={styles.itemRow} key={orderItem.productId}>
          <Image source={{ uri: orderItem.productImage }} style={styles.itemImage} />
          <Text style={styles.itemTitle}>{orderItem.productTitle}</Text>
          <Text style={styles.itemPrice}>{orderItem.productPrice} บาท</Text>
        </View>
      ))}
      {item.status === 'Completed' && (
        <Button title="Delete" onPress={() => handleDeleteOrder(item.id)} />
      )}
    </View>
  );

  return (
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={<Text style={styles.title}>ติดตามสินค้า</Text>}
    />
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
  list: {
    paddingBottom: 20,
  },
  orderContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 20,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 16,
    color: '#555',
  },
  orderDate: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
