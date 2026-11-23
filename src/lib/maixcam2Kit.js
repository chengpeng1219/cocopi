import * as Blockly from 'blockly';
import 'blockly/blocks';
import * as enLocale from 'blockly/msg/en';
import * as zhHansLocale from 'blockly/msg/zh-hans';
import * as zhHantLocale from 'blockly/msg/zh-hant';
import { pythonGenerator } from 'blockly/python';
import { MAIX_PYTHON_PREAMBLE } from './maixBlocks.js';

import mpythonBlocksSource from '../../maixcam2-block-kit/runtime/blocks_mpython.min.js?raw';
import mpythonGeneratorSource from '../../maixcam2-block-kit/runtime/python_mpython.min.js?raw';
import headSource from '../../maixcam2-block-kit/runtime/head.js?raw';
import citysSource from '../../maixcam2-block-kit/runtime/citys.js?raw';
import defineColorsSource from '../../maixcam2-block-kit/runtime/define_colors.js?raw';
import timeBlocksSource from '../../maixcam2-block-kit/runtime/time.js?raw';
import timeGeneratorSource from '../../maixcam2-block-kit/runtime/python_time.js?raw';
import utilityBlocksSource from '../../maixcam2-block-kit/runtime/utility.js?raw';
import utilityGeneratorSource from '../../maixcam2-block-kit/runtime/python_utility.js?raw';
import aiSource from '../../maixcam2-block-kit/blocks/ai.js?raw';
import esp32Source from '../../maixcam2-block-kit/blocks/esp32.js?raw';
import screenSource from '../../maixcam2-block-kit/blocks/maixcam2_screen.js?raw';
import cameraSource from '../../maixcam2-block-kit/blocks/maixcam2_camera.js?raw';
import audioSource from '../../maixcam2-block-kit/blocks/maixcam2_audio.js?raw';
import nnSource from '../../maixcam2-block-kit/blocks/maixcam2_nn.js?raw';
import ioSource from '../../maixcam2-block-kit/blocks/maixcam2_io.js?raw';
import imuSource from '../../maixcam2-block-kit/blocks/maixcam2_imu.js?raw';
import llmSource from '../../maixcam2-block-kit/blocks/maixcam2_llm.js?raw';
import llm4gSource from '../../maixcam2-block-kit/blocks/maixcam2_llm4g.js?raw';
import sd4gSource from '../../maixcam2-block-kit/blocks/maixcam2_sd4g.js?raw';
import speechSource from '../../maixcam2-block-kit/blocks/maixcam2_speech.js?raw';
import kitMessages from '../../maixcam2-block-kit/i18n/messages.json';
import toolboxConfig from '../../maixcam2-block-kit/toolbox.json';
import sampleIndex from '../../maixcam2-block-kit/samples/index.json';

const LOCALES = {
  'zh-hans': zhHansLocale,
  'zh-hant': zhHantLocale,
  en: enLocale
};

const BASE_MESSAGE_KEYS = new Set([
  ...Object.keys(zhHansLocale),
  ...Object.keys(zhHantLocale),
  ...Object.keys(enLocale)
]);

