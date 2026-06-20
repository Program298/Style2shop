import React from 'react';
import { Text, View, StyleSheet, FlatList, Image,RefreshControl } from 'react-native';

export default function OrderDetails({ route }) { // กำหนดคอมโพเนนต์ OrderDetails
    // รับพารามิเตอร์ order จาก route
  const { order } = route.params;

  // การเรนเดอร์คอมโพเนนต์
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order ID: {order.id}</Text>
      <Text style={styles.status}>สถานะ: {order.status}</Text>
      <Text style={styles.status}>ที่อยู่: {order.address}</Text>
      <Text style={styles.status}>อีเมล์: {order.email}</Text>
      <Text style={styles.status}>เบอร์มือถือ: {order.phone}</Text>
      <Text style={styles.status}>วิธีชำระเงิน: {order.paymentMethod}</Text>
      <Text style={styles.date}>
        วันที่: {order.timestamp ? new Date(order.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
      </Text>
      <FlatList
        data={order.items}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Image source={{ uri: item.productImage }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.productTitle}</Text>
              <Text style={styles.itemPrice}>{item.productPrice} บาท</Text>
            </View>
          </View>
        )}
        keyExtractor={item => item.productId}
      />
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
    marginBottom: 10,
  },
  status: {
    fontSize: 20,
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
  },
});
