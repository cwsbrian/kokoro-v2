import { Image } from 'expo-image';
import { Platform, TouchableOpacity, Alert } from 'react-native';
import { Link, router } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch {
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          className="h-[178px] w-[290px] absolute bottom-0 left-0"
        />
      }>
      <Box className="flex-row items-center gap-2">
        <Heading size="3xl">Welcome!</Heading>
        <HelloWave />
      </Box>
      <Box className="gap-2 mb-4 p-4 rounded-lg bg-background-50">
        <Heading size="lg">로그인 정보</Heading>
        <Text>{user?.email}</Text>
      </Box>
      <Box className="gap-2 mb-2">
        <Heading size="lg">Step 1: Try it</Heading>
        <Text>
          Edit <Text bold>app/(tabs)/index.tsx</Text> to see changes.
          Press{' '}
          <Text bold>
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </Text>{' '}
          to open developer tools.
        </Text>
      </Box>
      <Box className="gap-2 mb-2">
        <Link href="/modal">
          <Link.Trigger>
            <Heading size="lg">Step 2: Explore</Heading>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <Text>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </Text>
      </Box>
      <Box className="gap-2 mb-2">
        <Heading size="lg">Step 3: Get a fresh start</Heading>
        <Text>
          {`When you're ready, run `}
          <Text bold>npm run reset-project</Text> to get a fresh{' '}
          <Text bold>app</Text> directory. This will move the current{' '}
          <Text bold>app</Text> to{' '}
          <Text bold>app-example</Text>.
        </Text>
      </Box>
      <Box className="mt-6 items-center">
        <TouchableOpacity 
          className="bg-error-500 px-8 py-3 rounded-lg"
          onPress={handleLogout}
        >
          <Text className="text-white text-base font-semibold">로그아웃</Text>
        </TouchableOpacity>
      </Box>
    </ParallaxScrollView>
  );
}
