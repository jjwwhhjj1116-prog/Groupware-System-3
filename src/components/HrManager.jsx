import React, { useState, useEffect } from 'react';
import { Users, Plus, Save, Trash2, Edit2, ShieldCheck, Search } from 'lucide-react';
import { getUserRoleLevel, getRoleLabel } from '../utils/permission';

export default function HrManager({ currentWorkspace }) {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  // 수정 중인 임직원 정보 상태
  const [editForm, setEditForm] = useState({
    empNo: '',
    userName: '',
    company: 'CON-COST',
    dept: '경영지원본부',
    grade: '사원',
    role: '사원',
    status: '재직',
    email: '',
    phone: '010-0000-0000',
    nationality: '대한민국',
    workplace: '서울 본사',
    joinDate: '2026-04-01'
  });

  const [isNewMode, setIsNewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // 사원 목록 로드
  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      if (response.ok && data.success) {
        setEmployees(data.employees);
        setFilteredEmployees(data.employees);
      }
    } catch (e) {
      console.error(e);
      showMsg('error', '임직원 목록을 가져오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // 검색 필터링
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = employees.filter(emp => 
      (emp.userName || '').toLowerCase().includes(term) ||
      (emp.empNo || '').toLowerCase().includes(term) ||
      (emp.dept || '').toLowerCase().includes(term) ||
      (emp.company || '').toLowerCase().includes(term)
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleSelectEmp = (emp) => {
    setSelectedEmp(emp);
    setIsNewMode(false);
    setEditForm({ ...emp });
  };

  const handleNewMode = () => {
    setIsNewMode(true);
    setSelectedEmp(null);
    setEditForm({
      empNo: 'CC-' + String(Date.now()).slice(-3),
      userName: '',
      company: currentWorkspace === 'vietqs' ? 'Viet QS' : 'CON-COST',
      dept: currentWorkspace === 'vietqs' ? 'Internal 1' : '경영지원본부',
      grade: '사원',
      role: '사원',
      status: '재직',
      email: '',
      phone: currentWorkspace === 'vietqs' ? '090-000-0000' : '010-0000-0000',
      nationality: currentWorkspace === 'vietqs' ? '베트남' : '대한민국',
      workplace: currentWorkspace === 'vietqs' ? '베트남 지사' : '서울 본사',
      joinDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleFormChange = (key, val) => {
    setEditForm(prev => ({
      ...prev,
      [key]: val
    }));
  };

  // 사원 등록 및 수정 요청
  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.empNo || !editForm.userName) {
      showMsg('error', '사번과 이름은 필수 항목입니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/employees/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showMsg('success', isNewMode ? '사원이 추가되었습니다!' : '인사 정보가 저장되었습니다!');
        loadEmployees();
        setSelectedEmp(data.user);
        setIsNewMode(false);
      } else {
        showMsg('error', data.error || '저장에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      showMsg('error', '서버 통신 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 사원 삭제 요청
  const handleDelete = async (empNo) => {
    if (!window.confirm(`정말로 사원 ${editForm.userName} (${empNo})을 삭제하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/employees/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empNo })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showMsg('success', '성공적으로 퇴사/삭제 처리되었습니다.');
        loadEmployees();
        setSelectedEmp(null);
      } else {
        showMsg('error', data.error || '삭제 실패');
      }
    } catch (err) {
      console.error(err);
      showMsg('error', '서버 통신 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade">
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <Users size={22} style={{ color: 'var(--primary)' }} />
          <h2 style={styles.title}>조직 관리 · 사원대장 (HR Manager)</h2>
        </div>
        <button style={styles.addBtn} onClick={handleNewMode}>
          <Plus size={16} /> 신규 사원 등록
        </button>
      </div>

      {msg.text && (
        <div style={{
          ...styles.toast,
          backgroundColor: msg.type === 'success' ? 'rgba(35,165,90,0.1)' : 'rgba(255,77,79,0.1)',
          color: msg.type === 'success' ? '#23a55a' : '#ff4d4f',
          borderColor: msg.type === 'success' ? 'rgba(35,165,90,0.2)' : 'rgba(255,77,79,0.2)'
        }}>
          {msg.text}
        </div>
      )}

      <div style={styles.body}>
        {/* 왼쪽: 사원대장 테이블 그리드 */}
        <div style={styles.leftCol}>
          <div style={styles.searchBar}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="사원명, 부서, 사번 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>사번</th>
                  <th style={styles.th}>이름</th>
                  <th style={styles.th}>소속 회사</th>
                  <th style={styles.th}>부서</th>
                  <th style={styles.th}>직급</th>
                  <th style={styles.th}>권한 등급</th>
                  <th style={styles.th}>상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => {
                  const isSelected = selectedEmp?.empNo === emp.empNo;
                  const roleLevel = getUserRoleLevel(emp);
                  return (
                    <tr 
                      key={emp.empNo} 
                      onClick={() => handleSelectEmp(emp)}
                      style={{
                        ...styles.trRow,
                        backgroundColor: isSelected ? 'var(--bg-active)' : 'transparent'
                      }}
                      className="table-row"
                    >
                      <td style={{ ...styles.td, fontWeight: '700' }}>{emp.empNo}</td>
                      <td style={styles.td}>{emp.userName}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.companyBadge,
                          color: emp.company === 'Viet QS' ? '#0058bc' : '#ff6b00',
                          backgroundColor: emp.company === 'Viet QS' ? 'rgba(0,88,188,0.08)' : 'rgba(255,107,0,0.08)'
                        }}>
                          {emp.company}
                        </span>
                      </td>
                      <td style={styles.td}>{emp.dept}</td>
                      <td style={styles.td}>{emp.grade}</td>
                      <td style={styles.td}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          color: roleLevel === 0 ? '#ef4444' : roleLevel === 1 ? '#10b981' : roleLevel === 2 ? '#8b5cf6' : roleLevel === 3 ? '#ff6b00' : 'var(--text-secondary)',
                          backgroundColor: roleLevel === 0 ? 'rgba(239,68,68,0.08)' : roleLevel === 1 ? 'rgba(16,185,129,0.08)' : roleLevel === 2 ? 'rgba(139,92,246,0.08)' : roleLevel === 3 ? 'rgba(255,107,0,0.08)' : 'var(--bg-tertiary)'
                        }}>
                          {getRoleLabel(roleLevel)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          color: emp.status === '재직' ? '#23a55a' : emp.status === '휴직' ? '#f0b232' : '#ff4d4f',
                          backgroundColor: emp.status === '재직' ? 'rgba(35,165,90,0.08)' : emp.status === '휴직' ? 'rgba(240,178,50,0.08)' : 'rgba(255,77,79,0.08)'
                        }}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 오른쪽: 사원 상세 편집 카드 */}
        <div style={styles.rightCol}>
          {(selectedEmp || isNewMode) ? (
            <form onSubmit={handleSave} className="glass-panel" style={styles.editCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Edit2 size={16} style={{ color: 'var(--primary)', marginRight: '6px' }} />
                  {isNewMode ? '🆕 신규 직원 인사카드 생성' : `🪪 ${editForm.userName} 사원 정보 편집`}
                </h3>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>실시간 산정 권한 등급:</span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#ffffff',
                    backgroundColor: 'var(--primary)',
                    boxShadow: '0 1px 3px rgba(255,107,0,0.3)'
                  }}>
                    {getRoleLabel(getUserRoleLevel(editForm))}
                  </span>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>사번 (고유키)</label>
                  <input
                    type="text"
                    value={editForm.empNo}
                    onChange={(e) => handleFormChange('empNo', e.target.value)}
                    disabled={!isNewMode}
                    style={{ ...styles.input, backgroundColor: !isNewMode ? 'var(--bg-tertiary)' : 'var(--bg-secondary)' }}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>이름</label>
                  <input
                    type="text"
                    value={editForm.userName}
                    onChange={(e) => handleFormChange('userName', e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>회사 소속</label>
                  <select
                    value={editForm.company}
                    onChange={(e) => handleFormChange('company', e.target.value)}
                    style={styles.select}
                  >
                    <option value="CON-COST">CON-COST (본사)</option>
                    <option value="Viet QS">Viet QS (베트남 지사)</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>부서</label>
                  <input
                    type="text"
                    value={editForm.dept}
                    onChange={(e) => handleFormChange('dept', e.target.value)}
                    placeholder="예: 경영지원본부"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>직급 (Grade)</label>
                  <input
                    type="text"
                    value={editForm.grade}
                    onChange={(e) => handleFormChange('grade', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>직책 (Role)</label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => handleFormChange('role', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>재직 상태</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    style={styles.select}
                  >
                    <option value="재직">재직 (Active)</option>
                    <option value="휴직">휴직 (On Leave)</option>
                    <option value="퇴사">퇴사 (Resigned)</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>권한 등급 (수동 지정)</label>
                  <select
                    value={editForm.roleLevel !== undefined && editForm.roleLevel !== null ? String(editForm.roleLevel) : ''}
                    onChange={(e) => handleFormChange('roleLevel', e.target.value === '' ? '' : Number(e.target.value))}
                    style={styles.select}
                  >
                    <option value="">자동 산정</option>
                    <option value="0">관리자 (0등급)</option>
                    <option value="1">1등급 (대표/부사장/경영지원)</option>
                    <option value="2">2등급 (임원)</option>
                    <option value="3">3등급 (PM급)</option>
                    <option value="4">4등급 (일반)</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>이메일</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="자동 매핑 (공백 가능)"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>휴대폰</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>국적</label>
                  <input
                    type="text"
                    value={editForm.nationality}
                    onChange={(e) => handleFormChange('nationality', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>근무지</label>
                  <input
                    type="text"
                    value={editForm.workplace}
                    onChange={(e) => handleFormChange('workplace', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>입사일</label>
                  <input
                    type="date"
                    value={editForm.joinDate}
                    onChange={(e) => handleFormChange('joinDate', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.footer}>
                {!isNewMode && (
                  <button 
                    type="button" 
                    style={styles.deleteBtn} 
                    onClick={() => handleDelete(editForm.empNo)}
                  >
                    <Trash2 size={16} /> 퇴사/삭제
                  </button>
                )}
                <div style={{ flex: 1 }} />
                <button type="submit" style={styles.saveBtn} disabled={isLoading}>
                  <Save size={16} /> {isLoading ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.emptyCard}>
              <ShieldCheck size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <div>사원대장에서 임직원을 선택하거나,</div>
              <div>신규 사원 등록 버튼을 눌러 정보를 수정해 보세요.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    padding: '24px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '16px',
    flexShrink: 0,
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0,
  },
  addBtn: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(255, 107, 0, 0.15)',
  },
  toast: {
    padding: '10px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    fontSize: '0.85rem',
    marginBottom: '16px',
    flexShrink: 0,
  },
  body: {
    display: 'flex',
    flex: 1,
    gap: '24px',
    overflow: 'hidden',
  },
  leftCol: {
    flex: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflow: 'hidden',
  },
  searchBar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 36px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
  },
  tableWrapper: {
    flex: 1,
    overflowY: 'auto',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--bg-secondary)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  trHeader: {
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--bg-tertiary)',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    color: 'var(--text-secondary)',
    fontWeight: '700',
  },
  trRow: {
    borderBottom: '1px solid var(--border-light)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 16px',
  },
  companyBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  statusBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  rightCol: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  editCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardHeader: {
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '12px',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  input: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '16px',
    marginTop: '8px',
  },
  deleteBtn: {
    padding: '10px 16px',
    backgroundColor: 'rgba(255, 77, 79, 0.1)',
    color: '#ff4d4f',
    border: '1px solid rgba(255, 77, 79, 0.2)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(255, 107, 0, 0.15)',
  },
  emptyCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    textAlign: 'center',
    padding: '24px',
  }
};
