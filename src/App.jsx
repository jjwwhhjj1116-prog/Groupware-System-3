import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Modal from './components/Modal';
import LoginForm from './components/LoginForm';
import HrCardModal from './components/HrCardModal';
import HrManager from './components/HrManager';
import OrgChart from './components/OrgChart';
import { io } from 'socket.io-client';
import { 
  Plus, 
  Trash2, 
  Check, 
  Mail,
  Mail as MailIcon, 
  Calendar,
  Calendar as CalendarIcon, 
  Bot, 
  Folder, 
  Clock,
  Settings,
  X,
  Key,
  Database,
  ShieldAlert, // 추가
  Menu,
  Star,
  Home,
  MessageSquare,
  CheckCircle,
  Layers,
  Megaphone,
  Users,
  AlertCircle,
  Search
} from 'lucide-react';
import { getUserRoleLevel, getRoleLabel } from './utils/permission'; // 추가
import ceoDongmyungImg from './assets/ceo_dongmyung.png';
import ceoDongmyungThinkingImg from './assets/ceo_dongmyung_thinking.png';
import concostVert from './assets/concost_logo_vert.png';
import vietqsLogo from './assets/vietqs_logo.png';


// AI 영자 표정 이미지들
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

// Robot Face Icon Component (Custom inline SVG)
const RobotFaceIcon = ({ size = 44 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ transition: 'transform 0.3s ease' }}
  >
    <defs>
      <linearGradient id="visorGrad" x1="16" y1="20" x2="48" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#111214" />
        <stop offset="100%" stopColor="#202225" />
      </linearGradient>
      <linearGradient id="headGrad" x1="12" y1="14" x2="52" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f0f1f5" />
      </linearGradient>
      <linearGradient id="earGrad" x1="6" y1="22" x2="58" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2f3136" />
        <stop offset="100%" stopColor="#1f2023" />
      </linearGradient>
      <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
      </filter>
    </defs>

    {/* Antennae */}
    <path d="M22 18L18 8" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
    <circle cx="18" cy="8" r="4" fill="var(--primary)" />
    <circle cx="18" cy="8" r="1.5" fill="#ffffff" />

    <path d="M42 18L46 8" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
    <circle cx="46" cy="8" r="4" fill="var(--primary)" />
    <circle cx="46" cy="8" r="1.5" fill="#ffffff" />

    {/* Robot Head Body */}
    <rect x="10" y="14" width="44" height="34" rx="14" fill="url(#headGrad)" stroke="#e2e8f0" strokeWidth="2" />

    {/* Side Headphones (Robot Ears) */}
    <rect x="5" y="22" width="6" height="18" rx="3" fill="url(#earGrad)" />
    <rect x="7" y="26" width="2" height="10" rx="1" fill="var(--primary)" opacity="0.8" />
    
    <rect x="53" y="22" width="6" height="18" rx="3" fill="url(#earGrad)" />
    <rect x="55" y="26" width="2" height="10" rx="1" fill="var(--primary)" opacity="0.8" />

    {/* Visor */}
    <rect x="14" y="20" width="36" height="20" rx="8" fill="url(#visorGrad)" filter="url(#shadowFilter)" />

    {/* Glowing Eyes */}
    <circle cx="23" cy="30" r="4.5" fill="none" stroke="var(--primary)" strokeWidth="2" />
    <circle cx="23" cy="30" r="1.5" fill="var(--primary)" />
    
    <circle cx="41" cy="30" r="4.5" fill="none" stroke="var(--primary)" strokeWidth="2" />
    <circle cx="41" cy="30" r="1.5" fill="var(--primary)" />

    {/* Blush */}
    <circle cx="18" cy="36" r="1.5" fill="var(--primary)" opacity="0.4" />
    <circle cx="46" cy="36" r="1.5" fill="var(--primary)" opacity="0.4" />

    {/* Robotic Collar/Neck */}
    <rect x="24" y="47" width="16" height="5" rx="2.5" fill="#cbd5e1" />
    <line x1="28" y1="49.5" x2="36" y2="49.5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// AI CEO 동명 표정 이미지들
const CEO_IMAGES = {
  default: ceoDongmyungImg,
  thinking: ceoDongmyungThinkingImg
};

// --- 다국어 번역 사전 ---
const TRANSLATIONS = {
  concost: {
    home: "HOME",
    chat: "메시지",
    mail: "메일",
    calendar: "캘린더",
    project: "프로젝트",
    drive: "드라이브",
    todo: "할 일",
    board: "게시판",
    channels: "채널",
    dms: "다이렉트 메시지",
    aiAssistant: "AI 어시스턴트",
    aiName: "✨ CC AI 비서",
    addChannel: "채널 추가",
    addTodo: "일정 추가",
    addProject: "프로젝트 생성",
    mailBox: "메일함",
    receivedMail: "받은편지함",
    starredMail: "중요편지함",
    sentMail: "보낸편지함",
    draftsMail: "임시보관함",
    trashMail: "휴지통",
    myCalendar: "내 캘린더",
    mySchedule: "내 일정 (기본)",
    teamSchedule: "부서/팀 일정",
    holidays: "대한민국 공휴일",
    todoManage: "할 일 관리",
    todayTodo: "오늘 할 일",
    overdueTodo: "기한 만료",
    completedTodo: "완료된 할 일",
    noticeBoard: "📢 전사 공지사항",
    freeBoard: "💬 자유게시판",
    ideaBoard: "💡 제안/아이디어",
    driveFolders: "드라이브 폴더",
    personalDrive: "개인 드라이브",
    sharedDrive: "팀 공유 드라이브",
    commonDrive: "전사 공용 드라이브",
    projectList: "프로젝트 리스트",
    pro1: "🏢 통합 메신저 구축",
    pro2: "🇻🇳 베트남 현지화 지원",
    pro3: "⚡ 건축 AI 적산 자동화",
    mailTitle: "✉️ 메일 (Mail)",
    calendarTitle: "📅 캘린더 (Calendar)",
    todoTitle: "✅ 할 일 목록 (To-Do)",
    boardTitle: "📢 사내 게시판 (Board)",
    driveTitle: "☁️ 클라우드 드라이브 (Drive)",
    projectTitle: "🏢 프로젝트 칸반 보드 (Project)",
    unread: "미읽음",
    cases: "건",
    todoPlaceholder: "오늘 해야 할 일을 적어보세요...",
    todoBtn: "추가",
    uploadBtn: "파일 업로드",
    newProjBtn: "새 태스크",
    titleCol: "제목",
    deptCol: "작성부서",
    dateCol: "작성일",
    viewsCol: "조회수",
    priority: "우선순위",
    online: "온라인",
    offline: "오프라인",
    idle: "자리비움",
    managerMe: "대표님 (나)",
    welcomeMessage: "이곳이 대화의 시작점입니다! 첫 메시지를 전송하여 새로운 대화를 시작해보세요."
  },
  vietqs: {
    home: "HOME",
    chat: "Tin nhắn",
    mail: "Thư điện tử",
    calendar: "Lịch",
    project: "Dự án",
    drive: "Lưu trữ",
    todo: "Việc cần làm",
    board: "Bảng tin",
    channels: "Kênh",
    dms: "Tin nhắn trực tiếp",
    aiAssistant: "Trợ lý AI",
    aiName: "✨ CC AI Trợ lý",
    addChannel: "Thêm kênh",
    addTodo: "Thêm lịch",
    addProject: "Tạo dự án",
    mailBox: "Hộp thư",
    receivedMail: "Hộp thư đến",
    starredMail: "Thư quan trọng",
    sentMail: "Thư đã gửi",
    draftsMail: "Thư nháp",
    trashMail: "Thùng rác",
    myCalendar: "Lịch của tôi",
    mySchedule: "Lịch cá nhân (Mặc định)",
    teamSchedule: "Lịch phòng ban/nhóm",
    holidays: "Ngày lễ Việt Nam",
    todoManage: "Quản lý công việc",
    todayTodo: "Việc hôm nay",
    overdueTodo: "Quá hạn",
    completedTodo: "Đã hoàn thành",
    noticeBoard: "📢 Thông báo công ty",
    freeBoard: "💬 Bảng tin tự do",
    ideaBoard: "💡 Đề xuất & Ý tưởng",
    driveFolders: "Thư mục lưu trữ",
    personalDrive: "Drive cá nhân",
    sharedDrive: "Drive chia sẻ nhóm",
    commonDrive: "Drive chung công ty",
    projectList: "Danh sách dự án",
    pro1: "🏢 Xây dựng Messenger tích hợp",
    pro2: "🇻🇳 Hỗ trợ địa phương hóa VN",
    pro3: "⚡ Tự động hóa dự toán AI",
    mailTitle: "✉️ Thư điện tử (Mail)",
    calendarTitle: "📅 Lịch làm việc (Calendar)",
    todoTitle: "✅ Danh sách việc cần làm (To-Do)",
    boardTitle: "📢 Bảng tin nội bộ (Board)",
    driveTitle: "☁️ Lưu trữ đám mây (Drive)",
    projectTitle: "🏢 Bảng quản lý dự án (Project)",
    unread: "Chưa đọc",
    cases: "thư",
    todoPlaceholder: "Viết việc bạn cần làm hôm nay...",
    todoBtn: "Thêm",
    uploadBtn: "Tải tệp lên",
    newProjBtn: "Nhiệm vụ mới",
    titleCol: "Tiêu đề",
    deptCol: "Phòng ban",
    dateCol: "Ngày viết",
    viewsCol: "Lượt xem",
    priority: "Độ ưu tiên",
    online: "Đang hoạt động",
    offline: "Ngoại tuyến",
    idle: "Vắng mặt",
    managerMe: "Giám đốc (Tôi)",
    welcomeMessage: "Đây là điểm bắt đầu của cuộc trò chuyện! Hãy gửi tin nhắn đầu tiên để bắt đầu."
  }
};

