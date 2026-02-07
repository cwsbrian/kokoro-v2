import { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

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
      className="flex-1 bg-background-0"
    >
      <Box className="flex-1 justify-center px-6 gap-4">
        <Heading size="3xl" className="text-center mb-8">
          회원가입
        </Heading>

        <TextInput
          className="h-12 rounded-lg border border-outline-200 bg-background-50 px-4 text-typography-900 dark:text-typography-0 dark:bg-background-800 dark:border-outline-700"
          placeholder="이메일"
          placeholderTextColor="text-typography-400"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          className="h-12 rounded-lg border border-outline-200 bg-background-50 px-4 text-typography-900 dark:text-typography-0 dark:bg-background-800 dark:border-outline-700"
          placeholder="비밀번호 (6자 이상)"
          placeholderTextColor="text-typography-400"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          className="h-12 rounded-lg border border-outline-200 bg-background-50 px-4 text-typography-900 dark:text-typography-0 dark:bg-background-800 dark:border-outline-700"
          placeholder="비밀번호 확인"
          placeholderTextColor="text-typography-400"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="h-12 rounded-lg justify-center items-center mt-2 bg-primary-500"
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text className="text-white text-base font-semibold">
            {isLoading ? '회원가입 중...' : '회원가입'}
          </Text>
        </TouchableOpacity>

        <Box className="flex-row justify-center mt-6">
          <Text>이미 계정이 있으신가요? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary-500 font-semibold">로그인</Text>
            </TouchableOpacity>
          </Link>
        </Box>
      </Box>
    </KeyboardAvoidingView>
  );
}
