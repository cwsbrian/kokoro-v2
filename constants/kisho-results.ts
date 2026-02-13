/**
 * Kishō (起承転結) type data for the "나" results screen.
 * Keys match kisho.fullType from scoreCalculator.determineKishoType().
 * Icon names are Material Icons (MaterialIcons from @expo/vector-icons).
 */

export type KishoTypeKey = string;

export interface KishoResult {
  icon: string
  label: string
  description: string
  /** hex 색상 (아바타·라벨 등에 사용, primary 아님) */
  color: string
  /** 이 유형의 특징 3~5개 */
  traits: string[]
  /** 키워드 3~6개 (칩/태그용) */
  keywords: string[]
}

export const KISHO_RESULTS: Record<KishoTypeKey, KishoResult> = {
  'Outer-Harmony-Feeling-Fixed': {
    icon: 'group-work',
    label: '조화로운 팀플레이어',
    color: '#3B82F6',
    traits: ['협업을 중시함', '계획적이고 체계적', '공감 능력이 뛰어남', '팀워크에서 빛을 발함', '안정적인 환경 선호'],
    keywords: ['팀워크', '감성', '계획', '협력', '공감'],
    description:
      '외향적이면서도 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 타인과의 협력을 통해 목표를 달성하며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다. 팀워크와 공감 능력이 뛰어나며, 구조화된 환경에서 사람들과 함께 성장하는 것을 선호합니다.',
  },
  'Outer-Harmony-Feeling-Flow': {
    icon: 'celebration',
    label: '유연한 협력가',
    color: '#0EA5E9',
    traits: ['협력을 즐김', '변화에 잘 적응', '새로운 경험에 열려 있음', '창의적', '유연한 사고'],
    keywords: ['협력', '유연', '창의', '적응', '열림'],
    description:
      '외향적이고 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 타인과의 협력을 즐기며, 변화하는 상황에 쉽게 적응합니다. 새로운 경험과 가능성을 열어두고, 사람들과 함께하는 과정에서 창의력을 발휘합니다.',
  },
  'Outer-Harmony-Logic-Fixed': {
    icon: 'gavel',
    label: '논리적인 협업가',
    color: '#6366F1',
    traits: ['효율적인 협업', '체계적인 계획', '객관적 판단', '목표 지향적', '구조화된 환경 선호'],
    keywords: ['논리', '협업', '계획', '효율', '객관'],
    description:
      '외향적이면서도 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 효율적인 협업과 체계적인 계획을 통해 목표를 달성하며, 구조화된 환경에서 최고의 성과를 냅니다.',
  },
  'Outer-Harmony-Logic-Flow': {
    icon: 'account-tree',
    label: '함께하는 해결사',
    color: '#8B5CF6',
    traits: ['협력으로 문제 해결', '논리적 대응', '변화에 유연', '타인과 소통 능숙', '균형 감각'],
    keywords: ['협력', '논리', '해결', '유연', '소통'],
    description:
      '외향적이고 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 타인과의 협력을 통해 문제를 해결하며, 변화하는 상황에 논리적으로 대응합니다.',
  },
  'Outer-Solitude-Feeling-Fixed': {
    icon: 'person',
    label: '나만의 감성가',
    color: '#D946EF',
    traits: ['자신만의 방식으로 목표 달성', '독립적 활동 선호', '감정과 가치 중시', '계획적', '안정 추구'],
    keywords: ['독립', '감성', '계획', '자기주도', '가치'],
    description:
      '외향적이지만 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 자신만의 방식으로 목표를 달성하며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다.',
  },
  'Outer-Solitude-Feeling-Flow': {
    icon: 'self-improvement',
    label: '열린 마음 탐험가',
    color: '#EC4899',
    traits: ['새로운 경험 추구', '자신만의 가치 중요', '변화에 쉽게 적응', '유연한 태도', '성장 지향'],
    keywords: ['탐험', '가치', '유연', '성장', '열림'],
    description:
      '외향적이지만 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 새로운 경험을 추구하면서도 자신만의 가치를 중요하게 여기며, 변화하는 상황에 쉽게 적응합니다.',
  },
  'Outer-Solitude-Logic-Fixed': {
    icon: 'precision-manufacturing',
    label: '효율적 독립가',
    color: '#F43F5E',
    traits: ['효율성과 객관성 중시', '독립적 업무 선호', '체계적 접근', '목표 명확', '구조화된 환경'],
    keywords: ['효율', '독립', '객관', '체계', '목표'],
    description:
      '외향적이지만 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 효율성과 객관성을 중시하며, 구조화된 환경에서 자신만의 방식으로 목표를 달성합니다.',
  },
  'Outer-Solitude-Logic-Flow': {
    icon: 'psychology',
    label: '객관적 유연가',
    color: '#F97316',
    traits: ['객관적 분석', '변화에 논리적 대응', '독립적 사고', '유연한 접근', '문제 해결 능력'],
    keywords: ['객관', '유연', '분석', '논리', '해결'],
    description:
      '외향적이지만 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 객관적인 분석을 통해 문제를 해결하며, 변화하는 상황에 논리적으로 대응합니다.',
  },
  'Inner-Harmony-Feeling-Fixed': {
    icon: 'favorite',
    label: '깊은 관계형',
    color: '#EAB308',
    traits: ['깊이 있는 관계 형성', '조화 중시', '계획적이고 안정적', '자신만의 시간 필요', '감정과 가치 중시'],
    keywords: ['관계', '조화', '감성', '깊이', '안정'],
    description:
      '내향적이면서도 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 깊이 있는 관계를 형성하며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다. 타인과의 조화를 중시하면서도 자신만의 공간과 시간을 필요로 합니다.',
  },
  'Inner-Harmony-Feeling-Flow': {
    icon: 'spa',
    label: '조화로운 내향인',
    color: '#84CC16',
    traits: ['깊은 관계 형성', '유연한 환경 선호', '감정적 대응', '조화 중시', '변화에 열려 있음'],
    keywords: ['조화', '감성', '유연', '관계', '내향'],
    description:
      '내향적이면서도 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 깊이 있는 관계를 형성하며, 변화하는 상황에 감정적으로 대응합니다. 타인과의 조화를 중시하면서도 유연한 환경을 선호합니다.',
  },
  'Inner-Harmony-Logic-Fixed': {
    icon: 'menu-book',
    label: '체계적 사색가',
    color: '#10B981',
    traits: ['깊이 있는 사고', '체계적 계획', '구조화된 환경 선호', '논리적 접근', '목표 달성력'],
    keywords: ['사색', '체계', '논리', '계획', '깊이'],
    description:
      '내향적이면서도 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 깊이 있는 사고와 체계적인 계획을 통해 목표를 달성하며, 구조화된 환경에서 최고의 성과를 냅니다.',
  },
  'Inner-Harmony-Logic-Flow': {
    icon: 'hub',
    label: '적응하는 사유가',
    color: '#14B8A6',
    traits: ['깊이 있는 사고', '변화에 논리적 대응', '문제 해결 능력', '유연한 사유', '적응력'],
    keywords: ['사유', '논리', '적응', '유연', '해결'],
    description:
      '내향적이면서도 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 깊이 있는 사고를 통해 문제를 해결하며, 변화하는 상황에 논리적으로 대응합니다.',
  },
  'Inner-Solitude-Feeling-Fixed': {
    icon: 'bedtime',
    label: '고요한 성찰가',
    color: '#06B6D4',
    traits: ['자신만의 가치와 감정 중시', '내적 성찰', '계획적 환경 선호', '독립적 활동', '깊은 사고'],
    keywords: ['성찰', '감성', '독립', '내면', '가치'],
    description:
      '내향적이고 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 자신만의 가치와 감정을 중요하게 여기며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다. 깊이 있는 사고와 내적 성찰을 통해 성장합니다.',
  },
  'Inner-Solitude-Feeling-Flow': {
    icon: 'water-drop',
    label: '흐르는 성장가',
    color: '#2563EB',
    traits: ['내적 성찰', '유연한 환경 선호', '감정적 대응', '자신만의 가치 중시', '성장 지향'],
    keywords: ['성장', '유연', '감성', '내면', '흐름'],
    description:
      '내향적이고 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 자신만의 가치와 감정을 중요하게 여기며, 변화하는 상황에 감정적으로 대응합니다. 깊이 있는 사고와 내적 성찰을 통해 성장하며, 유연한 환경을 선호합니다.',
  },
  'Inner-Solitude-Logic-Fixed': {
    icon: 'science',
    label: '독립적 분석가',
    color: '#64748B',
    traits: ['깊이 있는 사고', '논리적 분석', '독립적·체계적 접근', '구조화된 환경 선호', '목표 달성력'],
    keywords: ['분석', '논리', '독립', '체계', '깊이'],
    description:
      '내향적이고 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 깊이 있는 사고와 논리적 분석을 통해 목표를 달성하며, 구조화된 환경에서 최고의 성과를 냅니다. 독립적이고 체계적인 접근을 통해 문제를 해결합니다.',
  },
  'Inner-Solitude-Logic-Flow': {
    icon: 'lightbulb',
    label: '유연한 사유가',
    color: '#A855F7',
    traits: ['논리적 분석', '유연한 접근', '변화에 논리적 대응', '독립적 사유', '성장 지향'],
    keywords: ['사유', '유연', '논리', '독립', '성장'],
    description:
      '내향적이고 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 깊이 있는 사고와 논리적 분석을 통해 문제를 해결하며, 변화하는 상황에 논리적으로 대응합니다. 독립적이고 유연한 접근을 통해 성장합니다.',
  },
}
