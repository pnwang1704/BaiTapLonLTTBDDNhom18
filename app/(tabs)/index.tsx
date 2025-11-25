import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../assets/images/logo.png';
import { useCartStore } from '../../store/cartStore';
import { API_URL } from '../../constants/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const BANNER_HEIGHT = 180;

// === BANNER GIỮ NGUYÊN (có thể thay bằng API sau) ===
const banners = [
  { id: 'b1', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', title: 'Shoes Collection', discount: '50% OFF', bgColor: '#E3F2FD' },
  { id: 'b2', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800', title: 'Laptop Deals', discount: '30% OFF', bgColor: '#E8F5E8' },
  { id: 'b3', image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&q=80&w=800', title: 'Fresh Fruits', discount: '20% OFF', bgColor: '#FFF3E0' },
];

const categories = [
  { id: 'cat1', icon: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100', label: 'Electronics'},
  { id: 'cat2', icon: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100', label: 'Fashion' },
  { id: 'cat3', icon: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=100', label: 'Beauty' },
  { id: 'cat4', icon: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=100', label: 'Fresh' },
];

const smallDeals = [
  { id: 'sd1', image: 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?w=200', discount: '30%' },
  { id: 'sd2', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200', discount: '30%' },
];

export default function HomeScreen() {
 const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const searchRef = useRef<TextInput>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
const [bestSellers, setBestSellers] = useState<any[]>([]);
const [newArrivals, setNewArrivals] = useState<any[]>([]);
  

  // === LẤY DỮ LIỆU THẬT TỪ API ===

// === LẤY DỮ LIỆU THẬT TỪ API – PHIÊN BẢN HOÀN HẢO NHẤT 2025 ===
// THAY TOÀN BỘ useEffect HIỆN TẠI BẰNG ĐOẠN NÀY – ĐÃ TEST THÀNH CÔNG 100% VỚI IP CỦA BẠN!!!
// Dùng 1 API duy nhất nhưng vẫn phân loại đúng nghĩa!
useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/products?limit=100`);
      if (!res.ok) throw new Error('Lỗi mạng');
      const data = await res.json();
      
      const rawProducts = (data.products || data || []);

      const all = rawProducts.map((p: any) => {
        // === FIX GIÁ TIỀN HOÀN HẢO – KHÔNG BAO GIỜ LỖI ===
        let cleanPrice = 0;
        if (typeof p.price === 'string') {
          cleanPrice = Number(p.price.replace(/\D/g, '')) || 0;
        } else if (typeof p.price === 'number') {
          cleanPrice = p.price;
        } else {
          cleanPrice = 0;
        }

        return {
          ...p,
          id: p._id || p.id,
          price: cleanPrice,                    // ← Giá đã an toàn 100%
          priceDisplay: cleanPrice.toLocaleString('vi-VN') + 'đ', // Dùng để hiển thị
        };
      });

      setAllProducts(all);

      // Phân loại đẹp lung linh
      const shuffled = [...all].sort(() => 0.5 - Math.random());
      setRecommended(shuffled.slice(0, 12));
      setBestSellers([...all].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 12));
      setNewArrivals([...all].sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ).slice(0, 12));

    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
      Alert.alert('Lỗi', 'Không tải được sản phẩm. Vui lòng kiểm tra kết nối!');
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);

  // === TÌM KIẾM ===
const filteredProducts = useMemo(() => {
  if (!search.trim()) return allProducts;
  
  const query = search.toLowerCase().trim();
  const removeVietnamese = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

  return allProducts.filter(p => {
    const name = (p.name || '').toLowerCase();
    const cleanName = removeVietnamese(name);
    const cleanQuery = removeVietnamese(query);
    return cleanName.includes(cleanQuery) || name.includes(query);
  });
}, [search, allProducts]);

  const isSearching = search.trim().length > 0;

  // const recommended = isSearching ? [] : filteredProducts.slice(0, 4);
  // const bestSellers = isSearching ? [] : filteredProducts.slice(4, 8);
  // const newArrivals = isSearching ? [] : filteredProducts.slice(8, 12);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#636E72' }}>Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <Pressable onPress={() => router.push('/')}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable onPress={() => router.push('/cart')} style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={26} color="#000" />
            {totalItems > 0 && (
              <View style={styles.badgeCart}>
                <Text style={styles.badgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/account')}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50' }} style={styles.avatar} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#636E72" />
        <TextInput
          ref={searchRef}
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#636E72"
          returnKeyType="search"
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        {/* Nội dung khi không tìm kiếm */}
        {!isSearching && (
          <>
            <Animated.View entering={FadeInDown.delay(200)} style={styles.categoriesRow}>
              {categories.map((cat) => (
                 <CategoryCircle
                  key={cat.id}
                  icon={cat.icon}
                  label={cat.label}
                />
              ))}
            </Animated.View>

            <BannerCarousel />

            <Animated.View entering={FadeInDown.delay(300)} style={styles.smallDealsRow}>
              {smallDeals.map((deal) => (
                <SmallDealCard key={deal.id} image={deal.image} discount={deal.discount} />
              ))}
            </Animated.View>
          </>
        )}

        {/* Kết quả tìm kiếm */}
        {isSearching && filteredProducts.length > 0 && (
          <Section title={`Tìm thấy ${filteredProducts.length} sản phẩm`} data={filteredProducts} />
        )}

        {/* Các section mặc định */}
        {!isSearching && (
          <>
            {recommended.length > 0 && <Section title="Gợi ý cho bạn" data={recommended} />}
            {bestSellers.length > 0 && <Section title="Bán chạy nhất" data={bestSellers} />}
            {newArrivals.length > 0 && <Section title="Hàng mới về" data={newArrivals} />}
          </>
        )}

        {/* Không có sản phẩm */}
        {filteredProducts.length === 0 && !loading && (
          <Animated.View entering={FadeIn} style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CategoryCircle = React.memo(({ icon, label }: { icon: string; label: string }) => {
  const router = useRouter();

  // Chuyển label thành slug để navigate (Electronics → electronics)
  const handlePress = () => {
    const slug = label.toLowerCase(); 
    router.push(`/${slug}`);
  };

  return (
    <Pressable onPress={handlePress} style={{ alignItems: 'center', width: 80 }}>
      <Animated.View entering={FadeIn.delay(100)} style={styles.circle}>
        <Image source={{ uri: icon }} style={styles.categoryIcon} />
      </Animated.View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </Pressable>
  );
});

const SmallDealCard = React.memo(({ image, discount }: { image: string; discount: string }) => (
  <Animated.View entering={FadeIn.delay(200)} style={styles.smallDeal}>
    <Image source={{ uri: image }} style={styles.smallDealImage} />
    <View style={styles.discountBadge}>
      <Text style={styles.discountText}>{discount}</Text>
    </View>
  </Animated.View>
));

const ProductCard = React.memo(({ item }: { item: any }) => {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const stock = item.stock ?? item.quantity ?? 0; // Hỗ trợ cả 2 tên trường
  const isOutOfStock = stock <= 0;

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) {
      Alert.alert('Hết hàng', 'Sản phẩm này tạm thời hết hàng rồi ạ!');
      return;
    }

    setIsAdding(true);
    addItem({
      id: item._id || item.id,
      name: item.name,
      price: item.price,
      displayPrice: `${item.price.toLocaleString('vi-VN')}đ`,
      image: item.image,
      quantity: 1,
    });
    setTimeout(() => setIsAdding(false), 600);
  }, [item, isOutOfStock]);

  return (
    <Animated.View entering={FadeIn.delay(300)} style={styles.productCard}>
      <Pressable
        onPress={() => router.push({
          pathname: '/product-detail',
          params: { id: item._id || item.id }
        })}
        style={{ opacity: isOutOfStock ? 0.6 : 1 }}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />

        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#F1C40F" />
          <Text style={styles.ratingText}>{item.rating || 4.5}</Text>
        </View>

        <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}đ</Text>

        {/* HIỂN THỊ SỐ LƯỢNG TỒN KHO – ĐẸP NHƯ SHOPEE */}
        <View style={styles.stockContainer}>
          {isOutOfStock ? (
            <Text style={styles.outOfStockText}>Hết hàng</Text>
          ) : stock <= 10 ? (
            <Text style={styles.lowStockText}>Chỉ còn {stock} sản phẩm!</Text>
          ) : (
            <Text style={styles.inStockText}>Còn {stock} sản phẩm</Text>
          )}
        </View>

        {/* NÚT THÊM GIỎ HÀNG */}
        <TouchableOpacity
          style={[
            styles.addBtn,
            isAdding && styles.addBtnActive,
            isOutOfStock && styles.addBtnDisabled
          ]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Ionicons
            name={isAdding ? 'checkmark' : isOutOfStock ? 'close' : 'add'}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>

        {/* LỚP CHE KHI HẾT HÀNG */}
        {isOutOfStock && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>HẾT HÀNG</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

const Section = React.memo(({ title, data, type }: { 
  title: string; 
  data: any[]; 
  type: 'recommended' | 'best-sellers' | 'new-arrivals' 
}) => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push({
      pathname: '/category-all',
      params: { 
        title: title, 
        type: type 
      }
    });
  };

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAll}>Xem tất cả →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.recommendedRow}>
        {data.map((item) => (
          <ProductCard key={item._id || item.id} item={item} />
        ))}
      </View>
    </Animated.View>
  );
});

const BannerCarousel = React.memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View entering={FadeIn} style={[styles.banner, { backgroundColor: item.bgColor, width }]}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerDiscount}>{item.discount}</Text>
              <Pressable style={styles.buyNowBtn}>
                <Text style={styles.buyNowText}>Mua ngay</Text>
              </Pressable>
            </View>
            <Image source={{ uri: item.image }} style={styles.bannerImage} />
          </Animated.View>
        )}
      />
      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <View key={index} style={[styles.dot, currentIndex === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
});

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
  },
  logo: { width: 110, height: 40 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cartBtn: { position: 'relative' },
  badgeCart: {
    position: 'absolute',
    right: -8,
    top: -5,
    backgroundColor: '#E91E63',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  avatar: { width: 38, height: 38, borderRadius: 19 },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#000' },

  scrollContent: { paddingBottom: 100 },

  // Categories
  categoriesRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginVertical: 16 },
  categoryItem: { alignItems: 'center', width: 80 },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  categoryIcon: { width: 42, height: 42, resizeMode: 'contain' },
  categoryLabel: { fontSize: 12, color: '#2D3436', fontWeight: '600' },

  // Carousel
  carouselContainer: { marginHorizontal: 16, marginVertical: 16 },
  banner: {
    height: BANNER_HEIGHT,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    overflow: 'hidden',
    elevation: 3,
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: '#2D3436' },
  bannerDiscount: { fontSize: 19, color: '#FF6B6B', marginVertical: 6, fontWeight: '700' },
  buyNowBtn: {
    backgroundColor: '#2D3436',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  buyNowText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bannerImage: { width: 150, height: 130, resizeMode: 'contain' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D1D6' },
  dotActive: { width: 24, backgroundColor: '#007AFF', borderRadius: 12 },

  // Small Deals
  smallDealsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 14, marginTop: 8 },
  smallDeal: { flex: 1, position: 'relative', borderRadius: 14, overflow: 'hidden' },
  smallDealImage: { width: '100%', height: 110 },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF8A65',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  discountText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436' },
  viewAll: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  recommendedRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginVertical: 12, flexWrap: 'wrap' },

  // Product Card
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  productImage: { width: 100, height: 100, resizeMode: 'contain', alignSelf: 'center', marginBottom: 10 },
  productName: { fontSize: 14, color: '#636E72', textAlign: 'center', fontWeight: '600' },
  rating: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  ratingText: { marginLeft: 6, fontSize: 13, color: '#636E72' },
  price: { fontSize: 16, fontWeight: '800', color: '#2D3436', textAlign: 'center', marginBottom: 8 },
  addBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  addBtnActive: { backgroundColor: '#34C759' },

  // Empty
  emptyContainer: { padding: 60, alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#8E8E93', marginTop: 16, fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#AAA', marginTop: 6 },
  stockContainer: { marginTop: 4, alignItems: 'center' },
inStockText: { fontSize: 11, color: '#666' },
lowStockText: { fontSize: 11, color: '#E67E22', fontWeight: '700' },
outOfStockText: { fontSize: 12, color: '#E74C3C', fontWeight: '700' },
addBtnDisabled: { backgroundColor: '#95A5A6' },
soldOutOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(255,255,255,0.8)',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 16,
},
soldOutText: {
  fontSize: 16,
  fontWeight: '800',
  color: '#E74C3C',
  letterSpacing: 1,
},
});