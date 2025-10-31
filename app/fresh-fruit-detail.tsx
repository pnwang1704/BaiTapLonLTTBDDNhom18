import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
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

const { width } = Dimensions.get('window');
const THUMB_SIZE = 60;

// === DỮ LIỆU TRÁI CÂY ===
const fruits = [
  {
    id: '1',
    name: 'Pear',
    price: 3,
    image: 'https://plus.unsplash.com/premium_photo-1672976699507-521b6bb1f0cb?auto=format&fit=crop&q=80&w=800',
    description: 'Sweet and juicy pears from the best farms. Rich in fiber and vitamin C.',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Avocado',
    price: 4,
    image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&q=80&w=800',
    description: 'Fresh creamy avocados for your breakfast. High in healthy fats.',
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Cherry',
    price: 10,
    image: 'https://images.unsplash.com/photo-1528821154947-1aa3d1b74941?auto=format&fit=crop&q=80&w=800',
    description: 'Ripe cherries perfect for dessert or snacking. Antioxidant-rich.',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Orange',
    price: 7,
    image: 'https://plus.unsplash.com/premium_photo-1670512181061-e24282f7ee78?auto=format&fit=crop&q=80&w=800',
    description: 'Fresh oranges full of vitamin C. Boost your immune system!',
    rating: 4.6,
  },
];

// === BÌNH LUẬN ===
const reviews = [
  { id: 'rev1', name: 'Anna Smith', time: '1 ngày trước', text: 'Trái cây siêu tươi, ngọt tự nhiên!', avatar: 'https://i.pravatar.cc/50?img=1' },
  { id: 'rev2', name: 'John Doe', time: '2 ngày trước', text: 'Chất lượng tuyệt vời, đáng tiền!', avatar: 'https://i.pravatar.cc/50?img=2' },
  { id: 'rev3', name: 'Sophie Lee', time: '1 tuần trước', text: 'Bơ mềm mịn, ngon tuyệt!', avatar: 'https://i.pravatar.cc/50?img=3' },
];

// === SẢN PHẨM LIÊN QUAN - ĐÃ FIX NaN ===
const mockRelated = (product: any) => {
  const basePrice = parseFloat(product.price.replace('$', '')); // CHUYỂN CHUỖI → SỐ

  return [
    {
      id: `rel-${product.id}-1`,
      name: product.name + ' Combo',
      price: basePrice * 5, // ĐÚNG
      rating: (product.rating - 0.1).toFixed(1),
      image: product.image,
    },
    {
      id: `rel-${product.id}-2`,
      name: 'Fresh ' + product.name,
      price: basePrice * 0.9,
      rating: product.rating,
      image: product.image,
    },
    {
      id: `rel-${product.id}-3`,
      name: 'Gift ' + product.name,
      price: basePrice * 1.5,
      rating: (product.rating + 0.2).toFixed(1),
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=200',
    },
  ];
};

// === COMPONENT PHỤ ===
const ReviewItem = React.memo(({ item }: { item: any }) => (
  <Animated.View entering={FadeInDown.delay(100)} style={styles.reviewItem}>
    <Image source={{ uri: item.avatar }} style={styles.reviewAvatar} />
    <View style={styles.reviewContent}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewName}>{item.name}</Text>
        <Text style={styles.reviewTime}>{item.time}</Text>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  </Animated.View>
));

const RelatedProduct = React.memo(({ item }: { item: any }) => (
  <TouchableOpacity style={styles.relatedCard} activeOpacity={0.9}>
    <Image source={{ uri: item.image }} style={styles.relatedImage} />
    <Text style={styles.relatedName} numberOfLines={1}>{item.name}</Text>
    <View style={styles.rating}>
      <Ionicons name="star" size={14} color="#F1C40F" />
      <Text style={styles.ratingText}>{item.rating}</Text>
    </View>
    <Text style={styles.price}>${item.price}</Text>
  </TouchableOpacity>
));

// === MAIN SCREEN ===
export default function FreshFruitDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addItem, getTotalItems } = useCartStore();

  const product = useMemo(() => {
    const found = fruits.find((f) => f.id === id);
    if (!found) return null;
    return {
      id: found.id,
      name: found.name,
      price: `$${found.price}`,
      rating: found.rating,
      image: found.image,
      description: found.description,
    };
  }, [id]);

  const relatedProducts = useMemo(() => product ? mockRelated(product) : [], [product]);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorTitle}>Không tìm thấy trái cây</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
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
          <Image source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50' }} style={styles.avatar} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image + Thumbs */}
        <Animated.View entering={FadeIn.duration(500)}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.image }} style={styles.mainImage} />
            <View style={styles.thumbRow}>
              {[0, 1, 2].map((i) => (
                <View key={`thumb-${i}`} style={[styles.thumb, i === 0 && styles.activeThumb]}>
                  <Image source={{ uri: product.image }} style={styles.thumbImage} />
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Price + Rating */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#F1C40F" />
              <Text style={styles.ratingValue}>{product.rating}</Text>
              <Text style={styles.reviewCount}>(99 đánh giá)</Text>
            </View>
          </View>
        </Animated.View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <MaterialIcons name="local-shipping" size={20} color="#34C759" />
            <Text style={styles.featureText}>Giao hàng nhanh</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="refresh" size={20} color="#34C759" />
            <Text style={styles.featureText}>Đổi trả 7 ngày</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="leaf" size={20} color="#34C759" />
            <Text style={styles.featureText}>100% Tự nhiên</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color="#34C759" />
            <Text style={styles.featureText}>Nguồn gốc rõ ràng</Text>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingBar}>
            <Text style={styles.ratingBig}>{product.rating}/5</Text>
            <Text style={styles.reviewCount}>(99 đánh giá)</Text>
          </View>

          {reviews.map((item) => (
            <ReviewItem key={item.id} item={item} />
          ))}
        </View>

        {/* Related Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={relatedProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RelatedProduct item={item} />}
            contentContainerStyle={styles.relatedList}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View entering={FadeIn.delay(400)} style={styles.bottomActions}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={20} color="#007AFF" style={{ marginRight: 8 }} />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
          <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buyText}>Mua ngay</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// === STYLES – GIỐNG HỆT product-detail.tsx ===
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
  activeThumb: { borderColor: '#34C759' },
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
  featureText: { fontSize: 13, color: '#34C759' },

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
    backgroundColor: '#34C759', flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, borderRadius: 12,
  },
  buyText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorTitle: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  backBtn: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  backBtnText: { color: '#fff', fontWeight: '600' },
});