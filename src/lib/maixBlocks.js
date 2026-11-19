import * as Blockly from 'blockly';
import * as zhHans from 'blockly/msg/zh-hans';
import * as zhHant from 'blockly/msg/zh-hant';
import * as en from 'blockly/msg/en';
import { Order, pythonGenerator } from 'blockly/python';

Blockly.setLocale(zhHans);

function normalizeLanguage(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'en' || normalized.startsWith('en-')) return 'en';
  if (normalized === 'zh-hant' || normalized.includes('hant') || normalized === 'zh-hk') {
    return 'zh-hant';
  }
  return 'zh-hans';
}

const BLOCK_LOCALES = {
  'zh-hans': {
    messages: {},
    categories: ['程序', '屏幕与相机', '触摸与延时', '逻辑', '数学', '文本', '变量'],
    colors: ['白色', '红色', '绿色', '蓝色', '黄色'],
    starterText: 'MaixCAM2 已就绪'
  },
  'zh-hant': {
    messages: {
      maix_on_start: {
        message0: '當 MaixCAM2 啟動時，重複執行',
        tooltip: '程式主迴圈；裝置收到停止請求時會自動退出。'
      },
      maix_camera_frame: {
        message0: '讀取一幀相機畫面',
        tooltip: '呼叫 camera.Camera().read() 讀取一幀影像。'
      },
      maix_display_show: {
        message0: '螢幕顯示影像 %1',
        tooltip: '呼叫 display.Display().show() 顯示影像。'
      },
      maix_draw_text: {
        message0: '在影像 %1 上繪製文字 %2',
        message1: '位置 x %1 y %2 字級 %3 顏色 %4',
        tooltip: '在原始影像上繪製文字並回傳該影像。'
      },
      maix_draw_rect: {
        message0: '在影像 %1 上繪製矩形',
        message1: 'x %1 y %2 寬 %3 高 %4 顏色 %5',
        tooltip: '在原始影像上繪製矩形並回傳該影像。'
      },
      maix_color: { message0: '顏色 %1' },
      maix_touch_pressed: {
        message0: '螢幕正在被觸控',
        tooltip: '讀取觸控螢幕目前的按下狀態。'
      },
      maix_delay: { message0: '等待 %1 秒' }
    },
    categories: ['程式', '螢幕與相機', '觸控與延時', '邏輯', '數學', '文字', '變數'],
    colors: ['白色', '紅色', '綠色', '藍色', '黃色'],
    starterText: 'MaixCAM2 已就緒'
  },
  en: {
    messages: {
      maix_on_start: {
        message0: 'When MaixCAM2 starts, repeat',
        tooltip: 'Main program loop. The program exits when a stop request is received.'
      },
      maix_camera_frame: {
        message0: 'Read one camera frame',
        tooltip: 'Calls camera.Camera().read() to capture one frame.'
      },
      maix_display_show: {
        message0: 'Display image %1',
        tooltip: 'Calls display.Display().show() to display an image.'
      },
      maix_draw_text: {
        message0: 'Draw text %2 on image %1',
        message1: 'position x %1 y %2 size %3 color %4',
        tooltip: 'Draws text on the source image and returns it.'
      },
      maix_draw_rect: {
        message0: 'Draw rectangle on image %1',
        message1: 'x %1 y %2 width %3 height %4 color %5',
        tooltip: 'Draws a rectangle on the source image and returns it.'
      },
      maix_color: { message0: 'Color %1' },
      maix_touch_pressed: {
        message0: 'Screen is being touched',
        tooltip: 'Reads the current touchscreen pressed state.'
      },
      maix_delay: { message0: 'Wait %1 seconds' }
    },
    categories: [
      'Program',
      'Screen & camera',
      'Touch & delay',
      'Logic',
      'Math',
      'Text',
      'Variables'
    ],
    colors: ['White', 'Red', 'Green', 'Blue', 'Yellow'],
    starterText: 'MaixCAM2 is ready'
  }
};

const START_STYLE = {
  colourPrimary: '#2563eb',
  colourSecondary: '#1d4ed8',
  colourTertiary: '#1e40af'
};

const SENSOR_STYLE = {
  colourPrimary: '#0891b2',
  colourSecondary: '#0e7490',
  colourTertiary: '#155e75'
};

const SCREEN_STYLE = {
  colourPrimary: '#7c3aed',
  colourSecondary: '#6d28d9',
  colourTertiary: '#5b21b6'
};

const INTERACTION_STYLE = {
  colourPrimary: '#ea580c',
  colourSecondary: '#c2410c',
  colourTertiary: '#9a3412'
};

