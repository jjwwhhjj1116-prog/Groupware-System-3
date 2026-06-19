import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Building, ShieldAlert, MessageSquare, Edit2, Save, Trash2 } from 'lucide-react';
import { getUserRoleLevel } from '../utils/permission'; // 권한 유틸 임포트

export default function HrCardModal({ isOpen, onClose, employee, onStartDm, currentUser, onRefreshEmployees }) {
  if (!isOpen || !employee) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    userName: '',
    company: '',
    dept: '',
    grade: '',
    email: '',
    phone: '',
    workplace: '',
    status: ''
  });

  useEffect(() => {
    if (employee) {
      setEditForm({
        empNo: employee.empNo || '',
        userName: employee.userName || '',
        company: employee.company || 'CON-COST',
        dept: employee.dept || '',
        grade: employee.grade || '',
        email: employee.email || '',
        phone: employee.phone || '',
        workplace: employee.workplace || '',
        status: employee.status || '재직'
      });
      setIsEditing(false);
    }
  }, [employee, isOpen]);

  // 회사 배지 스타일 반환
  const getCompanyBadge = (company) => {
    const isViet = company === 'Viet QS';
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: isViet ? 'rgba(0, 88, 188, 0.1)' : 'rgba(255, 107, 0, 0.1)',
        color: isViet ? '#0058bc' : '#ff6b00',
        border: `1px solid ${isViet ? 'rgba(0, 88, 188, 0.2)' : 'rgba(255, 107, 0, 0.2)'}`
      }}>
        {company}
      </span>
    );
  };

  // 재직 상태 배지 스타일 반환
  const getStatusBadge = (status) => {
    let color = 'var(--text-muted)';
    let bgColor = 'var(--bg-tertiary)';
    if (status === '재직') {
      color = '#23a55a';
      bgColor = 'rgba(35, 165, 90, 0.1)';
    } else if (status === '휴직') {
      color = '#f0b232';
      bgColor = 'rgba(240, 178, 50, 0.1)';
    } else if (status === '퇴사') {
      color = '#ff4d4f';
      bgColor = 'rgba(255, 77, 79, 0.1)';
    }

    return (
      <span style={{
        ...styles.badge,
        backgroundColor: bgColor,
        color: color,
        border: `1px solid ${bgColor}`
      }}>
        {status}
      </span>
    );
  };

  const isSelf = currentUser && currentUser.empNo === employee.empNo;
  const roleLevel = getUserRoleLevel(currentUser);
  
  // 사원 정보 수정 및 퇴사 처리는 오직 관리자(Level 1)만 가능
  const isAdmin = roleLevel === 1;

  const handleSave = async () => {
    if (!editForm.userName.trim()) {
      alert('이름은 필수 입력 항목입니다.');
      return;
    }

    try {
      const response = await fetch('/api/employees/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('인사 정보가 저장되었습니다.');
        setIsEditing(false);
        if (onRefreshEmployees) onRefreshEmployees();
        onClose();
      } else {
        alert(data.error || '저장에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신하는 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`정말로 사원 ${employee.userName} (${employee.empNo})을 퇴사/삭제 처리하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/employees/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empNo: employee.empNo })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('성공적으로 퇴사/삭제 처리되었습니다.');
        setIsEditing(false);
        if (onRefreshEmployees) onRefreshEmployees();
        onClose();
      } else {
        alert(data.error || '삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div 
        className="glass-panel animate-scale" 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h3 style={styles.title}>{isEditing ? '인사 정보 수정' : '개인 인사카드'}</h3>
          <button style={styles.closeBtn} onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <div style={styles.body}>
          {isEditing ? (
            // --- EDITING MODE UI ---
            <div style={styles.editContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>이름</label>
                <input 
                  type="text" 
                  value={editForm.userName} 
                  onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>소속 회사</label>
                  <select 
                    value={editForm.company} 
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    style={styles.select}
                  >
                    <option value="CON-COST">CON-COST</option>
                    <option value="Viet QS">Viet QS</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>재직 상태</label>
                  <select 
                    value={editForm.status} 
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={styles.select}
                  >
                    <option value="재직">재직</option>
                    <option value="휴직">휴직</option>
                    <option value="퇴사">퇴사</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>부서</label>
                  <input 
                    type="text" 
                    value={editForm.dept} 
                    onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>직급</label>
                  <input 
                    type="text" 
                    value={editForm.grade} 
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>이메일</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>전화번호</label>
                <input 
                  type="text" 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>근무지</label>
                <input 
                  type="text" 
                  value={editForm.workplace} 
                  onChange={(e) => setEditForm({ ...editForm, workplace: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.editActions}>
                <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>취소</button>
                <button style={styles.saveBtn} onClick={handleSave}>
                  <Save size={14} style={{ marginRight: '4px' }} /> 저장
                </button>
              </div>
            </div>
          ) : (
            // --- VIEW MODE UI ---
            <>
              <div style={styles.profileHeader}>
                <div style={styles.avatarLarge}>
                  {employee.userName.charAt(0)}
                </div>
                <div style={styles.profileMeta}>
                  <h2 style={styles.userName}>{employee.userName}</h2>
                  <div style={styles.badgeRow}>
                    {getCompanyBadge(employee.company)}
                    {getStatusBadge(employee.status)}
                  </div>
                </div>
              </div>

              <div style={styles.grid}>
                <div style={styles.infoBox}>
                  <span style={styles.label}><Building size={12} style={styles.icon} /> 회사</span>
                  <strong style={styles.value}>{employee.company}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}><ShieldAlert size={12} style={styles.icon} /> 부서</span>
                  <strong style={styles.value}>{employee.dept}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}><ShieldAlert size={12} style={styles.icon} /> 직급</span>
                  <strong style={styles.value}>{employee.grade}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}><Mail size={12} style={styles.icon} /> 이메일</span>
                  <strong style={{ ...styles.value, fontSize: '0.8rem' }} title={employee.email}>
                    {employee.email || '-'}
                  </strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}><Phone size={12} style={styles.icon} /> 전화번호</span>
                  <strong style={styles.value}>{employee.phone || '-'}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}><MapPin size={12} style={styles.icon} /> 근무지</span>
                  <strong style={styles.value}>{employee.workplace || '-'}</strong>
                </div>
              </div>

              <div style={styles.footerActions}>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
                    <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                      <Edit2 size={13} style={{ marginRight: '4px' }} /> 정보 수정
                    </button>
                    <button style={styles.deleteBtn} onClick={handleDelete}>
                      <Trash2 size={13} style={{ marginRight: '4px' }} /> 퇴사 처리
                    </button>
                  </div>
                )}
                {!isSelf && (
                  <button 
                    style={styles.dmBtn} 
                    onClick={() => {
                      onStartDm(employee);
                      onClose();
                    }}
                  >
                    <MessageSquare size={16} />
                    💬 DM 보내기
                  </button>
                )}
              </div>

              <div style={styles.disclaimer}>
                ※ 본 화면은 개인 기본 인사 카드 정보입니다. 개인정보보호 정책에 의거하여 연봉, 주민등록번호, 계좌 정보 등 민감 항목은 노출되지 않습니다.
              </div>
            </>
          )}
        </div>
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
    maxWidth: '430px',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    color: 'var(--text-primary)',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '12px',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '700',
    margin: 0,
  },
  closeBtn: {
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatarLarge: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(255, 107, 0, 0.2)',
  },
  profileMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  userName: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0,
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
  },
  badge: {
    fontSize: '0.7rem',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  infoBox: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '4px',
    color: 'var(--primary)',
  },
  value: {
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  footerActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: '6px',
    gap: '8px',
  },
  dmBtn: {
    padding: '8px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    boxShadow: '0 4px 6px rgba(255, 107, 0, 0.15)',
    cursor: 'pointer',
  },
  editBtn: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-light)',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(242, 63, 67, 0.1)',
    border: '1px solid rgba(242, 63, 67, 0.3)',
    color: 'var(--danger)',
    fontWeight: '700',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  disclaimer: {
    fontSize: '0.675rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '12px',
    marginTop: '6px',
  },

  // Edit Panel Styles
  editContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
  },
  editActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '12px',
  },
  cancelBtn: {
    padding: '8px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-light)',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '8px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  }
};
