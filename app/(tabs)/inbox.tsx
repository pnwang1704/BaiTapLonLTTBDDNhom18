// app/(tabs)/inbox.tsx – PHIÊN BẢN CUỐI CÙNG, ĐẸP NHƯ APP TRIỆU USER!!!
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function InboxScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Xin chào bạn! Mình là Shoppy AI đây ạ ✨\nMình có thể giúp bạn:\n• Tìm sản phẩm đẹp giá tốt\n• Tư vấn size chuẩn\n• Kiểm tra đơn hàng\n• Giải đáp mọi thắc mắc\n\nBạn cần mình hỗ trợ gì nào?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Từ khóa + phản hồi siêu thông minh
  const aiResponses: { [key: string]: string } = {
    'giao|ship|phí ship': 'Giao hàng nhanh toàn quốc ạ!\n• Nội thành: 1-2 ngày (20k)\n• Ngoại tỉnh: 2-4 ngày (30k)\n• Miễn phí ship đơn từ 300k',
    'đổi trả|bảo hành': 'Đổi trả MIỄN PHÍ trong 7 ngày nếu lỗi hoặc không vừa size ạ! Chỉ cần giữ nguyên tem mác và hóa đơn là được nhé',
    'mã giảm|mã khuyến|giảm giá': 'Dùng ngay mã: NEW50 giảm 50k cho đơn từ 300k\nWELCOME30 giảm 30k cho khách mới\nHôm nay còn mã FREESHIP nữa nha!',
    'áo thun|áo phông': 'Áo thun hot nhất đang có:\n• Basic trắng/đen: 99k-129k\n• Form rộng unisex: 169k\n• Local brand: 229k-299k\nMình gửi bạn xem ngay nhé!',
    'váy|đầm': 'Váy đẹp đang "hot hòn họt":\n• Váy hoa nhí: 249k\n• Váy maxi đi biển: 299k\n• Váy công sở thanh lịch: 379k\nBạn thích kiểu nào mình gợi ý thêm?',
    'giày|sneaker': 'Giày sneaker đang sale mạnh:\n• Giày trắng basic: 399k → 299k\n• Giày thể thao: 499k\n• Sandal cao gót: 279k',
    'size|kích thước|mặc size': 'Bạn cho mình biết chiều cao & cân nặng được không ạ?\nVí dụ: 1m62, 50kg → mặc size M vừa đẹp luôn!\nSize chart:\n• S: 45-52kg | M: 52-58kg | L: 58-65kg',
    'hi|hello|chào|alo|hey': 'Dạ chào bạn ơi! Shoppy AI sẵn sàng hỗ trợ 24/7 đây ạ',
    'cảm ơn|thanks|cám ơn': 'Dạ không có gì ạ! Chúc bạn shopping thật vui và săn được nhiều deal xịn nhé!\nCó gì cứ gọi mình nha',
  };

  const getAIResponse = (text: string): string => {
    const lower = text.toLowerCase().trim();
    for (const [keys, response] of Object.entries(aiResponses)) {
      if (keys.split('|').some(k => lower.includes(k.trim()))) {
        return response;
      }
    }
    const fallbacks = [
      'Mình đang học thêm để hỗ trợ bạn tốt hơn nha!\nBạn thử hỏi: "giao hàng", "mã giảm giá", "tư vấn size", "áo thun đẹp" nhé!',
      'Câu này hơi khó xíu\nMình gợi ý bạn hỏi cụ thể hơn được không ạ? Ví dụ: "cho tôi váy dưới 300k" hoặc "size L còn không?"',
      'Shoppy AI đang suy nghĩ rất chăm chỉ đây...\nTrong lúc chờ, bạn muốn xem sản phẩm đang hot nhất không ạ?',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiReply]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <View style={styles.aiInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
            <View>
              <Text style={styles.aiName}>Shoppy AI</Text>
              <Text style={styles.aiStatus}>Đang online • Trả lời ngay</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Chat */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {!msg.isUser && <Text style={styles.aiLabel}>Shoppy AI</Text>}
              <Text style={msg.isUser ? styles.userText : styles.aiText}>
                {msg.text}
              </Text>
              <Text style={styles.timestamp}>
                {msg.timestamp.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={styles.typing}>Shoppy AI đang gõ</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhắn tin cho Shoppy AI..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={24} color={inputText.trim() ? "#007AFF" : "#aaa"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  aiInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  aiName: { fontSize: 17, fontWeight: '700', color: '#000' },
  aiStatus: { fontSize: 13, color: '#4CAF50', marginTop: 2 },
  chatContainer: { paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 20 },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  aiLabel: { fontSize: 12, color: '#007AFF', fontWeight: '600', marginBottom: 4 },
  userText: { color: '#fff', fontSize: 16, lineHeight: 22 },
  aiText: { color: '#1a1a1a', fontSize: 16, lineHeight: 22 },
  timestamp: { fontSize: 11, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  typing: { color: '#666', fontStyle: 'italic', fontSize: 15 },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#f0f0f0' },
});