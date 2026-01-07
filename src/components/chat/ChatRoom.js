import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  selectActiveChannelMessages,
  selectActiveChannelInfo,
  sendMessageToServer, 
} from '../../store/slices/chatSlice';

export default function ChatRoom({ onBack }) {
  // Esse hook retorna { top, bottom, left, right }
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const messages = useSelector(selectActiveChannelMessages);
  const channelInfo = useSelector(selectActiveChannelInfo);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    dispatch(sendMessageToServer({ text: inputText }));
    setInputText('');
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <View>
          <Text style={styles.title}>{channelInfo?.replier_name || 'Chat'}</Text>
          <Text style={styles.status}>Online agora</Text>
        </View>
      </View>

      {/* Mensagens */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id || item.tempId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isMe = item.sender_id === 'driver_me';
          const radiusStyle = isMe ? styles.radiusMe : styles.radiusThem;

          return (
            <View style={[
              styles.bubbleWrapper,
              isMe ? styles.alignMe : styles.alignThem
            ]}>
              
              {/* CAMADA 1: SOMBRA (Fica solta atrás, absoluta) */}
              {/* Usamos top/bottom/left/right em vez de width/height */}
              <View style={[styles.layerShadow, radiusStyle]} />

              {/* CAMADA 2: FUNDO COLORIDO (Fica atrás do texto, absoluta) */}
              <View style={[
                styles.layerBackground, 
                isMe ? styles.bgMe : styles.bgThem,
                radiusStyle
              ]} />

              {/* CAMADA 3: CONTEÚDO (Texto real) */}
              {/* Este é o único elemento 'relative'. Ele define o tamanho do wrapper. */}
              <View style={styles.contentContainer}>
                <Text style={[
                  styles.msgText,
                  isMe ? styles.textMe : styles.textThem
                ]}>
                  {item.text}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={[
                    styles.timeText,
                    { color: isMe ? '#93C5FD' : '#94A3B8' }
                  ]}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isMe && (
                    <Icon
                      name={item.status === 'pending' ? 'time-outline' : 'checkmark-done'}
                      size={14}
                      color={item.status === 'pending' ? '#FEF08A' : '#FFFFFF'}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
              </View>

            </View>
          );
        }}
      />

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <Pressable
          onPress={handleSend}
          style={[styles.sendBtn, !inputText.trim() && styles.disabledSend]}
          disabled={!inputText.trim()}
        >
          <Icon name="send" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn: { marginRight: 16 },
  title: { fontWeight: 'bold', fontSize: 16, color: '#0F172A' },
  status: { fontSize: 12, color: '#10B981' },

  // --- NOVA ESTRUTURA DE ESTILOS ---

  // O Wrapper apenas posiciona o balão na tela e limita a largura máxima.
  // Ele vai encolher até o tamanho do texto (contentContainer).
  bubbleWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
    position: 'relative', // Necessário para os absolutos dentro dele
  },
  alignMe: { alignSelf: 'flex-end' },
  alignThem: { alignSelf: 'flex-start' },

  // Estilos de Borda Compartilhados
  radiusMe: { borderRadius: 16 },
  radiusThem: { borderRadius: 16 },

  // 1. A Sombra
  // Não usa width: 100%. Usa left:0 e right:0 para se prender às bordas do pai.
  layerShadow: {
    position: 'absolute',
    top: 2,       // Deslocamento vertical da sombra
    bottom: -2,   // Compensa o deslocamento
    left: 0,
    right: 0,
    backgroundColor: '#d1d1d1ff',
    zIndex: -1,   // Garante que fique atrás de tudo
  },

  // 2. O Fundo Colorido
  // Também absoluto, preenche exatamente o espaço do pai
  layerBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,    // Fica na frente da sombra, mas atrás do texto
  },
  bgMe: { backgroundColor: '#fa9853ff' },
  bgThem: { 
    backgroundColor: 'white', 
    // borderWidth: 1, 
    // borderColor: '#E2E8F0' 
  },

  // 3. O Conteúdo
  // É relative e tem padding. O texto empurra esse view, que empurra o Wrapper.
  // Como o wrapper cresce, as camadas absolutas (Sombra e Fundo) crescem junto.
  contentContainer: {
    padding: 12,
    zIndex: 1,
  },

  // ---------------------------------

  msgText: { fontSize: 15, lineHeight: 22 },
  textMe: { color: 'white' },
  textThem: { color: '#334155' },
  
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  timeText: { fontSize: 10 },

  inputContainer: {
    flexDirection: 'row', padding: 12, backgroundColor: 'white',
    borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'flex-end'
  },
  input: {
    flex: 1, backgroundColor: '#F1F5F9', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100,
    fontSize: 16, color: '#334155'
  },
  sendBtn: {
    width: 44, height: 44, backgroundColor: '#3B82F6', borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },
  disabledSend: { backgroundColor: '#CBD5E1' }
});