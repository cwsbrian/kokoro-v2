import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const backgroundColor = useThemeColor(
    { light: '#fff', dark: '#151718' },
    'background'
  );
  const textColor = useThemeColor(
    { light: '#11181C', dark: '#ECEDEE' },
    'text'
  );
  const tintColor = useThemeColor(
    { light: '#0a7ea4', dark: '#fff' },
    'tint'
  );

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      Alert.alert('성공', '회원가입이 완료되었습니다!', [
        { text: '확인', onPress: () => router.replace('/login') },
      ]);
    } catch (error: any) {
      let errorMessage = '회원가입에 실패했습니다.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
      }
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor }]}
    >
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          회원가입
        </ThemedText>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: useThemeColor(
                { light: '#f5f5f5', dark: '#2a2a2a' },
                'background'
              ),
              color: textColor,
              borderColor: useThemeColor(
                { light: '#e0e0e0', dark: '#3a3a3a' },
                'icon'
              ),
            },
          ]}
          placeholder="이메일"
          placeholderTextColor={useThemeColor(
            { light: '#687076', dark: '#9BA1A6' },
            'icon'
          )}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: useThemeColor(
                { light: '#f5f5f5', dark: '#2a2a2a' },
                'background'
              ),
              color: textColor,
              borderColor: useThemeColor(
                { light: '#e0e0e0', dark: '#3a3a3a' },
                'icon'
              ),
            },
          ]}
          placeholder="비밀번호 (6자 이상)"
          placeholderTextColor={useThemeColor(
            { light: '#687076', dark: '#9BA1A6' },
            'icon'
          )}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: useThemeColor(
                { light: '#f5f5f5', dark: '#2a2a2a' },
                'background'
              ),
              color: textColor,
              borderColor: useThemeColor(
                { light: '#e0e0e0', dark: '#3a3a3a' },
                'icon'
              ),
            },
          ]}
          placeholder="비밀번호 확인"
          placeholderTextColor={useThemeColor(
            { light: '#687076', dark: '#9BA1A6' },
            'icon'
          )}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
            {isLoading ? '회원가입 중...' : '회원가입'}
          </ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.footer}>
          <ThemedText>이미 계정이 있으신가요? </ThemedText>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <ThemedText style={[styles.link, { color: tintColor }]}>
                로그인
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    fontWeight: '600',
  },
});
