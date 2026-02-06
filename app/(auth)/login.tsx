import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      let errorMessage = '로그인에 실패했습니다.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = '등록되지 않은 이메일입니다.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = '비밀번호가 올바르지 않습니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      }
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log(response);
      
    } catch (error: any) {
      Alert.alert('구글 로그인 실패', error.message);
    }
  };

  useEffect(() => {
    GoogleSignin.configure();
  }), [];
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor }]}
    >
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          로그인
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
          placeholder="비밀번호"
          placeholderTextColor={useThemeColor(
            { light: '#687076', dark: '#9BA1A6' },
            'icon'
          )}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
            {isLoading ? '로그인 중...' : '로그인'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
            {isLoading ? '구글 로그인 중...' : '구글 로그인'}
          </ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.footer}>
          <ThemedText>계정이 없으신가요? </ThemedText>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <ThemedText style={[styles.link, { color: tintColor }]}
                >회원가입</ThemedText>
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
