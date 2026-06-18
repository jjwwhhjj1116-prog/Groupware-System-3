import React, { useState, useRef, useEffect } from 'react';
import { Users, Search, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

export default function OrgChart({ allEmployees, onUserClick, currentWorkspace }) {
  const [activeCompany, setActiveCompany] = useState(currentWorkspace === 'vietqs' ? 'Viet QS' : 'CON-COST');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 마우스 팬 & 줌 상태
  const [scale, setScale] = useState(0.85);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // 휠 줌(wheel zoom) 감지용 바닐라 이벤트 수동 바인딩 (passive: false 차단용)
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 0.06;
      let nextScale = scale + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
      nextScale = Math.min(Math.max(nextScale, 0.4), 1.6);
      setScale(nextScale);
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, [scale]);

  // 마우스 팬(drag to PAN) 조작
  const handleMouseDown = (e) => {
    // 왼쪽 클릭(0) 또는 가운데 휠 클릭(1) 모두 드래그 지원
    if (e.button === 0 || e.button === 1) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      viewportRef.current.style.cursor = 'grabbing';
      if (e.button === 1) {
        e.preventDefault(); // 브라우저 자체의 휠 스크롤 스크롤바 이동 방지
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const nextX = e.clientX - dragStart.current.x;
    const nextY = e.clientY - dragStart.current.y;
    setPosition({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (viewportRef.current) {
      viewportRef.current.style.cursor = 'grab';
    }
  };

  // 뷰포트 초기화
  const resetViewport = () => {
    setScale(0.85);
    setPosition({ x: 0, y: 0 });
  };

  // --- 부서 및 구성원 수집 로직 ---
  const ceoEmp = allEmployees.find(e => e.empNo === "VQS-001");
  const advisorEmp = allEmployees.find(e => e.empNo === "VQS-002");

  const deptsConfig = activeCompany === 'CON-COST' 
    ? [
        { name: "경영지원본부", leadId: "CC-001", color: "#3b82f6" },
        { name: "BIM파트", leadId: "CC-029", color: "#ff6b00" },
        { name: "토목·조경파트", leadId: "CC-030", color: "#10b981" },
        { name: "QC", leadId: "CC-008", color: "#ef4444" },
        { name: "클레임센터", leadId: "CC-031", color: "#8b5cf6" },
        { name: "마감", leadId: "CC-011", color: "#ec4899" },
        { name: "구조/토목 조경", leadId: "CC-023", color: "#6b7280" }
      ]
    : [
        { name: "Management Support", leadId: "VQS-003", color: "#3b82f6" },
        { name: "Internal 1", leadId: "VQS-006", color: "#ef4444" },
        { name: "Internal 2", leadId: "VQS-007", color: "#1e3a8a" },
        { name: "Internal 3", leadId: "VQS-017", color: "#10b981" },
        { name: "Partition&Opening", leadId: "VQS-022", color: "#ff6b00" },
        { name: "External", leadId: "VQS-027", color: "#6b7280" },
        { name: "Vertical", leadId: "VQS-032", color: "#8b5cf6" },
        { name: "Horizon / Foundation", leadId: "VQS-049", color: "#ec4899" }
      ];

  // 검색어와 일치하는지 판별 헬퍼
  const matchesSearch = (emp) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      emp.userName.toLowerCase().includes(term) ||
      emp.dept.toLowerCase().includes(term) ||
      emp.grade.toLowerCase().includes(term) ||
      emp.empNo.toLowerCase().includes(term)
    );
  };

  // 직원 카드 렌더러
  const renderEmployeeCard = (emp, isLead = false) => {
    if (!emp) return null;
    const isMatched = matchesSearch(emp);
    const opacity = isMatched ? 1 : 0.22;
    const scaleFactor = isMatched && searchTerm.trim() ? 'scale(1.03)' : 'scale(1)';
    const borderColor = isMatched && searchTerm.trim() ? 'var(--primary)' : 'var(--border-light)';

    return (
      <div
        key={emp.empNo}
        onClick={() => onUserClick && onUserClick(emp.id)}
        style={{
          ...styles.nodeCard,
          opacity,
          transform: scaleFactor,
          borderColor,
          borderWidth: isLead ? '2px' : '1px'
        }}
        className="org-node-card-hover"
      >
        <div style={styles.avatar}>
          {emp.userName.charAt(0)}
        </div>
        <div style={styles.cardMeta}>
          <div style={styles.cardName}>{emp.userName}</div>
          <div style={styles.cardGrade}>{emp.grade}</div>
          <div style={styles.cardWorkplace}>📍 {emp.workplace || '서울 본사'}</div>
        </div>
        {isLead && <div style={styles.leadLabel}>LEADER</div>}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* 상단 액션 및 필터 바 */}
      <div style={styles.toolbar}>
        <div style={styles.companyTabs}>
          <button 
            style={{
              ...styles.tabBtn,
              backgroundColor: activeCompany === 'CON-COST' ? 'var(--primary)' : 'transparent',
              color: activeCompany === 'CON-COST' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: activeCompany === 'CON-COST' ? 'var(--primary)' : 'var(--border-light)'
            }}
            onClick={() => { setActiveCompany('CON-COST'); resetViewport(); }}
          >
            CON-COST 조직도
          </button>
          <button 
            style={{
              ...styles.tabBtn,
              backgroundColor: activeCompany === 'Viet QS' ? 'var(--primary)' : 'transparent',
              color: activeCompany === 'Viet QS' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: activeCompany === 'Viet QS' ? 'var(--primary)' : 'var(--border-light)'
            }}
            onClick={() => { setActiveCompany('Viet QS'); resetViewport(); }}
          >
            Viet QS 조직도
          </button>
        </div>

        {/* 조작 툴바 및 검색 */}
        <div style={styles.rightControls}>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="사원명, 직급, 부서 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button style={styles.controlBtn} onClick={() => setScale(prev => Math.min(prev + 0.1, 1.6))} title="확대"><ZoomIn size={16} /></button>
          <button style={styles.controlBtn} onClick={() => setScale(prev => Math.max(prev - 0.1, 0.4))} title="축소"><ZoomOut size={16} /></button>
          <button style={styles.controlBtn} onClick={resetViewport} title="초기화"><Maximize2 size={16} /></button>
        </div>
      </div>

      {/* 가상 조직도 드래그 뷰포트 영역 */}
      <div
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={styles.viewport}
      >
        <div
          ref={contentRef}
          style={{
            ...styles.treeWrapper,
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {/* 1) 최상단 CEO 및 Executive Advisor 행 */}
          <div style={styles.ceoRow}>
            <div style={styles.ceoNodeWrapper}>
              <span style={styles.roleHeader}>CEO (대표이사)</span>
              {renderEmployeeCard(ceoEmp, true)}
            </div>

            {/* 연결 데코 라인 */}
            <div style={styles.linkLine}>
              <div style={styles.linkCircle} />
            </div>

            <div style={styles.ceoNodeWrapper}>
              <span style={{ ...styles.roleHeader, color: '#3b82f6' }}>Executive Advisor</span>
              {renderEmployeeCard(advisorEmp, false)}
            </div>
          </div>

          {/* 수직 하강 데코 선 */}
          <div style={styles.verticalLinkLine} />

          {/* 2) 가로 배치 1단계 부서 블록들 */}
          <div style={styles.deptsRow}>
            {deptsConfig.map(dept => {
              const lead = allEmployees.find(e => e.empNo === dept.leadId);
              const members = allEmployees.filter(
                e => e.company === activeCompany && e.dept === dept.name && e.empNo !== dept.leadId
              );

              const totalCount = (lead ? 1 : 0) + members.length;

              return (
                <div 
                  key={dept.name} 
                  style={{
                    ...styles.deptBlock,
                    borderTop: `5px solid ${dept.color}`
                  }}
                >
                  {/* 부서 이름 및 머릿수 뱃지 */}
                  <div style={styles.deptHeader}>
                    <span style={styles.deptTitle}>📁 {dept.name}</span>
                    <span style={styles.deptBadge}>👤 {totalCount}명</span>
                  </div>

                  {/* 부서장 카드 */}
                  <div style={styles.deptLeadArea}>
                    {lead ? renderEmployeeCard(lead, true) : <div style={styles.emptyLead}>부서장 공석</div>}
                  </div>

                  {/* 팀원 그리드 배치 (2열) */}
                  {members.length > 0 && (
                    <div style={styles.membersGrid}>
                      {members.map(m => renderEmployeeCard(m, false))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
      
      {/* 하단 인터랙션 팁 */}
      <div style={styles.tipBar}>
        💡 마우스 왼쪽 또는 **휠 클릭 후 드래그**하여 화면을 자유롭게 이동(PAN)하고, **마우스 휠 스크롤**로 확대/축소(ZOOM)하세요!
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
    backgroundColor: 'var(--bg-primary)',
    overflow: 'hidden'
  },
  toolbar: {
    height: '60px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    flexShrink: 0,
    zIndex: 10,
  },
  companyTabs: {
    display: 'flex',
    gap: '8px',
  },
  tabBtn: {
    padding: '6px 16px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: '700',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginRight: '8px',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    padding: '7px 10px 7px 32px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontSize: '0.825rem',
    outline: 'none',
    width: '200px',
  },
  controlBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  viewport: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-tertiary)',
    position: 'relative',
    cursor: 'grab',
  },
  treeWrapper: {
    position: 'absolute',
    top: '40px',
    left: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
    minWidth: 'max-content',
    transformOrigin: 'top center',
    transition: 'transform 0.05s ease-out',
  },
  ceoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    position: 'relative',
  },
  ceoNodeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  roleHeader: {
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--primary)',
    marginBottom: '8px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  linkLine: {
    width: '40px',
    height: '2px',
    backgroundColor: 'var(--border)',
    position: 'relative',
  },
  linkCircle: {
    position: 'absolute',
    left: '50%',
    top: '-4px',
    transform: 'translateX(-50%)',
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--border)',
    borderRadius: '50%',
  },
  verticalLinkLine: {
    width: '2px',
    height: '30px',
    backgroundColor: 'var(--border)',
    marginTop: '-25px',
  },
  deptsRow: {
    display: 'flex',
    gap: '32px',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: '16px',
    borderTop: '2px solid var(--border)',
  },
  deptBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.15)',
    minWidth: '380px',
    flexShrink: 0,
  },
  deptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '14px',
    fontWeight: '800',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
  },
  deptTitle: {
    whiteSpace: 'nowrap',
  },
  deptBadge: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-light)',
    fontSize: '0.7rem',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  deptLeadArea: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  emptyLead: {
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    fontStyle: 'italic',
    padding: '8px',
  },
  membersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 175px)',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '1px dashed var(--border-light)',
  },
  nodeCard: {
    border: '1px solid var(--border-light)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-primary)',
    padding: '10px 14px',
    width: '175px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
    textAlign: 'left',
    position: 'relative',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '13px',
    flexShrink: 0,
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: 1,
  },
  cardName: {
    fontSize: '0.825rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardGrade: {
    fontSize: '0.675rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardWorkplace: {
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  leadLabel: {
    position: 'absolute',
    top: '-6px',
    right: '6px',
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    border: '1px solid rgba(255, 107, 0, 0.3)',
    color: 'var(--primary)',
    fontSize: '7px',
    fontWeight: '800',
    padding: '1px 4px',
    borderRadius: '3px',
    letterSpacing: '0.5px',
  },
  tipBar: {
    height: '36px',
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border)',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    userSelect: 'none',
  }
};
