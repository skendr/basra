import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../src/hooks/useSocket';
import { useAppStore } from '../src/store/useAppStore';
import { getSocket } from '../src/services/socket';
import { colors, spacing, fontSize, borderRadius } from '../src/theme';

function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}: ${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

const NICKNAME_KEY = '@basra/nickname';

export default function JoinByCodeScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { joinRoom } = useSocket();
  const { nickname, setNickname, setIsHost } = useAppStore();

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

  const handleJoin = useCallback(() => {
    if (!nickname.trim()) {
      showAlert('Enter a nickname', 'Please enter your name first.');
      return;
    }
    if (!code) return;

    setLoading(true);
    setIsHost(false);

    const socket = getSocket();

    const onRoomJoined = () => {
      cleanup();
      router.replace('/lobby');
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

    joinRoom(code.toUpperCase(), nickname.trim());
  }, [nickname, code, joinRoom, setIsHost, router]);

  const roomCode = code?.toUpperCase() || '';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>BASRA</Text>
        <Text style={styles.subtitle}>Egyptian Card Game</Text>

        <View style={styles.inviteCard}>
          <Text style={styles.inviteLabel}>YOU'VE BEEN INVITED</Text>
          <Text style={styles.roomCode}>{roomCode}</Text>
        </View>

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

        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.joinButtonText}>Join Game</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeLink}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeLinkText}>Or create your own game</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: spacing.xl,
  },
  inviteCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: spacing.xl,
  },
  inviteLabel: {
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  roomCode: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 8,
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
  joinButton: {
    width: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  joinButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  homeLink: {
    marginTop: spacing.md,
  },
  homeLinkText: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    textDecorationLine: 'underline',
  },
});
