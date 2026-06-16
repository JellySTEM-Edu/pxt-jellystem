# JellySTEM MakeCode Extension AI Reference

## Purpose

This repository contains a Microsoft MakeCode extension for the BBC micro:bit.

Use this document when generating:

- MakeCode JavaScript / TypeScript code
- New extension APIs
- MakeCode blocks
- Example projects
- Documentation
- Tutorials
- Pull requests
- Code reviews

Target audience:

- Students
- Teachers
- Makers
- Robotics clubs
- STEM classrooms

Preferred output:

- MakeCode JavaScript / TypeScript
- Beginner-friendly examples
- Block-compatible code

---

# Core Rules

## Rule 1 — Never Invent APIs

Only use functions, enums, classes, and namespaces that exist in the repository source code.

Verify APIs from:

- main.ts
- enums.d.ts
- shims.d.ts

If an API cannot be verified:

> API not verified in JellySTEM source code.

Do not guess.

---

## Rule 2 — Use Exact Function Signatures

Before generating code:

- Verify function exists.
- Verify parameter count.
- Verify parameter order.
- Verify enum types.
- Verify return type.

Never assume a parameter list.

---

## Rule 3 — Student-Friendly Code

Prefer:

```typescript
let speed = 50
```

over:

```typescript
const motorSpeedPercentage = 50
```

unless additional clarity is needed.

Examples should:

- be short
- be readable
- teach one concept
- convert easily to Blocks

---

## Rule 4 — MakeCode Compatible

Generated code must:

- Compile in MakeCode
- Convert to Blocks
- Avoid unsupported TypeScript features
- Avoid external libraries unless already included

Do not use:

- Generics
- Async/await
- Advanced classes
- External npm packages

---

## Rule 5 — Verify Before Generating

Before producing code verify:

- Namespace exists
- Function exists
- Enum exists
- Parameters are correct
- Block compatibility maintained

---

# Repository Architecture

## Public Namespace

All user-facing APIs belong to:

```typescript
namespace jellystem
```

Do not create:

```typescript
namespace jellystemMotors
namespace jellystemServos
namespace jellystemSensors
namespace jellystemRadio
```

unless explicitly added to the repository.

---

## File Structure

Important files:

```text
pxt.json
main.ts
enums.d.ts
shims.d.ts
IR.cpp
README.md
test.ts
```

Always inspect these files before generating repository modifications.

---

# MakeCode Block Development Rules

## Block Annotations

Use MakeCode annotations.

Example:

```typescript
//% group="Motors"
//% block="set speed %speed"
export function setSpeed(speed: number) {
}
```

Every exported user-facing API should have:

- block definition
- group assignment
- tooltip/help text when appropriate

---

## Block Groups

Organize functionality using groups.

Current and recommended groups:

- Motors
- LEDs
- Infrared Sensor
- PWM Port
- Battery
- Distance Sensor
- NeoPixel

Do not create unnecessary groups.

---

# Available Hardware Features

## Motors

The extension includes motor control APIs.

Capabilities include:

- Motor direction control
- Motor speed control
- Differential drive control
- Stop
- Brake
- Calibration
- Speed ramping

Examples:

```typescript
jellystem.setMotorsSpeed(50, 50)
```

```typescript
jellystem.wheelStop(jellystem.Motors.AllMotors)
```

---

## LEDs

The extension supports onboard LED outputs.

Example:

```typescript
jellystem.setLed(
    jellystem.Leds.LED20,
    true
)
```

---

## Infrared Remote

Supported features:

- Callback handling
- Button detection
- IR value reading

Example:

```typescript
jellystem.irCallBack(function () {
    if (jellystem.irButton(jellystem.MshieldIrButtons.OK)) {
        basic.showIcon(IconNames.Yes)
    }
})
```

---

## PWM Ports

PWM expansion ports are supported.

Examples:

```typescript
jellystem.extendPwmControl(
    jellystem.PwmAndServoIndex.S1,
    100
)
```

---

## Servos

Supported servo features:

### mShield Servo Ports

```typescript
jellystem.extendServoControl(...)
```

### Continuous Servos

```typescript
jellystem.continuousServoControl(...)
```

### micro:bit Pins

```typescript
jellystem.servoSetAngle(...)
```

```typescript
jellystem.servoRun(...)
```

```typescript
jellystem.servoStop(...)
```

```typescript
jellystem.servoSetPulse(...)
```

```typescript
jellystem.servoSetRange(...)
```

```typescript
jellystem.servoSetStopOnNeutral(...)
```

---

## Battery Monitoring

Supported features:

```typescript
jellystem.batteryLevel(...)
```

```typescript
jellystem.batteryVoltage(...)
```

Used for:

- Battery percentage
- Voltage monitoring
- Classroom diagnostics

---

## Device Information

Supported:

```typescript
jellystem.readVersions()
```

---

