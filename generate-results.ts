import * as fs from 'fs';

// 16가지 성향 데이터
const personalities = [
  {
    id: 'OHFF',
    key: 'Outer-Harmony-Feeling-Fixed',
    name: '조화로운 외향적 공감 리더',
    typeName: '외향적 조화형 감정 체계주의자',
    emoji: '🌅',
    bg: '#F8F6F3',
    charBg: '#E8D5C4',
    primary: '#667EEA',
    desc: '외향적이면서도 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 타인과의 협력을 통해 목표를 달성하며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다.',
    traits: ['팀워크와 협업 능력', '높은 공감 능력', '체계적인 계획 수립'],
    traitColors: ['#667EEA', '#10B981', '#F59E0B'],
    badges: [
      { text: '외향', color: '#667EEA' },
      { text: '조화', color: '#10B981' },
      { text: '감정', color: '#F59E0B' },
      { text: '체계', color: '#8B5CF6' }
    ]
  },
  {
    id: 'OHFL',
    key: 'Outer-Harmony-Feeling-Flow',
    name: '자유로운 외향적 공감 예술가',
    typeName: '외향적 조화형 감정 유연주의자',
    emoji: '🎨',
    bg: '#F5F3F8',
    charBg: '#DDD5E8',
    primary: '#8B5CF6',
    desc: '외향적이고 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 타인과의 협력을 즐기며, 변화하는 상황에 쉽게 적응합니다.',
    traits: ['적응력과 유연성', '창의적 문제 해결', '새로운 경험 추구'],
    traitColors: ['#8B5CF6', '#EC4899', '#F59E0B'],
    badges: [
      { text: '외향', color: '#667EEA' },
      { text: '조화', color: '#10B981' },
      { text: '감정', color: '#F59E0B' },
      { text: '유연', color: '#EC4899' }
    ]
  },
  {
    id: 'OHLF',
    key: 'Outer-Harmony-Logic-Fixed',
    name: '체계적인 외향적 협업 전문가',
    typeName: '외향적 조화형 논리 체계주의자',
    emoji: '📊',
    bg: '#F0F7FF',
    charBg: '#C4D4E8',
    primary: '#3B82F6',
    desc: '외향적이면서도 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 효율적인 협업과 체계적인 계획을 통해 목표를 달성합니다.',
    traits: ['효율적인 협업', '논리적 의사결정', '체계적 계획 수립'],
    traitColors: ['#3B82F6', '#10B981', '#8B5CF6'],
    badges: [
      { text: '외향', color: '#667EEA' },
      { text: '조화', color: '#10B981' },
      { text: '논리', color: '#3B82F6' },
      { text: '체계', color: '#8B5CF6' }
    ]
  },
  {
    id: 'OHLL',
    key: 'Outer-Harmony-Logic-Flow',
    name: '유연한 외향적 문제 해결사',
    typeName: '외향적 조화형 논리 유연주의자',
    emoji: '🌊',
    bg: '#F5F7FA',
    charBg: '#D4E4F7',
    primary: '#0EA5E9',
    desc: '외향적이고 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 타인과의 협력을 통해 문제를 해결합니다.',
    traits: ['협업을 통한 문제해결', '논리적 대응 능력', '변화에 대한 적응력'],
    traitColors: ['#0EA5E9', '#3B82F6', '#10B981'],
    badges: [
      { text: '외향', color: '#667EEA' },
      { text: '조화', color: '#10B981' },
      { text: '논리', color: '#3B82F6' },
      { text: '유연', color: '#EC4899' }
    ]
  },
  {
    id: 'OSFF',
    key: 'Outer-Solitude-Feeling-Fixed',
    name: '독립적인 외향적 가치 추구자',
    typeName: '외향적 독립형 감정 체계주의자',
    emoji: '🦁',
    bg: '#FFF8F0',
    charBg: '#F5DEB3',
    primary: '#D97706',
    desc: '외향적이지만 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 자신만의 방식으로 목표를 달성합니다.',
    traits: ['자신만의 방식으로 목표 달성', '감정과 가치 중시', '체계적 접근'],
    traitColors: ['#D97706', '#F59E0B', '#8B5CF6'],
    badges: [
      { text: '외향', color: '#667EEA' },
      { text: '독립', color: '#475569' },
      { text: '감정', color: '#F59E0B' },
      { text: '체계', color: '#8B5CF6' }
    ]
  },
  {
    id: 'OSFL',
    key: 'Outer-Solitude-Feeling-Flow',
    name: '자유로운 외향적 가치 탐험가',
    typeName: '외향적 독립형 감정 유연주의자',
    emoji: '🦅',
    bg: '#FFFBEB',
    charBg: '#FDE68A',
    primary: '#B45309',
    desc: '외향적이지만 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 새로운 경험을 추구하면서도 자신만의 가치를 중요하게 여깁니다.',
    traits: ['새로운 경험 추구', '자신만의 가치 중시', '변화에 대한 적응력'],
    traitColors: ['#B45309', '#F59E0B', '#EC4899'],
    badges: [
      { text: '외향', color: '#667EEA' },
      { text: '독립', color: '#475569' },
      { text: '감정', color: '#F59E0B' },
      { text: '유연', color: '#EC4899' }
    ]
  },
  {
    id: 'OSLF',
    key: 'Outer-Solitude-Logic-Fixed',
    name: '효율적인 외향적 독립 전략가',
    typeName: '외향적 독립형 논리 체계주의자',
    emoji: '🎯',
    bg: '#F0F9FF',
    charBg: '#BAE6FD',
    primary: '#0369A1',
    desc: '외향적이지만 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 효율성과 객관성을 중시하며, 구조화된 환경에서 자신만의 방식으로 목표를 달성합니다.',
    traits: ['효율성과 객관성 추구', '독립적 문제 해결', '체계적 목표 달성'],
    traitColors: ['#0369A1', '#3B82F6', '#8B5CF6'],
    badges: [
      { text: '외향', color: '#667EEA' },
      { text: '독립', color: '#475569' },
      { text: '논리', color: '#3B82F6' },
      { text: '체계', color: '#8B5CF6' }
    ]
  },
  {
    id: 'OSLL',
    key: 'Outer-Solitude-Logic-Flow',
    name: '유연한 외향적 독립 혁신가',
    typeName: '외향적 독립형 논리 유연주의자',
    emoji: '🚀',
    bg: '#F5F7FA',
    charBg: '#E2E8F0',
    primary: '#475569',
    desc: '외향적이지만 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 객관적인 분석을 통해 문제를 해결하며, 변화하는 상황에 논리적으로 대응합니다.',
    traits: ['객관적 분석 능력', '독립적 문제 해결', '유연한 적응력'],
    traitColors: ['#475569', '#3B82F6', '#EC4899'],
    badges: [
      { text: '외향', color: '#667EEA' },
      { text: '독립', color: '#475569' },
      { text: '논리', color: '#3B82F6' },
      { text: '유연', color: '#EC4899' }
    ]
  },
  {
    id: 'IHFF',
    key: 'Inner-Harmony-Feeling-Fixed',
    name: '깊이 있는 내향적 공감 파트너',
    typeName: '내향적 조화형 감정 체계주의자',
    emoji: '🌺',
    bg: '#FDF2F8',
    charBg: '#FBCFE8',
    primary: '#DB2777',
    desc: '내향적이면서도 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 깊이 있는 관계를 형성하며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다.',
    traits: ['깊이 있는 관계 형성', '감정과 가치 중시', '계획적이고 안정적인 성향'],
    traitColors: ['#DB2777', '#F59E0B', '#8B5CF6'],
    badges: [
      { text: '내향', color: '#64748B' },
      { text: '조화', color: '#10B981' },
      { text: '감정', color: '#F59E0B' },
      { text: '체계', color: '#8B5CF6' }
    ]
  },
  {
    id: 'IHFL',
    key: 'Inner-Harmony-Feeling-Flow',
    name: '따뜻한 내향적 공감 치유사',
    typeName: '내향적 조화형 감정 유연주의자',
    emoji: '🌸',
    bg: '#FFF5F5',
    charBg: '#FCE4E4',
    primary: '#EC4899',
    desc: '내향적이면서도 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 깊이 있는 관계를 형성하며, 변화하는 상황에 감정적으로 대응합니다.',
    traits: ['깊이 있는 공감 능력', '유연한 관계 형성', '감정적 지혜'],
    traitColors: ['#EC4899', '#10B981', '#F59E0B'],
    badges: [
      { text: '내향', color: '#64748B' },
      { text: '조화', color: '#10B981' },
      { text: '감정', color: '#F59E0B' },
      { text: '유연', color: '#EC4899' }
    ]
  },
  {
    id: 'IHLF',
    key: 'Inner-Harmony-Logic-Fixed',
    name: '사려 깊은 내향적 조화 계획가',
    typeName: '내향적 조화형 논리 체계주의자',
    emoji: '📚',
    bg: '#F5F3FF',
    charBg: '#DDD6FE',
    primary: '#7C3AED',
    desc: '내향적이면서도 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 깊이 있는 사고와 체계적인 계획을 통해 목표를 달성합니다.',
    traits: ['깊이 있는 사고력', '논리적 분석 능력', '체계적 계획 수립'],
    traitColors: ['#7C3AED', '#3B82F6', '#8B5CF6'],
    badges: [
      { text: '내향', color: '#64748B' },
      { text: '조화', color: '#10B981' },
      { text: '논리', color: '#3B82F6' },
      { text: '체계', color: '#8B5CF6' }
    ]
  },
  {
    id: 'IHLL',
    key: 'Inner-Harmony-Logic-Flow',
    name: '유연한 내향적 조화 분석가',
    typeName: '내향적 조화형 논리 유연주의자',
    emoji: '🍃',
    bg: '#ECFDF5',
    charBg: '#A7F3D0',
    primary: '#059669',
    desc: '내향적이면서도 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 깊이 있는 사고를 통해 문제를 해결합니다.',
    traits: ['깊이 있는 사고력', '논리적 문제 해결', '유연한 대응 능력'],
    traitColors: ['#059669', '#3B82F6', '#10B981'],
    badges: [
      { text: '내향', color: '#64748B' },
      { text: '조화', color: '#10B981' },
      { text: '논리', color: '#3B82F6' },
      { text: '유연', color: '#EC4899' }
    ]
  },
  {
    id: 'ISFF',
    key: 'Inner-Solitude-Feeling-Fixed',
    name: '깊이 있는 내향적 성찰가',
    typeName: '내향적 독립형 감정 체계주의자',
    emoji: '🦉',
    bg: '#FAF5FF',
    charBg: '#E9D5FF',
    primary: '#9333EA',
    desc: '내향적이고 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 자신만의 가치와 감정을 중요하게 여기며, 깊이 있는 사고와 내적 성찰을 통해 성장합니다.',
    traits: ['깊이 있는 내적 성찰', '자신만의 가치 중시', '체계적 성장'],
    traitColors: ['#9333EA', '#F59E0B', '#8B5CF6'],
    badges: [
      { text: '내향', color: '#64748B' },
      { text: '독립', color: '#475569' },
      { text: '감정', color: '#F59E0B' },
      { text: '체계', color: '#8B5CF6' }
    ]
  },
  {
    id: 'ISFL',
    key: 'Inner-Solitude-Feeling-Flow',
    name: '유연한 내향적 감성 탐구자',
    typeName: '내향적 독립형 감정 유연주의자',
    emoji: '🦋',
    bg: '#FFF7ED',
    charBg: '#FED7AA',
    primary: '#C2410C',
    desc: '내향적이고 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 자신만의 가치와 감정을 중요하게 여기며, 유연한 환경을 선호합니다.',
    traits: ['깊이 있는 사고와 성찰', '감정적 대응 능력', '유연한 성장'],
    traitColors: ['#C2410C', '#F59E0B', '#EC4899'],
    badges: [
      { text: '내향', color: '#64748B' },
      { text: '독립', color: '#475569' },
      { text: '감정', color: '#F59E0B' },
      { text: '유연', color: '#EC4899' }
    ]
  },
  {
    id: 'ISLF',
    key: 'Inner-Solitude-Logic-Fixed',
    name: '깊이 있는 내향적 분석가',
    typeName: '내향적 독립형 논리 체계주의자',
    emoji: '🔬',
    bg: '#F0F4F8',
    charBg: '#C4D4E8',
    primary: '#1E3A5F',
    desc: '내향적이고 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 깊이 있는 사고와 논리적 분석을 통해 목표를 달성합니다.',
    traits: ['논리적 사고와 분석', '독립적 문제 해결', '체계적인 접근'],
    traitColors: ['#1E3A5F', '#3B82F6', '#8B5CF6'],
    badges: [
      { text: '내향', color: '#64748B' },
      { text: '독립', color: '#475569' },
      { text: '논리', color: '#3B82F6' },
      { text: '체계', color: '#8B5CF6' }
    ]
  },
  {
    id: 'ISLL',
    key: 'Inner-Solitude-Logic-Flow',
    name: '유연한 내향적 독립 혁신가',
    typeName: '내향적 독립형 논리 유연주의자',
    emoji: '🧩',
    bg: '#F8FAFC',
    charBg: '#E2E8F0',
    primary: '#475569',
    desc: '내향적이고 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 깊이 있는 사고와 논리적 분석을 통해 문제를 해결하며, 독립적이고 유연한 접근을 통해 성장합니다.',
    traits: ['논리적 분석 능력', '독립적 사고', '유연한 문제 해결'],
    traitColors: ['#475569', '#3B82F6', '#EC4899'],
    badges: [
      { text: '내향', color: '#64748B' },
      { text: '독립', color: '#475569' },
      { text: '논리', color: '#3B82F6' },
      { text: '유연', color: '#EC4899' }
    ]
  }
];

