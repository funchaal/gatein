import { createSlice, createSelector } from '@reduxjs/toolkit';
import uuid from 'react-native-uuid';
import { api } from '../../services/api';

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
      if (channel) {
          channel.messageIds.push(tempId);
          channel.lastMessageId = tempId;
      }
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
      if (channel) {
          channel.messageIds = channel.messageIds.map(id =>
            id === tempId ? serverId : id
          );
          channel.lastMessageId = serverId;
      }

      state.messages.allIds = state.messages.allIds.map(id =>
        id === tempId ? serverId : id
      );
    }, 
    startChatWithTerminal: (state, action) => {
        const { terminal_id, terminalName } = action.payload;
        const channelId = `chan_${terminal_id}`;

        if (!state.channels.byId[channelId]) {
            state.channels.byId[channelId] = {
                id: channelId,
                replier_id: terminal_id,
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
      .addMatcher(api.endpoints.fetchChatData.matchFulfilled, (state, action) => {
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

export const selectActiveChannelMessages = createSelector(
  [selectActiveChannelId, selectChannelsById, selectMessagesById],
  (activeChannelId, channelsById, messagesById) => {
    if (!activeChannelId) return [];

    const channel = channelsById[activeChannelId];
    if (!channel) return [];

    return channel.messageIds
      .map((id) => messagesById[id])
      .filter(Boolean); 
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

export const selectAllChannels = createSelector(
  [selectChannelsState, selectMessagesState], 
  (channels, messages) => { 
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

export default chatSlice.reducer;
