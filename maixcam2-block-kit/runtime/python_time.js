/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Arduino code generator for the Time blocks.
 *     Arduino built-in function docs: http://arduino.cc/en/Reference/HomePage
 */
'use strict';

goog.provide('Blockly.Python.time');

goog.require('Blockly.Python');


/**
 * Code generator for the delay Arduino block.
 * Arduino code: loop { delay(X); }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Blockly.Python['time_delay'] = function(block) {
    // var time_type = block.getFieldValue('type');
    Blockly.Python.definitions_['v831_import_time'] = `import time`;
    
    var delayTimeMs = (Blockly.Python.valueToCode(block, 'DELAY_TIME_MILI', Blockly.Python.ORDER_ATOMIC)) || '0';

    var code = 'time.sleep(' + delayTimeMs + ' / 1000)\n';
    
    return code;
};

/**
 * Code generator for the delayMicroseconds block.
 * Arduino code: loop { delayMicroseconds(X); }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Blockly.Python['time_delaymicros'] = function(block) {
    // var time_type = block.getFieldValue('type');
    Blockly.Python.definitions_['v831_import_time']
    Blockly.Python.includes_['import_time'] = `def delayMicrosecond(t):    # 微秒级延时函数
    start,end=0,0           # 声明变量
    start=time.time()       # 记录开始时间
    t=(t-35)/1000000     # 将输入t的单位转换为秒，-35是时间补偿
    while end-start<t:  # 循环至时间差值大于或等于设定值时
        end=time.time() `;
    var delayTimeMs = Blockly.Python.valueToCode(block, 'DELAY_TIME_MICRO', Blockly.Python.ORDER_ATOMIC) || '0';
    var code = 'delayMicrosecond(' + delayTimeMs + ')\n';

    return code;
};

Blockly.Python['time_delayseconds'] = function(block) {
    // var time_type = block.getFieldValue('type');

    Blockly.Python.definitions_['v831_import_time'] = 'import time';
    var delayTimeMs = Blockly.Python.valueToCode(
        block, 'DELAY_TIME_MICRO', Blockly.Python.ORDER_ATOMIC) || '0';
    var code = 'time.sleep(' + delayTimeMs + ')\n';

    return code;
};

/**
 * Code generator for the elapsed time in milliseconds block.
 * Arduino code: loop { millis() }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */
Blockly.Python['time_millis'] = function(block) {
    // var time_type = block.getFieldValue('type');

    Blockly.Python.definitions_['v831_import_time'] = 'import time';

    // if (time_type == 'on_esp32') {
    //    var code = 'time.ticks_ms()';
    //} else if (time_type == 'on_ai') {
    var code = 'time.ticks_ms()';
    //}
    return [code, Blockly.Python.ORDER_ATOMIC];
};

/**
 * Code generator for the elapsed time in microseconds block.
 * Arduino code: loop { micros() }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */
Blockly.Python['time_micros'] = function(block) {
    // var time_type = block.getFieldValue('type');
    Blockly.Python.definitions_['v831_import_time'] = 'import time';

    // if (time_type == 'on_esp32') {
    //     var code = 'time.time()';
    // } else if (time_type == 'on_ai') {
    var code = 'time.ticks_us()';
    // }
    return [code, Blockly.Python.ORDER_ATOMIC];
};

/**
 * Code generator for the wait forever (end of program) block
 * Arduino code: loop { while(true); }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Blockly.Python['infinite_loop'] = function(block) {
    return 'while(true)\n';
};


Blockly.Python['time_chrono_setup'] = function(block) {
    Blockly.Python.addInclude("chrono.h", "#include <Chrono.h>\n");
    Blockly.Python.addDeclaration("chrono_dec", "Chrono myChrono\n");
}

Blockly.Python['time_chrono_reset'] = function(block) {
    var code = "myChrono.restart()\n";
    return code;
}

Blockly.Python['time_chrono_elapsed'] = function(block) {
    var code = "myChrono.elapsed()";
    return [code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Python['time_chrono_timeCheck'] = function(block) {
    var time = Blockly.Python.valueToCode(this, "TIME", Blockly.Python.ORDER_ATOMIC);
    var code = "myChrono.hasPassed(" + time + ")";
    return [code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Python['time_everySecond'] = function(block) {

    // var time = Blockly.Python.valueToCode(this, "TIME", Blockly.Python.ORDER_ATOMIC);
    // Blockly.Python.addDeclaration("everySecondState_"+time ,"int everySecondState_"+time+" = 0;")
    // var stack_statements = Blockly.Python.statementToCode(block, "STACK", Blockly.Python.ORDER_ATOMIC)
    // if (time >= 2)
    //     var code = "if ((millis() / 1000) % " + time + " == " + (time - 2) + " && everySecondState_"+time+" == 0) {\n"+
    //         "  "+stack_statements+"\n"+
    //         "  everySecondState_"+time+" = 1\n"+
    //         "} else if ((millis() / 1000) % " + time + " == " + (time-1) +") {\n"+
    //         "  everySecondState_"+time+" = 0\n"+
    //         "}\n"
    // else {
    //     var code = "if ((millis() / 100) % 10 == 1 && everySecondState_"+time+" == 0) {\n"+
    //         "  "+stack_statements+"\n"+
    //         "  everySecondState_"+time+" = 1\n"+
    //         "} else if ((millis() / 100) % 10 == 2 && everySecondState_"+time+" == 1) {\n"+
    //         "  everySecondState_"+time+" = 0\n"+
    //         "}\n"
    // }
    code = "";
    return code;
}


Blockly.Python['time_everyMilliSecond'] = function(block) {
    // var time = Blockly.Python.valueToCode(this, "TIME", Blockly.Python.ORDER_ATOMIC);
    // Blockly.Python.addDeclaration("timePeriodExecutionState_" + time, "int timePeriodExecutionState_" + time + " = 0;")
    // var stack_statements = Blockly.Python.statementToCode(block, "STACK", Blockly.Python.ORDER_ATOMIC)
    // var code = "if ((millis()) % " + time + " == " + (time - 1) + " && timePeriodExecutionState_" + time + " == 0) {\n" +
    //     "  " + stack_statements + "\n" +
    //     "  timePeriodExecutionState_" + time + " = 1\n" +
    //     "} else if ((millis()) % " + time + " == " + 0 + ") {\n" +
    //     "  timePeriodExecutionState_" + time + " = 0\n" +
    //     "}\n"
    code = "";
    return code;
}