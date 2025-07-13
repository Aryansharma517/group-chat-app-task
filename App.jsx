// App.js
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { initializeSocket } from './socket';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    const newSocket = initializeSocket();

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('messageHistory', history => {
      setMessages(history);
      scrollToBottom();
    });

    newSocket.on('message', message => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on('error', error => {
      Alert.alert('Error', error);
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleJoin = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    socket.emit('join', username.trim());
    setIsJoined(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    socket.emit('sendMessage', { message: messageText.trim() });

    setMessageText('');
  };

  const renderMessage = ({ item }) => {
    const isSystem = item.type === 'system';
    const isOwn = item.username === username && !isSystem;

    return (
      <View
        style={[
          styles.messageContainer,
          isSystem && styles.system,
          isOwn && styles.own,
        ]}
      >
        {isSystem ? (
          <Text style={styles.systemText}>{item.text}</Text>
        ) : (
          <View style={[styles.bubble, isOwn && styles.ownBubble]}>
            <Text style={[styles.sender, isOwn && styles.ownSender]}>
              {item.username}
            </Text>
            <Text style={[styles.text, isOwn && styles.ownText]}>
              {item.message}
            </Text>
            <Text style={[styles.time, isOwn && styles.ownTime]}>
              {item.timestamp}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (!isJoined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.joinContainer}>
          <Text style={styles.title}>Join Chat</Text>
          <Text style={styles.subtitle}>Enter your username</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            placeholderTextColor={'grey'}
            onChangeText={setUsername}
          />
          <TouchableOpacity
            style={[styles.button, !isConnected && styles.disabled]}
            onPress={handleJoin}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Group Chat</Text>
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              isConnected ? styles.connectedDot : styles.disconnectedDot,
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={messageText}
            placeholderTextColor={'grey'}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.disabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  joinContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#222831',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555E68',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#A9A9A9',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  header: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectedDot: {
    backgroundColor: '#28A745',
  },
  disconnectedDot: {
    backgroundColor: '#DC3545',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
  },

  // Chat
  chatContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  system: {
    alignItems: 'center',
  },
  systemText: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: '#6C757D',
    borderRadius: 6,
  },
  own: {
    alignItems: 'flex-end',
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    maxWidth: '75%',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  ownBubble: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
    alignSelf: 'flex-end',
  },
  sender: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 2,
  },
  ownSender: {
    color: '#FFFFFF',
  },
  text: {
    fontSize: 15,
    color: '#343A40',
  },
  ownText: {
    color: '#FFFFFF',
  },
  time: {
    fontSize: 11,
    color: '#ADB5BD',
    marginTop: 4,
    textAlign: 'right',
  },
  ownTime: {
    color: '#E0ECFF',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007BFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
