// Preset variables for caption generation (Digipark Custom Schema)

// Shared interfaces
export interface PresetOption {
  value: string;
  label: string;
  labelEn: string;
  isCustom?: boolean;
}

export type VariableGroupKey = 'tone' | 'writingStyle' | 'perspective' | 'emotionalAppeal' | 'paces' | 'valueProposition' |
  'hookType' | 'openingTemplate' |
  'contentFramework' | 'targetAudience' |
  'captionLength' | 'emojiStyle' | 'paragraphStructure' |
  'ctaTone' |
  'timeliness' | 'trendElements';

export const PRESETS = {
  // 1. 📝 文案风格类 (Style & Tone)
  tone: {
    label: '语气/Tone',
    labelEn: 'Tone',
    options: [
      { value: 'immersive', label: '沉浸感 (Immersive)', labelEn: 'Immersive' },
      { value: 'futuristic', label: '未来感 (Futuristic)', labelEn: 'Futuristic/Tech' },
      { value: 'dreamy', label: '梦幻 (Dreamy)', labelEn: 'Dreamy/Ethereal' },
      { value: 'artistic', label: '艺术范 (Artistic)', labelEn: 'Artistic/Abstract' },
      { value: 'exciting', label: '兴奋 (Exciting)', labelEn: 'High-Energy' },
      { value: 'mysterious', label: '神秘 (Mysterious)', labelEn: 'Mysterious' },
      { value: 'family', label: '亲子友善 (Family)', labelEn: 'Family-Friendly' },
    ]
  },
  writingStyle: {
    label: '写作风格',
    labelEn: 'Writing Style',
    options: [
      { value: 'sensory', label: '感官描写 (Sensory)', labelEn: 'Sensory-focused' },
      { value: 'journey', label: '探索之旅 (Journey)', labelEn: 'Journey/Narrative' },
      { value: 'guide', label: '打卡攻略 (Guide)', labelEn: 'Guide/Tips' },
      { value: 'poetic', label: '诗意表达 (Poetic)', labelEn: 'Poetic' },
      { value: 'review', label: '真实测评 (Review)', labelEn: 'User Review' },
    ]
  },
  perspective: {
    label: '人称视角',
    labelEn: 'Perspective',
    options: [
      { value: 'explorer', label: '探险者 (我/我们)', labelEn: 'Explorer (First Person)' },
      { value: 'guide', label: '向导 (你/你们)', labelEn: 'Guide (Second Person)' },
      { value: 'narrator', label: '旁白 (它/Digipark)', labelEn: 'Narrator (Third Person)' },
    ]
  },
  emotionalAppeal: {
    label: '情感诉求',
    labelEn: 'Emotional Appeal',
    options: [
      { value: 'awe', label: '惊叹 (Awe)', labelEn: 'Awe/Wonder' },
      { value: 'curiosity', label: '好奇 (Curiosity)', labelEn: 'Curiosity' },
      { value: 'escape', label: '逃离现实 (Escape)', labelEn: 'Escapism' },
      { value: 'joy', label: '欢乐 (Joy)', labelEn: 'Pure Joy' },
      { value: 'inspiration', label: '灵感 (Inspiration)', labelEn: 'Creative Inspiration' },
    ]
  },
  paces: {
    label: '叙事节奏',
    labelEn: 'Paces',
    options: [
      { value: 'floating', label: '漂浮感 (Floating)', labelEn: 'Slow/Floating' },
      { value: 'dynamic', label: '动感 (Dynamic)', labelEn: 'Fast/Dynamic' },
      { value: 'unfolding', label: '层层揭秘 (Unfolding)', labelEn: 'Unfolding Mystery' },
      { value: 'mixed', label: '快慢交织 (Mixed)', labelEn: 'Mixed Tempo' },
    ]
  },
  valueProposition: {
    label: '价值主张',
    labelEn: 'Value Prop',
    options: [
      { value: 'photogenic', label: '出片圣地', labelEn: 'Instagrammable' },
      { value: 'interactive', label: '全感官互动', labelEn: 'Interactive Experience' },
      { value: 'date', label: '约会首选', labelEn: 'Perfect Date' },
      { value: 'family_fun', label: '溜娃神地', labelEn: 'Family Fun' },
      { value: 'tech_art', label: '科技艺术', labelEn: 'Tech x Art' },
      { value: 'indoor', label: '室内避暑/雨', labelEn: 'Indoor Activity' },
    ]
  },

  // 2. 🎯 开头Hook类 (Hooks)
  hookType: {
    label: '开头类型',
    labelEn: 'Hook Type',
    options: [
      { value: 'vision', label: '视觉冲击', labelEn: 'Visual Hook' },
      { value: 'location', label: '悉尼坐标', labelEn: 'Sydney Location' },
      { value: 'secret', label: '隐藏玩法', labelEn: 'Secret Reveal' },
      { value: 'question', label: '灵魂发问', labelEn: 'Question' },
      { value: 'invitation', label: '邀请函', labelEn: 'Invitation' },
    ]
  },
  openingTemplate: {
    label: '开场模板',
    labelEn: 'Opening Template',
    options: [
      { value: 'sydney_hidden', label: '悉尼竟然有...', labelEn: 'Hidden in Sydney...' },
      { value: 'future_now', label: '穿越到未来...', labelEn: 'Step into the future...' },
      { value: 'weekend_plan', label: '周末去哪儿...', labelEn: 'Weekend plans sorted...' },
      { value: 'art_alive', label: '当艺术活过来...', labelEn: 'When art comes alive...' },
    ]
  },

  // 3. 🎨 内容角度类 (Content Angle)
  contentFramework: {
    label: '内容框架',
    labelEn: 'Framework',
    options: [
      { value: 'tour', label: '沉浸式Tour', labelEn: 'Immersive Tour' },
      { value: 'photo_guide', label: '拍照机位攻略', labelEn: 'Photo Spot Guide' },
      { value: 'tech_explain', label: '黑科技揭秘', labelEn: 'Tech Behind-the-Scenes' },
      { value: 'reaction', label: '真实反应', labelEn: 'Reaction Video' },
      { value: 'vlog', label: '一日游Vlog', labelEn: 'Day Trip Vlog' },
    ]
  },
  targetAudience: {
    label: '目标受众',
    labelEn: 'Audience',
    options: [
      { value: 'couples', label: '情侣党', labelEn: 'Couples' },
      { value: 'parents', label: '宝爸宝妈', labelEn: 'Parents/Families' },
      { value: 'students', label: '留学生/学生', labelEn: 'Students' },
      { value: 'content_creators', label: '博主/摄影师', labelEn: 'Creators/Photographers' },
      { value: 'tourists', label: '游客', labelEn: 'Tourists' },
    ]
  },

  // 4. 📱 平台适配类 (Platform)
  captionLength: {
    label: '文案长度',
    labelEn: 'Length',
    options: [
      { value: 'short', label: '短 (Highlights)', labelEn: 'Short (Highlights)' },
      { value: 'medium', label: '中 (Story)', labelEn: 'Medium (Story)' },
      { value: 'long', label: '长 (Full Guide)', labelEn: 'Long (Full Guide)' },
    ]
  },
  emojiStyle: {
    label: 'Emoji风格',
    labelEn: 'Emoji',
    options: [
      { value: 'space', label: '太空科技 (🪐✨)', labelEn: 'Space/Tech' },
      { value: 'magic', label: '魔幻艺术 (🎨🔮)', labelEn: 'Art/Magic' },
      { value: 'party', label: '欢乐氛围 (🎉🥳)', labelEn: 'Party/Fun' },
      { value: 'minimal', label: '极简 (✨)', labelEn: 'Minimal' },
    ]
  },
  paragraphStructure: {
    label: '段落结构',
    labelEn: 'Structure',
    options: [
      { value: 'flow', label: '流淌式', labelEn: 'Flowing Text' },
      { value: 'list', label: '打卡清单', labelEn: 'Checklist' },
      { value: 'aesthetic', label: '唯美排版', labelEn: 'Aesthetic Spacing' },
    ]
  },

  // 5. 💡 CTA行动号召类 (CTA)
  ctaTone: {
    label: 'CTA语气',
    labelEn: 'CTA Tone',
    options: [
      { value: 'book_now', label: '立即预订', labelEn: 'Book Now' },
      { value: 'tag_friend', label: '艾特好友', labelEn: 'Tag a Friend' },
      { value: 'save_list', label: '收藏备用', labelEn: 'Save for Later' },
      { value: 'visit', label: '欢迎打卡', labelEn: 'Come Visit' },
    ]
  },

  // 6. 🌐 时效与趋势类 (Time & Trends)
  timeliness: {
    label: '时效性',
    labelEn: 'Timeliness',
    options: [
      { value: 'limited', label: '限时展览', labelEn: 'Limited Time' },
      { value: 'new_opening', label: '新开展', labelEn: 'Grand Opening' },
      { value: 'weekend', label: '周末热推', labelEn: 'Weekend Hotspot' },
      { value: 'school_holiday', label: '假期去处', labelEn: 'School Holidays' },
    ]
  },
  trendElements: {
    label: '流行元素',
    labelEn: 'Trend Elements',
    options: [
      { value: 'cyberpunk', label: '赛博朋克', labelEn: 'Cyberpunk' },
      { value: 'y2k', label: 'Y2K千禧风', labelEn: 'Y2K' },
      { value: 'dopamine', label: '多巴胺配色', labelEn: 'Dopamine Colors' },
      { value: 'immersive_art', label: '沉浸式艺术', labelEn: 'Immersive Art' },
    ]
  },
} as const;

