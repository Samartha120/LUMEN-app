export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.lumen.example.com",
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || "wss://api.lumen.example.com",
} as const;
