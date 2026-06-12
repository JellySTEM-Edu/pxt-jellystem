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
github.com/microsoft/pxt-common-packages/libs/servo

License:
MIT License

Original copyright:
Copyright (c) Microsoft Corporation

Changes by JellySTEM:
- Linked as a versioned dependency
- e-exposed its blocks inside the unified JellySTEM drawer via thin wrapper functions under the "Servo" group. 
- The upstream servo drawer is suppressed using //% deprecated=true.