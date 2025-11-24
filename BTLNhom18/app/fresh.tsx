// app/fresh.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../store/cartStore';
import { API_URL } from '../constants/api'; // đường dẫn tùy theo file của bạn

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48) / 2;

export default function FreshScreen() {
  const router = useRouter();
  const { addItem, getTotalItems } = useCartStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isGridView, setIsGridView] = useState(true);
  const [sortBy, setSortBy] = useState<'default' | 'price-desc' | 'price-asc'>('default');
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchText);
  }, 750);

  return () => clearTimeout(timer);
}, [searchText]);

  // LẤY DỮ LIỆU THẬT TỪ API
  // CHỈ GỌI API KHI DEBOUNCED SEARCH THAY ĐỔI → SIÊU MƯỢT!!!
useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/categories/fresh?search=${debouncedSearch}&limit=50`);
      const data = await res.json();
      setProducts(data.products || data || []);
    } catch (err) {
      console.error('Lỗi load trái cây:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [debouncedSearch]); 

  // HÀM FORMAT GIÁ ĐẸP NHƯ VIỆT NAM
  const formatPrice = (price: number | string): string => {
    const num = typeof price === 'string' 
      ? parseInt(price.replace(/\D/g, ''), 10) || 0 
      : Number(price) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // THÊM VÀO GIỎ HÀNG – HOÀN HẢO NHƯ CÁC TRANG KHÁC!!!
  const handleAddToCart = (item: any) => {
    const safePrice = Number(item.price) || parseInt(String(item.price).replace(/\D/g, ''), 10) || 0;

    addItem({
      id: item._id,
      name: item.name,
      price: safePrice,
      displayPrice: `${formatPrice(safePrice)} VND`,
      image: item.image,
    });
  };

  // LỌC THEO DANH MỤC
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => 
      p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }, [products, activeCategory]);

  // LỌC + SẮP XẾP THEO GIÁ – SIÊU MƯỢT!!!
const sortedProducts = useMemo(() => {
  let result = [...products];

  // Lọc theo danh mục (nếu có)
  if (activeCategory !== 'All') {
    result = result.filter(p => 
      p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }

  // Sắp xếp theo giá
  if (sortBy === 'price-desc') {
    result.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortBy === 'price-asc') {
    result.sort((a, b) => Number(a.price) - Number(b.price));
  }

  return result;
}, [products, activeCategory, sortBy]);

  // HIỂN THỊ LOADING
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Đang tải trái cây tươi...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Trái Cây Tươi</Text>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={26} color="#000" />
            {getTotalItems() > 0 && (
              <View style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#FF3B30', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
            <Ionicons name={isGridView ? 'list' : 'grid'} size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12 }}>
        <Ionicons name="search" size={18} color="#8E8E93" />
        <TextInput
          placeholder="Tìm kiếm trái cây..."
          style={{ flex: 1, paddingVertical: 12, fontSize: 16 }}
          value={searchText}
          onChangeText={setSearchText}
        />
{/* Loading nhỏ khi đang tìm kiếm – đẹp như Shopee */}
{searchText !== debouncedSearch && (
  <View style={{ position: 'absolute', right: 45, top: 14 }}>
    <ActivityIndicator size="small" color="#007AFF" />
  </View>
)}
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Đếm sản phẩm */}
      <Text style={{ paddingHorizontal: 16, marginVertical: 12, color: '#666' }}>
        Tìm thấy {sortedProducts.length} sản phẩm
      </Text>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={sortedProducts}
        numColumns={isGridView ? 2 : 1}
        key={isGridView ? 'grid' : 'list'}
        keyExtractor={(item) => item._id}
        columnWrapperStyle={isGridView ? { justifyContent: 'space-between', paddingHorizontal: 16 } : null}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              marginBottom: 16,
              marginHorizontal: isGridView ? 0 : 16,
              padding: 12,
              elevation: 3,
              width: isGridView ? GRID_ITEM_WIDTH : '100%',
            }}
            onPress={() => router.push({
              pathname: '/product-detail',
              params: { id: item._id }
            })}
          >
            <Image source={{ uri: item.image }} style={{ width: '100%', height: 140, borderRadius: 12, marginBottom: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>{item.name}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>{formatPrice(item.price)} VND</Text>
            <TouchableOpacity
              style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#007AFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Modal Bộ lọc & Sắp xếp */}
<Modal visible={filterVisible} transparent animationType="slide">
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
    <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Sắp xếp theo giá</Text>
        <TouchableOpacity onPress={() => setFilterVisible(false)}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {[
        { label: 'Mặc định', value: 'default' },
        { label: 'Giá: Cao → Thấp', value: 'price-desc' },
        { label: 'Giá: Thấp → Cao', value: 'price-asc' },
      ].map((option) => (
        <TouchableOpacity
          key={option.value}
          style={{
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onPress={() => {
            setSortBy(option.value as any);
            setFilterVisible(false);
          }}
        >
          <Text style={{ fontSize: 17, color: sortBy === option.value ? '#007AFF' : '#000' }}>
            {option.label}
          </Text>
          {sortBy === option.value && (
            <Ionicons name="checkmark" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: '#FF3B30',
          padding: 16,
          borderRadius: 12,
          alignItems: 'center'
        }}
        onPress={() => {
          setSortBy('default');
          setActiveCategory('All');
          setFilterVisible(false);
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Xóa bộ lọc</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartBtn: { position: 'relative' },
  cartBadge: {
    position: 'absolute', right: -6, top: -6,
    backgroundColor: '#FF3B30', borderRadius: 10,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F2F2F7', marginHorizontal: 16, marginVertical: 12,
    borderRadius: 12, paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#000' },
  countContainer: { paddingHorizontal: 16, marginBottom: 8 },
  countText: { fontSize: 14, color: '#666' },

  // Grid View
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between' },
  productCardGrid: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    position: 'relative',
  },
  productImageGrid: { width: '100%', height: 100, borderRadius: 12, marginBottom: 8 },
  productNameGrid: { fontSize: 14, color: '#000', marginBottom: 4 },
  priceGrid: { fontSize: 16, fontWeight: '600', color: '#000' },
  addBtnGrid: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#007AFF', width: 28, height: 28,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },

  // List View
  productCardList: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 12, elevation: 2, alignItems: 'center',
  },
  productImageList: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  productInfoList: { flex: 1 },
  productNameList: { fontSize: 14, color: '#000', marginBottom: 4 },
  priceList: { fontSize: 16, fontWeight: '600', color: '#000' },
  addBtnList: { backgroundColor: '#007AFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  loadMoreBtn: {
    marginHorizontal: 16, marginVertical: 16,
    backgroundColor: '#007AFF', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  loadMoreText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  banner: { width: '100%', height: 180, marginTop: 20 },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#8E8E93', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#AAA' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '92%',
    height: '92%',
    justifyContent: 'space-between',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#000' },
  modalSubtitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#000' },
  modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalOptionActive: { backgroundColor: '#007AFF11', borderRadius: 8 },
  modalOptionText: { fontSize: 16, color: '#000' },
  modalOptionTextActive: { color: '#007AFF', fontWeight: '600' },
  modalButtonContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalCloseBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});