const BASE_BLOCK_DEFINITIONS = [
  {
    type: 'maix_on_start',
    message0: '当 MaixCAM2 启动时，重复执行',
    message1: '%1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    style: 'maix_start_blocks',
    hat: 'cap',
    tooltip: '程序主循环；设备收到停止请求时会自动退出。'
  },
  {
    type: 'maix_camera_frame',
    message0: '读取一帧摄像头画面',
    output: 'Image',
    style: 'maix_sensor_blocks',
    tooltip: '调用 camera.Camera().read() 读取一帧图像。'
  },
  {
    type: 'maix_display_show',
    message0: '屏幕显示图像 %1',
    args0: [{ type: 'input_value', name: 'IMAGE', check: 'Image' }],
    previousStatement: null,
    nextStatement: null,
    style: 'maix_screen_blocks',
    tooltip: '调用 display.Display().show() 显示图像。'
  },
  {
    type: 'maix_draw_text',
    message0: '在图像 %1 上绘制文字 %2',
    args0: [
      { type: 'input_value', name: 'IMAGE', check: 'Image' },
      { type: 'input_value', name: 'TEXT', check: 'String' }
    ],
    message1: '位置 x %1 y %2 字号 %3 颜色 %4',
    args1: [
      { type: 'input_value', name: 'X', check: 'Number' },
      { type: 'input_value', name: 'Y', check: 'Number' },
      { type: 'input_value', name: 'SIZE', check: 'Number' },
      { type: 'input_value', name: 'COLOR', check: 'Colour' }
    ],
    output: 'Image',
    inputsInline: false,
    style: 'maix_screen_blocks',
    tooltip: '在原图上绘制文字并返回该图像。'
  },
  {
    type: 'maix_draw_rect',
    message0: '在图像 %1 上绘制矩形',
    args0: [{ type: 'input_value', name: 'IMAGE', check: 'Image' }],
    message1: 'x %1 y %2 宽 %3 高 %4 颜色 %5',
    args1: [
      { type: 'input_value', name: 'X', check: 'Number' },
      { type: 'input_value', name: 'Y', check: 'Number' },
      { type: 'input_value', name: 'W', check: 'Number' },
      { type: 'input_value', name: 'H', check: 'Number' },
      { type: 'input_value', name: 'COLOR', check: 'Colour' }
    ],
    output: 'Image',
    inputsInline: false,
    style: 'maix_screen_blocks',
    tooltip: '在原图上绘制矩形并返回该图像。'
  },
  {
    type: 'maix_color',
    message0: '颜色 %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'COLOR',
        options: [
          ['白色', 'WHITE'],
          ['红色', 'RED'],
          ['绿色', 'GREEN'],
          ['蓝色', 'BLUE'],
          ['黄色', 'YELLOW']
        ]
      }
    ],
    output: 'Colour',
    style: 'maix_screen_blocks'
  },
  {
    type: 'maix_touch_pressed',
    message0: '屏幕正在被触摸',
    output: 'Boolean',
    style: 'maix_interaction_blocks',
    tooltip: '读取触摸屏当前按下状态。'
  },
  {
    type: 'maix_delay',
    message0: '等待 %1 秒',
    args0: [{ type: 'input_value', name: 'SECONDS', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    style: 'maix_interaction_blocks'
  }
];

const BLOCKLY_LOCALES = {
  'zh-hans': zhHans,
  'zh-hant': zhHant,
  en
};

let currentBlockLanguage = '';

function localizedBlockDefinitions(language) {
  const locale = BLOCK_LOCALES[language] || BLOCK_LOCALES['zh-hans'];
  return BASE_BLOCK_DEFINITIONS.map((definition) => {
    const localized = locale.messages[definition.type] || {};
    const next = {
      ...definition,
      ...localized
    };
    if (definition.type === 'maix_color') {
      next.args0 = definition.args0.map((argument) => ({
        ...argument,
        options: argument.options.map(([label, value], index) => [
          locale.colors[index] || label,
          value
        ])
      }));
    }
    return next;
  });
}

export function applyMaixBlockLocale(language) {
  const normalized = normalizeLanguage(language);
  if (currentBlockLanguage === normalized) return normalized;
  Blockly.setLocale(BLOCKLY_LOCALES[normalized] || zhHans);
  Blockly.common.defineBlocksWithJsonArray(localizedBlockDefinitions(normalized));
  currentBlockLanguage = normalized;
  return normalized;
}

applyMaixBlockLocale('zh-hans');

pythonGenerator.INDENT = '    ';
pythonGenerator.addReservedWords(
  'app,camera,display,image,touchscreen,cam,disp,touch,time,maix_draw_text,maix_draw_rect'
);

pythonGenerator.forBlock.maix_on_start = (block, generator) => {
  const body =
    generator.statementToCode(block, 'DO') || `${generator.INDENT}pass\n`;
  return [
    'print("[APP_READY] blockly")',
    'while not app.need_exit():',
    body.replace(/\s+$/, ''),
    `${generator.INDENT}time.sleep(0.01)`
  ].join('\n') + '\n';
};

pythonGenerator.forBlock.maix_camera_frame = () => ['cam.read()', Order.FUNCTION_CALL];

pythonGenerator.forBlock.maix_display_show = (block, generator) => {
  const image = generator.valueToCode(block, 'IMAGE', Order.NONE) || 'cam.read()';
  return `disp.show(${image})\n`;
};

pythonGenerator.forBlock.maix_draw_text = (block, generator) => {
  const image = generator.valueToCode(block, 'IMAGE', Order.NONE) || 'cam.read()';
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "'Hello MaixCAM2'";
  const x = generator.valueToCode(block, 'X', Order.NONE) || '20';
  const y = generator.valueToCode(block, 'Y', Order.NONE) || '20';
  const size = generator.valueToCode(block, 'SIZE', Order.NONE) || '1.2';
  const color = generator.valueToCode(block, 'COLOR', Order.NONE) || '(255, 255, 255)';
  return [
    `maix_draw_text(${image}, ${text}, ${x}, ${y}, ${size}, ${color})`,
    Order.FUNCTION_CALL
  ];
};

pythonGenerator.forBlock.maix_draw_rect = (block, generator) => {
  const image = generator.valueToCode(block, 'IMAGE', Order.NONE) || 'cam.read()';
  const x = generator.valueToCode(block, 'X', Order.NONE) || '20';
  const y = generator.valueToCode(block, 'Y', Order.NONE) || '20';
  const width = generator.valueToCode(block, 'W', Order.NONE) || '120';
  const height = generator.valueToCode(block, 'H', Order.NONE) || '80';
  const color = generator.valueToCode(block, 'COLOR', Order.NONE) || '(0, 255, 136)';
  return [
    `maix_draw_rect(${image}, ${x}, ${y}, ${width}, ${height}, ${color})`,
    Order.FUNCTION_CALL
  ];
};

const COLORS = {
  WHITE: '(255, 255, 255)',
  RED: '(255, 64, 64)',
  GREEN: '(0, 255, 136)',
  BLUE: '(64, 148, 255)',
  YELLOW: '(255, 210, 64)'
};

pythonGenerator.forBlock.maix_color = (block) => [
  COLORS[block.getFieldValue('COLOR')] || COLORS.WHITE,
  Order.ATOMIC
];

pythonGenerator.forBlock.maix_touch_pressed = () => ['touch.read()[2]', Order.ATOMIC];

pythonGenerator.forBlock.maix_delay = (block, generator) => {
  const seconds = generator.valueToCode(block, 'SECONDS', Order.NONE) || '0.1';
  return `time.sleep(max(0, float(${seconds})))\n`;
};

const numberShadow = (value) => ({
  shadow: {
    type: 'math_number',
    fields: { NUM: value }
  }
});

const textShadow = (value) => ({
  shadow: {
    type: 'text',
    fields: { TEXT: value }
  }
});

const colorShadow = (color = 'WHITE') => ({
  shadow: {
    type: 'maix_color',
    fields: { COLOR: color }
  }
});

const BASE_MAIX_TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '程序',
      colour: '#2563eb',
      contents: [
        { kind: 'block', type: 'maix_on_start' },
        {
          kind: 'block',
          type: 'maix_delay',
          inputs: { SECONDS: numberShadow(0.1) }
        }
      ]
    },
    {
      kind: 'category',
      name: '屏幕与相机',
      colour: '#7c3aed',
      contents: [
        {
          kind: 'block',
          type: 'maix_display_show',
          inputs: {
            IMAGE: { shadow: { type: 'maix_camera_frame' } }
          }
        },
        { kind: 'block', type: 'maix_camera_frame' },
        {
          kind: 'block',
          type: 'maix_draw_text',
          inputs: {
            IMAGE: { shadow: { type: 'maix_camera_frame' } },
            TEXT: textShadow('MaixCAM2'),
            X: numberShadow(20),
            Y: numberShadow(20),
            SIZE: numberShadow(1.2),
            COLOR: colorShadow('WHITE')
          }
        },
        {
          kind: 'block',
          type: 'maix_draw_rect',
          inputs: {
            IMAGE: { shadow: { type: 'maix_camera_frame' } },
            X: numberShadow(20),
            Y: numberShadow(80),
            W: numberShadow(120),
            H: numberShadow(80),
            COLOR: colorShadow('GREEN')
          }
        },
        { kind: 'block', type: 'maix_color' }
      ]
    },
    {
      kind: 'category',
      name: '触摸与延时',
      colour: '#ea580c',
      contents: [
        { kind: 'block', type: 'maix_touch_pressed' },
        {
          kind: 'block',
          type: 'maix_delay',
          inputs: { SECONDS: numberShadow(0.1) }
        }
      ]
    },
    {
      kind: 'category',
      name: '逻辑',
      colour: '#0f766e',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'logic_operation' }
      ]
    },
    {
      kind: 'category',
      name: '数学',
      colour: '#0f766e',
      contents: [
        {
          kind: 'block',
          type: 'math_number',
          fields: { NUM: 1 }
        },
        { kind: 'block', type: 'math_arithmetic' }
      ]
    },
    {
      kind: 'category',
      name: '文本',
      colour: '#0f766e',
      contents: [
        {
          kind: 'block',
          type: 'text',
          fields: { TEXT: 'MaixCAM2' }
        },
        { kind: 'block', type: 'text_join' }
      ]
    },
    {
      kind: 'category',
      name: '变量',
      colour: '#475569',
      custom: 'VARIABLE',
      contents: [
        { kind: 'block', type: 'variables_get' },
        { kind: 'block', type: 'variables_set' }
      ]
    }
  ]
};

