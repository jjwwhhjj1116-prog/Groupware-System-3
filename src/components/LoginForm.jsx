import React, { useState } from 'react';
import { Lock, User, Globe, HelpCircle } from 'lucide-react';
import concostLogo from '../assets/concost_logo_vert.png'; // 로고 이미지
import vietqsLogo from '../assets/vietqs_logo.png';       // 베트남 지사 로고 이미지

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('yjw@con-cost.com');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // 세션 스토리지에 유저 정보 저장
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.error || '로그인에 실패했습니다. 사번 또는 이메일을 확인하세요.');
      }
    } catch (err) {
      console.error(err);
      setError('서버와 통신하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={styles.loginWrapper}>
      <div className="login-card-container" style={styles.loginCardContainer}>
        {/* 상단 2개 로고 가로 정렬 */}
        <div style={styles.logoRow}>
          <img src={concostLogo} alt="CON-COST Logo" style={styles.logoConcost} />
          <div style={styles.logoDivider}>|</div>
          <img src={vietqsLogo} alt="VIETQS Logo" style={styles.logoVietqs} />
        </div>

        {/* 회사 연합 텍스트 타이틀 */}
        <div style={styles.titleArea}>
          <h2 style={styles.mainTitle}>CON-COST × VIETQS</h2>
          <p style={styles.subTitle}>국내 건설공사비 컨설팅 1위 기업!!</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* 사번 입력 필드 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>사번 (Employee ID)</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="사번을 입력하세요"
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* 비밀번호 입력 필드 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>비밀번호 (Password)</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* 로그인 유지 & 비밀번호 초기화 */}
          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                style={styles.checkbox}
              />
              로그인 상태 유지
            </label>
            <a href="#reset" onClick={(e) => { e.preventDefault(); alert("경영지원본부에 임시비밀번호 발급을 요청해 주세요."); }} style={styles.resetLink}>
              비밀번호 초기화
            </a>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>{error}</span>
            </div>
          )}

          {/* 주황색 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.loginBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 카드 밑 구분선 및 추가 문의 링크 */}
        <div style={styles.cardFooterDivider} />
        <div style={styles.cardFooterLinkArea}>
          <div style={styles.inquiryText}>
            계정이 없으신가요? <a href="#inquiry" onClick={(e) => { e.preventDefault(); alert("경영지원본부 IT지원팀으로 문의바랍니다."); }} style={styles.inquiryLink}>관리자에게 문의</a>
          </div>
          <div style={styles.bottomLinks}>
            <div style={styles.bottomLinkItem}>
              <Globe size={13} style={{ marginRight: '4px' }} />
              한국어 (KR)
            </div>
            <div style={styles.bottomLinkItem}>
              <HelpCircle size={13} style={{ marginRight: '4px' }} />
              도움말
            </div>
          </div>
        </div>
      </div>

      {/* 최하단 카피라이트 */}
      <div style={styles.copyright}>
        © 2024 CON-COST & VIETQS. All rights reserved.
      </div>
    </div>
  );
}

const styles = {
  loginWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827', // 어두운 차콜/블랙 테마 배경
    padding: '20px',
    fontFamily: '"Inter", "Outfit", sans-serif',
  },
  loginCardContainer: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#1f2937', // 더 짙은 카드 배경색
    borderRadius: '8px',
    border: '1px solid #374151',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    padding: '40px 32px 24px 32px',
    display: 'flex',
    flexDirection: 'column',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  logoConcost: {
    height: '32px',
    objectFit: 'contain',
  },
  logoDivider: {
    color: '#4b5563',
    fontSize: '20px',
    fontWeight: '300',
    userSelect: 'none',
  },
  logoVietqs: {
    height: '32px',
    objectFit: 'contain',
  },
  titleArea: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  mainTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.025em',
  },
  subTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#ff6b00', // 주황색 강조 서브 타이틀
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#9ca3af', // 옅은 그레이 레이블
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#6b7280',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '6px',
    border: '1px solid #374151',
    backgroundColor: '#111827',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.20s ease',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#9ca3af',
    cursor: 'pointer',
  },
  checkbox: {
    width: '14px',
    height: '14px',
    cursor: 'pointer',
    accentColor: '#ff6b00',
  },
  resetLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#f87171',
    textAlign: 'center',
  },
  loginBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '0.95rem',
    fontWeight: '700',
    borderRadius: '6px',
    backgroundColor: '#ff6b00', // 쨍한 주황색 로그인 버튼
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 4px 6px rgba(255, 107, 0, 0.15)',
    transition: 'background-color 0.20s ease',
    marginTop: '6px',
  },
  cardFooterDivider: {
    height: '1px',
    backgroundColor: '#374151',
    margin: '24px 0 16px 0',
  },
  cardFooterLinkArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  inquiryText: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  inquiryLink: {
    color: '#ff6b00',
    fontWeight: '700',
    textDecoration: 'none',
  },
  bottomLinks: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginTop: '4px',
  },
  bottomLinkItem: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  copyright: {
    fontSize: '0.7rem',
    color: '#4b5563',
    marginTop: '20px',
  }
};
