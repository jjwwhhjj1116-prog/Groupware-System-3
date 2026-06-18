import React, { useState } from 'react';
import { Key, Mail, ShieldAlert } from 'lucide-react';
import concostLogo from '../assets/concost_logo_vert.png'; // 로고 이미지

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('yjw@con-cost.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="glass-panel animate-scale" style={styles.loginContainer}>
        <div style={styles.loginHeader}>
          <img src={concostLogo} alt="CON-COST Logo" style={styles.loginLogo} />
          <p style={styles.loginTitle}>
            네이버웍스 스타일의 스마트 사내 협업 메신저<br />
            <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>CONCOST Portal v3</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Mail size={14} style={{ marginRight: '6px', color: 'var(--primary)' }} />
              이메일 주소 또는 사번
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="예: yjw@con-cost.com 또는 CC-002"
              required
              className="login-input"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Key size={14} style={{ marginRight: '6px', color: 'var(--primary)' }} />
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="login-input"
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <ShieldAlert size={16} style={{ marginRight: '6px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={styles.demoInfo}>
            💡 데모 진행을 위해 아래 계정으로 로그인해 주세요.<br />
            이메일: <strong>yjw@con-cost.com</strong> 또는 사번 <strong>CC-002</strong><br />
            비밀번호: <strong>임의 입력 통과 (기본값: 123456)</strong>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.loginBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '인증 진행 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  loginWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, var(--bg-primary) 100%)',
    padding: '20px',
  },
  loginContainer: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 32px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  loginHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  loginLogo: {
    height: '48px',
    objectFit: 'contain',
  },
  loginTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.20s ease',
  },
  demoInfo: {
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    border: '1px dashed rgba(255, 107, 0, 0.25)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    fontSize: '0.75rem',
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 79, 0.1)',
    border: '1px solid rgba(255, 77, 79, 0.2)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#ff4d4f',
  },
  loginBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '0.95rem',
    fontWeight: '700',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 4px 6px rgba(255, 107, 0, 0.15)',
    transition: 'background-color 0.20s ease',
  }
};
