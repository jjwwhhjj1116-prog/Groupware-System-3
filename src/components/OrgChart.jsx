import React, { useState, useRef, useEffect } from 'react';
import { Search, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

export default function OrgChart({ allEmployees, onUserClick, currentWorkspace }) {
  const [activeCompany, setActiveCompany] = useState(currentWorkspace === 'vietqs' ? 'Viet QS' : 'CON-COST');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [scale, setScale] = useState(0.85);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const viewportRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 0.06;
      let nextScale = scale + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
      nextScale = Math.min(Math.max(nextScale, 0.3), 2.0);
      setScale(nextScale);
    };
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [scale]);

  const handleMouseDown = (e) => {
    if (e.button === 0 || e.button === 1) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      viewportRef.current.style.cursor = 'grabbing';
      if (e.button === 1) e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (viewportRef.current) viewportRef.current.style.cursor = 'grab';
  };

  const resetViewport = () => {
    setScale(0.85);
    setPosition({ x: 0, y: 0 });
  };

  const isConcost = activeCompany === 'CON-COST';
  const ceoEmp = allEmployees.find(e => isConcost ? e.id === 'kodari' : e.empNo === "VQS-001");
  const advisorEmp = allEmployees.find(e => isConcost ? e.id === 'tgkang' : e.empNo === "VQS-002");

  const deptsConfig = isConcost 
    ? [
        { name: "대표이사", leadId: "CC-000", color: "#3b82f6" },
        { name: "임원실", leadId: "CC-007", color: "#8b5cf6" },
        { name: "경영지원본부", leadId: "CC-001", color: "#10b981" },
        { name: "QC", leadId: "CC-008", color: "#ef4444" },
        { name: "BIM파트", leadId: "CC-029", color: "#ff6b00" },
        { name: "토목·조경파트", leadId: "CC-030", color: "#f59e0b" },
        { name: "클레임센터", leadId: "CC-031", color: "#6366f1" },
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

  const getGradeRank = (grade) => {
    const ranks = ['대표', 'CEO', '부사장', 'Executive Vice President', '상무', '본부장', '실장', '센터장', '팀장', '파트장', '기술이사', 'General Manager', '수석', '책임', '선임', 'Asst. Team Leader', '프로', '주임', '사원', 'Staff'];
    const idx = ranks.indexOf(grade);
    return idx === -1 ? 99 : idx;
  };

  const matchesSearch = (emp) => {
    if (!searchTerm.trim() || !emp) return true;
    const term = searchTerm.toLowerCase();
    return (emp.userName && emp.userName.toLowerCase().includes(term)) || (emp.dept && emp.dept.toLowerCase().includes(term)) || (emp.grade && emp.grade.toLowerCase().includes(term));
  };

  const renderTreeCard = (emp, ringColor = 'var(--primary)', overrideName = null) => {
    if (!emp) {
      return (
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5, zIndex: 10, position: 'relative' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-active)', border: `3px solid ${ringColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 'bold' }}>?</div>
          <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{overrideName || '공석'}</div>
        </div>
      );
    }
    const isMatched = matchesSearch(emp);
    const opacity = isMatched ? 1 : 0.22;
    const transform = isMatched && searchTerm.trim() ? 'scale(1.15)' : 'scale(1)';

    return (
      <div 
        onClick={() => onUserClick && onUserClick(emp.id)}
        style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', opacity, cursor: 'pointer', transform, transition: 'all 0.2s', zIndex: 10, position: 'relative' }}
      >
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: `3px solid ${ringColor}`, padding: '2px', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            backgroundColor: emp.photoUrl ? 'transparent' : 'var(--bg-active)',
            backgroundImage: emp.photoUrl ? `url(${emp.photoUrl})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 'bold'
          }}>
            {!emp.photoUrl && emp.userName.charAt(0)}
          </div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{emp.userName}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{emp.grade || '사원'}</div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <div style={styles.companyTabs}>
          <button style={{...styles.tabBtn, backgroundColor: activeCompany === 'CON-COST' ? 'var(--primary)' : 'transparent', color: activeCompany === 'CON-COST' ? '#ffffff' : 'var(--text-secondary)', borderColor: activeCompany === 'CON-COST' ? 'var(--primary)' : 'var(--border-light)'}} onClick={() => { setActiveCompany('CON-COST'); resetViewport(); }}>CON-COST 조직도</button>
          <button style={{...styles.tabBtn, backgroundColor: activeCompany === 'Viet QS' ? 'var(--primary)' : 'transparent', color: activeCompany === 'Viet QS' ? '#ffffff' : 'var(--text-secondary)', borderColor: activeCompany === 'Viet QS' ? 'var(--primary)' : 'var(--border-light)'}} onClick={() => { setActiveCompany('Viet QS'); resetViewport(); }}>Viet QS 조직도</button>
        </div>
        <div style={styles.rightControls}>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input type="text" placeholder="사원명, 직급, 부서 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
          </div>
          <button style={styles.controlBtn} onClick={() => setScale(prev => Math.min(prev + 0.1, 2.0))} title="확대"><ZoomIn size={16} /></button>
          <button style={styles.controlBtn} onClick={() => setScale(prev => Math.max(prev - 0.1, 0.3))} title="축소"><ZoomOut size={16} /></button>
          <button style={styles.controlBtn} onClick={resetViewport} title="초기화"><Maximize2 size={16} /></button>
        </div>
      </div>

      <div ref={viewportRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={styles.viewport}>
        <div style={{ position: 'absolute', top: '40px', left: '50%', transform: `translate(calc(-50% + ${position.x}px), ${position.y}px) scale(${scale})`, transformOrigin: 'top center', transition: isDragging.current ? 'none' : 'transform 0.05s ease-out' }}>
          
          <div className="org-tree">
            <ul>
              <li>
                {ceoEmp && (
                  <>
                    <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px' }}>CEO (대표이사)</div>
                    {renderTreeCard(ceoEmp)}
                  </>
                )}
                {/* Advisor and Depts Branching */}
                <ul>
                  {advisorEmp && (
                    <li>
                      <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px' }}>Executive Vice President</div>
                      {renderTreeCard(advisorEmp)}
                      <ul>
                        {/* Rendering Departments under Advisor */}
                        {deptsConfig.map(dept => {
                          const lead = allEmployees.find(e => e.company === activeCompany && e.empNo === dept.leadId);
                          const members = allEmployees.filter(e => e.company === activeCompany && e.dept === dept.name && e.empNo !== dept.leadId).sort((a, b) => getGradeRank(a.grade) - getGradeRank(b.grade));
                          return (
                            <li key={dept.name}>
                              <div style={{ display: 'inline-block', backgroundColor: 'var(--bg-active)', padding: '4px 10px', borderRadius: '12px', color: dept.color, fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '12px', border: `1px solid ${dept.color}` }}>{dept.name}</div>
                              <br/>
                              {renderTreeCard(lead, dept.color, lead ? null : '부서장 공석')}
                              {members.length > 0 && (
                                <ul>
                                  {members.map(m => (
                                    <li key={m.empNo}>
                                      {renderTreeCard(m, dept.color)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  )}
                  {!advisorEmp && deptsConfig.map(dept => {
                    const lead = allEmployees.find(e => e.company === activeCompany && e.empNo === dept.leadId);
                    const members = allEmployees.filter(e => e.company === activeCompany && e.dept === dept.name && e.empNo !== dept.leadId).sort((a, b) => getGradeRank(a.grade) - getGradeRank(b.grade));
                    return (
                      <li key={dept.name}>
                        <div style={{ display: 'inline-block', backgroundColor: 'var(--bg-active)', padding: '4px 10px', borderRadius: '12px', color: dept.color, fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '12px', border: `1px solid ${dept.color}` }}>{dept.name}</div>
                        <br/>
                        {renderTreeCard(lead, dept.color, lead ? null : '부서장 공석')}
                        {members.length > 0 && (
                          <ul>
                            {members.map(m => (
                              <li key={m.empNo}>
                                {renderTreeCard(m, dept.color)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </div>

        </div>
      </div>
      
      <div style={styles.tipBar}>
        💡 마우스 왼쪽 또는 **휠 클릭 후 드래그**하여 화면을 자유롭게 이동(PAN)하고, **마우스 휠 스크롤**로 확대/축소(ZOOM)하세요!
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1, height: '100%', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' },
  toolbar: { height: '60px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', flexShrink: 0, zIndex: 10 },
  companyTabs: { display: 'flex', gap: '8px' },
  tabBtn: { padding: '6px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s ease' },
  rightControls: { display: 'flex', alignItems: 'center', gap: '8px' },
  searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center', marginRight: '8px' },
  searchIcon: { position: 'absolute', left: '10px', color: 'var(--text-muted)' },
  searchInput: { padding: '7px 10px 7px 32px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.825rem', outline: 'none', width: '200px' },
  controlBtn: { width: '32px', height: '32px', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  viewport: { flex: 1, width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)', position: 'relative', cursor: 'grab' },
  tipBar: { height: '36px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, userSelect: 'none' }
};