## Distance Sensor Support

Supported hardware:

### Sharp GP2Y0A41SK0F

Range:

- 4 cm
- 30 cm

Recommended APIs:

- readDistance()
- isCloserThan()
- isFartherThan()
- distanceZone()
- onDistanceCrossed()

Use these APIs for:

- Obstacle avoidance
- Robotics
- STEM demonstrations

If these APIs are not yet implemented in source, do not generate them.

---

# NeoPixel Support

NeoPixel functionality is provided through wrappers around:

microsoft/pxt-neopixel

Supported features include:

- create()
- show()
- clear()
- showColor()
- showRainbow()
- setPixelColor()
- setBrightness()
- rotate()
- shift()
- range()
- length()

Example:

```typescript
let strip = jellystem.create(
    DigitalPin.P0,
    8,
    NeoPixelMode.RGB
)

jellystem.showRainbow(strip)
```

---

## NeoPixel Wrapper Rules

When extending NeoPixel support:

- Prefer wrappers under namespace jellystem
- Maintain parity with upstream APIs
- Preserve compatibility
- Use advanced=true for expert-only APIs

Example:

```typescript
//% advanced=true
```

---

# Available Enums

Verify exact enum members before use.

Known enums include:

```typescript
MotorsDirection
Motors
MotorMode
Leds
S1ToS4Type
PwmAndServoIndex
ServoType
MshieldIrButtons
BatteryType
ServoPin
```

Always verify enum members in:

```text
enums.d.ts
main.ts
```

before generating code.

---

# Extension Import Rules

## Method 1 — Simple Import

Use when:

- Source is small
- Mostly TypeScript
- Stable hardware driver

Procedure:

1. Copy source code.
2. Move into namespace jellystem.
3. Add block annotations.
4. Preserve attribution.

---

## Method 2 — Dependency Import

Use when:

- Library is large.
- Library is actively maintained.
- Library contains timing-sensitive code.
- Library contains C++ support files.

Procedure:

1. Add dependency to pxt.json.
2. Create wrapper APIs in main.ts.
3. Hide dependency drawer.
4. Preserve attribution.

---

# Dependency Drawer Suppression

When wrapping third-party MakeCode libraries:

Use:

```typescript
//% deprecated=true
namespace dependencyName {
}
```

Purpose:

- Hide dependency category.
- Keep MakeCode UI focused on JellySTEM blocks.

Example:

```typescript
//% deprecated=true
namespace neopixel {
}
```

---

# Documentation Rules

When documenting APIs include:

## Purpose

Explain what the API does.

## Parameters

List parameters.

## Return Value

Explain return value.

## Example

Provide a short example.

Format:

```md
### functionName()

Description

Parameters:
- parameterName

Returns:
- description

Example:

```typescript
// example
```
```

---

# Example Style Guide

Preferred:

```typescript
basic.forever(function () {
    let distance = jellystem.readDistance()

    if (distance < 10) {
        jellystem.wheelStop(jellystem.Motors.AllMotors)
    }
})
```

Avoid:

```typescript
while (true) {
}
```

unless specifically required.

---

# Licensing Rules

This repository includes or adapts code from:

## Siyeenove mShield

Repository:

https://github.com/siyeenove/pxt_mshield

License:

MIT

Copyright:

Copyright (c) 2024 SIYEENOVA

---

## Microsoft NeoPixel

Repository:

https://github.com/microsoft/pxt-neopixel

License:

MIT

---

## Attribution Requirements

When importing or adapting code:

- Preserve copyright notices.
- Preserve license headers.
- Update THIRD_PARTY_NOTICES.md.
- Update README attribution section.
- Maintain MIT license compliance.

---

# AI Pull Request Checklist

Before proposing repository changes:

- [ ] API exists and compiles
- [ ] Namespace is jellystem
- [ ] Block annotations added
- [ ] Group assigned
- [ ] MakeCode compatible
- [ ] Blocks compatible
- [ ] Dependency version pinned
- [ ] Attribution reviewed
- [ ] THIRD_PARTY_NOTICES.md updated if required
- [ ] README updated if required
- [ ] License compatibility verified

---

# AI Verification Checklist

Before generating code:

- [ ] Namespace verified
- [ ] Function verified
- [ ] Enum verified
- [ ] Parameter count verified
- [ ] Parameter order verified
- [ ] Return type verified
- [ ] MakeCode compatible
- [ ] Student friendly
- [ ] Block compatible
- [ ] No invented APIs

If uncertain:

> API not verified in JellySTEM source code.

Do not guess.

---

# Output Requirements

Generated code must:

- Compile in Microsoft MakeCode
- Use only verified JellySTEM APIs
- Be suitable for classroom use
- Be beginner friendly
- Prefer readability over optimization
- Be easy to convert into Blocks
- Follow repository conventions

When source code and documentation disagree:

**Source code is authoritative.**