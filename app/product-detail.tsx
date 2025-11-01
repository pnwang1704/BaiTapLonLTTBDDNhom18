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

// === DỮ LIỆU GIẢ LẬP - ĐÃ FIX ID TRÙNG ===
const mockRelated = (product: any) => [
  {
    id: 'rel1', // ID DUY NHẤT
    name: product.name + ' Pro',
    price: product.price.replace('$', '') * 1.2,
    rating: (product.rating + 0.3).toFixed(1),
    image: product.image,
  },
  {
    id: 'rel2',
    name: product.name + ' Lite',
    price: product.price.replace('$', '') * 0.8,
    rating: (product.rating - 0.2).toFixed(1),
    image: product.image,
  },
  {
    id: 'rel3',
    name: 'Phụ kiện ' + product.name,
    price: 29,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200',
  },
];

const reviews = [
  { id: 'rev1', name: 'Nguyễn Nam', time: '1 ngày trước', text: 'Chất lượng sản phẩm tốt, âm thanh rõ!', avatar: 'https://i.pravatar.cc/50?img=1' },
  { id: 'rev2', name: 'Lê Anh', time: '3 ngày trước', text: 'Shop uy tín, giao hàng nhanh!', avatar: 'https://i.pravatar.cc/50?img=2' },
  { id: 'rev3', name: 'Trần Vy', time: '1 tuần trước', text: 'Pin trâu, đáng tiền!', avatar: 'https://i.pravatar.cc/50?img=3' },
];

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
export default function ProductDetailScreen() {
  const { id, name, price, rating, image } = useLocalSearchParams();
  const router = useRouter();
  const { addItem, getTotalItems } = useCartStore();

  const product = useMemo(() => ({
    id: id as string,
    name: (name as string) || 'Headphone',
    price: (price as string) || '$59',
    rating: rating ? parseFloat(rating as string) : 4.5,
    image: (image as string) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  }), [id, name, price, rating, image]);

  // ĐÃ FIX: ID DUY NHẤT, KHÔNG DÍNH ID GỐC
  const relatedProducts = useMemo(() => mockRelated(product), [product]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

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
          <Text style={styles.description}>
            Sản phẩm chất lượng cao với công nghệ hiện đại. Thiết kế tinh tế, phù hợp cho mọi lứa tuổi. 
            Bảo hành chính hãng 12 tháng. Giao hàng toàn quốc.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <MaterialIcons name="local-shipping" size={20} color="#007AFF" />
            <Text style={styles.featureText}>Giao hàng nhanh</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <Text style={styles.featureText}>Đổi trả 30 ngày</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="star" size={20} color="#007AFF" />
            <Text style={styles.featureText}>Đánh giá tốt</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
            <Text style={styles.featureText}>Shop uy tín</Text>
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

        {/* Related Products - ĐÃ FIX KEY TRÙNG */}
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
            keyExtractor={(item) => item.id} // rel1, rel2, rel3 → DUY NHẤT
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
});