import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}: ${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../src/hooks/useSocket';
import { useAppStore } from '../src/store/useAppStore';
import { getSocket } from '../src/services/socket';
import { colors, spacing, fontSize, borderRadius } from '../src/theme';

const NICKNAME_KEY = '@basra/nickname';

export default function HomeScreen() {
  const router = useRouter();
  const { createRoom, joinRoom } = useSocket();
  const { nickname, setNickname, setIsHost, setRoomCode, roomCode, targetScore } = useAppStore();

  const [joinCode, setJoinCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(NICKNAME_KEY).then((saved) => {
      if (saved) setNickname(saved);
    });
  }, []);

  const saveNickname = (name: string) => {
    setNickname(name);
    AsyncStorage.setItem(NICKNAME_KEY, name);
  };

  const handleCreate = useCallback(() => {
    if (!nickname.trim()) {
      showAlert('Enter a nickname', 'Please enter your name first.');
      return;
    }
    setLoading(true);
    setIsHost(true);

    const socket = getSocket();

    const onRoomCreated = () => {
      cleanup();
      router.push('/lobby');
    };
    const onError = (data: { message: string }) => {
      cleanup();
      showAlert('Error', data.message);
    };
    const cleanup = () => {
      setLoading(false);
      socket.off('room-created', onRoomCreated);
      socket.off('error', onError);
    };

    socket.on('room-created', onRoomCreated);
    socket.on('error', onError);

    createRoom(nickname.trim(), targetScore);
  }, [nickname, targetScore, createRoom, setIsHost, router]);

  const handleJoin = useCallback(() => {
    if (!nickname.trim()) {
      showAlert('Enter a nickname', 'Please enter your name first.');
      return;
    }
    if (!joinCode.trim()) {
      showAlert('Enter room code', 'Please enter a room code to join.');
      return;
    }
    setLoading(true);
    setIsHost(false);

    const socket = getSocket();

    const onRoomJoined = () => {
      cleanup();
      router.push('/lobby');
    };
    const onError = (data: { message: string }) => {
      cleanup();
      showAlert('Error', data.message);
    };
    const cleanup = () => {
      setLoading(false);
      socket.off('room-joined', onRoomJoined);
      socket.off('error', onError);
    };

    socket.on('room-joined', onRoomJoined);
    socket.on('error', onError);

    joinRoom(joinCode.trim().toUpperCase(), nickname.trim());
  }, [nickname, joinCode, joinRoom, setIsHost, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>BASRA</Text>
        <Text style={styles.subtitle}>Egyptian Card Game</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Nickname</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={saveNickname}
            placeholder="Enter your name"
            placeholderTextColor={colors.textMuted}
            maxLength={20}
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} disabled={loading}>
          {loading && !showJoin ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.primaryButtonText}>Create Game</Text>
          )}
        </TouchableOpacity>

        {!showJoin ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowJoin(true)}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Join Game</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.joinContainer}>
            <TextInput
              style={styles.codeInput}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="ROOM CODE"
              placeholderTextColor={colors.textMuted}
              maxLength={5}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity style={styles.joinButton} onPress={handleJoin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.primaryButtonText}>Join</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.targetText}>
          Target Score: {targetScore} pts
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: fontSize.huge,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 8,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textDim,
    marginBottom: spacing.xxl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  secondaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  joinContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  codeInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});
