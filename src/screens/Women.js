import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, Image, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';

export default function Man() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productCollection = collection(db, 'Product');
        const q = query(productCollection, where('type', '==', 'ผู้หญิง'));
        const productSnapshot = await getDocs(q);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products: ", error);
        Alert.alert('Error', 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProducts();
      } else {
        setProducts([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderProduct = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ProductDetails', { product: item })}>
      <View style={styles.productCard}>
        <Image source={{ uri: item.imgUrl }} style={styles.productImage} />
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price} บาท</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.productList}
          numColumns={2}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productList: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    margin: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#333',
  },
});

