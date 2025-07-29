// Enhanced Work Log Android App using React Native
import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [transport, setTransport] = useState('');
  const [expense, setExpense] = useState('');
  const [filter, setFilter] = useState({ location: '', transport: '' });

  const addEntry = () => {
    if (!date || !location || !transport) return;
    const parsedExpense = transport.toLowerCase() === 'car' ? parseFloat(expense) || 0 : 0;
    setEntries(prev => [...prev, {
      key: Date.now().toString(),
      date,
      location,
      transport,
      expense: parsedExpense,
    }]);
    setDate('');
    setLocation('');
    setTransport('');
    setExpense('');
  };

  const filteredEntries = entries.filter(entry => {
    return (
      (!filter.location || entry.location === filter.location) &&
      (!filter.transport || entry.transport === filter.transport)
    );
  });

  const totalExpense = filteredEntries.reduce((sum, e) => sum + e.expense, 0);
  const metroDays = filteredEntries.filter(e => e.transport.toLowerCase() === 'metro').length;

  const exportCSV = async () => {
    const csv = filteredEntries.map(e => `${e.date},${e.location},${e.transport},${e.expense}`).join("\n");
    const fileUri = FileSystem.documentDirectory + 'work_log.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Work Log Tracker</Text>
      <TextInput style={styles.input} placeholder="Date (e.g. 2025-07-29)" value={date} onChangeText={setDate} />
      <TextInput style={styles.input} placeholder="Location (DC or Reston)" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Transport (car or metro)" value={transport} onChangeText={setTransport} />
      {transport.toLowerCase() === 'car' && (
        <TextInput style={styles.input} placeholder="Parking Expense" value={expense} onChangeText={setExpense} keyboardType="numeric" />
      )}
      <Button title="Add Entry" onPress={addEntry} />

      <View style={styles.filterContainer}>
        <TextInput style={styles.input} placeholder="Filter by Location" value={filter.location} onChangeText={loc => setFilter(prev => ({ ...prev, location: loc }))} />
        <TextInput style={styles.input} placeholder="Filter by Transport" value={filter.transport} onChangeText={trans => setFilter(prev => ({ ...prev, transport: trans }))} />
      </View>

      <Text style={styles.summary}>Total Parking Expense: ${totalExpense.toFixed(2)}</Text>
      <Text style={styles.summary}>Metro Days: {metroDays}</Text>

      <FlatList
        data={filteredEntries}
        renderItem={({ item }) => (
          <Text style={styles.entry}>{`${item.date} - ${item.location} - ${item.transport} - $${item.expense.toFixed(2)}`}</Text>
        )}
      />

      <TouchableOpacity onPress={exportCSV} style={styles.exportButton}>
        <Text style={styles.exportText}>Export to CSV</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },
  entry: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  summary: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 5
  },
  filterContainer: {
    marginTop: 10,
    marginBottom: 20
  },
  exportButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5
  },
  exportText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});
