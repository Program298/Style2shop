import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AddProduct from '../src/screens/AddProduct';
import Cart from '../src/screens/Cart';
import Checkout from '../src/screens/Checkout';
import EditProduct from '../src/screens/EditProduct';
import Forgot from '../src/screens/Forgot';
import Kids from '../src/screens/Kids';
import Login from '../src/screens/Login';
import ManageProducts from '../src/screens/ManageProducts';
import Man from '../src/screens/Man';
import Order from '../src/screens/Order';
import OrderDetails from '../src/screens/OrderDetails';
import OrderHistory from '../src/screens/OrderHistory';
import Profile from '../src/screens/Profile';
import ProductDetails from '../src/screens/ProductDetails';
import Register from '../src/screens/Register';
import SellerOrderManagement from '../src/screens/SellerOrderManagement';
import Tabnavi from '../src/screens/Tabnavi';
import Women from '../src/screens/Women';
import '../src/config/firebase';

const Stack = createStackNavigator();

const App = () => {
  return (
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Tabnavi" component={Tabnavi} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="AddProduct" component={AddProduct}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="Forgot" component={Forgot} />
        <Stack.Screen name="Man" component={Man}
          options={{ headerShown: true, title: 'หมวดหมู่ผู้ชาย', headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="Women" component={Women}
          options={{ headerShown: true, title: 'หมวดหมู่ผู้หญิง', headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="Kids" component={Kids}
          options={{ headerShown: true, title: 'หมวดหมู่เด็ก', headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="ProductDetails" component={ProductDetails}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="Checkout" component={Checkout}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="Cart" component={Cart}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="Order" component={Order}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="OrderHistory" component={OrderHistory}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="SellerOrderManagement" component={SellerOrderManagement}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="OrderDetails" component={OrderDetails}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="ManageProducts" component={ManageProducts}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
        <Stack.Screen name="EditProduct" component={EditProduct}
          options={{ headerShown: true, title: false, headerStyle: { backgroundColor: '#D7A3FF' } }}
        />
      </Stack.Navigator>
  );
};

export default App;