export const MAIX_TOOLBOX = BASE_MAIX_TOOLBOX;

export function getMaixToolbox(language) {
  const normalized = normalizeLanguage(language);
  const locale = BLOCK_LOCALES[normalized] || BLOCK_LOCALES['zh-hans'];
  const toolbox = JSON.parse(JSON.stringify(BASE_MAIX_TOOLBOX));
  toolbox.contents.forEach((item, index) => {
    if (item.kind === 'category' && locale.categories[index]) {
      item.name = locale.categories[index];
    }
  });
  return toolbox;
}

export const MAIX_THEME = {
  name: 'maixcam2-light',
  base: Blockly.Themes.Classic,
  blockStyles: {
    maix_start_blocks: START_STYLE,
    maix_sensor_blocks: SENSOR_STYLE,
    maix_screen_blocks: SCREEN_STYLE,
    maix_interaction_blocks: INTERACTION_STYLE
  },
  categoryStyles: {
    maix_start_category: { colour: '#2563eb' },
    maix_screen_category: { colour: '#7c3aed' },
    maix_interaction_category: { colour: '#ea580c' },
    maix_logic_category: { colour: '#0f766e' }
  },
  componentStyles: {
    workspaceBackgroundColour: '#f8fbff',
    toolboxBackgroundColour: '#eef4ff',
    toolboxForegroundColour: '#172033',
    flyoutBackgroundColour: '#eaf2ff',
    flyoutForegroundColour: '#172033',
    flyoutOpacity: 0.98,
    scrollbarColour: '#9fb4d4',
    scrollbarOpacity: 0.45,
    insertionMarkerColour: '#2563eb',
    insertionMarkerOpacity: 0.35
  },
  fontStyle: {
    family: '"PingFang SC", "Microsoft YaHei", sans-serif',
    weight: 'normal',
    size: 12
  },
  startHats: true
};

