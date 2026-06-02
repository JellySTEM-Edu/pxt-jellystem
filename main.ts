/*
* This extension library includes core blocks adapted from the SIYEENOVE team.
* Original Copyright (c) 2024 SIYEENOVA under the MIT License.
* Rebranded and adapted for JellySTEM Education.
*/

//% weight=100 color=#3CB371 icon="\uf1b2" block="JellySTEM"
namespace jellystem {
    /**
     * Test block for the first MakeCode extension check.
     */
    //% block="JellySTEM test block"
    export function testBlock(): void {
        basic.showIcon(IconNames.Yes)
    }

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
    let irstate: number;
    let state: number;

    //The I2C speed is 100Khz, and the slave address is 0x29
    let i2cAddr: number = 0x29;

    /**
    * Set the speed and direction of the motors
    * @param motor - The motors of mShield.
    * @param direction - The motor goes clockwise or counterclockwise.
    * @param speed - The speed at which the motor. eg: 0--100
    */
    //% group="Motors"
    //% block="set %motor %direction speed %speed%%"
    //% speed.min=0 speed.max=100
    //% speed.defl=0
    //% weight=380
    export function setMotorsDirectionSpeed(motor: Motors, direction: MotorsDirection, speed: number): void {
        let i2cBuffer = pins.createBuffer(2)
        
        if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
            motor1Speed = speed;
            i2cBuffer[0] = 0x09;
            if (direction == MotorsDirection.CC)         //clockwise
                i2cBuffer[1] = motor1Speed;
            else if (direction == MotorsDirection.CCW)   //counterclockwise
                i2cBuffer[1] = motor1Speed + 101;
            pins.i2cWriteBuffer(i2cAddr, i2cBuffer);
        }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
            motor2Speed = speed;
            i2cBuffer[0] = 0x0a;
            if (direction == MotorsDirection.CC)          //clockwise
                i2cBuffer[1] = motor2Speed;
            else if (direction == MotorsDirection.CCW)    //counterclockwise
                i2cBuffer[1] = motor2Speed + 101;
            pins.i2cWriteBuffer(i2cAddr, i2cBuffer)
        }
    }


    /**
     * Set the speed and direction of the motor.
     * @param m1Speed - Set the speed and direction of the left motor.
     * @param m2Speed - Set the speed and direction of the right motor.
     */
    //% group="Motors"
    //% block="set motor1 speed %m1Speed%% motor2 speed %m2Speed%%"
    //% m1Speed.min=-100 m1Speed.max=100
    //% m2Speed.min=-100 m2Speed.max=100
    //% weight=379
    export function setMotorsSpeed(m1Speed: number, m2Speed: number): void {
        let i2cBuffer = pins.createBuffer(2)
        
        i2cBuffer[0] = 0x09;
        if (m1Speed > 0){
            motor1Speed = m1Speed;
            i2cBuffer[1] = motor1Speed;
        }else{
            motor1Speed = Math.abs(m1Speed);
            i2cBuffer[1] = motor1Speed + 101;
        }
        pins.i2cWriteBuffer(i2cAddr, i2cBuffer);

        i2cBuffer[0] = 0x0a;
        if (m2Speed > 0){
            motor2Speed = m2Speed;
            i2cBuffer[1] = motor2Speed;
        }else{
            motor2Speed = Math.abs(m2Speed);
            i2cBuffer[1] = motor2Speed + 101;
        }
        pins.i2cWriteBuffer(i2cAddr, i2cBuffer);
    }

    /** * Motors stop.
     * @param motor - The motors of mShield.
     */
    //% group="Motors"
    //% weight=378
    //%block="set %motor to stop"
    export function wheelStop(motor: Motors): void {
        let i2cBuffer = pins.createBuffer(2)

        if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
            motor1Speed = 0;
            i2cBuffer[0] = 0x09;
            i2cBuffer[1] = motor1Speed;
            pins.i2cWriteBuffer(i2cAddr, i2cBuffer);
        }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
            motor2Speed = 0;
            i2cBuffer[0] = 0x0a;
            i2cBuffer[1] = motor2Speed;
            pins.i2cWriteBuffer(i2cAddr, i2cBuffer);
        }
    }

    /** * Motors brake.
     * @param motor - The motors of mShield.
     */
    //% group="Motors"
    //% weight=377
    //%block="set %motor to %mode"
    export function wheelBrake(motor: Motors, mode: MotorMode): void {
        let i2cBuffer = pins.createBuffer(2)

        if (motor == Motors.Motor1 || motor == Motors.AllMotors) {
            motor1Speed = 0;
            i2cBuffer[0] = 0x19;
            i2cBuffer[1] = mode;
            pins.i2cWriteBuffer(i2cAddr, i2cBuffer);
        }
        if (motor == Motors.Motor2 || motor == Motors.AllMotors) {
            motor2Speed = 0;
            i2cBuffer[0] = 0x1a;
            i2cBuffer[1] = mode;
            pins.i2cWriteBuffer(i2cAddr, i2cBuffer);
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
    //%block="motors speed offset: motor1 %offset1 motor2 %offset2"
    //% offset1.min=-10 offset1.max=0
    //% offset2.min=-10 offset2.max=0
    //% offset1.defl=0 offset2.defl=0
    export function motorsAdjustment(offset1: number, offset2: number): void {
        let buffer = pins.createBuffer(2)
        offset1 = Math.map(offset1, -10, 0, 10, 0);
        offset2 = Math.map(offset2, -10, 0, 10, 0);

        buffer[0] = 0x07;
        buffer[1] = offset1;
        pins.i2cWriteBuffer(i2cAddr, buffer);
        basic.pause(10);
        
        buffer[0] = 0x08;
        buffer[1] = offset2;
        pins.i2cWriteBuffer(i2cAddr, buffer);
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
        let buf = pins.createBuffer(2)
        if (onOff){
            buf[1] = 1;
        }else{
            buf[1] = 0;
        }
        
        if (led == Leds.LED20 || led == Leds.AllLED){
            buf[0] = 0x0b;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
        if (led == Leds.LED40 || led == Leds.AllLED) {
            buf[0] = 0x0c;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
        if (led == Leds.LED60 || led == Leds.AllLED) {
            buf[0] = 0x0d;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
        if (led == Leds.LED80 || led == Leds.AllLED) {
            buf[0] = 0x0e;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
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
        let buf = pins.createBuffer(2)
        buf[0] = 0x0f;
        buf[1] = type;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    /**
     * mShield S1--S4 ports output PWM signals.
     * @param index - S1--S4 ports.
     * @param pulseWidth - Pulse width.
     */
    //% group="PWM port"
    //% weight=349
    //% block="set %index PWM pluse width is %pulseWidth"
    //% pulseWidth.min=0 pulseWidth.max=200
    //% pulseWidth.defl=0
    export function extendPwmControl(index: PwmAndServoIndex, pulseWidth: number): void {
        let buf = pins.createBuffer(2)

        buf[1] = pulseWidth;
        if (index == PwmAndServoIndex.S1 || index == PwmAndServoIndex.All){
            buf[0] = 0x10;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
        if (index == PwmAndServoIndex.S2 || index == PwmAndServoIndex.All){
            buf[0] = 0x11;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
        if (index == PwmAndServoIndex.S3 || index == PwmAndServoIndex.All){
            buf[0] = 0x12;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
        if (index == PwmAndServoIndex.S4 || index == PwmAndServoIndex.All){
            buf[0] = 0x13;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
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
        let angleMap: number
        if (servoType == ServoType.Servo90) {
            angleMap = Math.map(angle, 0, 90, 50, 250);
        }else if (servoType == ServoType.Servo180) {
            angleMap = Math.map(angle, 0, 180, 50, 250);
        }else if (servoType == ServoType.Servo270) {
            angleMap = Math.map(angle, 0, 270, 50, 250);
        }

        let buf = pins.createBuffer(2)
        buf[1] = angleMap;
        if (index == PwmAndServoIndex.S1 || index == PwmAndServoIndex.All){
            buf[0] = 0x14;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
        if (index == PwmAndServoIndex.S2 || index == PwmAndServoIndex.All){
            buf[0] = 0x15;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
        if (index == PwmAndServoIndex.S3 || index == PwmAndServoIndex.All){
            buf[0] = 0x16;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
        if (index == PwmAndServoIndex.S4 || index == PwmAndServoIndex.All){
            buf[0] = 0x17;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
    }


    /**
     * The steering gear rotates continuously, and is used for the steering gear of 360 degrees rotation.
     * @param index - Servo interface on mShield. 
     * @param speed - The speed at which the servo rotates.
     */
    //% group="PWM port"
    //% weight=347
    //% block="set %index 360° servo speed to %speed%%"
    //% speed.min=-100 speed.max=100
    //% speed.defl=0
    export function continuousServoControl(index: PwmAndServoIndex, speed: number): void {
        speed = Math.map(speed, -100, 100, 0, 180)
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
        let i2cBuffer = pins.createBuffer(1);
        if (batType == BatteryType.AA3)
            i2cBuffer[0] = 0x01;
        else if (batType == BatteryType.AA4)
            i2cBuffer[0] = 0x02;
        else if (batType == BatteryType.AA5)
            i2cBuffer[0] = 0x03;
        else if (batType == BatteryType.AA6)
            i2cBuffer[0] = 0x04;
        else if (batType == BatteryType.LithiumBattery1)
            i2cBuffer[0] = 0x05;
        else if (batType == BatteryType.LithiumBattery2)
            i2cBuffer[0] = 0x06;
        pins.i2cWriteBuffer(i2cAddr, i2cBuffer);

        let batLevel = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
        if (batLevel>100)
            batLevel = 100;
        
        return batLevel; 
    }

    /**
     * Read the battery voltage value.
     * Return 0--25.5
     */
    //% group="Battery"
    //% weight=339
    //% block="battery voltage"
    export function batteryVoltage(): number {
        let i2cBuffer = pins.createBuffer(1);
        i2cBuffer[0] = 0x1B;
        pins.i2cWriteBuffer(i2cAddr, i2cBuffer);

        let batVolt = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
        return batVolt/10;
    }

    /**
     * Read the firmware version of the chip on the mShield.
     * Returns a string. eg："Vx"
     */
    //% group="Others"
    //% weight=330
    //% block="version number"
    export function readVersions(): string {
        let mCarVersions: number = 0;

        let i2cBuffer = pins.createBuffer(1);
        i2cBuffer[0] = 0x00;

        pins.i2cWriteBuffer(i2cAddr, i2cBuffer)
        mCarVersions = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false)

        return ("V" + convertToText(mCarVersions))
    }
}