import { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const toast = useToast();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      toast.show({
        placement: 'top',
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>오류</ToastTitle>
            <ToastDescription>모든 필드를 입력해주세요.</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    if (password.length < 6) {
      toast.show({
        placement: 'top',
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>오류</ToastTitle>
            <ToastDescription>비밀번호는 6자 이상이어야 합니다.</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.show({
        placement: 'top',
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>오류</ToastTitle>
            <ToastDescription>비밀번호가 일치하지 않습니다.</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      toast.show({
        placement: 'top',
        render: () => (
          <Toast action="success" variant="outline">
            <ToastTitle>성공</ToastTitle>
            <ToastDescription>회원가입이 완료되었습니다!</ToastDescription>
          </Toast>
        ),
      });
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.replace('/login');
    } catch (error: any) {
      let errorMessage = '회원가입에 실패했습니다.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
      }
      toast.show({
        placement: 'top',
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>회원가입 실패</ToastTitle>
            <ToastDescription>{errorMessage}</ToastDescription>
          </Toast>
        ),
      });
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
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          className="h-12 rounded-lg border border-outline-200 bg-background-50 px-4 text-typography-900 dark:text-typography-0 dark:bg-background-800 dark:border-outline-700"
          placeholder="비밀번호 (6자 이상)"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          className="h-12 rounded-lg border border-outline-200 bg-background-50 px-4 text-typography-900 dark:text-typography-0 dark:bg-background-800 dark:border-outline-700"
          placeholder="비밀번호 확인"
          placeholderTextColor="#9CA3AF"
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
