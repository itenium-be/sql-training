# Result diff mockups

Canvas: https://claude.ai/artifact/EDY5XbNDNuikzUXjHTqHUQ

How to show a wrong answer against the expected result (only after the player requested the answer, #3).

- `Main.dc.html`: A · Inline: one table, wrong cells red with the expected value, extra rows/columns marked, missing rows appended
- `SideBySide.dc.html`: B · Your result vs expected, rows aligned
- `Unified.dc.html`: C · Git-style row diff (`=`, `−`, `+`, `~`)
- `EdgeCases.dc.html`: wrong row order, swapped columns, missing column, way too many rows

Source files of the Design canvas; they render inside the canvas, not standalone.
