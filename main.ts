/*
* JellySTEM MakeCode extension
*
* This extension includes or adapts code from:
* Siyeenove mShield MakeCode extension
* http://github.com/siyeenove/pxt_mshield
*
* Original copyright:
* Copyright (c) 2024 SIYEENOVA
*
* Original license: MIT License
*
* JellySTEM modifications:
* Copyright (c) 2026 JellySTEM / IMADE3D
* Released under the MIT License.
*/

//% weight=100 color="#246C64" icon="\uf1b2" block="JellySTEM"
namespace jellystem {
    export enum MotorsDirection {
        //%block="clockwise"
        CC = 1,
        //%block="counterclockwise"
        CCW = 2,
    }

    export enum Motors {
        //%block="motor1"
        Motor1 = 1,
        //%block="motor2"
        Motor2 = 2,
        //%block="all motors"
        AllMotors = 3
    }

    export enum MotorMode {
        //%block="brake"
        Brake = 1,
        //%block="coast"
        Coast = 0
    }

    export enum Leds {
        //%block="20% LED"
        LED20 = 1,
        //%block="40% LED"
        LED40 = 2,
        //%block="60% LED"
        LED60 = 3,
        //%block="80% LED"
        LED80 = 4,
        //%block="all LEDs"
        AllLED = 5
    }

    export enum S1ToS4Type {
        //%block="PWM"
        PWM = 1,
        //%block="servo"
        Servo = 2
    }

    export enum PwmAndServoIndex {
        //% block="S1"
        S1 = 1,
        //% block="S2"
        S2 = 2,
        //% block="S3"
        S3 = 3,
        //% block="S4"
        S4 = 4,
        //% block="S1-S4"
        All = 5
    }

    export enum ServoType {
        //% block="90°"
        Servo90 = 1,
        //% block="180°"
        Servo180 = 2,
        //% block="270°"
        Servo270 = 3
    }

    export enum MshieldIrButtons {
        //% block="1"
        Number1 = 0x45,
        //% block="2"
        Number2 = 0x46,
        //% block="3"
        Number3 = 0x47,
        //% block="4"
        Number4 = 0x44,
        //% block="5"
        Number5 = 0x40,
        //% block="6"
        Number6 = 0x43,
        //% block="7"
        Number7 = 0x07,
        //% block="8"
        Number8 = 0x15,
        //% block="9"
        Number9 = 0x09,
        //% block="*"
        Star = 0x16,
        //% block="0"
        Number0 = 0x19,
        //% block="#"
        Hash = 0x0d,
        //% block=" "
        Unused1 = -1,
        //% block="▲"
        Up = 0x18,
        //% block=" "
        Unused2 = -2,
        //% block="◀"
        Left = 0x08,
        //% block="OK"
        OK = 0x1c,
        //% block="▶"
        Right = 0x5a,
        //% block=" "
        Unused3 = -3,
        //% block="▼"
        Down = 0x52,
        //% block=" "
        Unused4 = -4
    }

    export enum BatteryType {
        //% block="3 AA batteries"
        AA3 = 1,
        //% block="4 AA batteries"
        AA4 = 2,
        //% block="5 AA batteries"
        AA5 = 3,
        //% block="6 AA batteries"
        AA6 = 4,
        //% block="1 lithium battery"
        LithiumBattery1 = 5,
        //% block="2 lithium batteries"
        LithiumBattery2 = 6
    }

    let motor1Speed = 0
    let motor2Speed = 0

    // For Ir receiver
    let irVal = 0

    //The I2C speed is 100Khz, and the slave address is 0x29
    let i2cAddr: number = 0x29;

    /**
     * Private helper to write a command register and a value byte over I2C.
     */
    function writeReg2Bytes(reg: number, value: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    /**
     * Private helper to write a single register/command byte over I2C.
     */
    function writeReg1Byte(reg: number): void {
        let buf = pins.createBuffer(1);
        buf[0] = reg;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    /**
    * Set the speed and direction of the motors
    * @param motor - The motors of mShield.
    * @param direction - The motor goes clockwise or counterclockwise.
    * @param speed - The speed at which the motor. eg: 0--100
    */
    //% group="Motors"
    //% block="set %motor %direction speed %speed\\%"
    //% speed.min=0 speed.max=100
    //% speed.defl=0
    //% weight=380
    export function setMotorsDirectionSpeed(motor: Motors, direction: MotorsDirection, speed: number): void {
        speed = Math.max(0, Math.min(100, speed));
        
        if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
            motor1Speed = speed;
            let value = (direction == MotorsDirection.CC) ? motor1Speed : motor1Speed + 101;
            writeReg2Bytes(0x09, value);
        }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
            motor2Speed = speed;
            let value = (direction == MotorsDirection.CC) ? motor2Speed : motor2Speed + 101;
            writeReg2Bytes(0x0a, value);
        }
    }

