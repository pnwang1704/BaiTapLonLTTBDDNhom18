import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "../store/cartStore";

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";

// === COMPONENT PHỤ ===
function ReviewItem({ item }: { item: any }) {
  return (
    <View style={styles.reviewItem}>
      <Image source={{ uri: item.avatar }} style={styles.reviewAvatar} />
      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewName}>{item.name}</Text>
          <Text style={styles.reviewTime}>{item.time}</Text>
        </View>
        <Text style={styles.reviewText}>{item.text}</Text>
      </View>
    </View>
  );
}

function RelatedProduct({ item }: { item: any }) {
  return (
    <View style={styles.relatedCard}>
      <Image source={{ uri: item.image }} style={styles.relatedImage} />
      <Text style={styles.relatedName}>{item.name}</Text>
      <View style={styles.rating}>
        <Ionicons name="star" size={14} color="#F1C40F" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      <Text style={styles.price}>{item.price}</Text>
    </View>
  );
}

// === MÀN HÌNH CHÍNH ===
export default function ProductDetailScreen() {
  const { id, name, price, rating, image } = useLocalSearchParams();
  const router = useRouter();

  // 🛒 Lấy hàm và danh sách giỏ hàng
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items || []);
  const cartCount = cartItems.length;

  const productName = name || "Headphone";
  const productPrice = price || "$59";
  const productRating = rating ? parseFloat(rating as string) : 4.5;
  const productImage = image || DEFAULT_IMG;

  const reviews = [
    {
      id: "1",
      name: "Nguyễn Nam",
      time: "A day ago",
      text: "Chất lượng sản phẩm tốt!",
      avatar: "https://i.pravatar.cc/50?img=1",
    },
    {
      id: "2",
      name: "Lê Nam",
      time: "3 days ago",
      text: "Shop uy tín, giao hàng nhanh chóng!",
      avatar: "https://i.pravatar.cc/50?img=2",
    },
    {
      id: "3",
      name: "Trần Vy",
      time: "A week ago",
      text: "Âm thanh hay, pin trâu, rất đáng tiền.",
      avatar: "https://i.pravatar.cc/50?img=3",
    },
  ];

  const handleAddToCart = () => {
    addItem({
      id: id as string,
      name: name as string,
      price: price as string,
      image: image as string,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{productName}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => router.push("/cart")}
          >
            <Ionicons name="cart-outline" size={26} color="#000" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50",
            }}
            style={styles.avatar}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: productImage }} style={styles.mainImage} />
          <View style={styles.thumbRow}>
            {[productImage, productImage, productImage].map((img, i) => (
              <View
                key={i}
                style={[styles.thumb, i === 0 && styles.activeThumb]}
              >
                <Image source={{ uri: img }} style={styles.thumbImage} />
              </View>
            ))}
          </View>
        </View>

        {/* Price + Rating */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{productPrice}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#F1C40F" />
            <Text style={styles.ratingValue}>{productRating}</Text>
            <Text style={styles.reviewCount}>(99 reviews)</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            High-quality wireless headphone with noise cancellation, long
            battery life, and premium sound.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <MaterialIcons name="local-shipping" size={20} color="#007AFF" />
            <Text style={styles.featureText}>Express</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <Text style={styles.featureText}>30-day free return</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="star" size={20} color="#007AFF" />
            <Text style={styles.featureText}>Good review</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
            <Text style={styles.featureText}>Authorized shop</Text>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingBar}>
            <Text style={styles.ratingBig}>{productRating}/5</Text>
            <Text style={styles.reviewCount}>(99 reviews)</Text>
          </View>

          {reviews.map((item) => (
            <ReviewItem key={item.id} item={item} />
          ))}
        </View>

        {/* Related Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Relevant products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={[
              {
                id: "1",
                image: productImage,
                name: productName,
                price: productPrice,
                rating: productRating,
              },
              {
                id: "2",
                image: productImage,
                name: productName,
                price: productPrice,
                rating: productRating,
              },
            ]}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RelatedProduct item={item} />}
            contentContainerStyle={styles.relatedList}
          />
        </View>

        {/* Add to Cart + Buy Now */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Ionicons
              name="cart-outline"
              size={20}
              color="#007AFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => {
              handleAddToCart();
              router.push("/cart");
            }}
          >
            <Ionicons
              name="cart"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buyText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLE ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  cartBtn: { padding: 6, position: "relative" },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  imageContainer: { alignItems: "center", paddingVertical: 16 },
  mainImage: { width: "100%", height: 300, resizeMode: "contain" },
  thumbRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 4,
  },
  activeThumb: { borderColor: "#007AFF" },
  thumbImage: { width: "100%", height: "100%", borderRadius: 8 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  price: { fontSize: 28, fontWeight: "bold", color: "#000" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingValue: { fontSize: 16, fontWeight: "600" },
  reviewCount: { fontSize: 14, color: "#8E8E93" },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: { color: "#007AFF", fontSize: 14 },
  description: { fontSize: 14, color: "#636E72", lineHeight: 20 },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  feature: { flexDirection: "row", alignItems: "center", gap: 6 },
  featureText: { fontSize: 13, color: "#007AFF" },
  ratingBar: { alignItems: "center", marginVertical: 12 },
  ratingBig: { fontSize: 24, fontWeight: "bold" },
  reviewItem: { flexDirection: "row", marginTop: 16 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewContent: { flex: 1, marginLeft: 12 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between" },
  reviewName: { fontWeight: "600" },
  reviewTime: { fontSize: 12, color: "#8E8E93" },
  reviewText: { marginTop: 4, color: "#636E72" },
  relatedList: { paddingVertical: 8 },
  relatedCard: { alignItems: "center", marginRight: 16, width: 120 },
  relatedImage: { width: 80, height: 80, borderRadius: 12, marginBottom: 8 },
  relatedName: { fontSize: 12, color: "#000" },
  rating: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  ratingText: { marginLeft: 4, fontSize: 12, color: "#8E8E93" },
  bottomActions: { flexDirection: "row", paddingHorizontal: 16, marginTop: 24 },
  addToCartButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
  },
  addToCartText: { color: "#007AFF", fontWeight: "600", fontSize: 16 },
  buyButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
  