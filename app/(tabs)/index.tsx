import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch {
      toast.show({
        placement: 'top',
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>오류</ToastTitle>
            <ToastDescription>로그아웃에 실패했습니다.</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  return (
    <Box className="flex-1 p-4 bg-background-0">
      <Box className="gap-2 mb-4 p-4 rounded-lg bg-background-50">
        <Text size="lg" className="font-semibold">
          로그인 정보
        </Text>
        <Text>{user?.email}</Text>
      </Box>
      <Box className="mt-6 items-center">
        <TouchableOpacity
          className="bg-error-500 px-8 py-3 rounded-lg"
          onPress={handleLogout}
        >
          <Text className="text-white text-base font-semibold">로그아웃</Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}
