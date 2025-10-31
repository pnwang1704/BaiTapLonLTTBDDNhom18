import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../store/cartStore';

// === SCREEN SIZE ===
const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48) / 2;
const ITEMS_PER_PAGE = 6; // 6 sản phẩm mỗi trang

// === IMAGES ===
const IMG = {
  banner: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800',
  pear: 'https://plus.unsplash.com/premium_photo-1672976699507-521b6bb1f0cb?auto=format&fit=crop&q=80&w=200',
  avocado: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&q=80&w=200',
  cherry: 'https://images.unsplash.com/photo-1528821154947-1aa3d1b74941?auto=format&fit=crop&q=80&w=200',
  orange: 'https://plus.unsplash.com/premium_photo-1724849326552-ff97b4a8ab93?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470',
  peach: 'https://images.unsplash.com/photo-1595124245030-41448b199d6d?auto=format&fit=crop&q=80&w=200',
  pomegranate: 'https://plus.unsplash.com/premium_photo-1668076515507-c5bc223c99a4?auto=format&fit=crop&q=80&w=200',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50',
};

// === DATA ===
const allFruits = [
  { id: '1', name: 'Pear', price: 3, category: 'Tropical', image: IMG.pear, description: 'Sweet and juicy pears from the best farms.' },
  { id: '2', name: 'Avocado', price: 4, category: 'Tropical', image: IMG.avocado, description: 'Fresh creamy avocados for your breakfast.' },
  { id: '3', name: 'Cherry', price: 10, category: 'Berry', image: IMG.cherry, description: 'Ripe cherries perfect for dessert or snacking.' },
  { id: '4', name: 'Orange', price: 7, category: 'Citrus', image: IMG.orange, description: 'Fresh oranges full of vitamin C.' },
  { id: '5', name: 'Peach', price: 15, category: 'Stone Fruit', image: IMG.peach, description: 'Juicy peaches freshly picked from the farm.' },
  { id: '6', name: 'Pomegranate', price: 23, category: 'Berry', image: IMG.pomegranate, description: 'Rich in antioxidants and vitamins.' },
  { id: '7', name: 'Mango', price: 12, category: 'Tropical', image: 'https://plus.unsplash.com/premium_photo-1724255863045-2ad716767715?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687' },
  { id: '8', name: 'Kiwi', price: 6, category: 'Tropical', image: 'https://images.unsplash.com/photo-1573066778058-03dbee2c5a0c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGtpd2l8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500' },
  { id: '9', name: 'Lemon', price: 2, category: 'Citrus', image: 'https://images.unsplash.com/photo-1582287104445-6754664dbdb2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8TGVtb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500' },
  { id: '10', name: 'Strawberry', price: 18, category: 'Berry', image: 'https://plus.unsplash.com/premium_photo-1724256149016-05c013fe058e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3RyYXdiZXJyeXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500' },
  { id: '11', name: 'Apple', price: 5, category: 'Stone Fruit', image: 'https://plus.unsplash.com/premium_photo-1724249990837-f6dfcb7f3eaa?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QXBwbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500' },
  { id: '12', name: 'Banana', price: 8, category: 'Tropical', image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880' },
];

const categories = ['All', 'Tropical', 'Citrus', 'Berry', 'Stone Fruit'];
const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: '$0 - $5', min: 0, max: 5 },
  { label: '$5 - $10', min: 5, max: 10 },
  { label: '$10 - $20', min: 10, max: 20 },
  { label: '$20+', min: 20, max: Infinity },
];

// === COMPONENTS ===
const ProductCardGrid = React.memo(({ item, onAdd, onPress }: { item: any; onAdd: () => void; onPress: () => void }) => (
  <TouchableOpacity style={styles.productCardGrid} onPress={onPress} activeOpacity={0.9}>
    <Image source={{ uri: item.image }} style={styles.productImageGrid} />
    <Text style={styles.productNameGrid} numberOfLines={1}>{item.name}</Text>
    <Text style={styles.priceGrid}>${item.price}</Text>
    <TouchableOpacity style={styles.addBtnGrid} onPress={onAdd}>
      <Ionicons name="add" size={18} color="#fff" />
    </TouchableOpacity>
  </TouchableOpacity>
));

