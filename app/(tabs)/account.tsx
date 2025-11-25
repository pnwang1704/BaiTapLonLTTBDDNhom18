import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  BackHandler,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";

// Import logo
import Logo from "../../assets/images/logo.png";

type ViewKey =
  | "home"
  | "orders_pending"
  | "shipping"
  | "reviews"
  | "rank"
  | "vouchers"
  | "chat"
  | "help"
  | "support"
  | "edit_profile"
  | "settings"
  | "personal";

export default function AccountScreen() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) return <Redirect href="/login" />;

  const [currentView, setCurrentView] = useState<ViewKey>("home");
  const [searchChat, setSearchChat] = useState("");

  // BackHandler
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (currentView !== "home") {
        setCurrentView("home");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [currentView]);

  // === MENU ITEM ===
  const MenuItem = React.memo(
    ({
      icon,
      color,
      label,
      onPress,
    }: {
      icon: any;
      color: string;
      label: string;
      onPress?: () => void;
    }) => (
      <Animated.View entering={FadeInDown}>
        <Pressable style={styles.menuItem} onPress={onPress}>
          <View
            style={[styles.menuIconWrap, { backgroundColor: `${color}20` }]}
          >
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <Text style={styles.menuText}>{label}</Text>
          <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
        </Pressable>
      </Animated.View>
    )
  );

  // === HEADER ===
  const Header = React.memo(({ title }: { title: string }) => (
    <Animated.View entering={FadeIn} style={styles.topbar}>
      {currentView !== "home" ? (
        <Pressable
          style={styles.backBtn}
          onPress={() => setCurrentView("home")}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push("/")}>
          <Image source={Logo} style={styles.logoHeader} resizeMode="contain" />
        </Pressable>
      )}
      <Text style={styles.topbarTitle}>{title}</Text>
      <View style={{ width: 36 }} />
    </Animated.View>
  ));

  // === BREADCRUMBS ===
  const Breadcrumbs = React.memo(() => (
    <Animated.View
      entering={FadeInDown.delay(100)}
      style={styles.breadcrumbsWrap}
    >
      <View style={styles.breadcrumbs}>
        <Pressable onPress={() => setCurrentView("home")}>
          <Text style={styles.breadcrumbLink}>Tài khoản</Text>
        </Pressable>
        <Text style={styles.breadcrumbSep}>›</Text>
        <Text style={styles.breadcrumbCur}>{viewTitle[currentView]}</Text>
      </View>
    </Animated.View>
  ));

  // === CÁC MÀN HÌNH CON ===
  // === 1. ĐƠN CHỜ XÁC NHẬN (CHỈ HIỆN PENDING) ===
  const OrdersPending = React.memo(() => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchOrders = async () => {
        try {
          // LỌC STATUS = PENDING
          const res = await fetch(
            "http://192.168.1.19:5000/api/orders/my-orders?status=PENDING"
          );
          const data = await res.json();
          setOrders(data);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, []);

    const formatPrice = (num: number) =>
      num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    if (loading)
      return (
        <View style={styles.card}>
          <Text>Đang tải...</Text>
        </View>
      );
    if (orders.length === 0)
      return (
        <View style={styles.card}>
          <Text>Không có đơn chờ xác nhận</Text>
        </View>
      );

    return (
      <View style={styles.card}>
        {orders.map((item) => (
          <View
            key={item._id}
            style={[
              styles.rowBetween,
              {
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                paddingBottom: 12,
                marginBottom: 12,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Mã: #{item.orderCode}</Text>
              <Text numberOfLines={1} style={{ marginTop: 4 }}>
                {item.items?.[0]?.name}{" "}
                {item.items?.length > 1 ? `+${item.items.length - 1} món` : ""}
              </Text>
              <Text style={styles.itemSub}>
                Tổng:{" "}
                <Text style={{ color: "#E11D48", fontWeight: "bold" }}>
                  {formatPrice(item.totalAmount)} đ
                </Text>
              </Text>
              <Text
                style={[
                  styles.itemSub,
                  { color: "#FF9500", fontWeight: "bold" },
                ]}
              >
                Chờ thanh toán
              </Text>
            </View>
            <Pressable
              style={styles.smallBtn}
              onPress={() =>
                Alert.alert(
                  "Thanh toán",
                  "Vui lòng vào giỏ hàng để thanh toán lại"
                )
              }
            >
              <Text style={styles.smallBtnText}>Chi tiết</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  });

  // === 2. CHỜ GIAO HÀNG (CHỈ HIỆN PAID) ===
  const Shipping = React.memo(() => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchOrders = async () => {
        try {
          // LỌC STATUS = PAID
          const res = await fetch(
            "http://192.168.1.19:5000/api/orders/my-orders?status=PAID"
          );
          const data = await res.json();
          setOrders(data);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, []);

    const formatPrice = (num: number) =>
      num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    if (loading)
      return (
        <View style={styles.card}>
          <Text>Đang tải...</Text>
        </View>
      );
    if (orders.length === 0)
      return (
        <View style={styles.card}>
          <Text>Chưa có đơn hàng nào đang giao</Text>
        </View>
      );

    return (
      <View style={styles.card}>
        {orders.map((item) => (
          <View
            key={item._id}
            style={[
              styles.rowBetween,
              {
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                paddingBottom: 12,
                marginBottom: 12,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Mã: #{item.orderCode}</Text>
              <Text numberOfLines={1} style={{ marginTop: 4 }}>
                {item.items?.[0]?.name}{" "}
                {item.items?.length > 1 ? `+${item.items.length - 1} món` : ""}
              </Text>
              <Text style={styles.itemSub}>
                Đã trả:{" "}
                <Text style={{ color: "#34C759", fontWeight: "bold" }}>
                  {formatPrice(item.totalAmount)} đ
                </Text>
              </Text>
              <Text
                style={[
                  styles.itemSub,
                  { color: "#007AFF", fontWeight: "bold" },
                ]}
              >
                Đang giao hàng (GHN)
              </Text>
            </View>
            <Pressable
              style={styles.smallOutlineBtn}
              onPress={() =>
                Alert.alert("Vận chuyển", `Đơn hàng đang được shipper đi giao!`)
              }
            >
              <Text style={styles.smallOutlineText}>Theo dõi</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  });

  const Reviews = React.memo(() => {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Đánh giá sản phẩm</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Pressable key={i} onPress={() => setRating(i)}>
              <Ionicons
                name={i <= rating ? "star" : "star-outline"}
                size={28}
                color="#FFCC00"
              />
            </Pressable>
          ))}
        </View>
        <TextInput
          placeholder="Viết cảm nhận..."
          value={text}
          onChangeText={setText}
          style={styles.input}
          multiline
        />
        <Pressable
          style={styles.primaryBtn}
          onPress={() => Alert.alert("Cảm ơn", `Bạn đã đánh giá ${rating} sao`)}
        >
          <Text style={styles.primaryText}>Gửi đánh giá</Text>
        </Pressable>
      </View>
    );
  });

  const Rank = React.memo(() => (
    <View style={styles.card}>
      <View style={styles.rankHeader}>
        <Ionicons name="trophy" size={22} color="#DAA520" />
        <Text style={styles.itemTitle}>Hạng hiện tại: Vàng</Text>
      </View>
      <Text style={styles.itemSub}>
        Tích lũy thêm 2.000 điểm để lên hạng Bạch Kim
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: "60%" }]} />
      </View>
    </View>
  ));

  const Vouchers = React.memo(() => {
    const vouchers = useMemo(
      () => [
        { id: "v1", title: "Giảm 10%", desc: "Đơn từ 200k", code: "SALE10" },
        { id: "v2", title: "Freeship", desc: "Tối đa 30k", code: "FREESHIP" },
      ],
      []
    );
    return (
      <View style={styles.card}>
        {vouchers.map((v) => (
          <View key={v.id} style={styles.rowBetween}>
            <View>
              <Text style={styles.itemTitle}>{v.title}</Text>
              <Text style={styles.itemSub}>{v.desc}</Text>
            </View>
            <Pressable
              style={styles.smallBtn}
              onPress={() => Alert.alert("Áp dụng", `Đã sao chép mã ${v.code}`)}
            >
              <Text style={styles.smallBtnText}>Dùng</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  });

  const Chat = React.memo(() => {
    const threads = useMemo(
      () => [
        { id: "c1", name: "CSKH #1", last: "Xin chào!" },
        { id: "c2", name: "Shop A", last: "Đã gửi hàng" },
        { id: "c3", name: "Shop B", last: "Cần thêm thông tin" },
      ],
      []
    );
    const filtered = useMemo(
      () =>
        threads.filter((t) =>
          t.name.toLowerCase().includes(searchChat.toLowerCase())
        ),
      [threads, searchChat]
    );
    return (
      <View style={styles.card}>
        <TextInput
          placeholder="Tìm cuộc trò chuyện"
          value={searchChat}
          onChangeText={setSearchChat}
          style={styles.input}
        />
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.rowBetween}
              onPress={() =>
                Alert.alert("Chat", `Mở chat với ${item.name} (fake)`)
              }
            >
              <View>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSub}>{item.last}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          initialNumToRender={5}
        />
      </View>
    );
  });

  const HelpCenter = React.memo(() => {
    const faqs = useMemo(
      () => [
        { q: "Làm sao để đổi trả?", a: "Liên hệ CSKH trong 7 ngày." },
        { q: "Phí vận chuyển?", a: "Tùy khu vực, xem chi tiết tại giỏ hàng." },
      ],
      []
    );
    const [open, setOpen] = useState<number | null>(null);
    return (
      <View style={styles.card}>
        {faqs.map((f, idx) => (
          <View key={idx}>
            <Pressable
              style={styles.rowBetween}
              onPress={() => setOpen(open === idx ? null : idx)}
            >
              <Text style={styles.itemTitle}>{f.q}</Text>
              <Ionicons
                name={open === idx ? "chevron-up" : "chevron-down"}
                size={18}
                color="#666"
              />
            </Pressable>
            {open === idx && (
              <Text style={[styles.itemSub, { marginTop: 6 }]}>{f.a}</Text>
            )}
          </View>
        ))}
      </View>
    );
  });

  const Support = React.memo(() => (
    <View style={styles.card}>
      <Text style={styles.itemTitle}>Chăm sóc khách hàng</Text>
      <Text style={styles.itemSub}>Thời gian: 8:00 - 22:00</Text>
      <View style={styles.supportRow}>
        <Pressable
          style={styles.smallBtn}
          onPress={() => Alert.alert("Gọi", "Đang gọi 1900-0000")}
        >
          <Text style={styles.smallBtnText}>Gọi</Text>
        </Pressable>
        <Pressable
          style={styles.smallOutlineBtn}
          onPress={() => Alert.alert("Email", "Đã mở email")}
        >
          <Text style={styles.smallOutlineText}>Email</Text>
        </Pressable>
      </View>
    </View>
  ));

  const EditProfile = React.memo(() => {
    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [address, setAddress] = useState("");
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Số nhà, đường, ..."
        />
        <Pressable
          style={styles.primaryBtn}
          onPress={() => Alert.alert("Lưu", "Đã lưu thông tin")}
        >
          <Text style={styles.primaryText}>Lưu thay đổi</Text>
        </Pressable>
      </View>
    );
  });

  const Settings = React.memo(() => {
    const [push, setPush] = useState(true);
    const [dark, setDark] = useState(false);
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Thông báo đẩy</Text>
          <Switch value={push} onValueChange={setPush} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Giao diện tối</Text>
          <Switch value={dark} onValueChange={setDark} />
        </View>
        <Pressable
          style={[
            styles.smallOutlineBtn,
            { alignSelf: "flex-start", marginTop: 12 },
          ]}
          onPress={() => Alert.alert("Lưu", "Đã lưu cài đặt")}
        >
          <Text style={styles.smallOutlineText}>Lưu cài đặt</Text>
        </Pressable>
      </View>
    );
  });

  const Personal = React.memo(() => (
    <View style={styles.card}>
      <View style={styles.personalHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={32} color="#fff" />
        </View>
        <View>
          <Text style={styles.itemTitle}>{user?.name ?? "Quốc Thái"}</Text>
          <Text style={styles.itemSub}>SĐT: {user?.phone}</Text>
        </View>
      </View>
      <Text style={[styles.itemSub, { marginTop: 12 }]}>
        Hạng: Vàng • Điểm: 5.000
      </Text>
    </View>
  ));

  // === HOME VIEW ===
  const renderHome = useCallback(
    () => (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn} style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={36} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name ?? "Quốc Thái"}</Text>
            <View style={styles.rankRow}>
              <Ionicons name="trophy-outline" size={16} color="#DAA520" />
              <Text style={styles.rankText}>
                Thành viên hạng {user?.rank === "Vang" ? "Vàng" : user?.rank}
              </Text>
            </View>
          </View>
          <Pressable onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          </Pressable>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng</Text>
          <MenuItem
            icon="document-text-outline"
            color="#34C759"
            label="Đơn chờ xác nhận"
            onPress={() => setCurrentView("orders_pending")}
          />
          <MenuItem
            icon="bicycle-outline"
            color="#007AFF"
            label="Chờ giao hàng"
            onPress={() => setCurrentView("shipping")}
          />
          <MenuItem
            icon="star-outline"
            color="#FFCC00"
            label="Đánh giá"
            onPress={() => setCurrentView("reviews")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <MenuItem
            icon="medal-outline"
            color="#DAA520"
            label="Thành viên hạng Vàng"
            onPress={() => setCurrentView("rank")}
          />
          <MenuItem
            icon="pricetags-outline"
            color="#FF9500"
            label="Kho voucher"
            onPress={() => setCurrentView("vouchers")}
          />
          <MenuItem
            icon="chatbubble-ellipses-outline"
            color="#34C759"
            label="Chat"
            onPress={() => setCurrentView("chat")}
          />
          <MenuItem
            icon="help-circle-outline"
            color="#AF52DE"
            label="Trung tâm trợ giúp"
            onPress={() => setCurrentView("help")}
          />
          <MenuItem
            icon="headset-outline"
            color="#FF2D55"
            label="Chăm sóc khách hàng"
            onPress={() => setCurrentView("support")}
          />
          <MenuItem
            icon="create-outline"
            color="#5856D6"
            label="Chỉnh sửa thông tin"
            onPress={() => setCurrentView("edit_profile")}
          />
          <MenuItem
            icon="settings-outline"
            color="#8E8E93"
            label="Cài đặt"
            onPress={() => setCurrentView("settings")}
          />
          <MenuItem
            icon="person-circle-outline"
            color="#008080"
            label="Cá nhân"
            onPress={() => setCurrentView("personal")}
          />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    ),
    [user, logout]
  );

  const viewTitle: Record<ViewKey, string> = {
    home: "Tài khoản",
    orders_pending: "Đơn chờ xác nhận",
    shipping: "Chờ giao hàng",
    reviews: "Đánh giá",
    rank: "Thành viên hạng Vàng",
    vouchers: "Kho voucher",
    chat: "Chat",
    help: "Trung tâm trợ giúp",
    support: "Chăm sóc khách hàng",
    edit_profile: "Chỉnh sửa thông tin",
    settings: "Cài đặt",
    personal: "Cá nhân",
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Header title={viewTitle[currentView]} />
      {currentView !== "home" && <Breadcrumbs />}

      {currentView === "home" && renderHome()}
      {currentView === "orders_pending" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <OrdersPending />
        </ScrollView>
      )}
      {currentView === "shipping" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Shipping />
        </ScrollView>
      )}
      {currentView === "reviews" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Reviews />
        </ScrollView>
      )}
      {currentView === "rank" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Rank />
        </ScrollView>
      )}
      {currentView === "vouchers" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Vouchers />
        </ScrollView>
      )}
      {currentView === "chat" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Chat />
        </ScrollView>
      )}
      {currentView === "help" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <HelpCenter />
        </ScrollView>
      )}
      {currentView === "support" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Support />
        </ScrollView>
      )}
      {currentView === "edit_profile" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <EditProfile />
        </ScrollView>
      )}
      {currentView === "settings" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Settings />
        </ScrollView>
      )}
      {currentView === "personal" && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Personal />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9F9FB" },

  // Header
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF4",
  },
  logoHeader: { width: 50, height: 40 },
  backBtn: { padding: 4 },
  topbarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    textAlign: "center",
  },

  // Breadcrumbs
  breadcrumbsWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  breadcrumbs: { flexDirection: "row", alignItems: "center", gap: 8 },
  breadcrumbLink: { color: "#007AFF", fontWeight: "600" },
  breadcrumbSep: { color: "#8E8E93" },
  breadcrumbCur: { color: "#111", fontWeight: "700" },

  // Home Header
  header: {
    backgroundColor: "#E6F7F7",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#008080",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 20, fontWeight: "700", color: "#111" },
  rankRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  rankText: { color: "#6B7280", fontWeight: "600", fontSize: 14 },
  logoutBtn: {
    padding: 10,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
  },

  // Section
  section: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 1,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#8E8E93",
    fontWeight: "700",
    fontSize: 13,
    backgroundColor: "#F9F9FB",
  },

  // Menu Item
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { flex: 1, color: "#111", fontWeight: "600", fontSize: 15 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    gap: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: { fontWeight: "700", color: "#111", fontSize: 15 },
  itemSub: { color: "#6B7280", fontSize: 13, marginTop: 2 },

  // Buttons
  smallBtn: {
    backgroundColor: "#008080",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  smallBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  smallOutlineBtn: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  smallOutlineText: { color: "#111", fontWeight: "700", fontSize: 13 },
  primaryBtn: {
    backgroundColor: "#008080",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Input
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  label: { color: "#111", marginBottom: 8, fontWeight: "600", fontSize: 15 },

  // Progress
  progressBar: {
    height: 10,
    backgroundColor: "#F2F2F7",
    borderRadius: 6,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: 10, backgroundColor: "#DAA520", borderRadius: 6 },

  // Others
  starRow: { flexDirection: "row", gap: 8, marginVertical: 8 },
  rankHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  supportRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  personalHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
});
