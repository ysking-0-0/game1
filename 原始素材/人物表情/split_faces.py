"""
切分 3×3 人物表情九宫格
"""
from PIL import Image
from pathlib import Path

SRC = Path(r"D:\游戏资源\垃圾分类\人物表情\分类成功或失败等人物表情.png")
OUT = SRC.parent

# 9 个表情命名（左→右，上→下）
NAMES = [
    "01-委屈难过", "02-震惊受惊", "03-开心愉悦",
    "04-嚎啕大哭", "05-愤怒暴躁", "06-疑惑困惑",
    "07-无奈沮丧", "08-开怀大笑", "09-俏皮得意",
]

img = Image.open(SRC)
w, h = img.size
cw, ch = w // 3, h // 3

print(f"原图: {w}×{h}, 每格: {cw}×{ch}")

idx = 0
for row in range(3):
    for col in range(3):
        x1 = col * cw
        y1 = row * ch
        x2 = (col + 1) * cw if col < 2 else w
        y2 = (row + 1) * ch if row < 2 else h

        cell = img.crop((x1, y1, x2, y2))
        name = f"{NAMES[idx]}.png"
        cell.save(OUT / name)
        print(f"  ✅ {name} ({x2-x1}×{y2-y1})")
        idx += 1

print("\n全部切完！原图未动。")