const ProductCardList = React.memo(({ item, onAdd, onPress }: { item: any; onAdd: () => void; onPress: () => void }) => (
  <TouchableOpacity style={styles.productCardList} onPress={onPress} activeOpacity={0.9}>
    <Image source={{ uri: item.image }} style={styles.productImageList} />
    <View style={styles.productInfoList}>
      <Text style={styles.productNameList} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.priceList}>${item.price}</Text>
    </View>
    <TouchableOpacity style={styles.addBtnList} onPress={onAdd}>
      <Ionicons name="add" size={20} color="#fff" />
    </TouchableOpacity>
  </TouchableOpacity>
));

// === MAIN SCREEN ===
export default function FreshFruitsScreen() {
  const router = useRouter();
  const { addItem, getTotalItems } = useCartStore();
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState(priceRanges[0]);
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Phân trang

  const totalItems = getTotalItems();

  // === LỌC + PHÂN TRANG ===
  const { filteredFruits, totalFiltered } = useMemo(() => {
    const filtered = allFruits.filter((fruit) => {
      const matchCategory = activeCategory === 'All' || fruit.category === activeCategory;
      const matchPrice = fruit.price >= selectedPrice.min && (selectedPrice.max === Infinity || fruit.price <= selectedPrice.max);
      const matchSearch = fruit.name.toLowerCase().includes(searchText.toLowerCase());
      return matchCategory && matchPrice && matchSearch;
    });

    return { filteredFruits: filtered, totalFiltered: filtered.length };
  }, [activeCategory, selectedPrice, searchText]);

  const paginatedFruits = useMemo(() => {
    const start = 0;
    const end = currentPage * ITEMS_PER_PAGE;
    return filteredFruits.slice(start, end);
  }, [filteredFruits, currentPage]);

  const hasMore = paginatedFruits.length < totalFiltered;

  const loadMore = () => {
    if (hasMore) setCurrentPage(prev => prev + 1);
  };

  const clearFilters = () => {
    setActiveCategory('All');
    setSelectedPrice(priceRanges[0]);
    setSearchText('');
    setCurrentPage(1);
    setFilterVisible(false);
  };

  // Reset page khi filter thay đổi
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedPrice, searchText]);

  const showingStart = totalFiltered === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fresh Fruits</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={24} color="#000" />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
            <Ionicons name={isGridView ? 'list' : 'grid'} size={24} color="#000" />
          </TouchableOpacity>
          <Image source={{ uri: IMG.avatar }} style={styles.avatar} />
        </View>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8E8E93" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search fruits..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#8E8E93"
        />
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Count + Showing */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          Showing {showingStart}-{showingEnd} of {totalFiltered} fruits
        </Text>
      </View>

      {/* Product List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} layout={Layout.springify()}>
          {paginatedFruits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No fruits found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : isGridView ? (
            <View style={styles.gridContainer}>
              {paginatedFruits.map((item) => (
                <ProductCardGrid
                  key={item.id}
                  item={item}
                  onAdd={() => addItem({ id: item.id, name: item.name, price: item.price, image: item.image })}
                  onPress={() => router.push(`/fresh-fruit-detail?id=${item.id}`)}
                />
              ))}
            </View>
          ) : (
            paginatedFruits.map((item) => (
              <ProductCardList
                key={item.id}
                item={item}
                onAdd={() => addItem({ id: item.id, name: item.name, price: item.price, image: item.image })}
                onPress={() => router.push(`/fresh-fruit-detail?id=${item.id}`)}
              />
            ))
          )}
        </Animated.View>

        {/* Load More Button */}
        {hasMore && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}

        {/* Banner */}
        <Image source={{ uri: IMG.banner }} style={styles.banner} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Category */}
              <Text style={styles.modalSubtitle}>Category</Text>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalOption, activeCategory === cat && styles.modalOptionActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.modalOptionText, activeCategory === cat && styles.modalOptionTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Price */}
              <Text style={[styles.modalSubtitle, { marginTop: 20 }]}>Price Range</Text>
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={range.label}
                  style={[styles.modalOption, selectedPrice.label === range.label && styles.modalOptionActive]}
                  onPress={() => setSelectedPrice(range)}
                >
                  <Text style={[styles.modalOptionText, selectedPrice.label === range.label && styles.modalOptionTextActive]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={{ height: 80 }} />
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setFilterVisible(false)}>
                <Text style={styles.modalCloseText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: '#FF3B30', marginTop: 8 }]}
                onPress={clearFilters}
              >
                <Text style={styles.modalCloseText}>Clear All</Text>
              </TouchableOpacity>
            </View>
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