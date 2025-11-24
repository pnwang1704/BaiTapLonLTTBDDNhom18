// app/category-all.tsx – TRANG "XEM TẤT CẢ" SIÊU ĐẸP!!!
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';

export default function CategoryAllScreen() {
  const { title = "Tất cả sản phẩm", type = "all" } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${API_URL}/api/products?limit=100`;
        
        if (type === 'recommended') {
          // Gợi ý = random
          url = `${API_URL}/api/products?limit=100`;
        } else if (type === 'best-sellers') {
          // Bán chạy = sắp xếp theo sold
          url = `${API_URL}/api/products?sort=sold&limit=100`;
        } else if (type === 'new-arrivals') {
          // Mới về = sắp xếp theo createdAt
          url = `${API_URL}/api/products?sort=newest&limit=100`;
        }

        const res = await fetch(url);
        const data = await res.json();
        const list = (data.products || data || []).map((p: any) => ({
          ...p,
          id: p._id,
          priceDisplay: Number(p.price || 0).toLocaleString('vi-VN') + 'đ'
        }));
        setProducts(list);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [type]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product-detail?id=${item._id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.price}>{item.priceDisplay}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  card: {
    width: (Dimensions.get('window').width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { width: '100%', height: 140, borderRadius: 12, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: '600', color: '#333' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#E91E63', marginTop: 4 },
});