    /**
     * Set the speed and direction of the motor.
     * @param m1Speed - Set the speed and direction of the left motor.
     * @param m2Speed - Set the speed and direction of the right motor.
     */
    //% group="Motors"
    //% block="set motor1 speed %m1Speed\\% motor2 speed %m2Speed\\%"
    //% m1Speed.min=-100 m1Speed.max=100
    //% m2Speed.min=-100 m2Speed.max=100
    //% weight=379
    export function setMotorsSpeed(m1Speed: number, m2Speed: number): void {
        m1Speed = Math.max(-100, Math.min(100, m1Speed));
        m2Speed = Math.max(-100, Math.min(100, m2Speed));
        
        if (m1Speed > 0){
            motor1Speed = m1Speed;
            writeReg2Bytes(0x09, motor1Speed);
        } else {
            motor1Speed = Math.abs(m1Speed);
            writeReg2Bytes(0x09, motor1Speed + 101);
        }

        if (m2Speed > 0){
            motor2Speed = m2Speed;
            writeReg2Bytes(0x0a, motor2Speed);
        } else {
            motor2Speed = Math.abs(m2Speed);
            writeReg2Bytes(0x0a, motor2Speed + 101);
        }
    }

    /** * Motors stop.
     * @param motor - The motors of mShield.
     */
    //% group="Motors"
    //% weight=378
    //%block="set %motor to stop"
    export function wheelStop(motor: Motors): void {
        if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
            motor1Speed = 0;
            writeReg2Bytes(0x09, 0);
        }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
            motor2Speed = 0;
            writeReg2Bytes(0x0a, 0);
        }
    }

    /** * Motors brake.
     * @param motor - The motors of mShield.
     */
    //% group="Motors"
    //% weight=377
    //%block="set %motor to %mode"
    export function wheelBrake(motor: Motors, mode: MotorMode): void {
        if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
            motor1Speed = 0;
            writeReg2Bytes(0x19, mode);
        }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
            motor2Speed = 0;
            writeReg2Bytes(0x1a, mode);
        }
    }

    /** * Motors speed calibration.
     * When the speed of the left and right motors of the mShield trolley is not consistent,
     * this function can adjust the speed of the motor and save it permanently.
     * @param offset1 - Motor1 offset. eg: -10--0
     * @param offset2 - Motor2 offset. eg: -10--0
     */
    //% group="Motors"
    //% weight=376
    //% block="trim motor speed: M1 %offset1 M2 %offset2"
    //% offset1.min=-10 offset1.max=0
    //% offset2.min=-10 offset2.max=0
    //% offset1.defl=0 offset2.defl=0
    export function motorsAdjustment(offset1: number, offset2: number): void {
        offset1 = pins.map(offset1, -10, 0, 10, 0);
        offset2 = pins.map(offset2, -10, 0, 10, 0);

        writeReg2Bytes(0x07, offset1);
        basic.pause(10);
        
        writeReg2Bytes(0x08, offset2);
        basic.pause(10);
    }

    /**
    * Set xxx% LEDs.
    * @param led - Choose which leds to use.
    * @param onOff - Turn LED on or off.
    */
    //% group="LEDs"
    //% block="set %led state %onOff"
    //% weight=370
    //% onOff.shadow=toggleOnOff
    export function setLed(led: Leds, onOff: boolean) {
        let stateVal = onOff ? 1 : 0;
        
        if (led == Leds.LED20 || led == Leds.AllLED) writeReg2Bytes(0x0b, stateVal);
        if (led == Leds.LED40 || led == Leds.AllLED) writeReg2Bytes(0x0c, stateVal);
        if (led == Leds.LED60 || led == Leds.AllLED) writeReg2Bytes(0x0d, stateVal);
        if (led == Leds.LED80 || led == Leds.AllLED) writeReg2Bytes(0x0e, stateVal);
    }

    //% shim=mShieldInfrared::irCode
    function irCode(): number {
        return 0;
    }
    
    /**
      * Run code when a button is pressed on the IR remote.
      */
    //% group="Infrared sensor"
    //% weight=360
    //% block="on IR receiving"
    export function irCallBack(handler: () => void) {
        pins.setPull(DigitalPin.P12, PinPullMode.PullUp)

        control.inBackground(() => {
            while (true) {
                irVal = irCode()
                if (irVal > 0xff) {
                    handler()  
                }
                basic.pause(20)
            }
        })
    }

    /**
     * Select the value of the infrared key that you want to be pressed.
     */
    //% group="Infrared sensor"
    //% irButton.fieldEditor="gridpicker"
    //% irButton.fieldOptions.columns=3
    //% irButton.fieldOptions.tooltips="false"
    //% block="IR button %irButton is pressed"
    //% weight=359
    export function irButton(irButton: MshieldIrButtons): boolean {
        return (irVal & 0x00ff) == irButton as number
    }

    /**
     * Read IR value.
     * The correct infrared key value can only be read
     * when the infrared key value is not equal to 0 by logical judgment.
     * Return the key value of the infrared remote control, only the instruction code.
     */
    //% group="Infrared sensor"
    //% block="IR value"
    //% weight=358
    export function irValue(): number {
        return irVal & 0x00ff;
    }

    /**
     * Set the port type of S1-S4.
     * @param type - PWM or servo.
     */
    //% group="PWM port"
    //% weight=350
    //% block="set S1-S4 as %type ports"
    export function setS1ToS4Type(type: S1ToS4Type): void {
        writeReg2Bytes(0x0f, type);
    }

    /**
     * mShield S1--S4 ports output PWM signals.
     * @param index - S1--S4 ports.
     * @param pulseWidth - Pulse width.
     */
    //% group="PWM port"
    //% weight=349
    //% block="set %index PWM pulse width to %pulseWidth"
    //% pulseWidth.min=0 pulseWidth.max=200
    //% pulseWidth.defl=0
    export function extendPwmControl(index: PwmAndServoIndex, pulseWidth: number): void {
        pulseWidth = Math.max(0, Math.min(200, pulseWidth));

        if (index == PwmAndServoIndex.S1 || index == PwmAndServoIndex.All) writeReg2Bytes(0x10, pulseWidth);
        if (index == PwmAndServoIndex.S2 || index == PwmAndServoIndex.All) writeReg2Bytes(0x11, pulseWidth);
        if (index == PwmAndServoIndex.S3 || index == PwmAndServoIndex.All) writeReg2Bytes(0x12, pulseWidth);
        if (index == PwmAndServoIndex.S4 || index == PwmAndServoIndex.All) writeReg2Bytes(0x13, pulseWidth);
    }

    /**
     * Servo control module, used for 90, 180, 270 degrees servo.
     * When the S1--S4 ports of mShield are connected to the servo, this function can control the servo.
     * @param servoType - Servo type.
     * @param index - Servo interface on mShield.
     * @param angle - The Angle of rotation of the servo.
     */
    //% group="PWM port"
    //% weight=348
    //% block="set %index %servoType servo angle to %angle°"
    //% angle.defl=0
    export function extendServoControl(index: PwmAndServoIndex, servoType: ServoType, angle: number): void {
        let angleMap: number = 0;
        if (servoType == ServoType.Servo90) {
            angleMap = pins.map(angle, 0, 90, 50, 250);
        }else if (servoType == ServoType.Servo180) {
            angleMap = pins.map(angle, 0, 180, 50, 250);
        }else if (servoType == ServoType.Servo270) {
            angleMap = pins.map(angle, 0, 270, 50, 250);
        }

        if (index == PwmAndServoIndex.S1 || index == PwmAndServoIndex.All) writeReg2Bytes(0x14, angleMap);
        if (index == PwmAndServoIndex.S2 || index == PwmAndServoIndex.All) writeReg2Bytes(0x15, angleMap);
        if (index == PwmAndServoIndex.S3 || index == PwmAndServoIndex.All) writeReg2Bytes(0x16, angleMap);
        if (index == PwmAndServoIndex.S4 || index == PwmAndServoIndex.All) writeReg2Bytes(0x17, angleMap);
    }

    /**
     * The steering gear rotates continuously, and is used for the steering gear of 360 degrees rotation.
     * @param index - Servo interface on mShield. 
     * @param speed - The speed at which the servo rotates.
     */
    //% group="PWM port"
    //% weight=347
    //% block="set %index 360° servo speed to %speed\\%"
    //% speed.min=-100 speed.max=100
    //% speed.defl=0
    export function continuousServoControl(index: PwmAndServoIndex, speed: number): void {
        speed = pins.map(speed, -100, 100, 0, 180)
        extendServoControl(index, ServoType.Servo180, speed)
    }

    /**
     * Sets the battery type and returns the battery level.
     * @param batType - Type of battery. 
     * Return 0--100
     */
    //% group="Battery"
    //% weight=340
    //% block="battery level: %batType"
    export function batteryLevel(batType: BatteryType) : number {
        writeReg1Byte(batType);

        let batLevel = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
        return Math.min(100, batLevel); 
    }

    /**
     * Read the battery voltage value.
     * Return 0--25.5
     */
    //% group="Battery"
    //% weight=339
    //% block="battery voltage"
    export function batteryVoltage(): number {
        writeReg1Byte(0x1B);

        let batVolt = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
        return batVolt / 10;
    }

    /**
     * Read the firmware version of the chip on the mShield.
     * Returns a string. eg："Vx"
     */
    //% group="Others"
    //% weight=330
    //% block="version number"
    export function readVersions(): string {
        writeReg1Byte(0x00);

        let mCarVersions = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
        return `V${mCarVersions}`;
    }

    // --- NEOPIXEL SUB-GROUP WRAPPERS ---

    /**
     * Create a new NeoPixel driver block inside the JellySTEM tab.
     * @param pin the pin where the NeoPixel strip is connected, eg: DigitalPin.P15
     * @param numleds number of leds in the strip, eg: 4
     */
    //% group="NeoPixel"
    //% block="initialize %numleds NeoPixels on pin %pin"
    //% numleds.defl=4
    //% weight=90
    //% blockSetVariable=strip
    export function jellyNeoPixelCreate(pin: DigitalPin, numleds: number): neopixel.Strip {
        return neopixel.create(pin, numleds, NeoPixelMode.RGB);
    }

    /**
     * Shows all LEDs to a given color.
     * @param strip the neopixel strip variable
     * @param rgb RGB color of the LED
     */
    //% group="NeoPixel"
    //% block="%strip show color %rgb=neopixel_colors"
    //% strip.shadow=variables_get
    //% weight=85
    export function jellyNeoPixelColor(strip: neopixel.Strip, rgb: number): void {
        strip.showColor(rgb);
    }

    /**
     * Shows a rainbow pattern on all LEDs.
     * @param strip the neopixel strip variable
     */
    //% group="NeoPixel"
    //% block="%strip show rainbow pattern"
    //% strip.shadow=variables_get
    //% weight=84
    export function jellyNeoPixelRainbow(strip: neopixel.Strip): void {
        strip.showRainbow(1, 360);
    }

    /**
     * Displays a vertical bar graph on the NeoPixels.
     * @param strip the neopixel strip variable
     * @param value current value to plot
     * @param high maximum value, eg: 255
     */
    //% group="NeoPixel"
    //% block="%strip show bar graph of %value up to %high"
    //% strip.shadow=variables_get
    //% weight=83
    export function jellyNeoPixelBarGraph(strip: neopixel.Strip, value: number, high: number): void {
        strip.showBarGraph(value, high);
    }

    /**
     * Turn off all LEDs on the NeoPixel strip.
     * @param strip the neopixel strip variable
     */
    //% group="NeoPixel"
    //% block="%strip clear all pixels"
    //% strip.shadow=variables_get
    //% weight=80
    export function jellyNeoPixelClear(strip: neopixel.Strip): void {
        strip.clear();
        strip.show();
    }

    /**
     * Set the brightness level of the NeoPixel strip.
     * @param strip the neopixel strip variable
     * @param brightness brightness level from 0 to 255, eg: 128
     */
    //% group="NeoPixel"
    //% block="%strip set brightness to %brightness"
    //% strip.shadow=variables_get
    //% brightness.min=0 brightness.max=255
    //% brightness.defl=128
    //% weight=75
    export function jellyNeoPixelBrightness(strip: neopixel.Strip, brightness: number): void {
        strip.setBrightness(brightness);
    }
}