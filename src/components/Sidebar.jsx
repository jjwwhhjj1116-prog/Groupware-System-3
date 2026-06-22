import { 
  Hash, 
  MessageSquare, 
  Plus, 
  Bot, 
  ChevronDown, 
  Settings, 
  Sun, 
  Moon,
  Mail,
  Calendar,
  Layers,
  Clock,
  Cloud,
  CheckCircle,
  Megaphone,
  Folder,
  Star,
  Trash2,
  AlertCircle,
  Users,
  Home
} from 'lucide-react';
import concostVert from '../assets/concost_logo_vert.png';
import vietqsLogo from '../assets/vietqs_logo.png';

import { getUserRoleLevel, getRoleLabel } from '../utils/permission'; // 권한 관리 유틸 임포트

export default function Sidebar({ 
  currentWorkspace, 
  onWorkspaceChange, 
  currentMenu,
  onMenuChange,
  channels, 
  dms, 
  activeChat, 
  onActiveChatChange, 
  onOpenModal,
  onOpenDmCreateModal, // DM 생성 모달 콜백 추가
  onUserClick, // 사용자 클릭 콜백 추가
  isLightTheme,
  onToggleTheme,
  todoCount,
  mailUnreadCount,
  t, // 다국어 사전 객체 전달받음
  onOpenSettings,
  aiEnabled,
  currentUser,
  onLogout,
  isChatbotVisible, // 추가
  onToggleChatbotVisible, // 추가
  todoFilter = 'all', // 추가
  onTodoFilterChange, // 추가
  isSidebarOpen,
  subPanelWidth = 260,
  onSubPanelWidthChange
}) {

  const roleLevel = getUserRoleLevel(currentUser);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = subPanelWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(160, Math.min(450, startWidth + deltaX));
      if (onSubPanelWidthChange) {
        onSubPanelWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 1단 글로벌 네비게이션 메뉴 정의 (네이버웍스 스타일 고유 컬러 및 입체적 fill 적용)
  const menuItems = [
    { id: 'home', label: 'HOME', icon: <Home size={28} style={{ color: '#007aff', fill: '#007aff1f', strokeWidth: 2 }} />, color: '#007aff' },
    { id: 'chat', label: t.chat, icon: <MessageSquare size={28} style={{ color: '#2eb67d', fill: '#2eb67d1f', strokeWidth: 2 }} />, color: '#2eb67d', badge: 3 },
    { id: 'mail', label: t.mail, icon: <Mail size={28} style={{ color: '#0058bc', fill: '#0058bc1f', strokeWidth: 2 }} />, color: '#0058bc', badge: mailUnreadCount },
    { id: 'calendar', label: t.calendar, icon: <Calendar size={28} style={{ color: '#8a2be2', fill: '#8a2be21f', strokeWidth: 2 }} />, color: '#8a2be2' }
  ];

  // 프로젝트 칸반: PM 이상 (Level 1, 2, 3) 노출
  if (roleLevel <= 3) {
    menuItems.push({ id: 'project', label: t.project, icon: <Layers size={28} style={{ color: '#5856d6', fill: '#5856d61f', strokeWidth: 2 }} />, color: '#5856d6' });
  }

  // 드라이브, 할일, 게시판: 모든 등급 노출
  menuItems.push(
    { id: 'drive', label: t.drive, icon: <Cloud size={28} style={{ color: '#00bfff', fill: '#00bfff1f', strokeWidth: 2 }} />, color: '#00bfff' },
    { id: 'todo', label: t.todo, icon: <CheckCircle size={28} style={{ color: '#ff2d55', fill: '#ff2d551f', strokeWidth: 2 }} />, color: '#ff2d55', badge: todoCount },
    { id: 'board', label: t.board, icon: <Megaphone size={28} style={{ color: '#ff9500', fill: '#ff95001f', strokeWidth: 2 }} />, color: '#ff9500' }
  );

  // 조직도: 임원 이상 (Level 1, 2) 노출
  if (roleLevel <= 2) {
    menuItems.push({ 
      id: 'hr', 
      label: currentWorkspace === 'vietqs' ? 'Sơ đồ tổ chức' : '조직도', 
      icon: <Users size={28} style={{ color: '#52c41a', fill: '#52c41a1f', strokeWidth: 2 }} />, 
      color: '#52c41a' 
    });
  }

  // 2단 서브패널 렌더링 헬퍼 함수
  const renderSubPanelContent = () => {
    switch (currentMenu) {
      case 'chat':
        return (
          <>
            {/* Channels Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>{t.channels}</span>
                <button style={styles.addBtn} onClick={onOpenModal} title={t.addChannel}>
                  <Plus size={16} />
                </button>
              </div>

              <div style={styles.sectionList}>
                {channels.map(channel => {
                  const isActive = activeChat.type === 'channel' && activeChat.id === channel.id;
                  // 채널 이름 베트남어 전환 (일반 -> Chung, 공지사항 -> Thông báo)
                  let displayChannelName = channel.name;
                  if (currentWorkspace === 'vietqs') {
                    if (channel.name === '일반' || channel.name === 'general') displayChannelName = 'chung';
                    else if (channel.name === '공지사항' || channel.name === 'notice') displayChannelName = 'thông-báo';
                    else if (channel.name === '컨코스트-적산팀') displayChannelName = 'concost-dự-toán';
                  }

                  return (
                    <button 
                      key={channel.id}
                      onClick={() => onActiveChatChange({ type: 'channel', id: channel.id })}
                      style={{
                        ...styles.itemBtn,
                        backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? '600' : '400',
                      }}
                    >
                      <Hash size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <span style={styles.itemText}>{displayChannelName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Helper Section */}
            {aiEnabled && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionTitle}>{t.aiAssistant}</span>
                </div>
                <div style={styles.sectionList}>
                  <button 
                    onClick={() => onActiveChatChange({ type: 'ai', id: 'ai-bot' })}
                    style={{
                      ...styles.itemBtn,
                      backgroundColor: activeChat.type === 'ai' ? 'var(--bg-active)' : 'transparent',
                      color: activeChat.type === 'ai' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: activeChat.type === 'ai' ? '600' : '400',
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      flexShrink: 0
                    }}>
                      <svg width="14" height="14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 18L18 8" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="18" cy="8" r="5" fill="var(--primary)" />
                        <path d="M42 18L46 8" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="46" cy="8" r="5" fill="var(--primary)" />
                        <rect x="10" y="14" width="44" height="34" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
                        <rect x="14" y="20" width="36" height="20" rx="8" fill="#111214" />
                        <circle cx="23" cy="30" r="4.5" fill="var(--primary)" />
                        <circle cx="41" cy="30" r="4.5" fill="var(--primary)" />
                      </svg>
                    </div>
                    <span style={styles.itemText}>{t.aiName}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Direct Messages Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>{t.dms}</span>
                <button style={styles.addBtn} onClick={onOpenDmCreateModal} title="새 DM 시작">
                  <Plus size={16} />
                </button>
              </div>

              <div style={styles.sectionList}>
                {dms.map(dm => {
                  const isActive = activeChat.type === 'dm' && activeChat.id === dm.id;
                  
                  // 베트남어 지사 임직원 직함 변환
                  let displayName = dm.name;
                  if (currentWorkspace === 'vietqs') {
                    if (dm.id === 'youngja-dm') displayName = 'P.Thiết kế Youngja';
                    else if (dm.id === 'jabis-dm') displayName = 'P.Phát triển Jabis';
                    else if (dm.id === 'kodari-dm') displayName = 'Giám đốc Kodari';
                  }

                  return (
                    <button 
                      key={dm.id}
                      onClick={() => onActiveChatChange({ type: 'dm', id: dm.id })}
                      style={{
                        ...styles.itemBtn,
                        backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? '600' : '400',
                      }}
                    >
                      <div style={styles.avatarSmallWrapper}>
                        <div style={{
                          ...styles.avatarSmall,
                          backgroundColor: dm.avatarColor || 'var(--bg-hover)'
                        }}>
                          {displayName.charAt(0)}
                        </div>
                        <span className={`status-dot ${dm.status}`} style={styles.statusSmall} />
                      </div>
                      <span style={styles.itemText}>{displayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        );

      case 'mail':
        const isViet = currentWorkspace === 'vietqs';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px 12px 16px 12px', gap: '16px', backgroundColor: 'var(--bg-primary)' }}>
            {/* 1. 메일쓰기 / 메모쓰기 알약형(Pill) 버튼 그룹 */}
            <div style={{ display: 'flex', width: '100%', height: '40px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', flexShrink: 0 }}>
              <button 
                style={{
                  flex: 1.2,
                  backgroundColor: '#00c73c', // 네이버웍스 그린
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => alert(isViet ? 'Soạn thư' : '메일쓰기')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00b135'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c73c'}
              >
                {isViet ? 'Soạn thư' : '메일쓰기'}
              </button>
              <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <button 
                style={{
                  flex: 0.8,
                  backgroundColor: '#00b135', // 약간 짙은 그린
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => alert(isViet ? 'Ghi chú' : '메모쓰기')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#009d2e'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00b135'}
              >
                {isViet ? 'Ghi chú' : '메모쓰기'}
              </button>
            </div>

            {/* 2. 상태 숏컷 카운터 (안읽음, 중요, 리마인드, 받는사람) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              padding: '12px 6px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              flexShrink: 0
            }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => alert('안읽음 필터')}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#007aff', marginBottom: '2px', lineHeight: 1.1 }}>
                  {mailUnreadCount}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{isViet ? 'Chưa đọc' : '안읽음'}</div>
              </div>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-light)' }} />
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => alert('중요 필터')}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3px' }}>
                  <Star size={16} style={{ color: '#ffb900' }} fill="#ffb900" />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{isViet ? 'Quan trọng' : '중요'}</div>
              </div>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-light)' }} />
              <div style={{ flex: 1, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3px' }}>
                  <Clock size={16} style={{ color: '#00bfff' }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{isViet ? 'Nhắc nhở' : '리마인드'}</div>
              </div>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-light)' }} />
              <div style={{ flex: 1, cursor: 'pointer' }}>
                <div style={{
                  width: '18px',
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--text-secondary)',
                  color: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontWeight: '900',
                  margin: '2px auto 4px auto',
                  lineHeight: 1
                }}>
                  TO
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{isViet ? 'Người nhận' : '받는사람'}</div>
              </div>
            </div>

            {/* 3. 트리 메일함 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
              <button style={{ ...styles.itemBtn, backgroundColor: 'rgba(0,122,255,0.08)', border: '1px solid rgba(0,122,255,0.15)', color: '#007aff', fontWeight: '700' }}>
                <Mail size={16} style={{ color: '#007aff', fill: '#007aff1f' }} />
                <span style={styles.itemText}>{isViet ? 'Tất cả thư' : '전체메일'}</span>
              </button>
              <button style={styles.itemBtn}>
                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={styles.itemText}>{t.receivedMail}</span>
                {mailUnreadCount > 0 && <span style={styles.countBadge}>{mailUnreadCount}</span>}
              </button>
              <button style={styles.itemBtn}>
                <SendCircleIcon />
                <span style={styles.itemText}>{t.sentMail}</span>
              </button>
              <button style={styles.itemBtn}>
                <Users size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{isViet ? 'Xác nhận nhận' : '수신확인'}</span>
              </button>
              <button style={styles.itemBtn}>
                <Folder size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.draftsMail}</span>
              </button>
              <button style={styles.itemBtn}>
                <CheckCircle size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{isViet ? 'Hộp ghi chú' : '메모함'}</span>
              </button>
              
              {/* 내 메일함 헤더 및 설정 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 8px 6px 8px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                  {isViet ? 'Hộp thư của tôi' : '내 메일함'}
                </span>
                <div style={{ display: 'flex', gap: '6px', color: 'var(--text-muted)' }}>
                  <span style={{ cursor: 'pointer', fontSize: '0.85rem' }} title="추가" onClick={() => alert('새 메일함 추가')}>+</span>
                  <span style={{ cursor: 'pointer', fontSize: '0.75rem' }} title="관리" onClick={() => alert('메일함 관리')}>⚙️</span>
                </div>
              </div>
              
              <button style={styles.itemBtn}>
                <Folder size={16} style={{ color: '#2eb67d' }} />
                <span style={styles.itemText}>{isViet ? 'Thư rác' : '스팸메일함'}</span>
              </button>
              <button style={styles.itemBtn}>
                <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.trashMail}</span>
              </button>
              <button style={styles.itemBtn}>
                <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{isViet ? 'Nhập thư ngoài' : '외부메일 가져오기'}</span>
              </button>

              {/* 자주 찾는 도움말 보기 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                marginTop: '16px',
                transition: 'background-color 0.2s'
              }}
              onClick={() => alert('도움말 페이지로 이동합니다.')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              >
                <span>{isViet ? 'Xem trợ giúp thường gặp' : '자주 찾는 도움말 보기'}</span>
                <span>&gt;</span>
              </div>
            </div>

            {/* 4. 저작권 & 용량 */}
            <div style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              padding: '10px 0 0 0',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{isViet ? 'Dung lượng' : '용량'} 54KB / 3TB</span>
                <span style={{ color: '#007aff' }}>0.01%</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '1%', height: '100%', backgroundColor: '#007aff' }} />
              </div>
              <div style={{ marginTop: '2px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>© NAVER Cloud Corp.</div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>{t.myCalendar}</span>
              <button style={styles.addBtn} title={t.addTodo}>
                <Plus size={16} />
              </button>
            </div>
            <div style={styles.sectionList}>
              <label style={styles.checkboxItem}>
                <input type="checkbox" defaultChecked style={styles.checkbox} />
                <span style={{ ...styles.colorLabel, backgroundColor: 'var(--primary)' }} />
                <span style={styles.itemText}>{t.mySchedule}</span>
              </label>
              <label style={styles.checkboxItem}>
                <input type="checkbox" defaultChecked style={styles.checkbox} />
                <span style={{ ...styles.colorLabel, backgroundColor: '#23a55a' }} />
                <span style={styles.itemText}>{t.teamSchedule}</span>
              </label>
              <label style={styles.checkboxItem}>
                <input type="checkbox" style={styles.checkbox} />
                <span style={{ ...styles.colorLabel, backgroundColor: '#f0b232' }} />
                <span style={styles.itemText}>{t.holidays}</span>
              </label>
            </div>
          </div>
        );

      case 'todo':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>{t.todoManage}</span>
            </div>
            <div style={styles.sectionList}>
              <button 
                onClick={() => onTodoFilterChange && onTodoFilterChange('all')}
                style={{ ...styles.itemBtn, backgroundColor: todoFilter === 'all' ? 'var(--bg-active)' : 'transparent' }}
              >
                <CheckCircle size={16} style={{ color: 'var(--primary)' }} />
                <span style={styles.itemText}>{currentWorkspace === 'vietqs' ? 'Tất cả' : '전체 할 일'}</span>
              </button>
              <button 
                onClick={() => onTodoFilterChange && onTodoFilterChange('today')}
                style={{ ...styles.itemBtn, backgroundColor: todoFilter === 'today' ? 'var(--bg-active)' : 'transparent' }}
              >
                <Clock size={16} style={{ color: '#0058bc' }} />
                <span style={styles.itemText}>{t.todayTodo}</span>
                <span style={styles.countBadge}>{todoCount}</span>
              </button>
              <button 
                onClick={() => onTodoFilterChange && onTodoFilterChange('overdue')}
                style={{ ...styles.itemBtn, backgroundColor: todoFilter === 'overdue' ? 'var(--bg-active)' : 'transparent' }}
              >
                <AlertCircle size={16} style={{ color: '#d83b01' }} />
                <span style={styles.itemText}>{t.overdueTodo}</span>
              </button>
              <button 
                onClick={() => onTodoFilterChange && onTodoFilterChange('completed')}
                style={{ ...styles.itemBtn, backgroundColor: todoFilter === 'completed' ? 'var(--bg-active)' : 'transparent' }}
              >
                <CheckCircle size={16} style={{ color: '#23a55a' }} />
                <span style={styles.itemText}>{t.completedTodo}</span>
              </button>
            </div>
          </div>
        );

      case 'board':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>{t.board}</span>
            </div>
            <div style={styles.sectionList}>
              <button style={{ ...styles.itemBtn, backgroundColor: 'var(--bg-active)' }}>
                <Megaphone size={16} style={{ color: 'var(--primary)' }} />
                <span style={styles.itemText}>{t.noticeBoard}</span>
              </button>
              <button style={styles.itemBtn}>
                <Hash size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.freeBoard}</span>
              </button>
              <button style={styles.itemBtn}>
                <Hash size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.ideaBoard}</span>
              </button>
            </div>
          </div>
        );

      case 'drive':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>{t.driveFolders}</span>
            </div>
            <div style={styles.sectionList}>
              <button style={{ ...styles.itemBtn, backgroundColor: 'var(--bg-active)' }}>
                <Folder size={16} style={{ color: 'var(--primary)' }} />
                <span style={styles.itemText}>{t.personalDrive}</span>
              </button>
              <button style={styles.itemBtn}>
                <Folder size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.sharedDrive}</span>
              </button>
              <button style={styles.itemBtn}>
                <Folder size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.commonDrive}</span>
              </button>
            </div>
          </div>
        );

      case 'project':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>{t.projectList}</span>
              <button style={styles.addBtn} title={t.addProject}>
                <Plus size={16} />
              </button>
            </div>
            <div style={styles.sectionList}>
              <button style={{ ...styles.itemBtn, backgroundColor: 'var(--bg-active)' }}>
                <Layers size={16} style={{ color: 'var(--primary)' }} />
                <span style={styles.itemText}>{t.pro1}</span>
              </button>
              <button style={styles.itemBtn}>
                <Layers size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.pro2}</span>
              </button>
              <button style={styles.itemBtn}>
                <Layers size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.pro3}</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* 1단: Global Workspace & Menu Navigation Dock */}
      <div style={styles.workspaceBar}>
        <div style={styles.workspaceList}>
          {/* 네이버웍스 스타일 글로벌 메뉴들 (아이콘 고유 컬러 및 글로우 연동) */}
          {menuItems.map(item => {
            const isMenuSelected = currentMenu === item.id;
            const itemColor = item.color;
            
            return (
              <button 
                key={item.id}
                className="menu-item-btn"
                style={{
                  ...styles.menuItemBtn,
                  color: isMenuSelected ? itemColor : 'var(--text-secondary)',
                  backgroundColor: isMenuSelected ? `${itemColor}1c` : 'transparent',
                  border: isMenuSelected ? `1.5px solid ${itemColor}` : '1.5px solid transparent',
                  boxShadow: isMenuSelected ? `0 0 14px ${itemColor}45` : 'none',
                  transform: isMenuSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                }}
                onClick={() => onMenuChange(item.id)}
                title={item.label}
                onMouseEnter={(e) => {
                  if (!isMenuSelected) {
                    e.currentTarget.style.backgroundColor = `${itemColor}15`;
                    e.currentTarget.style.borderColor = `${itemColor}40`;
                    e.currentTarget.style.color = itemColor;
                    e.currentTarget.style.boxShadow = `0 0 10px ${itemColor}30`;
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMenuSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {item.icon}
                {item.badge && item.badge > 0 ? (
                  <span style={styles.menuBadge}>{item.badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>
 
        {/* Global Nav Bottom Actions */}
        <div style={styles.globalActions}>
          {/* AI Chatbot Pinned Button */}
          <button 
            className="action-btn"
            style={{
              ...styles.actionBtn,
              borderColor: isChatbotVisible ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
              color: isChatbotVisible ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isChatbotVisible ? 'rgba(255, 107, 0, 0.08)' : 'var(--bg-secondary)',
              boxShadow: isChatbotVisible ? '0 0 12px rgba(255,107,0,0.25)' : 'none',
              marginBottom: '4px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              outline: 'none'
            }} 
            onClick={() => onToggleChatbotVisible(true)} 
            title="AI 챗봇 비서 활성화"
            onMouseEnter={(e) => {
              if (!isChatbotVisible) {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(255,107,0,0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isChatbotVisible) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <Bot size={26} />
          </button>
 
          {/* Settings Button */}
          <button 
            className="action-btn"
            style={{
              ...styles.actionBtn,
              borderColor: 'rgba(255,255,255,0.08)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              outline: 'none'
            }} 
            onClick={onOpenSettings} 
            title="환경 설정"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255,107,0,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Settings size={26} />
          </button>
 
          {/* Logout Button */}
          <button 
            className="action-btn"
            style={{ 
              ...styles.actionBtn, 
              color: '#ff4d4f',
              borderColor: 'rgba(255,255,255,0.08)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              outline: 'none'
            }} 
            onClick={onLogout} 
            title="로그아웃"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ff4d4f';
              e.currentTarget.style.backgroundColor = 'rgba(255, 77, 79, 0.08)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255,77,79,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <LogOutIcon size={24} />
          </button>
 
          {/* Theme Toggle */}
          <button 
            className="action-btn"
            style={{
              ...styles.actionBtn,
              borderColor: 'rgba(255,255,255,0.08)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              outline: 'none'
            }} 
            onClick={onToggleTheme} 
            title={isLightTheme ? "다크 모드로 변경" : "라이트 모드로 변경"}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ffcc00';
              e.currentTarget.style.color = '#ffcc00';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255,204,0,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLightTheme ? <Moon size={26} /> : <Sun size={26} />}
          </button>
          
          <div style={styles.avatarWrapper} onClick={() => onUserClick && onUserClick(currentUser?.id)}>
            <div style={{ 
              ...styles.myAvatar, 
              backgroundColor: currentUser?.photoUrl ? 'transparent' : 'var(--primary)',
              cursor: 'pointer', 
              overflow: 'hidden' 
            }}>
              {currentUser?.photoUrl ? (
                <img 
                  src={currentUser.photoUrl} 
                  alt="내 사진" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                  {currentUser?.userName ? currentUser.userName.charAt(0) : (currentWorkspace === 'vietqs' ? 'G' : '대')}
                </span>
              )}
            </div>
            <span className="status-dot online" style={styles.myStatus} />
          </div>
        </div>
      </div>

      {/* 2단: Sub-Navigation Panel (Dynamic by menu) */}
      <div 
        className="sidebar-subpanel"
        style={{
          ...styles.subPanel,
          width: `${subPanelWidth}px`,
          display: (currentMenu === 'home' || !isSidebarOpen) ? 'none' : 'flex',
          position: 'relative'
        }}
      >
        {/* resize handle */}
        <div 
          onMouseDown={handleMouseDown}
          className="sidebar-resize-handle"
        />
        {/* Workspace Brand Header */}
        <div style={styles.header}>
          <div style={styles.brandWrapper}>
            {currentWorkspace === 'concost' ? (
              <img src={concostVert} alt="CONCOST Logo" style={styles.logoVert} />
            ) : (
              <img src={vietqsLogo} alt="VIETQS Logo" style={styles.logoVert} />
            )}
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>

        {/* Dynamic Navigation List */}
        <div style={styles.navScroll}>
          {renderSubPanelContent()}
        </div>


      </div>
    </div>
  );
}

// 간단한 로그아웃 아이콘
function LogOutIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}

// 간단한 Send Circle 아이콘
function SendCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    backgroundColor: 'var(--bg-tertiary)',
    borderRight: '1px solid var(--border)',
    userSelect: 'none',
  },
  workspaceBar: {
    width: 'var(--sidebar-width)',
    height: '100%',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '12px 0',
    alignItems: 'center',
    borderRight: '1px solid var(--border)',
  },
  workspaceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    alignItems: 'center',
  },
  workspaceBtn: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '2px 0',
    transition: 'all var(--transition-fast)',
  },
  workspaceIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '1.3rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
    transition: 'transform var(--transition-fast)',
  },
  workspaceInitial: {
    textShadow: '0 1px 1px rgba(0,0,0,0.15)',
  },
  divider: {
    width: '32px',
    height: '1px',
    backgroundColor: 'var(--border-light)',
    margin: '6px 0',
  },
  menuItemBtn: {
    width: '68px',
    height: '68px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    position: 'relative',
    transition: 'all var(--transition-fast)',
  },
  menuLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    marginTop: '2px',
  },
  menuBadge: {
    position: 'absolute',
    top: '4px',
    right: '8px',
    backgroundColor: 'var(--danger)',
    color: '#ffffff',
    fontSize: '0.65rem',
    fontWeight: '700',
    borderRadius: 'var(--radius-full)',
    padding: '1px 5px',
    minWidth: '16px',
    textAlign: 'center',
  },
  globalActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  actionBtn: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
  },
  avatarWrapper: {
    position: 'relative',
    cursor: 'pointer',
  },
  myAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
    fontWeight: 'bold',
  },
  myStatus: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    border: '2px solid var(--bg-tertiary)',
  },
  subPanel: {
    width: 'var(--subpanel-width)',
    height: '100%',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '16px',
    height: '60px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  brandWrapper: {
    display: 'flex',
    alignItems: 'center',
    maxHeight: '28px',
  },
  logoVert: {
    maxHeight: '28px',
    maxWidth: '180px',
    objectFit: 'contain',
  },
  navScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 8px 4px 8px',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  addBtn: {
    padding: '2px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
  },
  sectionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemBtn: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.85rem',
    textAlign: 'left',
    position: 'relative',
    transition: 'background-color var(--transition-fast)',
  },
  itemText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
  },
  countBadge: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--border-light)',
    color: 'var(--text-secondary)',
    borderRadius: '10px',
    padding: '1px 6px',
  },
  avatarSmallWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  avatarSmall: {
    width: '20px',
    height: '20px',
    borderRadius: 'var(--radius-sm)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  statusSmall: {
    position: 'absolute',
    bottom: '-3px',
    right: '-3px',
    width: '8px',
    height: '8px',
    borderWidth: '1.5px',
    borderColor: 'var(--bg-secondary)',
  },
  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  checkbox: {
    width: '14px',
    height: '14px',
    cursor: 'pointer',
  },
  colorLabel: {
    width: '8px',
    height: '8px',
    borderRadius: 'var(--radius-full)',
  },
  profileFooter: {
    padding: '14px 16px',
    height: '64px',
    backgroundColor: 'var(--bg-tertiary)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatarFooter: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  profileMeta: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  profileStatus: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  settingsBtn: {
    color: 'var(--text-secondary)',
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
