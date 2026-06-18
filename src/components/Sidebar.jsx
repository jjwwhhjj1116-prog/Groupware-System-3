import React from 'react';
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
  isLightTheme,
  onToggleTheme,
  todoCount,
  mailUnreadCount,
  t, // 다국어 사전 객체 전달받음
  onOpenSettings,
  aiEnabled,
  currentUser,
  onLogout
}) {

  // 관리자 권한 여부 체크
  const isManager = currentUser && (
    ['대표', '부사장', '상무', '센터장', '본부장', '실장', '팀장', '파트장', 'CEO'].includes(currentUser.grade) ||
    currentUser.dept === '경영지원본부' ||
    currentUser.role === '실장'
  );

  // 1단 글로벌 네비게이션 메뉴 정의 (다국어 바인딩)
  const menuItems = [
    { id: 'home', label: currentWorkspace === 'vietqs' ? 'Bảng điều khiển' : '대시보드', icon: <Home size={20} /> },
    { id: 'chat', label: t.chat, icon: <MessageSquare size={20} />, badge: 3 },
    { id: 'mail', label: t.mail, icon: <Mail size={20} />, badge: mailUnreadCount },
    { id: 'calendar', label: t.calendar, icon: <Calendar size={20} /> },
    { id: 'project', label: t.project, icon: <Layers size={20} /> },
    { id: 'drive', label: t.drive, icon: <Cloud size={20} /> },
    { id: 'todo', label: t.todo, icon: <CheckCircle size={20} />, badge: todoCount },
    { id: 'board', label: t.board, icon: <Megaphone size={20} /> }
  ];

  if (isManager) {
    menuItems.push({ 
      id: 'hr', 
      label: currentWorkspace === 'vietqs' ? 'Sơ đồ tổ chức' : '조직도', 
      icon: <Users size={20} /> 
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
                    <Bot size={16} style={{ color: '#ff007f' }} />
                    <span style={styles.itemText}>{t.aiName}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Direct Messages Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>{t.dms}</span>
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
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>{t.mailBox}</span>
            </div>
            <div style={styles.sectionList}>
              <button style={{ ...styles.itemBtn, backgroundColor: 'var(--bg-active)' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <span style={styles.itemText}>{t.receivedMail}</span>
                <span style={styles.countBadge}>{mailUnreadCount}</span>
              </button>
              <button style={styles.itemBtn}>
                <Star size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.starredMail}</span>
              </button>
              <button style={styles.itemBtn}>
                <SendCircleIcon />
                <span style={styles.itemText}>{t.sentMail}</span>
              </button>
              <button style={styles.itemBtn}>
                <Folder size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.draftsMail}</span>
              </button>
              <button style={styles.itemBtn}>
                <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.trashMail}</span>
              </button>
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
              <button style={{ ...styles.itemBtn, backgroundColor: 'var(--bg-active)' }}>
                <CheckCircle size={16} style={{ color: 'var(--primary)' }} />
                <span style={styles.itemText}>{t.todayTodo}</span>
                <span style={styles.countBadge}>{todoCount}</span>
              </button>
              <button style={styles.itemBtn}>
                <AlertCircle size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={styles.itemText}>{t.overdueTodo}</span>
              </button>
              <button style={styles.itemBtn}>
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
          {/* CONCOST Workspace */}
          <button 
            style={{
              ...styles.workspaceBtn,
              borderLeft: currentWorkspace === 'concost' ? '3px solid #ff6b00' : '3px solid transparent',
              backgroundColor: currentWorkspace === 'concost' ? 'var(--bg-active)' : 'transparent',
            }}
            onClick={() => onWorkspaceChange('concost')}
            title="컨코스트 워크스페이스"
          >
            <div className="workspace-icon-wrapper" style={{
              ...styles.workspaceIconWrapper,
              backgroundColor: '#ff6b00',
            }}>
              <span style={styles.workspaceInitial}>C</span>
            </div>
          </button>

          {/* VIETQS Workspace */}
          <button 
            style={{
              ...styles.workspaceBtn,
              borderLeft: currentWorkspace === 'vietqs' ? '3px solid #0058bc' : '3px solid transparent',
              backgroundColor: currentWorkspace === 'vietqs' ? 'var(--bg-active)' : 'transparent',
            }}
            onClick={() => onWorkspaceChange('vietqs')}
            title="비앳큐에스 워크스페이스"
          >
            <div className="workspace-icon-wrapper" style={{
              ...styles.workspaceIconWrapper,
              backgroundColor: '#0058bc',
            }}>
              <span style={styles.workspaceInitial}>V</span>
            </div>
          </button>

          {/* Divider */}
          <div style={styles.divider} />

          {/* 네이버웍스 스타일 글로벌 메뉴들 */}
          {menuItems.map(item => {
            const isMenuSelected = currentMenu === item.id;
            return (
              <button 
                key={item.id}
                className="menu-item-btn"
                style={{
                  ...styles.menuItemBtn,
                  color: isMenuSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isMenuSelected ? 'var(--bg-active)' : 'transparent'
                }}
                onClick={() => onMenuChange(item.id)}
                title={item.label}
              >
                {item.icon}
                <span style={styles.menuLabel}>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span style={styles.menuBadge}>{item.badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Global Nav Bottom Actions */}
        <div style={styles.globalActions}>
          {/* Theme Toggle */}
          <button 
            className="action-btn"
            style={styles.actionBtn} 
            onClick={onToggleTheme} 
            title={isLightTheme ? "다크 모드로 변경" : "라이트 모드로 변경"}
          >
            {isLightTheme ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div style={styles.avatarWrapper}>
            <div style={styles.myAvatar}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{currentWorkspace === 'vietqs' ? 'G' : '대'}</span>
            </div>
            <span className="status-dot online" style={styles.myStatus} />
          </div>
        </div>
      </div>

      {/* 2단: Sub-Navigation Panel (Dynamic by menu) */}
      <div style={styles.subPanel}>
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

        {/* Profile/Footer Area */}
        <div style={styles.profileFooter}>
          <div style={styles.profileInfo}>
            <div style={styles.avatarFooter}>
              <span>{currentUser?.userName ? currentUser.userName.charAt(0) : '대'}</span>
            </div>
            <div style={styles.profileMeta}>
              <div style={styles.profileName} title={currentUser?.userName || ''}>
                {currentUser?.userName ? `${currentUser.userName} ${currentUser.grade || ''}` : (currentWorkspace === 'vietqs' ? 'Giám đốc' : '대표님 (나)')}
              </div>
              <div style={styles.profileStatus}>
                <span className="status-dot online" style={{ marginRight: '6px' }} />
                {t.online}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              onClick={onLogout} 
              style={{ ...styles.settingsBtn, color: '#ff4d4f' }} 
              title="로그아웃"
            >
              <LogOutIcon />
            </button>
            <button style={styles.settingsBtn} title="설정" onClick={onOpenSettings}>
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 간단한 로그아웃 아이콘
function LogOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '1.1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
    transition: 'transform var(--transition-fast)',
  },
  workspaceInitial: {
    textShadow: '0 1px 1px rgba(0,0,0,0.15)',
  },
  divider: {
    width: '24px',
    height: '1px',
    backgroundColor: 'var(--border-light)',
    margin: '6px 0',
  },
  menuItemBtn: {
    width: '56px',
    height: '56px',
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
    fontSize: '0.65rem',
    fontWeight: '500',
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
    width: '36px',
    height: '36px',
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
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
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
