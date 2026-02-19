#!/usr/bin/env python3
"""Create PNG icon for VS Code extension using PIL"""

from PIL import Image, ImageDraw
from pathlib import Path

# Create a 512x512 image with dark background
img = Image.new('RGBA', (512, 512), color=(30, 30, 30, 255))
draw = ImageDraw.Draw(img)

# Define gradient-inspired colors (OneDark palette)
color_blue = (97, 175, 239, 255)      # #61AFEF
color_cyan = (86, 182, 194, 255)      # #56B6C2
color_green = (152, 195, 121, 255)    # #98C379
color_gray = (108, 114, 132, 255)     # #6C7284

# Draw outer circle with gradient simulation (layered circles)
for i in range(20, 0, -1):
    alpha = int(76 * i / 20)
    color = (97, 175, 239, alpha)
    draw.ellipse(
        [(256 - 240 + i*12, 256 - 240 + i*12),
         (256 + 240 - i*12, 256 + 240 - i*12)],
        outline=color,
        width=4
    )

# Draw main circle
draw.ellipse(
    [(256 - 220, 256 - 220), (256 + 220, 256 + 220)],
    outline=color_blue,
    width=12
)

# Draw three inner circles (data/analysis)
circles = [
    (200, 200, 35, color_blue),
    (312, 200, 35, color_cyan),
    (256, 320, 35, color_green),
]

for cx, cy, r, color in circles:
    draw.ellipse(
        [(cx - r, cy - r), (cx + r, cy + r)],
        outline=color,
        width=4
    )

# Draw statistical wave in center
points = [
    (216, 276),  # -40, 20
    (236, 226),  # -20, -30
    (256, 236),  # 0, -20
    (276, 246),  # 20, -10
    (296, 276),  # 40, 20
]

for i in range(len(points) - 1):
    draw.line([points[i], points[i+1]], fill=color_blue, width=6)

# Draw connecting dots
dot_colors = [color_blue, color_cyan, color_green]
for i, (x, y) in enumerate([(216, 276), (256, 236), (296, 276)]):
    draw.ellipse(
        [(x - 5, y - 5), (x + 5, y + 5)],
        fill=dot_colors[i]
    )

# Draw accent lines (code representation)
lines = [
    ((100, 150), (150, 150)),
    ((362, 150), (412, 150)),
    ((100, 362), (150, 362)),
    ((362, 362), (412, 362)),
]

for start, end in lines:
    draw.line([start, end], fill=color_blue, width=3)

# Save as PNG
output_path = Path(__file__).parent.parent / "icon.png"
img.save(output_path, 'PNG')
print("✓ Created icon.png (512x512)")
