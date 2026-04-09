import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Palette } from 'lucide-react';

const CompositePreview = ({ videoSrc, onClose }) => {
  const [bgColor, setBgColor] = useState('#00ff00');
  const bgColorRef = useRef(bgColor);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    bgColorRef.current = bgColor;
  }, [bgColor]);
  
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let workCanvas = document.createElement('canvas');
    let workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
    let ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    let active = true;

    const renderLoop = () => {
      if (!active) return;
      if (video.videoWidth === 0) {
        requestAnimationFrame(renderLoop);
        return;
      }

      const width = video.videoWidth / 2;
      const height = video.videoHeight;
      
      if (canvas.width !== width) {
         canvas.width = width;
         canvas.height = height;
      }
      if (workCanvas.width !== video.videoWidth) {
         workCanvas.width = video.videoWidth;
         workCanvas.height = video.videoHeight;
      }

      workCtx.drawImage(video, 0, 0);
      const srcData = workCtx.getImageData(0, 0, workCanvas.width, workCanvas.height).data;
      
      // fill background instantly synced via ref, preventing loop restarts
      ctx.fillStyle = bgColorRef.current;
      ctx.fillRect(0, 0, width, height);
      
      const destImgData = ctx.getImageData(0, 0, width, height);
      const destData = destImgData.data;

      for (let y = 0; y < height; y++) {
         const rowSrcOffset = y * workCanvas.width * 4;
         const rowDestOffset = y * width * 4;
         for (let x = 0; x < width; x++) {
            const origIdx = rowSrcOffset + x * 4;
            const maskIdx = rowSrcOffset + (x + width) * 4;
            const destIdx = rowDestOffset + x * 4;

            const maskVal = srcData[maskIdx]; // r channel of mask acts as alpha
            const alpha = maskVal / 255;
            
            if (alpha > 0) {
               destData[destIdx] = srcData[origIdx] * alpha + destData[destIdx] * (1 - alpha);
               destData[destIdx+1] = srcData[origIdx+1] * alpha + destData[destIdx+1] * (1 - alpha);
               destData[destIdx+2] = srcData[origIdx+2] * alpha + destData[destIdx+2] * (1 - alpha);
            }
         }
      }
      
      ctx.putImageData(destImgData, 0, 0);

      requestAnimationFrame(renderLoop);
    };

    video.play().then(() => {
       renderLoop();
    }).catch(e => console.error("Playback error", e));

    return () => {
      active = false;
      video.pause();
    };
  }, [videoSrc]); // Do not put bgColor here otherwise video stream resets!

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 999 }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{ 
          background: '#0f1115', 
          borderRadius: '24px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          width: '90%', 
          maxWidth: '1000px', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden' 
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
              <Palette size={18} color="#818cf8" />
              合成實驗室 (Composite Preview)
           </div>
           <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', display: 'flex' }} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#9ca3af'}>
             <X size={20} />
           </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'row', minHeight: '500px' }}>
           {/* Preview Player */}
           <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', position: 'relative' }}>
             <video ref={videoRef} src={videoSrc} style={{ display: 'none' }} loop muted playsInline />
             <canvas 
               ref={canvasRef} 
               style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
             />
           </div>
           
           {/* Sidebar Controls */}
           <div style={{ width: '250px', padding: '24px', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                 <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>替換背景色 (Background)</label>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['#00ff00', '#0000ff', '#ff00ff', '#ffffff', '#ff0000', '#1a1d24', '#000000', '#facc15'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setBgColor(c)}
                        style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', backgroundColor: c, border: bgColor === c ? '3px solid #fff' : '2px solid transparent', 
                          transform: bgColor === c ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.2s', cursor: 'pointer', boxShadow: bgColor === c ? '0 0 10px rgba(255,255,255,0.3)' : 'none' 
                        }}
                      />
                    ))}
                 </div>
                 <p style={{ marginTop: '24px', fontSize: '11px', color: '#6b7280', lineHeight: 1.6 }}>
                   即時讀取去背產生的黑白遮罩幀，並進行數學合成疊加，驗證去背邊緣是否乾淨。
                 </p>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompositePreview;
