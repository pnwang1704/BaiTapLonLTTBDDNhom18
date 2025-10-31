// import { Ionicons } from "@expo/vector-icons";
// import { Tabs } from "expo-router";

// export default function TabLayout() {
//   return (
//     <Tabs screenOptions={{ headerShown: false }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="home-outline" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="fresh-fruits"
//         options={{
//           title: "Fruits",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="nutrition-outline" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="electronics"
//         options={{
//           title: "Electronics",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="phone-portrait-outline" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="cart"
//         options={{
//           title: "Cart",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="cart-outline" color={color} size={size} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#008080",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
      }}
    >
      {/* 🏠 Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🔍 Search */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ❤️ Favorites */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
          tabBarBadge: "99+",
          tabBarBadgeStyle: {
            backgroundColor: "#FF3B30",
            color: "#fff",
            fontSize: 10,
            fontWeight: "700",
          },
        }}
      />

      {/* 💬 Inbox */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 👤 Account */}
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
