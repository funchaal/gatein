import React, { useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllChannels, openChannel, fetchChatData } from '../../store/slices/chatSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatEmptyState from './ChatEmptyState';

// Helper de Data Relativa
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
};

export default function ChatList({ onClose }) {
  const dispatch = useDispatch();
  const channels = useSelector(selectAllChannels);

  const handlePress = (channelId) => {
    dispatch(openChannel(channelId));
  };

  if (!channels || channels.length === 0) {
    return <ChatEmptyState />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversas</Text>
      </View>

      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => handlePress(item.id)}
            android_ripple={{ color: '#F1F5F9' }}
          >
            {/* Avatar */}
            <Image
              source={{
                uri:
                  item.replier_avatar ||
                  'https://via.placeholder.com/50'
              }}
              style={styles.avatar}
            />

            {/* Info */}
            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text style={styles.name}>
                  {item.replier_name}
                </Text>
                <Text style={styles.time}>
                  {formatTime(item.lastMessage?.timestamp)}
                </Text>
              </View>

              <View style={styles.bottomRow}>
                <Text style={styles.lastMsg} numberOfLines={1}>
                  {item.lastMessage?.text || 'Nova conversa iniciada'}
                </Text>

                {item.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15
    },
    title: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
    closeBtn: { padding: 4 },
    card: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 15, 
        backgroundColor: 'white',
        // borderBottomColor: '#E2E8F0',
        // borderBottomWidth: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E2E8F0'
    },
    content: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    name: { fontWeight: '600', fontSize: 16, color: '#1E293B' },
    time: { fontSize: 12, color: '#94A3B8' },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    lastMsg: { fontSize: 14, color: '#64748B', flex: 1, marginRight: 8 },
    badge: { 
        backgroundColor: '#3B82F6', 
        borderRadius: 10, 
        minWidth: 20, 
        height: 20, 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingHorizontal: 6
    },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' }
});