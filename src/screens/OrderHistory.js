import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, FlatList, StyleSheet, Image, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderHistory = useCallback(async () => {
    if (auth.currentUser) {
      const ordersRef = collection(db, 'orderHistory');
      const q = query(ordersRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
    }
  }, []);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrderHistory().then(() => setRefreshing(false));
  }, [fetchOrderHistory]);

    ///ลบข้อมูลประวัติสินค้า
  const deleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orderHistory', orderId));
      setOrders(orders.filter(order => order.id !== orderId));
      Alert.alert('สำเร็จ', 'ลบประวัติการสั่งซื้อ');
    } catch (error) {
      console.error('Error deleting order:', error);
      Alert.alert('Error', 'Failed to delete order');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderId}>Order ID: {item.id}</Text>
      <Text style={styles.orderStatus}>Status: {item.status}</Text>
      <Text style={styles.orderDate}>
        Date: {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
      </Text>
      <Text style={styles.orderAddress}>Address: {item.address}</Text>
      <Text style={styles.orderEmail}>Email: {item.email}</Text>
      <Text style={styles.orderPhone}>Phone: {item.phone}</Text>
      <Text style={styles.orderPaymentMethod}>Payment Method: {item.paymentMethod}</Text>
      {item.items.map((orderItem) => (
        <View style={styles.itemRow} key={orderItem.productId}>
          <Image source={{ uri: orderItem.productImage }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>{orderItem.productTitle}</Text>
            <Text style={styles.itemPrice}>{orderItem.productPrice} บาท</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity onPress={() => deleteOrder(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={<Text style={styles.title}>ประวัติการสั่งซื้อ</Text>}
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
  orderAddress: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  orderEmail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  orderPhone: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  orderPaymentMethod: {
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
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
