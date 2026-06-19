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
  LogOut // 추가
} from 'lucide-react';

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
  onExitChat // 추가
}) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      alert(`[드롭 파일 전송 완료]: ${files[0].name} (${(files[0].size/1024).toFixed(1)} KB)`);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      alert(`[파일 첨부 완료]: ${files[0].name} (${(files[0].size/1024).toFixed(1)} KB)`);
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
              const isAi = msg.sender === 'youngja';
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
                          backgroundColor: isAi ? '#ffece6' : (msg.avatarColor || '#3f4248'),
                          cursor: 'pointer'
                        }}
                      >
                        {isAi ? (
                          <Bot size={20} style={{ color: '#ff6b00' }} />
                        ) : (
                          msg.senderName?.charAt(0)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble Column */}
                  <div style={{
                    ...styles.bubbleCol,
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}>
                    {/* Sender Name & Time */}
                    {!isMe && (
                      <div style={styles.senderMeta}>
                        <span 
                          onClick={() => onUserClick && onUserClick(msg.sender)}
                          style={{
                            ...styles.senderName,
                            color: isAi ? '#ff6b00' : 'var(--text-primary)',
                            fontWeight: isAi ? '600' : '500',
                            cursor: 'pointer'
                          }}
                        >
                          {isAi ? (currentWorkspace === 'vietqs' ? '✨ AI Tư vấn Chi phí XD (Dongmyung)' : '✨ AI 공사비 컨설팅 CEO (동명)') : msg.senderName}
                        </span>
                        <span style={styles.msgTime}>{msg.time}</span>
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div 
                      id={`msg-${msg.id}`}
                      style={{
                        ...styles.bubble,
                        backgroundColor: isCurrentMatch
                          ? 'rgba(255, 107, 0, 0.45)'
                          : isMatched
                            ? 'rgba(255, 107, 0, 0.2)'
                            : (isMe 
                              ? (currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)')
                              : 'var(--bg-secondary)'),
                        color: isMe ? '#ffffff' : 'var(--text-primary)',
                        borderBottomRightRadius: isMe ? '2px' : '10px',
                        borderBottomLeftRadius: isMe ? '10px' : '2px',
                        border: isCurrentMatch 
                          ? '1px solid #ff6b00' 
                          : (isMe ? 'none' : '1px solid var(--border-light)'),
                        boxShadow: isCurrentMatch 
                          ? '0 0 10px rgba(255, 107, 0, 0.4)' 
                          : '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'background-color 0.2s, border 0.2s, box-shadow 0.2s'
                      }}
                    >
                      <div style={styles.msgText}>{msg.content}</div>

                      {/* Display AI Character Image if present */}
                      {msg.youngjaImageUrl && (
                        <div style={styles.aiImgContainer}>
                          <img 
                            src={msg.youngjaImageUrl} 
                            alt="AI 영자 이미지" 
                            style={styles.aiImg} 
                          />
                        </div>
                      )}
                    </div>

                    {isMe && (
                      <div style={styles.myTimeMeta}>
                        <Check size={12} style={{ color: 'var(--text-muted)', marginRight: '4px' }} />
                        <span style={styles.msgTime}>{msg.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={styles.msgRow} className="animate-fade">
              <div style={styles.avatarWrapper}>
                <div style={{ ...styles.avatar, backgroundColor: '#ffece6' }}>
                  <Bot size={20} style={{ color: '#ff6b00' }} />
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
            {['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬'].map(emoji => (
              <button 
                type="button" 
                key={emoji} 
                className="picker-emoji-btn"
                style={styles.pickerEmojiBtn} 
                onClick={() => addEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
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
    height: '200px',
    borderRadius: 'var(--radius-lg)',
    padding: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '6px',
    overflowY: 'auto',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    zIndex: 100,
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
