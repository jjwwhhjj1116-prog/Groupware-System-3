import React, { useState } from 'react';
import { X, Hash, Lock } from 'lucide-react';

export default function Modal({ isOpen, onClose, onCreateChannel }) {
  const [channelName, setChannelName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    onCreateChannel({
      name: channelName.trim().toLowerCase().replace(/\s+/g, '-'),
      isPrivate
    });
    setChannelName('');
    setIsPrivate(false);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div 
        className="glass-panel animate-scale" 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h3 style={styles.title}>새 채널 생성</h3>
          <button className="close-btn" style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>채널 이름</label>
            <div style={styles.inputWrapper}>
              <Hash size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="예: 프로젝트-마케팅"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                style={styles.input}
                autoFocus
              />
            </div>
            <span style={styles.helperText}>
              채널 이름은 소문자, 숫자, 하이픈(-)만 포함할 수 있습니다.
            </span>
          </div>

          <div style={styles.toggleGroup} onClick={() => setIsPrivate(!isPrivate)}>
            <div style={styles.toggleHeader}>
              <div style={styles.toggleIconWrapper}>
                {isPrivate ? <Lock size={18} /> : <Hash size={18} />}
              </div>
              <div style={styles.toggleText}>
                <div style={styles.toggleTitle}>
                  {isPrivate ? '비공개 채널' : '공개 채널'}
                </div>
                <div style={styles.toggleDesc}>
                  {isPrivate 
                    ? '초대된 멤버만 채널을 보고 대화할 수 있습니다.' 
                    : '워크스페이스의 모든 멤버가 참가할 수 있습니다.'}
                </div>
              </div>
            </div>
            <div style={{
              ...styles.switch,
              backgroundColor: isPrivate ? 'var(--primary)' : 'var(--border-light)'
            }}>
              <div style={{
                ...styles.switchThumb,
                transform: isPrivate ? 'translateX(18px)' : 'translateX(0)'
              }} />
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" className="cancel-btn" onClick={onClose} style={styles.cancelBtn}>
              취소
            </button>
            <button 
              type="submit" 
              disabled={!channelName.trim()} 
              style={{
                ...styles.submitBtn,
                opacity: channelName.trim() ? 1 : 0.6,
                cursor: channelName.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              생성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
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
  modal: {
    width: '90%',
    maxWidth: '480px',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    color: 'var(--text-primary)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    letterSpacing: '-0.02em',
  },
  closeBtn: {
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 38px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    transition: 'border-color var(--transition-fast)',
    ':focus': {
      borderColor: 'var(--primary)',
    }
  },
  helperText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  toggleGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    userSelect: 'none',
    border: '1px solid var(--border-light)',
  },
  toggleHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  toggleIconWrapper: {
    color: 'var(--text-secondary)',
  },
  toggleText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  toggleTitle: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  toggleDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    maxWidth: '280px',
  },
  switch: {
    width: '36px',
    height: '20px',
    borderRadius: 'var(--radius-full)',
    padding: '2px',
    transition: 'background-color var(--transition-fast)',
  },
  switchThumb: {
    width: '16px',
    height: '16px',
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-full)',
    transition: 'transform var(--transition-fast)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '10px 18px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-light)',
    color: 'var(--text-secondary)',
  },
  submitBtn: {
    padding: '10px 18px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    fontWeight: '500',
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
  }
};
