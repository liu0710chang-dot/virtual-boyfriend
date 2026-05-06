'use client';

import { useState, useEffect, useRef } from 'react';
import { characters, bgmList, Character } from '@/lib/characters';
import { useRouter } from 'next/navigation';
import { Music, Heart, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

const avatarUrls: Record<string, string> = {
  ceoboy: 'https://s3.bmp.ovh/2026/04/28/l1emSvkg.jpg',
  milkboy: 'https://s3.bmp.ovh/2026/04/28/t3ReCnS4.jpg',
  childhood: 'https://s3.bmp.ovh/2026/04/28/gbRwd2JD.jpg',
  genius: 'https://s3.bmp.ovh/2026/04/28/wPx2Li7g.jpg'
};

export default function HomePage() {
  const router = useRouter();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedBgm, setSelectedBgm] = useState<string | null>(null);
  const [showBgmModal, setShowBgmModal] = useState(false);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // 确保只在客户端渲染动态内容，避免 SSR 水合错误
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 进度条动画
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const playBgm = (bgmId: string) => {
    if (!audioContext) {
      const ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      setAudioContext(ac);
      setTimeout(() => startPlaying(bgmId, ac), 100);
      return;
    }
    startPlaying(bgmId, audioContext);
  };

  const startPlaying = (bgmId: string, ac: AudioContext) => {
    // 先停止当前播放的音频
    if (oscillator) {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch (e) {
        console.log('Oscillator already stopped');
      }
    }
    
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    
    const bgmSettings: Record<string, { freq: number; type: OscillatorType; gain: number }> = {
      romantic: { freq: 440, type: 'sine', gain: 0.08 },
      sweet: { freq: 523, type: 'triangle', gain: 0.06 },
      night: { freq: 330, type: 'sine', gain: 0.05 },
      sunshine: { freq: 587, type: 'triangle', gain: 0.06 }
    };
    
    const settings = bgmSettings[bgmId] || bgmSettings.romantic;
    osc.type = settings.type;
    osc.frequency.setValueAtTime(settings.freq, ac.currentTime);
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(settings.gain, ac.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    
    setOscillator(osc);
    setGainNode(gain);
    setIsPlaying(true);
  };

  const stopBgm = () => {
    if (oscillator) {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch (e) {
        console.log('Oscillator already stopped');
      }
      setOscillator(null);
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const toggleBgm = () => {
    if (!audioContext || !gainNode) return;
    
    if (isPlaying) {
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      setTimeout(() => {
        if (oscillator) {
          oscillator.stop();
          oscillator.disconnect();
          setOscillator(null);
        }
        setIsPlaying(false);
        setProgress(0);
      }, 500);
    } else {
      const ac = audioContext;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      
      const bgmSettings: Record<string, { freq: number; type: OscillatorType; gain: number }> = {
        romantic: { freq: 440, type: 'sine', gain: 0.08 },
        sweet: { freq: 523, type: 'triangle', gain: 0.06 },
        night: { freq: 330, type: 'sine', gain: 0.05 },
        sunshine: { freq: 587, type: 'triangle', gain: 0.06 }
      };
      
      const settings = bgmSettings[selectedBgm || 'romantic'];
      osc.type = settings.type;
      osc.frequency.setValueAtTime(settings.freq, ac.currentTime);
      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(settings.gain, ac.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      
      setOscillator(osc);
      setGainNode(gain);
      setIsPlaying(true);
    }
  };

  const getCurrentBgmName = () => {
    if (!selectedBgm) return '选择音乐';
    const bgm = bgmList.find(b => b.id === selectedBgm);
    return bgm?.name || '选择音乐';
  };

  const handleStartChat = () => {
    if (selectedCharacter) {
      // 进入聊天页面时停止背景音乐
      stopBgm();
      // 将角色信息保存到 sessionStorage
      sessionStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
      router.push(`/chat?character=${selectedCharacter.id}`);
    }
  };
  
  // 组件卸载时停止音频
  useEffect(() => {
    return () => {
      stopBgm();
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-amber-50 relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* 漂浮的心形 - 只在客户端渲染避免 SSR 水合错误 */}
        {isClient && [...Array(8)].map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const duration = 3 + Math.random() * 2;
          const size = 16 + Math.random() * 12;
          return (
            <motion.div
              key={i}
              className="absolute text-pink-400/40"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.sin(i) * 20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            >
              <Heart size={size} fill="currentColor" />
            </motion.div>
          );
        })}
        
        {/* 闪烁的星星 - 只在客户端渲染避免 SSR 水合错误 */}
        {isClient && [...Array(12)].map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const starDuration = 2 + Math.random() * 2;
          return (
            <motion.div
              key={`star-${i}`}
              className="absolute text-amber-400/60"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: starDuration,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <span className="text-lg">✦</span>
            </motion.div>
          );
        })}
      </div>

      {/* 主内容 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg mx-auto px-4 py-8"
      >
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Heart className="text-pink-500" size={18} />
            <span className="text-sm font-medium text-gray-700">你的专属虚拟男友</span>
          </motion.div>
          <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">
            💕 选择你的心动男友 💕
          </h1>
          <p className="text-pink-400/80 text-sm">
            四位优质男友，谁是你的菜？
          </p>
        </motion.div>

        {/* 角色选择区域 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/80"
        >
          {/* 装饰分隔线 */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-amber-500/60">✦</span>
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></span>
            <span className="text-amber-500/60">✦</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 w-full px-2">
              {characters.map((char, index) => {
                // 鼠标跟随效果
                const mouseX = useMotionValue(0);
                const mouseY = useMotionValue(0);
                
                const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), {
                  stiffness: 200,
                  damping: 20,
                });
                const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), {
                  stiffness: 200,
                  damping: 20,
                });

                const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
                  const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
                  mouseX.set(x);
                  mouseY.set(y);
                };

                const handleMouseLeave = () => {
                  mouseX.set(0);
                  mouseY.set(0);
                };

                return (
                  <motion.button
                    key={char.id}
                    onClick={() => setSelectedCharacter(char)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                    className={`
                      relative transition-all duration-300 transform
                      ${selectedCharacter?.id === char.id ? 'scale-105' : 'hover:scale-102'}
                    `}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlowingEffect 
                      className={`${selectedCharacter?.id === char.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity duration-300`}
                      glowColor="rgba(255, 182, 193, 0.6)"
                      intensity={selectedCharacter?.id === char.id ? "high" : "medium"}
                      delay={index * 100}
                    >
                      <div className="relative mx-auto" style={{ width: '140px' }}>
                        <svg 
                          className="w-full h-auto" 
                          viewBox="0 0 160 200"
                          style={{
                            filter: selectedCharacter?.id === char.id 
                              ? 'drop-shadow(0 8px 25px rgba(139, 90, 43, 0.4))' 
                              : 'drop-shadow(0 5px 20px rgba(139, 90, 43, 0.2))'
                          }}
                        >
                          <defs>
                            <linearGradient id={`goldBrown-${char.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#4a3728" />
                              <stop offset="20%" stopColor="#8B4513" />
                              <stop offset="40%" stopColor="#DAA520" />
                              <stop offset="50%" stopColor="#F5DEB3" />
                              <stop offset="60%" stopColor="#DAA520" />
                              <stop offset="80%" stopColor="#8B4513" />
                              <stop offset="100%" stopColor="#4a3728" />
                            </linearGradient>
                            <clipPath id={`frameClip-${char.id}`}>
                              <ellipse cx="80" cy="92" rx="52" ry="65" />
                            </clipPath>
                          </defs>
                          
                          <g>
                            <ellipse cx="80" cy="92" rx="68" ry="82" fill={`url(#goldBrown-${char.id})`} />
                            
                            <path d="M80 12 Q100 4 124 14 Q140 22 148 30" stroke={`url(#goldBrown-${char.id})`} strokeWidth="3" fill="none" strokeLinecap="round"/>
                            <path d="M80 12 Q60 4 36 14 Q20 22 12 30" stroke={`url(#goldBrown-${char.id})`} strokeWidth="3" fill="none" strokeLinecap="round"/>
                            <path d="M80 172 Q100 180 124 170 Q140 162 148 154" stroke={`url(#goldBrown-${char.id})`} strokeWidth="3" fill="none" strokeLinecap="round"/>
                            <path d="M80 172 Q60 180 36 170 Q20 162 12 154" stroke={`url(#goldBrown-${char.id})`} strokeWidth="3" fill="none" strokeLinecap="round"/>
                            <path d="M12 92 Q4 114 12 136 Q22 154 34 166" stroke={`url(#goldBrown-${char.id})`} strokeWidth="3" fill="none" strokeLinecap="round"/>
                            <path d="M148 92 Q156 114 148 136 Q138 154 126 166" stroke={`url(#goldBrown-${char.id})`} strokeWidth="3" fill="none" strokeLinecap="round"/>
                            <path d="M12 92 Q4 70 12 48 Q22 30 34 18" stroke={`url(#goldBrown-${char.id})`} strokeWidth="3" fill="none" strokeLinecap="round"/>
                            <path d="M148 92 Q156 70 148 48 Q138 30 126 18" stroke={`url(#goldBrown-${char.id})`} strokeWidth="3" fill="none" strokeLinecap="round"/>
                            
                            <circle cx="80" cy="12" r="5" fill={`url(#goldBrown-${char.id})`} />
                            <circle cx="80" cy="172" r="5" fill={`url(#goldBrown-${char.id})`} />
                            <circle cx="12" cy="92" r="5" fill={`url(#goldBrown-${char.id})`} />
                            <circle cx="148" cy="92" r="5" fill={`url(#goldBrown-${char.id})`} />
                            
                            <circle cx="80" cy="12" r="2.5" fill="rgba(255,255,255,0.6)" />
                            <circle cx="80" cy="172" r="2.5" fill="rgba(255,255,255,0.6)" />
                            <circle cx="12" cy="92" r="2.5" fill="rgba(255,255,255,0.6)" />
                            <circle cx="148" cy="92" r="2.5" fill="rgba(255,255,255,0.6)" />
                            
                            <path d="M80 12 L80 6 M80 172 L80 178 M12 92 L6 92 M148 92 L154 92" stroke={`url(#goldBrown-${char.id})`} strokeWidth="2" strokeLinecap="round"/>
                            
                            <ellipse cx="80" cy="92" rx="62" ry="75" fill="none" stroke={`url(#goldBrown-${char.id})`} strokeWidth="1.5" />
                            <ellipse cx="80" cy="92" rx="56" ry="69" fill="#FFF8F0" />
                          </g>
                          
                          <g clipPath={`url(#frameClip-${char.id})`}>
                            <image 
                              href={avatarUrls[char.id]} 
                              x="28" y="27" 
                              width="104" height="130" 
                              preserveAspectRatio="xMidYMid slice"
                            />
                          </g>
                        </svg>
                        
                        {selectedCharacter?.id === char.id && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full px-3 py-0.5 text-xs font-medium shadow-lg flex items-center gap-1"
                          >
                            <Heart size={8} fill="white" />
                            已选择
                          </motion.div>
                        )}
                      </div>
                    </GlowingEffect>
                    
                    <div className="text-center mt-4">
                      <div className="flex items-center justify-center gap-2 text-amber-600/50 text-xs">
                        <span>✦</span>
                        <span className="w-6 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></span>
                        <span>✦</span>
                      </div>
                      <h3 className="font-serif font-semibold text-gray-700 text-sm tracking-wider mt-1">
                        {char.name}
                      </h3>
                      <p className="text-xs text-pink-400/80 mt-0.5 font-medium">{char.personality}</p>
                      <div className="flex items-center justify-center gap-2 text-amber-600/50 text-xs mt-1">
                        <span>✦</span>
                        <span className="w-6 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></span>
                        <span>✦</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 背景音乐选择 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 pb-4"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-amber-100/60">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={isPlaying ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                  >
                    <Music className="text-amber-600" size={18} />
                  </motion.div>
                  <span className="font-medium text-gray-600 text-sm">背景音乐</span>
                </div>
                <motion.button
                  onClick={() => setShowBgmModal(!showBgmModal)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-pink-100 text-gray-700 rounded-full text-xs font-medium hover:from-amber-200 hover:to-pink-200 transition-all shadow-sm"
                >
                  {getCurrentBgmName()}
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showBgmModal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {bgmList.map((bgm) => (
                        <motion.button
                          key={bgm.id}
                          onClick={() => {
                            setSelectedBgm(bgm.id);
                            playBgm(bgm.id);
                            setShowBgmModal(false);
                          }}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            p-3 rounded-xl text-left transition-all text-sm
                            ${selectedBgm === bgm.id 
                              ? 'bg-gradient-to-r from-amber-100 to-pink-50 ring-2 ring-amber-300/50' 
                              : 'bg-white/60 hover:bg-white/80'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-pink-400 flex items-center justify-center"
                              animate={selectedBgm === bgm.id && isPlaying ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 0.5, repeat: selectedBgm === bgm.id && isPlaying ? Infinity : 0 }}
                            >
                              <Music size={10} className="text-white" />
                            </motion.div>
                            <div>
                              <div className="font-medium text-gray-700">{bgm.name}</div>
                              <div className="text-xs text-gray-400">{bgm.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {selectedBgm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3"
                >
                  {/* 音乐播放器卡片 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-amber-100">
                    <div className="flex items-center gap-4">
                      {/* 专辑封面 */}
                      <motion.div
                        className="relative w-14 h-14 rounded-xl overflow-hidden"
                        animate={isPlaying ? { rotate: 360 } : {}}
                        transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-pink-400 to-rose-500" />
                        <div className="absolute inset-2 flex items-center justify-center">
                          <Music className="text-white/90" size={24} />
                        </div>
                        {/* 旋转时的高光效果 */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
                          animate={{ opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.3 }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                      
                      {/* 歌曲信息 */}
                      <div className="flex-1">
                        <motion.div
                          className="font-semibold text-gray-700 text-sm"
                          animate={isPlaying ? { opacity: [1, 0.7, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {getCurrentBgmName()}
                        </motion.div>
                        <motion.div
                          className="text-xs text-gray-400"
                          animate={isPlaying ? { x: [0, 5, 0] } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {isPlaying ? '正在播放' : '已暂停'}
                        </motion.div>
                      </div>
                      
                      {/* 控制按钮 */}
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1, color: '#f59e0b' }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                        >
                          <SkipBack size={18} />
                        </motion.button>
                        
                        <motion.button
                          onClick={toggleBgm}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
                          animate={isPlaying ? { boxShadow: ['0 0 20px rgba(251, 146, 60, 0.4)', '0 0 30px rgba(251, 146, 60, 0.6)', '0 0 20px rgba(251, 146, 60, 0.4)'] } : {}}
                          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                        >
                          {isPlaying ? <Pause size={18} /> : <Play size={18} fill="white" />}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1, color: '#f59e0b' }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                        >
                          <SkipForward size={18} />
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* 动态进度条 */}
                    <div className="mt-4 relative">
                      <div className="h-1.5 bg-gradient-to-r from-amber-100 to-pink-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                        {/* 进度条闪光效果 */}
                        <motion.div
                          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                          animate={isPlaying ? { x: ['-32px', '100%'] } : {}}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                      
                      {/* 时间显示 */}
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">00:00</span>
                        <span className="text-xs text-gray-400">03:45</span>
                      </div>
                    </div>
                    
                    {/* 可视化音频波形 */}
                    {isPlaying && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 flex items-center justify-center gap-1 h-8"
                      >
                        {[...Array(24)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 bg-gradient-to-t from-amber-400 via-pink-400 to-rose-400 rounded-full"
                            animate={{
                              height: `${15 + Math.sin(i * 0.4 + Date.now() * 0.004) * 85}%`,
                              opacity: 0.6 + Math.sin(i * 0.4 + Date.now() * 0.004) * 0.4,
                            }}
                            transition={{ duration: 0.15 }}
                          />
                        ))}
                      </motion.div>
                    )}
                    
                    {/* 播放模式指示 */}
                    {isPlaying && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center justify-center gap-2"
                      >
                        <motion.div
                          className="w-2 h-2 bg-amber-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-xs text-gray-400">单曲循环</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 开始聊天按钮 */}
            <motion.button
              onClick={handleStartChat}
              disabled={!selectedCharacter || !selectedBgm}
              whileHover={selectedCharacter && selectedBgm ? { scale: 1.02, y: -2 } : {}}
              whileTap={selectedCharacter && selectedBgm ? { scale: 0.98 } : {}}
              className={`
                w-full mt-4 py-4 rounded-xl font-serif font-semibold text-lg transition-all duration-300 shadow-lg
                ${selectedCharacter && selectedBgm
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white hover:shadow-xl cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {selectedCharacter && selectedBgm ? (
                <motion.span
                  animate={{ opacity: [1, 0.8, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💕 开始聊天
                </motion.span>
              ) : (
                '请选择角色和音乐'
              )}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-pink-300/60 text-xs"
        >
          <p>💕 愿每一次相遇都是心动的开始 💕</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
