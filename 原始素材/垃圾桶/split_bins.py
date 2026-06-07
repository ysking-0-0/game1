"""
切分垃圾桶长图 — 3行：前两行各2个并排，第3行1个居中
"""
from PIL import Image
from pathlib import Path

SRC = Path(r"D:\游戏资源\垃圾分类\垃圾桶\22b73db3-82f4-42df-a75f-e16cd1fcb655.jpg")
OUT = SRC.parent

img = Image.open(SRC)
arr = img.copy()  # 不需要numpy，直接用PIL

# 切割坐标（通过像素亮度分析得到）
CUTS = [
    # (y1, y2, x1, x2, 文件名)
    (214, 499,   0, 143, "有害垃圾-红色桶.png"),
    (214, 499, 143, 286, "可回收物-蓝色桶.png"),
    (528, 762,   0, 143, "湿垃圾-棕色桶.png"),
    (528, 762, 143, 286, "干垃圾-灰色桶.png"),
    (772, 1024,  0, 286, "其他桶-墨绿色.png"),
]

for y1, y2, x1, x2, fname in CUTS:
    cell = img.crop((x1, y1, x2, y2))
    out_path = OUT / fname
    cell.save(str(out_path))
    print(f"  ✅ {fname} ({x2-x1}×{y2-y1})")

print("\n完成！原图未动。")
