import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Thread = {
  id: string;
  title: string;
  lastMessage: string;
  unread: number;
  type: "system" | "order" | "chat";
  updatedAt: number;
  messages?: Array<{ id: string; from: "me" | "them" | "system"; text: string; at: number }>;
};

export default function InboxScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "t1",
      title: "CSKH #1",
      lastMessage: "Xin chào! Tôi có thể giúp gì?",
      unread: 2,
      type: "chat",
      updatedAt: Date.now() - 1_000 * 60,
      messages: [
        { id: "m1", from: "them", text: "Xin chào!", at: Date.now() - 1_000 * 80 },
        { id: "m2", from: "them", text: "Tôi có thể giúp gì?", at: Date.now() - 1_000 * 60 },
      ],
    },
    {
      id: "t2",
      title: "Đơn #A1234",
      lastMessage: "Đơn hàng đã được xác nhận.",
      unread: 0,
      type: "order",
      updatedAt: Date.now() - 1_000 * 3600,
      messages: [
        { id: "m1", from: "system", text: "Đơn hàng đã được xác nhận.", at: Date.now() - 1_000 * 3600 },
      ],
    },
    {
      id: "t3",
      title: "Shop A",
      lastMessage: "Đã gửi hàng, dự kiến 2-3 ngày.",
      unread: 1,
      type: "chat",
      updatedAt: Date.now() - 1_000 * 600,
      messages: [
        { id: "m1", from: "them", text: "Đã gửi hàng, dự kiến 2-3 ngày.", at: Date.now() - 1_000 * 600 },
      ],
    },
  ]);

  const currentThread = useMemo(() => threads.find(t => t.id === currentThreadId) || null, [threads, currentThreadId]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // Fake pull-to-refresh: đảo unread một thread
      setThreads(prev => prev.map(t => (t.id === "t2" ? { ...t, unread: t.unread + 1 } : t)));
      setRefreshing(false);
    }, 800);
  };

  const filteredThreads = useMemo(() => {
    let data = threads;
    if (filter === "unread") data = data.filter(t => t.unread > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(t => t.title.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q));
    }
    return data.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [threads, filter, search]);

  const openThread = (id: string) => {
    setCurrentThreadId(id);
    // mark as read
    setThreads(prev => prev.map(t => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const markAllRead = () => setThreads(prev => prev.map(t => ({ ...t, unread: 0 })));

  const renderThreadItem = ({ item }: { item: Thread }) => (
    <Pressable style={styles.thread} onPress={() => openThread(item.id)}>
      <View style={styles.threadAvatar}>
        <Ionicons
          name={item.type === "order" ? "cube-outline" : item.type === "system" ? "notifications-outline" : "chatbubble-ellipses-outline"}
          size={18}
          color="#fff"
        />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.threadTitle} numberOfLines={1}>{item.title}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>
          )}
        </View>
        <Text style={styles.threadLast} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </Pressable>
  );

  // Thread view state
  const [messageText, setMessageText] = useState("");

  const sendMessage = () => {
    const text = messageText.trim();
    if (!text || !currentThread) return;
    const now = Date.now();
    setThreads(prev => prev.map(t => {
      if (t.id !== currentThread.id) return t;
      const messages = (t.messages || []).concat({ id: `m-${now}`, from: "me", text, at: now });
      return { ...t, messages, lastMessage: text, updatedAt: now };
    }));
    setMessageText("");
  };

  if (currentThread) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => setCurrentThreadId(null)}>
            <Ionicons name="chevron-back" size={20} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{currentThread.title}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Messages */}
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          data={currentThread.messages || []}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === "me" ? styles.bubbleMe : item.from === "them" ? styles.bubbleThem : styles.bubbleSystem]}>
              <Text style={item.from === "system" ? styles.bubbleSystemText : styles.bubbleText}>{item.text}</Text>
            </View>
          )}
        />

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Nhắn gì đó..."
            style={styles.input}
          />
          <Pressable style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  // List view
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <Pressable style={styles.markReadBtn} onPress={markAllRead}>
          <Ionicons name="checkmark-done-outline" size={18} color="#007AFF" />
          <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
        </Pressable>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color="#8E8E93" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm"
          style={styles.searchInput}
        />
      </View>
      <View style={styles.segmentRow}>
        <Pressable
          onPress={() => setFilter("all")}
          style={[styles.segmentBtn, filter === "all" && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, filter === "all" && styles.segmentTextActive]}>Tất cả</Text>
        </Pressable>
        <Pressable
          onPress={() => setFilter("unread")}
          style={[styles.segmentBtn, filter === "unread" && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, filter === "unread" && styles.segmentTextActive]}>Chưa đọc</Text>
        </Pressable>
      </View>

      {/* Threads */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        data={filteredThreads}
        keyExtractor={(item) => item.id}
        renderItem={renderThreadItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", padding: 32 }}>
            <Ionicons name="chatbubble-outline" size={40} color="#C7C7CC" />
            <Text style={{ color: "#8E8E93", marginTop: 8 }}>Không có tin nhắn</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF4",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  markReadBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  markReadText: { color: "#007AFF", fontWeight: "700" },

  searchRow: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#111" },

  segmentRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  segmentBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E5EA" },
  segmentActive: { backgroundColor: "#007AFF10", borderColor: "#007AFF" },
  segmentText: { color: "#111", fontWeight: "600" },
  segmentTextActive: { color: "#007AFF" },

  thread: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFF4", padding: 12, borderRadius: 12 },
  threadAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#007AFF" },
  threadTitle: { fontWeight: "700", color: "#111" },
  threadLast: { color: "#6B7280", marginTop: 4 },
  unreadBadge: { backgroundColor: "#FF3B30", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  unreadText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  bubble: { maxWidth: "80%", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleMe: { alignSelf: "flex-end", backgroundColor: "#007AFF" },
  bubbleThem: { alignSelf: "flex-start", backgroundColor: "#F2F2F7" },
  bubbleSystem: { alignSelf: "center", backgroundColor: "#FFF4E5" },
  bubbleText: { color: "#fff" },
  bubbleSystemText: { color: "#8E5C00" },

  composer: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: "#EFEFF4", backgroundColor: "#fff" },
  input: { flex: 1, borderWidth: 1, borderColor: "#E5E5EA", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: "#111" },
  sendBtn: { backgroundColor: "#007AFF", width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