// Unchanged Tag Categories (Optimized for Digipark)
export const TIKTOK_TAG_CATEGORIES = {
  audience: {
    label: 'Target Audience',
    labelEn: 'Audience Tag',
    examples: ['#Digipark', '#SydneyMums', '#SydneyCouples', '#ArtLovers', '#TechGeeks'],
  },
  vertical: {
    label: 'Industry Vertical',
    labelEn: 'Vertical Tag',
    examples: ['#ImmersiveArt', '#DigitalArt', '#SydneyEvents', '#ThingstodoinSydney', '#InteractiveExperience'],
  },
  result: {
    label: 'Outcome/Result',
    labelEn: 'Result Tag',
    examples: ['#MindBlown', '#MustVisit', '#Viral', '#DateNight', '#FamilyDayOut'],
  },
  action: {
    label: 'Call to Action',
    labelEn: 'Action Tag',
    examples: ['#BookNow', '#LinkInBio', '#SydneyLife', '#VisitSydney'],
  },
  broadTraffic: {
    label: 'Broad Reach',
    labelEn: 'Broad Traffic Tag',
    examples: ['#FYP', '#ForYou', '#Sydney', '#Australia', '#Trending'],
  },
} as const;

export function getRandomOption<T extends keyof typeof PRESETS>(presetKey: T): string {
  const options = PRESETS[presetKey].options;
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex].value;
}

export function getPresetKeys(): (keyof typeof PRESETS)[] {
  return Object.keys(PRESETS) as (keyof typeof PRESETS)[];
}

export type PresetKey = keyof typeof PRESETS;
export type VariableSelections = Partial<Record<PresetKey, string | string[]>>;