function generateResultScreen(p: typeof personalities[0], x: number): string {
  const children: any[] = [
    // Title
    { type: 'text', id: `title_${p.id}`, x: 0, y: 20, width: 400, height: 30, fill: '#1A1A1A', content: '나의 성향 결과', fontFamily: 'Inter', fontSize: 18, fontWeight: '600', textAlign: 'center' },
    // Character background with emoji
    { type: 'frame', id: `char_${p.id}`, x: 100, y: 60, width: 200, height: 200, cornerRadius: 100, fill: p.charBg, children: [{ type: 'text', id: `emoji_${p.id}`, x: 60, y: 60, fill: '#1A1A1A', content: p.emoji, fontSize: 80 }] },
    // Character name
    { type: 'text', id: `charName_${p.id}`, x: 0, y: 270, width: 400, height: 25, fill: p.primary, content: p.name, fontFamily: 'Inter', fontSize: 16, fontWeight: '600', textAlign: 'center' }
  ];

  // Badges
  p.badges.forEach((badge, i) => {
    children.push({
      type: 'frame',
      id: `b${i + 1}_${p.id}`,
      x: 25 + i * 90,
      y: 305,
      width: 80,
      height: 28,
      cornerRadius: 14,
      fill: badge.color,
      children: [{ type: 'text', id: `t${i + 1}_${p.id}`, x: 26, y: 6, fill: '#FFFFFF', content: badge.text, fontFamily: 'Inter', fontSize: 12, fontWeight: '500' }]
    });
  });

  // Type label and name
  children.push(
    { type: 'text', id: `typeLabel_${p.id}`, x: 24, y: 350, fill: '#666666', content: '성향 유형', fontFamily: 'Inter', fontSize: 12, fontWeight: '500' },
    { type: 'text', id: `typeName_${p.id}`, x: 24, y: 370, fill: '#1A1A1A', content: p.typeName, fontFamily: 'Inter', fontSize: 20, fontWeight: '700' }
  );

  // Description - adjusted height to prevent cutoff
  const descHeight = p.desc.length > 80 ? 120 : 100;
  children.push({ type: 'text', id: `desc_${p.id}`, x: 24, y: 400, width: 352, height: descHeight, fill: '#4A4A4A', content: p.desc, fontFamily: 'Inter', fontSize: 14, lineHeight: 1.6 });

  // Traits section
  const traitsStartY = 400 + descHeight + 20;
  children.push({ type: 'text', id: `traitsLabel_${p.id}`, x: 24, y: traitsStartY, fill: '#666666', content: '주요 특성', fontFamily: 'Inter', fontSize: 12, fontWeight: '500' });

  p.traits.forEach((trait, i) => {
    children.push({
      type: 'frame',
      id: `tr${i + 1}_${p.id}`,
      x: 24,
      y: traitsStartY + 25 + i * 45,
      width: 352,
      height: 40,
      cornerRadius: 8,
      fill: '#FFFFFF',
      children: [
        { type: 'text', id: `tri${i + 1}_${p.id}`, x: 12, y: 12, fill: p.traitColors[i], content: '✦', fontSize: 14 },
        { type: 'text', id: `trt${i + 1}_${p.id}`, x: 30, y: 12, fill: '#1A1A1A', content: trait, fontFamily: 'Inter', fontSize: 14 }
      ]
    });
  });

  // Buttons
  const buttonsY = traitsStartY + 25 + p.traits.length * 45 + 15;
  children.push(
    { type: 'frame', id: `share_${p.id}`, x: 24, y: buttonsY, width: 170, height: 48, cornerRadius: 24, fill: '#FFFFFF', stroke: '#E0E0E0', strokeWidth: 1, children: [{ type: 'text', id: `st_${p.id}`, x: 55, y: 15, fill: '#1A1A1A', content: '공유하기', fontFamily: 'Inter', fontSize: 14, fontWeight: '600' }] },
    { type: 'frame', id: `retry_${p.id}`, x: 206, y: buttonsY, width: 170, height: 48, cornerRadius: 24, fill: p.primary, children: [{ type: 'text', id: `rt_${p.id}`, x: 50, y: 15, fill: '#FFFFFF', content: '다시 테스트', fontFamily: 'Inter', fontSize: 14, fontWeight: '600' }] }
  );

  return JSON.stringify({
    type: 'frame',
    id: `result_${p.id}`,
    x,
    y: 0,
    name: `Result - ${p.key}`,
    width: 400,
    height: 812,
    fill: p.bg,
    layout: 'none',
    children
  }, null, 2);
}

// Generate all 16 result screens
const startX = 3071;
const gap = 420;
const screens = personalities.map((p, i) => generateResultScreen(p, startX + i * gap));

// Write to file
const output = '[\n' + screens.join(',\n') + '\n]';
fs.writeFileSync('/Users/brianchoi/Documents/kokoro-v2/all-result-screens.json', output);

console.log('✅ Generated 16 result screens');
console.log('File saved to: all-result-screens.json');
