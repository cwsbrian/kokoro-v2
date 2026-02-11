export type OnboardingSlide = {
  title: string;
  description: string;
  image?: number;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: '나를 알아가는 여정',
    description:
      '시 카드를 통해 끊임없이 던져지는 철학적 질문들. 공감하거나 비공감하는 순간, 당신의 생각을 재점검하고 자신에 대해 더 깊이 알아가는 여정이 시작됩니다. 단순한 성향 테스트가 아닌, 나 자신을 탐구하는 성찰의 시간을 경험해보세요.',
    image: require('../images/generated-1770674593580.png'),
  },
  {
    title: '기승형으로 표현되는 나의 성향',
    description:
      '철학적 질문에 대한 당신의 반응들이 모여 기승형(Kishō Type) 태그로 표현되는 독특한 성향을 만들어냅니다. 나만의 기승형을 확인하고 더 깊이 있는 자기 이해를 경험해보세요.',
    image: require('../images/generated-1770674616531.png'),
  },

  {
    title: '지금 시작해보세요',
    description:
      '로그인하고 나만의 자기 탐구 여정을 시작하세요. 시간이 지나면서 변화하는 당신의 생각과 성향을 추적할 수 있습니다.',
    image: require('../images/generated-1770674638228.png'),
  },
];
