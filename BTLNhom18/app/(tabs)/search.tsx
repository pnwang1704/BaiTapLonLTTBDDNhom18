// app/(tabs)/search.tsx – TRANG TÌM KIẾM SIÊU ĐẸP + SIÊU THÔNG MINH!!!
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { API_URL } from '../../constants/api';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'váy maxi', 'son môi', 'áo thun', 'giày sneaker', 'túi xách'
  ]);
  const inputRef = useRef(null);

  // Tự động focus ô tìm kiếm khi vào tab
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  // Tìm kiếm realtime (gõ là ra)
  // Thay toàn bộ useEffect tìm kiếm bằng đoạn này:
useEffect(() => {
  if (!query.trim()) {
    setResults([]);
    return;
  }

  const debounce = setTimeout(async () => {
    setLoading(true);
    try {
      // Lấy toàn bộ sản phẩm (hoặc limit=500 nếu nhiều quá)
      const res = await fetch(`${API_URL}/api/products?limit=500`);
      const data = await res.json();
      const allProducts = data.products || data || [];

      // === TÌM KIẾM TƯƠNG ĐỐI SIÊU THÔNG MINH ===
      const cleanQuery = query.toLowerCase().trim();

      const filtered = allProducts
        .filter(product => {
          const name = product.name?.toLowerCase() || '';
          const desc = product.description?.toLowerCase() || '';
          const category = product.category?.toLowerCase() || '';

          // Bỏ hết dấu tiếng Việt để tìm chính xác hơn
          const removeVietnamese = (str: string) =>
            str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

          const cleanName = removeVietnamese(name);
          const cleanDesc = removeVietnamese(desc);
          const cleanCategory = removeVietnamese(category);
          const cleanQ = removeVietnamese(cleanQuery);

          // Tìm trong tên, mô tả, danh mục
          return (
            cleanName.includes(cleanQ) ||
            cleanDesc.includes(cleanQ) ||
            cleanCategory.includes(cleanQ) ||
            name.includes(cleanQuery) ||        // giữ lại cả có dấu
            desc.includes(cleanQuery) ||
            category.includes(cleanQuery)
          );
        })
        .slice(0, 20); // chỉ lấy 20 kết quả đầu

      setResults(filtered);
    } catch (err) {
      console.log('Lỗi tìm kiếm:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 350);

  return () => clearTimeout(debounce);
}, [query]);

  const handleSearch = (text) => {
    setQuery(text);
    if (text.trim()) {
      // Lưu vào lịch sử tìm kiếm (chỉ lưu khi bấm enter hoặc chọn sản phẩm)
      if (text.length > 2) {
        setRecentSearches(prev => {
          const filtered = prev.filter(item => item !== text);
          return [text, ...filtered].slice(0, 8);
        });
      }
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 50)}>
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => router.push(`/product-detail?id=${item._id}`)}
      >
        <Image source={{ uri: item.image }} style={styles.resultImage} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.resultPrice}>{formatPrice(item.price)} VND</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    </Animated.View>
  );

  const formatPrice = (price) => {
    const num = typeof price === 'string' ? parseInt(price.replace(/\D/g, '')) : price;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Header tìm kiếm */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              value={query}
              onChangeText={handleSearch}
              returnKeyType="search"
              autoFocus={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Khi chưa gõ gì → hiện lịch sử + gợi ý hot */}
          {!query && (
            <View style={styles.suggestions}>
              <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
              {recentSearches.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.recentItem}
                  onPress={() => setQuery(item)}
                >
                  <Ionicons name="time-outline" size={18} color="#999" />
                  <Text style={styles.recentText}>{item}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Đang hot</Text>
              <View style={styles.hotTags}>
                {['váy hè 2025', 'son 3CE', 'giày thể thao', 'túi tote', 'áo khoác'].map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tag}
                    onPress={() => setQuery(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Khi đang tìm kiếm */}
          {query && (
            <>
              {loading ? (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              ) : results.length > 0 ? (
                <FlatList
                  data={results}
                  keyExtractor={item => item._id}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  contentContainerStyle={{ paddingBottom: 100 }}
                />
              ) : (
                <View style={styles.empty}>
                  <Ionicons name="search-outline" size={60} color="#ddd" />
                  <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
                  <Text style={styles.emptySub}>Thử từ khóa khác nhé!</Text>
                </View>
              )}
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 46,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  
  suggestions: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  recentText: { marginLeft: 12, fontSize: 15, color: '#333' },
  
  hotTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tagText: { fontSize: 14, color: '#333' },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  resultImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '600', color: '#000' },
  resultPrice: { fontSize: 15, color: '#007AFF', marginTop: 4, fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 84 },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, color: '#999', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#bbb', marginTop: 8 },
});