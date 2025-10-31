import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, Layout, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../../store/cartStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const BANNER_HEIGHT = 180;

// === IMAGES ===
const IMG = {
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100',
  shoe: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
  lipstick: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=100',
  avocado: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=100',
  redShoe: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300',
  bag: 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?w=200',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200',
  boot: 'https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=100',
  tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100',
  pear: 'https://plus.unsplash.com/premium_photo-1672976699507-521b6bb1f0cb?w=100',
  perfume: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=200',
  apple: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=200',
  tshirt: 'https://plus.unsplash.com/premium_photo-1718913936342-eaafff98834b?auto=format&fit=crop&q=80&w=200',
  laptop2: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
  watch: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=200',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50',
};

// === BANNER DATA ===
const banners = [
  { id: 'b1', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', title: 'Shoes Collection', discount: '50% OFF', bgColor: '#E3F2FD' },
  { id: 'b2', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800', title: 'Laptop Deals', discount: '30% OFF', bgColor: '#E8F5E8' },
  { id: 'b3', image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&q=80&w=800', title: 'Fresh Fruits', discount: '20% OFF', bgColor: '#FFF3E0' },
];

// === DATA WITH UNIQUE ID ===
const categories = [
  { id: 'cat1', icon: IMG.phone, label: 'Electronics', screen: 'electronics' },
  { id: 'cat2', icon: IMG.shoe, label: 'Fashion' },
  { id: 'cat3', icon: IMG.lipstick, label: 'Beauty' },
  { id: 'cat4', icon: IMG.avocado, label: 'Fresh', screen: 'fresh-fruits' },
];

const smallDeals = [
  { id: 'sd1', image: IMG.bag, discount: '30%' },
  { id: 'sd2', image: IMG.laptop, discount: '30%' },
];

// === DỮ LIỆU SẢN PHẨM ===
const allProducts = [
  { id: 'p1', image: IMG.boot, name: 'Shoes', price: 299, rating: 4.5 },
  { id: 'p2', image: IMG.tablet, name: 'Tablet', price: 499, rating: 4.5 },
  { id: 'p3', image: IMG.pear, name: 'Pear', price: 4, rating: 4.0 },
  { id: 'p4', image: IMG.boot, name: 'Classic Shoes', price: 299, rating: 4.5 },
  { id: 'p5', image: IMG.watch, name: 'Smart Watch', price: 199, rating: 4.9 },
  { id: 'p6', image: IMG.tshirt, name: 'T-Shirt', price: 39, rating: 4.7 },
  { id: 'p7', image: IMG.apple, name: 'Apple', price: 3, rating: 4.8 },
  { id: 'p8', image: IMG.perfume, name: 'Perfume', price: 59, rating: 4.6 },
  { id: 'p9', image: IMG.laptop2, name: 'Laptop Pro', price: 899, rating: 4.9 },
  { id: 'p10', image: IMG.shoe, name: 'Running Shoes', price: 129, rating: 4.8 },
  { id: 'p11', image: IMG.bag, name: 'Hand Bag', price: 89, rating: 4.5 },
  { id: 'p12', image: IMG.phone, name: 'Smartphone X', price: 799, rating: 4.9 },
];

// === COMPONENTS ===
const CategoryCircle = React.memo(({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.circle}>
      <Image source={{ uri: icon }} style={styles.categoryIcon} />
    </View>
    <Text style={styles.categoryLabel}>{label}</Text>
  </TouchableOpacity>
));

const SmallDealCard = React.memo(({ image, discount }: { image: string; discount: string }) => (
  <View style={styles.smallDeal}>
    <Image source={{ uri: image }} style={styles.smallDealImage} />
    <View style={styles.discountBadge}>
      <Text style={styles.discountText}>{discount}</Text>
    </View>
  </View>
));

const ProductCard = React.memo(({ item }: { item: any }) => {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    setIsAdding(true);
    addItem({
      id: item.id,
      name: item.name,
      price: `$${item.price}`,
      image: item.image,
      quantity: 1,
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push({
        pathname: '/product-detail',
        params: {
          id: item.id,
          name: item.name,
          price: `$${item.price}`,
          rating: item.rating,
          image: item.image,
        }
      })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <View style={styles.rating}>
        <Ionicons name="star" size={14} color="#F1C40F" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      <Text style={styles.price}>${item.price}</Text>

      <TouchableOpacity
        style={[styles.addBtn, isAdding && styles.addBtnActive]}
        onPress={handleAddToCart}
        activeOpacity={0.8}
      >
        <Animated.View entering={isAdding ? withSpring(1.2) : undefined}>
          <Ionicons name={isAdding ? 'checkmark' : 'add'} size={18} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const Section = React.memo(({ title, data }: { title: string; data: any[] }) => (
  <Animated.View entering={FadeIn.duration(400)} layout={Layout.springify()}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity>
        <Text style={styles.viewAll}>View all</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.recommendedRow}>
      {data.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </View>
  </Animated.View>
));

// === CAROUSEL BANNER - ĐÃ FIX HOÀN TOÀN ===
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
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // ĐÃ XÓA key={item.id} → TRÁNH TRÙNG VỚI FlatList
          <View style={[styles.banner, { backgroundColor: item.bgColor, width }]}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerDiscount}>{item.discount}</Text>
              <TouchableOpacity style={styles.buyNowBtn}>
                <Text style={styles.buyNowText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
            <Image source={{ uri: item.image }} style={styles.bannerImage} />
          </View>
        )}
      />
      <View style={styles.dotsContainer}>
        {banners.map((banner, index) => (
          <View
            key={`dot-${banner.id}`} // DUY NHẤT, KHÔNG TRÙNG
            style={[styles.dot, currentIndex === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
});

// === MAIN SCREEN ===
export default function AllDealsScreen() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const totalItems = useCartStore((state) => state.getTotalItems());

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return allProducts;
    const query = search.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(query));
  }, [search]);

  const isSearching = search.trim().length > 0;

  const recommended = isSearching ? [] : filteredProducts.slice(0, 4);
  const bestSellers = isSearching ? [] : filteredProducts.slice(4, 8);
  const newArrivals = isSearching ? [] : filteredProducts.slice(8, 12);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Deals</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={26} color="#000" />
            {totalItems > 0 && (
              <View style={styles.badgeCart}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Image source={{ uri: IMG.avatar }} style={styles.avatar} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#636E72" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search for product"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#636E72"
        />
        <TouchableOpacity>
          <Ionicons name="options-outline" size={20} color="#636E72" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        {/* Ẩn Banner, Categories, Small Deals khi tìm kiếm */}
        {!isSearching && (
          <>
            {/* Categories */}
            <View style={styles.categoriesRow}>
              {categories.map((cat) => (
                <CategoryCircle
                  key={cat.id}
                  icon={cat.icon}
                  label={cat.label}
                  onPress={() => cat.screen && router.push(`/${cat.screen}`)}
                />
              ))}
            </View>

            {/* Banner Carousel */}
            <BannerCarousel />

            {/* Small Deals */}
            <View style={styles.smallDealsRow}>
              {smallDeals.map((deal) => (
                <SmallDealCard key={deal.id} image={deal.image} discount={deal.discount} />
              ))}
            </View>
          </>
        )}

        {/* Hiển thị Kết quả Tìm kiếm hoặc các Section mặc định */}
        {isSearching && filteredProducts.length > 0 && (
          <Section title={`Results for "${search}" (${filteredProducts.length})`} data={filteredProducts} />
        )}

        {!isSearching && (
          <>
            {recommended.length > 0 && <Section title="Recommended for you" data={recommended} />}
            {bestSellers.length > 0 && <Section title="Best Sellers" data={bestSellers} />}
            {newArrivals.length > 0 && <Section title="New Arrivals" data={newArrivals} />}
          </>
        )}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try searching something else</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#2D3436' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartBtn: { position: 'relative' },
  badgeCart: { position: 'absolute', right: -8, top: -5, backgroundColor: '#E91E63', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 12, borderRadius: 12, paddingHorizontal: 12, elevation: 2 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#000' },
  scrollContent: { paddingBottom: 80 },

  // Categories
  categoriesRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginVertical: 12 },
  categoryItem: { alignItems: 'center', width: 80 },
  circle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryIcon: { width: 40, height: 40, resizeMode: 'contain' },
  categoryLabel: { fontSize: 12, color: '#2D3436' },

  // Carousel
  carouselContainer: { marginHorizontal: 16, marginVertical: 12 },
  banner: { height: BANNER_HEIGHT, borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 16, overflow: 'hidden' },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2D3436' },
  bannerDiscount: { fontSize: 18, color: '#FF6B6B', marginVertical: 4 },
  buyNowBtn: { backgroundColor: '#2D3436', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
  buyNowText: { color: '#fff', fontWeight: '600' },
  bannerImage: { width: 140, height: 120, resizeMode: 'contain' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D1D6' },
  dotActive: { width: 20, backgroundColor: '#007AFF' },

  // Small Deals
  smallDealsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginTop: 8 },
  smallDeal: { flex: 1, position: 'relative' },
  smallDealImage: { width: '100%', height: 100, borderRadius: 12 },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF8A65', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2D3436' },
  viewAll: { color: '#FF6B6B', fontSize: 14 },
  recommendedRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginVertical: 12, flexWrap: 'wrap' },

  // Product Card
  productCard: { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16, elevation: 2, alignItems: 'center', position: 'relative' },
  productImage: { width: 90, height: 90, resizeMode: 'contain', marginBottom: 8 },
  productName: { fontSize: 13, color: '#636E72', textAlign: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  ratingText: { marginLeft: 4, fontSize: 12, color: '#636E72' },
  price: { fontSize: 15, fontWeight: 'bold', color: '#2D3436', marginBottom: 8 },
  addBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#007AFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  addBtnActive: { backgroundColor: '#34C759', transform: [{ scale: 1.1 }] },

  // Empty
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#8E8E93', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#AAA' },
});