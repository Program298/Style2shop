import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../config/firebase';
import { collection, query, getDocs, updateDoc, doc, setDoc, getDoc, writeBatch, deleteDoc } from 'firebase/firestore';

export default function SellerOrderManagement() {
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      if (auth.currentUser) {
        const ordersRef = collection(db, 'orders');
        const querySnapshot = await getDocs(ordersRef);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredOrders = fetchedOrders.filter(order => 
          order.items.some(item => item.sellerUID === auth.currentUser.uid)
        );

        setOrders(filteredOrders);
      }
    };

    fetchOrders();
  }, []);

  const moveOrderToHistory = async (orderId, orderData) => {
    try {
      const batch = writeBatch(db);

      // Move order to buyer's order history
      const buyerOrderHistoryRef = doc(db, 'orderHistory', `${orderData.userId}_${orderId}`);
      batch.set(buyerOrderHistoryRef, {
        ...orderData,
        status: 'Completed',
        completedAt: new Date(),
      });

      // Move order to seller's order history
      const sellerOrderHistoryRef = doc(db, 'sellerOrderHistory', `${auth.currentUser.uid}_${orderId}`);
      batch.set(sellerOrderHistoryRef, {
        ...orderData,
        status: 'Completed',
        completedAt: new Date(),
      });

      // Remove order from current orders collection
      const orderRef = doc(db, 'orders', orderId);
      batch.delete(orderRef);

      await batch.commit();

      // Update local state
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error moving order to history:', error);
      Alert.alert('Error', error.message);
    }
  };


  // data update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      const orderData = orderDoc.data();

      if (newStatus === 'Completed') {
        await moveOrderToHistory(orderId, orderData);
      } else {
        await updateDoc(orderRef, { status: newStatus });
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }

      Alert.alert('สำเร็จ', 'สถานะสินค้าถูกอัพเดทแล้ว');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Shipped':
        return 'blue';
      case 'Delivered':
        return 'green';
      case 'Completed':
        return 'grey';
      default:
        return 'black';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { order: item })}>
        <Text style={styles.orderId}>Order ID: {item.id}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>Status: {item.status}</Text>
        <Text style={styles.orderDate}>
          Date: {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
        </Text>
        {item.items.filter(i => i.sellerUID === auth.currentUser.uid).map((orderItem) => (
          <View style={styles.itemRow} key={orderItem.productId}>
            <Image source={{ uri: orderItem.productImage }} style={styles.itemImage} />
            <Text style={styles.itemTitle}>{orderItem.productTitle}</Text>
            <Text style={styles.itemPrice}>{orderItem.productPrice} บาท</Text>
          </View>
        ))}
      </TouchableOpacity>
      <Picker
        selectedValue={item.status}
        onValueChange={(value) => updateOrderStatus(item.id, value)}
        style={styles.picker}
      >
        <Picker.Item label="Pending" value="Pending" />
        <Picker.Item label="Shipped" value="Shipped" />
        <Picker.Item label="Delivered" value="Delivered" />
        <Picker.Item label="Completed" value="Completed" />
      </Picker>
    </View>
  );

  return (
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={<Text style={styles.title}>จัดการคำสั่งซื้อ</Text>}
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
  picker: {
    height: 50,
    width: '100%',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
});
