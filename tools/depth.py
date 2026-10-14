import onnxruntime as ort, numpy as np, cv2, glob, os, sys
s=ort.InferenceSession('models/da2_vitb.onnx')
mean=np.array([0.485,0.456,0.406]);std=np.array([0.229,0.224,0.225])
def infer(rgb):
    x=cv2.resize(rgb,(518,518),interpolation=cv2.INTER_CUBIC)/255.0
    x=((x-mean)/std).transpose(2,0,1)[None].astype(np.float32)
    return s.run(None,{'l_x_':x})[0][0]
for f in sorted(glob.glob('media-src/scene-*.png')):
    bgr=cv2.imread(f); rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB); H,W=rgb.shape[:2]
    # full squash + flipped for stability
    d=infer(rgb); d2=infer(rgb[:,::-1].copy())[:,::-1]
    d=(d+d2)/2
    d=cv2.resize(d,(W,H),interpolation=cv2.INTER_CUBIC)
    lo,hi=np.percentile(d,1),np.percentile(d,99.5)
    d=np.clip((d-lo)/(hi-lo),0,1)  # 1 = near
    g=cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY).astype(np.float32)/255
    try:
        d=cv2.ximgproc.guidedFilter(g,d.astype(np.float32),8,1e-3)
    except Exception: d=cv2.bilateralFilter(d.astype(np.float32),9,0.1,8)
    out=os.path.join(os.path.dirname(f),'depth',os.path.basename(f))
    cv2.imwrite(out,(np.clip(d,0,1)*255).astype(np.uint8)); print(out,flush=True)
