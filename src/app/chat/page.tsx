'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Send, ArrowLeft, Volume2, Loader2, Heart, Sparkles, ImagePlus, X } from 'lucide-react';
import { Character, characters } from '@/lib/characters';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  imageUrl?: string;
  isLoading?: boolean;
}

const avatarUrls: Record<string, string> = {
  ceoboy: 'https://s3.bmp.ovh/2026/04/28/l1emSvkg.jpg',
  milkboy: 'https://s3.bmp.ovh/2026/04/28/t3ReCnS4.jpg',
  childhood: 'https://s3.bmp.ovh/2026/04/28/gbRwd2JD.jpg',
  genius: 'https://s3.bmp.ovh/2026/04/28/wPx2Li7g.jpg'
};

// 角色语音配置（使用服务器端 TTS）
const voiceConfig: Record<string, { pitch: number; rate: number; name: string }> = {
  ceoboy: { pitch: 0.7, rate: 0.85, name: '霸总音' },
  milkboy: { pitch: 1.2, rate: 1.0, name: '奶狗音' },
  childhood: { pitch: 0.95, rate: 0.9, name: '温柔音' },
  genius: { pitch: 1.1, rate: 0.95, name: '少年音' }
};

// 角色专属主题配置
interface CharacterTheme {
  bgGradient: string;
  bubbleUser: string;
  bubbleAssistant: string;
  textColor: string;
  accentClass: string;
  accentBgClass: string;
  accentRingClass: string;
  glowColor: string;
  decoration: string;
  decorationColor: string;
  accentHex: string;
}

const characterThemes: Record<string, CharacterTheme> = {
  ceoboy: {
    bgGradient: 'from-gray-900 via-slate-800 to-gray-900',
    bubbleUser: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
    bubbleAssistant: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white',
    textColor: 'text-white',
    accentClass: 'text-amber-400',
    accentBgClass: 'bg-amber-500',
    accentRingClass: 'ring-amber-500',
    glowColor: '#fbbf24',
    decoration: '★',
    decorationColor: 'text-amber-400/50',
    accentHex: '#fbbf24'
  },
  milkboy: {
    bgGradient: 'from-pink-200 via-rose-100 to-pink-100',
    bubbleUser: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white',
    bubbleAssistant: 'bg-gradient-to-r from-purple-300 to-pink-300 text-gray-800',
    textColor: 'text-gray-800',
    accentClass: 'text-pink-500',
    accentBgClass: 'bg-pink-500',
    accentRingClass: 'ring-pink-500',
    glowColor: '#fb7185',
    decoration: '💕',
    decorationColor: 'text-pink-400/50',
    accentHex: '#fb7185'
  },
  childhood: {
    bgGradient: 'from-green-100 via-emerald-50 to-teal-100',
    bubbleUser: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    bubbleAssistant: 'bg-gradient-to-r from-green-200 to-emerald-200 text-gray-800',
    textColor: 'text-gray-800',
    accentClass: 'text-emerald-500',
    accentBgClass: 'bg-emerald-500',
    accentRingClass: 'ring-emerald-500',
    glowColor: '#10b981',
    decoration: '🌿',
    decorationColor: 'text-emerald-400/50',
    accentHex: '#10b981'
  },
  genius: {
    bgGradient: 'from-blue-100 via-cyan-50 to-indigo-100',
    bubbleUser: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    bubbleAssistant: 'bg-gradient-to-r from-cyan-200 to-blue-200 text-gray-800',
    textColor: 'text-gray-800',
    accentClass: 'text-blue-500',
    accentBgClass: 'bg-blue-500',
    accentRingClass: 'ring-blue-500',
    glowColor: '#3b82f6',
    decoration: '💡',
    decorationColor: 'text-blue-400/50',
    accentHex: '#3b82f6'
  }
};

const girlAvatarUrl = 'https://s3.bmp.ovh/2026/04/28/qdIv750J.jpg';

const getGirlAvatar = () => {
  return girlAvatarUrl;
};

