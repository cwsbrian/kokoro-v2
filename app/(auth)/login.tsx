import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { FontAwesome } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const toast = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.show({
        placement: "top",
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>오류</ToastTitle>
            <ToastDescription>
              이메일과 비밀번호를 입력해주세요.
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      let errorMessage = "로그인에 실패했습니다.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "등록되지 않은 이메일입니다.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "비밀번호가 올바르지 않습니다.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "올바른 이메일 형식이 아닙니다.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
      }
      toast.show({
        placement: "top",
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>로그인 실패</ToastTitle>
            <ToastDescription>{errorMessage}</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const tokens = await GoogleSignin.getTokens();
      console.log("Google tokens:", tokens);
      console.log("User info:", userInfo);

      if (tokens.idToken) {
        await signInWithGoogle(tokens.idToken);
        router.replace("/(tabs)");
      } else {
        toast.show({
          placement: "top",
          render: () => (
            <Toast action="error" variant="outline">
              <ToastTitle>구글 로그인 실패</ToastTitle>
              <ToastDescription>ID 토큰을 가져올 수 없습니다.</ToastDescription>
            </Toast>
          ),
        });
      }
    } catch (error: any) {
      const code = error?.code ?? "";
      const msg = error?.message ?? String(error);
      __DEV__ && console.warn("Google Sign-In error", { code, message: msg });
      toast.show({
        placement: "top",
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>구글 로그인 실패</ToastTitle>
            <ToastDescription>
              구글 로그인 중 오류가 발생했습니다. 다시 시도해주세요.
            </ToastDescription>
          </Toast>
        ),
      });
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    });
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-0"
    >
      <Box className="flex-1 justify-center px-6 gap-4">
        <Box className="items-center mb-8">
          <Heading size="3xl" className="text-center">
            Kokoro
          </Heading>
          <Text className="text-typography-500 text-sm mt-2 text-center italic">
            한 편의 시로 그려내는 당신이라는 세계
          </Text>
        </Box>

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
          placeholder="비밀번호"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="h-12 rounded-lg justify-center items-center mt-2 bg-primary-500 "
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-white text-base font-semibold">
            {isLoading ? "로그인 중..." : "로그인"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="h-12 rounded-lg justify-center items-center mt-2 bg-white dark:bg-gray-900 border border-outline-300 dark:border-gray-800 flex-row gap-3 shadow-sm"
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <FontAwesome name="google" size={20} color="#DB4437" />
          <Text className="text-gray-900 dark:text-white text-base font-semibold">
            {isLoading ? "구글 로그인 중..." : "Google로 계속하기"}
          </Text>
        </TouchableOpacity>

        <Box className="flex-row justify-center mt-6">
          <Text>계정이 없으신가요? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-primary-500 font-semibold">회원가입</Text>
            </TouchableOpacity>
          </Link>
        </Box>
      </Box>
    </KeyboardAvoidingView>
  );
}
