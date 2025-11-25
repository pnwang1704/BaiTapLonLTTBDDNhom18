// constants/api.ts – TỰ ĐỘNG CHỌN LAN HOẶC TUNNEL!!!
import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (!__DEV__) return 'https://your-production-api.com';

  const hostUri = Constants?.expoConfig?.hostUri || '';
  
  // Nếu đang dùng tunnel (exp.direct)
  if (hostUri.includes('exp.direct')) {
    // Dùng ngrok hoặc tunnelmole của backend (bạn chỉ cần chạy 1 lần)
    return 'https://0wgole-ip-14-242-169-231.tunnelmole.net'; // ← CHỈ SỬA 1 LẦN DUY NHẤT!!!
  }

  // Nếu dùng LAN
  const ip = hostUri.split(':')[0];
  if (ip && ip !== 'localhost') {
    return `http://${ip}:5000`;
  }

  return 'http://localhost:5000';
};

export const API_URL = getBaseUrl();