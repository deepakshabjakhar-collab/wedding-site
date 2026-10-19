import cv2, numpy as np, os
from PIL import Image
JOBS = [
 ("maison",  "public/covers/maison.jpg",  (0.27,0.33,0.66,0.76)),
 ("salento", "public/covers/salento.jpg", (0.33,0.27,0.86,0.68)),
 ("miel",    "public/covers/miel.jpg",    (0.33,0.19,0.85,0.60)),
 ("noir",    "public/covers/noir.jpg",    (0.19,0.24,0.76,0.42)),
 ("aurelia", "public/covers/aurelia.jpg", (0.10,0.27,0.96,0.73)),
 ("celeste", "public/covers/celeste.jpg", (0.24,0.15,1.00,0.50)),
]
for tid, src, (x0,y0,x1,y1) in JOBS:
    im = cv2.imread(src); h,w = im.shape[:2]
    crop = im[int(h*y0):int(h*y1), int(w*x0):int(w*x1)]
    ch,cw = crop.shape[:2]
    mask = np.zeros((ch,cw), np.uint8)
    bgd = np.zeros((1,65), np.float64); fgd = np.zeros((1,65), np.float64)
    rect = (int(cw*0.02), int(ch*0.02), int(cw*0.96), int(ch*0.96))
    cv2.grabCut(crop, mask, rect, bgd, fgd, 8, cv2.GC_INIT_WITH_RECT)
    alpha = np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, np.ones((7,7),np.uint8))
    n, lab, stats, cents = cv2.connectedComponentsWithStats((alpha>0).astype(np.uint8), 8)
    keep = np.zeros_like(alpha)
    for i in range(1, n):
        cx, cy = cents[i]; area = stats[i, cv2.CC_STAT_AREA]
        ww, hh = stats[i, cv2.CC_STAT_WIDTH], stats[i, cv2.CC_STAT_HEIGHT]
        if area < 0.003*ch*cw: continue
        if (cx < cw*0.05 or cx > cw*0.95) and ww < cw*0.09: continue  # edge strips
        keep[lab==i] = 255
    alpha = cv2.GaussianBlur(cv2.medianBlur(keep,5), (0,0), 1.1)
    b,g,r = cv2.split(crop)
    Image.fromarray(cv2.merge((r,g,b,alpha))).save(f"public/fastenings/{tid}.png")
    print(tid, "fg%", round((alpha>128).mean()*100,1))
