import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = {
  id: string;
  from: 'me' | 'them' | 'system';
  text: string;
  at: number;
};

type Thread = {
  id: string;
  title: string;
  lastMessage: string;
  unread: number;
  type: 'system' | 'order' | 'chat';
  updatedAt: number;
  messages: Message[];
};

// === HELPER: TIME AGO ===
const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
};

// === COMPONENT: THREAD ITEM ===
const ThreadItem = React.memo(({ item, onPress }: { item: Thread; onPress: () => void }) => (
  <Animated.View entering={FadeInDown}>
    <Pressable style={styles.thread} onPress={onPress}>
      <View style={[styles.threadAvatar, styles[`avatar_${item.type}`]]}>
        <Ionicons
          name={
            item.type === 'order'
              ? 'cube-outline'
              : item.type === 'system'
              ? 'notifications-outline'
              : 'chatbubble-ellipses-outline'
          }
          size={18}
          color="#fff"
        />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.threadTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread > 99 ? '99+' : item.unread}</Text>
            </View>
          )}
        </View>
        <Text style={styles.threadLast} numberOfLines={1}>
          {item.lastMessage}
        </Text>
        <Text style={styles.threadTime}>{formatTime(item.updatedAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </Pressable>
  </Animated.View>
));

// === COMPONENT: MESSAGE BUBBLE ===
const MessageBubble = React.memo(({ item }: { item: Message }) => (
  <Animated.View
    entering={FadeIn}
    style={[
      styles.bubble,
      item.from === 'me' ? styles.bubbleMe : item.from === 'them' ? styles.bubbleThem : styles.bubbleSystem,
    ]}
  >
    <Text
      style={
        item.from === 'system' ? styles.bubbleSystemText : item.from === 'me' ? styles.bubbleMeText : styles.bubbleText
      }
    >
      {item.text}
    </Text>
    <Text style={styles.messageTime}>{formatTime(item.at)}</Text>
  </Animated.View>
));