const COMPAT_LABELS = {
  'zh-hans': {
    not: '非 %1',
    repeat: '重复 %1 次',
    count: '变量 %1 从 %2 到 %3，每次增加 %4',
    forEach: '遍历 %2 中的每一项 %1',
    modulo: '%1 除以 %2 的余数',
    division: '整除 %1 ÷ %2',
    convertNumber: '将 %1 转换为 %2',
    listOpen: '列表 [',
    tupleOpen: '元组 (',
    dictOpen: '字典 {',
    codeBlock: '代码块',
    codeExpression: '代码表达式',
    keepDecimal: '保留 %2 的 %1 位小数',
    returnValue: '返回 %1',
    typeOf: '%1 的类型',
    typeIs: '%1 是 %2 类型',
    randomRange: '在 %1 到 %2 之间随机，步长 %3',
    evaluate: '执行 %1',
    bitInvert: '按位取反 %1',
    convertBase: '将 %1 转换为 %2 进制',
    fromBase: '将 %2 从 %1 进制转换',
    pack: '将 %2 打包为 %1 字节整数',
    tupleWith: '元组包含',
    setWith: '集合包含',
    dictWith: '字典包含',
    map: '将 %1 从 %2~%3 映射到 %4~%5',
    repeatForever: '重复执行',
    do: '执行',
    binary: '二进制',
    octal: '八进制',
    hexadecimal: '十六进制',
    integer: '整数',
    floatingPoint: '浮点数',
    boolean: '布尔值',
    text: '文字',
    list: '列表',
    tuple: '元组',
    dictionary: '字典',
    set: '集合'
  },
  'zh-hant': {
    not: '非 %1',
    repeat: '重複 %1 次',
    count: '變數 %1 從 %2 到 %3，每次增加 %4',
    forEach: '遍歷 %2 中的每一項 %1',
    modulo: '%1 除以 %2 的餘數',
    division: '整除 %1 ÷ %2',
    convertNumber: '將 %1 轉換為 %2',
    listOpen: '列表 [',
    tupleOpen: '元組 (',
    dictOpen: '字典 {',
    codeBlock: '程式碼區塊',
    codeExpression: '程式碼運算式',
    keepDecimal: '保留 %2 的 %1 位小數',
    returnValue: '回傳 %1',
    typeOf: '%1 的類型',
    typeIs: '%1 是 %2 類型',
    randomRange: '在 %1 到 %2 之間隨機，步長 %3',
    evaluate: '執行 %1',
    bitInvert: '位元取反 %1',
    convertBase: '將 %1 轉換為 %2 進位',
    fromBase: '將 %2 從 %1 進位轉換',
    pack: '將 %2 打包為 %1 位元組整數',
    tupleWith: '元組包含',
    setWith: '集合包含',
    dictWith: '字典包含',
    map: '將 %1 從 %2~%3 映射到 %4~%5',
    repeatForever: '重複執行',
    do: '執行',
    binary: '二進位',
    octal: '八進位',
    hexadecimal: '十六進位',
    integer: '整數',
    floatingPoint: '浮點數',
    boolean: '布林值',
    text: '文字',
    list: '列表',
    tuple: '元組',
    dictionary: '字典',
    set: '集合'
  },
  en: {
    not: 'not %1',
    repeat: 'repeat %1 times',
    count: 'count %1 from %2 to %3 by %4',
    forEach: 'for each %1 in %2',
    modulo: '%1 modulo %2',
    division: 'division result %1 ÷ %2',
    convertNumber: 'convert %1 to %2',
    listOpen: 'list [',
    tupleOpen: 'tuple (',
    dictOpen: 'dict {',
    codeBlock: 'Code block',
    codeExpression: 'Code expression',
    keepDecimal: 'keep %1 decimal places for %2',
    returnValue: 'return %1',
    typeOf: 'type of %1',
    typeIs: 'is %1 a %2',
    randomRange: 'random from %1 to %2 step %3',
    evaluate: 'evaluate %1',
    bitInvert: 'bitwise invert %1',
    convertBase: 'convert %1 to base %2',
    fromBase: 'convert %2 from base %1',
    pack: 'pack %2 as %1-byte integer',
    tupleWith: 'tuple with',
    setWith: 'set with',
    dictWith: 'dictionary with',
    map: 'map %1 from %2 to %3 into %4 to %5',
    repeatForever: 'repeat forever',
    do: 'do',
    binary: 'binary',
    octal: 'octal',
    hexadecimal: 'hexadecimal',
    integer: 'integer',
    floatingPoint: 'float',
    boolean: 'boolean',
    text: 'text',
    list: 'list',
    tuple: 'tuple',
    dictionary: 'dictionary',
    set: 'set'
  }
};

const TOOLBOX_LABELS = {
  'zh-hans': {
    Logic: '逻辑',
    逻辑: '逻辑',
    Loops: '循环',
    循环: '循环',
    Math: '数学运算',
    数学运算: '数学运算',
    Variables: '变量',
    变量: '变量',
    Text: '文字',
    文字: '文字',
    Lists: '列表',
    列表: '列表',
    Dictionary: '字典',
    字典: '字典',
    Tuples: '元组',
    元组: '元组',
    Set: '集合',
    集合: '集合',
    Functions: '函数',
    函数: '函数',
    Python: 'Python',
    Time: '时间',
    时间: '时间',
    串口打印: '串口打印',
    'MaixCAM2 设备': '基础硬件',
    媒体处理: '媒体处理',
    'MaixCAM2 AI': '人工智能'
  },
  'zh-hant': {
    Logic: '邏輯',
    逻辑: '邏輯',
    Loops: '迴圈',
    循环: '迴圈',
    Math: '數學運算',
    数学运算: '數學運算',
    Variables: '變數',
    变量: '變數',
    Text: '文字',
    文字: '文字',
    Lists: '列表',
    列表: '列表',
    Dictionary: '字典',
    字典: '字典',
    Tuples: '元組',
    元组: '元組',
    Set: '集合',
    集合: '集合',
    Functions: '函式',
    函数: '函式',
    Python: 'Python',
    Time: '時間',
    时间: '時間',
    串口打印: '串口列印',
    'MaixCAM2 设备': '基礎硬體',
    媒体处理: '媒體處理',
    'MaixCAM2 AI': '人工智慧'
  },
  en: {
    Logic: 'Logic',
    逻辑: 'Logic',
    Loops: 'Loops',
    循环: 'Loops',
    Math: 'Math',
    数学运算: 'Math',
    Variables: 'Variables',
    变量: 'Variables',
    Text: 'Text',
    文字: 'Text',
    Lists: 'Lists',
    列表: 'Lists',
    Dictionary: 'Dictionary',
    字典: 'Dictionary',
    Tuples: 'Tuples',
    元组: 'Tuples',
    Set: 'Sets',
    集合: 'Sets',
    Functions: 'Functions',
    函数: 'Functions',
    Python: 'Python',
    Time: 'Time',
    时间: 'Time',
    串口打印: 'Serial print',
    'MaixCAM2 设备': 'Basic hardware',
    媒体处理: 'Media',
    'MaixCAM2 AI': 'AI'
  }
};