export default function ChatPage() {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedCharacter = sessionStorage.getItem('selectedCharacter');
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter));
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const extractLocation = (text: string): string | null => {
    const patterns = [
      /在(.+?)(?:的|上|里|边|附近)/,
      /我在(.+)/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1].length > 1) {
        return match[1];
      }
    }
    return null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generatePhoto = async (location: string, char: Character): Promise<string | null> => {
    try {
      const prompt = `帅气的${char.personality}风格的中国男生自拍，在${location}，穿着休闲时尚，表情自然，背景虚化，照片质感，高清写实风格`;
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '2K' })
      });
      const data = await response.json();
      if (data.success && data.imageUrls && data.imageUrls.length > 0) {
        return data.imageUrls[0];
      }
      return null;
    } catch (error) {
      console.error('生成图片失败:', error);
      return null;
    }
  };

  // 语音合成函数 - 直接使用浏览器 Web Speech API
  const synthesizeSpeech = async (text: string, characterId: string): Promise<string | null> => {
    if ('speechSynthesis' in window) {
      // 取消之前的语音
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 获取所有可用语音（确保 voices 已加载）
      const voices = window.speechSynthesis.getVoices();
      
      // 如果还没有加载到语音，尝试等待一下
      if (voices.length === 0) {
        await new Promise(resolve => {
          window.speechSynthesis.onvoiceschanged = resolve;
          setTimeout(resolve, 100); // 超时保护
        });
      }
      
      // 重新获取语音列表
      const availableVoices = window.speechSynthesis.getVoices();
      
      // 角色专属音调配置
      const rolePitchConfig: Record<string, number> = {
        ceoboy: 0.6,      // 霸总：低沉稳重的男声
        milkboy: 1.3,     // 小奶狗：偏高的少年音
        childhood: 0.9,   // 青梅竹马：温柔适中的男声
        genius: 1.1       // 学霸：略带傲娇的少年音
      };
      
      // 角色专属语速配置
      const roleRateConfig: Record<string, number> = {
        ceoboy: 0.75,     // 霸总：语速较慢，沉稳
        milkboy: 1.1,     // 小奶狗：语速稍快，活泼
        childhood: 0.9,   // 青梅竹马：语速适中，温柔
        genius: 1.0       // 学霸：语速正常
      };
      
      // 优先选择中文男声
      const chineseMaleVoice = availableVoices.find(v => 
        (v.lang.startsWith('zh-CN') || v.lang.startsWith('zh') || 
         v.name.includes('Chinese') || v.name.includes('中文')) &&
        (v.name.includes('Male') || v.name.includes('男') || 
         v.name.includes('男声') || v.name.includes('Steven') ||
         v.name.includes('Kangkang') || v.name.includes('Taichi') ||
         v.name.includes('Zhiwei') || v.name.includes('Neeko') ||
         v.lang.includes('-M-'))
      );
      
      // 如果没有找到明确的男声，尝试找中文语音
      const chineseVoice = chineseMaleVoice || availableVoices.find(v => 
        v.lang.startsWith('zh-CN') || v.lang.startsWith('zh') || 
        v.name.includes('Chinese') || v.name.includes('中文')
      );
      
      // 最后兜底：找任意语音
      const fallbackVoice = chineseVoice || availableVoices.find(v => 
        v.lang.startsWith('zh') || v.lang.startsWith('en') ||
        v.lang.startsWith('ja')
      ) || availableVoices[0];
      
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }
      
      utterance.lang = 'zh-CN';
      
      // 根据角色设置音调
      const pitch = rolePitchConfig[characterId] || 1;
      utterance.pitch = pitch;
      
      // 根据角色设置语速
      const rate = roleRateConfig[characterId] || 0.9;
      utterance.rate = rate;
      
      utterance.volume = 0.8;
      
      utterance.onend = () => setIsPlayingAudio(null);
      utterance.onerror = (event) => {
        console.error('语音播放失败:', event.error);
        setIsPlayingAudio(null);
      };
      
      setIsPlayingAudio('speaking');
      window.speechSynthesis.speak(utterance);
      return 'web-speech-api';
    }
    return null;
  };

  const playAudio = (url: string, messageId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlayingAudio(messageId);
    audio.onended = () => setIsPlayingAudio(null);
    audio.onerror = () => setIsPlayingAudio(null);
    audio.play();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !character || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      imageUrl: selectedImage || undefined
    };
    
    const assistantMessageId = (Date.now() + 1).toString();
    const newMessages = [...messages, userMessage, {
      id: assistantMessageId,
      role: 'assistant' as const,
      content: '',
      isLoading: true
    }];
    
    setMessages(newMessages);
    setInputValue('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);
    
    const location = extractLocation(inputValue);
    
    try {
      const messagesHistory = [
        { role: 'system', content: character.systemPrompt },
        ...messages.map(m => ({ 
          role: m.role, 
          content: m.content 
        })),
        { 
          role: 'user', 
          content: selectedImage 
            ? `${inputValue.trim() || '看看我发给你的照片~'} [用户发送了一张照片]` 
            : inputValue.trim() 
        }
      ];
      
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesHistory, temperature: 0.9 })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const llmResponse = data.content || '';
      
      const needsPhoto = llmResponse.includes('[发照片]');
      const cleanResponse = llmResponse.replace('[发照片]', '').trim();
      
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId 
          ? { ...m, content: cleanResponse, isLoading: false }
          : m
      ));
      
      if (cleanResponse) {
        await synthesizeSpeech(cleanResponse, character.id);
      }
      
      if (needsPhoto) {
        setTimeout(async () => {
          const photoUrl = await generatePhoto('自拍', character);
          if (photoUrl) {
            const photoMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: '',
              imageUrl: photoUrl
            };
            setMessages(prev => [...prev, photoMessage]);
          }
        }, 1500);
      }
      
      if (location && character && !needsPhoto) {
        setTimeout(async () => {
          const photoUrl = await generatePhoto(location, character);
          if (photoUrl) {
            const photoMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: '给你看看我在这里的样子~',
              imageUrl: photoUrl
            };
            setMessages(prev => [...prev, photoMessage]);
          }
        }, 1500);
      }
      
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId 
          ? { ...m, content: '抱歉，出了点小问题...', isLoading: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-200">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="text-rose-500" size={40} />
        </motion.div>
      </div>
    );
  }

  // 获取角色主题配置
  const theme = characterThemes[character.id] || characterThemes.milkboy;
  const isDark = character.id === 'ceoboy';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bgGradient} flex flex-col relative overflow-hidden`}>
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 浮动渐变光球 */}
        <motion.div
          className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
            character.id === 'ceoboy' ? 'bg-amber-500/10' :
            character.id === 'milkboy' ? 'bg-pink-300/20' :
            character.id === 'childhood' ? 'bg-emerald-300/20' :
            'bg-blue-300/20'
          }`}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
            character.id === 'ceoboy' ? 'bg-purple-500/10' :
            character.id === 'milkboy' ? 'bg-rose-300/20' :
            character.id === 'childhood' ? 'bg-teal-300/20' :
            'bg-cyan-300/20'
          }`}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* 角色专属漂浮装饰 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${theme.decorationColor}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 15, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          >
            <span className="text-lg">{theme.decoration}</span>
          </motion.div>
        ))}
        
        {/* 闪烁的装饰 */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className={`absolute ${theme.decorationColor}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {character.id === 'ceoboy' ? <span className="text-lg">★</span> : 
             character.id === 'genius' ? <span className="text-lg">◇</span> :
             <span className="text-lg">✦</span>}
          </motion.div>
        ))}
      </div>

      {/* 顶部导航 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 sticky top-0 z-50 backdrop-blur-sm border-b shadow-sm ${
          isDark 
            ? 'bg-gray-900/90 border-gray-700' 
            : 'bg-white/90 border-gray-100'
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <motion.button 
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className={isDark ? 'text-gray-300' : 'text-gray-600'} size={20} />
          </motion.button>
          
          <GlowingEffect 
            glowColor={theme.glowColor}
            intensity="medium"
            className={`relative w-10 h-10 rounded-full overflow-hidden ring-2 ${theme.accentRingClass}/30`}
          >
            <Image
              src={avatarUrls[character.id]}
              alt={character.name}
              fill
              className="object-cover"
              unoptimized
            />
          </GlowingEffect>
          
          <div>
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {character.name}
            </h2>
            <motion.p 
              className={`text-xs ${isDark ? 'text-amber-400' : theme.accentClass}`}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {character.personality} {theme.decoration}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* 聊天消息区域 */}
      <div 
        className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 py-4 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        {/* 欢迎消息 */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-20"
          >
            <GlowingEffect 
              glowColor={theme.glowColor}
              intensity="high"
              className={`relative w-24 h-24 rounded-full overflow-hidden ring-4 mb-4 ${theme.accentRingClass}/30`}
            >
              <Image
                src={avatarUrls[character.id]}
                alt={character.name}
                fill
                className="object-cover"
                unoptimized
              />
            </GlowingEffect>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              和 {character.name} 开始聊天吧 {theme.decoration}
            </h3>
            <motion.p 
              className={`text-sm max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {character.description}
            </motion.p>
            <motion.div
              className="flex gap-1 mt-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className={`w-2 h-2 rounded-full ${theme.accentBgClass}`} />
              <span className={`w-2 h-2 rounded-full ${theme.accentBgClass}`} />
              <span className={`w-2 h-2 rounded-full ${theme.accentBgClass}`} />
            </motion.div>
          </motion.div>
        )}

        {/* 消息列表 */}
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div 
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                  <Image
                    src={avatarUrls[character.id]}
                    alt={character.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              
              <div 
                className={`max-w-[75%] relative ${theme.bubbleUser} ${
                  message.role === 'assistant' ? theme.bubbleAssistant : ''
                } rounded-2xl px-4 py-3 ${
                  message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                } ${message.role === 'assistant' && !isDark ? 'shadow-sm border' : ''}`}
              >
                {message.role === 'user' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/50">
                      <Image
                        src={getGirlAvatar()}
                        alt="我"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                
                {message.imageUrl && (
                  <motion.div 
                    className="mb-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div 
                      className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ width: '192px', height: '192px' }}
                    >
                      <Image
                        src={message.imageUrl}
                        alt="照片"
                        fill
                        className="object-cover rounded-lg"
                        unoptimized
                      />
                    </div>
                  </motion.div>
                )}
                
                <motion.p 
                  className="whitespace-pre-wrap break-words"
                  initial={message.isLoading ? {} : { opacity: 0 }}
                  animate={message.isLoading ? {} : { opacity: 1 }}
                >
                  {message.content || (message.isLoading ? '...' : '')}
                </motion.p>
                
                {message.isLoading && (
                  <span className="ml-2 inline-block">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 size={14} className={isDark ? 'text-amber-300' : 'text-gray-400'} />
                    </motion.div>
                  </span>
                )}
                
                {message.role === 'assistant' && message.audioUrl && (
                  <motion.button
                    onClick={() => playAudio(message.audioUrl!, message.id)}
                    className={`mt-2 flex items-center gap-2 text-sm transition-colors ${
                      isPlayingAudio === message.id 
                        ? isDark ? 'text-amber-400' : theme.accentClass
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    } hover:text-pink-500`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlayingAudio === message.id ? (
                      <motion.div className="flex gap-1" animate={{ scale: [1, 1.2, 1] }}>
                        <motion.span 
                          className={`w-1 h-3 rounded ${theme.accentBgClass}`}
                          animate={{ height: ['3px', '6px', '3px'] }}
                          transition={{ duration: 0.3, repeat: Infinity }}
                        />
                        <motion.span 
                          className={`w-1 h-3 rounded ${theme.accentBgClass}`}
                          animate={{ height: ['3px', '6px', '3px'] }}
                          transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.span 
                          className={`w-1 h-3 rounded ${theme.accentBgClass}`}
                          animate={{ height: ['3px', '6px', '3px'] }}
                          transition={{ duration: 0.3, repeat: Infinity, delay: 0.2 }}
                        />
                      </motion.div>
                    ) : (
                      <Volume2 size={16} />
                    )}
                    <span>{isPlayingAudio === message.id ? '播放中' : '点击播放'}</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`sticky bottom-0 backdrop-blur-sm border-t ${
          isDark 
            ? 'bg-gray-900/90 border-gray-700' 
            : 'bg-white/90 border-gray-100'
        }`}
      >
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto px-4 pt-3"
          >
            <div className="relative inline-block">
              <div className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${theme.accentRingClass}/30`}>
                <Image
                  src={selectedImage}
                  alt="预览"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <motion.button
                onClick={removeSelectedImage}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
        
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-full transition-colors disabled:opacity-50 ${
                isDark 
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <ImagePlus size={20} />
            </motion.button>
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`和 ${character.name} 说点什么...`}
              className={`flex-1 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 max-h-32 ${
                isDark 
                  ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-amber-500/50' 
                  : `bg-gray-50 text-gray-800 placeholder-gray-400 ${theme.accentRingClass}/30`
              }`}
              rows={1}
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={(!inputValue.trim() && !selectedImage) || isLoading}
              whileHover={inputValue.trim() || selectedImage ? { scale: 1.05 } : {}}
              whileTap={inputValue.trim() || selectedImage ? { scale: 0.95 } : {}}
              className={`p-3 rounded-full transition-all ${
                (inputValue.trim() || selectedImage) && !isLoading
                  ? `${character.id === 'ceoboy' ? 'bg-gradient-to-r from-amber-500 to-purple-500' : 
                     character.id === 'milkboy' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                     character.id === 'childhood' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                     'bg-gradient-to-r from-blue-500 to-indigo-500'} text-white hover:shadow-lg`
                  : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isUploading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 size={20} />
                </motion.div>
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
