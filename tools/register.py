import cv2, numpy as np, sys
def reg(a,b):
    A=cv2.imread(f'scene-{a}.png',0); B=cv2.imread(f'scene-{b}.png',0)
    sift=cv2.SIFT_create(6000)
    ka,da=sift.detectAndCompute(A,None); kb,db=sift.detectAndCompute(B,None)
    m=cv2.BFMatcher().knnMatch(db,da,k=2)
    good=[x for x,y in m if x.distance<0.72*y.distance]
    if len(good)<8: print(a,b,'few',len(good)); return
    pb=np.float32([kb[g.queryIdx].pt for g in good]); pa=np.float32([ka[g.trainIdx].pt for g in good])
    M,inl=cv2.estimateAffinePartial2D(pb,pa,method=cv2.RANSAC,ransacReprojThreshold=6)
    s=np.hypot(M[0,0],M[1,0]); rot=np.degrees(np.arctan2(M[1,0],M[0,0]))
    print(f'{b}->{a}: n={len(good)} inl={int(inl.sum())} s={s:.3f} rot={rot:.2f} tx={M[0,2]:.1f} ty={M[1,2]:.1f}')
for p in [('01','02'),('02','03'),('03','04'),('07','08'),('08','09'),('09','10'),('10','11'),('11','12'),('07','12'),('08','12'),('05','06')]: reg(*p)
