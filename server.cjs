const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 8080;
const dbPath = path.join(__dirname, 'db.json');
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist'))); // Serve React production build

// ──────────────────────────────────────────────
// MongoDB Atlas 연동 및 Schema/Model 정의
// ──────────────────────────────────────────────

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is missing in .env!');
  process.exit(1);
}

// MongoDB Connect
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('🍃 MongoDB Atlas Connected successfully!');
    // 최초 실행 시 로컬 db.json 및 전사 임직원 Seed 마이그레이션 실행
    await migrateJsonToMongo();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// 1. User Schema (상세 인사카드 필드 대거 추가)
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  empNo: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  status: { type: String, default: '재직' },
  statusMsg: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  grade: { type: String, default: '사원' },
  role: { type: String, default: '사원' },
  dept: { type: String, default: '미배정' },
  company: { type: String, default: 'CON-COST' },
  email: String,
  phone: String,
  nationality: String,
  workplace: String,
  joinDate: String
});
const User = mongoose.model('User', UserSchema);

// 2. Chat Schema
const ChatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sender: String,
  senderName: String,
  content: String,
  time: String,
  channelId: String,
  reactions: { type: Array, default: [] }
});
const Chat = mongoose.model('Chat', ChatSchema);

// 3. Event Schema
const EventSchema = new mongoose.Schema({
  day: Number,
  title: String,
  type: String
});
// day + title 복합 인덱스로 중복 방지
EventSchema.index({ day: 1, title: 1 }, { unique: true });
const Event = mongoose.model('Event', EventSchema);

// 4. Channel Schema
const ChannelSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  workspace: String
});
const Channel = mongoose.model('Channel', ChannelSchema);

