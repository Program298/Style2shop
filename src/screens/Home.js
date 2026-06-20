import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, StyleSheet, SafeAreaView, Image, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import Swiper from 'react-native-swiper';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();

  const fetchProducts = useCallback(async () => {
    if (!currentUser) {
      setProducts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setLoading(true);
    try {
      const productCollection = collection(db, 'Product');
      const productSnapshot = await getDocs(productCollection);
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching products: ", error);
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!currentUser) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const productCollection = collection(db, 'Product');
    const unsubscribe = onSnapshot(productCollection, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products: ", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [authReady, currentUser]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const renderItem = ({ item }) => (
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
      <FlatList
        data={loading ? [] : products}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={<>
        <Swiper 
          style={styles.wrapper} 
          showsButtons={false} 
          autoplay={true} 
          autoplayTimeout={3}
          showsPagination={false}
        >
          <View style={styles.slide}>
            <Image source={require('@assets/images/000.jpg')} style={styles.sliderImage} />
          </View>
          <View style={styles.slide}>
            <Image source={require('@assets/images/111.jpg')} style={styles.sliderImage} />
          </View>
          <View style={styles.slide}>
            <Image source={require('@assets/images/222.jpg')} style={styles.sliderImage} />
          </View>
        </Swiper>

        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>หมวดหมู่</Text>
          <View style={styles.categories}>
            <TouchableOpacity style={styles.category} onPress={() => navigation.navigate('Man')}>
              <Image source={require('@assets/images/man.jpg')} style={styles.categoryImage} />
              <Text style={styles.categoryText}>ผู้ชาย</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.category} onPress={() => navigation.navigate('Women')}>
              <Image source={require('@assets/images/women.jpg')} style={styles.categoryImage} />
              <Text style={styles.categoryText}>ผู้หญิง</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.category} onPress={() => navigation.navigate('Kids')}>
              <Image source={require('@assets/images/kids.jpg')} style={styles.categoryImage} />
              <Text style={styles.categoryText}>เด็ก</Text>
            </TouchableOpacity>
          </View>
        </View>
        </>}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF',
  },
  tab: {
    flex: 0.55,
    backgroundColor: '#D7A3FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000000',
  },
  logo: {
    width: '20%',
    height: 'auto',
    justifyContent: 'flex-start',
  },
  cart: {
    marginTop: '2%',
    marginRight: '1%',
    width: '15%',
    height: '80%',
    justifyContent: 'flex-end',
  },
  banner: {
    width: '100%',
    height: 200,
  },
  scrollView: {
    flex: 1
  },
  wrapper: {
    height: 200,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  sliderImage: {
    width: width - 20,
    height: 180,
    resizeMode: 'cover',
    borderRadius: 10
  },
  categorySection: {
    padding: 10
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  },
  category: {
    alignItems: 'center'
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#000',
    borderWidth: 1
  },
  categoryText: {
    marginTop: 5,
    fontSize: 16
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
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
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
  recommendedSection: {
    padding: 10
  },
  recommendedTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  recommendedItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  },
  recommendedItem: {
    alignItems: 'center',
    width: 100
  },
  recommendedImage: {
    width: 100,
    height: 100,
    borderRadius: 10
  }
});
