import { Link } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

export default function ModalScreen() {
  return (
    <Box className="flex-1 items-center justify-center p-5 bg-background-0">
      <Heading size="3xl">This is a modal</Heading>
      <Link href="/" dismissTo className="mt-4 py-4">
        <Text className="text-info-700 underline">Go to home screen</Text>
      </Link>
    </Box>
  );
}