// JSON 파일 DB 백업 및 전사 사원 시드 마이그레이션 헬퍼
async function migrateJsonToMongo() {
  try {
    const userCount = await User.countDocuments();
    // 10명 미만일 때 임직원 벌크 시드 데이터 주입
    if (userCount < 10) {
      console.log('🍃 MongoDB users list is empty or small. Inserting 전사 임직원 Seed...');
      
      const defaultUsers = [
        {
          id: 'yjpark',
          empNo: 'EMP-2018-001',
          userName: '박용진',
          company: 'CON-COST',
          dept: 'BIM파트',
          grade: '수석',
          role: '수석',
          status: '재직',
          email: 'yjpark@con-cost.com',
          phone: '010-7700-7859',
          nationality: '대한민국',
          workplace: '서울 본사',
          joinDate: '2018-04-01'
        },
        {
          id: 'yjw',
          empNo: 'CC-002',
          userName: '유종욱',
          company: 'CON-COST',
          dept: '경영지원본부',
          grade: '실장',
          role: '실장',
          status: '재직',
          email: 'yjw@con-cost.com',
          phone: '010-5566-7788',
          nationality: '대한민국',
          workplace: '서울 본사',
          joinDate: '2016-04-01'
        }
      ];

      // 시드 루프
      const orgEmployeeSeed = [
        ["CC-001", "이서진", "CON-COST", "경영지원본부", "상무", "상무"],
        ["CC-003", "김영은", "CON-COST", "경영지원본부", "책임", "책임"],
        ["CC-004", "김태영", "CON-COST", "경영지원본부", "선임", "선임"],
        ["CC-005", "현예은", "CON-COST", "경영지원본부", "선임", "선임"],
        ["CC-008", "장범선", "CON-COST", "QC", "실장", "실장"],
        ["CC-009", "조한빈", "CON-COST", "QC", "실장", "실장"],
        ["CC-010", "최영배", "CON-COST", "기술본부", "본부장", "본부장"],
        ["CC-011", "김재현", "CON-COST", "마감", "수석", "수석"],
        ["CC-012", "성대용", "CON-COST", "마감", "수석", "수석"],
        ["CC-013", "양한규", "CON-COST", "마감", "수석", "수석"],
        ["CC-014", "원종수", "CON-COST", "마감", "수석", "수석"],
        ["CC-015", "송영길", "CON-COST", "마감", "수석", "수석"],
        ["CC-016", "이은지", "CON-COST", "마감", "책임", "책임"],
        ["CC-017", "남은주", "CON-COST", "마감", "책임", "책임"],
        ["CC-018", "송치영", "CON-COST", "마감", "책임", "책임"],
        ["CC-019", "임승주", "CON-COST", "마감", "선임", "선임"],
        ["CC-020", "박가림", "CON-COST", "마감", "선임", "선임"],
        ["CC-021", "임창열", "CON-COST", "마감", "선임", "선임"],
        ["CC-022", "김수겸", "CON-COST", "마감", "프로", "프로"],
        ["CC-023", "신동현", "CON-COST", "구조/토목 조경", "팀장", "팀장"],
        ["CC-024", "김채원", "CON-COST", "구조/토목 조경", "수석", "수석"],
        ["CC-025", "이정철", "CON-COST", "구조/토목 조경", "수석", "수석"],
        ["CC-026", "박소현", "CON-COST", "구조/토목 조경", "책임", "책임"],
        ["CC-027", "서화원", "CON-COST", "구조/토목 조경", "책임", "책임"],
        ["CC-028", "양진혁", "CON-COST", "구조/토목 조경", "프로", "프로"],
        ["CC-029", "이성희", "CON-COST", "BIM파트", "파트장", "파트장"],
        ["CC-030", "오승균", "CON-COST", "토목·조경파트", "파트장", "파트장"],
        ["CC-031", "이경훈", "CON-COST", "클레임센터", "센터장", "센터장"],
        ["CC-032", "김현수", "CON-COST", "클레임센터", "기술이사", "기술이사"],
        ["CC-033", "우상진", "CON-COST", "클레임센터", "기술이사", "기술이사"],
        ["VQS-001", "Hyun Dong Myung", "Viet QS", "경영진", "CEO", "CEO"],
        ["VQS-002", "Lee Won Hee", "Viet QS", "경영진", "Executive Vice President", "Executive Vice President"],
        ["VQS-003", "Lan Phuong", "Viet QS", "Management Support", "General Manager", "General Manager"],
        ["VQS-004", "Thanh Tuyen", "Viet QS", "Management Support", "Staff", "Staff"],
        ["VQS-005", "Yen Phuong", "Viet QS", "Management Support", "Staff", "Staff"],
        ["VQS-006", "Van Dung", "Viet QS", "Internal 1", "Team Leader", "Team Leader"],
        ["VQS-007", "Huyen Thu", "Viet QS", "Internal 1", "Team Leader", "Team Leader"],
        ["VQS-009", "Dong Phuong", "Viet QS", "Internal 1", "Staff", "Staff"],
        ["VQS-010", "Quang Truong", "Viet QS", "Internal 1", "Staff", "Staff"],
        ["VQS-012", "Thanh Xuan", "Viet QS", "Internal 2", "Asst. Team Leader", "Asst. Team Leader"],
        ["VQS-013", "Kha Ai", "Viet QS", "Internal 2", "Staff", "Staff"],
        ["VQS-014", "Van Da", "Viet QS", "Internal 2", "Staff", "Staff"],
        ["VQS-015", "Kim Tuyen", "Viet QS", "Internal 2", "Staff", "Staff"],
        ["VQS-016", "Phuoc Nguyen", "Viet QS", "Internal 2", "Staff", "Staff"],
        ["VQS-017", "Dinh Phi", "Viet QS", "Internal 3", "Team Leader", "Team Leader"],
        ["VQS-018", "Minh Triet", "Viet QS", "Internal 3", "Asst. Team Leader", "Asst. Team Leader"],
        ["VQS-019", "Doan Nhut", "Viet QS", "Internal 3", "Staff", "Staff"],
        ["VQS-020", "Minh Hai", "Viet QS", "Internal 3", "Staff", "Staff"],
        ["VQS-021", "Minh Kiet", "Viet QS", "Internal 3", "Staff", "Staff"],
        ["VQS-022", "Van Tung", "Viet QS", "Partition&Opening", "Team Leader", "Team Leader"],
        ["VQS-023", "Minh Luan", "Viet QS", "Partition&Opening", "Asst. Team Leader", "Asst. Team Leader"],
        ["VQS-024", "Tan Phat", "Viet QS", "Partition&Opening", "Staff", "Staff"],
        ["VQS-025", "Kim Thoa", "Viet QS", "Partition&Opening", "Team Leader", "Team Leader"],
        ["VQS-026", "Thi Thao", "Viet QS", "Partition&Opening", "Team Leader", "Team Leader"],
        ["VQS-027", "Nhut Duy", "Viet QS", "External", "Team Leader", "Team Leader"],
        ["VQS-028", "Kieu Duyen", "Viet QS", "External", "Asst. Team Leader", "Asst. Team Leader"],
        ["VQS-029", "Quoc Bao", "Viet QS", "External", "Staff", "Staff"],
        ["VQS-030", "Ngoc Anh", "Viet QS", "External", "Staff", "Staff"],
        ["VQS-032", "Anh Tuan", "Viet QS", "Vertical", "Team Leader", "Team Leader"],
        ["VQS-033", "Danh Xuan", "Viet QS", "Vertical", "Team Leader", "Team Leader"],
        ["VQS-034", "Van Toan", "Viet QS", "Vertical", "Team Leader", "Team Leader"],
        ["VQS-035", "Thien Ngan", "Viet QS", "Vertical", "Team Leader", "Team Leader"],
        ["VQS-036", "Huu Chau", "Viet QS", "Vertical", "Asst. Team Leader", "Asst. Team Leader"],
        ["VQS-037", "Minh Tu", "Viet QS", "Vertical", "Asst. Team Leader", "Asst. Team Leader"],
        ["VQS-038", "Thanh Phong", "Viet QS", "Vertical", "Team Leader", "Team Leader"],
        ["VQS-039", "Dinh Nam", "Viet QS", "Vertical", "Asst. Team Leader", "Asst. Team Leader"],
        ["VQS-040", "Cam Tu", "Viet QS", "Vertical", "Staff", "Staff"],
        ["VQS-042", "Quoc Hung", "Viet QS", "Vertical", "Staff", "Staff"],
        ["VQS-043", "Khanh Duy", "Viet QS", "Vertical", "Staff", "Staff"],
        ["VQS-044", "Ngoc Thoa", "Viet QS", "Vertical", "Staff", "Staff"],
        ["VQS-045", "Thu Thuy", "Viet QS", "Vertical", "Staff", "Staff"],
        ["VQS-046", "Quoc Huy", "Viet QS", "Vertical", "Staff", "Staff"],
        ["VQS-047", "Ngoc Mai", "Viet QS", "Vertical", "Staff", "Staff"],
        ["VQS-049", "Huu Thai", "Viet QS", "Horizon / Foundation", "Team Leader", "Team Leader"],
        ["VQS-050", "Nhut Cuong", "Viet QS", "Horizon / Foundation", "Asst. Team Leader", "Asst. Team Leader"],
        ["VQS-051", "Sy Dan", "Viet QS", "Horizon / Foundation", "Team Leader", "Team Leader"],
        ["VQS-052", "Thanh Phuong", "Viet QS", "Development", "Team Leader", "Team Leader"],
        ["VQS-053", "Dinh Van", "Viet QS", "External", "Staff", "Staff"],
        ["VQS-054", "Manh Cuong", "Viet QS", "Development", "Staff", "Staff"],
        ["VQS-055", "Phuong Loan", "Viet QS", "Internal 1", "Asst. Team Leader", "Asst. Team Leader"],
        ["VQS-056", "Thi Anh", "Viet QS", "Partition&Opening", "Staff", "Staff"],
        ["VQS-057", "Thuy Tram", "Viet QS", "Partition&Opening", "Team Leader", "Team Leader"],
        ["VQS-058", "Trong Nguyen", "Viet QS", "Partition&Opening", "Staff", "Staff"],
        ["VQS-059", "Hong Ngan", "Viet QS", "Partition&Opening", "Staff", "Staff"],
        ["VQS-060", "Minh Chau", "Viet QS", "Partition&Opening", "Staff", "Staff"],
        ["VQS-061", "Quynh Giao", "Viet QS", "External", "Staff", "Staff"],
        ["VQS-062", "Minh Tuyen", "Viet QS", "External", "Staff", "Staff"],
        ["VQS-063", "Quang Tri", "Viet QS", "Civil", "Staff", "Staff"],
        ["VQS-064", "Trung Dan", "Viet QS", "Civil", "Staff", "Staff"],
        ["VQS-065", "Ngoc Bich", "Viet QS", "Horizon / Foundation", "Staff", "Staff"]
      ];

      // defaultUsers 주입
      for (const u of defaultUsers) {
        await User.findOneAndUpdate({ empNo: u.empNo }, { $set: u }, { upsert: true, new: true });
      }

      // 시드 사원 동적 주입
      for (const row of orgEmployeeSeed) {
        const empNo = row[0];
        const name = row[1];
        const company = row[2];
        const dept = row[3];
        const grade = row[4];
        const role = row[5];
        const id = empNo.toLowerCase().replaceAll('-', '_');
        
        const generatedUser = {
          id,
          empNo,
          userName: name,
          company,
          dept,
          grade,
          role,
          status: '재직',
          email: `${id}@${company === 'Viet QS' ? 'vietqs.local' : 'con-cost.local'}`,
          phone: company === 'Viet QS' ? '090-000-0000' : '010-0000-0000',
          nationality: company === 'Viet QS' ? '베트남' : '대한민국',
          workplace: company === 'Viet QS' ? '베트남 지사' : '서울 본사',
          joinDate: '2026-04-01'
        };

        await User.findOneAndUpdate({ empNo }, { $set: generatedUser }, { upsert: true, new: true });
      }
      
      console.log(`✨ Successfully seeded ${orgEmployeeSeed.length + defaultUsers.length} employees to MongoDB Atlas.`);
    }

    if (fs.existsSync(dbPath)) {
      console.log('📦 local db.json found! Checking other data migrations...');
      const raw = fs.readFileSync(dbPath, 'utf8');
      const parsed = JSON.parse(raw);

      if (parsed.users && parsed.users.length > 0) {
        for (const u of parsed.users) {
          if (u.id === 'me') {
            u.empNo = u.empNo || 'CC-002';
            u.userName = u.userName || '유종욱';
          }
          await User.findOneAndUpdate(
            { id: u.id },
            { $set: u },
            { upsert: true, new: true }
          );
        }
      }

      if (Array.isArray(parsed.chats) && parsed.chats.length > 0) {
        const chatCount = await Chat.countDocuments();
        if (chatCount === 0) {
          await Chat.insertMany(parsed.chats);
          console.log(`- Migrated ${parsed.chats.length} chats.`);
        }
      }
      if (Array.isArray(parsed.events) && parsed.events.length > 0) {
        const eventCount = await Event.countDocuments();
        if (eventCount === 0) {
          for (const e of parsed.events) {
            await Event.findOneAndUpdate(
              { day: e.day, title: e.title },
              { $set: e },
              { upsert: true, new: true }
            );
          }
          console.log(`- Migrated ${parsed.events.length} events.`);
        }
      }
      if (Array.isArray(parsed.channels) && parsed.channels.length > 0) {
        const channelCount = await Channel.countDocuments();
        if (channelCount === 0) {
          await Channel.insertMany(parsed.channels);
          console.log(`- Migrated ${parsed.channels.length} channels.`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Data migration failed:', err);
  }
}

// Get local IPv4 addresses
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// ──────────────────────────────────────────────
// API Endpoints (MongoDB Atlas Integration)
// ──────────────────────────────────────────────

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CONCOST Portal Server is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 로그인 검증 API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: '이메일 또는 사번을 입력하세요.' });
    }

    // 모든 직원 비밀번호를 '1234'로 일괄 강제 설정 검증
    if (!password || password.trim() !== '1234') {
      return res.status(401).json({ success: false, error: '비밀번호가 올바르지 않습니다.\n(임시 비밀번호: 1234)' });
    }

    const inputEmail = email.trim().toLowerCase();
    
    // yjw 데모 계정 예외 처리
    if (inputEmail === 'yjw@con-cost.com' || inputEmail === 'yjw') {
      const demoUser = await User.findOne({ empNo: 'CC-002' }); // 유종욱 실장
      if (demoUser) {
        return res.json({ success: true, user: demoUser });
      }
    }

    // DB 검색 (email 또는 empNo 또는 id)
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${inputEmail}$`, 'i') } },
        { empNo: { $regex: new RegExp(`^${inputEmail}$`, 'i') } },
        { id: { $regex: new RegExp(`^${inputEmail}$`, 'i') } }
      ]
    });

    if (user) {
      return res.json({ success: true, user });
    } else {
      return res.status(401).json({ success: false, error: '유효한 사원 계정이 아닙니다.\n(데모: yjw@con-cost.com 또는 사번 CC-002)' });
    }
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ success: false, error: '서버 내부 오류가 발생했습니다.' });
  }
});

// 전체 사원대장 조회 API
app.get('/api/employees', async (req, res) => {
  try {
    const users = await User.find({}).sort({ empNo: 1 });
    res.json({ success: true, employees: users });
  } catch (err) {
    console.error('[Get Employees Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 사원 인사 정보 추가/수정 API
app.post('/api/employees/update', async (req, res) => {
  try {
    const empData = req.body;
    if (!empData.empNo) {
      return res.status(400).json({ success: false, error: '사번은 필수입니다.' });
    }

    // 아이디 조합 생성
    const id = empData.id || empData.empNo.toLowerCase().replaceAll('-', '_');
    empData.id = id;

    // 이메일 자동 조합 (없을 시)
    if (!empData.email) {
      empData.email = `${id}@${empData.company === 'Viet QS' ? 'vietqs.local' : 'con-cost.local'}`;
    }

    const updatedUser = await User.findOneAndUpdate(
      { empNo: empData.empNo },
      { $set: empData },
      { upsert: true, new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('[Update Employee Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 사원 삭제 API
app.post('/api/employees/delete', async (req, res) => {
  try {
    const { empNo } = req.body;
    if (!empNo) {
      return res.status(400).json({ success: false, error: '사번은 필수입니다.' });
    }
    await User.findOneAndDelete({ empNo });
    res.json({ success: true, message: '사원이 성공적으로 삭제되었습니다.' });
  } catch (err) {
    console.error('[Delete Employee Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// LAN State Synchronization Endpoint (Mongoose Upsert)
app.post('/api/state/sync', async (req, res) => {
  try {
    const clientData = req.body;

    // 1. Sync users
    if (Array.isArray(clientData.users)) {
      for (const cUser of clientData.users) {
        await User.findOneAndUpdate(
          { id: cUser.id },
          { $set: cUser },
          { upsert: true, new: true }
        );
      }
    }

    // 2. Sync chats
    if (Array.isArray(clientData.chats)) {
      for (const cChat of clientData.chats) {
        await Chat.findOneAndUpdate(
          { id: cChat.id },
          { $set: cChat },
          { upsert: true, new: true }
        );
      }
    }

    // 3. Sync events
    if (Array.isArray(clientData.events)) {
      for (const cEvent of clientData.events) {
        await Event.findOneAndUpdate(
          { day: cEvent.day, title: cEvent.title },
          { $set: cEvent },
          { upsert: true, new: true }
        );
      }
    }

    // 4. Sync channels
    if (Array.isArray(clientData.channels)) {
      for (const cChan of clientData.channels) {
        await Channel.findOneAndUpdate(
          { id: cChan.id },
          { $set: cChan },
          { upsert: true, new: true }
        );
      }
    }

    // Fetch all current database states to return to client
    const dbUsers = await User.find({});
    const dbChats = await Chat.find({});
    const dbEvents = await Event.find({});
    const dbChannels = await Channel.find({});

    res.json({
      success: true,
      users: dbUsers.length > 0 ? dbUsers : (clientData.users || []),
      chats: dbChats.length > 0 ? dbChats : (clientData.chats || []),
      events: dbEvents.length > 0 ? dbEvents : (clientData.events || []),
      channels: dbChannels.length > 0 ? dbChannels : (clientData.channels || [])
    });

  } catch (err) {
    console.error('❌ Sync API error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// LAN 실시간 메시징 — Socket.io & MongoDB Atlas
// ──────────────────────────────────────────────

const connectedUsers = new Map();

function getOnlineUserIds() {
  const ids = new Set();
  connectedUsers.forEach(u => ids.add(u.userId));
  return Array.from(ids);
}

io.on('connection', (socket) => {
  console.log(`[Socket] 연결됨: ${socket.id}  (LAN IP: ${socket.handshake.address})`);

  socket.on('user:join', (userInfo) => {
    connectedUsers.set(socket.id, userInfo);
    console.log(`[Socket] 참가: ${userInfo.userName} (userId=${userInfo.userId})`);
    io.emit('users:online', getOnlineUserIds());
  });

  socket.on('chat:join', (channelId) => {
    socket.join(channelId);
  });

  socket.on('message:send', async (msg) => {
    try {
      const exists = await Chat.exists({ id: msg.id });
      if (!exists) {
        await Chat.create(msg);
      }
      socket.to(msg.channelId).emit('message:receive', msg);
    } catch (err) {
      console.error('❌ Socket chat save error:', err);
    }
  });

  socket.on('channel:create', async (channel) => {
    try {
      const exists = await Channel.exists({ id: channel.id });
      if (!exists) {
        await Channel.create(channel);
      }
      io.emit('channel:created', channel);
    } catch (err) {
      console.error('❌ Socket channel save error:', err);
    }
  });

  socket.on('disconnect', () => {
    const info = connectedUsers.get(socket.id);
    if (info) {
      console.log(`[Socket] 나감: ${info.userName}`);
      connectedUsers.delete(socket.id);
    }
    io.emit('users:online', getOnlineUserIds());
  });
});

// React Router Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 CONCOST Portal Server is running!`);
  console.log(`Base URL: http://localhost:${PORT}`);
  
  const ips = getLocalIpAddresses();
  ips.forEach(ip => {
    console.log(`🌐 Network: http://${ip}:${PORT}  ← LAN users can connect here`);
  });
  
  console.log(`📁 Static root: ${path.join(__dirname, 'dist')}`);
  console.log(`💾 Connected to MongoDB Atlas Cluster\n`);
});
