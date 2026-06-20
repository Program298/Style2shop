import React, { useState, useEffect } from 'react';
import { Modal, View, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapModal({ visible, onClose, onLocationSelect }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const handleSelectLocation = () => {
    onLocationSelect({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    onClose();
  };

  const handleFocusCurrentLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true} // แสดงจุดฟ้าบอกตำแหน่งปัจจุบันของผู้ใช้
        >
          {location && (
            <Marker coordinate={region} />
          )}
        </MapView>
      
        <View style={styles.bottomButtons}>
          <Button title="Confirm Location" onPress={handleSelectLocation} />
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  floatingButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    marginTop:80,
    padding: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
