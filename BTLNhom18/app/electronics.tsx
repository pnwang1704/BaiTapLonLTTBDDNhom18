import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Layout,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../store/cartStore';

// === CONSTANTS ===
const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48) / 2; // 2 cột, margin 16 mỗi bên
const ITEMS_PER_PAGE = 6;

// === IMAGES ===
const IMG = {
  phone1: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200',
  ipad: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200',
  laptop: 'https://images.unsplash.com/photo-1569770218135-bea267ed7e84?w=200',
  banner: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50',
};

// === CATEGORIES ===
const categories = [
  { id: '1', image: IMG.phone1, bg: '#E8DAFF' },
  { id: '2', image: IMG.ipad, bg: '#D6E6FF' },
  { id: '3', image: IMG.laptop, bg: '#FFE5D9' },
];

// === ALL PRODUCTS ===
const allProducts = {
  All: [] as any[],
  Featured: [
    { id: '1', name: 'Smartphone X', price: '$899', rating: 4.5, category: 'Phones', image: IMG.phone1 },
    { id: '2', name: 'Tablet Air', price: '$799', rating: 4.4, category: 'Accessories', image: IMG.ipad },
    { id: '13', name: 'Wireless Earbuds Pro', price: '$199', rating: 4.6, category: 'Accessories', image: 'https://vn.jbl.com/dw/image/v2/AAUJ_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw91c02e06/1.JBL_Quantum_TWS_ProductImage_Hero.jpg?sw=270&sh=330&sm=fit&sfrm=png' },
    { id: '14', name: 'Smartphone Z Flip 6', price: '$1,199', rating: 4.7, category: 'Phones', image: 'https://images.unsplash.com/photo-1721864428894-3900930506aa?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1374' },
    { id: '7', name: 'Laptop Gaming ROG Strix', price: '$1,499', rating: 4.9, category: 'Laptops', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS2dbb-kor8S3l9zadquB14OQOtX8ZJpYnGa3jH7QQCOfQFawyHR70rvpgd50Q8HbHzcAlNOsQnZ8VkIWaMzSwhji2jSn5TqQmLFl2E5Bp85JjKWiZgPBL-QMkz9qIq4SyMdgg8fj0&usqp=CAc' },
  ],
  'Top Deals': [
    { id: '3', name: 'Laptop Air', price: '$999', rating: 4.7, category: 'Laptops', image: 'data:image/jpeg;base64,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' },
    { id: '4', name: 'Smartphone Pro', price: '$1,099', rating: 4.8, category: 'Phones', image: IMG.phone1 },
    { id: '7', name: 'Laptop Gaming ROG Strix', price: '$1,499', rating: 4.9, category: 'Laptops', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS2dbb-kor8S3l9zadquB14OQOtX8ZJpYnGa3jH7QQCOfQFawyHR70rvpgd50Q8HbHzcAlNOsQnZ8VkIWaMzSwhji2jSn5TqQmLFl2E5Bp85JjKWiZgPBL-QMkz9qIq4SyMdgg8fj0&usqp=CAc' },
    { id: '8', name: 'Bluetooth Speaker JBL Charge 5', price: '$179', rating: 4.5, category: 'Accessories', image: 'https://cdn.tgdd.vn/Products/Images/2162/251230/bluetooth-jbl-charge-5-2-750x500.jpg' },
    { id: '9', name: 'MacBook Pro M3 2024', price: '$1,899', rating: 4.9, category: 'Laptops', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:100/plain/https://cellphones.com.vn/media/wysiwyg/laptop/macbook/macbook-pro-9.jpg' },
  ],
  Recommended: [
    { id: '5', name: 'Tablet Mini', price: '$689', rating: 4.2, category: 'Accessories', image: 'https://consumer.huawei.com/dam/content/dam/huawei-cbg-site/common/mkt/plp-x/tablets-v5/product-shelf-and-pop-up/view-all/all-matepad-11-5-s.jpg' },
    { id: '6', name: 'Laptop Pro', price: '$1,299', rating: 4.9, category: 'Laptops', image: 'data:image/jpeg;base64,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' },
    { id: '10', name: 'Wireless Mouse MX Master 3S', price: '$99', rating: 4.6, category: 'Accessories', image: 'https://product.hstatic.net/200000722513/product/mx-master-3s-mouse-top-view-graphite_880f7c80882541c2b4e349b7ed0fa439_de0fb8d222ec49bfb11d909a1f116f7e.png' },
    { id: '11', name: 'Smartphone Pixel 8 Pro', price: '$899', rating: 4.8, category: 'Phones', image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAREBEREhMWEhAQFRMQGRIQFhIXEhYYIBMWFxcXFRUYHikgGBolHBUXITIhJSkrLi4vGB8zOD8wNygtLysBCgoKDg0OGxAQGzEmHyYrLy0uMS03Mi8yNS4tLzYvLTYvLS0tLy0rLy0tLS0rLS0rLSstLS0tLS0tLS0tLS0tK//AABEIALcBEwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYCBAcBA//EAEkQAAIBAgMDBggKBgoDAAAAAAABAgMRBBIhBTFBBgcTUWFxFCIyM1KBkaEWI0JTcoOSsbPRF1Sio7LiFTQ1RGJjgpPS4SRz8f/EABkBAQADAQEAAAAAAAAAAAAAAAADBAUCAf/EACkRAQACAgAFAwQCAwAAAAAAAAABAgMRBBIUMlETITEiQWHwUoFxobH/2gAMAwEAAhEDEQA/AO4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMak1FNt2SV22QlblJFOyg2utu3uszumO1+2HF8lad0p0Fe+E6+b/a/lHwnXzf7X8p30+Twj6nF5WEFe+E6+b/a/lPfhOvm/2v8AodPk8HU4vKwAr/wmXzf7X/Rq0+cDZyk41cRSpSXXVhL1O2qfqObYr1+Yd1zUt8StQKw+cPY6/v1D7Z5+kTY/69Q+2R6d7haAVf8ASJsf9eofbH6RNj/r1D7Z7o3C0ArS5f7I/XaH20TOzdqUMTDPQqwqw3ZqclJe48NtwAB6AAAAAAAAAAAAAAAAAAAAAAAAAADQ25K1CXfBftxKPUrK714st3Kz+rfW0PxoHLttcsVs3ZWCcKcamKxMLQ6RXikoxzTnxeskkr637C5w+WKVnanxGKclo0sPTLrPOmXWcdq8521r36WnFPclQoW9V4iHOZtdtJVoNvTzGH/4kvWx4Q9Dby7H0y6x0y6zjc+c3a6bTrQTWnmMP/wJjk5zsYunVprGxp1sPN2lKNOEakVe2aORWduprUdZXwdFbyunKuu/BnCLt01SjQbi7PLOrCErPh4smfOlg6EIRhClGCVtEo23dViZ5yIRWHw7SWuKwuqS+fpkfSouW63rdibHaLTNpQZazWIrDX6GHox9iHQw9GN+5H0xOGnT8ZuLqvyY5o5Yrcnv1bNPBUqt80nF3bv48bp3trrx3ns5K7R1pMtbYmBrQhJYmUKs3NtOMYpKOlluXG77L21JHoYejH2I2I0m+Mb2zWzK9tx5VpONr216mn9x3Xl1qHl+be5hhSo0flQurrycqduK1R9OS6hh9r0XQj0cMXTqQqQW6TjkcZNLS6cpa9vYfMy2L/amA+v+6mRcRWPTmUvDWn1Ih14AGS2QAAAAAAAAAAAAAAAAAAAAAAAAAAQ/Kz+rfW0PxoHIuU/I+vj9l7Pq4ZZq+Fh5ttLPGUYt2b0zJxWj33fYdj5QQUqDTV1mpv8AeRKR0GXxYtxitEotpLuS3FvBi9SsqfEZvTtDhFfkltVvXBYnTqo1GvVpawhyV2oo28BxPf0NS/duO75JelP7UvzGSXpz+1L8yTo/yj678OCS5IbTf9yxP+zV/ImOTfNvtHFVoRqUKmGo3WepWi4WjxyxlrKVt2lus7Hkl6UvtS/MZJelL7UvzHRfk678HOPC2Gw8UtFisKkvr6aRDYvHQoxUXBTqzs0m3dK/G3Bmvy5qOnhVNyk8tbDy1be6vTehS3tx55T8uctczbv7OFuokiOTdZlXyzN4i0QulWLjPPVo3nHV3lKSV1pfWy0PlVxNHx26cItR1ed6b/Gtfdu39hSq218RWTg6jcL3twXbY0aGO6OeV2yuycrJyv6967DyY17y43M+0Lzi9tRoyhKFG8ZqMbucpQ0Su1benq+wywu1lUhpbP2Wtbi/f711lE/pCaWSM5SinfXTXsXAtnJ7krtOcamXDTgpRfnvi9Wl5Oazva55Gq11E/v9pYtaZ9/dPYKspL3m1sb+1MB9f91M0sHsvEUr9LCVGzss8XZvsluftN7ZNKpHamAcrWl07TWnzejXWMl945h1jpPqxLroAM5qAAAAAAAAAAAAAAAAAAAAAAAAAAAj9uv4l/Sh/GimVN772XPbq+JfZKn/ABoptTe+9mjwfbLN43uhgAC6pAAArfOBK2DvvtVoO318DneCwTq1n4tovS3A6JzgL/w/raH48CobPTptW1T9xVvH1TKeJnkisT87/wCpRbLpZbRSWVWfayE2nsOULylHLHrdlf2l22fhI3pVVrRzqE0t6Ullvrp5UomfLucFFwgnu4EXq/Yw8L9XNMztH80HJ2jiKtXE1oZ1hpU40k/Iz6yba+U42jZcM3cdgo4qnNyUJxm4txajKLaa0aaT0Zz3mXxTVHE4aT8ioq0b+VaStLvScF9oneVuysPB0MRGlCFfwvDLpYRUZu9VZryW+/aRT72W+yqXxmzryflTpVWs9Nu7jLhOm21lXWvYinUIyhtTAKbvlniIdq8aklf7zopyzCU609u0atSyVWrWcbO6yRdKMd3+GK9bOftLvX1RLsYAK60AAAAAAAAAAAAAAAAAAAAAAAAAACO295n/AFQ/jRTam997Llt7zP8Aqh/Gimz3vvZo8H2yzeN7oYgHk1dNF1SeRqJuyZkfFKV1vVt+6x9gK9y6inhYpuydfDpvq+Pp6kHs1RU8rjdPxVr7H2kxzgytg79VWg9P/dArFHE3S18nd2fkQxG7Wc57arWZjfytVaEE4u6pw9GLlZyUbKTWu5627DYrbVozWepFvMk7aJe13PlguSuOrwzOOWLSknWllk+3Kk2vWkeS2bWwyccZQjOKSjBprI9LWvHjZcStyxv2ld9W8RtDrbNOnWVWlGMJwd4yc3dey112bifwHOLh6MZRqYdNSk63xc83jt3btU8nXqehVMdh7U/io5ZVG3FQdm1ZW1Xjb76PhYhIbFqSnKFSnOErcU0+x2erT7D2Yjw9nLOt8y18oOcuviY9FTpqlC93lk5SmvRvpp95s8l8TUltHZ7krP43R799JO67iuU9kSw3jJvpLdS79z4kryLxCntPAu93aTte7XjU7p+s4vEcvs9w5Zm2nfgAUmkAAAAAAAAAAAAAAAAAAAAAAAAAACP275h/Sp/iRKZPe+9lz275h/Sp/iRKZU3vvZo8F2yzeN7oYgAuqQAAK7y7aWFjfd0+Hv8A78CW5B8lKTy4yolJXbpQa0Vn5cut3WnVa/UQvOG7YK/VVoP99Au3I/F9LsuhKk7yjT6N5d6lF2lp18fWZ/F5pxUvaI3qN+34hawYYyWrv990hjtrdHUlG3iQj41SXk9I45oQbvorK7dn5SNWg62LhOjWjDo3eFRSjOFS0qUZRahd2acnrfgffCbN+NUpxjPxWryV2nu49ja9bG1cbQ2fh51IwUd7jTgtZztZL3LXgkUuD4mc+Lmmk1nxP7+/0tZ8FqZNc24ctrQgpN5s1SLyN9TTs0uy5niKlaSjKGaM4JxzpeNk1tZcUtfayK5PyzV5SqJuCzTtL5Tv427i2yfw9e0k7ZZau+lo9UbPeaXz8svkmk+33aa2i6jyzhqvlytduytuep9+S+FS2vg3ltfpb2606b3ojcfQjfK5aLcoeUtePW1v9hMcmMRm2ps9KLUbVnd727wT+5e0hvGqyu4YibRP3dsABSaQAAAAAAAAAAAAAAAAAAAAAAAAAAI/bvmH9Kn+JEplTe+9lz295h/Sp/iRKZPe+9mjwXbLN43uhiAC6pAAArfL6N8Il11sOv30DV5LbRq7P6SUJxyOSU8PN73wkraxe5X9u5G/y1aVCm3uWIwz13efplR23GU5/E3nNK8lDV9ukddOsq21N5iUlptFKzWff3dHrc5FPLeNFuT65rKvWldlc2jtaWMblUaemiV8qXVFcO8pFChOok4PVb43WZd6fAklHExSfRSj1VLLo32q/HuPYpSPhDbNn3vbPFVI0naLs0+u7vxXq3e03MLjumtCzi31P7iJWzG5J+VJvSKu37Os3MLSyykmmpR0s9HF6XujuKfZxObc8yahs7I3rZX370zPkpVhLa2EytOzrLR77ZE20u37uq14nH7YqtKMIOVGGXNKzy5uOZrRcNO4lORSpraOAyvxr121ayV+jatwK+btaHD8s2iYdzABntQAAAAAAAAAAAAAAAAAAAAAAAAAAEft7zD+lT/EiUye997Llt7zD+lT/EiU2e997NHgu2WbxvdDEAF1SAABXuXNNSw0IvRSr4ZN9nTwNnkZaFGSoNKrGs6kozkqbr0+jcYLO07JSd7W4PrPhy0inRpJ7nicKn3eEUzd2HsNzhKcqnRUnPoouMZSb0vw8mK63oU8sxF52uY6zakKfy9yR2l06g40XKm5OOiqNW6XL32avxs3xLXjto04rE1546nWwVam1Rw0HFzzNLIox3wcWvztY39s82ksQkvC8qXXSzP1eOrf/SKp8zbTTWMWn+Q9f3hH6ld/Lq2C3xENTkzXSVeMJxp16kIqlUqPKrZvHSl8mTVu+3A95a6QodJKNTEqMoSlTu83j3ppy4tR3vrLTheb7Jb49PL/AJX8xqbX5vZTanLFqMU1FfEt2baS+X1sk9ak23tT6XLFOSK/7j/LV2Xjnkw8oYijTwdOnSjVoTlBSvZ9MpQcbycuGut/bXeRjg9s4XJ5N69l1K8LL2FklzbZNHiVOpJWinSkk3fS8lJ26iu8jdjeDbYwd/Ll0ya0urZN9iG94ms6XcWK1bRt3gAFNoAAAAAAAAAAAAAAAAAAAAAAAAB42enlgNLatJ1KUoJ2lo1fddNSV+zQouIxEYyaleLT3SWv5PvR0ZwR8pYOm98U+9E+HPOP7K+bh4y++3OfDafpHvhtP0jofgFL0F7EPAKXoL2In62fCDoY/k554bT9IeG0/SOhf0fS9FexHvgFL0V7EOtnwdDH8nIOWE+kwrdPx50p0qygr3lkqRm0ut2iz47H5eYanSilUozi5KeSvZOMrWzJSaalwOxS2ZRe+CI6ryQwMm5Soxbet9SG+fmnek1OH5Y1tzbFc7klUcYSwzhfym2/umZw51pSa+MwkVxzOW77e86J8DNn/MR94+Buz/mI+849SPCSKTH3ct2jzv14SXRvCTjf/G3b1TNfFc8FdtxthZQTTWaM3xuvl24HWvgbs/5iPvHwN2f8xH3nsZI8OLYbTPdLmtfnTlaF6mEzyTvKGrg7XVm5tdZjyBn4btalVpXqUcLCpKpWV8meWW0FLi9L+s6b8Ddn/MR95JYLZtGjHLTioR6luObX38Q7pjmPmdtwHiR6RpQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/9k=' },
    { id: '12', name: 'Laptop Lenovo Yoga 7i', price: '$1,099', rating: 4.7, category: 'Laptops', image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/lenovo_thinkbook_14_g8_xam_01_fe41c49cba.png' },
  ],
};

// === TẠO DANH SÁCH "All" (loại trùng) ===
const allProductList = [
  ...allProducts.Featured,
  ...allProducts['Top Deals'],
  ...allProducts.Recommended,
].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

allProducts.All = allProductList;

// === FILTERS & TABS ===
const filters = ['All', 'Phones', 'Laptops', 'Accessories'];
const tabs = ['All', 'Featured', 'Top Deals', 'Recommended'];
const sortOptions = [
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Rating: High to Low', value: 'rating-desc' },
  { label: 'Rating: Low to High', value: 'rating-asc' },
];
const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $200', min: 0, max: 200 },
  { label: '$200 - $500', min: 200, max: 500 },
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: 'Above $1000', min: 1000, max: Infinity },
];

// === UTILS ===
const parsePrice = (priceStr: string): number => {
  return parseFloat(priceStr.replace(/[$,]/g, '')) || 0;
};

// === COMPONENTS ===
const CategoryCard = React.memo(({ item }: { item: any }) => (
  <View style={[styles.categoryCard, { backgroundColor: item.bg }]}>
    <Image source={{ uri: item.image }} style={styles.categoryImage} />
  </View>
));

const ProductItemList = React.memo(({ item }: { item: any }) => {
  const router = useRouter();
  const { addItem } = useCartStore();

  const handleAddToCart = useCallback(() => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
  }, [addItem, item]);

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/electronic-detail',
      params: {
        id: item.id,
        name: item.name,
        price: item.price,
        rating: item.rating.toString(),
        image: item.image,
      },
    });
  }, [item, router]);

  return (
    <TouchableOpacity style={styles.productItemList} onPress={handlePress} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.productImageList} />
      <View style={styles.productInfoList}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.rating}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={14}
              color={i < Math.floor(item.rating) ? '#F1C40F' : '#E0E0E0'}
            />
          ))}
        </View>
        <Text style={styles.price}>{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const ProductItemGrid = React.memo(({ item }: { item: any }) => {
  const router = useRouter();
  const { addItem } = useCartStore();

  const handleAddToCart = useCallback(() => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
  }, [addItem, item]);

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/electronic-detail',
      params: {
        id: item.id,
        name: item.name,
        price: item.price,
        rating: item.rating.toString(),
        image: item.image,
      },
    });
  }, [item, router]);

  return (
    <TouchableOpacity style={styles.productItemGrid} onPress={handlePress} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.productImageGrid} />
      <View style={styles.productInfoGrid}>
        <Text style={styles.productNameGrid} numberOfLines={2}>{item.name}</Text>
        <View style={styles.ratingGrid}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={12}
              color={i < Math.floor(item.rating) ? '#F1C40F' : '#E0E0E0'}
            />
          ))}
        </View>
        <Text style={styles.priceGrid}>{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.addBtnGrid} onPress={handleAddToCart}>
        <Ionicons name="add" size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const TabButton = React.memo(
  ({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  )
);

// === MAIN SCREEN ===
export default function ElectronicsScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<{
    label: string;
    min: number;
    max: number;
  } | null>(null);
  const [sortBy, setSortBy] = useState<string>('price-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isGridView, setIsGridView] = useState(false);

  const router = useRouter();
  const totalItems = useCartStore((state) => state.getTotalItems());

  // === LỌC + SẮP XẾP + PHÂN TRANG ===
  const { filteredProducts, totalFiltered } = useMemo(() => {
    let products = allProducts[activeTab] || [];

    if (activeFilter !== 'All') {
      products = products.filter(p => p.category === activeFilter);
    }

    if (selectedPriceRange) {
      const min = selectedPriceRange.min;
      const max = selectedPriceRange.max === Infinity ? 999999 : selectedPriceRange.max;
      products = products.filter(p => {
        const price = parsePrice(p.price);
        return price >= min && price <= max;
      });
    }

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    const sorted = [...products].sort((a, b) => {
      if (sortBy === 'price-asc') return parsePrice(a.price) - parsePrice(b.price);
      if (sortBy === 'price-desc') return parsePrice(b.price) - parsePrice(a.price);
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'rating-asc') return a.rating - b.rating;
      return 0;
    });

    return { filteredProducts: sorted, totalFiltered: sorted.length };
  }, [activeTab, activeFilter, selectedPriceRange, searchText, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = 0;
    const end = currentPage * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const hasMore = paginatedProducts.length < totalFiltered;

  const loadMore = () => {
    if (hasMore) setCurrentPage(prev => prev + 1);
  };

  const clearFilters = () => {
    setActiveFilter('All');
    setSelectedPriceRange(null);
    setSearchText('');
    setSortBy('price-asc');
    setCurrentPage(1);
    setFilterVisible(false);
  };

  const showingStart = totalFiltered === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Electronics</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color="#000" />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
            <Ionicons
              name={isGridView ? "list" : "grid"}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
          <Image source={{ uri: IMG.avatar }} style={styles.avatar} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8E8E93" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search electronics"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#8E8E93"
        />
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

           {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>

            {/* Nội dung có thể cuộn */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              style={{ flexGrow: 1 }} // Quan trọng: chiếm không gian còn lại
            >
              {/* Category */}
              <Text style={styles.modalSubtitle}>Category</Text>
              {filters.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.modalOption, activeFilter === f && styles.modalOptionActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.modalOptionText, activeFilter === f && styles.modalOptionTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Price */}
              <Text style={[styles.modalSubtitle, { marginTop: 20 }]}>Price Range</Text>
              {priceRanges.map((range) => {
                const isActive = selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max;
                return (
                  <TouchableOpacity
                    key={range.label}
                    style={[styles.modalOption, isActive && styles.modalOptionActive]}
                    onPress={() => setSelectedPriceRange(range)}
                  >
                    <Text style={[styles.modalOptionText, isActive && styles.modalOptionTextActive]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Sort */}
              <Text style={[styles.modalSubtitle, { marginTop: 20 }]}>Sort By</Text>
              {sortOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.modalOption, sortBy === opt.value && styles.modalOptionActive]}
                  onPress={() => setSortBy(opt.value)}
                >
                  <Text style={[styles.modalOptionText, sortBy === opt.value && styles.modalOptionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Khoảng trống dưới */}
              <View style={{ height: 80 }} />
            </ScrollView>

            {/* Nút cố định dưới cùng */}
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CategoryCard item={item} />}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              isActive={activeTab === tab}
              onPress={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            />
          ))}
        </View>

        {/* Product Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            Showing {showingStart}-{showingEnd} of {totalFiltered} products
          </Text>
        </View>

        {/* Product List/Grid */}
        <Animated.View entering={FadeInRight.duration(400)} exiting={FadeOutLeft.duration(400)} layout={Layout.springify()}>
          {paginatedProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : isGridView ? (
            <View style={styles.gridContainer}>
              {paginatedProducts.map((item) => (
                <ProductItemGrid key={item.id} item={item} />
              ))}
            </View>
          ) : (
            paginatedProducts.map((item) => (
              <ProductItemList key={item.id} item={item} />
            ))
          )}
        </Animated.View>

        {/* Load More */}
        {hasMore && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}

        {/* Banner */}
        <View style={styles.banner}>
          <Image source={{ uri: IMG.banner }} style={styles.bannerImage} />
          <View style={styles.dots}>
            <View style={styles.dotActive} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartBtn: { padding: 6, position: 'relative' },
  cartBadge: {
    position: 'absolute', right: 2, top: 0,
    backgroundColor: '#FF3B30', borderRadius: 8,
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
modalContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    width: '92%', 
    height: '92%',
    justifyContent: 'space-between' 
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  modalSubtitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalOptionActive: { backgroundColor: '#007AFF11' },
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
    alignItems: 'center' 
  },
  modalCloseText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  seeAll: { color: '#007AFF', fontSize: 14 },
  categoriesList: { paddingHorizontal: 16, paddingVertical: 12 },
  categoryCard: { width: 120, height: 120, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryImage: { width: 80, height: 80, resizeMode: 'contain' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginVertical: 16, gap: 12 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F2F7' },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { color: '#8E8E93', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  countContainer: { paddingHorizontal: 16, marginBottom: 8 },
  countText: { fontSize: 14, color: '#666' },

  // List View
  productItemList: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 12, elevation: 1, alignItems: 'center',
  },
  productImageList: { width: 60, height: 60, resizeMode: 'contain', marginRight: 12 },
  productInfoList: { flex: 1 },
  productName: { fontSize: 14, color: '#000', marginBottom: 4 },
  rating: { flexDirection: 'row', marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '600', color: '#000' },
  addBtn: { backgroundColor: '#007AFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  // Grid View
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between' },
  productItemGrid: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    elevation: 1,
    position: 'relative',
  },
  productImageGrid: { width: '100%', height: 120, resizeMode: 'contain', marginBottom: 8 },
  productInfoGrid: { flex: 1 },
  productNameGrid: { fontSize: 13, color: '#000', marginBottom: 4, height: 36 },
  ratingGrid: { flexDirection: 'row', marginBottom: 4 },
  priceGrid: { fontSize: 15, fontWeight: '600', color: '#000' },
  addBtnGrid: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#007AFF', width: 28, height: 28,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },

  loadMoreBtn: {
    marginHorizontal: 16, marginVertical: 12,
    backgroundColor: '#007AFF', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  loadMoreText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  banner: { marginHorizontal: 16, marginBottom: 16, position: 'relative' },
  bannerImage: { width: '100%', height: 180, borderRadius: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D1D6' },
  dotActive: { width: 20, height: 8, borderRadius: 4, backgroundColor: '#007AFF' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#8E8E93', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#AAA' },
});