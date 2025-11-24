// beauty.tsx – TÌM KIẾM TỨC THÌ NHƯ TIA CHỚP – KHÔNG CÒN ĐỢI API NỮA!!!
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../store/cartStore';
import { API_URL } from '../constants/api'; // đường dẫn tùy theo file của bạn

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48) / 2;


export default function BeautyScreen() {
  const router = useRouter();
  const { addItem, getTotalItems } = useCartStore();

  const [allProducts, setAllProducts] = useState<any[]>([]); // Tất cả sản phẩm từ API
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');
  const [filterVisible, setFilterVisible] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [loading, setLoading] = useState(true);

  // Gọi API chỉ khi sort thay đổi (không gọi khi search)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/categories/beauty?sort=${sortBy}&limit=100`); // Lấy nhiều hơn để search local
        const data = await res.json();
        setAllProducts(data.products || []);
      } catch (err) {
        console.error('Lỗi load sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sortBy]); // Chỉ gọi lại khi đổi sort

  // TÌM KIẾM SIÊU NHANH TRÊN CLIENT – KHÔNG CẦN ĐỢI API!!!
  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return allProducts;
    const query = searchText.toLowerCase();
    return allProducts.filter((p) =>
      p.name.toLowerCase().includes(query)
    );
  }, [allProducts, searchText]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatSold = (sold: number) => {
    if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k`;
    return sold.toString();
  };

  const handleAddToCart = useCallback((item: any) => {
    const stock = item.stock || 0;
    if (stock <= 0) {
      alert('Sản phẩm đã hết hàng!');
      return;
    }

    addItem({
      id: item._id,
      name: item.name,
      price: Number(item.price),
      displayPrice: `${formatPrice(item.price)} VND`,
      image: item.image,
    });
  }, [addItem]);

  if (loading && allProducts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải sản phẩm làm đẹp...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Làm Đẹp</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color="#000" />
            {getTotalItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
            <Ionicons name={isGridView ? "list" : "grid"} size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar – Gõ là ra liền, mượt như iPhone */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8E8E93" />
        <TextInput
          placeholder="Tìm son, kem dưỡng, nước hoa..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#AAA"
          autoCapitalize="none"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#AAA" style={{ marginRight: 8 }} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sắp xếp theo</Text>
            {[
              { label: 'Giá: Thấp → Cao', value: 'price-asc' },
              { label: 'Giá: Cao → Thấp', value: 'price-desc' },
              { label: 'Bán chạy nhất', value: 'sold-desc' },
              { label: 'Đánh giá cao', value: 'rating-desc' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.modalOption, sortBy === opt.value && styles.modalOptionActive]}
                onPress={() => {
                  setSortBy(opt.value);
                  setFilterVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, sortBy === opt.value && styles.modalOptionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setFilterVisible(false)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {searchText ? `Tìm thấy ${filteredProducts.length} kết quả cho "${searchText}"` : `Tất cả ${allProducts.length} sản phẩm`}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {isGridView ? (
          <View style={styles.gridContainer}>
            {filteredProducts.map((item) => {
              const stock = item.stock || 0;
              const isOutOfStock = stock <= 0;

              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.productItemGrid, isOutOfStock && { opacity: 0.6 }]}
                  onPress={() => router.push(`/product-detail?id=${item._id}`)}
                  disabled={isOutOfStock}
                >
                  <Image source={{ uri: item.image }} style={styles.productImageGrid} />
                  <Text style={styles.productNameGrid} numberOfLines={2}>{item.name}</Text>

                  <View style={styles.infoRow}>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color="#F1C40F" />
                      <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.8'}</Text>
                    </View>
                    <Text style={styles.soldText}>Đã bán {formatSold(item.sold || 0)}</Text>
                  </View>

                  {stock <= 5 && stock > 0 && (
                    <Text style={styles.lowStockText}>Chỉ còn {stock} sp!</Text>
                  )}
                  {isOutOfStock && <Text style={styles.outOfStockText}>Hết hàng</Text>}

                  <Text style={styles.priceGrid}>{formatPrice(item.price)} VND</Text>

                  <TouchableOpacity
                    style={[styles.addBtnGrid, isOutOfStock && styles.addBtnDisabled]}
                    onPress={() => handleAddToCart(item)}
                    disabled={isOutOfStock}
                  >
                    <Ionicons name={isOutOfStock ? "close" : "add"} size={18} color="#fff" />
                  </TouchableOpacity>

                  {isOutOfStock && (
                    <View style={styles.soldOutOverlay}>
                      <Text style={styles.soldOutLabel}>HẾT HÀNG</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {filteredProducts.map((item) => {
              const stock = item.stock || 0;
              const isOutOfStock = stock <= 0;

              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.productItemList, isOutOfStock && { opacity: 0.6 }]}
                  onPress={() => router.push(`/product-detail?id=${item._id}`)}
                >
                  <Image source={{ uri: item.image }} style={styles.productImageList} />
                  <View style={styles.productInfoList}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                    <View style={styles.ratingContainerList}>
                      <Ionicons name="star" size={15} color="#F1C40F" />
                      <Text style={styles.ratingTextList}>{item.rating?.toFixed(1) || '4.8'}</Text>
                      <Text style={styles.soldTextList}>• Đã bán {formatSold(item.sold || 0)}</Text>
                    </View>

                    {stock <= 5 && stock > 0 && (
                      <Text style={styles.lowStockTextList}>Còn lại {stock} sản phẩm</Text>
                    )}
                    {isOutOfStock && <Text style={styles.outOfStockTextList}>Hết hàng</Text>}

                    <Text style={styles.price}>{formatPrice(item.price)} VND</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
                    onPress={() => handleAddToCart(item)}
                    disabled={isOutOfStock}
                  >
                    <Ionicons name={isOutOfStock ? "close" : "add"} size={20} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles giữ nguyên như bản trắng tinh trước đó
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 19, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 12 },
  cartBtn: { position: 'relative' },
  cartBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FF3B30', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  countContainer: { paddingHorizontal: 16, marginVertical: 8 },
  countText: { fontSize: 14, color: '#666', fontWeight: '600' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between' },
  productItemGrid: { width: GRID_ITEM_WIDTH, backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 16, elevation: 3, position: 'relative' },
  productImageGrid: { width: '100%', height: 130, resizeMode: 'contain' },
  productNameGrid: { fontSize: 13.5, marginTop: 8, fontWeight: '600', height: 40 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12.5, fontWeight: '600', color: '#2d3436' },
  soldText: { fontSize: 11.5, color: '#636e72' },
  lowStockText: { fontSize: 11, color: '#E74C3C', fontWeight: '700', marginTop: 2 },
  outOfStockText: { fontSize: 12, color: '#E74C3C', fontWeight: '700', textAlign: 'center', marginTop: 4 },
  priceGrid: { fontSize: 15.5, fontWeight: '700', color: '#000', marginTop: 4 },
  addBtnGrid: { position: 'absolute', top: 8, right: 8, backgroundColor: '#007AFF', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  addBtnDisabled: { backgroundColor: '#95A5A6' },
  soldOutOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  soldOutLabel: { fontSize: 16, fontWeight: '800', color: '#E74C3C' },
  productItemList: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 12, borderRadius: 16, padding: 14, elevation: 2 },
  productImageList: { width: 90, height: 90, resizeMode: 'contain' },
  productInfoList: { flex: 1, justifyContent: 'center', paddingLeft: 12 },
  productName: { fontSize: 15.5, fontWeight: '600' },
  ratingContainerList: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  ratingTextList: { fontSize: 14.5, fontWeight: '600' },
  soldTextList: { fontSize: 13.5, color: '#636e72' },
  lowStockTextList: { fontSize: 13, color: '#E74C3C', fontWeight: '700', marginTop: 4 },
  outOfStockTextList: { fontSize: 14, color: '#E74C3C', fontWeight: '700', marginTop: 4 },
  price: { fontSize: 17, fontWeight: '700', color: '#000', marginTop: 8 },
  addBtn: { backgroundColor: '#007AFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 19, fontWeight: '700', marginBottom: 16 },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalOptionActive: { backgroundColor: '#007AFF11' },
  modalOptionText: { fontSize: 17 },
  modalOptionTextActive: { color: '#007AFF', fontWeight: '600' },
  modalCloseBtn: { backgroundColor: '#FF3B30', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  modalCloseText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});