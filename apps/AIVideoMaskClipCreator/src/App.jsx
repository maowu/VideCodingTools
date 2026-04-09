import React, { useState, useRef } from 'react';
import { 
  Upload, Download, SlidersHorizontal, Play, Film, Loader2, AlertCircle, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageProcessor } from './Processor';
import CompositePreview from './CompositePreview';

const App = () => {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadExt, setDownloadExt] = useState('mp4');
  const [appError, setAppError] = useState(null);
  
  const [threshold, setThreshold] = useState(0.94);
  const [outputRes, setOutputRes] = useState("1024x512");
  const [showSlider, setShowSlider] = useState(false);
  
  // Composite View State
  const [showComposite, setShowComposite] = useState(false);

  const resolutions = ["512x256", "1024x512", "1600x800"];

  const videoRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const recorderRef = useRef(null);
  const recordChunks = useRef([]);
  const processor = useRef(new ImageProcessor());

  // Show first frame as a single, centered thumbnail when video initially loads
  const handleVideoLoadedData = () => {
    const video = videoRef.current;
    if (!video || isProcessing) return;
    
    const canvas = previewCanvasRef.current;
    if (canvas && video.videoWidth > 0 && !isFinished) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type.startsWith('video/')) {
      setFile(selectedFile);
      const newUrl = URL.createObjectURL(selectedFile);
      
      setVideoUrl(newUrl);
      setIsFinished(false);
      setDownloadUrl(null);
      setProgress(0);
      setAppError(null);
      setShowComposite(false);
      
      // Auto-load metadata to trigger the thumbnail
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load();
        }
      }, 50);
    }
  };

  const getSupportedMimeType = () => {
    const types = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
  };

  const processVideo = async () => {
    if (!videoRef.current || isProcessing) return;
    
    setIsProcessing(true);
    setProgress(0);
    setIsFinished(false);
    setShowSlider(false);
    setShowComposite(false);
    setAppError(null);
    recordChunks.current = [];

    const video = videoRef.current;
    
    try {
      if (video.videoWidth === 0 || video.readyState < 2) {
        await new Promise((resolve, reject) => {
          video.onloadeddata = resolve;
          video.onloadedmetadata = resolve;
          setTimeout(() => reject(new Error("Video metadata timeout. File may be corrupted or unsupported.")), 4000);
        });
      }

      if (video.videoWidth === 0) throw new Error("影片載入失敗: 解析度異常 (Width is 0)");

      // Safely acquire duration
      let duration = video.duration;
      if (!duration || isNaN(duration) || duration === Infinity) {
        video.currentTime = 1e101; 
        await new Promise(r => video.addEventListener('seeked', r, { once: true }));
        duration = video.duration;
        video.currentTime = 0;
        await new Promise(r => video.addEventListener('seeked', r, { once: true }));
      }
      
      if (!duration || isNaN(duration) || duration === 0) {
         throw new Error("影片長度無法判讀。");
      }

      // Calculate Target Dimensions
      const [resW, resH] = outputRes.split('x').map(Number);
      const targetHalfW = resW / 2;

      const workCanvas = document.createElement('canvas');
      workCanvas.width = targetHalfW;
      workCanvas.height = resH;
      const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });

      const outCanvas = previewCanvasRef.current;
      outCanvas.width = resW;
      outCanvas.height = resH;
      const outCtx = outCanvas.getContext('2d');

      const mimeType = getSupportedMimeType();
      if (!mimeType) throw new Error("瀏覽器不支援影片編碼導出 (MediaRecorder unsupported)");

      const stream = outCanvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
      recorderRef.current = recorder;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        if (recordChunks.current.length > 0) {
           const blob = new Blob(recordChunks.current, { type: mimeType.split(';')[0] });
           const url = URL.createObjectURL(blob);
           setDownloadUrl(url);
           setDownloadExt(mimeType.includes('mp4') ? 'mp4' : 'webm');
           setIsFinished(true);
        } else {
           setAppError("錄製失敗，未能擷取到任何影格。");
        }
        setIsProcessing(false);
      };

      recorder.start();

      let processingActive = true;
      let isFrameProcessing = false;

      video.currentTime = 0;
      await video.play();

      const loop = async () => {
        if (!processingActive) {
          video.pause();
          return;
        }

        if (video.ended) {
          recorder.stop();
          return;
        }

        if (!isFrameProcessing) {
          isFrameProcessing = true;
          try {
            // Draw squished/stretched to exact final dimensions
            workCtx.drawImage(video, 0, 0, targetHalfW, resH);
            const processedCanvas = await processor.current.processFrame(workCanvas, threshold);
            outCtx.drawImage(processedCanvas, 0, 0);
          } catch (e) {
            console.error("Frame processing ignored:", e);
          } finally {
            isFrameProcessing = false;
          }
        }

        const currentProg = Math.round((video.currentTime / duration) * 100);
        setProgress(Math.min(100, currentProg));

        requestAnimationFrame(loop);
      };

      loop();

    } catch (err) {
      console.error(err);
      setAppError(err.message || '處理時發生不明錯誤。');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ 
      width: '100vw', height: '100vh', overflow: 'hidden', background: '#0f1115', 
      position: 'relative', color: '#fff', fontFamily: 'sans-serif' 
    }}>
      
      {/* 獨立功能卡: 合成測試預覽視窗 */}
      <AnimatePresence>
        {showComposite && isFinished && downloadUrl && (
          <CompositePreview videoSrc={downloadUrl} onClose={() => setShowComposite(false)} />
        )}
      </AnimatePresence>

      {/* 預覽與畫布區 (Preview & Canvas Area) */}
      <main style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        padding: '32px' 
      }}>
         
         {/* 1. 隱藏的最底層資料源影片 (Source Video always hidden via inline styles to bypass Tailwind cache bugs) */}
         <video 
           ref={videoRef} 
           src={videoUrl} 
           style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
           muted 
           playsInline
           preload="auto"
         />

         {/* 2. 剛上傳未處理的狀態: 顯示原始影片預覽 */}
         {videoUrl && !isProcessing && !isFinished && (
           <video 
             src={videoUrl} 
             controls 
             className="transition-all duration-500"
             style={{ 
               maxWidth: '80vw', maxHeight: '512px', objectFit: 'contain', 
               backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
             }}
           />
         )}
         
         {/* 3. 處理中的狀態: 顯示逐格產生的 Canvas */}
         <canvas 
           ref={previewCanvasRef} 
           style={{ 
             display: isProcessing ? 'block' : 'none',
             maxWidth: '80vw', 
             maxHeight: '512px', 
             objectFit: 'contain',
             backgroundColor: 'rgba(0,0,0,0.3)',
             borderRadius: '12px',
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
           }}
         />

         {/* 4. 處理完成狀態: 顯示處理後的結果影片 */}
         {isFinished && downloadUrl && (
           <video 
             src={downloadUrl} 
             controls 
             autoPlay 
             loop
             className="transition-all duration-500"
             style={{ 
               maxWidth: '80vw', maxHeight: '512px', objectFit: 'contain', 
               backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
             }}
           />
         )}

         {/* Empty State */}
         {!videoUrl && !isProcessing && !isFinished && (
           <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, pointerEvents: 'none', userSelect: 'none' }}>
              <Film style={{ width: '96px', height: '96px', marginBottom: '24px', strokeWidth: 1 }} />
              <p style={{ fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 300 }}>Workspace Ready</p>
           </div>
         )}
      </main>

      {/* Floating Error Alert */}
      <AnimatePresence>
        {appError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-950/80 border border-red-500/50 text-red-200 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50 backdrop-blur-md"
          >
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <span className="text-sm font-bold">{appError}</span>
             <button onClick={() => setAppError(null)} className="ml-4 opacity-50 hover:opacity-100 text-xs">OK</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="floating-dock">
        
        <label className="dock-item" title="上傳影片" style={{ cursor: 'pointer' }}>
          <Upload className="w-5 h-5" />
          <input 
            type="file" 
            style={{ display: 'none' }} 
            accept="video/*" 
            onChange={handleFileChange} 
          />
        </label>

        <div className="w-[1px] h-6 bg-white/10" />

        <div className="relative">
          <button 
            className={`dock-item ${showSlider ? 'text-white bg-white/10' : ''}`}
            onClick={() => setShowSlider(!showSlider)}
            disabled={!file || isProcessing}
            title="調整設定 (Settings)"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showSlider && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="slider-popover"
                style={{ width: '264px' }}
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                      <span>Sensitivity: </span>
                      <span className="text-white">{Math.round(threshold * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="0.99" step="0.01" 
                      value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="w-full h-px bg-white/10 my-1"></div>
                  
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 mb-2">Target Output</div>
                    <div className="flex gap-1 justify-between">
                       {resolutions.map(r => {
                         const isActive = outputRes === r;
                         return (
                           <button 
                             key={r}
                             onClick={() => setOutputRes(r)}
                             style={{
                               padding: '6px 8px',
                               fontSize: '10px',
                               borderRadius: '6px',
                               fontWeight: 'bold',
                               transition: 'all 0.3s ease',
                               cursor: 'pointer',
                               border: isActive ? '1px solid #a5b4fc' : '1px solid rgba(255,255,255,0.1)',
                               background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(0,0,0,0.4)',
                               color: isActive ? '#ffffff' : '#9ca3af',
                               boxShadow: isActive ? '0 0 15px rgba(99,102,241,0.8)' : 'none',
                               transform: isActive ? 'scale(1.05)' : 'scale(1)',
                               zIndex: isActive ? 10 : 1
                             }}
                           >
                             {r}
                           </button>
                         );
                       })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-[1px] h-6 bg-white/10" />

        <button 
          className="dock-item primary" 
          onClick={processVideo}
          disabled={!file || isProcessing}
          title="執行產生遮罩"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin opacity-20" />
              <div className="progress-overlay text-[10px]">{progress}</div>
            </>
          ) : (
            <Play className="w-5 h-5 ml-1 fill-current" />
          )}
        </button>

        <AnimatePresence>
          {isFinished && downloadUrl && (
            <motion.div
              initial={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{ width: 'auto', opacity: 1, marginLeft: 20 }}
              style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
            >
               <div className="w-[1px] h-6 bg-white/10 absolute -left-2 top-1/2 -translate-y-1/2" />
               
               {/* 獨立功能卡切換按鈕: 啟動合成預覽 */}
               <button 
                 onClick={() => setShowComposite(true)}
                 className="dock-item text-indigo-400 hover:text-indigo-300"
                 title="合成測試 (Composite Lab)"
               >
                 <Layers className="w-5 h-5" />
               </button>

               <a 
                 href={downloadUrl} download={`mask_output.${downloadExt}`} 
                 className="dock-item text-green-400 hover:text-green-300"
                 title="下載結果影片檔"
               >
                 <Download className="w-5 h-5" />
               </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
