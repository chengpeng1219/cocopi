/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Blocks for Arduino Time functions.
 *     The arduino built in functions syntax can be found in
 *     http://arduino.cc/en/Reference/HomePage
 */
'use strict';

goog.provide('Blockly.Blocks.time');

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');


/** Common HSV hue for all blocks in this category. */
Blockly.Blocks.time.HUE = "#fabe23";

Blockly.Blocks['time_delay'] = {
    /**
     * Delay block definition
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('http://arduino.cc/en/Reference/Delay');
        this.setColour(Blockly.Blocks.time.HUE);
        this.appendValueInput('DELAY_TIME_MILI')
            //.setCheck(Blockly.Types.NUMBER.checkList)
            .appendField(Blockly.Msg.ARD_TIME_DELAY);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_MS);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip(Blockly.Msg.ARD_TIME_DELAY_TIP);
    }
};

Blockly.Blocks['time_delaymicros'] = {
    /**
     * delayMicroseconds block definition
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('http://arduino.cc/en/Reference/DelayMicroseconds');
        this.setColour(Blockly.Blocks.time.HUE);
        this.appendValueInput('DELAY_TIME_MICRO')
            //.setCheck(Blockly.Types.NUMBER.checkList)
            .appendField(Blockly.Msg.ARD_TIME_DELAY);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_DELAY_MICROS);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip(Blockly.Msg.ARD_TIME_DELAY_MICRO_TIP);
    }
};

Blockly.Blocks['time_delayseconds'] = {
    /**
     * delayMicroseconds block definition
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('');
        this.setColour(Blockly.Blocks.time.HUE);
        this.appendValueInput('DELAY_TIME_MICRO')
            //.setCheck(Blockly.Types.NUMBER.checkList)
            .appendField(Blockly.Msg.ARD_TIME_DELAY);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_DELAY_seconds);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip(Blockly.Msg.ARD_TIME_DELAY_seconds_TIP);
    }
};

Blockly.Blocks['time_millis'] = {
    /**
     * Elapsed time in milliseconds block definition
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('http://arduino.cc/en/Reference/Millis');
        this.setColour(Blockly.Blocks.time.HUE);
        this.appendDummyInput()
            // .appendField("")
            // .appendField(new Blockly.FieldDropdown([["IoT 模組 ","on_esp32"], ["AI 模組","on_ai"]]), "type")
            .appendField(Blockly.Msg.ARD_TIME_MILLIS);
        this.setOutput(true);
        this.setTooltip(Blockly.Msg.ARD_TIME_MILLIS_TIP);
    },
    /** @return {string} The type of return value for the block, an integer. */
    getBlockType: function () {
        return Blockly.Types.LARGE_NUMBER;
    }
};

Blockly.Blocks['time_micros'] = {
    /**
     * Elapsed time in microseconds block definition
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('http://arduino.cc/en/Reference/Micros');
        this.setColour(Blockly.Blocks.time.HUE);
        this.appendDummyInput()
            // .appendField("")
            // .appendField(new Blockly.FieldDropdown([["IoT 模組 ","on_esp32"], ["AI 模組","on_ai"]]), "type")
            .appendField(Blockly.Msg.ARD_TIME_MICROS);
        this.setOutput(true);
        this.setTooltip(Blockly.Msg.ARD_TIME_MICROS_TIP);
    },
    /**
     * Should be a long (32bit), but  for for now an int.
     * @return {string} The type of return value for the block, an integer.
     */
    getBlockType: function () {
        return Blockly.Types.LARGE_NUMBER;
    }
};

Blockly.Blocks['infinite_loop'] = {
    /**
     * Waits forever, end of program.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('');
        this.setColour(Blockly.Blocks.time.HUE);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_INF);
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setTooltip(Blockly.Msg.ARD_TIME_INF_TIP);
    }
};

/**
 * Chrono Stopwatch
 * record current time passed
 */
Blockly.Blocks['time_chrono_setup'] = {
    /**
     * Chrono.h Setup
     * @this Blockly.Block
     */
    init: function () {
        this.appendDummyInput()
            // .appendField(new Blockly.FieldImage("http://cocorobo.cn/cocoblockly/blockly/media/stopwatch-header.png", 180, 40, "0"));
            .appendField(new Blockly.FieldImage("./../blockly/media/stopwatch-header.png", 40, 40, "0"));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_CHRONO_SETUP);
        this.setHelpUrl('');
        this.setColour("#eeaf3c");
        this.setTooltip(Blockly.Msg.ARD_TIME_INF_TIP);
    }
};

/**
 * Chrono Stopwatch
 * record current time passed
 */
Blockly.Blocks['time_chrono_reset'] = {
    /**
     * Chrono.h Setup
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('');
        this.setColour("#eeaf3c");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_CHRONO_RESET)
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip("");
    }
};

/**
 * Chrono Stopwatch
 * record current time passed
 */
Blockly.Blocks['time_chrono_elapsed'] = {
    /**
     * Chrono.h Setup
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('');
        this.setColour("#eeaf3c");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_CHRONO_ELAPSED)
        this.setOutput(true)
        this.setTooltip("");
    }
};

/**
 * Chrono Stopwatch
 * check time for passed 
 */
Blockly.Blocks['time_chrono_timeCheck'] = {
    /**
     * Chrono.h Setup
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('');
        this.setColour("#eeaf3c");
        this.appendValueInput("TIME")
            .appendField(Blockly.Msg.ARD_TIME_CHRONO_CHECK)
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_CHRONO_CHECK1)
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip("");
    }
};


/**
 * time  counter
 * counter time every @param {Int} num seconds
 * @this Blockly.Block
 */
Blockly.Blocks['time_everySecond'] = {
    init: function () {
        this.setColour(Blockly.Blocks.time.HUE);
        this.appendValueInput("TIME")
            .appendField(Blockly.Msg.ARD_TIME_EVERY);

        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_SECOND);

        this.appendStatementInput("STACK")
            .appendField(Blockly.Msg.ARD_TIME_DO)
        // this.setOutput(true, Blockly.Types.BOOLEAN.output);
        this.setPreviousStatement(true);
        this.setNextStatement(true)
    },
};


/**
 * time  counter (ms version)
 * counter time every @param {Int} num milliseconds
 * @this Blockly.Block
 */

Blockly.Blocks['time_everyMilliSecond'] = {
    init: function () {
        this.setColour(Blockly.Blocks.time.HUE);
        this.appendValueInput("TIME")
            .appendField(Blockly.Msg.ARD_TIME_EVERY_MS);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_TIME_SECOND_MS);
        this.appendStatementInput("STACK")
            .appendField(Blockly.Msg.ARD_TIME_DO_MS)
        // this.setOutput(true, Blockly.Types.BOOLEAN.output);
        this.setPreviousStatement(true);
        this.setNextStatement(true)
    },
};