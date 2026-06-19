# Third-Party Notices

This JellySTEM MakeCode extension includes or adapts code from the Siyeenove mShield MakeCode extension.

Original project:
http://github.com/siyeenove/pxt_mshield

Original package name:
mshield

Original description:
mShield designed by Siyeenove

Original license:
MIT License

Original copyright:
Copyright (c) 2024 SIYEENOVA

Changes by JellySTEM:
- Reorganized and rebranded blocks for JellySTEM educational projects
- Adapted the extension for JellySTEM micro:bit projects
- Future additions may include motor acceleration, safe direction changes, sensors, lights, and classroom project helpers

The original MIT license requires that the copyright notice and permission notice be included in all copies or substantial portions of the software.

---

Additional third-party code:


---

Project name:
Microsoft pxt-neopixel

Repository:
https://github.com/microsoft/pxt-neopixel

License:
MIT License

Original copyright:
Copyright (c) Microsoft Corporation

Changes by JellySTEM:
- Linked as a background library dependency to re-export addressable RGB LED control blocks inside the unified JellySTEM block drawer.

---

Project name:
Microsoft pxt-common-packages (servo)

Repository:
[github.com/microsoft/pxt-common-packages/libs/servo](https://github.com/microsoft/pxt-common-packages/tree/master/libs/servo)

License:
MIT License

Original copyright:
Copyright (c) Microsoft Corporation

Changes by JellySTEM:
- Linked as a versioned dependency
- e-exposed its blocks inside the unified JellySTEM drawer via thin wrapper functions under the "Servo" group. 
- The upstream servo drawer is suppressed using //% deprecated=true.

---

Project name:
1010Technologies pxt-makerbit-ultrasonic

Repository:
[https://github.com/1010technologies/pxt-makerbit-ultrasonic](https://github.com/1010technologies/pxt-makerbit-ultrasonic)

License:
MIT License

Original copyright:
Copyright (c) 2019 Roger Wagner

Changes by JellySTEM:
- Eenamed enums to avoid collision with existing DistanceUnit
- Prefixed private helpers
- Added "jelly_" namespace prefix to blockId

---

Project name:
tinkertanker/pxt-oled-ssd1306

Repository:
[github.com/tinkertanker/pxt-oled-ssd1306](https://github.com/tinkertanker/pxt-oled-ssd1306)

License:
MIT License

Original copyright:
Copyright (c) Tinkertanker

Changes by JellySTEM:
- Linked as a versioned dependency (v2.0.18)
- Re-exposed its blocks under the unified JellySTEM "Display" group
  via wrapper functions. 
- The upstream OLED drawer is suppressed.