const BLOCK_SOURCES = [
  headSource,
  citysSource,
  defineColorsSource,
  utilityBlocksSource,
  utilityGeneratorSource,
  timeBlocksSource,
  timeGeneratorSource,
  mpythonBlocksSource,
  mpythonGeneratorSource,
  aiSource,
  screenSource,
  cameraSource,
  audioSource,
  nnSource,
  ioSource,
  imuSource,
  llmSource,
  llm4gSource,
  sd4gSource,
  speechSource,
  esp32Source
];

let initialized = false;
let initializedLanguage = '';
let legacyBlockly;
let legacyPythonGenerator;

function normalizeKitLanguage(language) {
  if (language === 'en') return 'en';
  if (language === 'zh-hant') return 'zh-hant';
  return 'zh-hans';
}

function installLegacyGeneratorShim() {
  if (!pythonGenerator.variableDB_) {
    pythonGenerator.variableDB_ = {
      getName(name) {
        return (
          pythonGenerator.nameDB_?.getName(
            name,
            Blockly.Names.NameType.VARIABLE
          ) || name
        );
      }
    };
  }
  if (!pythonGenerator.addVariable) {
    pythonGenerator.addVariable = function addVariable(
      name,
      code,
      overwrite = false
    ) {
      const key = `cocopi_variable_${name}`;
      if (overwrite || !this.definitions_[key]) {
        this.definitions_[key] = code;
      }
    };
  }
  if (!pythonGenerator.addFunction) {
    pythonGenerator.addFunction = function addFunction(name, code) {
      const functionName = String(name || 'generated_function');
      this.definitions_[`cocopi_function_${functionName}`] = code;
      return functionName;
    };
  }
  if (!pythonGenerator.__legacyInputShim) {
    const originalValueToCode = pythonGenerator.valueToCode.bind(pythonGenerator);
    const originalStatementToCode =
      pythonGenerator.statementToCode.bind(pythonGenerator);
    pythonGenerator.valueToCode = function valueToCode(block, name, order) {
      if (!block?.getInput?.(name)) return '';
      return originalValueToCode(block, name, order);
    };
    pythonGenerator.statementToCode = function statementToCode(block, name) {
      if (!block?.getInput?.(name)) return '';
      return originalStatementToCode(block, name);
    };
    pythonGenerator.__legacyInputShim = true;
  }
}

function installLegacyJsonInitShim() {
  if (Blockly.Block.prototype.__cocopiJsonInitShim) return;
  const originalJsonInit = Blockly.Block.prototype.jsonInit;
  Blockly.Block.prototype.jsonInit = function jsonInit(jsonDefinition) {
    const normalized = { ...jsonDefinition };
    for (let index = 0; index < 10; index += 1) {
      const args = normalized[`args${index}`];
      if (!Array.isArray(args) || args.length === 0) continue;
      const messageKey = `message${index}`;
      let message = String(normalized[messageKey] || '');
      if (message.includes('%{BKY_')) continue;
      const seen = new Set();
      message = message.replace(/%(\d+)/g, (token, number) => {
        if (seen.has(Number(number))) return '';
        seen.add(Number(number));
        return token;
      });
      const referenced = new Set(
        [...message.matchAll(/%(\d+)/g)].map((match) => Number(match[1]))
      );
      for (let argument = 1; argument <= args.length; argument += 1) {
        if (!referenced.has(argument)) {
          message += `${message ? ' ' : ''}%${argument}`;
        }
      }
      normalized[messageKey] = message;
    }
    if (
      import.meta.env.DEV &&
      [
        'logic_negate',
        'controls_repeat_ext',
        'math_modulo',
        'math_constrain',
        'controls_for',
        'controls_forEach'
      ].includes(this.type)
    ) {
      globalThis.__MAIXCAM2_JSON_DEBUG__ ??= [];
      globalThis.__MAIXCAM2_JSON_DEBUG__.push({
        type: this.type,
        message0: normalized.message0,
        args0: normalized.args0,
        init: String(this.constructor?.prototype?.init || '')
      });
    }
    return originalJsonInit.call(this, normalized);
  };
  Blockly.Block.prototype.__cocopiJsonInitShim = true;
}