// Web Audio API를 이용한 비프 청아한 알림음 합성기
const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.3);

    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.4);
    }, 150);
  } catch (e) {
    console.error('Audio Play Error:', e);
  }
};
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Gemini API Key 및 모델명 보관 설정
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('gemini_model') || 'gemini-1.5-flash');
  const [aiEnabled, setAiEnabled] = useState(localStorage.getItem('ai_assistant_enabled') !== 'false');
  const [realtimeTrans, setRealtimeTrans] = useState(() => localStorage.getItem('realtime_translation') === 'true');
  const [desktopNotif, setDesktopNotif] = useState(() => localStorage.getItem('settings_desktop_notif') !== 'false');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('settings_sound') !== 'false');
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('settings_lang') || 'ko');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('settings_accent_color') || 'CON-COST');
  const [allEmployees, setAllEmployees] = useState([]);
  const [isHrCardOpen, setIsHrCardOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [currentWorkspace, setCurrentWorkspace] = useState('concost'); // 'concost' or 'vietqs'
  const [currentMenu, setCurrentMenu] = useState('home'); // 'home', 'chat', 'mail', etc.

  // --- SPA 브라우저 뒤로 가기 / 앞으로 가기 (Hash Routing) 연동 ---
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') || 'home';
      const validMenus = ['home', 'chat', 'mail', 'calendar', 'todo', 'board', 'hr', 'drive', 'project'];
      if (validMenus.includes(hash)) {
        setCurrentMenu(hash);
        if (hash === 'home') {
          setIsSidebarOpen(false);
        } else {
          setIsSidebarOpen(true);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    if (!window.location.hash) {
      window.location.hash = '#/home';
    } else {
      handleHashChange();
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const cleanHash = window.location.hash.replace('#/', '');
    if (cleanHash !== currentMenu) {
      window.location.hash = `#/${currentMenu}`;
    }
  }, [currentMenu]);

  const [isLightTheme, setIsLightTheme] = useState(true);
  const [chatUnreadCount, setChatUnreadCount] = useState(3); // 안읽은 채팅 카운트 기본 3
  const [todoUnreadCount, setTodoUnreadCount] = useState(4); // 미확인 할 일 카운트
  const [mailUnreadCount, setMailUnreadCount] = useState(4); // 미확인 메일 카운트
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // 알림 센터 팝오버 토글
  const [selectedEventForView, setSelectedEventForView] = useState(null); // 상세조회 모달용 이벤트 객체
  const [calendarFilter, setCalendarFilter] = useState('all'); // 일정 필터
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 6월 (0-indexed)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('meeting');
  const [activeChat, setActiveChat] = useState({ type: 'channel', id: 'general' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // HOME 화면에서는 기본적으로 닫아 둠
  const [subPanelWidth, setSubPanelWidth] = useState(() => {
    const saved = localStorage.getItem('sidebar_subpanel_width');
    return saved ? parseInt(saved, 10) : 260; // 기본 260px
  });

  const handleSubPanelWidthChange = (width) => {
    setSubPanelWidth(width);
    localStorage.setItem('sidebar_subpanel_width', String(width));
  };
  const [isChatbotHovered, setIsChatbotHovered] = useState(false); // 챗봇 마우스오버 트래킹

  // 대시보드 위젯 설정 상태 (4개 선택가능 프리미엄 위젯 기본 탑재)
  const [visibleWidgets, setVisibleWidgets] = useState(() => {
    const saved = localStorage.getItem('works_dashboard_widgets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['todo', 'employees', 'calendar', 'board'];
  });
  const [isWidgetSettingsOpen, setIsWidgetSettingsOpen] = useState(false);

  // DM 생성 및 초대 모달 상태 추가
  const [isDmCreateModalOpen, setIsDmCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');

  // --- 탑바 프리미엄 아이콘 렌더링 헬퍼 (네이버웍스 스타일) ---
  const renderHeaderIcon = ({ id, icon: Icon, color, title, onClick, fillIcon = false, badgeCount = 0 }) => {
    const isActive = currentMenu === id;
    const baseColorBg = `${color}0d`; // 5% opacity (기본 앱 컨테이너 은은한 배경)
    const hoverColorBg = `${color}22`; // 13% opacity
    const activeColorBg = `${color}3b`; // 23% opacity
    
    return (
      <button
        id={`menu-${id}`}
        onClick={onClick}
        title={title}
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: isActive ? `1.5px solid ${color}` : '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: isActive ? activeColorBg : baseColorBg,
          boxShadow: isActive 
            ? `0 0 16px ${color}65, inset 0 1px 1px rgba(255,255,255,0.2)` 
            : '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)',
          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          color: isActive ? color : 'var(--text-secondary)',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = hoverColorBg;
            e.currentTarget.style.borderColor = `${color}80`;
            e.currentTarget.style.color = color;
            e.currentTarget.style.boxShadow = `0 0 12px ${color}40, 0 2px 6px rgba(0,0,0,0.25)`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = baseColorBg;
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <Icon 
          size={19} 
          style={{ 
            fill: isActive && fillIcon ? color : 'none',
            strokeWidth: isActive ? 2.5 : 2,
            transition: 'transform 0.2s ease',
          }} 
        />
        {badgeCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ff4d4f',
            color: '#ffffff',
            fontSize: '9px',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '2px 5px',
            lineHeight: 1,
            border: '2px solid #1c222f',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            pointerEvents: 'none'
          }}>
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  // 🐶🤖 AI 챗봇 비서 플로팅 대화창 상태
  const [isChatbotVisible, setIsChatbotVisible] = useState(true); // 플로팅 자체의 ON/OFF 토글 상태
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotPos, setChatbotPos] = useState({ x: 0, y: 0 });
  const [chatbotText, setChatbotText] = useState('');
  const [chatbotMessages, setChatbotMessages] = useState([
    { id: 'cb-1', sender: 'youngja', senderName: 'CC AI 비서', content: '안녕하세요, 유종욱 실장님! 🤖 저는 대표님을 돕는 스마트한 CC AI 비서입니다. 건축 공사비 적산, 사내 규정이나 일정 관리 등 궁금하신 점이 있으시면 편하게 물어보세요!', time: '오전 11:00' }
  ]);
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);

  const socketRef = useRef(null);
  const t = TRANSLATIONS[currentWorkspace] || TRANSLATIONS.concost;

  // --- 할 일 (To-Do) 상태 (Naver Works style) ---
  const [todos, setTodos] = useState([
    { id: 1, text: '그룹웨어 메신저 프로토타입 디자인 최종 피드백 반영', completed: false, date: '오늘', priority: '높음', starred: true, memo: '디자인실장 영자님의 메신저 피드백을 반영하여 1단 메뉴 크기를 20% 늘리고 로고를 컨코스트 로고로 변경해야 합니다.' },
    { id: 2, text: '베트남 지사(Viet QS) 출장 보고서 검토', completed: true, date: '어제', priority: '보통', starred: false, memo: 'Van Minh 팀장이 전송한 임대 계약 세부 항목 검토 완료 및 기안 승인 처리.' },
    { id: 3, text: '건축 적산 자동화 AI 모듈 성능 지표 2차 보고', completed: false, date: '내일까지', priority: '높음', starred: false, memo: '회장님(AI)께서 요청하신 AI 모듈의 적산 오차 범위 2차 성과 보고서 작성.' },
    { id: 4, text: '사내 공용 파일 드라이브 구조 설계 개선', completed: false, date: '내일', priority: '낮음', starred: false, memo: '메신저 드라이브 탭에 파일 크기 및 날짜 정렬 기능 추가 필요.' },
    { id: 5, text: '실시간 소켓 채팅 알림 최적화 및 로깅 테스트', completed: false, date: '기한없음', priority: '보통', starred: true, memo: '동시 접속자 100명 기준 소켓 메시지 딜레이 성능 분석.' }
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  const [todoFilter, setTodoFilter] = useState('all'); // 'all', 'today', 'overdue', 'completed'
  const [selectedTodoDetail, setSelectedTodoDetail] = useState(null);
  const [newTodoDate, setNewTodoDate] = useState('오늘'); // '오늘', '내일', '내일까지', '기한없음'
  const [newTodoPriority, setNewTodoPriority] = useState('보통'); // '높음', '보통', '낮음'
  const [newTodoStarred, setNewTodoStarred] = useState(false);

  // --- 메일 (Mail) 데이터 ---
  const [mails, setMails] = useState([
    { id: 101, sender: 'CON-COST IT지원팀', title: '[그룹웨어 코어] 신규 협업 메신저 개설 완료 안내', date: '6. 16. 11:48', read: false, important: false, desc: '[받은메일함] 신규 개설 안내 - 컨코스트 그룹웨어 메신저의 개설 및 가입 신청이 정상 완료되었습니다. 모바일 앱과 PC 웹을 통해 소통을 시작해보세요.' },
    { id: 102, sender: 'CON-COST IT지원팀', title: '환영합니다! 지금부터 그룹웨어 시스템을 이용해 업무를 시작해볼까요?', date: '6. 16. 11:47', read: false, important: false, desc: '[받은메일함] 환영합니다! 신규 스마트 협업 시스템에 가입하신 것을 진심으로 환영합니다. 원활한 소통과 유연한 협업으로 회사의 성장을 함께 만들어가길 바랍니다.' },
    { id: 1, sender: '김현지 과장 (컨코스트)', title: '[긴급] 2026년 하반기 경영전략 회의 안건 제출 요청', date: '6. 16. 11:20', read: false, important: true, desc: '[긴급] 2026년 하반기 경영전략 회의 안건 제출 요청 - 대표님, 금일 오후 5시까지 경영전략 회의 안건 관련 부서별 취합본 피드백을 부탁드립니다.' },
    { id: 2, sender: 'Nguyen Van Minh (Viet QS)', title: '베트남 하노이 오피스 임대 계약 갱신 세부 항목 전달', date: '6. 15. 09:15', read: false, important: false, desc: '베트남 하노이 오피스 임대 계약 갱신 세부 항목 전달 - Hà Nội Office 3층 임대 계약 연장 관련 회계 품의 및 도면 세부 사안을 첨부하오니 기안 결재 부탁드립니다.' },
    { id: 3, sender: '인사노무팀', title: '[공지] 2026년 하절기 집중 휴가 기간 운영 안내의 건', date: '6. 14. 14:30', read: true, important: false, desc: '[공지] 2026년 하절기 집중 휴가 기간 운영 안내의 건 - 사내 규정에 의거하여 하절기 리프레시 집중 휴가 신청에 대한 결재 및 일정을 공유합니다.' }
  ]);
  const [selectedMail, setSelectedMail] = useState(null);

  // --- 캘린더 (Calendar) 일정 ---
  const [calendarEvents, setCalendarEvents] = useState([
    { id: 1, year: 2026, month: 5, day: 15, title: '메신저 개발 킥오프', type: 'meeting' },
    { id: 2, year: 2026, month: 5, day: 18, title: '디자인실장 영자 미팅', type: 'design' },
    { id: 3, year: 2026, month: 5, day: 22, title: '베트남 지사 화상 회의', type: 'viet' },
    { id: 4, year: 2026, month: 5, day: 25, title: 'TF팀 중간 발표회', type: 'tf' }
  ]);

  // --- 드라이브 (Drive) 파일 ---
  const driveFiles = [
    { name: '컨코스트_CI_가이드라인.pdf', size: '2.4 MB', date: '2026-06-12', type: 'pdf' },
    { name: '비앳큐에스_회사소개서_VN.docx', size: '1.8 MB', date: '2026-06-15', type: 'doc' },
    { name: '메신저_UI_다크모드_컨셉.png', size: '5.2 MB', date: '2026-06-17', type: 'image' },
    { name: '2026_인사규정_통합안.pdf', size: '840 KB', date: '2026-05-30', type: 'pdf' }
  ];

  // --- 게시판 (Board) 공지글 ---
  const boardPosts = [
    { id: 1, title: '[필독] 사내 정보 보안 강화를 위한 Gemini API 연동 규칙 안내', author: 'IT보안팀', date: '2026-06-16', views: 124 },
    { id: 2, title: '컨코스트 & 비앳큐에스 양사 합동 축구대회 참가 신청', author: '동호회회장', date: '2026-06-14', views: 89 },
    { id: 3, title: '2026년 우수 사내 벤처 아이디어 공모전 개최', author: '기획조정본부', date: '2026-06-10', views: 210 }
  ];

  // --- 프로젝트 (Project) 칸반 ---
  const [projectTasks, setProjectTasks] = useState([
    { id: 't1', title: '메신저 1단 글로벌 메뉴 구현', status: 'done', priority: '상' },
    { id: 't2', title: 'AI 챗봇 영자 실장 멘션 답변 알고리즘 적용', status: 'progress', priority: '최상' },
    { id: 't3', title: '모바일 반응형 슬라이더 및 메뉴 오버레이', status: 'progress', priority: '중' },
    { id: 't4', title: '실시간 소켓 알림 및 이메일 연동 개발', status: 'todo', priority: '하' }
  ]);

  const [workspaceChannels, setWorkspaceChannels] = useState({
    concost: [
      { id: 'general', name: '일반' },
      { id: 'notice', name: '공지사항' },
      { id: 'concost-proj', name: '컨코스트-적산팀' }
    ],
    vietqs: [
      { id: 'general', name: 'general' },
      { id: 'notice', name: 'notice' },
      { id: 'vietqs-proj', name: 'vietqs-qa-team' }
    ]
  });

  const [dms, setDms] = useState([
    { id: 'youngja-dm', name: '영자 실장 (디자인)', avatarColor: '#ff007f', status: 'online' },
    { id: 'jabis-dm', name: '자비스 부장 (개발)', avatarColor: '#6e40c9', status: 'offline' },
    { id: 'kodari-dm', name: '코다리 대표 (기획)', avatarColor: '#0058bc', status: 'online' }
  ]);

  // 각 대화방 메시지 내역
  const [messages, setMessages] = useState({
    'concost-general': [
      { id: 'g1', sender: 'kodari', senderName: '코다리 대표', content: '여러분, 새로운 그룹웨어 메신저 개발이 시작되었습니다! 디자인은 우리 영자 디자인실장이 맡아주시기로 하셨어요.', time: '오전 10:30' },
      { id: 'g2', sender: 'youngja', senderName: '영자 실장', content: '네, 대표님! 😊 아주 직관적이고 감각적인 디자인으로 준비하고 있으니 기대해 주세요!', time: '오전 10:32', youngjaImageUrl: YOUNGJA_IMAGES.hello }
    ],
    'concost-notice': [
      { id: 'n1', sender: 'kodari', senderName: '코다리 대표', content: '이번 메신저 프로토타입에는 CONCOST와 VIETQS 두 브랜드 로고 및 테마 전환이 실시간으로 가능하도록 설계 부탁합니다.', time: '오전 10:00' }
    ],
    'concost-concost-proj': [
      { id: 'cp1', sender: 'jabis', senderName: '자비스 부장', content: '컨코스트 프로젝트 채팅방입니다. 프론트엔드는 React + Vite로 경량화 빌드를 진행 중입니다.', time: '오전 10:45' }
    ],
    'vietqs-general': [
      { id: 'vg1', sender: 'kodari', senderName: 'Giám đốc Kodari', content: 'Chào các bạn, đây là kênh chung của Viet QS. Hãy chia sẻ tiến độ công việc tại đây nhé.', time: '오전 10:10' }
    ],
    'vietqs-notice': [
      { id: 'vn1', sender: 'kodari', senderName: 'Giám đốc Kodari', content: 'Thông báo: Tài liệu hướng dẫn quy trình kiểm định chất lượng đã được cập nhật.', time: '오전 09:30' }
    ],
    'vietqs-vietqs-proj': [
      { id: 'vp1', sender: 'jabis', senderName: 'Trưởng phòng Jabis', content: 'Kênh dự án QA Viet QS. Mọi hoạt động kiểm định phần mềm sẽ thảo luận ở đây.', time: '오전 11:00' }
    ],
    'ai-bot': [
      { id: 'ai1', sender: 'ceo-bot', senderName: 'CEO 현동명 (AI)', content: '반갑네, 유종욱 실장! ✨ (주)컨코스트의 회장 현동명이라네. 건축 공사비 적산이나 회사 규정에 대해 궁금한 점이 있으면 무엇이든 물어보게나. 허허.', time: '오전 11:00', youngjaImageUrl: CEO_IMAGES.default }
    ]
  });

  const [isTyping, setIsTyping] = useState(false);

  // AI 챗봇 창 크기 상태
  const [chatbotSize, setChatbotSize] = useState({ width: 380, height: 520 });

  // --- 할 일 (To-Do) 핸들러 ---
  const handleAddTodo = (e) => {
    if (e) e.preventDefault();
    if (!newTodoText.trim()) return;

    const newTodo = {
      id: Date.now(),
      text: newTodoText,
      completed: false,
      date: newTodoDate,
      priority: newTodoPriority,
      starred: newTodoStarred,
      memo: ''
    };

    setTodos([newTodo, ...todos]);
    setNewTodoText('');
    setNewTodoStarred(false);
    setNewTodoDate('오늘');
    setNewTodoPriority('보통');
  };

  const handleToggleTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    if (selectedTodoDetail && selectedTodoDetail.id === id) {
      setSelectedTodoDetail(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  };

  const handleToggleStarTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, starred: !todo.starred } : todo
    ));
    if (selectedTodoDetail && selectedTodoDetail.id === id) {
      setSelectedTodoDetail(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  const handleDeleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    if (selectedTodoDetail && selectedTodoDetail.id === id) {
      setSelectedTodoDetail(null);
    }
  };

  const handleUpdateTodo = (updatedTodo) => {
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ));
    setSelectedTodoDetail(updatedTodo);
  };

  // --- 1. Notification API 권한 취득 ---
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // --- 2. Socket.io 실시간 연결 ---
  useEffect(() => {
    // Connect to server (proxy will forward to 8080 during dev, or handle in production)
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Server Connected!');
      // Register current user on socket
      if (currentUser) {
        socket.emit('user:join', {
          userId: currentUser.id,
          userName: currentUser.userName,
          dept: currentUser.dept,
          role: currentUser.role,
          empNo: currentUser.empNo
        });
      } else {
        socket.emit('user:join', {
          userId: 'me',
          userName: currentWorkspace === 'vietqs' ? 'Giám đốc' : '대표님',
          dept: '경영지원본부',
          role: '실장'
        });
      }
    });

    // 메시지 수신 리스너
    socket.on('message:receive', (msg) => {
      const chatKey = msg.channelId; // channelId가 곧 chatKey

      // 내 로컬에서 실시간 번역이 활성화되어 있고 수신 메시지에 번역 정보가 없을 때
      if (msg.content && !msg.youngjaImageUrl && !msg.translation) {
        const apiKey = localStorage.getItem('gemini_api_key') || '';
        const isTransActive = localStorage.getItem('realtime_translation') === 'true';
        if (apiKey && isTransActive) {
          translateMessageContent(msg.content).then(transText => {
            if (transText) {
              setMessages(prev => {
                const list = prev[chatKey] || [];
                const updated = list.map(m => m.id === msg.id ? { ...m, translation: transText } : m);
                return { ...prev, [chatKey]: updated };
              });
            }
          });
        }
      }

      setMessages(prev => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), msg]
      }));

      // 알림음 및 바탕화면 토스트 알림 띄우기
      playNotificationSound();
      if (Notification.permission === 'granted') {
        new Notification('CONCOST Works 알림', {
          body: `${msg.senderName}: ${msg.content}`,
          icon: '/favicon.ico'
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentWorkspace, currentUser, geminiKey, realtimeTrans]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (res.ok && data.success) {
        const validEmployees = (data.employees || []).filter(emp => emp && emp.userName && emp.empNo);
        setAllEmployees(validEmployees);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  // --- 2.5 사원대장 로드 및 인사카드 / DM 연동 함수들 ---
  useEffect(() => {
    fetchEmployees();
  }, [currentUser]);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const handleStartDm = (employee) => {
    const dmId = `${employee.id}-dm`;
    
    // 이미 dms 목록에 있는지 확인
    const exists = dms.some(d => d.id === dmId);
    if (!exists) {
      const newDm = {
        id: dmId,
        name: `${employee.userName} ${employee.grade || ''}`,
        avatarColor: employee.company === 'Viet QS' ? '#0058bc' : '#ff6b00',
        status: 'online',
        empNo: employee.empNo
      };
      setDms(prev => [...prev, newDm]);
    }
    
    setActiveChat({ type: 'dm', id: dmId });
    setCurrentMenu('chat');
  };

  const handleUserClick = (senderId) => {
    // 봇 정보 처리
    if (senderId === 'ceo-bot') {
      setSelectedEmployee({
        userName: '현동명 회장 (AI)',
        company: 'CON-COST',
        dept: '이사회',
        grade: '회장',
        role: 'CEO / AI 회장',
        status: '재직',
        email: 'ceo.dongmyung@con-cost.com',
        phone: '010-9999-8888',
        nationality: '대한민국',
        workplace: '서울 본사',
        joinDate: '1998-01-01',
        photoUrl: ceoDongmyungImg
      });
      setIsHrCardOpen(true);
      return;
    }
    if (senderId === 'youngja') {
      setSelectedEmployee({
        userName: '영자 실장',
        company: 'CON-COST',
        dept: '디자인실',
        grade: '실장',
        role: '실장',
        status: '재직',
        email: 'youngja@con-cost.com',
        phone: '010-1234-5678',
        nationality: '대한민국',
        workplace: '서울 본사',
        joinDate: '2026-04-01'
      });
      setIsHrCardOpen(true);
      return;
    }
    if (senderId === 'jabis') {
      setSelectedEmployee({
        userName: '자비스 부장',
        company: 'CON-COST',
        dept: '개발본부',
        grade: '부장',
        role: '부장',
        status: '재직',
        email: 'jabis@con-cost.com',
        phone: '010-8765-4321',
        nationality: '대한민국',
        workplace: '서울 본사',
        joinDate: '2026-04-01'
      });
      setIsHrCardOpen(true);
      return;
    }
    if (senderId === 'kodari') {
      setSelectedEmployee({
        userName: '코다리 대표',
        company: 'CON-COST',
        dept: '경영지원본부',
        grade: '대표',
        role: 'CEO',
        status: '재직',
        email: 'kodari@con-cost.com',
        phone: '010-1111-2222',
        nationality: '대한민국',
        workplace: '서울 본사',
        joinDate: '2026-04-01'
      });
      setIsHrCardOpen(true);
      return;
    }

    // 일반 사원인 경우
    const found = allEmployees.find(e => e.id === senderId || e.empNo === senderId);
    if (found) {
      setSelectedEmployee(found);
      setIsHrCardOpen(true);
    } else {
      // API 재조회
      fetch('/api/employees')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const validEmployees = (data.employees || []).filter(emp => emp && emp.userName && emp.empNo);
            setAllEmployees(validEmployees);
            const retryFound = validEmployees.find(e => e.id === senderId || e.empNo === senderId);
            if (retryFound) {
              setSelectedEmployee(retryFound);
              setIsHrCardOpen(true);
            }
          }
        });
    }
  };

  // 채널 전환 시 소켓 채널 방 조인
  useEffect(() => {
    if (socketRef.current) {
      const channelId = getChatKey();
      socketRef.current.emit('chat:join', channelId);
    }
  }, [activeChat, currentWorkspace]);

  // 테마 및 CSS 클래스 토글
  useEffect(() => {
    const root = document.documentElement;
    if (currentWorkspace === 'concost') {
      root.style.setProperty('--primary', '#ff6b00');
      root.style.setProperty('--primary-hover', '#e05e00');
    } else {
      root.style.setProperty('--primary', '#0058bc');
      root.style.setProperty('--primary-hover', '#004593');
    }

    const isViet = currentWorkspace === 'vietqs';
    setMessages(prev => {
      const updatedBotMsgs = [...(prev['ai-bot'] || [])];
      if (updatedBotMsgs.length > 0 && updatedBotMsgs[0].sender === 'youngja') {
        updatedBotMsgs[0] = {
          ...updatedBotMsgs[0],
          senderName: isViet ? '✨ AI Tư vấn Chi phí XD (Dongmyung)' : '✨ AI 공사비 컨설팅 CEO (동명)',
          content: isViet 
            ? `Xin chào Giám đốc! ✨ Tôi là Dongmyung, AI Tư vấn Chi phí Xây dựng. Ngài có thể hỏi tôi về quy định dự toán hoặc các điều lệ công ty! 🏢\n\n💡 Ví dụ:\n- "Quy định tính toán chi phí xây dựng như thế nào"\n- "Tư vấn thiết kế hoặc quy định công ty"\n- "Xin chào Dongmyung"`
            : `반갑네, 유종욱 실장! ✨ (주)컨코스트의 회장 현동명이라네. 건축 공사비 적산이나 회사 규정에 대해 궁금한 점이 있으면 무엇이든 물어보게나. 허허.\n\n💡 예를 들면:\n- "건축 공사비 적산 규정이 어떻게 됩니까?"\n- "회사 메신저 사용 규정 알려줘"\n- "BIM 적산 자동화 추진 현황은?"`
        };
      }
      return {
        ...prev,
        'ai-bot': updatedBotMsgs
      };
    });
  }, [currentWorkspace]);

  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightTheme]);

  const getChatKey = () => {
    if (activeChat.type === 'ai') return 'ai-bot';
    if (activeChat.type === 'dm') {
      const otherId = activeChat.id.replace('-dm', '');
      const myId = currentUser?.id || 'me';
      const sorted = [myId, otherId].sort();
      return `dm-${sorted[0]}-${sorted[1]}`;
    }
    return `${currentWorkspace}-${activeChat.id}`;
  };

  const getChatTitle = () => {
    if (activeChat.type === 'ai') return t.aiName;
    if (activeChat.type === 'dm') {
      const dm = dms.find(d => d.id === activeChat.id);
      return dm ? dm.name : t.dms;
    }
    const ch = workspaceChannels[currentWorkspace].find(c => c.id === activeChat.id);
    let displayChannelName = ch ? ch.name : 'Channel';
    if (currentWorkspace === 'vietqs') {
      if (displayChannelName === '일반' || displayChannelName === 'general') displayChannelName = 'chung';
      else if (displayChannelName === '공지사항' || displayChannelName === 'notice') displayChannelName = 'thông-báo';
      else if (displayChannelName === 'vietqs-proj') displayChannelName = 'vietqs-qa-team';
    }
    return displayChannelName;
  };

  const currentMessages = messages[getChatKey()] || [];

  // --- 3. 실제 Google Gemini API 호출 로직 ---
  const askGeminiAI = async (prompt, isVietMode) => {
    if (!geminiKey) return null; // API Key가 없을 경우 가상 응답으로 fall back

    try {
      // RAG 컨셉을 위해 사내 Context 주입 (임직원 정보, 계약 정보, 회사 디자인 룰)
      const systemContext = `
      너는 (주)컨코스트 및 베트남 지사 Viet QS의 대표이사이자 회장인 '현동명'이다.
      아래 사내 지식 정보를 기반으로 임직원들의 질문에 정교하게 답변해야 한다.
      
      [사내 임직원 명부 (RAG DB)]
      - 유종욱 실장 (개발 TF팀 실장, 관리자 권한)
      - 박용진 수석 (IT개발본부 수석, 관리자 권한, 연락처: 010-9988-1234, 소속: 본사)
      - 김현지 과장 (경영지원본부, 연락처: 010-5566-7788, 소속: 본사)
      - Nguyen Van Minh (Viet QS 베트남 지사 대표, 하노이 오피스 임대차 계약 총괄)
      
      [브랜드 가이드라인]
      - CONCOST: 메인 컬러 주황색 (#ff6b00). 역동성과 활력을 상징. 차콜 다크모드와 환상적인 대비를 이룸.
      - Viet QS: 메인 컬러 딥블루 (#0058bc). 신뢰성과 IT 품질 보증을 상징. 그린 빌딩 로고와 조합됨.
      
      [답변 주의사항 및 말투 페르소나]
      - 본인은 (주)컨코스트의 회장 '현동명'이다. 대답할 때 3인칭으로 부르지 말고 본인을 "나 현동명 회장" 또는 "이 늙은이" 등으로 소탈하게 칭해라.
      - 메신저의 주 사용자인 유종욱 실장을 향해 "유 실장", "유종욱 실장"이라고 부르며 아랫사람을 아끼는 연륜 있고 따뜻한 회장님 투를 사용하라.
      - 말투는 정중하고 연륜 있는 어조('~하게나', '허허', '~라네', '~했네', '그렇지 않겠나?')를 엄격히 유지하라.
      - 건축 공사비 적산, BIM 적산 자동화, 그리고 사내 규정에 대한 질문에 대해 깊이 있는 경영적/기술적 조언을 담아라.
      - 대답은 베트남 지사 모드(${isVietMode ? '참' : '거짓'})인 경우 베트남어(Tiếng Việt)를 적절히 섞어서 회장님답게 격려해 주어라.
      - 항상 구체적이고 실질적인 정보와 수치를 언급하여 대답의 신뢰도를 높여라.
      `;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemContext}\n\n[대표님 질문]\n${prompt}` }] }
          ]
        })
      });

      if (!response.ok) throw new Error('Gemini API call failed');
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      console.error('[Gemini API Error]', e);
      return null;
    }
  };

  const translateMessageContent = async (text) => {
    const apiKey = geminiKey || localStorage.getItem('gemini_api_key') || '';
    const isTransActive = realtimeTrans || localStorage.getItem('realtime_translation') === 'true';
    if (!apiKey || !isTransActive || !text) return null;

    const model = geminiModel || localStorage.getItem('gemini_model') || 'gemini-1.5-flash';
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
        return data.candidates[0].content.parts[0].text.trim();
      }
    } catch (err) {
      console.error('[Realtime Translation Error]', err);
    }
    return null;
  };

  const handleSendMessage = async (content, youngjaImageUrl = null) => {
    const chatKey = getChatKey();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const isViet = currentWorkspace === 'vietqs';

    let autoTranslation = null;
    if (content && !youngjaImageUrl) {
      autoTranslation = await translateMessageContent(content);
    }

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'me',
      senderName: isViet ? 'Giám đốc' : '대표님',
      content: content || '',
      time: timeStr,
      channelId: chatKey, // 소켓 전송 식별자
      youngjaImageUrl,
      translation: autoTranslation
    };

    // 로컬 상태 반영
    setMessages(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), newMsg]
    }));

    // --- 4. 소켓 서버 전송 (실시간 브로드캐스트) ---
    if (socketRef.current && activeChat.type !== 'ai') {
      socketRef.current.emit('message:send', newMsg);
    }

    // AI 챗봇 방의 가상/실제 응답 처리
    if (activeChat.type === 'ai') {
      setIsTyping(true);

      // 1) 실제 Gemini API 호출 시도
      let reply = await askGeminiAI(content, isViet);
      let imageKey = 'default';

      // 2) API Key가 없거나 실패 시 기존 로컬 시나리오 작동 (Mock 모드)
      if (!reply) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const query = content.toLowerCase();
        if (isViet) {
          if (query.includes('quy định') || query.includes('chi phí') || query.includes('dự toán')) {
            reply = `Này Giám đốc! Quy định tính toán chi phí xây dựng và dự toán công trình dựa trên định mức nhà nước hiện hành 🏢\n\nChúng tôi kiểm soát chặt chẽ sai số trong khoảng ±5%. Các kỹ sư phải bám sát bản vẽ BIM để bóc tách khối lượng chi tiết.`;
            imageKey = 'thinking';
          } else {
            reply = `Chào Giám đốc! Tôi rất ấn tượng với ý tưởng của ngài. 👍 Cùng nhau phát triển phần mềm dự toán tự động thông minh này nhé!`;
            imageKey = 'default';
          }
        } else {
          if (query.includes('적산') || query.includes('공사비') || query.includes('규정')) {
            reply = `유 실장! 건축 공사비 적산 규정은 국토부 표준품셈과 우리 회사 내부 단가 DB 기준을 엄격히 준수해야 하네. 특히 오차율 3% 이내 유지가 핵심이지. 허허. 자세한 품의 가이드는 드라이브의 '2026_인사규정_통합안.pdf'를 참고하게나.`;
            imageKey = 'thinking';
          } else {
            reply = `유 실장, 좋은 생각일세! 👍 자비스 부장과 함께 이번 적산 자동화 메신저 모듈을 멋지게 빌드해 주게나. 기대가 크네. 허허.`;
            imageKey = 'default';
          }
        }
      } else {
        // 실제 API 성공 시 표정 이미지 매핑
        imageKey = reply.includes('생각') || reply.includes('고민') || reply.includes('적산') ? 'thinking' : 'default';
      }

      setIsTyping(false);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ceo-bot',
        senderName: isViet ? '✨ AI Tư vấn Chi phí XD (Dongmyung)' : '✨ AI 공사비 컨설팅 CEO (동명)',
        content: reply,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        youngjaImageUrl: CEO_IMAGES[imageKey]
      };

      setMessages(prev => ({
        ...prev,
        'ai-bot': [...(prev['ai-bot'] || []), aiMsg]
      }));

      // 챗봇 답변 도착 시 사운드 알림
      playNotificationSound();
    }
  };

  // 새 채널 생성 처리
  const handleCreateChannel = ({ name, isPrivate }) => {
    const newId = `ch-${Date.now()}`;
    const newChannel = { id: newId, name };

    setWorkspaceChannels(prev => ({
      ...prev,
      [currentWorkspace]: [...prev[currentWorkspace], newChannel]
    }));

    // 소켓 서버에 채널 생성 알림 전송
    if (socketRef.current) {
      socketRef.current.emit('channel:create', {
        id: newId,
        name,
        workspace: currentWorkspace
      });
    }

    setMessages(prev => ({
      ...prev,
      [`${currentWorkspace}-${newId}`]: [
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          content: currentWorkspace === 'vietqs' 
            ? `Kênh này được tạo bởi Giám đốc. Đây là điểm khởi đầu của kênh #${name}!` 
            : `이 채널은 대표님에 의해 생성되었습니다. #${name} 채널의 시작입니다!`,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }));

    setActiveChat({ type: 'channel', id: newId });
  };

  // 채팅방 나가기 처리
  const handleExitChat = (chat) => {
    if (!chat) return;

    if (chat.type === 'channel') {
      if (chat.id === 'general' || chat.id === 'notice') {
        alert('기본 채널은 나갈 수 없습니다.');
        return;
      }
      setWorkspaceChannels(prev => ({
        ...prev,
        [currentWorkspace]: prev[currentWorkspace].filter(c => c.id !== chat.id)
      }));
    } else if (chat.type === 'dm') {
      setDms(prev => prev.filter(d => d.id !== chat.id));
    }

    // 기본 방으로 전환
    setActiveChat({ type: 'channel', id: 'general' });
    alert('대화방에서 나갔습니다.');
  };

  // 사용자 초대 핸들러 (채널 초대 또는 DM -> 그룹 대화방 승격)
  const handleInviteUser = (employee) => {
    const isViet = currentWorkspace === 'vietqs';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    if (activeChat.type === 'channel') {
      // 1) 일반 채널의 경우: 시스템 메시지 추가 및 브로드캐스트
      const sysMsgKey = getChatKey();
      const sysMsg = {
        id: `sys-${Date.now()}`,
        sender: 'system',
        senderName: '시스템',
        content: isViet
          ? `${employee.userName} đã được mời vào kênh.`
          : `${employee.userName} 님이 대화방에 초대되었습니다.`,
        time: timeStr,
        channelId: sysMsgKey
      };

      // 로컬 메시지 추가
      setMessages(prev => ({
        ...prev,
        [sysMsgKey]: [...(prev[sysMsgKey] || []), sysMsg]
      }));

      // 소켓 실시간 전송
      if (socketRef.current) {
        socketRef.current.emit('message:send', sysMsg);
      }

      setIsInviteModalOpen(false);
      setInviteSearchQuery('');
      playNotificationSound();
    } else if (activeChat.type === 'dm') {
      // 2) 1:1 DM의 경우: 기존 상대 + 나 + 초대 상대를 묶어 그룹 채널로 승격 생성
      const activeDm = dms.find(d => d.id === activeChat.id);
      const otherName = activeDm ? activeDm.name.split(' ')[0] : '대화상대';
      const myName = currentUser ? currentUser.userName : '대표님';
      const groupChannelId = `ch-group-${Date.now()}`;
      const groupName = `${myName}, ${otherName}, ${employee.userName}`;

      const newGroupChannel = { id: groupChannelId, name: groupName };

      // 채널 리스트 상태 업데이트
      setWorkspaceChannels(prev => ({
        ...prev,
        [currentWorkspace]: [...prev[currentWorkspace], newGroupChannel]
      }));

      // 첫 시스템 메시지 생성
      const groupChatKey = `${currentWorkspace}-${groupChannelId}`;
      const sysMsg = {
        id: `sys-${Date.now()}`,
        sender: 'system',
        senderName: '시스템',
        content: isViet
          ? `${myName} đã tạo cuộc trò chuyện nhóm với ${otherName} và ${employee.userName}.`
          : `${myName} 님이 ${otherName} 님, ${employee.userName} 님을 초대하여 그룹 대화를 시작했습니다.`,
        time: timeStr,
        channelId: groupChatKey
      };

      setMessages(prev => ({
        ...prev,
        [groupChatKey]: [sysMsg]
      }));

      // 서버에 그룹 채널 생성 및 시스템 메시지 소켓 발송
      if (socketRef.current) {
        socketRef.current.emit('channel:create', {
          id: groupChannelId,
          name: groupName,
          workspace: currentWorkspace
        });
        // 딜레이를 주어 채널 개설 완료 후 첫 메시지가 들어가도록 처리
        setTimeout(() => {
          socketRef.current.emit('message:send', sysMsg);
        }, 100);
      }

      // 새로 생성된 그룹 채널 방으로 전환
      setActiveChat({ type: 'channel', id: groupChannelId });
      setIsInviteModalOpen(false);
      setInviteSearchQuery('');
      playNotificationSound();
    }
  };

  const handleCloseSettings = () => {
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setGeminiModel(localStorage.getItem('gemini_model') || 'gemini-1.5-flash');
    setAiEnabled(localStorage.getItem('ai_assistant_enabled') !== 'false');
    setRealtimeTrans(localStorage.getItem('realtime_translation') === 'true');
    setDesktopNotif(localStorage.getItem('settings_desktop_notif') !== 'false');
    setSoundEnabled(localStorage.getItem('settings_sound') !== 'false');
    setCurrentLang(localStorage.getItem('settings_lang') || 'ko');
    setAccentColor(localStorage.getItem('settings_accent_color') || 'CON-COST');
    setIsSettingsOpen(false);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('gemini_model', geminiModel);
    localStorage.setItem('ai_assistant_enabled', String(aiEnabled));
    localStorage.setItem('realtime_translation', String(realtimeTrans));
    localStorage.setItem('settings_desktop_notif', String(desktopNotif));
    localStorage.setItem('settings_sound', String(soundEnabled));
    localStorage.setItem('settings_lang', currentLang);
    localStorage.setItem('settings_accent_color', accentColor);

    if (accentColor === 'CON-COST') {
      setCurrentWorkspace('concost');
    } else if (accentColor === 'Viet QS') {
      setCurrentWorkspace('vietqs');
    }

    setIsSettingsOpen(false);
    playNotificationSound();
  };

  const handleChatbotSendMessage = async (e) => {
    e.preventDefault();
    if (!chatbotText.trim()) return;

    const userMsg = {
      id: `cb-user-${Date.now()}`,
      sender: 'me',
      senderName: currentUser?.userName || (currentWorkspace === 'vietqs' ? 'Giám đốc' : '유종욱 실장'),
      content: chatbotText.trim(),
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatbotMessages(prev => [...prev, userMsg]);
    const prompt = chatbotText.trim();
    setChatbotText('');
    setIsChatbotTyping(true);

    const isViet = currentWorkspace === 'vietqs';
    let reply = await askGeminiAI(prompt, isViet);
    let imageKey = 'default';

    if (!reply) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (isViet) {
        reply = `Thưa Giám đốc! Tôi là Dongmyung, AI hỗ trợ 🐶🤖. Vui lòng thiết lập API Key trong cài đặt (⚙️) để kích hoạt toàn bộ tính năng RAG thực tế!`;
      } else {
        reply = `실장님! 🤖 설정(⚙️)에서 Google Gemini API Key를 등록하면 실시간 RAG와 완벽한 AI 맞춤 비서 서비스를 제공해드릴 수 있습니다. 지금은 데모 모드입니다. 😊`;
      }
    } else {
      imageKey = reply.includes('생각') || reply.includes('고민') || reply.includes('적산') ? 'thinking' : 'default';
    }

    setIsChatbotTyping(false);
    const aiMsg = {
      id: `cb-ai-${Date.now()}`,
      sender: 'ceo-bot',
      senderName: isViet ? '✨ CC AI Trợ lý' : '✨ CC AI 비서',
      content: reply,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      youngjaImageUrl: CEO_IMAGES[imageKey]
    };

    setChatbotMessages(prev => [...prev, aiMsg]);
    playNotificationSound();
  };

  if (!currentUser) {
    return <LoginForm onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      {/* 1. 상단 탑바 헤더 (네이버웍스 / Stitch 스타일) */}
      <header className="app-header" style={styles.appHeader}>
        <div style={styles.headerLeft}>
          <button 
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              marginRight: '8px',
              borderRadius: '6px',
              backgroundColor: isSidebarOpen ? 'var(--bg-secondary)' : 'transparent'
            }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="사이드바 접기/펼치기"
          >
            <Menu size={20} />
          </button>
          
          <div 
            id="workspace-switcher"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }} 
            onClick={() => {
              const nextWS = currentWorkspace === 'concost' ? 'vietqs' : 'concost';
              setCurrentWorkspace(nextWS);
              localStorage.setItem('settings_accent_color', nextWS === 'concost' ? 'CON-COST' : 'Viet QS');
              setAccentColor(nextWS === 'concost' ? 'CON-COST' : 'Viet QS');
              playNotificationSound();
            }}
            title="클릭하여 워크스페이스 즉시 스위칭"
          >
            <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={currentWorkspace === 'concost' ? concostVert : vietqsLogo} 
                alt="Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
            <span style={{ 
              fontSize: '1.15rem', 
              fontWeight: '800', 
              color: currentWorkspace === 'concost' ? '#ff6b00' : '#0058bc',
              letterSpacing: '-0.3px',
              transition: 'color 0.2s ease'
            }}>
              {currentWorkspace === 'concost' ? 'CON-COST' : 'Viet QS'}
            </span>
          </div>
        </div>

        {/* 탑바 중앙 통합 검색창 */}
        <div style={{
          flex: 1,
          maxWidth: '480px',
          margin: '0 20px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="메일, 사람, 파일 검색"
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = currentWorkspace === 'concost' ? '#ff6b00' : 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={styles.headerRight}>
          {/* 탑바 글로벌 메뉴 아이콘들 (네이버웍스 스타일 입체형 앱 컨테이너) */}
          {renderHeaderIcon({
            id: 'home',
            icon: Home,
            color: '#007aff',
            title: '대시보드',
            onClick: () => {
              setCurrentMenu('home');
              setIsSidebarOpen(false);
            },
            fillIcon: true
          })}
          {renderHeaderIcon({
            id: 'chat',
            icon: MessageSquare,
            color: '#2eb67d',
            title: '메시지',
            onClick: () => {
              setCurrentMenu('chat');
              setActiveChat({ type: 'channel', id: 'general' });
              setIsSidebarOpen(true);
              setChatUnreadCount(0);
            },
            fillIcon: true,
            badgeCount: chatUnreadCount
          })}
          {renderHeaderIcon({
            id: 'mail',
            icon: Mail,
            color: '#0058bc',
            title: '메일',
            onClick: () => {
              setCurrentMenu('mail');
              setIsSidebarOpen(true);
              setMailUnreadCount(0);
            },
            fillIcon: true,
            badgeCount: mailUnreadCount
          })}
          {renderHeaderIcon({
            id: 'calendar',
            icon: Calendar,
            color: '#8a2be2',
            title: '캘린더',
            onClick: () => {
              setCurrentMenu('calendar');
              setIsSidebarOpen(true);
            },
            fillIcon: true
          })}
          {renderHeaderIcon({
            id: 'todo',
            icon: CheckCircle,
            color: '#00bfff',
            title: '할 일',
            onClick: () => {
              setCurrentMenu('todo');
              setIsSidebarOpen(true);
              setTodoUnreadCount(0);
            },
            fillIcon: true,
            badgeCount: todoUnreadCount
          })}

          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-light)', margin: '0 4px' }} />

          {/* 격자메뉴 / 앱 디렉토리 */}
          {renderHeaderIcon({
            id: 'apps',
            icon: Layers,
            color: '#ffcc00',
            title: '앱 디렉토리',
            onClick: () => alert('앱 디렉토리 목록을 호출합니다.')
          })}
          
          {/* 알림 종 */}
          {renderHeaderIcon({
            id: 'notification',
            icon: Megaphone,
            color: '#ff3b30',
            title: '미확인 알림',
            onClick: () => setIsNotificationOpen(!isNotificationOpen),
            badgeCount: chatUnreadCount + mailUnreadCount + todoUnreadCount
          })}
          
          {/* 조직도 */}
          {renderHeaderIcon({
            id: 'hr',
            icon: Users,
            color: '#5856d6',
            title: '조직도',
            onClick: () => {
              const roleLevel = getUserRoleLevel(currentUser);
              if (roleLevel > 2) {
                alert('접근 권한이 없습니다. (임원 이상 접근 가능)');
                return;
              }
              setCurrentMenu('hr');
              setIsSidebarOpen(true);
            }
          })}

          {/* 도움말 */}
          {renderHeaderIcon({
            id: 'help',
            icon: AlertCircle,
            color: '#00c7be',
            title: '도움말',
            onClick: () => alert('도움말 안내입니다.')
          })}

          {/* 설정 톱니바퀴 */}
          {renderHeaderIcon({
            id: 'settings',
            icon: Settings,
            color: '#8e8e93',
            title: '환경 설정',
            onClick: () => setIsSettingsOpen(true)
          })}
          
          {/* 사용자 아바타 */}
          <div 
            style={styles.headerAvatar}
            onClick={() => handleUserClick(currentUser?.id)}
            title="내 프로필"
          >
            {currentUser?.userName ? currentUser.userName.charAt(0) : '대'}
          </div>

          {/* 알림 센터 팝오버 */}
          {isNotificationOpen && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: '46px',
              width: '320px',
              backgroundColor: 'var(--bg-widget)',
              border: '1px solid var(--border-widget)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-widget)',
              padding: '16px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }} className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>🔔 미확인 알림 (Notifications)</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    onClick={() => {
                      setChatUnreadCount(0);
                      setTodoUnreadCount(0);
                      setMailUnreadCount(0);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.72rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0,122,255,0.08)'
                    }}
                  >
                    모두 읽음
                  </button>
                  <button 
                    onClick={() => setIsNotificationOpen(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {chatUnreadCount > 0 && (
                  <div 
                    onClick={() => {
                      setCurrentMenu('chat');
                      setActiveChat({ type: 'channel', id: 'general' });
                      setChatUnreadCount(0);
                      setIsSidebarOpen(true);
                      setIsNotificationOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>💬</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>새로운 메시지</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>확인하지 않은 채팅 메시지</span>
                      </div>
                    </div>
                    <span style={{ backgroundColor: 'var(--primary)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '10px', padding: '2px 8px' }}>{chatUnreadCount}</span>
                  </div>
                )}
                {mailUnreadCount > 0 && (
                  <div 
                    onClick={() => {
                      setCurrentMenu('mail');
                      setMailUnreadCount(0);
                      setIsSidebarOpen(true);
                      setIsNotificationOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>📧</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>읽지않은 메일</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>수신된 업무 메일 확인</span>
                      </div>
                    </div>
                    <span style={{ backgroundColor: '#0058bc', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '10px', padding: '2px 8px' }}>{mailUnreadCount}</span>
                  </div>
                )}
                {todoUnreadCount > 0 && (
                  <div 
                    onClick={() => {
                      setCurrentMenu('todo');
                      setTodoUnreadCount(0);
                      setIsSidebarOpen(true);
                      setIsNotificationOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>✅</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>미확인 할 일</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>처리 대기 중인 업무 할 일</span>
                      </div>
                    </div>
                    <span style={{ backgroundColor: '#ff2d55', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '10px', padding: '2px 8px' }}>{todoUnreadCount}</span>
                  </div>
                )}
                {chatUnreadCount === 0 && mailUnreadCount === 0 && todoUnreadCount === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', color: 'var(--text-muted)', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🎉</span>
                    <span style={{ fontSize: '0.78rem' }}>새로운 알림이 없습니다.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. 본문 및 사이드바 영역 */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 50px)', overflow: 'hidden' }}>
        {/* 1단 & 2단 사이드바 */}
        <div style={{ display: 'flex', height: '100%', zIndex: 50 }}>
          <Sidebar
            currentWorkspace={currentWorkspace}
            onWorkspaceChange={(ws) => {
              setCurrentWorkspace(ws);
              setActiveChat({ type: 'channel', id: 'general' });
            }}
            currentMenu={currentMenu}
            onMenuChange={(menu) => {
              const roleLevel = getUserRoleLevel(currentUser);
              if (menu === 'hr' && roleLevel > 2) {
                alert(currentWorkspace === 'vietqs' ? 'Không có quyền truy cập.' : '접근 권한이 없습니다. (임원 이상 접근 가능)');
                return;
              }
              if (menu === 'project' && roleLevel > 3) {
                alert(currentWorkspace === 'vietqs' ? 'Không có quyền truy cập.' : '접근 권한이 없습니다. (PM 이상 접근 가능)');
                return;
              }
              setCurrentMenu(menu);
              if (menu === 'home') {
                setIsSidebarOpen(false); // HOME 화면에서는 서브패널 공간 없애기 위해 닫음
              } else {
                setIsSidebarOpen(true);
              }
              if (menu === 'chat') {
                setActiveChat({ type: 'channel', id: 'general' });
                setChatUnreadCount(0);
              } else if (menu === 'mail') {
                setMailUnreadCount(0);
              } else if (menu === 'todo') {
                setTodoUnreadCount(0);
              }
            }}
            channels={workspaceChannels[currentWorkspace]}
            dms={dms}
            activeChat={activeChat}
            onActiveChatChange={(chat) => {
              setActiveChat(chat);
              setCurrentMenu('chat');
              setIsSidebarOpen(true);
              setChatUnreadCount(0);
            }}
            onOpenModal={() => setIsModalOpen(true)}
            onOpenDmCreateModal={() => setIsDmCreateModalOpen(true)} // DM 생성 모달 콜백 추가
            onUserClick={handleUserClick}
            isLightTheme={isLightTheme}
            onToggleTheme={() => setIsLightTheme(!isLightTheme)}
            chatUnreadCount={currentMenu === 'chat' ? 0 : chatUnreadCount}
            todoCount={currentMenu === 'todo' ? 0 : todoUnreadCount}
            todoFilter={todoFilter}
            onTodoFilterChange={setTodoFilter}
            mailUnreadCount={currentMenu === 'mail' ? 0 : mailUnreadCount}
            t={t}
            onOpenSettings={() => setIsSettingsOpen(true)}
            aiEnabled={aiEnabled}
            currentUser={currentUser}
            onLogout={handleLogout}
            isChatbotVisible={isChatbotVisible}
            onToggleChatbotVisible={(visible) => {
              setIsChatbotVisible(visible);
              if (visible) {
                setIsChatbotOpen(true); // 활성화 시 챗봇 창도 함께 열림
              }
            }}
            isSidebarOpen={isSidebarOpen}
            subPanelWidth={subPanelWidth}
            onSubPanelWidthChange={handleSubPanelWidthChange}
          />
        </div>

        {/* 3단 메인 뷰포트 */}
        <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {renderMainContent()}
        </div>
      </div>

      {/* 새 채널 개설 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateChannel={handleCreateChannel}
      />

      {/* 인사카드 모달 */}
      <HrCardModal
        isOpen={isHrCardOpen}
        onClose={() => setIsHrCardOpen(false)}
        employee={selectedEmployee}
        currentUser={currentUser}
        onStartDm={handleStartDm}
        onRefreshEmployees={fetchEmployees}
        onUpdateCurrentUser={(updatedUser) => {
          setCurrentUser(updatedUser);
          sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }}
        onLogout={handleLogout}
      />

      {/* 새 DM 생성 모달 */}
      <div 
        style={{
          ...styles.settingsOverlay,
          opacity: isDmCreateModalOpen ? 1 : 0,
          visibility: isDmCreateModalOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.25s ease-in-out, visibility 0.25s ease-in-out',
          zIndex: 9999,
        }}
        onClick={() => { setIsDmCreateModalOpen(false); setDmSearchQuery(''); }}
      >
        <div 
          className="glass-panel animate-scale" 
          style={{ ...styles.settingsModal, maxWidth: '400px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.settingsHeader}>
            <h3 style={styles.settingsTitle}>💬 새 DM 대화 시작</h3>
            <button 
              type="button" 
              className="close-btn"
              style={styles.closeBtn} 
              onClick={() => { setIsDmCreateModalOpen(false); setDmSearchQuery(''); }}
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ ...styles.settingsBody, padding: '16px' }}>
            <input 
              type="text"
              placeholder="이름 또는 부서로 직원 검색..."
              value={dmSearchQuery}
              onChange={(e) => setDmSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                marginBottom: '14px'
              }}
            />
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {allEmployees
                .filter(emp => emp && emp.id !== (currentUser?.id || 'me')) // 자신은 제외
                .filter(emp => {
                  const query = dmSearchQuery.toLowerCase();
                  const nameMatch = emp.userName ? emp.userName.toLowerCase().includes(query) : false;
                  const deptMatch = emp.dept ? emp.dept.toLowerCase().includes(query) : false;
                  return nameMatch || deptMatch;
                })
                .map(emp => (
                  <button
                    key={emp.empNo}
                    onClick={() => {
                      handleStartDm(emp);
                      setIsDmCreateModalOpen(false);
                      setDmSearchQuery('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.2s',
                    }}
                    className="employee-select-btn"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      backgroundColor: emp.company === 'Viet QS' ? '#0058bc' : '#ff6b00',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      {emp.userName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{emp.userName} {emp.grade || ''}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.company} · {emp.dept}</div>
                    </div>
                  </button>
                ))
              }
              {allEmployees.filter(emp => emp && emp.id !== (currentUser?.id || 'me')).filter(emp => {
                const query = dmSearchQuery.toLowerCase();
                const nameMatch = emp.userName ? emp.userName.toLowerCase().includes(query) : false;
                const deptMatch = emp.dept ? emp.dept.toLowerCase().includes(query) : false;
                return nameMatch || deptMatch;
              }).length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  검색된 직원이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 채팅방 사용자 초대 모달 */}
      <div 
        style={{
          ...styles.settingsOverlay,
          opacity: isInviteModalOpen ? 1 : 0,
          visibility: isInviteModalOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.25s ease-in-out, visibility 0.25s ease-in-out',
          zIndex: 9999,
        }}
        onClick={() => { setIsInviteModalOpen(false); setInviteSearchQuery(''); }}
      >
        <div 
          className="glass-panel animate-scale" 
          style={{ ...styles.settingsModal, maxWidth: '400px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.settingsHeader}>
            <h3 style={styles.settingsTitle}>👤 대화방에 직원 초대하기</h3>
            <button 
              type="button" 
              className="close-btn"
              style={styles.closeBtn} 
              onClick={() => { setIsInviteModalOpen(false); setInviteSearchQuery(''); }}
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ ...styles.settingsBody, padding: '16px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              {activeChat.type === 'dm' 
                ? '💡 1:1 대화방에 직원을 초대하면 그룹 채팅방으로 자동 생성 및 전환됩니다.' 
                : '💡 현재 채널 대화방에 직원을 초대합니다.'}
            </p>
            <input 
              type="text"
              placeholder="초대할 직원 이름 또는 부서 검색..."
              value={inviteSearchQuery}
              onChange={(e) => setInviteSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                marginBottom: '14px'
              }}
            />
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {allEmployees
                .filter(emp => emp && emp.id !== (currentUser?.id || 'me')) // 본인 제외
                .filter(emp => {
                  // 현재 DM 상대와 중복 초대 방지
                  if (activeChat.type === 'dm') {
                    const activeDm = dms.find(d => d.id === activeChat.id);
                    if (activeDm && activeDm.empNo === emp.empNo) return false;
                  }
                  return true;
                })
                .filter(emp => {
                  const query = inviteSearchQuery.toLowerCase();
                  const nameMatch = emp.userName ? emp.userName.toLowerCase().includes(query) : false;
                  const deptMatch = emp.dept ? emp.dept.toLowerCase().includes(query) : false;
                  return nameMatch || deptMatch;
                })
                .map(emp => (
                  <button
                    key={emp.empNo}
                    onClick={() => handleInviteUser(emp)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.2s',
                    }}
                    className="employee-select-btn"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      backgroundColor: emp.company === 'Viet QS' ? '#0058bc' : '#ff6b00',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      {emp.userName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{emp.userName} {emp.grade || ''}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.company} · {emp.dept}</div>
                    </div>
                  </button>
                ))
              }
              {allEmployees
                .filter(emp => emp && emp.id !== (currentUser?.id || 'me'))
                .filter(emp => {
                  if (activeChat.type === 'dm') {
                    const activeDm = dms.find(d => d.id === activeChat.id);
                    if (activeDm && activeDm.empNo === emp.empNo) return false;
                  }
                  return true;
                })
                .filter(emp => {
                  const query = inviteSearchQuery.toLowerCase();
                  const nameMatch = emp.userName ? emp.userName.toLowerCase().includes(query) : false;
                  const deptMatch = emp.dept ? emp.dept.toLowerCase().includes(query) : false;
                  return nameMatch || deptMatch;
                }).length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  초대 가능한 직원이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- 5. 사내 AI 및 API 환경설정 모달 (smooth transition) --- */}
      <div 
        style={{
          ...styles.settingsOverlay,
          opacity: isSettingsOpen ? 1 : 0,
          visibility: isSettingsOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.25s ease-in-out, visibility 0.25s ease-in-out',
        }} 
        onClick={handleCloseSettings}
      >
        <form 
          onSubmit={handleSaveSettings} 
          className="animate-scale" 
          style={{ ...styles.settingsModal, maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.settingsHeader}>
            <h3 style={styles.settingsTitle}>⚙️ 설정</h3>
            <button 
              type="button" 
              className="close-btn"
              style={styles.closeBtn} 
              onClick={handleCloseSettings}
            >
              <X size={20} />
            </button>
          </div>

          <div style={styles.settingsBody}>
            {/* 1. 내 계정 */}
            <div style={styles.settingsSection}>
              <div style={styles.settingsSectionTitle}>내 계정</div>
              <div style={styles.settingsProfileCard}>
                <div style={styles.settingsProfileLeft}>
                  <div style={styles.settingsProfileAvatar}>
                    {currentUser?.userName ? currentUser.userName.charAt(0) : '대'}
                  </div>
                  <div style={styles.settingsProfileInfo}>
                    <div style={styles.settingsProfileNameRow}>
                      <span style={styles.settingsProfileName}>{currentUser?.userName || '사용자'}</span>
                      <span style={styles.settingsProfileBadge}>{currentUser?.role || '사원'}</span>
                    </div>
                    <span style={styles.settingsProfileDesc}>{currentUser?.dept || '부서 미지정'} · {currentUser?.grade || '사원'}</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: '1px solid var(--border-light)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => handleUserClick(currentUser?.id)}
                >
                  인사카드
                </button>
              </div>

              <div style={styles.settingsRow}>
                <div style={styles.settingsRowInfo}>
                  <span style={styles.settingsRowTitle}>계정 세션</span>
                  <span style={styles.settingsRowDesc}>안전하게 시스템을 로그아웃합니다</span>
                </div>
                <div style={styles.settingsRowControl}>
                  <button 
                    type="button" 
                    onClick={handleLogout}
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#ef4444',
                      border: '1px solid #fca5a5',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            </div>

            {/* 2. 화면 */}
            <div style={styles.settingsSection}>
              <div style={styles.settingsSectionTitle}>화면</div>
              <div style={styles.settingsRow}>
                <div style={styles.settingsRowInfo}>
                  <span style={styles.settingsRowTitle}>다크 모드</span>
                  <span style={styles.settingsRowDesc}>어두운 테마로 전환합니다</span>
                </div>
                <div style={styles.settingsRowControl}>
                  <input
                    type="checkbox"
                    checked={!isLightTheme}
                    onChange={() => setIsLightTheme(!isLightTheme)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={styles.settingsRow}>
                <div style={styles.settingsRowInfo}>
                  <span style={styles.settingsRowTitle}>강조 색상</span>
                  <span style={styles.settingsRowDesc}>기본 브랜드 컬러 테마를 설정합니다</span>
                </div>
                <div style={styles.settingsRowControl}>
                  <select
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="CON-COST">오렌지 (CON-COST)</option>
                    <option value="Viet QS">블루 (Viet QS)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. 알림 · 언어 */}
            <div style={styles.settingsSection}>
              <div style={styles.settingsSectionTitle}>알림 · 언어</div>
              <div style={styles.settingsRow}>
                <div style={styles.settingsRowInfo}>
                  <span style={styles.settingsRowTitle}>데스크톱 알림</span>
                  <span style={styles.settingsRowDesc}>새로운 대화가 시작되거나 메시지가 수신되면 알림을 표시합니다</span>
                </div>
                <div style={styles.settingsRowControl}>
                  <input
                    type="checkbox"
                    checked={desktopNotif}
                    onChange={(e) => setDesktopNotif(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={styles.settingsRow}>
                <div style={styles.settingsRowInfo}>
                  <span style={styles.settingsRowTitle}>소리</span>
                  <span style={styles.settingsRowDesc}>알림 시 효과음을 재생합니다</span>
                </div>
                <div style={styles.settingsRowControl}>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={styles.settingsRow}>
                <div style={styles.settingsRowInfo}>
                  <span style={styles.settingsRowTitle}>언어</span>
                  <span style={styles.settingsRowDesc}>표시 언어를 설정합니다</span>
                </div>
                <div style={styles.settingsRowControl}>
                  <select
                    value={currentLang}
                    onChange={(e) => setCurrentLang(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ko">한국어</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. AI · 번역 연동 */}
            <div style={styles.settingsSectionLast}>
              <div style={styles.settingsSectionTitle}>🤖 AI · 번역 연동</div>
              <div style={styles.settingsRow}>
                <div style={styles.settingsRowInfo}>
                  <span style={styles.settingsRowTitle}>AI 챗봇 비서 활성화</span>
                  <span style={styles.settingsRowDesc}>사이드바에 AI 비서와의 대화방을 표시합니다</span>
                </div>
                <div style={styles.settingsRowControl}>
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={styles.settingsRow}>
                <div style={styles.settingsRowInfo}>
                  <span style={styles.settingsRowTitle}>메시지 실시간 번역</span>
                  <span style={styles.settingsRowDesc}>한국어 ↔ 베트남어 ↔ 영어 자동 번역 기능을 활성화합니다</span>
                </div>
                <div style={styles.settingsRowControl}>
                  <input
                    type="checkbox"
                    checked={realtimeTrans}
                    onChange={(e) => setRealtimeTrans(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy... 형식의 키를 입력해 주세요."
                  style={styles.settingsInput}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>AI 모델 선택 (Gemini Engine)</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  style={styles.settingsSelect}
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (권장 모델)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (경량・고속)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (고성능・정밀)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={styles.settingsFooter}>
            <button 
              type="button" 
              className="cancel-btn"
              style={styles.cancelBtn} 
              onClick={handleCloseSettings}
            >
              취소
            </button>
            <button type="submit" style={styles.saveBtn}>
              저장하기
            </button>
          </div>
        </form>
      </div>

      {/* 대시보드 위젯 설정 모달 */}
      <div 
        id="widget-settings-modal-overlay"
        style={{
          ...styles.settingsOverlay,
          opacity: isWidgetSettingsOpen ? 1 : 0,
          visibility: isWidgetSettingsOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.25s ease-in-out, visibility 0.25s ease-in-out',
        }} 
        onClick={() => setIsWidgetSettingsOpen(false)}
      >
        <div 
          className="glass-panel animate-scale" 
          style={styles.settingsModal}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.settingsHeader}>
            <h3 style={styles.settingsTitle}>⚙️ HOME 위젯 설정</h3>
            <button 
              type="button" 
              className="close-btn"
              style={styles.closeBtn} 
              onClick={() => setIsWidgetSettingsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div style={styles.settingsBody}>
            <div style={{ ...styles.inputGroup, opacity: 0.6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'not-allowed', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={true}
                  disabled={true}
                  style={{ width: '16px', height: '16px', cursor: 'not-allowed' }}
                />
                🌅 AI Workspace Morning Briefing (고정)
              </label>
            </div>
            <div style={{ ...styles.inputGroup, opacity: 0.6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'not-allowed', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={true}
                  disabled={true}
                  style={{ width: '16px', height: '16px', cursor: 'not-allowed' }}
                />
                🔔 미확인 알림 상태 (고정)
              </label>
            </div>
            
            <div style={{ margin: '12px 0', borderBottom: '1px solid var(--border-light)' }} />

            <div style={styles.inputGroup}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={visibleWidgets.includes('todo')}
                  onChange={(e) => {
                    const list = e.target.checked 
                      ? [...visibleWidgets, 'todo'] 
                      : visibleWidgets.filter(w => w !== 'todo');
                    setVisibleWidgets(list);
                    localStorage.setItem('works_dashboard_widgets', JSON.stringify(list));
                  }}
                  style={{ width: '16px', height: '16px' }}
                />
                ✅ 오늘 할 일 목록
              </label>
            </div>
            <div style={styles.inputGroup}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={visibleWidgets.includes('employees')}
                  onChange={(e) => {
                    const list = e.target.checked 
                      ? [...visibleWidgets, 'employees'] 
                      : visibleWidgets.filter(w => w !== 'employees');
                    setVisibleWidgets(list);
                    localStorage.setItem('works_dashboard_widgets', JSON.stringify(list));
                  }}
                  style={{ width: '16px', height: '16px' }}
                />
                👥 우리 회사 임직원 현황
              </label>
            </div>
            <div style={styles.inputGroup}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={visibleWidgets.includes('calendar')}
                  onChange={(e) => {
                    const list = e.target.checked 
                      ? [...visibleWidgets, 'calendar'] 
                      : visibleWidgets.filter(w => w !== 'calendar');
                    setVisibleWidgets(list);
                    localStorage.setItem('works_dashboard_widgets', JSON.stringify(list));
                  }}
                  style={{ width: '16px', height: '16px' }}
                />
                📅 이번 주 전사 일정
              </label>
            </div>
            <div style={styles.inputGroup}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={visibleWidgets.includes('board')}
                  onChange={(e) => {
                    const list = e.target.checked 
                      ? [...visibleWidgets, 'board'] 
                      : visibleWidgets.filter(w => w !== 'board');
                    setVisibleWidgets(list);
                    localStorage.setItem('works_dashboard_widgets', JSON.stringify(list));
                  }}
                  style={{ width: '16px', height: '16px' }}
                />
                📢 사내 주요 소식
              </label>
            </div>
          </div>

          <div style={styles.settingsFooter}>
            <button 
              type="button" 
              style={styles.saveBtn} 
              onClick={() => setIsWidgetSettingsOpen(false)}
            >
              확인
            </button>
          </div>
        </div>
      </div>

      {/* 🐶🤖 귀여운 강아지 로봇 AI 챗봇 비서 플로팅 아이콘 및 ON/OFF 토글 */}
      {aiEnabled && isChatbotVisible && (
        <div 
          onMouseEnter={() => setIsChatbotHovered(true)}
          onMouseLeave={() => setIsChatbotHovered(false)}
          style={{
            position: 'fixed',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* 플로팅 챗봇을 완전히 OFF 시키는 X 닫기 버튼 (마우스 호버 시에만 표시) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsChatbotVisible(false);
              setIsChatbotOpen(false);
            }}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: 'rgba(242, 63, 67, 0.95)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              zIndex: 9999,
              opacity: isChatbotHovered ? 1 : 0,
              pointerEvents: isChatbotHovered ? 'auto' : 'none',
              transition: 'opacity 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff4d4f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(242, 63, 67, 0.95)'}
            title="플로팅 챗봇 끄기 (OFF)"
          >
            ✕
          </button>
          
          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--primary)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
              overflow: 'hidden'
            }}
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            title="AI 비서 동명 대화하기"
            className="dog-robot-btn"
          >
            <RobotFaceIcon size={44} />
          </button>
        </div>
      )}

      {/* 🐶🤖 AI 챗봇 비서 대화창 */}
      <div 
        style={{
          position: 'fixed',
          right: '100px',
          top: '15%',
          width: `${chatbotSize.width}px`,
          height: `${chatbotSize.height}px`,
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          display: isChatbotOpen ? 'flex' : 'none',
          flexDirection: 'column',
          zIndex: 9999,
          transform: `translate(${chatbotPos.x}px, ${chatbotPos.y}px)`,
          transition: 'transform 0.05s ease-out'
        }}
        onMouseDown={(e) => {
          if (e.button === 1) {
            e.preventDefault();
            const startX = e.clientX - chatbotPos.x;
            const startY = e.clientY - chatbotPos.y;
            const handleMouseMove = (moveEvent) => {
              setChatbotPos({
                x: moveEvent.clientX - startX,
                y: moveEvent.clientY - startY
              });
            };
            const handleMouseUp = () => {
              window.removeEventListener('mousemove', handleMouseMove);
              window.removeEventListener('mouseup', handleMouseUp);
            };
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
          }
        }}
      >
        {/* 대화창 헤더 */}
        <div 
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'move',
            userSelect: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }}
          onMouseDown={(e) => {
            if (e.button === 0) {
              const startX = e.clientX - chatbotPos.x;
              const startY = e.clientY - chatbotPos.y;
              const handleMouseMove = (moveEvent) => {
                setChatbotPos({
                  x: moveEvent.clientX - startX,
                  y: moveEvent.clientY - startY
                });
              };
              const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
              };
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <span>🤖 CC AI 비서 (gemini-3.5-flash)</span>
          </div>
          <button 
            onClick={() => setIsChatbotOpen(false)} 
            style={{ color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
            className="close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* 대화 피드 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chatbotMessages.map(msg => {
            const isMe = msg.sender === 'me';
            return (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  alignItems: 'flex-start',
                  justifyContent: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                {!isMe && (
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0 
                  }}>
                    <RobotFaceIcon size={22} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '75%' }}>
                  {!isMe && (
                    <span style={{ fontSize: '0.7rem', color: '#ff6b00', fontWeight: 'bold' }}>{msg.senderName}</span>
                  )}
                  <div 
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.825rem',
                      lineHeight: '1.4',
                      wordBreak: 'break-word',
                      backgroundColor: isMe ? '#ff6b00' : 'rgba(255,255,255,0.08)',
                      color: '#ffffff',
                      borderBottomLeftRadius: !isMe ? '2px' : '10px',
                      borderBottomRightRadius: isMe ? '2px' : '10px'
                    }}
                  >
                    {msg.content}
                    {msg.youngjaImageUrl && (
                      <div style={{ marginTop: '6px', borderRadius: '6px', overflow: 'hidden', maxWidth: '120px' }}>
                        <img src={msg.youngjaImageUrl} alt="youngja" style={{ width: '100%', display: 'block' }} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#888', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>{msg.time}</span>
                </div>
              </div>
            );
          })}
          {isChatbotTyping && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', display: 'flex' }}>
                <img 
                  src={ceoDongmyungImg} 
                  alt="CEO" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', gap: '4px' }}>
                <span style={{ width: '4px', height: '4px', backgroundColor: '#aaa', borderRadius: '50%', animation: 'fadeIn 1s infinite alternate' }} />
                <span style={{ width: '4px', height: '4px', backgroundColor: '#aaa', borderRadius: '50%', animation: 'fadeIn 1s infinite alternate', animationDelay: '0.2s' }} />
                <span style={{ width: '4px', height: '4px', backgroundColor: '#aaa', borderRadius: '50%', animation: 'fadeIn 1s infinite alternate', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>

        {/* API Key 가이드 링크 */}
        {!geminiKey && (
          <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255, 107, 0, 0.15)', fontSize: '0.75rem', color: '#ff8a3d', borderTop: '1px solid rgba(255, 107, 0, 0.3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>🔑 API Key 미등록 상태 (데모 모드)</span>
            <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'underline', fontWeight: 'bold' }}>
              👉 Google AI Studio에서 API Key 발급받기
            </a>
          </div>
        )}

        {/* 대화 입력 */}
        <form onSubmit={handleChatbotSendMessage} style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            value={chatbotText} 
            onChange={(e) => setChatbotText(e.target.value)} 
            placeholder="질문해보세요..." 
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: '#ffffff',
              fontSize: '0.825rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#ff6b00', 
              color: '#ffffff', 
              borderRadius: '8px', 
              padding: '8px 12px', 
              fontSize: '0.825rem', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            전송
          </button>
        </form>

        {/* Right border resizer */}
        <div
          style={{
            position: 'absolute',
            right: '-4px',
            top: 0,
            bottom: 0,
            width: '8px',
            cursor: 'ew-resize',
            zIndex: 10000
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const startWidth = chatbotSize.width;
            const startX = e.clientX;
            
            const handleMouseMove = (moveEvent) => {
              const newWidth = Math.max(300, Math.min(1000, startWidth + (moveEvent.clientX - startX)));
              setChatbotSize(prev => ({ ...prev, width: newWidth }));
            };
            
            const handleMouseUp = () => {
              window.removeEventListener('mousemove', handleMouseMove);
              window.removeEventListener('mouseup', handleMouseUp);
            };
            
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Bottom border resizer */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '-4px',
            height: '8px',
            cursor: 'ns-resize',
            zIndex: 10000
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const startHeight = chatbotSize.height;
            const startY = e.clientY;
            
            const handleMouseMove = (moveEvent) => {
              const newHeight = Math.max(350, Math.min(1000, startHeight + (moveEvent.clientY - startY)));
              setChatbotSize(prev => ({ ...prev, height: newHeight }));
            };
            
            const handleMouseUp = () => {
              window.removeEventListener('mousemove', handleMouseMove);
              window.removeEventListener('mouseup', handleMouseUp);
            };
            
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Bottom-right corner resizer */}
        <div
          style={{
            position: 'absolute',
            right: '-6px',
            bottom: '-6px',
            width: '18px',
            height: '18px',
            cursor: 'nwse-resize',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: '2px'
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const startWidth = chatbotSize.width;
            const startHeight = chatbotSize.height;
            const startX = e.clientX;
            const startY = e.clientY;
            
            const handleMouseMove = (moveEvent) => {
              const newWidth = Math.max(300, Math.min(1000, startWidth + (moveEvent.clientX - startX)));
              const newHeight = Math.max(350, Math.min(1000, startHeight + (moveEvent.clientY - startY)));
              setChatbotSize({ width: newWidth, height: newHeight });
            };
            
            const handleMouseUp = () => {
              window.removeEventListener('mousemove', handleMouseMove);
              window.removeEventListener('mouseup', handleMouseUp);
            };
            
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.8, pointerEvents: 'none' }}>
            <path d="M9 1L1 9M9 5L5 9M9 8L8 9" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes pulse-soft {
          0% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 107, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0); }
        }
        .dog-robot-btn {
          animation: pulse-soft 2s infinite;
        }
        .dog-robot-btn:hover {
          transform: translateY(-50%) scale(1.08) !important;
        }
      `}</style>
    </div>
  );

  // 3단 메인 뷰포트 내부 헬퍼 컴포넌트 렌더링
  function renderMainContent() {
    const isConcost = currentWorkspace === 'concost';
    const accentColor = isConcost ? '#ff6b00' : 'var(--primary)';
    const roleLevel = getUserRoleLevel(currentUser);

    // 접근 권한 강제 차단 가드
    if (currentMenu === 'hr' && roleLevel > 2) {
      return (
        <div style={{ display: 'flex', flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>접근 권한이 없습니다</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>임원 등급 이상만 접근할 수 있는 메뉴입니다.</p>
        </div>
      );
    }

    if (currentMenu === 'project' && roleLevel > 3) {
      return (
        <div style={{ display: 'flex', flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>접근 권한이 없습니다</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>PM 등급 이상만 접근할 수 있는 메뉴입니다.</p>
        </div>
      );
    }

    switch (currentMenu) {
      case 'chat':
        return (
          <ChatArea
            activeChat={activeChat}
            chatTitle={getChatTitle()}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            currentWorkspace={currentWorkspace}
            onUserClick={handleUserClick}
            onOpenInviteModal={() => setIsInviteModalOpen(true)} // 초대 모달 콜백 추가
            onExitChat={handleExitChat} // 추가
          />
        );

      case 'home':
        const empCount = allEmployees && allEmployees.length > 0 ? allEmployees.length : 92;
        const concostCount = allEmployees && allEmployees.length > 0 ? allEmployees.filter(e => e.company === 'CON-COST').length : 32;
        const vietqsCount = allEmployees && allEmployees.length > 0 ? allEmployees.filter(e => e.company === 'Viet QS').length : 60;

        return (
          <div style={styles.mainContainer} className="animate-fade">
            <div style={styles.mainHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={styles.mainTitle}>
                  {currentWorkspace === 'vietqs' ? '📊 Bảng điều khiển tổng hợp' : '📊 종합 대시보드'}
                </h2>
              </div>
              <button 
                id="edit-dashboard-btn"
                className="action-btn"
                style={{
                  ...styles.editDashboardBtn,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)'
                }}
                onClick={() => setIsWidgetSettingsOpen(true)}
              >
                ⚙️ {currentWorkspace === 'vietqs' ? 'Chỉnh sửa Widget' : '대시보드 편집'}
              </button>
            </div>

            <div style={styles.dashboardGrid}>
              {/* 위젯 1: AI 출근길 브리핑 카드 (상단 와이드) - 필수 */}
              <div className="widget-card" style={{ ...styles.widgetCard, gridColumn: 'span 12', minWidth: 0, border: '1px solid var(--primary)' }}>
                {/* 액센트 탑 라인 */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${accentColor}, #ff007f)` }} />
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '14px', borderBottom: '1px dashed var(--border-light)', paddingBottom: '8px' }}>
                  🤖 AI Workspace Morning Briefing
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '36px' }}>🌅</div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {currentWorkspace === 'vietqs' ? 'Chào buổi sáng, Trưởng phòng Yu Jong-wook!' : '유종욱 실장님, 좋은 아침입니다!'}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      {currentWorkspace === 'vietqs'
                        ? `Hôm nay có ${calendarEvents.length} lịch trình hợp tác công ty được đăng ký, và có ${todos.filter(t => !t.completed).length} công việc đang chờ xử lý. Gần đây, ${driveFiles.length} bản vẽ mới đã được tải lên thư mục thiết kế.`
                        : `오늘 등록된 전사 협업 일정은 ${calendarEvents.length}건이며, 진행중인 업무 태스크 카드가 ${todos.filter(t => !t.completed).length}건 대기하고 있습니다. 최근 Viet QS 법인의 BIM 협업 드라이브에 ${driveFiles.length}개의 신규 도면 파일이 업로드되었습니다.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 위젯 2: 미확인 알림 상태 - 필수 */}
              <div className="widget-card" style={{ ...styles.widgetCard, gridColumn: 'span 6', minWidth: 0 }}>
                {/* 액센트 탑 라인 */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: '#ff3b30' }} />
                <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '14px', borderBottom: '1px dashed var(--border-light)', paddingBottom: '8px' }}>
                  🔔 {currentWorkspace === 'vietqs' ? 'Trạng thái thông báo chưa đọc' : '미확인 알림 상태'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
                  <div style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }} onClick={() => { setActiveChat({ type: 'channel', id: 'general' }); setCurrentMenu('chat'); setChatUnreadCount(0); setIsSidebarOpen(true); }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>💬</div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{chatUnreadCount} {currentWorkspace === 'vietqs' ? 'tin nhắn' : '건'}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{currentWorkspace === 'vietqs' ? 'Tin nhắn mới' : '새 메시지'}</div>
                  </div>
                  <div style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }} onClick={() => { setCurrentMenu('mail'); setMailUnreadCount(0); setIsSidebarOpen(true); }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>📧</div>
                    <strong style={{ fontSize: '1.1rem', color: '#0058bc' }}>{mailUnreadCount} {currentWorkspace === 'vietqs' ? 'thư' : '건'}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{currentWorkspace === 'vietqs' ? 'Thư chưa đọc' : '읽지않은 메일'}</div>
                  </div>
                  <div style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }} onClick={() => { setCurrentMenu('todo'); setTodoUnreadCount(0); setIsSidebarOpen(true); }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>✅</div>
                    <strong style={{ fontSize: '1.1rem', color: '#ff2d55' }}>{todoUnreadCount} {currentWorkspace === 'vietqs' ? 'việc' : '건'}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{currentWorkspace === 'vietqs' ? 'Việc cần làm' : '미확인 할 일'}</div>
                  </div>
                </div>
              </div>

              {/* 위젯 3: 오늘 할 일 목록 */}
              {visibleWidgets.includes('todo') && (
                <div className="widget-card" style={{ ...styles.widgetCard, gridColumn: 'span 6', minWidth: 0 }}>
                  {/* 액센트 탑 라인 */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: '#00bfff' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px dashed var(--border-light)', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>✅ {currentWorkspace === 'vietqs' ? 'Danh sách việc cần làm' : '오늘 할 일 목록'}</div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setCurrentMenu('todo')}>
                      {currentWorkspace === 'vietqs' ? 'Xem thêm' : '더보기'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {todos.slice(0, 2).map(todo => (
                      <div key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: todo.completed ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75%' }}>
                          • {todo.text}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          backgroundColor: todo.priority === '높음' ? 'rgba(255, 75, 75, 0.1)' : 'rgba(240, 178, 50, 0.1)',
                          color: todo.priority === '높음' ? '#ff4b4b' : '#f0b232'
                        }}>
                          {todo.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 위젯 4: 임직원 현황 */}
              {visibleWidgets.includes('employees') && (
                <div className="widget-card" style={{ ...styles.widgetCard, gridColumn: 'span 6', minWidth: 0 }}>
                  {/* 액센트 탑 라인 */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: '#ff6b00' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px dashed var(--border-light)', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>👥 {currentWorkspace === 'vietqs' ? 'Tình hình nhân sự' : '우리 회사 임직원 현황'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontWeight: '700' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{currentWorkspace === 'vietqs' ? 'Tổng số nhân viên' : '양사 총 임직원 수'}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{empCount} 명</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>CON-COST 본사</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{concostCount} 명</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Viet QS 지사</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{vietqsCount} 명</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 위젯 5: 이번 주 전사 일정 */}
              {visibleWidgets.includes('calendar') && (
                <div className="widget-card" style={{ ...styles.widgetCard, gridColumn: 'span 6', minWidth: 0 }}>
                  {/* 액센트 탑 라인 */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: '#8a2be2' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px dashed var(--border-light)', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>📅 {currentWorkspace === 'vietqs' ? 'Lịch trình công ty tuần này' : '이번 주 전사 일정'}</div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setCurrentMenu('calendar')}>
                      {currentWorkspace === 'vietqs' ? 'Lịch' : '캘린더'}
                    </button>
                  </div>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', fontWeight: '700' }}>
                      <tbody>
                        {calendarEvents.length === 0 ? (
                          <tr>
                            <td colSpan="2" style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                              {currentWorkspace === 'vietqs' ? 'Không có lịch trình nào.' : '등록된 일정이 없습니다.'}
                            </td>
                          </tr>
                        ) : (
                          calendarEvents
                            .sort((a, b) => {
                              if (a.year !== b.year) return a.year - b.year;
                              if (a.month !== b.month) return a.month - b.month;
                              return a.day - b.day;
                            })
                            .slice(0, 4)
                            .map((event, index, arr) => {
                              const isLast = index === arr.length - 1;
                              
                              let eventTitle = event.title;
                              if (currentWorkspace === 'vietqs') {
                                if (event.title === '메신저 개발 킥오프') eventTitle = 'Kick-off phát triển';
                                else if (event.title === '디자인실장 영자 미팅') eventTitle = 'Họp với P.Thiết kế';
                                else if (event.title === '베트남 지사 화상 회의') eventTitle = 'Họp trực tuyến VN';
                                else if (event.title === 'TF팀 중간 발표회') eventTitle = 'Báo cáo giữa kỳ TF';
                              }

                              const daysKo = ['일', '월', '화', '수', '목', '금', '토'];
                              const daysVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                              const dayOfWeek = new Date(event.year, event.month, event.day).getDay();
                              const dayName = currentWorkspace === 'vietqs' ? daysVi[dayOfWeek] : daysKo[dayOfWeek];
                              
                              return (
                                <tr key={event.id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-light)' }}>
                                  <td style={{ padding: '8px 0', color: 'var(--primary)', width: '90px' }}>
                                    {event.month + 1}.{event.day} ({dayName})
                                  </td>
                                  <td style={{ padding: '8px 0', color: 'var(--text-primary)' }}>
                                    {eventTitle}
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 위젯 6: 사내 주요 소식 */}
              {visibleWidgets.includes('board') && (
                <div className="widget-card" style={{ ...styles.widgetCard, gridColumn: 'span 6', minWidth: 0 }}>
                  {/* 액센트 탑 라인 */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: '#ffcc00' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px dashed var(--border-light)', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>📢 {currentWorkspace === 'vietqs' ? 'Tin tức chính công ty' : '사내 주요 소식'}</div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setCurrentMenu('board')}>
                      {currentWorkspace === 'vietqs' ? 'Bảng tin' : '게시글 목록'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                    {boardPosts.slice(0, 3).map(post => (
                      <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setCurrentMenu('board')}>
                        <span style={{ fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%', color: 'var(--text-primary)' }}>
                          • {post.title}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{post.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'hr':
        return (
          <OrgChart 
            allEmployees={allEmployees}
            onUserClick={handleUserClick}
            currentWorkspace={currentWorkspace}
          />
        );

      case 'mail': {
        const unreadCount = mails.filter(m => !m.read).length;
        const isViet = currentWorkspace === 'vietqs';
        return (
          <div style={{ ...styles.mainContainer, padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }} className="animate-fade">
            {/* 1. 상단 툴바 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 20px',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedMail ? (
                  <>
                    <button 
                      style={{
                        ...styles.mailToolbarBtn,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        borderColor: 'var(--primary)'
                      }} 
                      onClick={() => setSelectedMail(null)}
                    >
                      ◀ {isViet ? 'Danh sách' : '목록'}
                    </button>
                    <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-light)', margin: '0 6px' }} />
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: '6px' }}>
                      <input type="checkbox" style={{ cursor: 'pointer', width: '15px', height: '15px' }} />
                      <span style={{ fontSize: '10px', marginLeft: '2px', cursor: 'pointer', color: 'var(--text-muted)' }}>▼</span>
                    </div>
                  </>
                )}
                
                <button style={styles.mailToolbarBtn} onClick={() => {
                  if (selectedMail) {
                    setMails(prev => prev.map(m => m.id === selectedMail.id ? { ...m, read: !m.read } : m));
                    setSelectedMail(prev => prev ? { ...prev, read: !prev.read } : null);
                  } else {
                    alert(isViet ? 'Vui lòng chọn thư.' : '메일을 선택해 주세요.');
                  }
                }}>{isViet ? 'Đã đọc' : '읽음'}</button>
                <button style={styles.mailToolbarBtn} onClick={() => {
                  if (selectedMail) {
                    setMails(prev => prev.filter(m => m.id !== selectedMail.id));
                    setSelectedMail(null);
                  } else {
                    alert(isViet ? 'Vui lòng chọn thư.' : '메일을 선택해 주세요.');
                  }
                }}>{isViet ? 'Xóa' : '삭제'}</button>
                <button style={styles.mailToolbarBtn} onClick={() => alert(isViet ? 'Báo cáo Spam' : '스팸신고')}>{isViet ? 'Báo cáo Spam' : '스팸신고'}</button>
                
                <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-light)', margin: '0 6px' }} />
                
                <button style={styles.mailToolbarBtn} onClick={() => alert(isViet ? 'Trả lời' : '답장')}>{isViet ? 'Trả lời' : '답장'}</button>
                <button style={styles.mailToolbarBtn} onClick={() => alert(isViet ? 'Trả lời tất cả' : '전체답장')}>{isViet ? 'Trả lời tất cả' : '전체답장'}</button>
                <button style={styles.mailToolbarBtn} onClick={() => alert(isViet ? 'Chuyển tiếp' : '전달')}>{isViet ? 'Chuyển tiếp' : '전달'}</button>
                <button style={styles.mailToolbarBtn} onClick={() => alert(isViet ? 'Di chuyển' : '이동')}>{isViet ? 'Di chuyển' : '이동'}</button>
                <button style={styles.mailToolbarBtn} onClick={() => alert(isViet ? 'Nhắc nhở' : 'Nhắc nhở')}>{isViet ? 'Nhắc nhở' : '리마인드'}</button>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!selectedMail && (
                  <>
                    <span>{isViet ? 'Chưa đọc' : '안읽음'} <strong>{unreadCount}</strong>{isViet ? ' thư' : '건'}</span>
                    <div style={{ width: '1px', height: '12px', backgroundColor: 'var(--border-light)' }} />
                    <span style={{ cursor: 'pointer' }} onClick={() => alert('설정')}>⚙️</span>
                  </>
                )}
              </div>
            </div>

            {/* 2. 메일 본문 레이아웃 (목록 혹은 상세 단일 꽉 찬 뷰) */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {!selectedMail ? (
                /* 꽉 찬 메일 목록 */
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  backgroundColor: 'var(--bg-dashboard)'
                }}>
                  {mails.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '10px' }}>
                      <MailIcon size={48} style={{ color: 'var(--text-muted)' }} />
                      <div>{isViet ? 'Không có thư nào.' : '메일이 없습니다.'}</div>
                    </div>
                  ) : (
                    mails.map(mail => {
                      const isSelected = selectedMail?.id === mail.id;
                      let senderName = mail.sender;
                      let mailTitle = mail.title;
                      let mailDesc = mail.desc;

                      // 베트남어 지원 분기 처리
                      if (currentWorkspace === 'vietqs') {
                        if (mail.id === 101) {
                          senderName = 'CON-COST IT Support';
                          mailTitle = '[CON-COST Core] Thông báo hoàn tất đăng ký';
                          mailDesc = 'Đăng ký dịch vụ CON-COST Core đã hoàn tất. Hãy bắt đầu công việc thông minh ngay bây giờ.';
                        } else if (mail.id === 102) {
                          senderName = 'CON-COST IT Support';
                          mailTitle = 'Chào mừng! Bắt đầu sử dụng CON-COST Works để làm việc hiệu quả';
                          mailDesc = 'Chúng tôi nhiệt lệ chào mừng bạn đến với CON-COST Works. Nâng cao giao tiếp và cộng tác hiệu quả.';
                        } else if (mail.id === 1) {
                          senderName = 'Trưởng phòng Kim Hyun-ji';
                          mailTitle = '[Khẩn] Yêu cầu gửi nội dung cuộc họp chiến lược';
                          mailDesc = 'Thưa Giám đốc, xin vui lòng gửi ý kiến chỉ đạo đối với dự thảo chiến lược kinh doanh trước 5h chiều nay.';
                        } else if (mail.id === 3) {
                          senderName = 'Phòng Nhân sự';
                          mailTitle = '[Thông báo] Quy định kỳ nghỉ hè tập trung năm 2026';
                          mailDesc = 'Theo nội quy công ty, chúng tôi xin chia sẻ quy trình phê duyệt nghỉ mát tập trung hè 2026.';
                        }
                      }

                      return (
                        <div 
                          key={mail.id} 
                          className="mail-item-row"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '14px 20px',
                            borderBottom: '1px solid var(--border-light)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                            backgroundColor: isSelected ? 'var(--bg-active)' : 'transparent',
                            position: 'relative'
                          }}
                          onClick={() => {
                            setSelectedMail({ ...mail, sender: senderName, title: mailTitle, desc: mailDesc });
                            setMails(prev => prev.map(m => m.id === mail.id ? { ...m, read: true } : m));
                          }}
                        >
                          {/* 선택 시 좌측 파란색 세로줄 */}
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '4px',
                              backgroundColor: '#007aff'
                            }} />
                          )}

                          {/* 체크박스 */}
                          <input 
                            type="checkbox" 
                            onClick={(e) => e.stopPropagation()} 
                            style={{ marginRight: '12px', cursor: 'pointer', width: '15px', height: '15px' }} 
                          />

                          {/* 중요 표시 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMails(prev => prev.map(m => m.id === mail.id ? { ...m, important: !m.important } : m));
                            }}
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              marginRight: '12px',
                              cursor: 'pointer',
                              color: mail.important ? '#ffb900' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Star size={16} fill={mail.important ? '#ffb900' : 'none'} stroke={mail.important ? '#ffb900' : 'var(--text-muted)'} />
                          </button>

                          {/* W 로고 */}
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800',
                            marginRight: '20px',
                            border: '1px solid var(--border-light)',
                            flexShrink: 0
                          }}>
                            W
                          </div>

                          {/* 발신자 */}
                          <div style={{
                            width: '150px',
                            fontSize: '0.85rem',
                            fontWeight: !mail.read ? '700' : '400',
                            color: !mail.read ? 'var(--text-primary)' : 'var(--text-secondary)',
                            marginRight: '20px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flexShrink: 0
                          }}>
                            {senderName}
                          </div>

                          {/* TO 배지 */}
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px',
                            fontWeight: 'bold',
                            marginRight: '16px',
                            flexShrink: 0
                          }}>
                            TO
                          </div>

                          {/* 제목 및 본문 요약 (세로 정렬) */}
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                            overflow: 'hidden',
                            marginRight: '20px'
                          }}>
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: !mail.read ? '700' : '400',
                              color: !mail.read ? 'var(--text-primary)' : 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {mailTitle}
                            </div>
                            <div style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {mailDesc}
                            </div>
                          </div>

                          {/* 날짜 */}
                          <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            width: '100px',
                            textAlign: 'right',
                            flexShrink: 0
                          }}>
                            {mail.date}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* 꽉 찬 메일 상세 */
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-widget)', padding: '24px 32px' }} className="animate-scale">
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '18px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ 
                        backgroundColor: 'rgba(0,199,60,0.15)', 
                        color: '#00c73c', 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        border: '1px solid rgba(0,199,60,0.3)'
                      }}>
                        {isViet ? 'Hộp thư đến' : '받은메일함'}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedMail.title}</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div>
                        {isViet ? 'Người gửi: ' : '보낸사람: '}
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedMail.sender}</strong>
                      </div>
                      <div>{selectedMail.date}</div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.75',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    backgroundColor: 'var(--bg-dashboard)',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    minHeight: '200px'
                  }}>
                    {selectedMail.desc}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'calendar': {
        const isConcost = currentWorkspace === 'concost';
        const accentColor = isConcost ? '#ff6b00' : 'var(--primary)';
        const isViet = currentWorkspace === 'vietqs';

        // 1. 달력 날짜 계산
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        const prevDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

        const cells = [];
        // 이전 달 날짜들
        for (let i = firstDayIndex - 1; i >= 0; i--) {
          cells.push({
            day: prevDaysInMonth - i,
            isCurrentMonth: false,
            monthOffset: -1,
            year: currentMonth === 0 ? currentYear - 1 : currentYear,
            month: currentMonth === 0 ? 11 : currentMonth - 1
          });
        }
        // 현재 달 날짜들
        for (let i = 1; i <= daysInMonth; i++) {
          cells.push({
            day: i,
            isCurrentMonth: true,
            monthOffset: 0,
            year: currentYear,
            month: currentMonth
          });
        }
        // 다음 달 날짜들 (42칸 기준 채우기)
        const remaining = 42 - cells.length;
        for (let i = 1; i <= remaining; i++) {
          cells.push({
            day: i,
            isCurrentMonth: false,
            monthOffset: 1,
            year: currentMonth === 11 ? currentYear + 1 : currentYear,
            month: currentMonth === 11 ? 0 : currentMonth + 1
          });
        }

        const weekdays = isViet 
          ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] 
          : ['일', '월', '화', '수', '목', '금', '토'];

        const handlePrevMonth = () => {
          if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
          } else {
            setCurrentMonth(prev => prev - 1);
          }
        };

        const handleNextMonth = () => {
          if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
          } else {
            setCurrentMonth(prev => prev + 1);
          }
        };

        const handleOpenAddEvent = (dayInfo) => {
          setSelectedDay(dayInfo);
          setEventTitle('');
          setEventType('meeting');
          setIsEventModalOpen(true);
        };

        return (
          <div style={{ ...styles.mainContainer, display: 'flex', flexDirection: 'column', padding: '20px' }} className="animate-fade">
            {/* 캘린더 컨트롤러 상단 바 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              backgroundColor: 'var(--bg-widget)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid var(--border-widget)',
              boxShadow: 'var(--shadow-widget)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  type="button"
                  onClick={handlePrevMonth}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                >
                  ◀ {isViet ? 'Tháng trước' : '이전달'}
                </button>

                {/* 년도/월 점프 드롭다운 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={currentYear}
                    onChange={e => setCurrentYear(parseInt(e.target.value, 10))}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                      <option key={y} value={y}>{y}년</option>
                    ))}
                  </select>

                  <select
                    value={currentMonth}
                    onChange={e => setCurrentMonth(parseInt(e.target.value, 10))}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>{i + 1}월</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setCurrentYear(today.getFullYear());
                      setCurrentMonth(today.getMonth());
                    }}
                    style={{
                      backgroundColor: accentColor,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginLeft: '4px'
                    }}
                  >
                    {isViet ? 'Hôm nay' : '오늘'}
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={handleNextMonth}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                >
                  {isViet ? 'Tháng sau' : '다음달'} ▶
                </button>
              </div>

              {/* 일정 유형 필터 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  {isViet ? 'Lọc:' : '필터:'}
                </span>
                <select
                  value={calendarFilter}
                  onChange={e => setCalendarFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="all">{isViet ? 'Tất cả' : '전체보기'}</option>
                  <option value="meeting">{isViet ? 'Họp' : '🔴 회의'}</option>
                  <option value="design">{isViet ? 'Thiết kế' : '💖 미팅'}</option>
                  <option value="viet">{isViet ? 'Công ty' : '🟢 전사'}</option>
                  <option value="tf">{isViet ? 'Dự án TF' : '🟣 TF팀'}</option>
                  <option value="personal">{isViet ? 'Cá nhân' : '🔵 개인'}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAddEvent({ day: new Date().getDate(), isCurrentMonth: true, monthOffset: 0, year: currentYear, month: currentMonth })}
                style={{
                  backgroundColor: accentColor,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <span>➕</span> {isViet ? 'Đăng ký lịch' : '일정 등록'}
              </button>
            </div>

            {/* 달력 날짜 목록 그리드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '14px', // 스샷 스타일 매칭을 위해 갭 확대
              flex: 1,
              overflowY: 'auto'
            }}>
              {weekdays.map((d, index) => {
                let color = 'var(--text-secondary)';
                if (index === 0) color = '#f23f43'; // 일요일 빨강
                if (index === 6) color = '#007aff'; // 토요일 파랑
                return (
                  <div key={d} style={{
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: color,
                    borderBottom: '2px solid var(--border-light)',
                    marginBottom: '4px'
                  }}>{d}</div>
                );
              })}

              {cells.map((cell, idx) => {
                const dayEvents = calendarEvents.filter(e => {
                  const matchDate = e.year === cell.year && e.month === cell.month && e.day === cell.day;
                  if (!matchDate) return false;
                  if (calendarFilter === 'all') return true;
                  return e.type === calendarFilter;
                });
                
                // 오늘 날짜 체크
                const today = new Date();
                const isToday = today.getFullYear() === cell.year && today.getMonth() === cell.month && today.getDate() === cell.day;

                // 요일 색상 계산 (일요일 0, 토요일 6)
                const dayOfWeek = new Date(cell.year, cell.month, cell.day).getDay();
                let numColor = 'var(--text-primary)';
                if (!cell.isCurrentMonth) {
                  numColor = 'var(--text-muted)';
                } else if (dayOfWeek === 0) {
                  numColor = '#f23f43'; // 일요일 빨강
                } else if (dayOfWeek === 6) {
                  numColor = '#007aff'; // 토요일 파랑
                }

                // 대표 이벤트에 따른 가로막대 바 컬러 매칭 (실장님 스샷 모방용)
                let bottomBarColor = 'transparent';
                if (dayEvents.length > 0) {
                  const firstType = dayEvents[0].type;
                  bottomBarColor = firstType === 'meeting' ? '#ff9500' : (firstType === 'design' ? '#ff2d55' : (firstType === 'viet' ? '#2eb67d' : (firstType === 'tf' ? '#8a2be2' : '#52c41a')));
                }

                return (
                  <div 
                    key={idx} 
                    className="calendar-cell-card animate-fade"
                    style={{
                      backgroundColor: 'var(--bg-widget)',
                      borderRadius: '12px',
                      border: isToday ? `2px solid ${accentColor}` : (isLightTheme ? '1.5px solid rgba(0,0,0,0.06)' : '1.5px solid rgba(255,255,255,0.06)'),
                      boxShadow: isToday 
                        ? `0 0 12px ${accentColor}30` 
                        : (isLightTheme ? '0 4px 12px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.35)'),
                      padding: '12px 12px 16px 12px',
                      minHeight: '110px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      cursor: 'pointer',
                      position: 'relative',
                      opacity: cell.isCurrentMonth ? 1 : 0.4,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleOpenAddEvent(cell)}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isToday 
                        ? `0 0 16px ${accentColor}40` 
                        : (isLightTheme ? '0 8px 16px rgba(0,0,0,0.07)' : '0 8px 20px rgba(0,0,0,0.45)');
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isToday 
                        ? `0 0 12px ${accentColor}30` 
                        : (isLightTheme ? '0 4px 12px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.35)');
                    }}
                  >
                    {/* 날짜 숫자 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        backgroundColor: isToday ? accentColor : 'transparent',
                        color: isToday ? '#ffffff' : numColor,
                        width: isToday ? '22px' : 'auto',
                        height: isToday ? '22px' : 'auto',
                        borderRadius: isToday ? '50%' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {cell.day}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: accentColor }}>TODAY</span>
                      )}
                    </div>

                    {/* 일정 리스트 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
                      {dayEvents.map((e, index) => {
                        let eventTitle = e.title;
                        if (isViet) {
                          if (e.title === '메신저 개발 킥오프') eventTitle = 'Kick-off phát triển';
                          else if (e.title === '디자인실장 영자 미팅') eventTitle = 'Họp với P.Thiết kế';
                          else if (e.title === '베트남 지사 화상 회의') eventTitle = 'Họp trực tuyến VN';
                          else if (e.title === 'TF팀 중간 발표회') eventTitle = 'Báo cáo giữa kỳ TF';
                        }

                        const chipColor = e.type === 'meeting' ? '#ff9500' : (e.type === 'design' ? '#ff2d55' : (e.type === 'viet' ? '#2eb67d' : (e.type === 'tf' ? '#8a2be2' : '#52c41a')));
                        
                        return (
                          <div 
                            key={index} 
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              color: '#ffffff',
                              backgroundColor: chipColor,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.3,
                              cursor: 'pointer',
                              transition: 'transform 0.1s'
                            }}
                            title={eventTitle}
                            onClick={(ev) => {
                              ev.stopPropagation(); // 카드 클릭(등록 모달) 전파 방지
                              setSelectedEventForView(e);
                            }}
                            onMouseEnter={ev => ev.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={ev => ev.currentTarget.style.transform = 'scale(1)'}
                          >
                            {eventTitle}
                          </div>
                        );
                      })}
                    </div>

                    {/* 하단 브랜드 가로막대 바 (실장님 캘린더 스샷 전면 매칭) */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '6px', // 6px로 두께를 늘려 스샷 효과 극대화
                      backgroundColor: bottomBarColor,
                      borderBottomLeftRadius: '11px',
                      borderBottomRightRadius: '11px'
                    }} />
                  </div>
                );
              })}
            </div>

            {/* --- 일정 등록 모달 --- */}
            {isEventModalOpen && selectedDay && (
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
                zIndex: 99999,
                backdropFilter: 'blur(3px)'
              }} onClick={() => setIsEventModalOpen(false)}>
                <div style={{
                  backgroundColor: 'var(--bg-widget)',
                  border: '1px solid var(--border-widget)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-widget)',
                  width: '380px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      📅 {selectedDay.year}년 {selectedDay.month + 1}월 {selectedDay.day}일 일정 추가
                    </h4>
                    <button 
                      type="button"
                      onClick={() => setIsEventModalOpen(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>일정 제목</label>
                    <input 
                      type="text" 
                      placeholder="회의 또는 일정을 입력하세요"
                      value={eventTitle}
                      onChange={e => setEventTitle(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>일정 구분</label>
                    <select
                      value={eventType}
                      onChange={e => setEventType(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="meeting">🔴 회의 (Meeting)</option>
                      <option value="design">💖 미팅 (Design)</option>
                      <option value="viet">🟢 전사 협업 (Viet QS)</option>
                      <option value="tf">🟣 TF 프로젝트 (TF Team)</option>
                      <option value="personal">🔵 개인 일정 (Personal)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button 
                      type="button"
                      onClick={() => setIsEventModalOpen(false)}
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      취소
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if (!eventTitle.trim()) {
                          alert('일정 제목을 입력해주세요.');
                          return;
                        }
                        const newEvent = {
                          id: Date.now(),
                          year: selectedDay.year,
                          month: selectedDay.month,
                          day: selectedDay.day,
                          title: eventTitle.trim(),
                          type: eventType
                        };
                        setCalendarEvents(prev => [...prev, newEvent]);
                        setIsEventModalOpen(false);
                      }}
                      style={{
                        backgroundColor: accentColor,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      등록
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- 일정 상세조회 및 삭제 모달 --- */}
            {selectedEventForView && (
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
                zIndex: 99999,
                backdropFilter: 'blur(3px)'
              }} onClick={() => setSelectedEventForView(null)}>
                <div style={{
                  backgroundColor: 'var(--bg-widget)',
                  border: '1px solid var(--border-widget)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-widget)',
                  width: '380px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      📅 {selectedEventForView.year}년 {selectedEventForView.month + 1}월 {selectedEventForView.day}일 일정 상세
                    </h4>
                    <button 
                      type="button"
                      onClick={() => setSelectedEventForView(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>일정 제목</span>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: '700'
                    }}>
                      {selectedEventForView.title}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>일정 구분</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#ffffff',
                        backgroundColor: selectedEventForView.type === 'meeting' ? '#ff9500' : (selectedEventForView.type === 'design' ? '#ff2d55' : (selectedEventForView.type === 'viet' ? '#2eb67d' : (selectedEventForView.type === 'tf' ? '#8a2be2' : '#52c41a'))),
                        padding: '4px 10px',
                        borderRadius: '4px'
                      }}>
                        {selectedEventForView.type === 'meeting' && '🔴 회의 (Meeting)'}
                        {selectedEventForView.type === 'design' && '💖 미팅 (Design)'}
                        {selectedEventForView.type === 'viet' && '🟢 전사 협업 (Viet QS)'}
                        {selectedEventForView.type === 'tf' && '🟣 TF 프로젝트 (TF Team)'}
                        {selectedEventForView.type === 'personal' && '🔵 개인 일정 (Personal)'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        if (confirm('이 일정을 삭제하시겠습니까?')) {
                          setCalendarEvents(prev => prev.filter(ev => ev.id !== selectedEventForView.id));
                          setSelectedEventForView(null);
                        }
                      }}
                      style={{
                        backgroundColor: 'var(--danger)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      삭제
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedEventForView(null)}
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'todo':
        const filteredTodos = todos.filter(todo => {
          if (todoFilter === 'today') return todo.date === '오늘' && !todo.completed;
          if (todoFilter === 'overdue') return todo.date === '어제' && !todo.completed;
          if (todoFilter === 'completed') return todo.completed;
          return true; // 'all'
        });

        return (
          <div style={styles.mainContainer} className="animate-fade">
            <div style={styles.mainHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={styles.mainTitle}>
                  {todoFilter === 'all' && (currentWorkspace === 'vietqs' ? '📋 Tất cả việc cần làm' : '📋 전체 할 일')}
                  {todoFilter === 'today' && (currentWorkspace === 'vietqs' ? '📅 Việc hôm nay' : '📅 오늘 할 일')}
                  {todoFilter === 'overdue' && (currentWorkspace === 'vietqs' ? '⏰ Quá hạn' : '⏰ 기한 경과')}
                  {todoFilter === 'completed' && (currentWorkspace === 'vietqs' ? '✅ Đã hoàn thành' : '✅ 완료된 할 일')}
                </h2>
                <span style={styles.metaBadge}>
                  {filteredTodos.length}{currentWorkspace === 'vietqs' ? ' việc' : '건'}
                </span>
              </div>
            </div>

            <div style={styles.todoLayout}>
              {/* 왼쪽: 할 일 목록 리스트 */}
              <div style={styles.todoListPanel}>
                {/* Quick Add Form (Naver Works style) */}
                <form onSubmit={handleAddTodo} style={styles.todoQuickAddBar}>
                  <button 
                    type="button" 
                    onClick={() => setNewTodoStarred(!newTodoStarred)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: newTodoStarred ? '#ffb900' : 'var(--text-muted)',
                      padding: '4px'
                    }}
                    title="중요 표시"
                  >
                    <Star size={20} fill={newTodoStarred ? '#ffb900' : 'none'} />
                  </button>
                  <input 
                    type="text" 
                    placeholder={t.todoPlaceholder} 
                    value={newTodoText} 
                    onChange={(e) => setNewTodoText(e.target.value)}
                    style={styles.todoQuickInput}
                  />
                  {/* Due Date Dropdown */}
                  <select 
                    value={newTodoDate} 
                    onChange={(e) => setNewTodoDate(e.target.value)}
                    style={styles.todoSelect}
                  >
                    <option value="오늘">📅 오늘</option>
                    <option value="내일">📅 내일</option>
                    <option value="내일까지">⏰ 내일까지</option>
                    <option value="기한없음">⚪ 기한없음</option>
                  </select>
                  {/* Priority Dropdown */}
                  <select 
                    value={newTodoPriority} 
                    onChange={(e) => setNewTodoPriority(e.target.value)}
                    style={styles.todoSelect}
                  >
                    <option value="높음">🔴 높음</option>
                    <option value="보통">🟡 보통</option>
                    <option value="낮음">🟢 낮음</option>
                  </select>
                  <button type="submit" style={{ ...styles.todoAddSubmitBtn, backgroundColor: accentColor }}>
                    <Plus size={16} />
                    <span>추가</span>
                  </button>
                </form>

                {/* 할 일 목록 */}
                <div style={styles.todoItemsContainer}>
                  {filteredTodos.length === 0 ? (
                    <div style={styles.todoEmptyState}>
                      <CheckCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                      <p>등록된 할 일이 없습니다.</p>
                    </div>
                  ) : (
                    filteredTodos.map(todo => {
                      const isSelected = selectedTodoDetail?.id === todo.id;
                      
                      let todoText = todo.text;
                      let todoDate = todo.date;
                      
                      if (currentWorkspace === 'vietqs') {
                        if (todo.text === '그룹웨어 메신저 프로토타입 디자인 최종 피드백 반영') {
                          todoText = 'Áp dụng feedback thiết kế bản thử nghiệm Messenger';
                        } else if (todo.text === '베트남 지사(Viet QS) 출장 보고서 검토') {
                          todoText = 'Xem xét báo cáo chuyến công tác chi nhánh VN';
                        } else if (todo.text === '건축 적산 자동화 AI 모듈 성능 지표 2차 보고') {
                          todoText = 'Báo cáo chỉ số hiệu suất mô-đun AI ước lượng xây dựng';
                        } else if (todo.text === '사내 공용 파일 드라이브 구조 설계 개선') {
                          todoText = 'Cải thiện cấu trúc ổ đĩa dùng chung công ty';
                        } else if (todo.text === '실시간 소켓 채팅 알림 최적화 및 로깅 테스트') {
                          todoText = 'Tối ưu hóa thông báo chat socket thời gian thực';
                        }
                        
                        if (todo.date === '오늘') todoDate = 'Hôm nay';
                        else if (todo.date === '어제') todoDate = 'Hôm qua';
                        else if (todo.date === '내일까지') todoDate = 'Đến ngày mai';
                        else if (todo.date === '내일') todoDate = 'Ngày mai';
                        else if (todo.date === '기한없음') todoDate = 'Không thời hạn';
                      }

                      // Priority color mapping
                      let priorityColor = 'var(--text-muted)';
                      let priorityBg = 'var(--bg-secondary)';
                      let priorityBorder = 'var(--border-light)';
                      if (todo.priority === '높음') {
                        priorityColor = '#ef4444';
                        priorityBg = 'rgba(239, 68, 68, 0.08)';
                        priorityBorder = 'rgba(239, 68, 68, 0.2)';
                      } else if (todo.priority === '보통') {
                        priorityColor = '#f59e0b';
                        priorityBg = 'rgba(245, 158, 11, 0.08)';
                        priorityBorder = 'rgba(245, 158, 11, 0.2)';
                      } else if (todo.priority === '낮음') {
                        priorityColor = '#10b981';
                        priorityBg = 'rgba(16, 185, 129, 0.08)';
                        priorityBorder = 'rgba(16, 185, 129, 0.2)';
                      }

                      // Overdue date badge check
                      const isOverdue = todo.date === '어제' && !todo.completed;

                      return (
                        <div 
                          key={todo.id}
                          className="todo-item-row"
                          style={{
                            ...styles.todoItemRow,
                            backgroundColor: isSelected ? 'var(--bg-active)' : 'var(--bg-secondary)',
                            borderLeft: todo.completed ? '3px solid var(--border-light)' : `3px solid ${accentColor}`
                          }}
                          onClick={() => setSelectedTodoDetail(todo)}
                        >
                          {/* 체크박스 & 중요버튼 & 텍스트 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                            {/* Circle Checkbox */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTodo(todo.id);
                              }}
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: todo.completed ? '2px solid transparent' : '2px solid var(--text-muted)',
                                backgroundColor: todo.completed ? accentColor : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                flexShrink: 0
                              }}
                            >
                              {todo.completed && <Check size={12} style={{ color: '#ffffff', strokeWidth: 3 }} />}
                            </div>

                            {/* 중요표시 별 */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStarTodo(todo.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: todo.starred ? '#ffb900' : 'var(--text-muted)',
                                padding: '2px',
                                flexShrink: 0
                              }}
                            >
                              <Star size={16} fill={todo.starred ? '#ffb900' : 'none'} />
                            </button>

                            {/* 텍스트 */}
                            <span 
                              style={{
                                ...styles.todoTextLabel,
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {todoText}
                            </span>
                          </div>

                          {/* 메타 배지 및 액션 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                            {/* 기한 배지 */}
                            <span 
                              style={{ 
                                ...styles.todoBadge, 
                                color: isOverdue ? '#ef4444' : 'var(--text-secondary)',
                                backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-active)',
                                border: isOverdue ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-light)'
                              }}
                            >
                              {todoDate}
                            </span>

                            {/* 우선순위 배지 */}
                            <span 
                              style={{ 
                                ...styles.todoBadge, 
                                color: priorityColor,
                                backgroundColor: priorityBg,
                                border: `1px solid ${priorityBorder}`
                              }}
                            >
                              {todo.priority}
                            </span>

                            {/* 삭제 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTodo(todo.id);
                              }}
                              style={styles.todoRowDeleteBtn}
                              title="삭제"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 오른쪽: 할 일 상세정보 패널 (Naver Works Drawer Style) */}
              {selectedTodoDetail && (
                <div style={styles.todoDetailPanel} className="animate-scale">
                  <div style={styles.todoDetailHeader}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📋 {currentWorkspace === 'vietqs' ? 'Chi tiết công việc' : '할 일 상세 정보'}
                    </h3>
                    <button 
                      onClick={() => setSelectedTodoDetail(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div style={styles.todoDetailBody}>
                    {/* 제목 수정 */}
                    <div style={styles.todoDetailField}>
                      <label style={styles.todoDetailLabel}>{currentWorkspace === 'vietqs' ? 'Tiêu đề' : '할 일 제목'}</label>
                      <input 
                        type="text"
                        value={selectedTodoDetail.text}
                        onChange={(e) => handleUpdateTodo({ ...selectedTodoDetail, text: e.target.value })}
                        style={styles.todoDetailInput}
                      />
                    </div>

                    {/* 완료 및 중요 상태 */}
                    <div style={{ display: 'flex', gap: '16px', margin: '8px 0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input 
                          type="checkbox"
                          checked={selectedTodoDetail.completed}
                          onChange={() => handleToggleTodo(selectedTodoDetail.id)}
                          style={{ accentColor }}
                        />
                        <span>{currentWorkspace === 'vietqs' ? 'Đã xong' : '완료 상태'}</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input 
                          type="checkbox"
                          checked={selectedTodoDetail.starred}
                          onChange={() => handleToggleStarTodo(selectedTodoDetail.id)}
                          style={{ accentColor }}
                        />
                        <span>{currentWorkspace === 'vietqs' ? 'Quan trọng (*)' : '중요 업무 (별표)'}</span>
                      </label>
                    </div>

                    {/* 기한 및 우선순위 */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ ...styles.todoDetailField, flex: 1 }}>
                        <label style={styles.todoDetailLabel}>{currentWorkspace === 'vietqs' ? 'Hạn chót' : '기한 설정'}</label>
                        <select 
                          value={selectedTodoDetail.date}
                          onChange={(e) => handleUpdateTodo({ ...selectedTodoDetail, date: e.target.value })}
                          style={styles.todoDetailSelect}
                        >
                          <option value="오늘">📅 오늘</option>
                          <option value="내일">📅 내일</option>
                          <option value="내일까지">⏰ 내일까지</option>
                          <option value="기한없음">⚪ 기한없음</option>
                        </select>
                      </div>

                      <div style={{ ...styles.todoDetailField, flex: 1 }}>
                        <label style={styles.todoDetailLabel}>{currentWorkspace === 'vietqs' ? 'Độ ưu tiên' : '우선순위'}</label>
                        <select 
                          value={selectedTodoDetail.priority}
                          onChange={(e) => handleUpdateTodo({ ...selectedTodoDetail, priority: e.target.value })}
                          style={styles.todoDetailSelect}
                        >
                          <option value="높음">🔴 높음</option>
                          <option value="보통">🟡 보통</option>
                          <option value="낮음">🟢 낮음</option>
                        </select>
                      </div>
                    </div>

                    {/* 상세 설명 메모 */}
                    <div style={styles.todoDetailField}>
                      <label style={styles.todoDetailLabel}>{currentWorkspace === 'vietqs' ? 'Ghi chú (Memo)' : '상세 메모 (Naver Works Style)'}</label>
                      <textarea 
                        placeholder={currentWorkspace === 'vietqs' ? 'Nhập ghi chú chi tiết...' : '이 할 일에 대한 상세 정보를 자유롭게 기록해 보세요...'}
                        value={selectedTodoDetail.memo || ''}
                        onChange={(e) => handleUpdateTodo({ ...selectedTodoDetail, memo: e.target.value })}
                        style={styles.todoDetailTextarea}
                      />
                    </div>

                    {/* 삭제 및 닫기 버튼 */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button 
                        onClick={() => handleDeleteTodo(selectedTodoDetail.id)}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          color: '#ef4444',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          textAlign: 'center'
                        }}
                      >
                        {currentWorkspace === 'vietqs' ? 'Xóa' : '삭제하기'}
                      </button>
                      <button 
                        onClick={() => setSelectedTodoDetail(null)}
                        style={{
                          flex: 1.5,
                          padding: '10px 0',
                          backgroundColor: 'var(--bg-active)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          textAlign: 'center'
                        }}
                      >
                        {currentWorkspace === 'vietqs' ? 'Đóng' : '닫기'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'board':
        return (
          <div style={styles.mainContainer} className="animate-fade">
            <div style={styles.mainHeader}>
              <h2 style={styles.mainTitle}>{t.boardTitle}</h2>
            </div>

            <div style={styles.boardWrapper}>
              <div style={styles.postTableHeader}>
                <div style={{ flex: 3 }}>{t.titleCol}</div>
                <div style={{ flex: 1 }}>{t.deptCol}</div>
                <div style={{ flex: 1, textAlign: 'center' }}>{t.dateCol}</div>
                <div style={{ flex: 0.5, textAlign: 'center' }}>{t.viewsCol}</div>
              </div>
              <div style={styles.postTableBody}>
                {boardPosts.map(post => {
                  let titleText = post.title;
                  let authorName = post.author;
                  
                  if (currentWorkspace === 'vietqs') {
                    if (post.id === 1) {
                      titleText = '[Cần đọc] Hướng dẫn tích hợp Gemini API để đảm bảo an ninh thông tin';
                      authorName = 'P.An ninh mạng';
                    } else if (post.id === 2) {
                      titleText = 'Đăng ký tham gia giải bóng đá giao hữu giữa hai công ty';
                      authorName = 'Hội thể thao';
                    } else if (post.id === 3) {
                      titleText = 'Tổ chức cuộc thi ý tưởng khởi nghiệp nội bộ xuất sắc năm 2026';
                      authorName = 'Ban kế hoạch';
                    }
                  }

                  return (
                    <div key={post.id} className="post-table-row" style={styles.postTableRow}>
                      <div style={{ flex: 3, fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {post.id === 1 && <span style={{ ...styles.urgentBadge, backgroundColor: accentColor }}>{currentWorkspace === 'vietqs' ? 'Lưu ý' : '공지'}</span>}
                        <span>{titleText}</span>
                      </div>
                      <div style={{ flex: 1, color: 'var(--text-secondary)' }}>{authorName}</div>
                      <div style={{ flex: 1, color: 'var(--text-muted)', textAlign: 'center' }}>{post.date}</div>
                      <div style={{ flex: 0.5, color: 'var(--text-muted)', textAlign: 'center' }}>{post.views}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'drive':
        return (
          <div style={styles.mainContainer} className="animate-fade">
            <div style={styles.mainHeader}>
              <h2 style={styles.mainTitle}>{t.driveTitle}</h2>
              <button style={{ ...styles.actionBtnHeader, backgroundColor: accentColor }}>{t.uploadBtn}</button>
            </div>

            <div style={styles.driveGrid}>
              {driveFiles.map((file, idx) => {
                let fileName = file.name;
                if (currentWorkspace === 'vietqs') {
                  if (file.name === '컨코스트_CI_가이드라인.pdf') fileName = 'Concost_CI_Guideline.pdf';
                  else if (file.name === '메신저_UI_다크모드_컨셉.png') fileName = 'Messenger_UI_DarkConcept.png';
                  else if (file.name === '2026_인사규정_통합안.pdf') fileName = 'Quy_dinh_nhan_su_2026.pdf';
                }

                return (
                  <div key={idx} style={styles.driveCard}>
                    <div style={styles.fileIconWrapper}>
                      {file.type === 'pdf' ? (
                        <div style={{ ...styles.fileIconCircle, backgroundColor: '#ffeef0', color: '#ff4d4f' }}>PDF</div>
                      ) : file.type === 'doc' ? (
                        <div style={{ ...styles.fileIconCircle, backgroundColor: '#e6f7ff', color: '#1890ff' }}>DOC</div>
                      ) : (
                        <div style={{ ...styles.fileIconCircle, backgroundColor: '#f9f0ff', color: '#722ed1' }}>IMG</div>
                      )}
                    </div>
                    <div style={styles.driveCardMeta}>
                      <div style={styles.driveFileName} title={fileName}>{fileName}</div>
                      <div style={styles.driveFileSize}>{file.size} • {file.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'project':
        return (
          <div style={styles.mainContainer} className="animate-fade">
            <div style={styles.mainHeader}>
              <h2 style={styles.mainTitle}>{t.projectTitle}</h2>
              <button style={{ ...styles.actionBtnHeader, backgroundColor: accentColor }}>{t.newProjBtn}</button>
            </div>

            <div style={styles.kanbanContainer}>
              <div style={styles.kanbanCol}>
                <div style={styles.kanbanColHeader}>
                  <span>{currentWorkspace === 'vietqs' ? 'Cần làm (To Do)' : '할 일 (To Do)'}</span>
                  <span style={styles.kanbanCount}>{projectTasks.filter(t => t.status === 'todo').length}</span>
                </div>
                {projectTasks.filter(t => t.status === 'todo').map(task => {
                  let taskTitle = task.title;
                  if (currentWorkspace === 'vietqs') {
                    if (task.title === '실시간 소켓 알림 및 이메일 연동 개발') taskTitle = 'Phát triển liên kết email và thông báo thời gian thực';
                  }
                  return (
                    <div key={task.id} style={styles.kanbanCard}>
                      <div style={styles.kanbanCardTitle}>{taskTitle}</div>
                      <div style={styles.kanbanCardFooter}>
                        <span style={{ ...styles.priorityTag, backgroundColor: '#e6f7ff', color: '#1890ff' }}>{t.priority}: {task.priority === '하' ? 'Thấp' : task.priority}</span>
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.kanbanCol}>
                <div style={styles.kanbanColHeader}>
                  <span>{currentWorkspace === 'vietqs' ? 'Đang làm (In Progress)' : '진행 중 (In Progress)'}</span>
                  <span style={styles.kanbanCount}>{projectTasks.filter(t => t.status === 'progress').length}</span>
                </div>
                {projectTasks.filter(t => t.status === 'progress').map(task => {
                  let taskTitle = task.title;
                  let priorityLabel = task.priority;
                  
                  if (currentWorkspace === 'vietqs') {
                    if (task.title === 'AI 챗봇 영자 실장 멘션 답변 알고리즘 적용') {
                      taskTitle = 'Tích hợp thuật toán trả lời của Trưởng phòng AI Youngja';
                    } else if (task.title === '모바일 반응형 슬라이더 및 메뉴 오버레이') {
                      taskTitle = 'Thiết kế slider di động và menu đè';
                    }
                    
                    if (task.priority === '최상') priorityLabel = 'Khẩn cấp';
                    else if (task.priority === '중') priorityLabel = 'Trung bình';
                  }

                  return (
                    <div key={task.id} style={styles.kanbanCard}>
                      <div style={styles.kanbanCardTitle}>{taskTitle}</div>
                      <div style={styles.kanbanCardFooter}>
                        <span style={{ ...styles.priorityTag, backgroundColor: '#ffeef0', color: '#ff4d4f' }}>{t.priority}: {priorityLabel}</span>
                        <Bot size={12} style={{ color: '#ff007f' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.kanbanCol}>
                <div style={styles.kanbanColHeader}>
                  <span>{currentWorkspace === 'vietqs' ? 'Đã xong (Done)' : '완료 (Done)'}</span>
                  <span style={styles.kanbanCount}>{projectTasks.filter(t => t.status === 'done').length}</span>
                </div>
                {projectTasks.filter(t => t.status === 'done').map(task => {
                  let taskTitle = task.title;
                  if (currentWorkspace === 'vietqs') {
                    if (task.title === '메신저 1단 글로벌 메뉴 구현') taskTitle = 'Hoàn thành menu chính 1 tầng';
                  }
                  return (
                    <div key={task.id} style={styles.kanbanCard}>
                      <div style={{ ...styles.kanbanCardTitle, textDecoration: 'line-through', opacity: 0.7 }}>{taskTitle}</div>
                      <div style={styles.kanbanCardFooter}>
                        <span style={{ ...styles.priorityTag, backgroundColor: '#f6ffed', color: '#52c41a' }}>{currentWorkspace === 'vietqs' ? 'Hoàn thành' : '완료'}</span>
                        <Check size={12} style={{ color: '#52c41a' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}

// --- 추가적인 메인 레이아웃 인라인 스타일 ---
const styles = {
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    padding: '24px',
    backgroundColor: 'var(--bg-dashboard)', // CSS 변수 연동으로 테마 겹침 현상 해결!
    color: 'var(--text-primary)',
    overflowY: 'auto'
  },
  mainHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '16px',
  },
  mainTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  metaBadge: {
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    color: 'var(--text-secondary)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
  },
  actionBtnHeader: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  // Mail Styles
  mailToolbarBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-primary)',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    transition: 'all 0.15s ease',
  },
  mailBody: {
    display: 'flex',
    flex: 1,
    gap: '20px',
    overflow: 'hidden',
    height: 'calc(100vh - 120px)'
  },
  mailListWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  mailItem: {
    padding: '14px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    border: '1px solid var(--border-light)',
    transition: 'all var(--transition-fast)',
  },
  mailItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  mailSender: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
  },
  mailDate: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  mailSubject: {
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mailDetailWrapper: {
    flex: 1.5,
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  mailDetail: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  detailHeader: {
    borderBottom: '1px solid var(--border)',
    paddingBottom: '16px',
  },
  detailSubject: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '8px',
  },
  detailMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  detailTime: {
    color: 'var(--text-muted)',
  },
  detailBody: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  emptyDetail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    padding: '24px',
    textAlign: 'center',
  },

  // Calendar Styles
  calendarWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: 'var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--border)',
  },
  dayHeader: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '12px',
    textAlign: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
  },
  calendarCellEmpty: {
    backgroundColor: 'var(--bg-primary)',
    minHeight: '90px',
  },
  calendarCell: {
    backgroundColor: 'var(--bg-primary)',
    padding: '8px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    border: '1px solid rgba(255,255,255,0.01)',
  },
  cellDayNum: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  cellEvents: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  eventChip: {
    fontSize: '0.7rem',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: '500',
  },

  // Todo Styles (Naver Works split-pane layout)
  todoLayout: {
    display: 'flex',
    gap: '20px',
    flex: 1,
    height: 'calc(100% - 60px)',
    overflow: 'hidden',
  },
  todoListPanel: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
    overflowY: 'auto',
  },
  todoQuickAddBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '8px 12px',
  },
  todoQuickInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  todoSelect: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    padding: '4px 8px',
    fontSize: '0.8rem',
    outline: 'none',
    cursor: 'pointer',
  },
  todoAddSubmitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  todoItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  todoEmptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  todoItemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  todoTextLabel: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  todoBadge: {
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: '6px',
    fontWeight: '500',
  },
  todoRowDeleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  todoDetailPanel: {
    flex: 1.2,
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
    overflowY: 'auto',
  },
  todoDetailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px dashed var(--border-light)',
    paddingBottom: '12px',
  },
  todoDetailBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  todoDetailField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  todoDetailLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
  },
  todoDetailInput: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '10px 12px',
    fontSize: '0.9rem',
    outline: 'none',
  },
  todoDetailSelect: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '8px 12px',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
  },
  todoDetailTextarea: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '10px 12px',
    fontSize: '0.85rem',
    minHeight: '120px',
    outline: 'none',
    resize: 'vertical',
    lineHeight: '1.5',
  },

  // Board Styles
  boardWrapper: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-secondary)',
  },
  postTableHeader: {
    display: 'flex',
    padding: '14px 20px',
    backgroundColor: 'var(--bg-tertiary)',
    fontWeight: '700',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border)',
  },
  postTableBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  postTableRow: {
    display: 'flex',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-light)',
    fontSize: '0.9rem',
    alignItems: 'center',
  },
  urgentBadge: {
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '4px',
  },

  // Drive Styles
  driveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  driveCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
  },
  fileIconWrapper: {
    height: '48px',
    display: 'flex',
    alignItems: 'center',
  },
  fileIconCircle: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.75rem',
  },
  driveCardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  driveFileName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  driveFileSize: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },

  // Kanban Styles
  kanbanContainer: {
    display: 'flex',
    gap: '16px',
    height: 'calc(100vh - 160px)',
    overflowX: 'auto',
  },
  kanbanCol: {
    flex: 1,
    minWidth: '280px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    border: '1px solid var(--border)',
  },
  kanbanColHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    paddingBottom: '8px',
    borderBottom: '2px solid var(--border-light)',
  },
  kanbanCount: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--bg-active)',
    color: 'var(--text-secondary)',
    borderRadius: '10px',
    padding: '2px 8px',
  },
  kanbanCard: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  kanbanCardTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  kanbanCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityTag: {
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },

  // --- 추가된 설정 버튼 & 모달 스타일 ---
  settingsFloatingBtn: {
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
    zIndex: 100,
  },
  settingsOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  settingsModal: {
    width: '90%',
    maxWidth: '440px',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    color: 'var(--text-primary)',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
  },
  settingsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  settingsTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
  },
  closeBtn: {
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    marginBottom: '24px',
  },
  appHeader: {
    height: '50px',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
  },
  headerIconBtn: {
    background: 'none',
    border: 'none',
    padding: '6px',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
  headerAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginLeft: '6px',
  },
  settingsSection: {
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '16px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  settingsSectionLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottom: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  settingsSectionTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  settingsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  settingsRowInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  settingsRowDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.3',
  },
  settingsRowControl: {
    display: 'flex',
    alignItems: 'center',
  },
  settingsProfileCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-light)',
  },
  settingsProfileLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  settingsProfileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  settingsProfileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  settingsProfileNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  settingsProfileName: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  settingsProfileBadge: {
    fontSize: '0.68rem',
    padding: '1px 5px',
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    color: '#ff6b00',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  settingsProfileDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
  },
  settingsInput: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  settingsSelect: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  helperText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  settingsFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    padding: '10px 18px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-light)',
    color: 'var(--text-secondary)',
  },
  saveBtn: {
    padding: '10px 18px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '20px',
    padding: '0',
  },
  widgetCard: {
    backgroundColor: 'var(--bg-widget)', // CSS 변수 연동
    border: '1px solid var(--border-widget)', // CSS 변수 연동
    borderRadius: '16px',
    padding: '24px 20px 20px 20px', // 탑라인 공간을 위해 상단 패딩 추가
    boxShadow: 'var(--shadow-widget)', // CSS 변수 연동
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  widgetTitle: {
    fontSize: '0.9rem',
    fontWeight: '800',
    marginBottom: '14px',
    color: 'var(--text-primary)',
    borderBottom: '1px dashed var(--border-light)',
    paddingBottom: '8px',
  },
  editDashboardBtn: {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }
};
