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
//% subcategories='["mShield", "NeoPixel", "OLED Display", "Distance Sensors"]'
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

    // Tracks current signed speed (-100 to 100) for each motor; used by accelerateMotor
    let motor1Speed = 0
    let motor2Speed = 0

    // Minimum non-zero speed sent to motors — values below this cause PWM whining without movement
    const MIN_MOTOR_SPEED = 40

    let irVal = 0

    // I2C address of the mShield board
    let i2cAddr: number = 0x29;

    // Write a register address + value byte to the mShield over I2C
    function writeReg2Bytes(reg: number, value: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    // Write a single command byte to the mShield over I2C
    function writeReg1Byte(reg: number): void {
        let buf = pins.createBuffer(1);
        buf[0] = reg;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    /**
     * Set the speed and direction of a motor.
     * @param motor which motor(s) to control
     * @param direction clockwise or counterclockwise
     * @param speed speed from 0 to 100
     */
    //% subcategory="mShield"
    //% group="Motors"
    //% block="set %motor %direction speed %speed\\%"
    //% speed.min=0 speed.max=100
    //% speed.defl=0
    //% weight=380
    export function setMotorsDirectionSpeed(motor: Motors, direction: MotorsDirection, speed: number): void {
        speed = Math.max(0, Math.min(100, speed));
        if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
            motor1Speed = (direction == MotorsDirection.CC) ? speed : -speed;
            let value = (direction == MotorsDirection.CC) ? speed : speed + 101;
            writeReg2Bytes(0x09, value);
        }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
            motor2Speed = (direction == MotorsDirection.CC) ? speed : -speed;
            let value = (direction == MotorsDirection.CC) ? speed : speed + 101;
            writeReg2Bytes(0x0a, value);
        }
    }

    /**
     * Set both motors at once using signed speeds (-100 to 100).
     * Positive = clockwise, negative = counterclockwise.
     * @param m1Speed motor 1 speed, eg: 80
     * @param m2Speed motor 2 speed, eg: 80
     */
    //% subcategory="mShield"
    //% group="Motors"
    //% block="set motor1 speed %m1Speed\\% motor2 speed %m2Speed\\%"
    //% m1Speed.min=-100 m1Speed.max=100
    //% m2Speed.min=-100 m2Speed.max=100
    //% weight=379
    export function setMotorsSpeed(m1Speed: number, m2Speed: number): void {
        m1Speed = Math.max(-100, Math.min(100, m1Speed));
        m2Speed = Math.max(-100, Math.min(100, m2Speed));
        if (m1Speed > 0) { motor1Speed = m1Speed; writeReg2Bytes(0x09, motor1Speed); }
        else if (m1Speed < 0) { motor1Speed = m1Speed; writeReg2Bytes(0x09, Math.abs(m1Speed) + 101); }
        else { motor1Speed = 0; writeReg2Bytes(0x09, 0); }
        if (m2Speed > 0) { motor2Speed = m2Speed; writeReg2Bytes(0x0a, motor2Speed); }
        else if (m2Speed < 0) { motor2Speed = m2Speed; writeReg2Bytes(0x0a, Math.abs(m2Speed) + 101); }
        else { motor2Speed = 0; writeReg2Bytes(0x0a, 0); }
    }

    /**
     * Stop a motor immediately (coast to stop, no braking).
     * @param motor which motor(s) to stop
     */
    //% subcategory="mShield"
    //% group="Motors"
    //% weight=378
    //% block="stop %motor"
    export function wheelStop(motor: Motors): void {
        if (motor == Motors.Motor1 || motor == Motors.AllMotors) { motor1Speed = 0; writeReg2Bytes(0x09, 0); }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) { motor2Speed = 0; writeReg2Bytes(0x0a, 0); }
    }

    /**
     * Brake or coast a motor.
     * Brake holds the motor shaft in place; coast lets it spin freely.
     * @param motor which motor(s) to control
     * @param mode brake or coast
     */
    //% subcategory="mShield"
    //% group="Motors"
    //% weight=377
    //% block="%motor %mode"
    export function wheelBrake(motor: Motors, mode: MotorMode): void {
        if (motor == Motors.Motor1 || motor == Motors.AllMotors) { motor1Speed = 0; writeReg2Bytes(0x19, mode); }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) { motor2Speed = 0; writeReg2Bytes(0x1a, mode); }
    }

    /**
     * Fine-tune left/right motor balance when the robot drifts.
     * Adjusts the mShield speed offset registers permanently.
     * @param offset1 Motor 1 trim, eg: -3
     * @param offset2 Motor 2 trim, eg: -3
     */
    //% subcategory="mShield"
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
     * Smoothly ramp a motor from its current speed to a target speed.
     * Runs in the background so it does not pause the rest of your program.
     * Avoids the motor dead zone where low PWM causes whining without movement.
     * @param motor which motor to ramp
     * @param targetSpeed target speed from -100 to 100, eg: 100
     * @param duration how long the ramp takes in milliseconds, eg: 1000
     */
    //% subcategory="mShield"
    //% group="Motors"
    //% blockId=jellystem_motor_accelerate
    //% block="ramp %motor to %targetSpeed\\% over %duration ms"
    //% targetSpeed.min=-100 targetSpeed.max=100
    //% duration.shadow=timePicker
    //% weight=85
    export function accelerateMotor(motor: Motors, targetSpeed: number, duration: number): void {
        targetSpeed = Math.max(-100, Math.min(100, targetSpeed));
        if (Math.abs(targetSpeed) > 0 && Math.abs(targetSpeed) < MIN_MOTOR_SPEED) {
            targetSpeed = targetSpeed > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED;
        }
        control.inBackground(function () {
            let steps = 20;
            let stepDelay = Math.max(10, duration / steps);
            let startSpeedM1 = motor1Speed;
            let startSpeedM2 = motor2Speed;
            let effectiveStartM1 = (targetSpeed !== 0 && Math.abs(startSpeedM1) < MIN_MOTOR_SPEED)
                ? (targetSpeed > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED) : startSpeedM1;
            let effectiveStartM2 = (targetSpeed !== 0 && Math.abs(startSpeedM2) < MIN_MOTOR_SPEED)
                ? (targetSpeed > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED) : startSpeedM2;
            for (let i = 1; i <= steps; i++) {
                let progress = i / steps;
                if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
                    motor1Speed = Math.round(effectiveStartM1 + (targetSpeed - effectiveStartM1) * progress);
                    let m1Write = motor1Speed;
                    if (Math.abs(m1Write) > 0 && Math.abs(m1Write) < MIN_MOTOR_SPEED)
                        m1Write = (targetSpeed === 0) ? 0 : (m1Write > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED);
                    writeReg2Bytes(0x09, (m1Write >= 0) ? m1Write : (Math.abs(m1Write) + 101));
                }
                if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
                    motor2Speed = Math.round(effectiveStartM2 + (targetSpeed - effectiveStartM2) * progress);
                    let m2Write = motor2Speed;
                    if (Math.abs(m2Write) > 0 && Math.abs(m2Write) < MIN_MOTOR_SPEED)
                        m2Write = (targetSpeed === 0) ? 0 : (m2Write > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED);
                    writeReg2Bytes(0x0a, (m2Write >= 0) ? m2Write : (Math.abs(m2Write) + 101));
                }
                basic.pause(stepDelay);
            }
        });
    }

    /**
     * Turn one or all mShield indicator LEDs on or off.
     * @param led which LED brightness level to control
     * @param onOff true = on, false = off
     */
    //% subcategory="mShield"
    //% group="LEDs"
    //% block="turn %led %onOff"
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
    function irCode(): number { return 0; }

    /**
     * Run code whenever an IR remote button is pressed.
     * Listens on pin P12 in the background.
     * @param handler code to run on each button press
     */
    //% subcategory="mShield"
    //% group="Infrared sensor"
    //% weight=360
    //% block="on IR remote signal"
    export function irCallBack(handler: () => void) {
        pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
        control.inBackground(() => {
            while (true) {
                irVal = irCode()
                if (irVal > 0xff) handler()
                basic.pause(20)
            }
        })
    }

    /**
     * Check if a specific IR remote button was the last one pressed.
     * Use inside an "on IR remote signal" block.
     * @param irButton the button to check
     */
    //% subcategory="mShield"
    //% group="Infrared sensor"
    //% irButton.fieldEditor="gridpicker"
    //% irButton.fieldOptions.columns=3
    //% irButton.fieldOptions.tooltips="false"
    //% block="IR button %irButton pressed"
    //% weight=359
    export function irButton(irButton: MshieldIrButtons): boolean {
        return (irVal & 0x00ff) == irButton as number
    }

    /**
     * Read the raw code of the last IR remote button pressed.
     * Returns 0 if no button has been pressed yet.
     */
    //% subcategory="mShield"
    //% group="Infrared sensor"
    //% block="IR value"
    //% weight=358
    export function irValue(): number { return irVal & 0x00ff; }

    /**
     * Set whether the S1–S4 ports behave as PWM outputs or servo outputs.
     * Call this once in "on start" before using any S1–S4 block.
     * @param type PWM or servo
     */
    //% subcategory="mShield"
    //% group="Servos (S1/S2/S3/S4)"
    //% weight=350
    //% block="set S1–S4 type to %type"
    export function setS1ToS4Type(type: S1ToS4Type): void { writeReg2Bytes(0x0f, type); }

    /**
     * Set the PWM pulse width on an S1–S4 port (0–200).
     * @param index which S port(s) to control
     * @param pulseWidth pulse width value, eg: 100
     */
    //% subcategory="mShield"
    //% group="Servos (S1/S2/S3/S4)"
    //% weight=349
    //% block="set %index PWM to %pulseWidth"
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
     * Set the angle of a positional servo plugged into an S1–S4 port.
     * @param index which S port the servo is on
     * @param servoType the rotation range of your servo
     * @param angle target angle in degrees, eg: 90
     */
    //% subcategory="mShield"
    //% group="Servos (S1/S2/S3/S4)"
    //% weight=348
    //% block="set %index %servoType servo to %angle°"
    //% angle.defl=0
    export function extendServoControl(index: PwmAndServoIndex, servoType: ServoType, angle: number): void {
        let angleMap: number = 0;
        if (servoType == ServoType.Servo90) { angle = Math.max(0, Math.min(90, angle)); angleMap = pins.map(angle, 0, 90, 50, 250); }
        else if (servoType == ServoType.Servo180) { angle = Math.max(0, Math.min(180, angle)); angleMap = pins.map(angle, 0, 180, 50, 250); }
        else if (servoType == ServoType.Servo270) { angle = Math.max(0, Math.min(270, angle)); angleMap = pins.map(angle, 0, 270, 50, 250); }
        if (index == PwmAndServoIndex.S1 || index == PwmAndServoIndex.All) writeReg2Bytes(0x14, angleMap);
        if (index == PwmAndServoIndex.S2 || index == PwmAndServoIndex.All) writeReg2Bytes(0x15, angleMap);
        if (index == PwmAndServoIndex.S3 || index == PwmAndServoIndex.All) writeReg2Bytes(0x16, angleMap);
        if (index == PwmAndServoIndex.S4 || index == PwmAndServoIndex.All) writeReg2Bytes(0x17, angleMap);
    }

    /**
     * Run a 360° continuous rotation servo at a set speed.
     * Speed -100 = full reverse, 0 = stop, 100 = full forward.
     * @param index which S port the servo is on
     * @param speed speed from -100 to 100, eg: 0
     */
    //% subcategory="mShield"
    //% group="Servos (S1/S2/S3/S4)"
    //% weight=347
    //% block="set %index 360° servo speed to %speed\\%"
    //% speed.min=-100 speed.max=100
    //% speed.defl=0
    export function continuousServoControl(index: PwmAndServoIndex, speed: number): void {
        speed = pins.map(speed, -100, 100, 0, 180);
        extendServoControl(index, ServoType.Servo180, speed);
    }

    // =========================================================================
    // --- SERVO (via dependency: microsoft/pxt-common-packages/libs/servo) ---
    // These blocks drive servos on the micro:bit edge connector pins (P0/P1/P2)
    // directly — no mShield board required. They will be merged with the mShield
    // PWM port servo blocks in a future update.
    // =========================================================================

    export enum ServoPin {
        //% block="P0"
        P0 = 0,
        //% block="P1"
        P1 = 1,
        //% block="P2"
        P2 = 2
    }

    function getServo(pin: ServoPin): servos.Servo {
        if (pin === ServoPin.P1) return servos.P1;
        if (pin === ServoPin.P2) return servos.P2;
        return servos.P0;
    }

    /**
     * Turn a positional servo to a specific angle.
     * 0° = full left, 90° = centre, 180° = full right.
     * Plug the servo directly into the micro:bit edge connector.
     * @param pin edge connector pin the servo is on
     * @param degrees angle to move to, eg: 90
     */
    //% subcategory="mShield"
    //% group="Servos (P0/P1/P2)"
    //% blockId=jelly_servo_set_angle
    //% block="set servo %pin to %degrees °"
    //% degrees.min=0 degrees.max=180 degrees.defl=90
    //% weight=346
    export function servoSetAngle(pin: ServoPin, degrees: number): void { getServo(pin).setAngle(degrees); }

    /**
     * Run a continuous (360°) servo at a set speed.
     * Positive = forward, negative = backward, 0 = stop.
     * @param pin edge connector pin the servo is on
     * @param speed speed from -100 to 100, eg: 50
     */
    //% subcategory="mShield"
    //% group="Servos (P0/P1/P2)"
    //% blockId=jelly_servo_run
    //% block="continuous servo %pin run at %speed \\%"
    //% speed.min=-100 speed.max=100 speed.defl=50
    //% weight=345
    export function servoRun(pin: ServoPin, speed: number): void { getServo(pin).run(speed); }

    /**
     * Stop a servo. It holds its last position but will not resist being moved.
     * @param pin edge connector pin the servo is on
     */
    //% subcategory="mShield"
    //% group="Servos (P0/P1/P2)"
    //% blockId=jelly_servo_stop
    //% block="stop servo %pin"
    //% weight=344
    export function servoStop(pin: ServoPin): void { getServo(pin).stop(); }

    /**
     * Set the servo signal pulse width directly in microseconds.
     * 1000 μs = far left, 1500 μs = centre, 2000 μs = far right.
     * Useful for non-standard or fine-tuning scenarios.
     * @param pin edge connector pin the servo is on
     * @param micros pulse width in μs, eg: 1500
     */
    //% subcategory="mShield"
    //% group="Servos (P0/P1/P2)"
    //% blockId=jelly_servo_set_pulse
    //% block="set servo %pin pulse to %micros μs"
    //% micros.min=500 micros.max=2500 micros.defl=1500
    //% weight=343
    export function servoSetPulse(pin: ServoPin, micros: number): void { getServo(pin).setPulse(micros); }

    /**
     * Limit the angle range a servo can move to.
     * Useful if your servo physically cannot reach 0° or 180°.
     * @param pin edge connector pin the servo is on
     * @param minAngle minimum allowed angle, eg: 0
     * @param maxAngle maximum allowed angle, eg: 180
     */
    //% subcategory="mShield"
    //% group="Servos (P0/P1/P2)"
    //% blockId=jelly_servo_set_range
    //% block="set servo %pin range %minAngle to %maxAngle °"
    //% minAngle.min=0 minAngle.max=90 minAngle.defl=0
    //% maxAngle.min=90 maxAngle.max=180 maxAngle.defl=180
    //% weight=342
    export function servoSetRange(pin: ServoPin, minAngle: number, maxAngle: number): void { getServo(pin).setRange(minAngle, maxAngle); }

    /**
     * Set whether a continuous servo auto-stops when it reaches the centre (90°).
     * Useful for self-centering steering mechanisms.
     * @param pin edge connector pin the servo is on
     * @param enabled true to stop at neutral position
     */
    //% subcategory="mShield"
    //% group="Servos (P0/P1/P2)"
    //% blockId=jelly_servo_stop_on_neutral
    //% block="set servo %pin stop at middle %enabled"
    //% enabled.shadow=toggleOnOff
    //% weight=341
    export function servoSetStopOnNeutral(pin: ServoPin, enabled: boolean): void { getServo(pin).setStopOnNeutral(enabled); }

    // Moved battery functions from mShield extension to here for better organization

    /**
     * Read the battery level as a percentage (0–100).
     * Tell it what battery type you are using so it can calculate correctly.
     * @param batType battery chemistry and cell count
     */
    //% subcategory="mShield"
    //% group="Battery"
    //% weight=340
    //% block="battery level with %batType"
    export function batteryLevel(batType: BatteryType): number {
        writeReg1Byte(batType);
        let batLevel = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
        return Math.min(100, batLevel);
    }

    /**
     * Read the raw battery voltage in volts (0–25.5 V).
     */
    //% subcategory="mShield"
    //% group="Battery"
    //% weight=339
    //% block="battery voltage"
    export function batteryVoltage(): number {
        writeReg1Byte(0x1B);
        let batVolt = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
        return batVolt / 10;
    }

    /**
     * Read the firmware version string from the mShield chip.
     * Returns a string like "V3".
     */
    //% subcategory="mShield"
    //% group="Others"
    //% weight=330
    //% block="version number"
    export function readVersions(): string {
        writeReg1Byte(0x00);
        let mCarVersions = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
        return `V${mCarVersions}`;
    }

    // =========================================================================
    // --- IR DISTANCE SENSOR: SHARP GP2Y0A41SK0F ---
    // Analog triangulation sensor. Range: 4–40 cm. Connect signal to any analog pin.
    // =========================================================================

    export enum IrDistanceUnit {
        //% block="cm"
        Cm = 0,
        //% block="mm"
        Mm = 1,
        //% block="inch"
        Inch = 2,
        //% block="raw"
        Raw = 3
    }

    export enum IrDistanceComparison {
        //% block="closer"
        Closer = 0,
        //% block="farther"
        Farther = 1
    }

    // Internal: convert raw ADC value to distance in the requested unit.
    // Formula d = 3300/(raw+15) is calibrated for the GP2Y0A41SK0F on 3.3 V / 10-bit ADC.
    // Returns 0 for out-of-range readings (blind spot or nothing detected).
    function internalReadSharpIR(pin: AnalogPin, unit: IrDistanceUnit): number {
        let raw = pins.analogReadPin(pin);
        if (unit === IrDistanceUnit.Raw) return raw;
        if (raw <= 10) return 0;
        let cm = Math.round(3300 / (raw + 15));
        if (cm < 4 || cm > 40) return 0;
        if (unit === IrDistanceUnit.Mm) return cm * 10;
        if (unit === IrDistanceUnit.Inch) return Math.round(cm / 2.54);
        return cm;
    }

    /**
     * Set up the Sharp GP2Y0A41SK0F IR distance sensor. Run once in "on start".
     * Performs 5 warmup reads so the first distance reading is stable.
     * @param pin the analog pin the sensor signal wire is connected to
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_setup
    //% block="set up IR sensor at %pin"
    //% weight=391
    export function setUpIrSensor(pin: AnalogPin): void {
        for (let i = 0; i < 5; i++) { pins.analogReadPin(pin); basic.pause(10); }
    }

    /**
     * Read how far away the nearest object is using the Sharp IR sensor.
     * Returns 0 if nothing is detected or the reading is out of range (4–40 cm).
     * @param pin the analog pin the sensor is on
     * @param unit cm, mm, inch, or raw ADC value
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_distance_read
    //% block="IR distance at %pin in %unit"
    //% weight=390
    export function readIrDistance(pin: AnalogPin, unit: IrDistanceUnit): number {
        return internalReadSharpIR(pin, unit);
    }

    /**
     * Check whether an object is closer or farther than a set distance.
     * Includes blind-spot safety: a reading of 0 near the sensor still counts as "closer".
     * @param pin the analog pin the sensor is on
     * @param comparison closer or farther
     * @param threshold the distance to compare against, eg: 15
     * @param unit cm, mm, or inch
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_distance_check
    //% block="IR distance %comparison than %threshold %unit at %pin"
    //% weight=389
    export function checkIrDistance(pin: AnalogPin, comparison: IrDistanceComparison, threshold: number, unit: IrDistanceUnit): boolean {
        let raw = pins.analogReadPin(pin);
        let d = internalReadSharpIR(pin, unit);
        if (comparison === IrDistanceComparison.Closer)
            return (d > 0 && d < threshold) || (d === 0 && raw > 300);
        return (d > threshold) || (d === 0 && raw <= 300);
    }

    /**
     * Run code every time an object crosses a distance threshold (in either direction).
     * Uses 200 ms debounce to prevent noise from triggering false events.
     * @param pin the analog pin the sensor is on
     * @param comparison closer or farther
     * @param threshold the distance threshold, eg: 15
     * @param unit cm, mm, or inch
     * @param handler code to run on each crossing
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_on_cross
    //% block="on IR %comparison than %threshold %unit at %pin"
    //% weight=388
    export function onIrDistanceCrossed(pin: AnalogPin, comparison: IrDistanceComparison, threshold: number, unit: IrDistanceUnit, handler: () => void): void {
        control.inBackground(() => {
            let stableState = checkIrDistance(pin, comparison, threshold, unit);
            let candidateState = stableState;
            let durationStable = 0;
            const CHECK_INTERVAL = 50;
            const DEBOUNCE_REQUIRED = 200;
            while (true) {
                basic.pause(CHECK_INTERVAL);
                let currentState = checkIrDistance(pin, comparison, threshold, unit);
                if (currentState !== stableState) {
                    if (currentState === candidateState) {
                        durationStable += CHECK_INTERVAL;
                        if (durationStable >= DEBOUNCE_REQUIRED) { stableState = currentState; handler(); }
                    } else { candidateState = currentState; durationStable = CHECK_INTERVAL; }
                } else { candidateState = stableState; durationStable = 0; }
            }
        });
    }

    /**
     * Run code once the first time an object enters a set range.
     * Automatically re-arms itself once the object moves away.
     * @param pin the analog pin the sensor is on
     * @param threshold detection distance, eg: 15
     * @param unit cm, mm, or inch
     * @param handler code to run when something is detected
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_on_detected
    //% block="on IR object detected within %threshold %unit at %pin"
    //% weight=387
    export function onIrObjectDetected(pin: AnalogPin, threshold: number, unit: IrDistanceUnit, handler: () => void): void {
        control.inBackground(() => {
            let isInside = checkIrDistance(pin, IrDistanceComparison.Closer, threshold, unit);
            while (true) {
                basic.pause(50);
                let currentlyInside = checkIrDistance(pin, IrDistanceComparison.Closer, threshold, unit);
                if (currentlyInside && !isInside) { isInside = true; handler(); }
                else if (!currentlyInside && isInside) { isInside = false; }
            }
        });
    }

    // =========================================================================
    // --- ULTRASONIC DISTANCE SENSOR (HC-SR04 / RCWL-1601) ---
    // Time-of-flight sensor. Range: 2–300 cm. Requires Trig + Echo pins.
    // Adapted from MakerBit ultrasonic extension by 1010Technologies
    // github.com/1010Technologies/pxt-makerbit-ultrasonic — MIT License
    // =========================================================================

    export enum UltrasonicModel {
        //% block="HC-SR04"
        // HC_SR04 is commented out because it is not used
        // HC_SR04 = 58,   // 58 μs per cm round-trip at sea level
        //% block="RCWL-1601"
        RCWL_1601 = 50  // 50 μs per cm — different timing due to sensor hardware
    }

    export enum UltrasonicUnit {
        //% block="cm"
        Cm = 0,
        //% block="mm"
        Mm = 1,
        //% block="inch"
        Inch = 2,
        //% block="raw"
        Raw = 3
    }

    export enum UltrasonicComparison {
        //% block="closer"
        Closer = 0,
        //% block="farther"
        Farther = 1
    }

    const JELLY_ULTRASONIC_EVENT_ID = 700
    const ULTRASONIC_MAX_TRAVEL_TIME = 17400  // 300 cm * 58 μs/cm
    const ULTRASONIC_MEASUREMENTS = 3         // median of last 3 measurements
    const ULTRASONIC_PULSE_INTERVAL_MS = 145  // ~7 measurements per second

    interface UltrasonicRoundTrip { ts: number; rtt: number }
    interface UltrasonicDevice {
        trig: DigitalPin | undefined
        model: UltrasonicModel
        roundTrips: UltrasonicRoundTrip[]
        medianRoundTrip: number
        travelTimeObservers: number[]
    }
    let ultrasonicState: UltrasonicDevice

    function ultrasonicMedian(values: number[]): number {
        values.sort((a, b) => a - b)
        return values[(values.length - 1) >> 1]
    }

    function ultrasonicTriggerPulse(): void {
        let trig = ultrasonicState.trig;
        if (trig === undefined) return;
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10); // 10 μs high pulse triggers the sensor
        pins.digitalWritePin(trig, 0);
    }

    function ultrasonicTriggerObservers(): void {
        for (let i = 0; i < ultrasonicState.travelTimeObservers.length; i++) {
            const threshold = ultrasonicState.travelTimeObservers[i]
            if (threshold > 0 && ultrasonicState.medianRoundTrip <= threshold) {
                control.raiseEvent(JELLY_ULTRASONIC_EVENT_ID, threshold)
                ultrasonicState.travelTimeObservers[i] = -threshold // negative = already fired, re-armed on exit
            } else if (threshold < 0 && ultrasonicState.medianRoundTrip > -threshold) {
                ultrasonicState.travelTimeObservers[i] = -threshold // object left range, re-arm
            }
        }
    }

    function ultrasonicMeasureInBackground(): void {
        const trips = ultrasonicState.roundTrips
        while (true) {
            const now = input.runningTime()
            if (trips[trips.length - 1].ts < now - ULTRASONIC_PULSE_INTERVAL_MS - 10)
                trips.push({ ts: now, rtt: ULTRASONIC_MAX_TRAVEL_TIME })
            while (trips.length > ULTRASONIC_MEASUREMENTS) { trips.shift() }
            ultrasonicState.medianRoundTrip = ultrasonicMedian(trips.map(urt => urt.rtt))
            ultrasonicTriggerObservers()
            ultrasonicTriggerPulse()
            basic.pause(ULTRASONIC_PULSE_INTERVAL_MS)
        }
    }

    function ultrasonicRttToUnit(rtt: number, model: UltrasonicModel, unit: UltrasonicUnit): number {
        if (unit === UltrasonicUnit.Raw) return rtt;
        let cm = Math.floor(rtt / (model as number)); // model value IS the μs-per-cm divisor
        if (unit === UltrasonicUnit.Mm) return cm * 10;
        if (unit === UltrasonicUnit.Inch) return Math.floor(cm / 2.54);
        return cm;
    }

    /**
     * Set up the ultrasonic distance sensor. Run once in "on start".
     * Starts a background measurement loop — do not call more than once.
     * @param model sensor model — HC-SR04 or RCWL-1601 (different timing)
     * @param trig pin connected to the Trig wire, eg: DigitalPin.P13
     * @param echo pin connected to the Echo wire, eg: DigitalPin.P14
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_setup
    //% block="set up %model ultrasonic sensor: Trig %trig Echo %echo"
    //% trig.fieldEditor="gridpicker" trig.fieldOptions.columns=4
    //% echo.fieldEditor="gridpicker" echo.fieldOptions.columns=4
    //% trig.defl=DigitalPin.P0
    //% echo.defl=DigitalPin.P0
    //% model.defl=RCWL_1601
    //% weight=396
    export function connectUltrasonic(model: UltrasonicModel, trig: DigitalPin, echo: DigitalPin): void {
        if (ultrasonicState && ultrasonicState.trig) return; // already set up — ignore
        if (!ultrasonicState) {
            ultrasonicState = { trig: trig, model: model, roundTrips: [{ ts: 0, rtt: ULTRASONIC_MAX_TRAVEL_TIME }], medianRoundTrip: ULTRASONIC_MAX_TRAVEL_TIME, travelTimeObservers: [] }
        } else { ultrasonicState.trig = trig; ultrasonicState.model = model; }
        pins.onPulsed(echo, PulseValue.High, () => {
            if (pins.pulseDuration() < ULTRASONIC_MAX_TRAVEL_TIME && ultrasonicState.roundTrips.length <= ULTRASONIC_MEASUREMENTS)
                ultrasonicState.roundTrips.push({ ts: input.runningTime(), rtt: pins.pulseDuration() })
        })
        control.inBackground(ultrasonicMeasureInBackground)
    }

    /**
     * Read how far away the nearest object is using the ultrasonic sensor.
     * Returns -1 if the sensor has not been set up with connectUltrasonic yet.
     * Uses the median of the last 3 measurements to filter noise.
     * @param unit cm, mm, inch, or raw round-trip time in μs
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_distance_read
    //% block="ultrasonic distance in %unit"
    //% weight=395
    export function readUltrasonicDistance(unit: UltrasonicUnit): number {
        if (!ultrasonicState) return -1;
        basic.pause(0); // yield so the background fiber can update medianRoundTrip
        return ultrasonicRttToUnit(ultrasonicState.medianRoundTrip, ultrasonicState.model, unit);
    }

    /**
     * Check whether an object is closer or farther than a set distance.
     * Returns false if the sensor has not been set up yet.
     * @param comparison closer or farther
     * @param threshold the distance to compare against, eg: 20
     * @param unit cm, mm, or inch
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_check
    //% block="ultrasonic %comparison than %threshold %unit"
    //% weight=394
    export function checkUltrasonicDistance(comparison: UltrasonicComparison, threshold: number, unit: UltrasonicUnit): boolean {
        let d = readUltrasonicDistance(unit);
        if (d === -1) return false;
        return comparison === UltrasonicComparison.Closer ? d < threshold : d > threshold;
    }

    /**
     * Run code every time an object crosses a distance threshold (in either direction).
     * Uses 200 ms debounce to avoid false triggers from sensor noise.
     * @param comparison closer or farther
     * @param threshold the distance threshold, eg: 20
     * @param unit cm, mm, or inch
     * @param handler code to run on each crossing
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_on_cross
    //% block="on ultrasonic %comparison than %threshold %unit"
    //% weight=393
    export function onUltrasonicDistanceCrossed(comparison: UltrasonicComparison, threshold: number, unit: UltrasonicUnit, handler: () => void): void {
        control.inBackground(() => {
            let stableState = checkUltrasonicDistance(comparison, threshold, unit);
            let candidateState = stableState;
            let durationStable = 0;
            const CHECK_INTERVAL = 50;
            const DEBOUNCE_REQUIRED = 200;
            while (true) {
                basic.pause(CHECK_INTERVAL);
                let currentState = checkUltrasonicDistance(comparison, threshold, unit);
                if (currentState !== stableState) {
                    if (currentState === candidateState) {
                        durationStable += CHECK_INTERVAL;
                        if (durationStable >= DEBOUNCE_REQUIRED) { stableState = currentState; handler(); }
                    } else { candidateState = currentState; durationStable = CHECK_INTERVAL; }
                } else { candidateState = stableState; durationStable = 0; }
            }
        });
    }

    /**
     * Run code once the first time an object comes within a set distance.
     * Automatically re-arms when the object moves away, so it can trigger again.
     * Uses the hardware event system built into the background measurement loop.
     * @param distance detection distance, eg: 20
     * @param unit cm, mm, or inch
     * @param handler code to run when something is detected
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_on_detected
    //% block="on ultrasonic object detected within %distance %unit"
    //% weight=392
    export function onUltrasonicObjectDetected(distance: number, unit: UltrasonicUnit, handler: () => void): void {
        if (distance <= 0) return;
        if (!ultrasonicState) {
            ultrasonicState = { trig: undefined, model: UltrasonicModel.RCWL_1601, roundTrips: [{ ts: 0, rtt: ULTRASONIC_MAX_TRAVEL_TIME }], medianRoundTrip: ULTRASONIC_MAX_TRAVEL_TIME, travelTimeObservers: [] }
        }
        // Convert the threshold distance to a round-trip time in μs using the model's divisor
        let modelDivisor = ultrasonicState.model as number;
        let divisor = (unit === UltrasonicUnit.Inch) ? Math.floor(modelDivisor * 2.54) : (unit === UltrasonicUnit.Mm) ? Math.floor(modelDivisor / 10) : modelDivisor;
        const travelTimeThreshold = Math.imul(distance, divisor);
        ultrasonicState.travelTimeObservers.push(travelTimeThreshold);
        control.onEvent(JELLY_ULTRASONIC_EVENT_ID, travelTimeThreshold, () => { handler(); });
    }

    // =========================================================================
    // --- NEOPIXEL (via dependency: microsoft/pxt-neopixel v0.7.3) ---
    // Full parity wrapper — all blocks appear in the JellySTEM drawer.
    // =========================================================================

    /**
     * Create a NeoPixel strip driver. Call once in "on start" and store in a variable.
     * @param pin the micro:bit pin the data wire is connected to
     * @param numleds number of LEDs in the strip, eg: 24
     * @param mode colour format — RGB, RGBW, or RGB+IR
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_create
    //% block="NeoPixel at pin %pin|with %numleds|leds as %mode"
    //% weight=90 blockGap=8
    //% blockSetVariable=strip
    export function create(pin: DigitalPin, numleds: number, mode: NeoPixelMode): neopixel.Strip {
        return neopixel.create(pin, numleds, mode);
    }

    /**
     * Set every LED on the strip to the same colour and show immediately.
     * @param rgb colour value from the colour picker
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_show_color
    //% block="%strip|show color %rgb=neopixel_colors"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=85 blockGap=8
    export function showColor(strip: neopixel.Strip, rgb: number): void { strip.showColor(rgb); }

    /**
     * Display a rainbow gradient across all LEDs and show immediately.
     * @param startHue hue at the first LED (1–360), eg: 1
     * @param endHue hue at the last LED (1–360), eg: 360
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_show_rainbow
    //% block="%strip|show rainbow from %startHue|to %endHue"
    //% strip.defl=strip strip.shadow=variables_get
    //% startHue.defl=1 endHue.defl=360
    //% weight=85 blockGap=8
    export function showRainbow(strip: neopixel.Strip, startHue: number = 1, endHue: number = 360): void { strip.showRainbow(startHue, endHue); }

    /**
     * Display a bar graph across the strip based on a value and maximum.
     * If high is 0 the scale adjusts automatically.
     * @param value the current reading to display, eg: 128
     * @param high the maximum value for the scale, eg: 255
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_show_bar_graph
    //% block="%strip|show bar graph of %value|up to %high"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=84 blockGap=8
    export function showBarGraph(strip: neopixel.Strip, value: number, high: number): void { strip.showBarGraph(value, high); }

    /**
     * Create a sub-range view of the strip so you can address a section independently.
     * The returned strip shares the parent buffer — call show on the parent to update.
     * @param start index of the first LED in the range
     * @param length number of LEDs in the range
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_range
    //% block="%strip|range from %start|with %length|leds"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=89 blockGap=8
    //% blockSetVariable=range
    export function range(strip: neopixel.Strip, start: number, length: number): neopixel.Strip { return strip.range(start, length); }

    /**
     * Set one LED to a colour without showing it yet.
     * Call show() after setting all the pixels you want to change.
     * @param pixeloffset index of the LED (0 = first)
     * @param rgb colour value
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_set_pixel_color
    //% block="%strip|set pixel color at %pixeloffset|to %rgb=neopixel_colors"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=80 blockGap=8
    export function setPixelColor(strip: neopixel.Strip, pixeloffset: number, rgb: number): void { strip.setPixelColor(pixeloffset, rgb); }

    /**
     * Push all pending colour changes to the strip so they become visible.
     * You must call show() after setPixelColor, clear, setBrightness, etc.
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_show
    //% block="%strip|show"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=79 blockGap=8
    export function show(strip: neopixel.Strip): void { strip.show(); }

    /**
     * Turn off all LEDs (set to black). Call show() to make it visible.
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_clear
    //% block="%strip|clear"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=76 blockGap=8
    export function clear(strip: neopixel.Strip): void { strip.clear(); }

    /**
     * Set the brightness for all future colour commands (0 = off, 255 = full).
     * Does not affect already-displayed colours — call show() to update.
     * @param brightness brightness level 0–255, eg: 128
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_set_brightness
    //% block="%strip|set brightness %brightness"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=59 blockGap=8
    export function setBrightness(strip: neopixel.Strip, brightness: number): void { strip.setBrightness(brightness); }

    /**
     * Shift all LED colours one step forward and clear the end. Call show() to display.
     * @param offset number of positions to shift, eg: 1
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_shift
    //% block="%strip|shift pixels by %offset"
    //% strip.defl=strip strip.shadow=variables_get
    //% offset.defl=1
    //% weight=40 blockGap=8
    export function shift(strip: neopixel.Strip, offset: number = 1): void { strip.shift(offset); }

    /**
     * Rotate all LED colours forward — the last colour wraps to the front. Call show().
     * @param offset number of positions to rotate, eg: 1
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_rotate
    //% block="%strip|rotate pixels by %offset"
    //% strip.defl=strip strip.shadow=variables_get
    //% offset.defl=1
    //% weight=39 blockGap=8
    export function rotate(strip: neopixel.Strip, offset: number = 1): void { strip.rotate(offset); }

    /**
     * Convert hue / saturation / luminosity values to an RGB colour number.
     * @param h hue 0–360, eg: 180
     * @param s saturation 0–99, eg: 99
     * @param l luminosity 0–99, eg: 50
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_hsl
    //% block="hue %h|saturation %s|luminosity %l"
    //% h.min=0 h.max=360 s.min=0 s.max=99 l.min=0 l.max=99
    //% weight=63 blockGap=8
    export function hsl(h: number, s: number, l: number): number { return neopixel.hsl(h, s, l); }

    /**
     * Pick a named colour (Red, Green, Blue, etc.) as an RGB number.
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_colors
    //% block="%color"
    //% weight=2 blockGap=8
    export function colors(color: NeoPixelColors): number { return neopixel.colors(color); }

    /**
     * Mix red, green, and blue channel values into a single RGB colour number.
     * @param red red channel 0–255
     * @param green green channel 0–255
     * @param blue blue channel 0–255
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_rgb
    //% block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% weight=1 blockGap=8
    export function rgb(red: number, green: number, blue: number): number { return neopixel.rgb(red, green, blue); }

    /**
     * Set the white channel brightness on a single LED (RGBW strips only).
     * Call show() to make it visible.
     * @param pixeloffset index of the LED
     * @param white white brightness 0–255
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_set_pixel_white
    //% block="%strip|set pixel white LED at %pixeloffset|to %white"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=80 blockGap=8
    export function setPixelWhiteLED(strip: neopixel.Strip, pixeloffset: number, white: number): void { strip.setPixelWhiteLED(pixeloffset, white); }

    /**
     * Get the total number of LEDs in the strip.
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_length
    //% block="%strip|length"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=60 blockGap=8
    export function length(strip: neopixel.Strip): number { return strip.length(); }

    /**
     * Apply a quadratic easing curve to the current brightness setting.
     * Gives a more natural-looking brightness fade.
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_ease_brightness
    //% block="%strip|ease brightness"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=58 blockGap=8
    export function easeBrightness(strip: neopixel.Strip): void { strip.easeBrightness(); }

    /**
     * Declare the number of LEDs per row when your strip is arranged as a grid.
     * Required before using setMatrixColor.
     * @param width number of LEDs per row, eg: 8
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_set_matrix_width
    //% block="%strip|set matrix width %width"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=5 blockGap=8
    export function setMatrixWidth(strip: neopixel.Strip, width: number): void { strip.setMatrixWidth(width); }

    /**
     * Set the colour of one LED in a grid layout using x/y coordinates.
     * Call show() to make it visible.
     * @param x column (0 = left)
     * @param y row (0 = top)
     * @param rgb colour value
     */
    //% subcategory="NeoPixel"
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_set_matrix_color
    //% block="%strip|set matrix color at x %x|y %y|to %rgb=neopixel_colors"
    //% strip.defl=strip strip.shadow=variables_get
    //% weight=4 blockGap=8
    export function setMatrixColor(strip: neopixel.Strip, x: number, y: number, rgb: number): void { strip.setMatrixColor(x, y, rgb); }

    // =========================================================================
    // --- OLED 128×64 DISPLAY (via tinkertanker/pxt-oled-ssd1306 v2.0.18) ---
    // Hardware: SSD1306 chip, I2C address 0x3C, P19=SCL P20=SDA.
    // Text/progress/outline shapes go through the tinkertanker library.
    // Filled shapes use an internal 1 KB framebuffer flushed in one I2C burst.
    // =========================================================================

    const OLED_ADDR = 0x3C
    const OLED_WIDTH = 128
    const OLED_PAGES = 8   // 64 px tall / 8 px per page = 8 pages

    // 1 KB framebuffer: fb[page * 128 + col] holds 8 vertical pixel bits
    let oledFb: Buffer = pins.createBuffer(0)

    function oledFbInit(): void {
        if (oledFb.length === 0) oledFb = pins.createBuffer(OLED_WIDTH * OLED_PAGES)
    }

    // Flush the internal framebuffer to the display in a single I2C burst.
    // Called automatically by oledRect (filled) and oledCircle (filled).
    function oledFbFlush(): void {
        let cmd = pins.createBuffer(2)
        cmd[0] = 0x00; cmd[1] = 0x21; pins.i2cWriteBuffer(OLED_ADDR, cmd, false) // set column address command
        cmd[1] = 0x00; pins.i2cWriteBuffer(OLED_ADDR, cmd, false)                // start column 0
        cmd[1] = 0x7F; pins.i2cWriteBuffer(OLED_ADDR, cmd, false)                // end column 127
        cmd[1] = 0x22; pins.i2cWriteBuffer(OLED_ADDR, cmd, false)                // set page address command
        cmd[1] = 0x00; pins.i2cWriteBuffer(OLED_ADDR, cmd, false)                // start page 0
        cmd[1] = 0x07; pins.i2cWriteBuffer(OLED_ADDR, cmd, false)                // end page 7
        let chunk = pins.createBuffer(17)
        chunk[0] = 0x40  // data mode prefix
        let total = OLED_WIDTH * OLED_PAGES  // 1024 bytes
        for (let i = 0; i < total; i += 16) {
            for (let j = 0; j < 16; j++) chunk[j + 1] = (i + j < total) ? oledFb[i + j] : 0
            pins.i2cWriteBuffer(OLED_ADDR, chunk, false)
        }
    }

    export enum OledCircleStyle {
        //% block="outline"
        Outline = 0,
        //% block="filled"
        Filled = 1
    }

    export enum OledRectStyle {
        //% block="outline"
        Outline = 0,
        //% block="filled"
        Filled = 1
    }

    /**
     * Set up the SSD1306 OLED display. Run once in "on start".
     * Connects via I2C on P19 (SCL) and P20 (SDA) at address 0x3C.
     * Also initialises the internal framebuffer used by filled-shape blocks.
     */
    //% subcategory="OLED Display"
    //% group="SSD1306 128×64"
    //% blockId=jelly_oled_init
    //% block="set up OLED display on I2C (P19/P20)"
    //% weight=310
    export function oledInit(): void {
        OLED.init(128, 64)
        oledFbInit()
        oledFb.fill(0)
    }

    /**
     * Erase everything on the OLED screen and reset the framebuffer.
     */
    //% subcategory="OLED Display"
    //% group="SSD1306 128×64"
    //% blockId=jelly_oled_clear
    //% block="OLED clear screen"
    //% weight=309
    export function oledClear(): void {
        OLED.clear()
        oledFbInit()
        oledFb.fill(0)
    }

    /**
     * Show a line of text on the OLED screen and advance to the next line.
     * Up to 8 lines of 16 characters fit on the 128×64 screen.
     * @param text the text to show, eg: "Hello!"
     */
    //% subcategory="OLED Display"
    //% group="SSD1306 128×64"
    //% blockId=jelly_oled_display_string
    //% block="OLED display %text"
    //% weight=308
    export function oledDisplay(text: string): void { OLED.writeStringNewLine(text) }

    /**
     * Show a number on the OLED screen on its own line.
     * @param num the number to show, eg: 42
     */
    //% subcategory="OLED Display"
    //% group="SSD1306 128×64"
    //% blockId=jelly_oled_display_number
    //% block="OLED display number %num"
    //% weight=307
    export function oledDisplayNumber(num: number): void { OLED.writeNumNewLine(num) }

    /**
     * Draw a progress bar that fills across the bottom of the screen.
     * Calling it repeatedly updates the bar in place — no need to clear first.
     * @param percent fill level from 0 to 100
     */
    //% subcategory="OLED Display"
    //% group="SSD1306 128×64"
    //% blockId=jelly_oled_bar
    //% block="OLED progress bar %percent \\%"
    //% percent.min=0 percent.max=100
    //% weight=306
    export function oledProgressBar(percent: number): void { OLED.drawLoading(percent) }

    /**
     * Draw a straight line between two points on the OLED screen.
     * Screen coordinates: x 0–127 (left→right), y 0–63 (top→bottom).
     * @param x0 start x, eg: 0
     * @param y0 start y, eg: 0
     * @param x1 end x, eg: 64
     * @param y1 end y, eg: 32
     */
    //% subcategory="OLED Display"
    //% group="SSD1306 128×64"
    //% blockId=jelly_oled_draw_line
    //% block="OLED line from x %x0 y %y0 to x %x1 y %y1"
    //% weight=305
    export function oledLine(x0: number, y0: number, x1: number, y1: number): void { OLED.drawLine(x0, y0, x1, y1) }

    /**
     * Draw a rectangle on the OLED screen using two corner points.
     * Filled rectangles use the framebuffer renderer for a clean solid fill.
     * @param style outline or filled
     * @param x0 top-left x (0–127), eg: 10
     * @param y0 top-left y (0–63), eg: 10
     * @param x1 bottom-right x (0–127), eg: 60
     * @param y1 bottom-right y (0–63), eg: 40
     */
    //% subcategory="OLED Display"
    //% group="SSD1306 128×64"
    //% blockId=jelly_oled_draw_rect
    //% block="OLED %style rectangle from x %x0 y %y0 to x %x1 y %y1"
    //% weight=304
    export function oledRect(style: OledRectStyle, x0: number, y0: number, x1: number, y1: number): void {
        if (style === OledRectStyle.Filled) {
            oledFbInit()
            let top = Math.max(0, Math.min(y0, y1))
            let bottom = Math.min(63, Math.max(y0, y1))
            let left = Math.max(0, Math.min(x0, x1))
            let right = Math.min(127, Math.max(x0, x1))
            let pageTop = top >> 3
            let pageBot = bottom >> 3
            for (let page = pageTop; page <= pageBot; page++) {
                let rowStart = page * 8
                // Build bitmask for which of the 8 rows in this page are inside the rect
                let bitStart = Math.max(top, rowStart) - rowStart
                let bitEnd = Math.min(bottom, rowStart + 7) - rowStart
                let mask = 0
                for (let b = bitStart; b <= bitEnd; b++) mask = mask | (1 << b)
                let base = page * OLED_WIDTH
                for (let col = left; col <= right; col++) oledFb[base + col] = oledFb[base + col] | mask
            }
            oledFbFlush()
        } else {
            OLED.drawRectangle(x0, y0, x1, y1)
        }
    }

    /**
     * Draw a circle on the OLED screen.
     * Filled circles use the framebuffer renderer (column-by-column midpoint algorithm)
     * for a clean solid fill without page-boundary gaps.
     * @param style outline or filled
     * @param x centre x (0–127), eg: 64
     * @param y centre y (0–63), eg: 32
     * @param r radius in pixels, eg: 15
     */
    //% subcategory="OLED Display"
    //% group="SSD1306 128×64"
    //% blockId=jelly_oled_draw_circle
    //% block="OLED %style circle at x %x y %y radius %r"
    //% x.defl=64 y.defl=32 r.defl=15
    //% weight=303
    export function oledCircle(style: OledCircleStyle, x: number, y: number, r: number): void {
        if (style === OledCircleStyle.Filled) {
            oledFbInit()
            // For each column, compute the vertical chord length and fill it page-by-page
            for (let dx = -r; dx <= r; dx++) {
                let h = Math.floor(Math.sqrt(r * r - dx * dx))
                let colX = x + dx
                let yTop = Math.max(0, y - h)
                let yBot = Math.min(63, y + h)
                if (colX < 0 || colX >= OLED_WIDTH) continue
                let pageTop = yTop >> 3
                let pageBot = yBot >> 3
                for (let page = pageTop; page <= pageBot; page++) {
                    let rowStart = page * 8
                    let bitStart = Math.max(yTop, rowStart) - rowStart
                    let bitEnd = Math.min(yBot, rowStart + 7) - rowStart
                    let mask = 0
                    for (let b = bitStart; b <= bitEnd; b++) mask = mask | (1 << b)
                    let idx = page * OLED_WIDTH + colX
                    oledFb[idx] = oledFb[idx] | mask
                }
            }
            oledFbFlush()
        } else {
            OLED.drawCircle(x, y, r)
        }
    }

}

// --- SILENT SIDEBAR OVERRIDE LAYER ---
// Forces dependency category tabs out of the sidebar so only JellySTEM shows.
//% deprecated=true
namespace neopixel { }

//% deprecated=true
namespace OLED { }

//% deprecated=true
namespace servos { }