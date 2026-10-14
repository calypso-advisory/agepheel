import cv2, numpy as np
def clean(name, rects, thr=25, dil=7, blur_rects=()):
    im=cv2.imread(f'scene-{name}.png'); H,W=im.shape[:2]
    g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(np.float32)
    bg=cv2.medianBlur(g.astype(np.uint8),51).astype(np.float32)
    mask=np.zeros((H,W),np.uint8)
    for (x0,y0,x1,y1,mode) in rects:
        sub=np.zeros((H,W),np.uint8)
        if mode=='full': sub[y0:y1,x0:x1]=255
        else:
            d=(bg-g)>thr; sub[y0:y1,x0:x1]=(d[y0:y1,x0:x1]*255).astype(np.uint8)
        mask|=sub
    mask=cv2.dilate(mask,np.ones((dil,dil),np.uint8))
    out=cv2.inpaint(im,mask,9,cv2.INPAINT_TELEA)
    for (x0,y0,x1,y1,k) in blur_rects:
        reg=out[y0:y1,x0:x1]; b=cv2.GaussianBlur(reg,(0,0),k)
        m=np.zeros(reg.shape[:2],np.float32); m[:]=1
        f=cv2.GaussianBlur(cv2.dilate(mask[y0:y1,x0:x1],np.ones((25,25),np.uint8)).astype(np.float32)/255,(0,0),12)[...,None]
        out[y0:y1,x0:x1]=(reg*(1-f)+b*f).astype(np.uint8)
    cv2.imwrite(f'clean/scene-{name}.png',out); cv2.imwrite(f'media-src/clean/mask-{name}.png',mask)
# scene-04: title + month labels
clean('04',[(1030,120,1135,235,'dark'),(1030,515,1300,560,'dark')],thr=18,dil=5)
# scene-12: whole text block + button on bright bokeh
clean('12',[(1150,200,1660,740,'dark'),(1165,632,1545,722,'full')],thr=12,dil=11,blur_rects=[(1120,170,1672,770,10)])
