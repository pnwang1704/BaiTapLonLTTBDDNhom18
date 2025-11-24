// app/product-detail.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../store/cartStore';
import { API_URL } from '../constants/api';

const { width } = Dimensions.get('window');
const THUMB_SIZE = 80;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addItem, getTotalItems } = useCartStore();

  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu sản phẩm + sản phẩm liên quan
 useEffect(() => {
  const fetchProduct = async () => {
    try {
      setLoading(true);

      // BƯỚC 1: Lấy chi tiết sản phẩm trước
      const productRes = await fetch(`${API_URL}/api/products/${id}`);
      const productData = await productRes.json();
      const product = productData.product || productData;
      setProduct(product);

      // BƯỚC 2: Lấy related theo category THẬT của sản phẩm
      const category = product.category || 'electronics'; // fallback an toàn
      const relatedRes = await fetch(`${API_URL}/api/products/related/${category}?exclude=${id}`);
      const relatedData = await relatedRes.json();
      setRelatedProducts(relatedData.products || relatedData || []);

    } catch (err) {
      setError('Không tải được sản phẩm. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchProduct();
}, [id]);

const handleAddToCart = () => {
  if (!product) return;

  const safePrice = Number(product.price) || parseInt(String(product.price).replace(/\D/g, ''), 10) || 0;

  addItem({
    id: product._id,
    name: product.name,
    price: safePrice,
    displayPrice: `${formatPrice(safePrice)} VND`,
    image: product.image,
    
  });
};

  const formatPrice = (price: number | string) => {
  const num = typeof price === "string" ? parseInt(price) : price;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.error}>
          <Text style={styles.errorText}>{error || 'Sản phẩm không tồn tại'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={26} color="#000" />
            {getTotalItems() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(500)}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.image }} style={styles.mainImage} />
            <View style={styles.thumbRow}>
              {[product.image, product.image, product.image].map((img, i) => (
                <View key={i} style={[styles.thumb, i === 0 && styles.activeThumb]}>
                  <Image source={{ uri: img }} style={styles.thumbImage} />
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)} VND</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#F1C40F" />
              <Text style={styles.ratingValue}>{product.rating || 4.8}</Text>
              <Text style={styles.reviewCount}>({product.reviews?.length || 99} đánh giá)</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>
            {product.description || 'Sản phẩm chất lượng cao, chính hãng 100%. Bảo hành 12 tháng. Giao hàng nhanh toàn quốc.'}
          </Text>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <MaterialIcons name="local-shipping" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Giao nhanh 2h</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Chính hãng</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="refresh" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Đổi trả dễ dàng</Text>
          </View>
        </View>

        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
            </View>
            <FlatList
              data={relatedProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.relatedCard}
                  onPress={() => router.push(`/product-detail?id=${item._id}`)}
                >
                  <Image source={{ uri: item.image }} style={styles.relatedImage} />
                  <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.price}>{formatPrice(item.price)} VND</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <Animated.View entering={FadeIn.delay(400)} style={styles.bottomActions}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={22} color="#007AFF" />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
          <Text style={styles.buyText}>Mua ngay</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// === STYLES ===
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000', flex: 1, marginLeft: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartBtn: { position: 'relative' },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#FF3B30', borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  avatar: { width: 36, height: 36, borderRadius: 18 },

  imageContainer: { alignItems: 'center', paddingVertical: 16 },
  mainImage: { width: '100%', height: 300, resizeMode: 'contain' },
  thumbRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  thumb: {
    width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: 12, borderWidth: 2, borderColor: 'transparent',
    padding: 4,
  },
  activeThumb: { borderColor: '#007AFF' },
  thumbImage: { width: '100%', height: '100%', borderRadius: 8 },

  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginTop: 8,
  },
  price: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: { fontSize: 16, fontWeight: '600' },
  reviewCount: { fontSize: 14, color: '#8E8E93' },

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: '#007AFF', fontSize: 14 },

  description: { fontSize: 14, color: '#636E72', lineHeight: 20 },

  featuresRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, marginTop: 16, gap: 12,
  },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { fontSize: 13, color: '#007AFF' },

  ratingBar: { alignItems: 'center', marginVertical: 12 },
  ratingBig: { fontSize: 24, fontWeight: 'bold' },

  reviewItem: { flexDirection: 'row', marginTop: 16 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewContent: { flex: 1, marginLeft: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewName: { fontWeight: '600' },
  reviewTime: { fontSize: 12, color: '#8E8E93' },
  reviewText: { marginTop: 4, color: '#636E72' },

  relatedList: { paddingVertical: 8 },
  relatedCard: { alignItems: 'center', marginRight: 16, width: 120 },
  relatedImage: { width: 80, height: 80, borderRadius: 12, marginBottom: 8 },
  relatedName: { fontSize: 12, color: '#000' },
  rating: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  ratingText: { marginLeft: 4, fontSize: 12, color: '#8E8E93' },

  bottomActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 16,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  addToCartButton: {
    flex: 1, borderWidth: 1, borderColor: '#007AFF',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, borderRadius: 12, marginRight: 8,
  },
  addToCartText: { color: '#007AFF', fontWeight: '600', fontSize: 16 },
  buyButton: {
    backgroundColor: '#007AFF', flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, borderRadius: 12,
  },
  buyText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  error: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: '#FF3B30', textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#fff', fontWeight: '600' },
});