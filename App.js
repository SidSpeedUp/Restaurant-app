import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Provider as PaperProvider } from 'react-native-paper';

const Stack = createStackNavigator();

const menuItems = [
  { id: 1, name: 'Aloo Chaat', price: 150, category: 'Starter (Veg)' },
  { id: 2, name: 'Paneer Tikka', price: 250, category: 'Starter (Veg)' },
  { id: 3, name: 'Coffee', price: 10, category: 'Beverage' },
  { id: 4, name: 'Corn', price: 20, category: 'Starter (Veg)' },
  { id: 5, name: 'Crispy Corn', price: 10, category: 'Starter (Veg)' },
  { id: 6, name: 'Chilly Paneer', price: 450, category: 'Main Course' },
];

const categories = ['Starter (Veg)', 'Starter (Non-Veg)', 'Main Course', 'Pizza', 'Dessert', 'Beverage', 'Soups', 'Rum'];

function TableSelection({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Table</Text>
      <FlatList
        data={[...Array(16)]}
        numColumns={2}
        renderItem={({ index }) => (
          <TouchableOpacity
            style={styles.tableButton}
            onPress={() => navigation.navigate('CustomerDetails', { tableNumber: index + 1 })}
          >
            <Text style={styles.tableButtonText}>Table {index + 1}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
}

function CustomerDetails({ route, navigation }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Details for Table {route.params.tableNumber}</Text>
      <TextInput
        label="Name"
        value={customerName}
        onChangeText={setCustomerName}
        style={styles.input}
      />
      <TextInput
        label="Phone"
        value={customerPhone}
        onChangeText={setCustomerPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Menu', { 
          tableNumber: route.params.tableNumber,
          customerName,
          customerPhone
        })}
      >
        Next
      </Button>
    </View>
  );
}

function Menu({ route, navigation }) {
  const [order, setOrder] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const addToOrder = (item) => {
    const existingItem = order.find(orderItem => orderItem.id === item.id);
    if (existingItem) {
      setOrder(order.map(orderItem => 
        orderItem.id === item.id 
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      setOrder([...order, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (itemId) => {
    setOrder(order.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromOrder(itemId);
    } else {
      setOrder(order.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalAmount = () => {
    return order.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const filteredMenuItems = menuItems.filter(item => item.category === selectedCategory);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.categoryButton, selectedCategory === category && styles.selectedCategory]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.categoryButtonText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.subtitle}>Items</Text>
      {filteredMenuItems.map((item) => (
        <View key={item.id} style={styles.menuItem}>
          <View>
            <Text>{item.name}</Text>
            <Text>₹{item.price}</Text>
          </View>
          <Button mode="contained" onPress={() => addToOrder(item)}>Add</Button>
        </View>
      ))}
      <Text style={styles.subtitle}>Your Order</Text>
      {order.map((item) => (
        <View key={item.id} style={styles.orderItem}>
          <Text>{item.name} - ₹{item.price}</Text>
          <View style={styles.quantityControl}>
            <Button mode="contained" onPress={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <Button mode="contained" onPress={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
          </View>
        </View>
      ))}
      <Text style={styles.total}>Total: ₹{getTotalAmount()}</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Bill', { 
          ...route.params,
          order,
          total: getTotalAmount()
        })}
      >
        Place Order
      </Button>
    </ScrollView>
  );
}

function Bill({ route }) {
  const { tableNumber, customerName, customerPhone, order, total } = route.params;
  const tax = total * 0.0525;
  const grandTotal = total + tax;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bill</Text>
      <Text>Table: {tableNumber}</Text>
      <Text>Name: {customerName}</Text>
      <Text>Phone: {customerPhone}</Text>
      {order.map((item, index) => (
        <Text key={index}>{item.name} x{item.quantity}: ₹{item.price * item.quantity}</Text>
      ))}
      <Text style={styles.total}>Subtotal: ₹{total}</Text>
      <Text>Tax (5.25%): ₹{tax.toFixed(2)}</Text>
      <Text style={styles.total}>Total: ₹{grandTotal.toFixed(2)}</Text>
      <Button mode="contained" onPress={() => console.log('Print invoice')}>
        Print Invoice
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  tableButton: {
    flex: 1,
    margin: 5,
    padding: 20,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  categoryButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  selectedCategory: {
    backgroundColor: '#2980b9',
  },
  categoryButtonText: {
    color: 'white',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="TableSelection">
          <Stack.Screen name="TableSelection" component={TableSelection} />
          <Stack.Screen name="CustomerDetails" component={CustomerDetails} />
          <Stack.Screen name="Menu" component={Menu} />
          <Stack.Screen name="Bill" component={Bill} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}