function createLegacyBlocklyProxy() {
  if (legacyBlockly) return legacyBlockly;
  installLegacyGeneratorShim();
  const LegacyFieldImage = function LegacyFieldImage() {
    // Upstream block images use paths from another host. The labels already
    // describe the block, so omit those decorations instead of showing broken
    // image placeholders.
    return new Blockly.FieldLabel('');
  };
  const LegacyFieldColour = function LegacyFieldColour(value) {
    return new Blockly.FieldTextInput(value || '#000000');
  };
  const LegacyMutator = function LegacyMutator() {};
  if (!legacyPythonGenerator) {
    legacyPythonGenerator = new Proxy(pythonGenerator, {
      get(target, property) {
        if (Reflect.has(target, property)) return Reflect.get(target, property);
        return target.forBlock[property];
      },
      set(target, property, value) {
        if (Reflect.has(target, property)) {
          return Reflect.set(target, property, value);
        }
        target.forBlock[property] = value;
        return true;
      }
    });
  }
  const legacyMessages = new Proxy(Blockly.Msg, {
    get(target, property) {
      const value = Reflect.get(target, property);
      if (value !== undefined || typeof property !== 'string') return value;
      return property
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
    }
  });
  const legacyBlocks = new Proxy(Blockly.Blocks, {
    set(target, property, value) {
      if (
        typeof property === 'string' &&
        target[property] &&
        !property.startsWith('CocoRobo_')
      ) {
        return true;
      }
      return Reflect.set(target, property, value);
    }
  });
  legacyBlockly = new Proxy(Blockly, {
    get(target, property) {
      if (property === 'Python') return legacyPythonGenerator;
      if (property === 'Msg') return legacyMessages;
      if (property === 'Blocks') return legacyBlocks;
      if (property === 'FieldImage') return LegacyFieldImage;
      if (property === 'FieldColour' || property === 'FieldColor') {
        return LegacyFieldColour;
      }
      if (property === 'FieldTextArea') return Blockly.FieldTextInput;
      if (property === 'Mutator') return LegacyMutator;
      return Reflect.get(target, property);
    }
  });
  return legacyBlockly;
}

