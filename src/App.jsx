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
  Mail as MailIcon, 
  Calendar as CalendarIcon, 
  Bot, 
  Folder, 
  Clock,
  Settings,
  X,
  Key,
  Database
} from 'lucide-react';

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

// --- 다국어 번역 사전 ---
const TRANSLATIONS = {
  concost: {
    home: "대시보드",
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
    aiName: "✨ AI 디자인실장 (영자)",
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
    home: "Bảng điều khiển",
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
    aiName: "✨ Trưởng phòng thiết kế AI (Youngja)",
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
  const [allEmployees, setAllEmployees] = useState([]);
  const [isHrCardOpen, setIsHrCardOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [currentWorkspace, setCurrentWorkspace] = useState('concost'); // 'concost' or 'vietqs'
  const [currentMenu, setCurrentMenu] = useState('home'); // 'home', 'chat', 'mail', etc.
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [activeChat, setActiveChat] = useState({ type: 'channel', id: 'general' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Gemini API Key 및 모델명 보관 설정
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('gemini_model') || 'gemini-3.5-flash');
  const [aiEnabled, setAiEnabled] = useState(localStorage.getItem('ai_assistant_enabled') !== 'false');

  // 대시보드 위젯 설정 상태
  const [visibleWidgets, setVisibleWidgets] = useState(() => {
    const saved = localStorage.getItem('works_dashboard_widgets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['todo', 'employees', 'calendar', 'board'];
  });
  const [isWidgetSettingsOpen, setIsWidgetSettingsOpen] = useState(false);

  // 🐶🤖 AI 챗봇 비서 플로팅 대화창 상태
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotPos, setChatbotPos] = useState({ x: 0, y: 0 });
  const [chatbotText, setChatbotText] = useState('');
  const [chatbotMessages, setChatbotMessages] = useState([
    { id: 'cb-1', sender: 'youngja', senderName: 'AI 디자인실장 영자', content: '안녕하세요, 대표님! 🐶🤖 귀여운 강아지 로봇 비서 영자입니다. 어떤 업무를 도와드릴까요? 메신저 테마나 디자인, 혹은 사내 규정에 대해 물어보세요!', time: '오전 11:00' }
  ]);
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);

  const socketRef = useRef(null);
  const t = TRANSLATIONS[currentWorkspace] || TRANSLATIONS.concost;

  // --- 할 일 (To-Do) 상태 ---
  const [todos, setTodos] = useState([
    { id: 1, text: '그룹웨어 메신저 프로토타입 디자인 최종 피드백 반영', completed: false, date: '오늘' },
    { id: 2, text: '베트남 지사(Viet QS) 출장 보고서 검토', completed: true, date: '어제' },
    { id: 3, text: '건축 적산 자동화 AI 모듈 성능 지표 2차 보고', completed: false, date: '내일까지' }
  ]);
  const [newTodoText, setNewTodoText] = useState('');

  // --- 메일 (Mail) 데이터 ---
  const [mails, setMails] = useState([
    { id: 1, sender: '김현지 과장 (컨코스트)', title: '[긴급] 2026년 하반기 경영전략 회의 안건 제출 요청', date: '오전 11:20', read: false, important: true, desc: '대표님, 금일 오후 5시까지 경영전략 회의 안건 관련 부서별 취합본 피드백을 부탁드립니다.' },
    { id: 2, sender: 'Nguyen Van Minh (Viet QS)', title: '베트남 하노이 오피스 임대 계약 갱신 세부 항목 전달', date: '오전 09:15', read: false, important: false, desc: 'Hà Nội Office 3층 임대 계약 연장 관련 회계 품의 및 도면 세부 사안을 첨부하오니 기안 결재 부탁드립니다.' },
    { id: 3, sender: '인사노무팀', title: '[공지] 2026년 하절기 집중 휴가 기간 운영 안내의 건', date: '어제', read: true, important: false, desc: '사내 규정에 의거하여 하절기 리프레시 집중 휴가 신청에 대한 결재 및 일정을 공유합니다.' }
  ]);
  const [selectedMail, setSelectedMail] = useState(null);

  // --- 캘린더 (Calendar) 일정 ---
  const [calendarEvents, setCalendarEvents] = useState([
    { day: 15, title: '메신저 개발 킥오프', type: 'meeting' },
    { day: 18, title: '디자인실장 영자 미팅', type: 'design' },
    { day: 22, title: '베트남 지사 화상 회의', type: 'viet' },
    { day: 25, title: 'TF팀 중간 발표회', type: 'tf' }
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
    { id: 'kodari-dm', name: '코다리 대표 (기획)', avatarColor: '#0058bc', status: 'idle' }
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
      { id: 'ai1', sender: 'youngja', senderName: '영자 실장', content: '안녕하세요, 대표님! ✨ 디자인실장 영자입니다. 저에게 메신저 디자인 테마나 로고 색상에 대해 질문해 보세요! 🎨', time: '오전 11:00', youngjaImageUrl: YOUNGJA_IMAGES.hello }
    ]
  });

  const [isTyping, setIsTyping] = useState(false);

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
  }, [currentWorkspace, currentUser]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (res.ok && data.success) {
        setAllEmployees(data.employees);
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
            setAllEmployees(data.employees);
            const retryFound = data.employees.find(e => e.id === senderId || e.empNo === senderId);
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
          senderName: isViet ? '✨ Trưởng phòng thiết kế AI (Youngja)' : '✨ AI 디자인실장 영자',
          content: isViet 
            ? `Xin chào Giám đốc! ✨ Tôi là Youngja, Trưởng phòng thiết kế AI. Ngài có thể hỏi tôi về chủ đề màu sắc thiết kế hoặc logo của Viet QS! 🎨\n\n💡 Ví dụ:\n- "Logo Viet QS màu sắc như thế nào"\n- "Tư vấn phối màu Dark Mode đẹp"\n- "Xin chào Youngja"`
            : `안녕하세요, 대표님! ✨ 디자인실장 영자입니다. 저에게 메신저 디자인 테마나 로고 색상에 대해 질문해 보세요! 🎨\n\n💡 예를 들면:\n- "CONCOST 로고 어울리는 색 추천해줘"\n- "VIETQS 로고 디자인 분석해줘"\n- "이쁜 메신저 다크모드 팁"`
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
    if (activeChat.type === 'dm') return activeChat.id;
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
      너는 (주)컨코스트 및 베트남 지사 Viet QS의 유능하고 상냥한 AI 디자인실장 '영자'이다.
      아래 사내 지식 정보를 기반으로 대표님의 질문에 정교하게 답변해야 한다.
      
      [사내 임직원 명부 (RAG DB)]
      - 박용진 수석 (IT개발본부, 연락처: 010-9988-1234, 소속: 본사)
      - 김현지 과장 (경영지원본부, 연락처: 010-5566-7788, 소속: 본사)
      - Nguyen Van Minh (Viet QS 베트남 지사 대표, 하노이 오피스 임대차 계약 총괄)
      
      [브랜드 가이드라인]
      - CONCOST: 메인 컬러 주황색 (#ff6b00). 역동성과 활력을 상징. 차콜 다크모드와 환상적인 대비를 이룸.
      - Viet QS: 메인 컬러 딥블루 (#0058bc). 신뢰성과 IT 품질 보증을 상징. 그린 빌딩 로고와 조합됨.
      
      [답변 주의사항]
      - 본인을 "저 영자가요~" 혹은 "디자인실장 영자"라고 지칭해라.
      - 대표님에게 무한한 신뢰를 담아 "~요!", "~답니다!" 체를 써서 상냥하게 답해라.
      - 대답은 베트남 지사 모드(${isVietMode ? '참' : '거짓'})인 경우 베트남어(Tiếng Việt) 위주 또는 한국어와 섞어서 친절하게 해라.
      - 항상 명확하고 실용적인 수치나 정보를 포함해라.
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

  const handleSendMessage = async (content) => {
    const chatKey = getChatKey();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const isViet = currentWorkspace === 'vietqs';

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'me',
      senderName: isViet ? 'Giám đốc' : '대표님',
      content,
      time: timeStr,
      channelId: chatKey // 소켓 전송 식별자
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
      let imageKey = 'thumbsup';

      // 2) API Key가 없거나 실패 시 기존 로컬 시나리오 작동 (Mock 모드)
      if (!reply) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const query = content.toLowerCase();
        if (isViet) {
          if (query.includes('logo') || query.includes('viet qs')) {
            reply = `Thưa Giám đốc! Logo của Viet QS mang tính nhận diện rất cao 💙\n\nTông màu chủ đạo là Xanh dương đậm (#0058bc) tượng trưng cho uy tín và công nghệ thông tin thông minh, kết hợp cùng dải màu xanh lá cây tượng trưng cho sự tăng trưởng bền vững.`;
            imageKey = 'presenting';
          } else {
            reply = `Cảm ơn Giám đốc! Ý kiến của ngài thật tuyệt vời. 👍✨ 저 자비스 개발부장도 이 멋진 베트남어 지사 메신저 빌드에 자부심을 느낍니다!`;
            imageKey = 'success';
          }
        } else {
          if (query.includes('로고') || query.includes('concost') || query.includes('색')) {
            reply = `대표님! CONCOST 로고는 주황색(#ff6b00) 포인트로 역동성을 살린 멋진 BI입니다. 어두운 배경과 최적의 대비를 이루며, 1단 글로벌 메뉴 구성과도 아주 잘 녹아들어요! 🎨`;
            imageKey = 'idea';
          } else {
            reply = `대표님, 정말 훌륭한 질문이에요! 👍 자비스 개발부장과 영자 실장이 힘을 합쳐 이 시스템을 더욱 고도화해 나갈게요. 충성! 🫡`;
            imageKey = 'working';
          }
        }
      } else {
        // 실제 API 성공 시 표정 이미지 무작위/상황 매핑
        imageKey = reply.includes('감사') || reply.includes('cảm ơn') ? 'success' : 'idea';
      }

      setIsTyping(false);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'youngja',
        senderName: isViet ? '✨ Trưởng phòng thiết kế AI (Youngja)' : '✨ AI 디자인실장 영자',
        content: reply,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        youngjaImageUrl: YOUNGJA_IMAGES[imageKey]
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

  const handleCloseSettings = () => {
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setGeminiModel(localStorage.getItem('gemini_model') || 'gemini-1.5-flash');
    setAiEnabled(localStorage.getItem('ai_assistant_enabled') !== 'false');
    setIsSettingsOpen(false);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('gemini_model', geminiModel);
    localStorage.setItem('ai_assistant_enabled', String(aiEnabled));
    setIsSettingsOpen(false);
    playNotificationSound();
  };

  const handleChatbotSendMessage = async (e) => {
    e.preventDefault();
    if (!chatbotText.trim()) return;

    const userMsg = {
      id: `cb-user-${Date.now()}`,
      sender: 'me',
      senderName: currentWorkspace === 'vietqs' ? 'Giám đốc' : '대표님',
      content: chatbotText.trim(),
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatbotMessages(prev => [...prev, userMsg]);
    const prompt = chatbotText.trim();
    setChatbotText('');
    setIsChatbotTyping(true);

    const isViet = currentWorkspace === 'vietqs';
    let reply = await askGeminiAI(prompt, isViet);
    let imageKey = 'thumbsup';

    if (!reply) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (isViet) {
        reply = `Thưa Giám đốc! Tôi là Robot cưng hỗ trợ của ngài 🐶🤖. Vui lòng thiết lập API Key trong cài đặt (⚙️) để kích hoạt toàn bộ tính năng RAG thực tế!`;
      } else {
        reply = `대표님! 🐶🤖 설정(⚙️)에서 Google Gemini API Key를 등록하시면 실시간 RAG와 완벽한 AI 맞춤 비서 서비스를 제공해드릴 수 있어요. 지금은 데모 모드랍니다!`;
      }
    } else {
      imageKey = reply.includes('감사') || reply.includes('cảm ơn') ? 'success' : 'idea';
    }

    setIsChatbotTyping(false);
    const aiMsg = {
      id: `cb-ai-${Date.now()}`,
      sender: 'youngja',
      senderName: isViet ? '✨ Trưởng phòng thiết kế AI (Youngja)' : '✨ AI 디자인실장 영자',
      content: reply,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      youngjaImageUrl: YOUNGJA_IMAGES[imageKey]
    };

    setChatbotMessages(prev => [...prev, aiMsg]);
    playNotificationSound();
  };

  if (!currentUser) {
    return <LoginForm onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-container">
      {/* 1단 & 2단 사이드바 */}
      <div style={{ display: isSidebarOpen ? 'flex' : 'none', height: '100%', zIndex: 50 }}>
        <Sidebar
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={(ws) => {
            setCurrentWorkspace(ws);
            setActiveChat({ type: 'channel', id: 'general' });
          }}
          currentMenu={currentMenu}
          onMenuChange={(menu) => {
            setCurrentMenu(menu);
            if (menu === 'chat') setActiveChat({ type: 'channel', id: 'general' });
          }}
          channels={workspaceChannels[currentWorkspace]}
          dms={dms}
          activeChat={activeChat}
          onActiveChatChange={(chat) => {
            setActiveChat(chat);
            setCurrentMenu('chat');
          }}
          onOpenModal={() => setIsModalOpen(true)}
          isLightTheme={isLightTheme}
          onToggleTheme={() => setIsLightTheme(!isLightTheme)}
          todoCount={todos.filter(t => !t.completed).length}
          mailUnreadCount={mails.filter(m => !m.read).length}
          t={t}
          onOpenSettings={() => setIsSettingsOpen(true)}
          aiEnabled={aiEnabled}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* 3단 메인 뷰포트 */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {renderMainContent()}
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
      />

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
          className="glass-panel animate-scale" 
          style={styles.settingsModal}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.settingsHeader}>
            <h3 style={styles.settingsTitle}>⚙️ 사내 AI & API 환경설정</h3>
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
            <div style={styles.inputGroup}>
              <label style={{ ...styles.label, justifyContent: 'space-between', width: '100%', cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Bot size={16} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                  {currentWorkspace === 'vietqs' ? 'Kích hoạt Trợ lý AI' : 'AI 챗봇 비서 활성화'}
                </span>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>
              <span style={styles.helperText}>
                {currentWorkspace === 'vietqs' 
                  ? 'Bật/tắt hiển thị Trợ lý thiết kế AI (Youngja) trên thanh menu.'
                  : '활성화 시, 사이드바에 ✨ AI 디자인실장 (영자) 방이 노출되어 대화가 가능해집니다.'}
              </span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Key size={16} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... 형식의 키를 입력해 주세요."
                style={styles.settingsInput}
              />
              <span style={styles.helperText}>
                설정 시, AI 디자인실장 영자 챗봇이 실제 인공지능 지식 기반으로 답변해 줍니다.
              </span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Database size={16} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                AI 모델 선택 (Gemini Engine)
              </label>
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
            <h3 style={styles.settingsTitle}>⚙️ 대시보드 위젯 설정</h3>
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
                오늘 할 일 목록 (Todo)
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
                우리 회사 임직원 현황
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
                이번 주 전사 일정
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
                사내 주요 소식
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

      {/* 🐶🤖 귀여운 강아지 로봇 AI 챗봇 비서 플로팅 아이콘 */}
      <button
        style={{
          position: 'fixed',
          right: '24px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          border: '2px solid #ff6b00',
          boxShadow: '0 8px 24px rgba(255, 107, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        title="AI 비서 영자 대화하기"
        className="dog-robot-btn"
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12c0-2 2-3 4-2v6c-2 1-4 0-4-4Z" fill="#ff6b00" />
          <path d="M32 12c0-2-2-3-4-2v6c2 1 4 0 4-4Z" fill="#ff6b00" />
          <rect x="7" y="7" width="22" height="20" rx="5" fill="#2b2d31" stroke="#ff6b00" strokeWidth="2" />
          <rect x="10" y="10" width="16" height="11" rx="3" fill="#111214" />
          <circle cx="14" cy="15" r="2.5" fill="#00ffcc" />
          <circle cx="22" cy="15" r="2.5" fill="#00ffcc" />
          <ellipse cx="18" cy="23" rx="2" ry="1.5" fill="#ff6b00" />
        </svg>
      </button>

      {/* 🐶🤖 AI 챗봇 비서 대화창 */}
      <div 
        style={{
          position: 'fixed',
          right: '100px',
          top: '15%',
          width: '380px',
          height: '520px',
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
            <span>🐶🤖 AI 비서 영자 (gemini-3.5-flash)</span>
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
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ffecf4', display: 'flex', alignItems: 'center', justifySelf: 'center', flexShrink: 0 }}>
                    <Bot size={16} style={{ color: '#ff007f', margin: 'auto' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '75%' }}>
                  {!isMe && (
                    <span style={{ fontSize: '0.7rem', color: '#ff007f', fontWeight: 'bold' }}>{msg.senderName}</span>
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
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ffecf4', display: 'flex' }}>
                <Bot size={16} style={{ color: '#ff007f', margin: 'auto' }} />
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
          />
        );

      case 'home':
        return (
          <div style={styles.mainContainer} className="animate-fade">
            <div style={styles.mainHeader}>
              <h2 style={styles.mainTitle}>📊 종합 대시보드</h2>
              <button 
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
                ⚙️ 대시보드 편집
              </button>
            </div>

            <div style={styles.dashboardGrid}>
              {/* 위젯 1: AI 출근길 브리핑 (상단 와이드) */}
              <div style={{ ...styles.widgetCard, gridColumn: '1 / -1' }}>
                <div style={{ ...styles.widgetTitle, color: accentColor }}>
                  🤖 AI Workspace Morning Briefing
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '36px' }}>🌅</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {currentUser?.userName} {currentUser?.grade || '대표님'}, 좋은 아침입니다!
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      오늘 등록된 전사 협업 일정은 <strong style={{ color: accentColor }}>{calendarEvents.length}건</strong>이며, 진행중인 업무 태스크 카드가 <strong style={{ color: accentColor }}>{todos.filter(t => !t.completed).length}건</strong> 대기하고 있습니다. 
                      최근 Viet QS 법인의 BIM 협업 드라이브에 <strong style={{ color: accentColor }}>{driveFiles.length}개</strong>의 신규 도면 파일이 업로드되었습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 위젯 2: 알림 상태 */}
              <div style={styles.widgetCard}>
                <div style={styles.widgetTitle}>🔔 미확인 알림 상태</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
                  <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setCurrentMenu('chat')}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>💬</div>
                    <strong style={{ fontSize: '1.1rem', color: accentColor }}>3 건</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>새 메시지</div>
                  </div>
                  <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setCurrentMenu('mail')}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>📧</div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{mails.filter(m => !m.read).length} 건</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>읽지않은 메일</div>
                  </div>
                </div>
              </div>

              {/* 위젯 3: 오늘 할 일 */}
              {visibleWidgets.includes('todo') && (
                <div style={styles.widgetCard}>
                  <div style={styles.widgetTitle}>✅ 오늘 할 일 목록</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {todos.slice(0, 3).map(todo => (
                      <div key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                          • {todo.text}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: todo.completed ? 'rgba(35, 165, 90, 0.1)' : 'rgba(240, 178, 50, 0.1)',
                          color: todo.completed ? '#23a55a' : '#f0b232'
                        }}>
                          {todo.completed ? '완료' : '진행중'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 위젯 4: 임직원 현황 */}
              {visibleWidgets.includes('employees') && (
                <div style={styles.widgetCard}>
                  <div style={styles.widgetTitle}>👥 우리 회사 임직원 현황</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontWeight: '700' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>양사 총 임직원 수</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{allEmployees.length} 명</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>CON-COST 본사</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{allEmployees.filter(e => e.company === 'CON-COST').length} 명</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Viet QS 지사</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{allEmployees.filter(e => e.company === 'Viet QS').length} 명</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 위젯 5: 이번 주 전사 일정 */}
              {visibleWidgets.includes('calendar') && (
                <div style={styles.widgetCard}>
                  <div style={styles.widgetTitle}>📅 이번 주 전사 일정</div>
                  <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', fontWeight: '700' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '8px 0', color: accentColor }}>15일 (월)</td>
                        <td style={{ color: 'var(--text-primary)' }}>BIM파트 주간 1차 도면 QC 납품</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '8px 0', color: 'var(--text-primary)' }}>17일 (수)</td>
                        <td style={{ color: 'var(--text-primary)' }}>Viet QS Horizon 회의</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>19일 (금)</td>
                        <td style={{ color: 'var(--text-primary)' }}>대표이사 주관 경영 보고</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* 위젯 6: 사내 주요 소식 */}
              {visibleWidgets.includes('board') && (
                <div style={styles.widgetCard}>
                  <div style={styles.widgetTitle}>📢 사내 주요 소식</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                    {boardPosts.slice(0, 3).map(post => (
                      <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setCurrentMenu('board')}>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                          {post.title}
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

      case 'mail':
        return (
          <div style={styles.mainContainer} className="animate-fade">
            <div style={styles.mainHeader}>
              <h2 style={styles.mainTitle}>{t.mailTitle}</h2>
              <div style={styles.mainHeaderRight}>
                <span style={styles.metaBadge}>{t.unread} {mails.filter(m => !m.read).length}{t.cases}</span>
              </div>
            </div>

            <div style={styles.mailBody}>
              <div style={styles.mailListWrapper}>
                {mails.map(mail => {
                  let senderName = mail.sender;
                  let mailTitle = mail.title;
                  let mailDesc = mail.desc;
                  
                  if (currentWorkspace === 'vietqs') {
                    if (mail.id === 1) {
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
                      className="mail-item"
                      style={{
                        ...styles.mailItem,
                        borderLeft: mail.important ? `3px solid ${accentColor}` : '3px solid transparent',
                        backgroundColor: selectedMail?.id === mail.id ? 'var(--bg-active)' : 'var(--bg-secondary)'
                      }}
                      onClick={() => {
                        setSelectedMail({ ...mail, sender: senderName, title: mailTitle, desc: mailDesc });
                        setMails(prev => prev.map(m => m.id === mail.id ? { ...m, read: true } : m));
                      }}
                    >
                      <div style={styles.mailItemHeader}>
                        <span style={{ ...styles.mailSender, fontWeight: !mail.read ? '700' : '400' }}>
                          {senderName}
                        </span>
                        <span style={styles.mailDate}>{mail.date}</span>
                      </div>
                      <div style={{
                        ...styles.mailSubject,
                        fontWeight: !mail.read ? '700' : '400',
                        color: !mail.read ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}>
                        {mailTitle}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.mailDetailWrapper}>
                {selectedMail ? (
                  <div style={styles.mailDetail} className="animate-scale">
                    <div style={styles.detailHeader}>
                      <h3 style={styles.detailSubject}>{selectedMail.title}</h3>
                      <div style={styles.detailMeta}>
                        <div>{currentWorkspace === 'vietqs' ? 'Người gửi: ' : '보낸사람: '}<strong>{selectedMail.sender}</strong></div>
                        <div style={styles.detailTime}>{selectedMail.date}</div>
                      </div>
                    </div>
                    <div style={styles.detailBody}>{selectedMail.desc}</div>
                  </div>
                ) : (
                  <div style={styles.emptyDetail}>
                    <MailIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p>{currentWorkspace === 'vietqs' ? 'Vui lòng chọn thư từ danh sách để xem chi tiết.' : '상세 메일 내용을 보시려면 목록에서 메일을 선택해 주세요.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'calendar':
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        const weekdays = currentWorkspace === 'vietqs' 
          ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] 
          : ['일', '월', '화', '수', '목', '금', '토'];

        return (
          <div style={styles.mainContainer} className="animate-fade">
            <div style={styles.mainHeader}>
              <h2 style={styles.mainTitle}>{t.calendarTitle}</h2>
              <span style={styles.metaBadge}>{currentWorkspace === 'vietqs' ? 'Tháng 6 năm 2026' : '2026년 6월'}</span>
            </div>

            <div style={styles.calendarWrapper}>
              {weekdays.map(d => (
                <div key={d} style={styles.dayHeader}>{d}</div>
              ))}
              
              <div style={styles.calendarCellEmpty} />

              {days.map(d => {
                const dayEvents = calendarEvents.filter(e => e.day === d);
                return (
                  <div key={d} style={styles.calendarCell}>
                    <div style={styles.cellDayNum}>{d}</div>
                    <div style={styles.cellEvents}>
                      {dayEvents.map((e, idx) => {
                        let eventTitle = e.title;
                        if (currentWorkspace === 'vietqs') {
                          if (e.title === '메신저 개발 킥오프') eventTitle = 'Kick-off phát triển';
                          else if (e.title === '디자인실장 영자 미팅') eventTitle = 'Họp với P.Thiết kế';
                          else if (e.title === '베트남 지사 화상 회의') eventTitle = 'Họp trực tuyến VN';
                          else if (e.title === 'TF팀 중간 발표회') eventTitle = 'Báo cáo giữa kỳ TF';
                        }
                        return (
                          <div 
                            key={idx} 
                            style={{
                              ...styles.eventChip,
                              backgroundColor: e.type === 'meeting' ? accentColor : (e.type === 'design' ? '#ff007f' : '#23a55a')
                            }}
                          >
                            {eventTitle}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'todo':
        return (
          <div style={styles.mainContainer} className="animate-fade">
            <div style={styles.mainHeader}>
              <h2 style={styles.mainTitle}>{t.todoTitle}</h2>
              <span style={styles.metaBadge}>{currentWorkspace === 'vietqs' ? 'Chưa xong ' : '미완료 '}{todos.filter(t => !t.completed).length}{currentWorkspace === 'vietqs' ? ' việc' : '건'}</span>
            </div>

            <div style={styles.todoContent}>
              <form onSubmit={handleAddTodo} style={styles.todoForm}>
                <input 
                  type="text" 
                  placeholder={t.todoPlaceholder} 
                  value={newTodoText} 
                  onChange={(e) => setNewTodoText(e.target.value)}
                  style={styles.todoInput}
                />
                <button type="submit" style={{ ...styles.todoSubmitBtn, backgroundColor: accentColor }}>
                  <Plus size={18} />
                  {t.todoBtn}
                </button>
              </form>

              <div style={styles.todoList}>
                {todos.map(todo => {
                  let todoText = todo.text;
                  let todoDate = todo.date;
                  
                  if (currentWorkspace === 'vietqs') {
                    if (todo.text === '그룹웨어 메신저 프로토타입 디자인 최종 피드백 반영') {
                      todoText = 'Áp dụng feedback thiết kế bản thử nghiệm Messenger';
                    } else if (todo.text === '베트남 지사(Viet QS) 출장 보고서 검토') {
                      todoText = 'Xem xét báo cáo chuyến công tác chi nhánh VN';
                    } else if (todo.text === '건축 적산 자동화 AI 모듈 성능 지표 2차 보고') {
                      todoText = 'Báo cáo chỉ số hiệu suất mô-đun AI ước lượng xây dựng';
                    }
                    
                    if (todo.date === '오늘') todoDate = 'Hôm nay';
                    else if (todo.date === '어제') todoDate = 'Hôm qua';
                    else if (todo.date === '내일까지') todoDate = 'Đến ngày mai';
                  }

                  return (
                    <div 
                      key={todo.id} 
                      style={{
                        ...styles.todoItem,
                        opacity: todo.completed ? 0.6 : 1,
                        borderLeft: todo.completed ? '3px solid var(--border-light)' : `3px solid ${accentColor}`
                      }}
                    >
                      <div 
                        style={styles.todoCheckArea} 
                        onClick={() => handleToggleTodo(todo.id)}
                      >
                        <div style={{
                          ...styles.todoCheckbox,
                          backgroundColor: todo.completed ? accentColor : 'transparent',
                          borderColor: todo.completed ? 'transparent' : 'var(--text-muted)'
                        }}>
                          {todo.completed && <Check size={12} style={{ color: '#ffffff' }} />}
                        </div>
                        <span style={{
                          ...styles.todoText,
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                        }}>
                          {todoText}
                        </span>
                      </div>
                      <div style={styles.todoMeta}>
                        <span style={styles.todoDateBadge}>{todoDate}</span>
                        <button 
                          onClick={() => handleDeleteTodo(todo.id)} 
                          className="todo-delete-btn"
                          style={styles.todoDeleteBtn}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
    backgroundColor: 'var(--bg-primary)',
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

  // Todo Styles
  todoContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '640px',
    width: '100%',
    margin: '0 auto',
  },
  todoForm: {
    display: 'flex',
    gap: '8px',
  },
  todoInput: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  todoSubmitBtn: {
    padding: '0 20px',
    borderRadius: 'var(--radius-md)',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  todoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  todoItem: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoCheckArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    flex: 1,
  },
  todoCheckbox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
  todoText: {
    fontSize: '0.925rem',
    lineHeight: '1.4',
  },
  todoMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  todoDateBadge: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--bg-active)',
    color: 'var(--text-secondary)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  todoDeleteBtn: {
    color: 'var(--text-muted)',
    padding: '4px',
    borderRadius: 'var(--radius-sm)',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    padding: '0',
  },
  widgetCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
