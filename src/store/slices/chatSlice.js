import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';
import { chatsAPICall } from '../../services/mockData'; // Simulação da API
import uuid from 'react-native-uuid';

export const fetchChatData = createAsyncThunk(
    'chat/fetchChatData',
    async (userId, { rejectWithValue }) => {
        try {
            // Simulação de chamada API para buscar canais e mensagens
            const response  = await chatsAPICall(userId);
            return response.data;
        } catch (error) {
          console.error('Error fetching chat data:', error);
            return rejectWithValue(error.message || 'Erro ao carregar dados');
        }
    }
);


// --- SLICE ---

const initialState = {
  channels: {
    byId: {},
    allIds: []
  },
  messages: {
    byId: {},
    allIds: []
  },
  activeChannelId: null,
  status: 'idle',
  isChatModalVisible: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {

    openChannel: (state, action) => {
      const channelId = action.payload;
      state.activeChannelId = channelId;

      if (state.channels.byId[channelId]) {
        state.channels.byId[channelId].unreadCount = 0;
      }
    },

    openChatModal: (state) => {
      state.isChatModalVisible = true;
    },

    closeChatModal: (state) => {
      state.isChatModalVisible = false;
      state.activeChannelId = null;
    },

    clearActiveChannel: (state) => {
      state.activeChannelId = null;
    },

    addMessage: (state, action) => {
      const { tempId, channelId, text } = action.payload;

      state.messages.byId[tempId] = {
        id: null,
        tempId,
        channelId,
        text,
        sender_id: 'driver_me',
        status: 'pending',
        timestamp: new Date().toISOString(),
        type: 'text'
      };


      state.messages.allIds.push(tempId);

      const channel = state.channels.byId[channelId];
      channel.messageIds.push(tempId);
      channel.lastMessageId = tempId;
    },

    markMessageAsSent: (state, action) => {
      const { channelId, tempId, serverId } = action.payload;

      const msg = state.messages.byId[tempId];
      if (!msg) return;

      delete state.messages.byId[tempId];

      msg.id = serverId;
      msg.status = 'sent';

      state.messages.byId[serverId] = msg;

      const channel = state.channels.byId[channelId];
      channel.messageIds = channel.messageIds.map(id =>
        id === tempId ? serverId : id
      );

      state.messages.allIds = state.messages.allIds.map(id =>
        id === tempId ? serverId : id
      );

      channel.lastMessageId = serverId;
    }, 
    startChatWithTerminal: (state, action) => {
        const { terminalId, terminalName } = action.payload;
        const channelId = `chan_${terminalId}`;

        if (!state.channels.byId[channelId]) {
            state.channels.byId[channelId] = {
                id: channelId,
                replier_id: terminalId,
                replier_name: terminalName,
                replier_avatar: null,
                replier_type: 'terminal',
                unreadCount: 0,
                messageIds: [],
                lastMessageId: null
            };

            state.channels.allIds.push(channelId);
        }

        state.activeChannelId = channelId;
        state.isChatModalVisible = true;
    }
  },

  extraReducers: builder => {
    builder
      .addCase(fetchChatData.fulfilled, (state, action) => {
        state.status = 'succeeded';

        const { channels, messages } = action.payload;

        state.channels = channels;
        state.messages = messages;
      });
  }
});

export const {
  startChatWithTerminal,
  openChannel, 
  addMessage, 
  markMessageAsSent,
  openChatModal, 
  closeChatModal,
  clearActiveChannel
} = chatSlice.actions;

const selectActiveChannelId = (state) => state.chat.activeChannelId;
const selectChannelsById = (state) => state.chat.channels.byId;
const selectMessagesById = (state) => state.chat.messages.byId;

// 3. Crie o seletor memoizado
export const selectActiveChannelMessages = createSelector(
  [selectActiveChannelId, selectChannelsById, selectMessagesById],
  (activeChannelId, channelsById, messagesById) => {
    // Essa função só roda se um dos 3 inputs acima mudar
    
    if (!activeChannelId) return [];

    const channel = channelsById[activeChannelId];
    if (!channel) return [];

    // Aqui a lógica pesada de map/filter acontece de forma segura
    return channel.messageIds
      .map((id) => messagesById[id])
      .filter(Boolean); // Remove undefined/null caso existam
  }
);


export const selectLastMessage = (state, channelId) => {
  const channel = state.chat.channels.byId[channelId];
  return channel
    ? state.chat.messages.byId[channel.lastMessageId]
    : null;
};

const selectChannelsState = (state) => state.chat.channels;
const selectMessagesState = (state) => state.chat.messages;

// 2. Use createSelector para combinar e memorizar
export const selectAllChannels = createSelector(
  [selectChannelsState, selectMessagesState], // Inputs
  (channels, messages) => { // Output function (só roda se inputs mudarem)
    return channels.allIds.map(id => {
      const channel = channels.byId[id];
      const lastMessage = channel.lastMessageId
        ? messages.byId[channel.lastMessageId]
        : null;

      return {
        ...channel,
        lastMessage
      };
    });
  }
);


export const selectActiveChannelInfo = (state) => {
  const channelId = state.chat.activeChannelId;
  if (!channelId) return null;

  return state.chat.channels.byId[channelId] || null;
};


export const sendMessageToServer = createAsyncThunk(
  'chat/sendMessageToServer',
  async ({ text }, { dispatch, getState, rejectWithValue }) => {
    const tempId = uuid.v4();
    const channelId = getState().chat.activeChannelId;
    
    if (!channelId) return;

    dispatch(addMessage({
      tempId,
      channelId,
      text
    }));

    try {
      const response = await chatsAPICall('driver_me');

      dispatch(markMessageAsSent({
        channelId,
        tempId,
        serverId: response.data.id || uuid.v4()
      }));

      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export default chatSlice.reducer;