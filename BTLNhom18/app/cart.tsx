import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../store/cartStore';

// HÀM FORMAT GIÁ ĐẸP – DÙNG CHUNG TOÀN APP
const formatPrice = (price: number | string): string => {
  const num = typeof price === "string" 
    ? parseInt(price.replace(/\D/g, ""), 10) || 0 
    : price;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const CartItem = React.memo(({ item, onUpdate, onRemove }: any) => {
  const [quantity, setQuantity] = React.useState(item.quantity || 1);

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      onUpdate(item.id, newQty);
    }
  };

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onUpdate(item.id, newQty);
  };

  return (
    <Animated.View entering={FadeIn} layout={Layout} style={styles.item}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>

        {/* GIÁ ĐẸP NHƯ SHOPEE – DÙ LÀ NUMBER HAY CHUỖI CŨ ĐỀU HIỂN THỊ ĐÚNG */}
        <Text style={styles.price}>
          {item.displayPrice || `${formatPrice(item.price)} VND`}
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleDecrease}
            style={[styles.qtyBtn, quantity <= 1 && styles.disabledBtn]}
            disabled={quantity <= 1}
          >
            <Ionicons name="remove" size={16} color="#fff" />
          </TouchableOpacity>

          <Animated.Text
            entering={FadeIn.springify().mass(0.3)}
            layout={Layout}
            style={styles.quantity}
          >
            {quantity}
          </Animated.Text>

          <TouchableOpacity onPress={handleIncrease} style={styles.qtyBtn}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
});

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();

  const total = useMemo(() => getTotalPrice(), [items]);
  const hasItems = items.length > 0;

  const handleRemove = (id: string) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => removeItem(id) },
      ]
    );
  };

  const handleCheckout = () => {
    Alert.alert(
      'Xác nhận thanh toán',
      `Tổng đơn hàng: ${formatPrice(total)} VND`,
      [
        { text: 'Hủy' },
        {
          text: 'Thanh toán',
          onPress: () => {
            clearCart();
            Alert.alert('Thành công!', 'Đơn hàng đã được thanh toán! Chúng tôi sẽ giao hàng sớm nhất!', [
              { text: 'OK', onPress: () => router.push('/') },
            ]);
          },
        },
      ]
    );
  };

  if (!hasItems) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>Hãy thêm sản phẩm bạn thích!</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/')}>
            <Text style={styles.shopBtnText}>Tiếp tục mua sắm</Text>
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
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({items.length})</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItem item={item} onUpdate={updateQuantity} onRemove={handleRemove} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Footer – Tổng tiền + Thanh toán */}
      <Animated.View entering={FadeIn.delay(300)} style={styles.footer}>
        <View style={styles.summary}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>
            {formatPrice(total)} VND
          </Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Ionicons name="card-outline" size={20} color="#fff" />
          <Text style={styles.checkoutText}>Thanh toán ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
          <Ionicons name="trash-bin-outline" size={18} color="#fff" />
          <Text style={styles.clearText}>Xóa giỏ hàng</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// STYLES – ĐẸP LUNG LINH NHƯ APP TRIỆU USER
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },

  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f0f0f0' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600', color: '#000' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#E11D48', marginVertical: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  qtyBtn: {
    backgroundColor: '#007AFF',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: { backgroundColor: '#ccc' },
  quantity: { fontSize: 17, fontWeight: '600', minWidth: 30, textAlign: 'center', color: '#000' },
  removeBtn: {
    backgroundColor: '#FF3B30',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 15,
  },
  summary: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  totalLabel: { fontSize: 19, fontWeight: '600', color: '#000' },
  totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#E11D48' },

  checkoutBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 8 },
  clearBtn: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  clearText: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 6 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 24, fontWeight: '600', color: '#999', marginTop: 16 },
  emptySubtitle: { fontSize: 16, color: '#aaa', marginTop: 8, marginBottom: 30 },
  shopBtn: { backgroundColor: '#007AFF', paddingHorizontal: 36, paddingVertical: 16, borderRadius: 14 },
  shopBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});