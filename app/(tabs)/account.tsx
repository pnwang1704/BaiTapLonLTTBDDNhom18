import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import React, { useMemo, useState } from "react";

import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
export default function AccountScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  if (!isAuthenticated) return <Redirect href="/login" />;

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

  const [currentView, setCurrentView] = useState<ViewKey>("home");
  const [searchChat, setSearchChat] = useState("");

  const MenuItem = ({ icon, color, label, onPress }: { icon: any; color: string; label: string; onPress?: () => void }) => (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </Pressable>
  );

  const Header = ({ title }: { title: string }) => (
    <View style={styles.topbar}>
      {currentView !== "home" ? (
        <Pressable onPress={() => setCurrentView("home")} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#111" />
        </Pressable>
      ) : (
        <View style={{ width: 36 }} />
      )}
      <Text style={styles.topbarTitle}>{title}</Text>
      <Pressable onPress={logout} style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
      </Pressable>
    </View>
  );

  const OrdersPending = () => {
    const data = useMemo(
      () => [
        { id: "o1", name: "Laptop Pro 14", qty: 1, price: 899, status: "Chờ xác nhận" },
        { id: "o2", name: "Táo đỏ", qty: 5, price: 10, status: "Chờ xác nhận" },
      ],
      []
    );
    const confirm = (id: string) => Alert.alert("Xác nhận", `Đơn ${id} đã được xác nhận (fake)`);
    return (
      <View style={styles.card}>
        {data.map((item) => (
          <View key={item.id} style={styles.rowBetween}>
            <View>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSub}>SL: {item.qty} • {item.status}</Text>
            </View>
            <Pressable style={styles.smallBtn} onPress={() => confirm(item.id)}>
              <Text style={styles.smallBtnText}>Xác nhận</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  const Shipping = () => {
    const data = useMemo(
      () => [
        { id: "s1", name: "Giày Running", carrier: "GHN", eta: "2 ngày" },
        { id: "s2", name: "Nước hoa", carrier: "GHTK", eta: "3 ngày" },
      ],
      []
    );
    return (
      <View style={styles.card}>
        {data.map((it) => (
          <View key={it.id} style={styles.rowBetween}>
            <View>
              <Text style={styles.itemTitle}>{it.name}</Text>
              <Text style={styles.itemSub}>{it.carrier} • Dự kiến: {it.eta}</Text>
            </View>
            <Pressable style={styles.smallOutlineBtn} onPress={() => Alert.alert("Theo dõi", `Đang theo dõi ${it.id} (fake)`) }>
              <Text style={styles.smallOutlineText}>Theo dõi</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  const Reviews = () => {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Đánh giá sản phẩm</Text>
        <View style={{ flexDirection: "row", gap: 6, marginVertical: 8 }}>
          {[1,2,3,4,5].map((i) => (
            <Pressable key={i} onPress={() => setRating(i)}>
              <Ionicons name={i <= rating ? "star" : "star-outline"} size={24} color="#FFCC00" />
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
        <Pressable style={styles.primaryBtn} onPress={() => Alert.alert("Cảm ơn", `Bạn đã đánh giá ${rating} sao`)}>
          <Text style={styles.primaryText}>Gửi đánh giá</Text>
        </Pressable>
      </View>
    );
  };

  const Rank = () => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="trophy" size={20} color="#DAA520" />
        <Text style={styles.itemTitle}>Hạng hiện tại: Vàng</Text>
      </View>
      <Text style={[styles.itemSub, { marginTop: 8 }]}>Tích lũy thêm 2.000 điểm để lên hạng Bạch Kim (giả lập)</Text>
      <View style={styles.progressBar}><View style={[styles.progressFill, { width: "60%" }]} /></View>
    </View>
  );

  const Vouchers = () => {
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
            <Pressable style={styles.smallBtn} onPress={() => Alert.alert("Áp dụng", `Đã sao chép mã ${v.code}`)}>
              <Text style={styles.smallBtnText}>Dùng</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  const Chat = () => {
    const threads = useMemo(
      () => [
        { id: "c1", name: "CSKH #1", last: "Xin chào!" },
        { id: "c2", name: "Shop A", last: "Đã gửi hàng" },
        { id: "c3", name: "Shop B", last: "Cần thêm thông tin" },
      ],
      []
    );
    const filtered = threads.filter(t => t.name.toLowerCase().includes(searchChat.toLowerCase()));
    return (
      <View style={styles.card}>
        <TextInput placeholder="Tìm cuộc trò chuyện" value={searchChat} onChangeText={setSearchChat} style={styles.input} />
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Pressable style={styles.rowBetween} onPress={() => Alert.alert("Chat", `Mở chat với ${item.name} (fake)`)}>
              <View>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSub}>{item.last}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </View>
    );
  };

  const HelpCenter = () => {
    const faqs = [
      { q: "Làm sao để đổi trả?", a: "Liên hệ CSKH trong 7 ngày (fake)." },
      { q: "Phí vận chuyển?", a: "Tùy khu vực, xem chi tiết tại giỏ hàng (fake)." },
    ];
    const [open, setOpen] = useState<number | null>(null);
    return (
      <View style={styles.card}>
        {faqs.map((f, idx) => (
          <View key={idx}>
            <Pressable style={styles.rowBetween} onPress={() => setOpen(open === idx ? null : idx)}>
              <Text style={styles.itemTitle}>{f.q}</Text>
              <Ionicons name={open === idx ? "chevron-up" : "chevron-down"} size={18} color="#666" />
            </Pressable>
            {open === idx && <Text style={[styles.itemSub, { marginTop: 6 }]}>{f.a}</Text>}
          </View>
        ))}
      </View>
    );
  };

  const Support = () => (
    <View style={styles.card}>
      <Text style={styles.itemTitle}>Chăm sóc khách hàng</Text>
      <Text style={styles.itemSub}>Thời gian: 8:00 - 22:00 (giả lập)</Text>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
        <Pressable style={styles.smallBtn} onPress={() => Alert.alert("Gọi", "Đang gọi 1900-0000 (fake)")}> 
          <Text style={styles.smallBtnText}>Gọi</Text>
        </Pressable>
        <Pressable style={styles.smallOutlineBtn} onPress={() => Alert.alert("Email", "Đã mở email (fake)")}> 
          <Text style={styles.smallOutlineText}>Email</Text>
        </Pressable>
      </View>
    </View>
  );

  const EditProfile = () => {
    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [address, setAddress] = useState("");
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nhập họ tên" />
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Số nhà, đường, ..." />
        <Pressable style={styles.primaryBtn} onPress={() => Alert.alert("Lưu", "Đã lưu thông tin (fake)")}> 
          <Text style={styles.primaryText}>Lưu thay đổi</Text>
        </Pressable>
      </View>
    );
  };

  const Settings = () => {
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
        <Pressable style={[styles.smallOutlineBtn, { alignSelf: "flex-start", marginTop: 12 }]} onPress={() => Alert.alert("Lưu", "Đã lưu cài đặt (fake)")}> 
          <Text style={styles.smallOutlineText}>Lưu cài đặt</Text>
        </Pressable>
      </View>
    );
  };

  const Personal = () => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={28} color="#fff" />
        </View>
        <View>
          <Text style={styles.itemTitle}>{user?.name ?? "Người dùng"}</Text>
          <Text style={styles.itemSub}>SĐT: {user?.phone}</Text>
        </View>
      </View>
      <Text style={[styles.itemSub, { marginTop: 12 }]}>Hạng: Vàng • Điểm: 5.000 (fake)</Text>
    </View>
  );

  const renderHome = () => (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={32} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.name ?? "Người dùng"}</Text>
          <View style={styles.rankRow}>
            <Ionicons name="trophy-outline" size={14} color="#DAA520" />
            <Text style={styles.rankText}>Thành viên hạng {user?.rank === "Vang" ? "Vàng" : user?.rank}</Text>
          </View>
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đơn hàng</Text>
        <MenuItem icon="document-text-outline" color="#34C759" label="Đơn chờ xác nhận" onPress={() => setCurrentView("orders_pending")} />
        <MenuItem icon="bicycle-outline" color="#007AFF" label="Chờ giao hàng" onPress={() => setCurrentView("shipping")} />
        <MenuItem icon="star-outline" color="#FFCC00" label="Đánh giá" onPress={() => setCurrentView("reviews")} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <MenuItem icon="medal-outline" color="#DAA520" label="Thành viên rank Vàng" onPress={() => setCurrentView("rank")} />
        <MenuItem icon="pricetags-outline" color="#FF9500" label="Kho voucher" onPress={() => setCurrentView("vouchers")} />
        <MenuItem icon="chatbubble-ellipses-outline" color="#34C759" label="Chat" onPress={() => setCurrentView("chat")} />
        <MenuItem icon="help-circle-outline" color="#AF52DE" label="Trung tâm trợ giúp" onPress={() => setCurrentView("help")} />
        <MenuItem icon="headset-outline" color="#FF2D55" label="Chăm sóc khách hàng" onPress={() => setCurrentView("support")} />
        <MenuItem icon="create-outline" color="#5856D6" label="Chỉnh sửa thông tin" onPress={() => setCurrentView("edit_profile")} />
        <MenuItem icon="settings-outline" color="#8E8E93" label="Setting" onPress={() => setCurrentView("settings")} />
        <MenuItem icon="person-circle-outline" color="#008080" label="Cá nhân" onPress={() => setCurrentView("personal")} />
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
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
    <View style={styles.screen}>
      <Header title={viewTitle[currentView]} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF4",
    backgroundColor: "#fff",
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  topbarTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  header: {
    backgroundColor: "#F2FFFD",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#008080",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 18, fontWeight: "700", color: "#111" },
  rankRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  rankText: { color: "#6B7280", fontWeight: "600" },
  logoutBtn: { padding: 8, backgroundColor: "#FFF5F5", borderRadius: 10 },

  section: { marginTop: 20, borderRadius: 12, borderWidth: 1, borderColor: "#EFEFF4" },
  sectionTitle: { paddingHorizontal: 12, paddingVertical: 10, color: "#8E8E93", fontWeight: "700", fontSize: 12 },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  menuIconWrap: { width: 28, alignItems: "center" },
  menuText: { flex: 1, color: "#111", fontWeight: "600" },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFF4", borderRadius: 12, padding: 16, gap: 12, marginTop: 16 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemTitle: { fontWeight: "700", color: "#111" },
  itemSub: { color: "#6B7280" },
  smallBtn: { backgroundColor: "#008080", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  smallBtnText: { color: "#fff", fontWeight: "700" },
  smallOutlineBtn: { borderWidth: 1, borderColor: "#E5E5EA", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  smallOutlineText: { color: "#111", fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#E5E5EA", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  primaryBtn: { backgroundColor: "#008080", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginTop: 8 },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "700", textAlign: "center" },
  label: { color: "#111", marginBottom: 6, fontWeight: "600" },
  progressBar: { height: 10, backgroundColor: "#F2F2F7", borderRadius: 6, marginTop: 10, overflow: "hidden" },
  progressFill: { height: 10, backgroundColor: "#DAA520" },
});
