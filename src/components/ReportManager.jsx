import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, Filter, BarChart2, Calendar, User, Layers, RefreshCw } from 'lucide-react';

export default function ReportManager({ socket }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // 필터 상태
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  useEffect(() => {
    fetchReports();

    if (socket) {
      const handleReportCreated = (newReport) => {
        setReports(prev => {
          if (prev.some(r => r._id === newReport._id)) return prev;
          return [newReport, ...prev];
        });
      };
      socket.on('report:created', handleReportCreated);
      return () => {
        socket.off('report:created', handleReportCreated);
      };
    }
  }, [socket]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          console.error('Invalid reports data structure:', data);
          setReports([]);
        }
      } else {
        console.error('Failed to fetch reports status:', res.status);
        setReports([]);
      }
    } catch (err) {
      console.error(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // unique 목록 추출 (필터용)
  const uniqueProjects = Array.from(new Set(reports.map(r => r.project_channel).filter(Boolean)));
  const uniqueEmployees = Array.from(new Set(reports.map(r => r.target_name || r.target_emp_id).filter(Boolean)));

  // 필터링 적용 로직
  const filteredReports = reports.filter(report => {
    // 1. 프로젝트 필터
    if (selectedProject !== 'all' && report.project_channel !== selectedProject) return false;
    
    // 2. 사원 필터
    const empName = report.target_name || report.target_emp_id;
    if (selectedEmployee !== 'all' && empName !== selectedEmployee) return false;

    // 3. 심각도 필터
    if (selectedSeverity !== 'all' && report.severity !== selectedSeverity) return false;

    // 4. 기간 필터
    if (selectedPeriod !== 'all') {
      const createdAt = new Date(report.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - createdAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (selectedPeriod === '7days' && diffDays > 7) return false;
      if (selectedPeriod === '30days' && diffDays > 30) return false;
      if (selectedPeriod === '90days' && diffDays > 90) return false;
    }

    return true;
  });

  // 통계 계산
  const totalCount = filteredReports.length;
  const criticalCount = filteredReports.filter(r => r.severity === '심각').length;
  const majorCount = filteredReports.filter(r => r.severity === '중').length;
  const pendingCount = filteredReports.filter(r => r.status === '소명중').length;
  const resolvedCount = filteredReports.filter(r => r.status === '종결').length;

  // 사원별 오류 누적 통계 가공
  const employeeStats = {};
  filteredReports.forEach(r => {
    const key = r.target_name || r.target_emp_id;
    if (!employeeStats[key]) {
      employeeStats[key] = { name: key, empId: r.target_emp_id, 경: 0, 중: 0, 심각: 0, total: 0 };
    }
    employeeStats[key][r.severity] = (employeeStats[key][r.severity] || 0) + 1;
    employeeStats[key].total += 1;
  });

  // 정렬 후 Top 5 추출
  const sortedEmployeeStats = Object.values(employeeStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>인사관리 통계 데이터를 집계 중입니다...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', flex: 1, backgroundColor: 'var(--bg-primary)', overflowY: 'auto' }} className="animate-fade">
      
      {/* 타이틀 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <ShieldAlert size={26} color="#ef4444" />
            인사관리 신고/DB 모니터링 (HR Audit)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
            메신저 내 업무 대화에서 감지되어 적재된 오류 내역을 분석하고 인사평가 증빙 자료로 연동합니다.
          </p>
        </div>
        <button 
          onClick={fetchReports} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} />
          새로고침
        </button>
      </div>

      {/* 1. 요약 통계 카드 대시보드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>📁</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>누적 신고 건수</span>
          <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginTop: '4px' }}>{totalCount}건</strong>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🚨</div>
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>심각 단계 오류</span>
          <strong style={{ fontSize: '1.4rem', color: '#ef4444', marginTop: '4px' }}>{criticalCount}건</strong>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>⚠️</div>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold' }}>중 단계 오류</span>
          <strong style={{ fontSize: '1.4rem', color: '#f59e0b', marginTop: '4px' }}>{majorCount}건</strong>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🗣️</div>
          <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold' }}>소명 조사 중</span>
          <strong style={{ fontSize: '1.4rem', color: '#3b82f6', marginTop: '4px' }}>{pendingCount}건</strong>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>✅</div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>소명 종결 건수</span>
          <strong style={{ fontSize: '1.4rem', color: '#10b981', marginTop: '4px' }}>{resolvedCount}건</strong>
        </div>
      </div>

      {/* 2. 대시보드 통계 섹션 (사원별 오류 누적 추이 차트) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* 사원별 오류 누적 Top 5 (가로 누적 바 차트) */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart2 size={18} color="var(--primary)" />
            인사평가 누적 오류 현황 (Top 5 사원)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
            {sortedEmployeeStats.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px' }}>
                통계를 집계할 데이터가 없습니다.
              </div>
            ) : (
              sortedEmployeeStats.map((stat, idx) => {
                const maxTotal = sortedEmployeeStats[0].total || 1;
                const widthPercent = Math.max(10, (stat.total / maxTotal) * 100);
                
                // 심각도별 비율 계산
                const minorW = (stat.경 / stat.total) * 100;
                const majorW = (stat.중 / stat.total) * 100;
                const criticalW = (stat.심각 / stat.total) * 100;

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <span style={{ color: 'var(--text-primary)' }}>
                        🏆 {idx + 1}위 - {stat.name} ({stat.empId})
                      </span>
                      <span style={{ color: 'var(--primary)' }}>총 {stat.total}건</span>
                    </div>
                    {/* 세그먼트 누적 바 */}
                    <div style={{
                      width: '100%',
                      height: '14px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '7px',
                      overflow: 'hidden',
                      display: 'flex'
                    }}>
                      <div style={{
                        width: `${widthPercent}%`,
                        height: '100%',
                        display: 'flex'
                      }}>
                        {stat.경 > 0 && (
                          <div style={{ width: `${minorW}%`, backgroundColor: '#3b82f6' }} title={`경: ${stat.경}건`} />
                        )}
                        {stat.중 > 0 && (
                          <div style={{ width: `${majorW}%`, backgroundColor: '#f59e0b' }} title={`중: ${stat.중}건`} />
                        )}
                        {stat.심각 > 0 && (
                          <div style={{ width: `${criticalW}%`, backgroundColor: '#ef4444' }} title={`심각: ${stat.심각}건`} />
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> 경: {stat.경}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} /> 중: {stat.중}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> 심각: {stat.심각}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 심각도 및 상태별 요약 원형 그래프 대신 미니 범례 카드 */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={18} color="var(--danger)" />
            심각도 가이드라인 및 워크플로우
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.65rem', fontWeight: 'bold', flexShrink: 0 }}>심각</span>
              <span><strong>중대한 오기재/사고:</strong> 도면 치수 오기, 계약서 금액 착오 등 실질적 금전 피해가 예상되는 귀책 사유</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.65rem', fontWeight: 'bold', flexShrink: 0 }}>중</span>
              <span><strong>업무 과실:</strong> 협력사 소통 혼선, 산출물 지연 등 타 부서에 불편을 미치는 기술적 사유</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e0e7ff', color: '#4f46e5', fontSize: '0.65rem', fontWeight: 'bold', flexShrink: 0 }}>경</span>
              <span><strong>단순 실수:</strong> 메신저 맞춤법 오기, 툴 사용 미숙 등 정성적 훈계에 그치는 사소한 실수</span>
            </div>
          </div>
          <div style={{
            marginTop: '12px',
            padding: '10px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4
          }}>
            ℹ️ <strong>소명 처리 프로세스:</strong><br />
            오류 신고 접수 ➜ 소명 스레드 자동 개설 ➜ 당사자 의견 제출 (소명중) ➜ 어드민 검토 후 최종 반영 여부 종결.
          </div>
        </div>
      </div>

      {/* 3. 필터 제어 영역 */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
          <Filter size={18} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>상세 필터 검색</span>
        </div>

        {/* 프로젝트 필터 */}
        <div style={filterGroupStyle}>
          <Layers size={14} style={filterIconStyle} />
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)} 
            style={selectStyle}
          >
            <option value="all">프로젝트 전체</option>
            {uniqueProjects.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* 사원 필터 */}
        <div style={filterGroupStyle}>
          <User size={14} style={filterIconStyle} />
          <select 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)} 
            style={selectStyle}
          >
            <option value="all">사원 전체</option>
            {uniqueEmployees.map((emp, idx) => (
              <option key={idx} value={emp}>{emp}</option>
            ))}
          </select>
        </div>

        {/* 기간 필터 */}
        <div style={filterGroupStyle}>
          <Calendar size={14} style={filterIconStyle} />
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)} 
            style={selectStyle}
          >
            <option value="all">기간 전체</option>
            <option value="7days">최근 7일</option>
            <option value="30days">최근 30일</option>
            <option value="90days">최근 90일</option>
          </select>
        </div>

        {/* 심각도 필터 */}
        <div style={filterGroupStyle}>
          <ShieldAlert size={14} style={filterIconStyle} />
          <select 
            value={selectedSeverity} 
            onChange={(e) => setSelectedSeverity(e.target.value)} 
            style={selectStyle}
          >
            <option value="all">심각도 전체</option>
            <option value="경">경 (Minor)</option>
            <option value="중">중 (Major)</option>
            <option value="심각">심각 (Critical)</option>
          </select>
        </div>

        {/* 필터 초기화 버튼 */}
        <button
          onClick={() => {
            setSelectedProject('all');
            setSelectedEmployee('all');
            setSelectedPeriod('all');
            setSelectedSeverity('all');
          }}
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 'bold',
            color: 'var(--text-muted)',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          필터 초기화
        </button>
      </div>

      {/* 4. 데이터 리스트 테이블 */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={thStyle}>발생 일시</th>
              <th style={thStyle}>심각도</th>
              <th style={thStyle}>프로젝트명 (채널)</th>
              <th style={thStyle}>대상 임직원</th>
              <th style={thStyle}>오류 핵심 요약 (Gemini AI)</th>
              <th style={thStyle}>상태 변경</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  조건에 부합하는 오류 보고서가 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              filteredReports.map(report => (
                <tr key={report._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} className="table-row-hover">
                  <td style={tdStyle}>{new Date(report.created_at).toLocaleString()}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      backgroundColor: report.severity === '심각' ? '#fee2e2' : report.severity === '중' ? '#fef3c7' : '#e0e7ff',
                      color: report.severity === '심각' ? '#dc2626' : report.severity === '중' ? '#d97706' : '#4f46e5'
                    }}>
                      {report.severity}
                    </span>
                  </td>
                  <td style={tdStyle}>{report.project_channel || '-'}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{report.target_name || report.target_emp_id}</td>
                  <td style={{ ...tdStyle, maxWidth: '350px' }}>
                    <div style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-light)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      lineHeight: '1.5'
                    }}>
                      {report.ai_summary}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report._id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="접수">접수 (대기)</option>
                      <option value="소명중">소명중 (조사)</option>
                      <option value="종결">종결 (반영)</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <style>{`
        .table-row-hover:hover {
          background-color: var(--bg-hover) !important;
        }
      `}</style>
    </div>
  );
}

// 스타일 오브젝트
const cardStyle = {
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden'
};

const filterGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-light)',
  borderRadius: '8px',
  padding: '0 10px',
  height: '34px',
  gap: '6px'
};

const filterIconStyle = {
  color: 'var(--text-muted)',
  flexShrink: 0
};

const selectStyle = {
  border: 'none',
  background: 'none',
  fontSize: '0.8rem',
  color: 'var(--text-primary)',
  fontWeight: 'bold',
  cursor: 'pointer',
  outline: 'none',
  height: '100%',
  paddingRight: '6px'
};

const thStyle = {
  padding: '14px 16px',
  fontSize: '0.78rem',
  fontWeight: '800',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.03em'
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: '0.82rem',
  color: 'var(--text-primary)',
  verticalAlign: 'top'
};