export default function InboxScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<FlatList>(null);

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: 't1',
      title: 'CSKH #1',
      lastMessage: 'Xin chào! Tôi có thể giúp gì?',
      unread: 2,
      type: 'chat',
      updatedAt: Date.now() - 1_000 * 60,
      messages: [
        { id: 'm1', from: 'them', text: 'Xin chào!', at: Date.now() - 1_000 * 80 },
        { id: 'm2', from: 'them', text: 'Tôi có thể giúp gì?', at: Date.now() - 1_000 * 60 },
      ],
    },
    {
      id: 't2',
      title: 'Đơn #A1234',
      lastMessage: 'Đơn hàng đã được xác nhận.',
      unread: 0,
      type: 'order',
      updatedAt: Date.now() - 1_000 * 3600,
      messages: [
        { id: 'm1', from: 'system', text: 'Đơn hàng đã được xác nhận.', at: Date.now() - 1_000 * 3600 },
      ],
    },
    {
      id: 't3',
      title: 'Shop A',
      lastMessage: 'Đã gửi hàng, dự kiến 2-3 ngày.',
      unread: 1,
      type: 'chat',
      updatedAt: Date.now() - 1_000 * 600,
      messages: [
        { id: 'm1', from: 'them', text: 'Đã gửi hàng, dự kiến 2-3 ngày.', at: Date.now() - 1_000 * 600 },
      ],
    },
  ]);

  const currentThread = useMemo(
    () => threads.find((t) => t.id === currentThreadId) || null,
    [threads, currentThreadId]
  );

  const filteredThreads = useMemo(() => {
    let data = threads;
    if (filter === 'unread') data = data.filter((t) => t.unread > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.lastMessage.toLowerCase().includes(q)
      );
    }
    return data.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [threads, filter, search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === 't2' ? { ...t, unread: t.unread + 1 } : t
        )
      );
      setRefreshing(false);
    }, 800);
  }, []);

  const openThread = useCallback((id: string) => {
    setCurrentThreadId(id);
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setThreads((prev) => prev.map((t) => ({ ...t, unread: 0 })));
  }, []);

  const sendMessage = useCallback(() => {
    const text = messageText.trim();
    if (!text || !currentThread) return;

    const now = Date.now();
    const newMsg: Message = {
      id: `m-${now}`,
      from: 'me',
      text,
      at: now,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== currentThread.id) return t;
        const messages = [...(t.messages || []), newMsg];
        return {
          ...t,
          messages,
          lastMessage: text,
          updatedAt: now,
        };
      })
    );
    setMessageText('');
    Keyboard.dismiss();
    setTimeout(() => messagesEndRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messageText, currentThread]);

  // BackHandler
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentThreadId) {
        setCurrentThreadId(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [currentThreadId]);

  // Auto scroll khi mở thread
  useEffect(() => {
    if (currentThreadId) {
      setTimeout(() => messagesEndRef.current?.scrollToEnd({ animated: false }), 300);
    }
  }, [currentThreadId]);

  // === RENDER THREAD VIEW ===
  if (currentThread) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeIn} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => setCurrentThreadId(null)}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentThread.title}
          </Text>
          <View style={{ width: 36 }} />
        </Animated.View>

        {/* Messages */}
        <FlatList
          ref={messagesEndRef}
          data={currentThread.messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
        />

        {/* Composer */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.composer}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Nhập tin nhắn..."
            style={styles.input}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <Pressable
            style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!messageText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // === LIST VIEW ===
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        {filteredThreads.some((t) => t.unread > 0) && (
          <Pressable style={styles.markReadBtn} onPress={markAllRead}>
            <Ionicons name="checkmark-done-outline" size={18} color="#007AFF" />
            <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
          </Pressable>
        )}
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#8E8E93" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm tin nhắn..."
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
      </Animated.View>

      {/* Filter */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.segmentRow}>
        <Pressable
          onPress={() => setFilter('all')}
          style={[styles.segmentBtn, filter === 'all' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, filter === 'all' && styles.segmentTextActive]}>
            Tất cả
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilter('unread')}
          style={[styles.segmentBtn, filter === 'unread' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, filter === 'unread' && styles.segmentTextActive]}>
            Chưa đọc
          </Text>
        </Pressable>
      </Animated.View>

      {/* Threads */}
      <FlatList
        data={filteredThreads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ThreadItem item={item} onPress={() => openThread(item.id)} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Không có tin nhắn</Text>
            <Text style={styles.emptySubtitle}>Tin nhắn sẽ xuất hiện tại đây</Text>
          </Animated.View>
        )}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  backBtn: { padding: 4 },
  markReadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  markReadText: { color: '#007AFF', fontWeight: '600', fontSize: 14 },

  // Search
  searchRow: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchInput: { flex: 1, fontSize: 16, color: '#111' },

  // Filter
  segmentRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  segmentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  segmentActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  segmentText: { fontWeight: '600', color: '#111' },
  segmentTextActive: { color: '#fff' },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#8E8E93', marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: '#AAA', marginTop: 4 },

  // Thread Item
  thread: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFF4',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  threadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar_chat: { backgroundColor: '#007AFF' },
  avatar_order: { backgroundColor: '#34C759' },
  avatar_system: { backgroundColor: '#FF9500' },
  threadTitle: { fontWeight: '700', color: '#111', fontSize: 15 },
  threadLast: { color: '#6B7280', fontSize: 14, marginTop: 4 },
  threadTime: { color: '#AAA', fontSize: 12, marginTop: 4 },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Messages
  messagesContent: { padding: 16, gap: 12, paddingBottom: 20 },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'relative',
  },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: '#f7b543ff' },
  bubbleSystem: { alignSelf: 'center', backgroundColor: '#FFF4E5', borderWidth: 1, borderColor: '#FFE0B2' },
  bubbleText: { color: '#fff', fontSize: 15 },
  bubbleMeText: { color: '#fff' },
  bubbleSystemText: { color: '#8E5C00', fontSize: 13, textAlign: 'center' },
  messageTime: {
    fontSize: 10,
    color: '#fff8',
    marginTop: 4,
    opacity: 0.8,
    alignSelf: 'flex-end',
  },

  // Composer
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEFF4',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#ccc' },
});