function defineCompatibilityBlocks(language = 'zh-hans') {
  const labels = COMPAT_LABELS[language] || COMPAT_LABELS['zh-hans'];
  Blockly.Blocks.math ||= { HUE: 230 };
  Blockly.Blocks.time ||= { HUE: '#fabe23' };
  Blockly.Blocks.procedures ||= { HUE: '#ff6381' };
  Blockly.Blocks.utility ||= { HUE: 230 };
  Blockly.Blocks.logic_negate = {
    init() {
      this.jsonInit({
        message0: labels.not,
        args0: [{ type: 'input_value', name: 'BOOL', check: 'Boolean' }],
        inputsInline: true,
        output: 'Boolean',
        colour: 210
      });
    }
  };
  Blockly.Blocks.controls_repeat_ext = {
    init() {
      this.jsonInit({
        message0: labels.repeat,
        args0: [{ type: 'input_value', name: 'TIMES', check: 'Number' }],
        message1: '%1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        previousStatement: null,
        nextStatement: null,
        colour: 120
      });
    }
  };
  Blockly.Blocks.controls_for = {
    init() {
      this.jsonInit({
        message0: labels.count,
        args0: [
          { type: 'field_variable', name: 'VAR', variable: 'i' },
          { type: 'input_value', name: 'FROM', check: 'Number' },
          { type: 'input_value', name: 'TO', check: 'Number' },
          { type: 'input_value', name: 'BY', check: 'Number' }
        ],
        message1: '%1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: 120
      });
    }
  };
  Blockly.Blocks.controls_forEach = {
    init() {
      this.jsonInit({
        message0: labels.forEach,
        args0: [
          { type: 'field_variable', name: 'VAR', variable: 'i' },
          { type: 'input_value', name: 'LIST' }
        ],
        message1: '%1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: 120
      });
    }
  };
  Blockly.Blocks.math_modulo = {
    init() {
      this.jsonInit({
        message0: labels.modulo,
        args0: [
          { type: 'input_value', name: 'DIVIDEND', check: 'Number' },
          { type: 'input_value', name: 'DIVISOR', check: 'Number' }
        ],
        inputsInline: true,
        output: 'Number',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };

  Blockly.Blocks.math_division_consult ||= {
    init() {
      this.jsonInit({
        message0: labels.division,
        args0: [
          { type: 'input_value', name: 'DIVIDEND', check: 'Number' },
          { type: 'input_value', name: 'DIVISOR', check: 'Number' }
        ],
        inputsInline: true,
        output: 'Number',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  Blockly.Blocks.math_convert ||= {
    init() {
      this.jsonInit({
        message0: labels.convertNumber,
        args0: [
          { type: 'input_value', name: 'INPUT0', check: ['Number', 'String'] },
          {
            type: 'field_dropdown',
            name: 'TYPE0',
            options: [
              [labels.integer, 'int'],
              [labels.floatingPoint, 'float']
            ]
          }
        ],
        inputsInline: true,
        output: 'Number',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  Blockly.Blocks.math_number_bits_ops ||= {
    init() {
      this.jsonInit({
        message0: '%1 %2 %3',
        args0: [
          { type: 'input_value', name: 'A', check: 'Number' },
          {
            type: 'field_dropdown',
            name: 'OP',
            options: [
              ['|', ' | '],
              ['&', ' & '],
              ['^', ' ^ '],
              ['<<', ' << '],
              ['>>', ' >> ']
            ]
          },
          { type: 'input_value', name: 'B', check: 'Number' }
        ],
        inputsInline: true,
        output: 'Number',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  Blockly.Blocks.text_list ||= {
    init() {
      this.appendDummyInput()
        .appendField(labels.listOpen)
        .appendField(new Blockly.FieldTextInput(''), 'TEXT')
        .appendField(']');
      this.setOutput(true, 'Array');
      this.setColour(Blockly.Blocks.lists.HUE);
    }
  };
  Blockly.Blocks.text_tuple ||= {
    init() {
      this.appendDummyInput()
        .appendField(labels.tupleOpen)
        .appendField(new Blockly.FieldTextInput(''), 'TEXT')
        .appendField(')');
      this.setOutput(true, 'Array');
      this.setColour(192);
    }
  };
  Blockly.Blocks.text_dict ||= {
    init() {
      this.appendDummyInput()
        .appendField(labels.dictOpen)
        .appendField(new Blockly.FieldTextInput(''), 'TEXT')
        .appendField('}');
      this.setOutput(true, 'Array');
      this.setColour(32);
    }
  };
  Blockly.Blocks.raw_block ||= {
    init() {
      this.appendDummyInput()
        .appendField(labels.codeBlock)
        .appendField(new Blockly.FieldTextInput(''), 'TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(Blockly.Blocks.utility.HUE);
    }
  };
  Blockly.Blocks.raw_expression ||= {
    init() {
      this.appendDummyInput()
        .appendField(labels.codeExpression)
        .appendField(new Blockly.FieldTextInput(''), 'TEXT');
      this.setOutput(true, null);
      this.setColour(Blockly.Blocks.utility.HUE);
    }
  };
  Blockly.Blocks.math_keep_decimal = {
    init() {
      this.jsonInit({
        message0: labels.keepDecimal,
        args0: [
          { type: 'input_value', name: 'PLACE', check: 'Number' },
          { type: 'input_value', name: 'NUM', check: 'Number' }
        ],
        inputsInline: true,
        output: 'Number',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  Blockly.Blocks.CocoRobo_return = {
    init() {
      this.jsonInit({
        message0: labels.returnValue,
        args0: [{ type: 'input_value', name: 'VAR' }],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: Blockly.Blocks.procedures.HUE
      });
    }
  };
  Blockly.Blocks.CocoRobo_type = {
    init() {
      this.jsonInit({
        message0: labels.typeOf,
        args0: [{ type: 'input_value', name: 'VAR' }],
        inputsInline: true,
        output: null,
        colour: Blockly.Blocks.procedures.HUE
      });
    }
  };
  Blockly.Blocks.CocoRobo_type_is = {
    init() {
      this.jsonInit({
        message0: labels.typeIs,
        args0: [
          { type: 'input_value', name: 'VAR' },
          {
            type: 'field_dropdown',
            name: 'TYPE',
            options: [
              [labels.integer, 'int'],
              [labels.floatingPoint, 'float'],
              [labels.boolean, 'bool'],
              [labels.text, 'str'],
              [labels.list, 'list'],
              [labels.tuple, 'tuple'],
              [labels.dictionary, 'dict'],
              [labels.set, 'set']
            ]
          }
        ],
        inputsInline: true,
        output: 'Boolean',
        colour: Blockly.Blocks.procedures.HUE
      });
    }
  };
  Blockly.Blocks.math_random_randrange = {
    init() {
      this.jsonInit({
        message0: labels.randomRange,
        args0: [
          { type: 'input_value', name: 'start', check: 'Number' },
          { type: 'input_value', name: 'stop', check: 'Number' },
          { type: 'input_value', name: 'step', check: 'Number' }
        ],
        inputsInline: true,
        output: 'Number',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  Blockly.Blocks.CocoRobo_eval = {
    init() {
      this.jsonInit({
        message0: labels.evaluate,
        args0: [{ type: 'input_value', name: 'VAR', check: 'String' }],
        output: null,
        colour: Blockly.Blocks.procedures.HUE
      });
    }
  };
  Blockly.Blocks.bit_inversion = {
    init() {
      this.jsonInit({
        message0: labels.bitInvert,
        args0: [{ type: 'input_value', name: 'data', check: 'Number' }],
        inputsInline: true,
        output: 'Number',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  Blockly.Blocks.CocoRobo_ten_convert_to = {
    init() {
      this.jsonInit({
        message0: labels.convertBase,
        args0: [
          { type: 'input_value', name: 'int_num', check: 'Number' },
          {
            type: 'field_dropdown',
            name: 'ten_convert_to',
            options: [
              [labels.binary, 'bin'],
              [labels.octal, 'oct'],
              [labels.hexadecimal, 'hex']
            ]
          }
        ],
        inputsInline: true,
        output: 'String',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  Blockly.Blocks.CocoRobo_convert_to_ten = {
    init() {
      this.jsonInit({
        message0: labels.fromBase,
        args0: [
          {
            type: 'field_dropdown',
            name: 'convert_choice',
            options: [
              [labels.binary, '2'],
              [labels.octal, '8'],
              [labels.hexadecimal, '16']
            ]
          },
          { type: 'input_value', name: 'convert_str', check: 'String' }
        ],
        inputsInline: true,
        output: 'Number',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  Blockly.Blocks.CocoRobo_ten_converted_to_bytes = {
    init() {
      this.jsonInit({
        message0: labels.pack,
        args0: [
          {
            type: 'field_dropdown',
            name: 'convert_choice',
            options: [
              ['2', "'<H'"],
              ['4', "'<L'"]
            ]
          },
          { type: 'input_value', name: 'convert_num', check: 'Number' }
        ],
        inputsInline: true,
        output: null,
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  const definitionWithItems = (type, label, colour, outputCheck) => {
    Blockly.Blocks[type] = {
      init() {
        this.setColour(colour);
        this.appendDummyInput().appendField(label);
        this.itemCount_ = 2;
        this.updateShape_();
        this.setOutput(true, outputCheck || null);
      },
      mutationToDom() {
        const mutation = document.createElement('mutation');
        mutation.setAttribute('items', this.itemCount_);
        return mutation;
      },
      domToMutation(xmlElement) {
        this.itemCount_ = Math.max(
          0,
          Number(xmlElement.getAttribute('items')) || 0
        );
        this.updateShape_();
      },
      updateShape_() {
        for (let index = 0; this.getInput(`ADD${index}`); index += 1) {
          this.removeInput(`ADD${index}`);
        }
        for (let index = 0; index < this.itemCount_; index += 1) {
          const input = this.appendValueInput(`ADD${index}`);
          if (index === 0) input.appendField(label);
        }
      }
    };
  };
  definitionWithItems(
    'tuple_create_with_items_insert',
    labels.tupleWith,
    192,
    'Array'
  );
  definitionWithItems(
    'set_create_with_items_insert',
    labels.setWith,
    Blockly.Blocks.lists.HUE,
    'Array'
  );
  Blockly.Blocks.dict_create_with_items_insert = {
    init() {
      this.setColour(32);
      this.appendDummyInput().appendField(labels.dictWith);
      this.itemCount_ = 2;
      this.updateShape_();
      this.setOutput(true, null);
    },
    mutationToDom() {
      const mutation = document.createElement('mutation');
      mutation.setAttribute('items', this.itemCount_);
      return mutation;
    },
    domToMutation(xmlElement) {
      this.itemCount_ = Math.max(
        0,
        Number(xmlElement.getAttribute('items')) || 0
      );
      this.updateShape_();
    },
    updateShape_() {
      for (let index = 0; this.getInput(`ADD${index}`); index += 1) {
        this.removeInput(`ADD${index}`);
      }
      for (let index = 0; index < this.itemCount_; index += 1) {
        const input = this.appendValueInput(`ADD${index}`);
        input.appendField(
          new Blockly.FieldTextInput(`key${index + 1}`),
          `KEY${index}`
        );
      }
    }
  };
  Blockly.Blocks.labplus_mapping = {
    init() {
      this.jsonInit({
        message0: labels.map,
        args0: [
          { type: 'input_value', name: 'inputNum', check: 'Number' },
          { type: 'input_value', name: 'bMin', check: 'Number' },
          { type: 'input_value', name: 'bMax', check: 'Number' },
          { type: 'input_value', name: 'cMin', check: 'Number' },
          { type: 'input_value', name: 'cMax', check: 'Number' }
        ],
        inputsInline: true,
        output: 'Number',
        colour: Blockly.Blocks.math.HUE
      });
    }
  };
  pythonGenerator.forBlock.math_division_consult ||= (block, generator) => {
    const dividend =
      generator.valueToCode(block, 'DIVIDEND', generator.ORDER_MULTIPLICATIVE) ||
      '0';
    const divisor =
      generator.valueToCode(block, 'DIVISOR', generator.ORDER_MULTIPLICATIVE) ||
      '0';
    return [`${dividend} // ${divisor}`, generator.ORDER_MULTIPLICATIVE];
  };
  pythonGenerator.forBlock.math_convert ||= (block, generator) => {
    const input =
      generator.valueToCode(block, 'INPUT0', generator.ORDER_ATOMIC) || '0';
    return [
      `${block.getFieldValue('TYPE0')}(${input})`,
      generator.ORDER_FUNCTION_CALL
    ];
  };
  pythonGenerator.forBlock.math_number_bits_ops ||= (block, generator) => {
    const operation = block.getFieldValue('OP');
    const left = generator.valueToCode(block, 'A', generator.ORDER_ATOMIC) || '0';
    const right =
      generator.valueToCode(block, 'B', generator.ORDER_ATOMIC) || '0';
    const precedence =
      operation.includes('<<') || operation.includes('>>')
        ? generator.ORDER_BITWISE_SHIFT
        : generator.ORDER_BITWISE_OR;
    return [`${left}${operation}${right}`, precedence];
  };
  pythonGenerator.forBlock.text_list ||= (block) => [
    `[${JSON.stringify(block.getFieldValue('TEXT') || '')}]`,
    pythonGenerator.ORDER_ATOMIC
  ];
  pythonGenerator.forBlock.text_tuple ||= (block) => [
    `(${JSON.stringify(block.getFieldValue('TEXT') || '')},)`,
    pythonGenerator.ORDER_ATOMIC
  ];
  pythonGenerator.forBlock.text_dict ||= (block) => [
    `{${JSON.stringify(block.getFieldValue('TEXT') || '')}: None}`,
    pythonGenerator.ORDER_ATOMIC
  ];
  pythonGenerator.forBlock.raw_block ||= (block) =>
    `${block.getFieldValue('TEXT') || ''}\n`;
  pythonGenerator.forBlock.raw_expression ||= (block) => [
    block.getFieldValue('TEXT') || '',
    pythonGenerator.ORDER_ATOMIC
  ];
  if (!Blockly.Blocks.controls_repeat_forever) {
    Blockly.Blocks.controls_repeat_forever = {
      init() {
        this.appendDummyInput().appendField(labels.repeatForever);
        this.appendStatementInput('DO').appendField(labels.do);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9d64fd');
      }
    };
  }
  pythonGenerator.forBlock.controls_repeat_forever = (block, generator) => {
    generator.definitions_['cocopi_import_app'] ??= 'from maix import app';
    const body =
      generator.statementToCode(block, 'DO') || `${generator.INDENT}pass\n`;
    return `while not app.need_exit():\n${body}`;
  };
}

function localizeToolbox(root, language) {
  const labels = TOOLBOX_LABELS[language] || TOOLBOX_LABELS['zh-hans'];
  root.querySelectorAll('category').forEach((category) => {
    const name = category.getAttribute('name');
    if (String(name || '').trim().toLowerCase() === 'python') {
      category.remove();
      return;
    }
    if (labels[name]) category.setAttribute('name', labels[name]);
  });
  root.querySelectorAll('label[web-class]').forEach((label) => {
    label.removeAttribute('web-class');
    label.removeAttribute('style');
  });
}

export function initializeMaixcam2Kit(language = 'zh-hans') {
  const normalized = normalizeKitLanguage(language);
  Blockly.setLocale(LOCALES[normalized]);
  for (const [key, value] of Object.entries(kitMessages[normalized] || {})) {
    if (!BASE_MESSAGE_KEYS.has(key) || Blockly.Msg[key] === undefined) {
      Blockly.Msg[key] = value;
    }
  }
  Blockly.Variables.NAME_TYPE ||= 'VARIABLE';
  installLegacyJsonInitShim();

  if (!initialized) {
    const legacy = createLegacyBlocklyProxy();
    Blockly.Blocks.lists ||= { HUE: 260 };
    Blockly.Blocks.texts ||= { HUE: 160 };
    const preservedBlocks = new Map(Object.entries(Blockly.Blocks));
    const preservedGenerators = new Map(Object.entries(pythonGenerator.forBlock));
    const goog = {
      provide(name) {
        const parts = String(name).split('.');
        let target = parts[0] === 'Blockly' ? legacy : globalThis;
        for (let index = parts[0] === 'Blockly' ? 1 : 0; index < parts.length; index += 1) {
          const key = parts[index];
          if (!target[key]) target[key] = {};
          target = target[key];
        }
      },
      require() {}
    };
    const combinedSource = BLOCK_SOURCES.join('\n\n');
    new Function(
      'Blockly',
      'goog',
      'window',
      'document',
      combinedSource
    )(legacy, goog, globalThis.window, globalThis.document);
    for (const [type, definition] of preservedBlocks) {
      Blockly.Blocks[type] = definition;
    }
    for (const [type, generator] of preservedGenerators) {
      pythonGenerator.forBlock[type] = generator;
    }
    defineCompatibilityBlocks(normalized);
    initialized = true;
  } else if (initializedLanguage !== normalized) {
    defineCompatibilityBlocks(normalized);
  }
  initializedLanguage = normalized;
  if (import.meta.env.DEV) {
    globalThis.__MAIXCAM2_KIT_DEBUG__ = {
      logicNegateInit: String(Blockly.Blocks.logic_negate?.init || ''),
      logicNegateMessage: Blockly.Msg.LOGIC_NEGATE_TITLE,
      repeatMessage: Blockly.Msg.CONTROLS_REPEAT_TITLE,
      moduloMessage: Blockly.Msg.MATH_MODULO_TITLE,
      constrainMessage: Blockly.Msg.MATH_CONSTRAIN_TITLE,
      forMessage: Blockly.Msg.CONTROLS_FOR_TITLE,
      forEachMessage: Blockly.Msg.CONTROLS_FOREACH_TITLE,
      mutatorType: typeof globalThis.Blockly?.Mutator
    };
  }
  return normalized;
}

export function getMaixcam2Toolbox(language = 'zh-hans') {
  const normalized = initializeMaixcam2Kit(language);
  const root = Blockly.utils.xml.textToDom(toolboxConfig.toolboxXml);
  localizeToolbox(root, normalized);
  return root;
}

export function getMaixcam2CategoryList(language = 'zh-hans') {
  const toolbox = getMaixcam2Toolbox(language);
  return Array.from(toolbox.children)
    .filter((node) => node.nodeName.toLowerCase() === 'category')
    .map((category) => ({
      id: category.getAttribute('id') || '',
      name: category.getAttribute('name') || '',
      colour: category.getAttribute('colour') || '',
      blockCount: category.querySelectorAll('block').length
    }));
}

export function getMaixcam2SampleGroups() {
  return sampleIndex.groups;
}

export function scanMaixcam2ToolboxDefinitions() {
  const missingBlocks = toolboxConfig.blockTypes.filter(
    (type) => !Blockly.Blocks[type]
  );
  const missingGenerators = toolboxConfig.blockTypes.filter(
    (type) => !pythonGenerator.forBlock[type]
  );
  const result = {
    total: toolboxConfig.blockTypes.length,
    missingBlocks,
    missingGenerators
  };
  if (typeof window !== 'undefined') {
    window.__MAIXCAM2_KIT_SCAN__ = result;
  }
  return result;
}

export function generateMaixcam2Python(workspace) {
  const code = pythonGenerator.workspaceToCode(workspace).trim();
  const usesLegacyStarterBlocks = workspace
    .getAllBlocks(false)
    .some((block) =>
      ['maix_on_start', 'maix_camera_frame', 'maix_display_show'].includes(
        block.type
      )
    );
  if (code && usesLegacyStarterBlocks && !code.includes('from maix import')) {
    return `${MAIX_PYTHON_PREAMBLE.trim()}\n\n${code}`;
  }
  return code;
}

export async function loadMaixcam2Sample(filename) {
  const response = await fetch(`/maixcam2-block-kit/samples/${filename}`);
  if (!response.ok) {
    throw new Error(`样例加载失败（HTTP ${response.status}）`);
  }
  return response.text();
}
