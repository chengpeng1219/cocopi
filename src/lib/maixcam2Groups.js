const GROUP_DEFINITIONS = [
  {
    parentId: 'catAI',
    children: [
      {
        id: 'catHwBasic',
        colour: '#d9472f',
        patterns: [/^maixcam2_key_pressed$/],
        labels: {
          'zh-hans': '基础',
          'zh-hant': '基礎',
          en: 'Basic'
        }
      },
      {
        id: 'catHwIo',
        colour: '#f28a2e',
        patterns: [/^maixcam2_(touch|scroll)_/],
        labels: {
          'zh-hans': '输入 / 输出',
          'zh-hant': '輸入 / 輸出',
          en: 'Input / Output'
        }
      },
      {
        id: 'catHwSensor',
        colour: '#54b885',
        patterns: [/^maixcam2_imu_/],
        labels: {
          'zh-hans': '传感器',
          'zh-hant': '感測器',
          en: 'Sensors'
        }
      },
      {
        id: 'catHwDisplay',
        colour: '#2e6fc3',
        patterns: [/^ai_lcd_/],
        labels: {
          'zh-hans': '屏幕',
          'zh-hant': '螢幕',
          en: 'Display'
        }
      },
      {
        id: 'catHwCamera',
        colour: '#4aa9c2',
        patterns: [/^(ai_camera_|v831_camera_)/],
        labels: {
          'zh-hans': '摄像头',
          'zh-hant': '攝影機',
          en: 'Camera'
        }
      },
      {
        id: 'catHwMic',
        colour: '#43b790',
        patterns: [/^(ai_mphone_|mphone_audio_)/],
        labels: {
          'zh-hans': '麦克风',
          'zh-hant': '麥克風',
          en: 'Microphone'
        }
      },
      {
        id: 'catHwSpeaker',
        colour: '#6b49a8',
        patterns: [/^ai_audio_/],
        labels: {
          'zh-hans': '扬声器',
          'zh-hant': '揚聲器',
          en: 'Speaker'
        }
      }
    ]
  },
  {
    parentId: 'ExtendedFunction',
    children: [
      {
        id: 'catMediaImage',
        colour: '#f0a33a',
        patterns: [/^(v831_img_|v831_lcd_|ai_lane_|ai_vision_)/],
        labels: {
          'zh-hans': '图形处理',
          'zh-hant': '圖形處理',
          en: 'Image processing'
        }
      },
      {
        id: 'catMediaVideo',
        colour: '#4ca8a1',
        patterns: [/^ai_video_/],
        labels: {
          'zh-hans': '视频处理',
          'zh-hant': '影片處理',
          en: 'Video processing'
        }
      }
    ]
  },
  {
    parentId: 'AI',
    children: [
      {
        id: 'catAiVision',
        colour: '#f0832f',
        patterns: [
          /^maixcam2_(cls|face|facelm|emotion|pose|seg|hand|gesture|obb|depth|ocr|posecls|track|bytetrack|yworld)_/,
          /^ai_model_/,
          /^face_recognition_/
        ],
        labels: {
          'zh-hans': 'AI 视觉',
          'zh-hant': 'AI 視覺',
          en: 'AI vision'
        }
      },
      {
        id: 'catAiLlm',
        colour: '#a85bd4',
        patterns: [/^maixcam2_(vlm|qwen)_/],
        labels: {
          'zh-hans': 'LLM 大模型',
          'zh-hant': 'LLM 大模型',
          en: 'LLM models'
        }
      },
      {
        id: 'catAiCellular',
        colour: '#46a6c7',
        patterns: [/^maixcam2_(asr4g|sd)_/],
        labels: {
          'zh-hans': '大模型（需 4G）',
          'zh-hant': '大模型（需 4G）',
          en: 'Large models (4G required)'
        }
      },
      {
        id: 'catAiAudio',
        colour: '#c24b87',
        patterns: [/^maixcam2_(asr|whisper|tts|speech|kws|digit|lvcsr)_/],
        labels: {
          'zh-hans': 'AI 听觉',
          'zh-hant': 'AI 聽覺',
          en: 'AI audio'
        }
      }
    ]
  }
];

const OTHER_LABELS = {
  'zh-hans': '其他',
  'zh-hant': '其他',
  en: 'Other'
};

function labelFor(labels, language) {
  return labels[language] || labels.en || labels['zh-hans'];
}

export function getNestedCategoryDefinitions(parentId, language) {
  const normalized = ['zh-hans', 'zh-hant', 'en'].includes(language)
    ? language
    : 'zh-hans';
  const group = GROUP_DEFINITIONS.find((item) => item.parentId === parentId);
  if (!group) return [];
  return group.children.map((child) => ({
    id: child.id,
    name: labelFor(child.labels, normalized),
    colour: child.colour,
    patterns: child.patterns
  }));
}

export function partitionNestedCategoryBlocks(parentId, blockTypes, language) {
  const definitions = getNestedCategoryDefinitions(parentId, language);
  if (definitions.length === 0) return [];
  const remaining = new Set(blockTypes);
  const groups = definitions.map((definition) => {
    const blocks = [];
    for (const type of blockTypes) {
      if (!remaining.has(type)) continue;
      if (definition.patterns.some((pattern) => pattern.test(type))) {
        blocks.push(type);
        remaining.delete(type);
      }
    }
    return { ...definition, blocks };
  });
  if (remaining.size > 0) {
    groups.push({
      id: `${parentId}Other`,
      name: OTHER_LABELS[language] || OTHER_LABELS['zh-hans'],
      colour: '#6b7280',
      patterns: [],
      blocks: blockTypes.filter((type) => remaining.has(type))
    });
  }
  return groups;
}
