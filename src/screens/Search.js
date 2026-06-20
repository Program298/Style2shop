import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, Image, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import Voice from '@react-native-voice/voice';
import * as AV from 'expo-av';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productCollection = collection(db, 'Product');
        const productSnapshot = await getDocs(productCollection);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setFilteredProducts(productList);
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
        setFilteredProducts([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filterProducts = () => {
      const filtered = searchQuery === ''
        ? products
        : products.filter(product =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.details.toLowerCase().includes(searchQuery.toLowerCase())
          );
      setFilteredProducts(filtered);
    };

    const debounceFilter = setTimeout(filterProducts, 300);

    return () => clearTimeout(debounceFilter);
  }, [searchQuery, products]);

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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.textinput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Image source={require('@assets/images/search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.productList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  textinput: {
    height: 40,
    backgroundColor: '#FFFFFF',
    width: '85%',
    borderRadius: 30,
    textAlign: 'center',
    fontSize: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  searchIcon: {
    width: 29,
    height: 29,
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
