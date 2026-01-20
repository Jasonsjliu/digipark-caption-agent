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
  // 1. 📝 Style & Tone
  tone: {
    label: 'Tone',
    labelEn: 'Tone',
    options: [
      { value: 'immersive', label: 'Immersive', labelEn: 'Immersive' },
      { value: 'futuristic', label: 'Futuristic/Tech', labelEn: 'Futuristic/Tech' },
      { value: 'dreamy', label: 'Dreamy/Ethereal', labelEn: 'Dreamy/Ethereal' },
      { value: 'artistic', label: 'Artistic/Abstract', labelEn: 'Artistic/Abstract' },
      { value: 'exciting', label: 'High-Energy', labelEn: 'High-Energy' },
      { value: 'mysterious', label: 'Mysterious', labelEn: 'Mysterious' },
      { value: 'family', label: 'Family-Friendly', labelEn: 'Family-Friendly' },
    ]
  },
  writingStyle: {
    label: 'Writing Style',
    labelEn: 'Writing Style',
    options: [
      { value: 'sensory', label: 'Sensory-focused', labelEn: 'Sensory-focused' },
      { value: 'journey', label: 'Journey/Narrative', labelEn: 'Journey/Narrative' },
      { value: 'guide', label: 'Guide/Tips', labelEn: 'Guide/Tips' },
      { value: 'poetic', label: 'Poetic', labelEn: 'Poetic' },
      { value: 'review', label: 'User Review', labelEn: 'User Review' },
    ]
  },
  perspective: {
    label: 'Perspective',
    labelEn: 'Perspective',
    options: [
      { value: 'explorer', label: 'Explorer (First Person)', labelEn: 'Explorer (First Person)' },
      { value: 'guide', label: 'Guide (Second Person)', labelEn: 'Guide (Second Person)' },
      { value: 'narrator', label: 'Narrator (Third Person)', labelEn: 'Narrator (Third Person)' },
    ]
  },
  emotionalAppeal: {
    label: 'Emotional Appeal',
    labelEn: 'Emotional Appeal',
    options: [
      { value: 'awe', label: 'Awe/Wonder', labelEn: 'Awe/Wonder' },
      { value: 'curiosity', label: 'Curiosity', labelEn: 'Curiosity' },
      { value: 'escape', label: 'Escapism', labelEn: 'Escapism' },
      { value: 'joy', label: 'Pure Joy', labelEn: 'Pure Joy' },
      { value: 'inspiration', label: 'Creative Inspiration', labelEn: 'Creative Inspiration' },
    ]
  },
  paces: {
    label: 'Paces',
    labelEn: 'Paces',
    options: [
      { value: 'floating', label: 'Slow/Floating', labelEn: 'Slow/Floating' },
      { value: 'dynamic', label: 'Fast/Dynamic', labelEn: 'Fast/Dynamic' },
      { value: 'unfolding', label: 'Unfolding Mystery', labelEn: 'Unfolding Mystery' },
      { value: 'mixed', label: 'Mixed Tempo', labelEn: 'Mixed Tempo' },
    ]
  },
  valueProposition: {
    label: 'Value Prop',
    labelEn: 'Value Prop',
    options: [
      { value: 'photogenic', label: 'Instagrammable', labelEn: 'Instagrammable' },
      { value: 'interactive', label: 'Interactive Experience', labelEn: 'Interactive Experience' },
      { value: 'date', label: 'Perfect Date', labelEn: 'Perfect Date' },
      { value: 'family_fun', label: 'Family Fun', labelEn: 'Family Fun' },
      { value: 'tech_art', label: 'Tech x Art', labelEn: 'Tech x Art' },
      { value: 'indoor', label: 'Indoor Activity', labelEn: 'Indoor Activity' },
    ]
  },

  // 2. 🎯 Hooks
  hookType: {
    label: 'Hook Type',
    labelEn: 'Hook Type',
    options: [
      { value: 'vision', label: 'Visual Hook', labelEn: 'Visual Hook' },
      { value: 'location', label: 'Sydney Location', labelEn: 'Sydney Location' },
      { value: 'secret', label: 'Secret Reveal', labelEn: 'Secret Reveal' },
      { value: 'question', label: 'Question', labelEn: 'Question' },
      { value: 'invitation', label: 'Invitation', labelEn: 'Invitation' },
    ]
  },
  openingTemplate: {
    label: 'Opening Template',
    labelEn: 'Opening Template',
    options: [
      { value: 'sydney_hidden', label: 'Hidden in Sydney...', labelEn: 'Hidden in Sydney...' },
      { value: 'future_now', label: 'Step into the future...', labelEn: 'Step into the future...' },
      { value: 'weekend_plan', label: 'Weekend plans sorted...', labelEn: 'Weekend plans sorted...' },
      { value: 'art_alive', label: 'When art comes alive...', labelEn: 'When art comes alive...' },
    ]
  },

  // 3. 🎨 Content Angle
  contentFramework: {
    label: 'Framework',
    labelEn: 'Framework',
    options: [
      { value: 'tour', label: 'Immersive Tour', labelEn: 'Immersive Tour' },
      { value: 'photo_guide', label: 'Photo Spot Guide', labelEn: 'Photo Spot Guide' },
      { value: 'tech_explain', label: 'Tech Behind-the-Scenes', labelEn: 'Tech Behind-the-Scenes' },
      { value: 'reaction', label: 'Reaction Video', labelEn: 'Reaction Video' },
      { value: 'vlog', label: 'Day Trip Vlog', labelEn: 'Day Trip Vlog' },
    ]
  },
  targetAudience: {
    label: 'Audience',
    labelEn: 'Audience',
    options: [
      { value: 'couples', label: 'Couples', labelEn: 'Couples' },
      { value: 'parents', label: 'Parents/Families', labelEn: 'Parents/Families' },
      { value: 'students', label: 'Students', labelEn: 'Students' },
      { value: 'content_creators', label: 'Creators/Photographers', labelEn: 'Creators/Photographers' },
      { value: 'tourists', label: 'Tourists', labelEn: 'Tourists' },
    ]
  },

  // 4. 📱 Platform
  captionLength: {
    label: 'Length',
    labelEn: 'Length',
    options: [
      { value: 'short', label: 'Short (Highlights)', labelEn: 'Short (Highlights)' },
      { value: 'medium', label: 'Medium (Story)', labelEn: 'Medium (Story)' },
      { value: 'long', label: 'Long (Full Guide)', labelEn: 'Long (Full Guide)' },
    ]
  },
  emojiStyle: {
    label: 'Emoji',
    labelEn: 'Emoji',
    options: [
      { value: 'space', label: 'Space/Tech (🪐✨)', labelEn: 'Space/Tech' },
      { value: 'magic', label: 'Art/Magic (🎨🔮)', labelEn: 'Art/Magic' },
      { value: 'party', label: 'Party/Fun (🎉🥳)', labelEn: 'Party/Fun' },
      { value: 'minimal', label: 'Minimal (✨)', labelEn: 'Minimal' },
    ]
  },
  paragraphStructure: {
    label: 'Structure',
    labelEn: 'Structure',
    options: [
      { value: 'flow', label: 'Flowing Text', labelEn: 'Flowing Text' },
      { value: 'list', label: 'Checklist', labelEn: 'Checklist' },
      { value: 'aesthetic', label: 'Aesthetic Spacing', labelEn: 'Aesthetic Spacing' },
    ]
  },

  // 5. 💡 Call to Action (CTA)
  ctaTone: {
    label: 'CTA Tone',
    labelEn: 'CTA Tone',
    options: [
      { value: 'book_now', label: 'Book Now', labelEn: 'Book Now' },
      { value: 'tag_friend', label: 'Tag a Friend', labelEn: 'Tag a Friend' },
      { value: 'save_list', label: 'Save for Later', labelEn: 'Save for Later' },
      { value: 'visit', label: 'Come Visit', labelEn: 'Come Visit' },
    ]
  },

  // 6. 🌐 Time & Trends
  timeliness: {
    label: 'Timeliness',
    labelEn: 'Timeliness',
    options: [
      { value: 'limited', label: 'Limited Time', labelEn: 'Limited Time' },
      { value: 'new_opening', label: 'Grand Opening', labelEn: 'Grand Opening' },
      { value: 'weekend', label: 'Weekend Hotspot', labelEn: 'Weekend Hotspot' },
      { value: 'school_holiday', label: 'School Holidays', labelEn: 'School Holidays' },
    ]
  },
  trendElements: {
    label: 'Trend Elements',
    labelEn: 'Trend Elements',
    options: [
      { value: 'cyberpunk', label: 'Cyberpunk', labelEn: 'Cyberpunk' },
      { value: 'y2k', label: 'Y2K', labelEn: 'Y2K' },
      { value: 'dopamine', label: 'Dopamine Colors', labelEn: 'Dopamine Colors' },
      { value: 'immersive_art', label: 'Immersive Art', labelEn: 'Immersive Art' },
    ]
  },
} as const;

// Unchanged Tag Categories (Optimized for Digipark)
export const TIKTOK_TAG_CATEGORIES = {
  audience: {
    label: 'Target Audience',
    labelEn: 'Audience Tag',
  },
  vertical: {
    label: 'Industry Vertical',
    labelEn: 'Vertical Tag',
  },
  result: {
    label: 'Outcome/Result',
    labelEn: 'Result Tag',
  },
  action: {
    label: 'Call to Action',
    labelEn: 'Action Tag',
  },
  broadTraffic: {
    label: 'Broad Reach',
    labelEn: 'Broad Traffic Tag',
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
