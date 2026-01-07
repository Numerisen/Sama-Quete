import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { countries, Country } from '../../../lib/countries';
import { useTheme } from '../../../lib/ThemeContext';

interface CountryPickerProps {
  selectedCountry: Country | null;
  onCountrySelect: (country: Country) => void;
  placeholder?: string;
}

export default function CountryPicker({ selectedCountry, onCountrySelect, placeholder = "Sélectionner un pays" }: CountryPickerProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.picker, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.pickerContent}>
          {selectedCountry ? (
            <>
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={[styles.countryName, { color: colors.text }]}>{selectedCountry.name}</Text>
              <Text style={[styles.phoneCode, { color: colors.textSecondary }]}>{selectedCountry.phoneCode}</Text>
            </>
          ) : (
            <Text style={[styles.placeholder, { color: colors.textSecondary }]}>{placeholder}</Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sélectionner un pays</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher un pays..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  { backgroundColor: colors.card },
                  selectedCountry?.code === item.code && styles.selectedCountryItem
                ]}
                onPress={() => handleCountrySelect(item)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.countryCode, { color: colors.textSecondary }]}>{item.code}</Text>
                </View>
                <Text style={[styles.countryPhoneCode, { color: colors.textSecondary }]}>{item.phoneCode}</Text>
                {selectedCountry?.code === item.code && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            style={styles.countryList}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    marginBottom: 20,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  phoneCode: {
    fontSize: 14,
    marginLeft: 10,
  },
  placeholder: {
    fontSize: 16,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedCountryItem: {
    backgroundColor: '#fef3c7',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  countryInfo: {
    flex: 1,
  },
  countryCode: {
    fontSize: 12,
    marginTop: 2,
  },
  countryPhoneCode: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
});
