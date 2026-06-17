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

    // Tracks current signed speed (-100 to 100) for each motor; used by accelerateMotor
    let motor1Speed = 0
    let motor2Speed = 0

    // Minimum non-zero speed sent to motors. Values below this cause PWM whining without movement.
    const MIN_MOTOR_SPEED = 40

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
            // SYNC STATE: Store as negative if moving counterclockwise
            motor1Speed = (direction == MotorsDirection.CC) ? speed : -speed;

            let value = (direction == MotorsDirection.CC) ? speed : speed + 101;
            writeReg2Bytes(0x09, value);
        }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
            // SYNC STATE: Store as negative if moving counterclockwise
            motor2Speed = (direction == MotorsDirection.CC) ? speed : -speed;

            let value = (direction == MotorsDirection.CC) ? speed : speed + 101;
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

        if (m1Speed > 0) {
            motor1Speed = m1Speed; // SYNC STATE
            writeReg2Bytes(0x09, motor1Speed);
        } else if (m1Speed < 0) {
            motor1Speed = m1Speed; // SYNC STATE (keeps the negative value)
            writeReg2Bytes(0x09, Math.abs(m1Speed) + 101);
        } else {
            motor1Speed = 0; // SYNC STATE
            writeReg2Bytes(0x09, 0); // Explicit stop — register value 0, not 101
        }

        if (m2Speed > 0) {
            motor2Speed = m2Speed; // SYNC STATE
            writeReg2Bytes(0x0a, motor2Speed);
        } else if (m2Speed < 0) {
            motor2Speed = m2Speed; // SYNC STATE (keeps the negative value)
            writeReg2Bytes(0x0a, Math.abs(m2Speed) + 101);
        } else {
            motor2Speed = 0; // SYNC STATE
            writeReg2Bytes(0x0a, 0); // Explicit stop — register value 0, not 101
        }
    }

    /** * Motors stop.
     * @param motor - The motors of mShield.
     */
    //% group="Motors"
    //% weight=378
    //% block="stop %motor"
    export function wheelStop(motor: Motors): void {
        if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
            motor1Speed = 0; // SYNC STATE
            writeReg2Bytes(0x09, 0);
        }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
            motor2Speed = 0; // SYNC STATE
            writeReg2Bytes(0x0a, 0);
        }
    }

    /** * Motors brake.
     * @param motor - The motors of mShield.
     */
    //% group="Motors"
    //% weight=377
    //% block="%motor %mode"
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
         * Smoothly accelerates or decelerates a motor to a target speed over a set duration.
         * @param motor choose motor 1 or motor 2
         * @param targetSpeed desired speed from -100 to 100, eg: 100
         * @param duration time to reach target speed in milliseconds, eg: 1000
         */
    //% group="Motors"
    //% blockId=jellystem_motor_accelerate
    //% block="ramp %motor to %targetSpeed\\% over %duration ms" 
    //% targetSpeed.min=-100 targetSpeed.max=100
    //% duration.shadow=timePicker
    //% weight=85
    export function accelerateMotor(motor: Motors, targetSpeed: number, duration: number): void {
        // Enforce boundary safety limits using MakeCode supported Math features
        targetSpeed = Math.max(-100, Math.min(100, targetSpeed));

        // Prevent whining: snap any non-zero target below the minimum to the minimum.
        // Speed 0 is always allowed for a clean stop.
        if (Math.abs(targetSpeed) > 0 && Math.abs(targetSpeed) < MIN_MOTOR_SPEED) {
            targetSpeed = targetSpeed > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED;
        }

        // Execute in background so student execution tracks smoothly without stalling basic operations
        control.inBackground(function () {
            let steps = 20; // Total granular adjustments
            let stepDelay = Math.max(10, duration / steps); // Stagger steps out safely (min 10ms)

            let startSpeedM1 = motor1Speed;
            let startSpeedM2 = motor2Speed;

            // If the current speed is below the minimum (including 0), snap the interpolation
            // start point up to MIN so no intermediate step drives into the whining dead zone.
            // Only applied when accelerating toward a non-zero target.
            let effectiveStartM1 = (targetSpeed !== 0 && Math.abs(startSpeedM1) < MIN_MOTOR_SPEED)
                ? (targetSpeed > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED)
                : startSpeedM1;
            let effectiveStartM2 = (targetSpeed !== 0 && Math.abs(startSpeedM2) < MIN_MOTOR_SPEED)
                ? (targetSpeed > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED)
                : startSpeedM2;

            for (let i = 1; i <= steps; i++) {
                let progress = i / steps;

                if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
                    motor1Speed = Math.round(effectiveStartM1 + (targetSpeed - effectiveStartM1) * progress);
                    // Safety net: snap any value that still lands in the dead zone.
                    // When decelerating to 0, snap to 0 cleanly; otherwise snap up to MIN.
                    let m1Write = motor1Speed;
                    if (Math.abs(m1Write) > 0 && Math.abs(m1Write) < MIN_MOTOR_SPEED) {
                        m1Write = (targetSpeed === 0) ? 0 : (m1Write > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED);
                    }
                    // Encode signed speed into mShield protocol layout (Positive vs Negative mapping)
                    let m1Value = (m1Write >= 0) ? m1Write : (Math.abs(m1Write) + 101);
                    writeReg2Bytes(0x09, m1Value);
                }
                if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
                    motor2Speed = Math.round(effectiveStartM2 + (targetSpeed - effectiveStartM2) * progress);
                    let m2Write = motor2Speed;
                    if (Math.abs(m2Write) > 0 && Math.abs(m2Write) < MIN_MOTOR_SPEED) {
                        m2Write = (targetSpeed === 0) ? 0 : (m2Write > 0 ? MIN_MOTOR_SPEED : -MIN_MOTOR_SPEED);
                    }
                    // Encode signed speed into mShield protocol layout (Positive vs Negative mapping)
                    let m2Value = (m2Write >= 0) ? m2Write : (Math.abs(m2Write) + 101);
                    writeReg2Bytes(0x0a, m2Value);
                }

                basic.pause(stepDelay);
            }
        });
    }

    /**
    * Set xxx% LEDs.
    * @param led - Choose which leds to use.
    * @param onOff - Turn LED on or off.
    */
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
    function irCode(): number {
        return 0;
    }

    /**
      * Run code when a button is pressed on the IR remote.
      */
    //% group="Infrared sensor"
    //% weight=360
    //% block="on IR remote signal"
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
    //% block="IR button %irButton pressed"
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
    //% block="set S1–S4 type to %type"
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
     * Servo control module, used for 90, 180, 270 degrees servo.
     * When the S1--S4 ports of mShield are connected to the servo, this function can control the servo.
     * @param servoType - Servo type.
     * @param index - Servo interface on mShield.
     * @param angle - The Angle of rotation of the servo.
     */
    //% group="PWM port"
    //% weight=348
    //% block="set %index %servoType servo to %angle°"
    //% angle.defl=0
    export function extendServoControl(index: PwmAndServoIndex, servoType: ServoType, angle: number): void {
        let angleMap: number = 0;
        if (servoType == ServoType.Servo90) {
            angle = Math.max(0, Math.min(90, angle));
            angleMap = pins.map(angle, 0, 90, 50, 250);
        } else if (servoType == ServoType.Servo180) {
            angle = Math.max(0, Math.min(180, angle));
            angleMap = pins.map(angle, 0, 180, 50, 250);
        } else if (servoType == ServoType.Servo270) {
            angle = Math.max(0, Math.min(270, angle));
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

    // --- SERVO (via dependency: microsoft/pxt-common-packages/libs/servo) ---

    /**
     * Pins that support servo output.
     */
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
     * Turn a servo to an angle you choose.
     * 0° is all the way left, 90° is the middle, 180° is all the way right.
     * @param pin the pin the servo is plugged into
     * @param degrees the angle to turn to, eg: 90
     */
    //% group="Servo"
    //% blockId=jelly_servo_set_angle
    //% block="set servo %pin to %degrees °"
    //% degrees.min=0 degrees.max=180 degrees.defl=90
    //% weight=335
    export function servoSetAngle(pin: ServoPin, degrees: number): void {
        getServo(pin).setAngle(degrees);
    }

    /**
     * Run a continuous (360°) servo at a speed you choose.
     * Positive = forward, negative = backward, 0 = stop.
     * @param pin the pin the servo is plugged into
     * @param speed the speed from -100% to 100%, eg: 50
     */
    //% group="Servo"
    //% blockId=jelly_servo_run
    //% block="continuous servo %pin run at %speed \\%"
    //% speed.min=-100 speed.max=100 speed.defl=50
    //% weight=334
    export function servoRun(pin: ServoPin, speed: number): void {
        getServo(pin).run(speed);
    }

    /**
     * Stop a servo. It will stay where it is and won't hold its position.
     * @param pin the pin the servo is plugged into
     */
    //% group="Servo"
    //% blockId=jelly_servo_stop
    //% block="stop servo %pin"
    //% weight=333
    export function servoStop(pin: ServoPin): void {
        getServo(pin).stop();
    }

    /**
     * Set the servo pulse width directly in microseconds.
     * Useful for fine-tuning or non-standard servos.
     * 1000 μs = far left, 1500 μs = center, 2000 μs = far right.
     * @param pin the pin the servo is plugged into
     * @param micros the pulse width in microseconds, eg: 1500
     */
    //% group="Servo"
    //% blockId=jelly_servo_set_pulse
    //% block="set servo %pin pulse to %micros μs"
    //% micros.min=500 micros.max=2500 micros.defl=1500
    //% weight=332
    export function servoSetPulse(pin: ServoPin, micros: number): void {
        getServo(pin).setPulse(micros);
    }

    /**
     * Set the min and max angle limits for a servo.
     * Useful if your servo doesn't go all the way to 0° or 180°.
     * @param pin the pin the servo is plugged into
     * @param minAngle the minimum angle, eg: 0
     * @param maxAngle the maximum angle, eg: 180
     */
    //% group="Servo"
    //% blockId=jelly_servo_set_range
    //% block="set servo %pin range %minAngle to %maxAngle °"
    //% minAngle.min=0 minAngle.max=90 minAngle.defl=0
    //% maxAngle.min=90 maxAngle.max=180 maxAngle.defl=180
    //% weight=331
    export function servoSetRange(pin: ServoPin, minAngle: number, maxAngle: number): void {
        getServo(pin).setRange(minAngle, maxAngle);
    }

    /**
     * Set whether a continuous servo stops when it reaches the middle position (90°).
     * Turn this on if you want the servo to stop on its own when it hits the center.
     * @param pin the pin the servo is plugged into
     * @param enabled true to stop at neutral, false to keep going
     */
    //% group="Servo"
    //% blockId=jelly_servo_stop_on_neutral
    //% block="set servo %pin stop at middle %enabled"
    //% enabled.shadow=toggleOnOff
    //% weight=330
    export function servoSetStopOnNeutral(pin: ServoPin, enabled: boolean): void {
        getServo(pin).setStopOnNeutral(enabled);
    }

    /**
     * Sets the battery type and returns the battery level.
     * @param batType - Type of battery. 
     * Return 0--100
     */
    //% group="Battery"
    //% weight=340
    //% block="battery level with %batType"
    export function batteryLevel(batType: BatteryType): number {
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

    // =========================================================================
    // --- IR DISTANCE SENSOR: SHARP GP2Y0A41SK0F ---
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
     * Set up the Sharp IR distance sensor on a pin.
     * Run this once in "on start". Warms up the sensor so the first reading is stable.
     * @param pin the pin the sensor is plugged into, eg: AnalogPin.P0
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_setup
    //% block="set up IR sensor at %pin"
    //% weight=396
    export function setUpIrSensor(pin: AnalogPin): void {
        for (let i = 0; i < 5; i++) {
            pins.analogReadPin(pin);
            basic.pause(10);
        }
    }

    /**
     * Reads how far away the nearest object is using the Sharp IR sensor.
     * Returns 0 if nothing is in range.
     * @param pin the pin the sensor is plugged into, eg: AnalogPin.P0
     * @param unit cm, mm, inch, or raw
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_distance_read
    //% block="IR distance at %pin in %unit"
    //% weight=395
    export function readIrDistance(pin: AnalogPin, unit: IrDistanceUnit): number {
        return internalReadSharpIR(pin, unit);
    }

    /**
     * Is an object closer or farther than a distance you choose?
     * Returns true or false. Includes blind-spot safety.
     * @param pin the pin the sensor is plugged into, eg: AnalogPin.P0
     * @param comparison closer or farther
     * @param threshold the distance to compare against, eg: 15
     * @param unit cm, mm, or inch
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_distance_check
    //% block="IR distance %comparison than %threshold %unit at %pin"
    //% weight=394
    export function checkIrDistance(pin: AnalogPin, comparison: IrDistanceComparison, threshold: number, unit: IrDistanceUnit): boolean {
        let raw = pins.analogReadPin(pin);
        let d = internalReadSharpIR(pin, unit);
        if (comparison === IrDistanceComparison.Closer) {
            return (d > 0 && d < threshold) || (d === 0 && raw > 300);
        } else {
            return (d > threshold) || (d === 0 && raw <= 300);
        }
    }

    /**
     * Run code every time an object crosses a distance threshold on the IR sensor.
     * @param pin the pin the sensor is plugged into, eg: AnalogPin.P0
     * @param comparison closer or farther
     * @param threshold the distance to watch for, eg: 15
     * @param unit cm, mm, or inch
     * @param handler code to run when the threshold is crossed
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_on_cross
    //% block="on IR %comparison than %threshold %unit at %pin"
    //% weight=393
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
                        if (durationStable >= DEBOUNCE_REQUIRED) {
                            stableState = currentState;
                            handler();
                        }
                    } else {
                        candidateState = currentState;
                        durationStable = CHECK_INTERVAL;
                    }
                } else {
                    candidateState = stableState;
                    durationStable = 0;
                }
            }
        });
    }

    /**
     * Run code once the first time an object comes within a distance you set.
     * Re-arms itself automatically once the object moves away.
     * @param pin the pin the sensor is plugged into, eg: AnalogPin.P0
     * @param threshold the detection distance, eg: 15
     * @param unit cm, mm, or inch
     * @param handler code to run when something is detected
     */
    //% subcategory="Distance Sensors"
    //% group="IR Distance"
    //% blockId=jelly_ir_on_detected
    //% block="on IR object detected within %threshold %unit at %pin"
    //% weight=392
    export function onIrObjectDetected(pin: AnalogPin, threshold: number, unit: IrDistanceUnit, handler: () => void): void {
        control.inBackground(() => {
            let isInside = checkIrDistance(pin, IrDistanceComparison.Closer, threshold, unit);
            while (true) {
                basic.pause(50);
                let currentlyInside = checkIrDistance(pin, IrDistanceComparison.Closer, threshold, unit);
                if (currentlyInside && !isInside) {
                    isInside = true;
                    handler();
                } else if (!currentlyInside && isInside) {
                    isInside = false;
                }
            }
        });
    }

    // =========================================================================
    // --- ULTRASONIC DISTANCE SENSOR (HC-SR04 / RCWL-1601) ---
    // Adapted from MakerBit ultrasonic extension by 1010Technologies
    // github.com/1010Technologies/pxt-makerbit-ultrasonic — MIT License
    // =========================================================================

    export enum UltrasonicModel {
        //% block="HC-SR04"
        HC_SR04 = 58,
        //% block="RCWL-1601"
        RCWL_1601 = 50
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
    const ULTRASONIC_MAX_TRAVEL_TIME = 17400
    const ULTRASONIC_MEASUREMENTS = 3
    const ULTRASONIC_PULSE_INTERVAL_MS = 145

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
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);
    }

    function ultrasonicTriggerObservers(): void {
        for (let i = 0; i < ultrasonicState.travelTimeObservers.length; i++) {
            const threshold = ultrasonicState.travelTimeObservers[i]
            if (threshold > 0 && ultrasonicState.medianRoundTrip <= threshold) {
                control.raiseEvent(JELLY_ULTRASONIC_EVENT_ID, threshold)
                ultrasonicState.travelTimeObservers[i] = -threshold
            } else if (threshold < 0 && ultrasonicState.medianRoundTrip > -threshold) {
                ultrasonicState.travelTimeObservers[i] = -threshold
            }
        }
    }

    function ultrasonicMeasureInBackground(): void {
        const trips = ultrasonicState.roundTrips
        while (true) {
            const now = input.runningTime()
            if (trips[trips.length - 1].ts < now - ULTRASONIC_PULSE_INTERVAL_MS - 10) {
                trips.push({ ts: now, rtt: ULTRASONIC_MAX_TRAVEL_TIME })
            }
            while (trips.length > ULTRASONIC_MEASUREMENTS) { trips.shift() }
            ultrasonicState.medianRoundTrip = ultrasonicMedian(trips.map(urt => urt.rtt))
            ultrasonicTriggerObservers()
            ultrasonicTriggerPulse()
            basic.pause(ULTRASONIC_PULSE_INTERVAL_MS)
        }
    }

    function ultrasonicRttToUnit(rtt: number, model: UltrasonicModel, unit: UltrasonicUnit): number {
        if (unit === UltrasonicUnit.Raw) return rtt;
        let cm = Math.floor(rtt / (model as number));
        if (unit === UltrasonicUnit.Mm) return cm * 10;
        if (unit === UltrasonicUnit.Inch) return Math.floor(cm / 2.54);
        return cm;
    }

    /**
     * Set up the ultrasonic distance sensor. Run this once in "on start".
     * Pick your sensor model — HC-SR04 or RCWL-1601.
     * @param model which ultrasonic sensor you are using
     * @param trig pin connected to Trig, eg: DigitalPin.P13
     * @param echo pin connected to Echo, eg: DigitalPin.P14
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_setup
    //% block="set up %model ultrasonic sensor: Trig %trig Echo %echo"
    //% trig.fieldEditor="gridpicker" trig.fieldOptions.columns=4
    //% echo.fieldEditor="gridpicker" echo.fieldOptions.columns=4
    //% weight=392
    export function connectUltrasonic(model: UltrasonicModel, trig: DigitalPin, echo: DigitalPin): void {
        if (ultrasonicState && ultrasonicState.trig) return;
        if (!ultrasonicState) {
            ultrasonicState = {
                trig: trig,
                model: model,
                roundTrips: [{ ts: 0, rtt: ULTRASONIC_MAX_TRAVEL_TIME }],
                medianRoundTrip: ULTRASONIC_MAX_TRAVEL_TIME,
                travelTimeObservers: []
            }
        } else {
            ultrasonicState.trig = trig;
            ultrasonicState.model = model;
        }
        pins.onPulsed(echo, PulseValue.High, () => {
            if (pins.pulseDuration() < ULTRASONIC_MAX_TRAVEL_TIME &&
                ultrasonicState.roundTrips.length <= ULTRASONIC_MEASUREMENTS) {
                ultrasonicState.roundTrips.push({ ts: input.runningTime(), rtt: pins.pulseDuration() })
            }
        })
        control.inBackground(ultrasonicMeasureInBackground)
    }

    /**
     * Reads how far away the nearest object is using the ultrasonic sensor.
     * Returns -1 if the sensor has not been set up yet.
     * @param unit cm, mm, inch, or raw
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_distance_read
    //% block="ultrasonic distance in %unit"
    //% weight=391
    export function readUltrasonicDistance(unit: UltrasonicUnit): number {
        if (!ultrasonicState) return -1;
        basic.pause(0);
        return ultrasonicRttToUnit(ultrasonicState.medianRoundTrip, ultrasonicState.model, unit);
    }

    /**
     * Is an object closer or farther than a distance you choose?
     * Returns true or false.
     * @param comparison closer or farther
     * @param threshold the distance to compare against, eg: 20
     * @param unit cm, mm, or inch
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_check
    //% block="ultrasonic %comparison than %threshold %unit"
    //% weight=390
    export function checkUltrasonicDistance(comparison: UltrasonicComparison, threshold: number, unit: UltrasonicUnit): boolean {
        let d = readUltrasonicDistance(unit);
        if (d === -1) return false;
        return comparison === UltrasonicComparison.Closer ? d < threshold : d > threshold;
    }

    /**
     * Run code every time an object crosses a distance threshold on the ultrasonic sensor.
     * @param comparison closer or farther
     * @param threshold the distance to watch for, eg: 20
     * @param unit cm, mm, or inch
     * @param handler code to run when the threshold is crossed
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_on_cross
    //% block="on ultrasonic %comparison than %threshold %unit"
    //% weight=389
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
                        if (durationStable >= DEBOUNCE_REQUIRED) {
                            stableState = currentState;
                            handler();
                        }
                    } else {
                        candidateState = currentState;
                        durationStable = CHECK_INTERVAL;
                    }
                } else {
                    candidateState = stableState;
                    durationStable = 0;
                }
            }
        });
    }

    /**
     * Run code once the first time an object comes within a distance you set.
     * Re-arms itself automatically once the object moves away.
     * @param distance the detection distance, eg: 20
     * @param unit cm, mm, or inch
     * @param handler code to run when something is detected
     */
    //% subcategory="Distance Sensors"
    //% group="Ultrasonic"
    //% blockId=jelly_ultrasonic_on_detected
    //% block="on ultrasonic object detected within %distance %unit"
    //% weight=388
    export function onUltrasonicObjectDetected(distance: number, unit: UltrasonicUnit, handler: () => void): void {
        if (distance <= 0) return;
        if (!ultrasonicState) {
            ultrasonicState = {
                trig: undefined,
                model: UltrasonicModel.HC_SR04,
                roundTrips: [{ ts: 0, rtt: ULTRASONIC_MAX_TRAVEL_TIME }],
                medianRoundTrip: ULTRASONIC_MAX_TRAVEL_TIME,
                travelTimeObservers: []
            }
        }
        let modelDivisor = ultrasonicState.model as number;
        let divisor = (unit === UltrasonicUnit.Inch) ? Math.floor(modelDivisor * 2.54) : (unit === UltrasonicUnit.Mm) ? Math.floor(modelDivisor / 10) : modelDivisor;
        const travelTimeThreshold = Math.imul(distance, divisor);
        ultrasonicState.travelTimeObservers.push(travelTimeThreshold);
        control.onEvent(JELLY_ULTRASONIC_EVENT_ID, travelTimeThreshold, () => { handler(); });
    }

    // =========================================================================
    // --- NEOPIXEL FULL PARITY WORKSPACE INTEGRATION ---
    // =========================================================================

    /**
     * Create a new NeoPixel driver for `numleds` LEDs.
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the strip, eg: 24,30,60,64
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_create
    //% block="NeoPixel at pin %pin|with %numleds|leds as %mode"
    //% weight=90 blockGap=8
    //% blockSetVariable=strip
    export function create(pin: DigitalPin, numleds: number, mode: NeoPixelMode): neopixel.Strip {
        return neopixel.create(pin, numleds, mode);
    }

    /**
     * Shows all LEDs to a given color (range 0-255 for r, g, b).
     * @param rgb RGB color of the LED
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_show_color
    //% block="%strip|show color %rgb=neopixel_colors"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=85 blockGap=8
    export function showColor(strip: neopixel.Strip, rgb: number): void {
        strip.showColor(rgb);
    }

    /**
     * Shows a rainbow pattern on all LEDs.
     * @param startHue the start hue value for the rainbow, eg: 1
     * @param endHue the end hue value for the rainbow, eg: 360
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_show_rainbow
    //% block="%strip|show rainbow from %startHue|to %endHue"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% startHue.defl=1 endHue.defl=360
    //% weight=85 blockGap=8
    export function showRainbow(strip: neopixel.Strip, startHue: number = 1, endHue: number = 360): void {
        strip.showRainbow(startHue, endHue);
    }

    /**
     * Displays a vertical bar graph based on the `value` and `high` value.
     * If `high` is 0, the chart gets adjusted automatically.
     * @param value current value to plot
     * @param high maximum value, eg: 255
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_show_bar_graph
    //% block="%strip|show bar graph of %value|up to %high"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=84 blockGap=8
    export function showBarGraph(strip: neopixel.Strip, value: number, high: number): void {
        strip.showBarGraph(value, high);
    }

    // --- ADVANCED ("MORE...") NEOPIXEL SUB-GROUP BLOCKS ---

    /**
     * Set LED to a given color (range 0-255 for r, g, b).
     * You need to call ``show`` to make the changes visible.
     * @param pixeloffset position of the NeoPixel in the strip
     * @param rgb RGB color of the LED
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_set_pixel_color
    //% block="%strip|set pixel color at %pixeloffset|to %rgb=neopixel_colors"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=80 blockGap=8
    export function setPixelColor(strip: neopixel.Strip, pixeloffset: number, rgb: number): void {
        strip.setPixelColor(pixeloffset, rgb);
    }

    /**
     * Send all the changes to the strip.
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_show
    //% block="%strip|show" 
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=79 blockGap=8
    export function show(strip: neopixel.Strip): void {
        strip.show();
    }

    /**
     * Turn off all LEDs.
     * You need to call ``show`` to make the changes visible.
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_clear
    //% block="%strip|clear"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=76 blockGap=8
    export function clear(strip: neopixel.Strip): void {
        strip.clear();
    }

    /**
     * Set the brightness of the strip. This flag only applies to future operation.
     * @param brightness a measure of LED brightness in 0-255. eg: 255
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_set_brightness
    //% block="%strip|set brightness %brightness"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=59 blockGap=8
    export function setBrightness(strip: neopixel.Strip, brightness: number): void {
        strip.setBrightness(brightness);
    }

    /**
     * Rotate LEDs forward.
     * You need to call ``show`` to make the changes visible.
     * @param offset number of pixels to rotate, eg: 1
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_rotate
    //% block="%strip|rotate pixels by %offset"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% offset.defl=1
    //% weight=39 blockGap=8
    export function rotate(strip: neopixel.Strip, offset: number = 1): void {
        strip.rotate(offset);
    }

    /**
     * Shift LEDs forward and clear with a zero.
     * You need to call ``show`` to make the changes visible.
     * @param offset number of pixels to shift, eg: 1
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_shift
    //% block="%strip|shift pixels by %offset"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% offset.defl=1
    //% weight=40 blockGap=8
    export function shift(strip: neopixel.Strip, offset: number = 1): void {
        strip.shift(offset);
    }

    /**
     * Create a new sub-range segment out of an existing NeoPixel strip.
     * @param start offset position where the new range starts
     * @param length total number of LEDs in the range
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_range
    //% block="%strip|range from %start|with %length|leds"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=89 blockGap=8
    //% blockSetVariable=range
    export function range(strip: neopixel.Strip, start: number, length: number): neopixel.Strip {
        return strip.range(start, length);
    }

    /**
     * Set individual pixel white LED brightness for RGB+W NeoPixels.
     * @param pixeloffset position of the LED in the strip
     * @param white brightness of the white LED, eg: 255
     */
    //% group="NeoPixel"
    //% subcategory="More"
    //% blockId=jelly_neopixel_set_pixel_white
    //% block="%strip|set pixel white LED at %pixeloffset|to %white"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=80 blockGap=8
    export function setPixelWhiteLED(strip: neopixel.Strip, pixeloffset: number, white: number): void {
        strip.setPixelWhiteLED(pixeloffset, white);
    }

    /**
     * Gets the number of pixels declared on the strip.
     */
    //% group="NeoPixel"
    //% subcategory="More"
    //% blockId=jelly_neopixel_length
    //% block="%strip|length"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=60 blockGap=8
    export function length(strip: neopixel.Strip): number {
        return strip.length();
    }

    /**
     * Apply brightness to current colors using a quadratic easing.
     */
    //% group="NeoPixel"
    //% subcategory="More"
    //% blockId=jelly_neopixel_ease_brightness
    //% block="%strip|ease brightness"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=58 blockGap=8
    export function easeBrightness(strip: neopixel.Strip): void {
        strip.easeBrightness();
    }

    /**
     * Sets the number of pixels in a matrix shaped strip
     * @param width number of pixels in a row
     */
    //% group="NeoPixel"
    //% subcategory="More"
    //% blockId=jelly_neopixel_set_matrix_width
    //% block="%strip|set matrix width %width"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=5 blockGap=8
    export function setMatrixWidth(strip: neopixel.Strip, width: number): void {
        strip.setMatrixWidth(width);
    }

    /**
     * Set LED to a given color (range 0-255 for r, g, b) in a matrix shaped strip
     * You need to call ``show`` to make the changes visible.
     * @param x horizontal position
     * @param y vertical position
     * @param rgb RGB color of the LED
     */
    //% group="NeoPixel"
    //% subcategory="More"
    //% blockId=jelly_neopixel_set_matrix_color
    //% block="%strip|set matrix color at x %x|y %y|to %rgb=neopixel_colors"
    //% strip.defl=strip
    //% strip.shadow=variables_get
    //% weight=4 blockGap=8
    export function setMatrixColor(strip: neopixel.Strip, x: number, y: number, rgb: number): void {
        strip.setMatrixColor(x, y, rgb);
    }

    // --- STATIC COLOR HELPER UTILITIES ---

    /**
     * Gets the RGB value of a known color
     */
    //% group="NeoPixel"
    //% subcategory="More"
    //% blockId=jelly_neopixel_colors
    //% block="%color"
    //% weight=2 blockGap=8
    export function colors(color: NeoPixelColors): number {
        return neopixel.colors(color);
    }

    /**
     * Converts red, green, blue channels into an RGB color code value.
     */
    //% group="NeoPixel"
    //% subcategory="More"
    //% blockId=jelly_neopixel_rgb
    //% block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% weight=1 blockGap=8
    export function rgb(red: number, green: number, blue: number): number {
        return neopixel.rgb(red, green, blue);
    }

    /**
     * Converts hue, saturation, luminosity values into an RGB color code value.
     */
    //% group="NeoPixel"
    //% blockId=jelly_neopixel_hsl
    //% block="hue %h|saturation %s|luminosity %l"
    //% h.min=0 h.max=360 s.min=0 s.max=99 l.min=0 l.max=99
    //% weight=63 blockGap=8
    export function hsl(h: number, s: number, l: number): number {
        return neopixel.hsl(h, s, l);
    }

    // --- OLED 128×64 DISPLAY (via tinkertanker/pxt-oled-ssd1306 v2.0.18) ---
    // Hardware: plug the OLED into the I2C port (P19 = SCL, P20 = SDA)

    /**
     * Circle style — outline only, or filled solid.
     */
    export enum OledCircleStyle {
        //% block="outline"
        Outline = 0,
        //% block="filled"
        Filled = 1
    }

    /**
     * Set up the OLED display. Run this once in "on start".
     * Plug the display into the I2C port: SDA to P20, SCL to P19.
     */
    //% group="Display"
    //% blockId=jelly_oled_init
    //% block="set up OLED display on I2C (P19/P20)"
    //% weight=310
    export function oledInit(): void {
        OLED.init(128, 64)
    }

    /**
     * Erase everything on the OLED screen.
     */
    //% group="Display"
    //% blockId=jelly_oled_clear
    //% block="OLED clear screen"
    //% weight=309
    export function oledClear(): void {
        OLED.clear()
    }

    /**
     * Display a line of text on the OLED screen.
     * Each call goes on its own line — up to 8 lines fit on screen.
     * @param text the text to display, eg: "Hello!"
     */
    //% group="Display"
    //% blockId=jelly_oled_display_string
    //% block="OLED display %text"
    //% weight=308
    export function oledDisplay(text: string): void {
        OLED.writeStringNewLine(text)
    }

    /**
     * Display a number on the OLED screen on its own line.
     * @param num the number to display, eg: 42
     */
    //% group="Display"
    //% blockId=jelly_oled_display_number
    //% block="OLED display number %num"
    //% weight=307
    export function oledDisplayNumber(num: number): void {
        OLED.writeNumNewLine(num)
    }

    /**
     * Draw a progress bar that fills up to a percentage you choose.
     * Call oledInit first. Calling this multiple times updates the bar.
     * @param percent how full the bar is, from 0 to 100
     */
    //% group="Display"
    //% blockId=jelly_oled_bar
    //% block="OLED progress bar %percent \\%"
    //% percent.min=0 percent.max=100
    //% weight=306
    export function oledProgressBar(percent: number): void {
        OLED.drawLoading(percent)
    }

    /**
     * Draw a straight line between two points on the OLED screen.
     * Screen is 128 pixels wide (x) and 64 pixels tall (y).
     * @param x0 start x (0-127), eg: 0
     * @param y0 start y (0-63), eg: 0
     * @param x1 end x (0-127), eg: 50
     * @param y1 end y (0-63), eg: 30
     */
    //% group="Display"
    //% blockId=jelly_oled_draw_line
    //% block="OLED line from x %x0 y %y0 to x %x1 y %y1"
    //% weight=305
    export function oledLine(x0: number, y0: number, x1: number, y1: number): void {
        OLED.drawLine(x0, y0, x1, y1)
    }

    /**
     * Draw a rectangle on the OLED screen using two corner points.
     * @param x0 top-left x (0-127), eg: 10
     * @param y0 top-left y (0-63), eg: 10
     * @param x1 bottom-right x (0-127), eg: 60
     * @param y1 bottom-right y (0-63), eg: 40
     */
    //% group="Display"
    //% blockId=jelly_oled_draw_rect
    //% block="OLED rectangle from x %x0 y %y0 to x %x1 y %y1"
    //% weight=304
    export function oledRect(x0: number, y0: number, x1: number, y1: number): void {
        OLED.drawRectangle(x0, y0, x1, y1)
    }

    /**
     * Draw a circle on the OLED screen. Pick outline or filled.
     * @param x centre x position (0-127), eg: 64
     * @param y centre y position (0-63), eg: 32
     * @param r radius in pixels, eg: 15
     * @param style outline or filled
     */
    //% group="Display"
    //% blockId=jelly_oled_draw_circle
    //% block="OLED %style circle at x %x y %y radius %r"
    //% weight=303
    export function oledCircle(x: number, y: number, r: number, style: OledCircleStyle): void {
        if (style === OledCircleStyle.Filled) {
            OLED.drawFilledCircle(x, y, r)
        } else {
            OLED.drawCircle(x, y, r)
        }
    }

}

// --- SILENT SIDEBAR OVERRIDE LAYER ---
// Forces the background tracking dependency category tab out of sight.
//% deprecated=true
namespace neopixel { }

//% deprecated=true
namespace servos { }

//% deprecated=true
namespace OLED { }