from PIL import Image, ImageDraw, ImageFont

W = 1440
H = 810
img = Image.new("RGB", (W, H), (21, 8, 38))
draw = ImageDraw.Draw(img)

for y in range(H):
    t = y / H
    r = int(21 + (124 - 21) * t)
    g = int(8 + (58 - 8) * t)
    b = int(38 + (237 - 38) * t * 0.55)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

for cx, cy, rad, col in [(1180, 140, 180, (124, 58, 237)), (180, 680, 150, (76, 29, 149)), (1240, 660, 110, (167, 139, 250))]:
    draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=col, width=6)

draw.rounded_rectangle([72, 72, 1368, 738], radius=36, outline=(196, 181, 253), width=3)

try:
    bold_big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 110)
    bold_mid = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
    mono = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 34)
    regular = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 34)
except OSError:
    bold_big = ImageFont.load_default()
    bold_mid = ImageFont.load_default()
    mono = ImageFont.load_default()
    regular = ImageFont.load_default()

draw.ellipse([120, 300, 360, 540], fill=(34, 197, 94))
draw.line([(175, 420), (225, 475), (305, 375)], fill=(255, 255, 255), width=22, joint="curve")

draw.text((420, 300), "Quantum Pass", fill=(255, 255, 255), font=bold_big)
draw.text((420, 430), "QDAY PROOF", fill=(196, 181, 253), font=bold_mid)
draw.text((120, 580), "secp256k1 plus ML-DSA-87", fill=(255, 255, 255), font=mono)
draw.text((120, 640), "Testnet qorechain-diana, chain 9800", fill=(216, 204, 245), font=regular)

img.save("featured.png", format="PNG")
print("featured.png 1440x810 saved")