export const MAIX_PYTHON_PREAMBLE = `from maix import app, camera, display, image, touchscreen
import time

cam = camera.Camera()
disp = display.Display()
touch = touchscreen.TouchScreen()


def maix_draw_text(source, text, x, y, size, color):
    source.draw_string(
        int(x),
        int(y),
        str(text),
        scale=float(size),
        color=image.Color.from_rgb(*color),
        thickness=1,
    )
    return source


def maix_draw_rect(source, x, y, width, height, color):
    source.draw_rect(
        int(x),
        int(y),
        int(width),
        int(height),
        color=image.Color.from_rgb(*color),
        thickness=2,
    )
    return source
`;

export function createStarterWorkspaceState(language = 'zh-hans') {
  const normalized = normalizeLanguage(language);
  const locale = BLOCK_LOCALES[normalized] || BLOCK_LOCALES['zh-hans'];
  return {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'maix_on_start',
          x: 40,
          y: 48,
          inputs: {
            DO: {
              block: {
                type: 'maix_display_show',
                inputs: {
                  IMAGE: {
                    block: {
                      type: 'maix_draw_text',
                      inputs: {
                        IMAGE: {
                          block: { type: 'maix_camera_frame' }
                        },
                        TEXT: {
                          shadow: {
                            type: 'text',
                            fields: { TEXT: locale.starterText }
                          }
                        },
                        X: numberShadow(20),
                        Y: numberShadow(20),
                        SIZE: numberShadow(1.4),
                        COLOR: colorShadow('WHITE')
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  };
}

export function generateMaixPython(workspace) {
  const topBlocks = workspace.getTopBlocks(false);
  if (!topBlocks.some((block) => block.type === 'maix_on_start')) {
    return '';
  }
  const generated = pythonGenerator.workspaceToCode(workspace).trim();
  if (!generated) return '';
  const body = generated;
  return `${MAIX_PYTHON_PREAMBLE.trim()}\n\n${body}\n`;
}
