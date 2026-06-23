import React, { useState, useRef, useEffect } from 'react';
import { 
   Send, 
   Paperclip, 
   Smile, 
   Search, 
   Phone, 
   Video, 
   MoreVertical, 
   Hash, 
   Bot, 
   Image as ImageIcon,
   Check,
   Menu,
   UserPlus,
   LogOut,
   Copy,
   Forward,
   Globe,
   Star
} from 'lucide-react';
import ceoDongmyungImg from '../assets/ceo_dongmyung.png';

const YOUNGJA_IMAGES = {
  hello: "https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_hello.png",
  thumbsup: "https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_thumbsup.png",
  success: "https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_success.png",
  thinking: "https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_thinking.png",
  idea: "https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_idea.png",
  working: "https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_working.png",
  presenting: "https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_presenting.png",
  panic: "https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_panic.png"
};

export default function ChatArea({ 
  activeChat, 
  chatTitle, 
  messages, 
  onSendMessage, 
  isTyping,
  onToggleSidebar,
  currentWorkspace,
  onUserClick,
  onOpenInviteModal,
  onExitChat,
  onForwardMessage,
  channels = [],
  dms = [],
  favoritedChats = [],
  onToggleFavorite,
  onToggleMessageReaction,
  currentUser
}) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [translatingIds, setTranslatingIds] = useState(new Set());
  const [pickerTab, setPickerTab] = useState('emoji');
  const messagesEndRef = useRef(null);

  // 호버 및 편의기능(복사/전달) 상태
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [messageToForward, setMessageToForward] = useState('');
  const [selectedForwardTarget, setSelectedForwardTarget] = useState(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // 대화 내역 검색용 상태
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIdx, setCurrentMatchIdx] = useState(-1);
  const [matchingMsgIds, setMatchingMsgIds] = useState([]);

  // 대화방 내 검색 로직
  useEffect(() => {
    if (!searchQuery.trim() || !showSearchBar) {
      setMatchingMsgIds([]);
      setCurrentMatchIdx(-1);
      return;
    }
    const query = searchQuery.toLowerCase();
    const ids = messages
      .filter(msg => msg.content && msg.content.toLowerCase().includes(query))
      .map(msg => msg.id);
    setMatchingMsgIds(ids);
    if (ids.length > 0) {
      setCurrentMatchIdx(0);
    } else {
      setCurrentMatchIdx(-1);
    }
  }, [searchQuery, messages, showSearchBar]);

  // currentMatchIdx가 바뀔 때 해당 메시지로 스크롤
  useEffect(() => {
    if (currentMatchIdx >= 0 && matchingMsgIds.length > 0) {
      const activeId = matchingMsgIds[currentMatchIdx];
      const element = document.getElementById(`msg-${activeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatchIdx, matchingMsgIds]);

  const handleNextSearch = () => {
    if (matchingMsgIds.length === 0) return;
    setCurrentMatchIdx(prev => (prev + 1) % matchingMsgIds.length);
  };

  const handlePrevSearch = () => {
    if (matchingMsgIds.length === 0) return;
    setCurrentMatchIdx(prev => (prev - 1 + matchingMsgIds.length) % matchingMsgIds.length);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDownloadFile = (fileName, fileData) => {
    try {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('File download failed:', err);
      alert('파일 다운로드 처리에 실패했습니다.');
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const processFile = (file) => {
    if (file.size > 25 * 1024 * 1024) {
      alert('최대 25MB 이하의 파일만 업로드할 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onSendMessage(null, null, {
        fileName: file.name,
        fileSize: formatBytes(file.size),
        fileData: reader.result,
        fileType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
      e.target.value = '';
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const addEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleTranslate = async (msgId, text, hasRealtimeTrans = false) => {
    const isShowing = (translatedMessages[msgId] && translatedMessages[msgId] !== 'hide') || (!translatedMessages[msgId] && hasRealtimeTrans);
    
    if (isShowing) {
      setTranslatedMessages(prev => ({
        ...prev,
        [msgId]: 'hide'
      }));
      return;
    }

    if (translatedMessages[msgId] === 'hide' && hasRealtimeTrans) {
      setTranslatedMessages(prev => {
        const next = { ...prev };
        delete next[msgId];
        return next;
      });
      return;
    }

    const apiKey = localStorage.getItem('gemini_api_key') || '';
    if (!apiKey) {
      alert('⚙️ 설정에서 Gemini API Key를 등록해야 번역 기능이 작동합니다.');
      return;
    }

    const model = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';

    setTranslatingIds(prev => {
      const next = new Set(prev);
      next.add(msgId);
      return next;
    });

    const promptText = `너는 다국어 번역기이다. 아래 입력 텍스트를 감지하여 적절하게 번역해라.
- 만약 한국어(Korean)인 경우: 영어(English)와 베트남어(Vietnamese)로 번역해라.
- 만약 베트남어(Vietnamese)인 경우: 한국어(Korean)와 영어(English)로 번역해라.
- 만약 영어(English)인 경우: 한국어(Korean)와 베트남어(Vietnamese)로 번역해라.

결과는 반드시 아래의 포맷으로만 응답하고 다른 부연설명은 절대 하지 마라:
[🇺🇸 English]: <영어 번역본>
[🇻🇳 Tiếng Việt]: <베트남어 번역본>
(만약 입력 언어에 영어나 베트남어가 포함된다면, 타겟에 맞추어 [🇰🇷 한국어] 등으로 언어 이름을 표시해라.)

입력 텍스트:
"${text}"`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) throw new Error('Gemini API translation call failed');
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const resultText = data.candidates[0].content.parts[0].text.trim();
        setTranslatedMessages(prev => ({ ...prev, [msgId]: resultText }));
      } else {
        alert('번역 실패 (API 응답 에러)');
      }
    } catch (err) {
      console.error('Translation error:', err);
      alert('네트워크 오류가 발생했거나 API Key가 올바르지 않습니다.');
    } finally {
      setTranslatingIds(prev => {
        const next = new Set(prev);
        next.delete(msgId);
        return next;
      });
    }
  };

  const handleSendSticker = (imageUrl) => {
    onSendMessage('', imageUrl);
    setShowEmojiPicker(false);
  };

  const quickEmojis = ['👍', '✨', '🔥', '😂', '👀', '💡', '🎨', '💖'];

  return (
    <div style={styles.container}>
      {/* Chat Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button className="chat-menu-btn close-btn" style={styles.menuBtn} onClick={onToggleSidebar} title="메뉴 열기/닫기">
            <Menu size={20} />
          </button>
          <div style={styles.titleWrapper}>
            {activeChat.type === 'channel' && <Hash size={18} style={styles.headerIcon} />}
            {activeChat.type === 'ai' && <Bot size={18} style={{ ...styles.headerIcon, color: '#ff007f' }} />}
            <span style={styles.titleText}>{chatTitle}</span>
          </div>
          {activeChat.type !== 'ai' && (
            <span style={styles.memberCount}>
              {activeChat.type === 'channel' ? '• 멤버 8명' : '• 1:1 대화'}
            </span>
          )}
        </div>

        <div style={styles.headerRight}>
          {activeChat.type !== 'ai' && (
            <button 
              className="header-btn" 
              style={styles.headerBtn} 
              title="사용자 초대"
              onClick={onOpenInviteModal}
            >
              <UserPlus size={18} />
            </button>
          )}
          <button 
            className="header-btn" 
            style={{ ...styles.headerBtn, color: showSearchBar ? 'var(--primary)' : 'var(--text-secondary)' }} 
            onClick={() => setShowSearchBar(!showSearchBar)} 
            title="검색"
          >
            <Search size={18} />
          </button>
          {activeChat.type !== 'ai' && (
            <button 
              className="header-btn" 
              style={{
                ...styles.headerBtn,
                color: (activeChat.type === 'channel' && (activeChat.id === 'general' || activeChat.id === 'notice'))
                  ? 'var(--text-muted)'
                  : 'var(--danger)',
                opacity: (activeChat.type === 'channel' && (activeChat.id === 'general' || activeChat.id === 'notice'))
                  ? 0.5
                  : 1,
                cursor: (activeChat.type === 'channel' && (activeChat.id === 'general' || activeChat.id === 'notice'))
                  ? 'not-allowed'
                  : 'pointer'
              }}
              title={
                (activeChat.type === 'channel' && (activeChat.id === 'general' || activeChat.id === 'notice'))
                  ? "기본 채널은 나갈 수 없습니다"
                  : "대화방 나가기"
              }
              onClick={() => {
                if (activeChat.type === 'channel' && (activeChat.id === 'general' || activeChat.id === 'notice')) {
                  alert("기본 채널은 나갈 수 없습니다.");
                  return;
                }
                if (confirm("정말로 이 대화방을 나가시겠습니까?")) {
                  onExitChat(activeChat);
                }
              }}
            >
              <LogOut size={18} />
            </button>
          )}
          <button className="header-btn" style={styles.headerBtn} title="음성 통화"><Phone size={18} /></button>
          <button className="header-btn" style={styles.headerBtn} title="화상 통화"><Video size={18} /></button>
          <button className="header-btn" style={styles.headerBtn} title="더보기"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* 대화방 내 특정 문자 찾기(검색) 바 */}
      {showSearchBar && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 20px',
          backgroundColor: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-light)',
          animation: 'slideDown 0.25s ease'
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="대화방 내 검색어 입력..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
            autoFocus
          />
          {matchingMsgIds.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {currentMatchIdx + 1} / {matchingMsgIds.length}
            </span>
          )}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button"
              onClick={handlePrevSearch}
              disabled={matchingMsgIds.length === 0}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: matchingMsgIds.length === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                fontSize: '0.75rem',
                cursor: matchingMsgIds.length === 0 ? 'default' : 'pointer'
              }}
            >
              이전
            </button>
            <button 
              type="button"
              onClick={handleNextSearch}
              disabled={matchingMsgIds.length === 0}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: matchingMsgIds.length === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                fontSize: '0.75rem',
                cursor: matchingMsgIds.length === 0 ? 'default' : 'pointer'
              }}
            >
              다음
            </button>
          </div>
          <button 
            type="button"
            onClick={() => {
              setShowSearchBar(false);
              setSearchQuery('');
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            닫기
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div style={styles.feed}>
        <div style={styles.feedInner}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <h4>이곳이 대화의 시작점입니다!</h4>
              <p>첫 메시지를 전송하여 새로운 대화를 시작해보세요.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCeoBot = msg.sender === 'ceo-bot';
              const isYoungja = msg.sender === 'youngja';
              const isMe = msg.sender === 'me';
              const isMatched = matchingMsgIds.includes(msg.id);
              const isCurrentMatch = isMatched && matchingMsgIds[currentMatchIdx] === msg.id;
              
              return (
                <div 
                  key={msg.id || index} 
                  style={{
                    ...styles.msgRow,
                    justifyContent: isMe ? 'flex-end' : 'flex-start'
                  }}
                  className="animate-fade"
                >
                  {/* Sender Avatar (if not me) */}
                  {!isMe && (
                    <div style={styles.avatarWrapper}>
                      <div 
                        onClick={() => onUserClick && onUserClick(msg.sender)}
                        style={{
                          ...styles.avatar,
                          backgroundColor: (isCeoBot || isYoungja) ? '#ffece6' : (msg.avatarColor || '#3f4248'),
                          cursor: 'pointer',
                          overflow: 'hidden'
                        }}
                      >
                        {isCeoBot ? (
                          <img 
                            src={ceoDongmyungImg} 
                            alt="CEO" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : isYoungja ? (
                          <img 
                            src={YOUNGJA_IMAGES.hello} 
                            alt="Youngja" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          msg.senderName?.charAt(0)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble Column */}
                  <div 
                    style={{
                      ...styles.bubbleCol,
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      position: 'relative' // 툴바 배치 기준
                    }}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {/* Sender Name */}
                    {!isMe && (
                      <div style={styles.senderMeta}>
                        <span 
                          onClick={() => onUserClick && onUserClick(msg.sender)}
                          style={{
                            ...styles.senderName,
                            color: (isCeoBot || isYoungja) ? '#ff6b00' : 'var(--text-primary)',
                            fontWeight: (isCeoBot || isYoungja) ? '600' : '500',
                            cursor: 'pointer'
                          }}
                        >
                          {isCeoBot ? (currentWorkspace === 'vietqs' ? '✨ AI Tư vấn Chi phí XD (Dongmyung)' : '✨ AI 공사비 컨설팅 CEO (동명)') : msg.senderName}
                        </span>
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div 
                      id={`msg-${msg.id}`}
                      style={{
                        ...styles.bubble,
                        backgroundColor: (msg.youngjaImageUrl && !msg.content)
                          ? 'transparent'
                          : isCurrentMatch
                            ? 'rgba(255, 107, 0, 0.45)'
                            : isMatched
                              ? 'rgba(255, 107, 0, 0.2)'
                              : (isMe 
                                ? '#e1f3fc' // 네이버웍스 내 말풍선 (연한 하늘색)
                                : '#f2f3f5'), // 네이버웍스 상대 말풍선 (연한 회색)
                        color: '#1e1e1e', // 눈이 편안한 다크그레이 텍스트로 고정
                        borderBottomRightRadius: isMe ? '2px' : '10px',
                        borderBottomLeftRadius: isMe ? '10px' : '2px',
                        border: (msg.youngjaImageUrl && !msg.content)
                          ? 'none'
                          : isCurrentMatch 
                            ? '1px solid #ff6b00' 
                            : (isMe ? '1px solid #c7e5f5' : '1px solid #e4e6eb'),
                        boxShadow: (msg.youngjaImageUrl && !msg.content)
                          ? 'none'
                          : (hoveredMsgId === msg.id)
                            ? '0 4px 12px rgba(0,0,0,0.08)' // 호버 시 그림자
                            : '0 2px 4px rgba(0,0,0,0.02)',
                        transform: (hoveredMsgId === msg.id && !(msg.youngjaImageUrl && !msg.content))
                          ? 'translateY(-1px)' // 호버 시 입체 업 무브먼트
                          : 'none',
                        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                        padding: (msg.youngjaImageUrl && !msg.content) ? '0' : '10px 14px'
                      }}
                    >
                      {msg.content && <div style={styles.msgText}>{msg.content}</div>}

                      {/* 파일 첨부 및 프리뷰/다운로드 */}
                      {msg.fileName && msg.fileData && (
                        msg.fileType && msg.fileType.startsWith('image/') ? (
                          <img 
                            src={msg.fileData} 
                            alt={msg.fileName} 
                            style={{ 
                              maxWidth: '240px', 
                              maxHeight: '180px', 
                              borderRadius: '8px', 
                              cursor: 'pointer', 
                              marginTop: '6px', 
                              display: 'block',
                              border: '1px solid var(--border-light)' 
                            }} 
                            onClick={() => handleDownloadFile(msg.fileName, msg.fileData)} 
                          />
                        ) : (
                          <div 
                            onClick={() => handleDownloadFile(msg.fileName, msg.fileData)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border)',
                              cursor: 'pointer',
                              marginTop: '6px',
                              transition: 'background-color 0.2s',
                              maxWidth: '300px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-active)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                          >
                            <div style={{ fontSize: '1.5rem' }}>📄</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {msg.fileName}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {msg.fileSize || '0 Bytes'}
                              </div>
                            </div>
                          </div>
                        )
                      )}

                      {/* Display AI Character Image if present */}
                      {msg.youngjaImageUrl && (
                        <div style={{
                          ...styles.aiImgContainer,
                          maxWidth: (msg.youngjaImageUrl && !msg.content) ? '120px' : '220px',
                          marginTop: msg.content ? '10px' : '0'
                        }}>
                          <img 
                            src={msg.youngjaImageUrl} 
                            alt="AI 영자 이미지" 
                            style={styles.aiImg} 
                          />
                        </div>
                      )}

                      {/* 번역 텍스트 */}
                      {translatedMessages[msg.id] !== 'hide' && (translatedMessages[msg.id] || msg.translation) && (
                        <div style={{
                          marginTop: '6px',
                          paddingTop: '6px',
                          borderTop: isMe ? '1px dashed rgba(0,0,0,0.15)' : '1px dashed #e4e6eb',
                          fontSize: '0.825rem',
                          lineHeight: '1.45',
                          whiteSpace: 'pre-wrap',
                          color: '#555555'
                        }}>
                          {translatedMessages[msg.id] && translatedMessages[msg.id] !== 'hide' ? translatedMessages[msg.id] : msg.translation}
                        </div>
                      )}
                      {translatingIds.has(msg.id) && (
                        <div style={{
                          marginTop: '6px',
                          paddingTop: '6px',
                          borderTop: isMe ? '1px dashed rgba(0,0,0,0.15)' : '1px dashed #e4e6eb',
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                          opacity: 0.8,
                          color: '#888888'
                        }}>
                          ⚡ 번역 중...
                        </div>
                      )}
                    </div>

                    {/* 복사 완료 툴팁 */}
                    {copiedMsgId === msg.id && (
                      <div style={{
                        position: 'absolute',
                        top: '-32px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#323232',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        zIndex: 20,
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        animation: 'fadeIn 0.15s ease-out'
                      }}>
                        복사 완료! 📋
                      </div>
                    )}

                    {/* 리액션 배지 목록 */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        marginTop: '4px',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}>
                        {Object.entries(
                          msg.reactions.reduce((acc, curr) => {
                            if (!curr || typeof curr !== 'string') return acc;
                            const parts = curr.split(':');
                            const emoji = parts[0];
                            const userName = parts[2];
                            if (emoji && userName) {
                              if (!acc[emoji]) acc[emoji] = [];
                              acc[emoji].push(userName);
                            }
                            return acc;
                          }, {})
                        ).map(([emoji, users]) => {
                          const hasMyReaction = msg.reactions.some(r => r && typeof r === 'string' && r.startsWith(`${emoji}:${currentUser?.id || 'me'}:`));
                          return (
                            <div 
                              key={emoji}
                              title={users.join(', ')}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleMessageReaction) {
                                  onToggleMessageReaction(msg.id, emoji);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                backgroundColor: hasMyReaction ? 'rgba(255, 107, 0, 0.08)' : 'var(--bg-secondary)',
                                border: `1px solid ${hasMyReaction ? '#ff6b00' : 'var(--border)'}`,
                                borderRadius: '12px',
                                padding: '2px 8px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                userSelect: 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>{emoji}</span>
                              <span style={{ fontWeight: '600', color: hasMyReaction ? '#ff6b00' : 'var(--text-secondary)' }}>{users.length}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 말풍선 하단 시간 + 호버 아이콘들 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '4px',
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      minHeight: '20px'
                    }}>
                      {isMe && <Check size={12} style={{ color: 'var(--text-muted)' }} />}
                      <span style={styles.msgTime}>{msg.time}</span>
                      
                      {/* 마우스오버 시 표시되는 5개 호버 버튼 툴바 */}
                      {hoveredMsgId === msg.id && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginLeft: isMe ? '0' : '8px',
                          marginRight: isMe ? '8px' : '0',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '20px',
                          padding: '2px 8px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          animation: 'fadeIn 0.15s ease'
                        }}>
                          {/* 1. 번역/메뉴 (☰) */}
                          <button 
                            type="button"
                            title="번역"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTranslate(msg.id, msg.content || '', !!msg.translation);
                            }}
                            style={styles.lowerToolBtn}
                          >
                            <Menu size={11} />
                          </button>

                          {/* 2. 복사 (📋) */}
                          <button 
                            type="button"
                            title="복사"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(msg.content || msg.fileName || '');
                              setCopiedMsgId(msg.id);
                              setTimeout(() => setCopiedMsgId(null), 1200);
                            }}
                            style={styles.lowerToolBtn}
                          >
                            <Copy size={11} />
                          </button>

                          {/* 3. 전달 (➡️) */}
                          <button 
                            type="button"
                            title="전달"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessageToForward(msg.content || msg.fileName || '첨부파일');
                              setIsForwardModalOpen(true);
                              setSelectedForwardTarget(null);
                            }}
                            style={styles.lowerToolBtn}
                          >
                            <Forward size={11} />
                          </button>

                          {/* 4. 상태 이모티콘 남기기 (❤️) */}
                          <button 
                            type="button"
                            title="리액션 남기기"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleMessageReaction) {
                                onToggleMessageReaction(msg.id, '❤️');
                              }
                            }}
                            style={{
                              ...styles.lowerToolBtn,
                              color: (msg.reactions && msg.reactions.some(r => r.startsWith('❤️:'))) ? 'var(--danger)' : 'var(--text-secondary)'
                            }}
                          >
                            <span style={{ fontSize: '10px', display: 'flex', alignItems: 'center' }}>❤️</span>
                          </button>

                          {/* 5. 즐겨찾기 채팅 등록 (⭐) */}
                          <button 
                            type="button"
                            title="채팅방 즐겨찾기"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleFavorite) {
                                onToggleFavorite(activeChat.id);
                              }
                            }}
                            style={{
                              ...styles.lowerToolBtn,
                              color: favoritedChats && favoritedChats.includes(activeChat.id) ? '#ffcc00' : 'var(--text-secondary)'
                            }}
                          >
                            <Star size={11} fill={favoritedChats && favoritedChats.includes(activeChat.id) ? '#ffcc00' : 'none'} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={styles.msgRow} className="animate-fade">
              <div style={styles.avatarWrapper}>
                <div style={{ ...styles.avatar, backgroundColor: 'transparent', overflow: 'hidden' }}>
                  <img 
                    src={ceoDongmyungImg} 
                    alt="CEO" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              </div>
              <div style={styles.bubbleCol}>
                <div style={styles.senderMeta}>
                  <span style={{ ...styles.senderName, color: '#ff6b00', fontWeight: '600' }}>
                    {currentWorkspace === 'vietqs' ? '✨ AI Tư vấn Chi phí XD (Dongmyung)' : '✨ AI 공사비 컨설팅 CEO (동명)'}
                  </span>
                </div>
                <div style={styles.typingBubble}>
                  <div style={styles.typingDot} />
                  <div style={{ ...styles.typingDot, animationDelay: '0.2s' }} />
                  <div style={{ ...styles.typingDot, animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input Area */}
      <form 
        onSubmit={handleSubmit} 
        style={{
          ...styles.inputArea,
          position: 'relative',
          border: isDragging 
            ? `2.5px dashed ${currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)'}` 
            : '1px solid var(--border-light)',
          backgroundColor: isDragging 
            ? (currentWorkspace === 'concost' ? 'rgba(255, 107, 0, 0.05)' : 'rgba(0, 122, 255, 0.05)')
            : 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          margin: '0 20px 20px 20px',
          transition: 'all var(--transition-fast)'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: currentWorkspace === 'concost' ? 'rgba(255, 107, 0, 0.08)' : 'rgba(0, 122, 255, 0.08)',
            border: `2px dashed ${currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)'}`,
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            📥 파일을 여기에 놓으세요! (Drop files here)
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
        {/* Quick Emoji bar */}
        <div style={styles.quickEmojiBar}>
          {quickEmojis.map(emoji => (
            <button 
              type="button" 
              key={emoji} 
              className="quick-emoji-btn"
              style={styles.quickEmojiBtn} 
              onClick={() => addEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Text Input Row */}
        <div style={styles.inputRow}>
          <button 
            type="button" 
            className="header-btn" 
            style={styles.inputActionBtn} 
            title="파일 업로드"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} />
          </button>
          <button 
            type="button" 
            className="header-btn" 
            style={styles.inputActionBtn} 
            title="이미지 업로드"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={20} />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              activeChat.type === 'ai' 
                ? (currentWorkspace === 'vietqs' ? "AI 챗봇 동명에게 질문해보세요... (예: 'Tư vấn chi phí xây dựng')" : "AI 챗봇 동명 회장님께 질문해보세요! (예: '공사비 적산 및 메신저 사용 규정 알려줘')")
                : `${chatTitle}에 메시지 전송...`
            }
            style={styles.textarea}
            rows={1}
          />

          <button 
            type="button" 
            className="header-btn"
            style={{
              ...styles.inputActionBtn,
              color: showEmojiPicker ? 'var(--primary)' : 'var(--text-secondary)'
            }} 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="이모지 선택"
          >
            <Smile size={20} />
          </button>

          <button 
            type="submit" 
            disabled={!inputText.trim()}
            style={{
              ...styles.sendBtn,
              backgroundColor: inputText.trim() 
                ? (currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)')
                : 'var(--border-light)',
              color: inputText.trim() ? '#ffffff' : 'var(--text-muted)',
              cursor: inputText.trim() ? 'pointer' : 'default'
            }}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div style={styles.emojiPicker} className="glass-panel animate-scale">
            {/* 탭 헤더 */}
            <div style={styles.pickerTabContainer}>
              <button 
                type="button"
                onClick={() => setPickerTab('emoji')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: pickerTab === 'emoji' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: pickerTab === 'emoji' ? 'bold' : 'normal',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderBottom: pickerTab === 'emoji' ? '2px solid var(--primary)' : 'none'
                }}
              >
                기본 이모지
              </button>
              <button 
                type="button"
                onClick={() => setPickerTab('sticker')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: pickerTab === 'sticker' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: pickerTab === 'sticker' ? 'bold' : 'normal',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderBottom: pickerTab === 'sticker' ? '2px solid var(--primary)' : 'none'
                }}
              >
                영자 스티커
              </button>
            </div>

            {/* 탭 컨텐츠 */}
            <div style={styles.pickerContent}>
              {pickerTab === 'emoji' ? (
                ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬'].map(emoji => (
                  <button 
                    type="button" 
                    key={emoji} 
                    className="picker-emoji-btn"
                    style={styles.pickerEmojiBtn} 
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))
              ) : (
                Object.keys(YOUNGJA_IMAGES).map(key => (
                  <button 
                    type="button" 
                    key={key} 
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => handleSendSticker(YOUNGJA_IMAGES[key])}
                    title={key}
                  >
                    <img 
                      src={YOUNGJA_IMAGES[key]} 
                      alt={key} 
                      style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                    />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </form>

      {/* 메시지 전달(Forward) 모달 */}
      {isForwardModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            width: '420px',
            maxWidth: '90%',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
                {currentWorkspace === 'vietqs' ? 'Chuyển tiếp tin nhắn' : '메시지 전달'}
              </span>
              <button 
                type="button"
                onClick={() => setIsForwardModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold' }}
              >
                {currentWorkspace === 'vietqs' ? 'Đóng' : '닫기'}
              </button>
            </div>

            {/* Content Preview */}
            <div style={{
              padding: '14px 20px',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {currentWorkspace === 'vietqs' ? 'Nội dung tin nhắn:' : '전달할 메시지:'}
              </div>
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontStyle: 'italic',
                color: 'var(--text-primary)'
              }}>
                "{messageToForward}"
              </div>
            </div>

            {/* Target List */}
            <div style={{
              padding: '16px 20px',
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Channels */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {currentWorkspace === 'vietqs' ? 'Kênh' : '채널'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {channels.map(chan => {
                    const isSelected = selectedForwardTarget?.type === 'channel' && selectedForwardTarget?.id === chan.id;
                    return (
                      <button
                        type="button"
                        key={chan.id}
                        onClick={() => setSelectedForwardTarget({ type: 'channel', id: chan.id, name: chan.name })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid ' + (isSelected ? (currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)') : 'transparent'),
                          backgroundColor: isSelected ? 'var(--bg-active)' : 'transparent',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          fontSize: '0.85rem'
                        }}
                      >
                        <Hash size={14} style={{ color: isSelected ? (currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)') : 'var(--text-muted)' }} />
                        <span>{chan.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DMs */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {currentWorkspace === 'vietqs' ? 'Tin nhắn cá nhân' : '1:1 대화 상대'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {dms.map(dm => {
                    const isSelected = selectedForwardTarget?.type === 'dm' && selectedForwardTarget?.id === dm.id;
                    return (
                      <button
                        type="button"
                        key={dm.id}
                        onClick={() => setSelectedForwardTarget({ type: 'dm', id: dm.id, name: dm.name })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid ' + (isSelected ? (currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)') : 'transparent'),
                          backgroundColor: isSelected ? 'var(--bg-active)' : 'transparent',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          backgroundColor: dm.avatarColor || 'var(--bg-hover)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 'bold'
                        }}>
                          {dm.name.charAt(0)}
                        </div>
                        <span>{dm.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <button
                type="button"
                onClick={() => setIsForwardModalOpen(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {currentWorkspace === 'vietqs' ? 'Hủy bỏ' : '취소'}
              </button>
              <button
                type="button"
                disabled={!selectedForwardTarget}
                onClick={() => {
                  if (selectedForwardTarget && onForwardMessage) {
                    onForwardMessage(selectedForwardTarget, messageToForward);
                    setIsForwardModalOpen(false);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: selectedForwardTarget 
                    ? (currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)')
                    : 'var(--border-light)',
                  color: selectedForwardTarget ? '#ffffff' : 'var(--text-muted)',
                  cursor: selectedForwardTarget ? 'pointer' : 'default',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                {currentWorkspace === 'vietqs' ? 'Chuyển tiếp' : '전달하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  lowerToolBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '3px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    width: '18px',
    height: '18px'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    backgroundColor: 'var(--bg-primary)',
  },
  header: {
    padding: '0 20px',
    height: '60px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-secondary)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  menuBtn: {
    color: 'var(--text-secondary)',
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    marginRight: '4px',
    display: 'flex',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerIcon: {
    color: 'var(--text-secondary)',
  },
  titleText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  memberCount: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerBtn: {
    color: 'var(--text-secondary)',
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feed: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  feedInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minHeight: '100%',
    justifyContent: 'flex-end',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%',
    padding: '40px 20px',
    color: 'var(--text-secondary)',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
    opacity: 0.6,
  },
  msgRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    maxWidth: '85%',
  },
  avatarWrapper: {
    flexShrink: 0,
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  bubbleCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxWidth: 'calc(100% - 50px)',
  },
  senderMeta: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  senderName: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
  },
  msgTime: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  bubble: {
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.925rem',
    lineHeight: '1.45',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  msgText: {
    // Normal text styles
  },
  myTimeMeta: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
  },
  aiImgContainer: {
    marginTop: '10px',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '220px',
  },
  aiImg: {
    width: '100%',
    display: 'block',
    objectFit: 'cover',
  },
  typingBubble: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    padding: '12px 16px',
    borderRadius: '10px',
    borderBottomLeftRadius: '2px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    width: 'fit-content',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  typingDot: {
    width: '6px',
    height: '6px',
    backgroundColor: 'var(--text-secondary)',
    borderRadius: '50%',
    animation: 'fadeIn 1s infinite alternate',
  },
  inputArea: {
    padding: '12px 20px 20px 20px',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  quickEmojiBar: {
    display: 'flex',
    gap: '6px',
  },
  quickEmojiBtn: {
    fontSize: '1rem',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '6px 10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  inputActionBtn: {
    color: 'var(--text-secondary)',
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textarea: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    resize: 'none',
    fontSize: '0.95rem',
    lineHeight: '1.4',
    padding: '8px 4px',
    maxHeight: '120px',
    outline: 'none',
  },
  sendBtn: {
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
  emojiPicker: {
    position: 'absolute',
    bottom: '80px',
    right: '20px',
    width: '320px',
    height: '240px',
    borderRadius: 'var(--radius-lg)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    zIndex: 100,
  },
  pickerTabContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '8px',
    marginBottom: '8px',
  },
  pickerContent: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
    overflowY: 'auto',
  },
  pickerEmojiBtn: {
    fontSize: '1.25rem',
    padding: '4px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
