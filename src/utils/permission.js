/**
 * 사용자의 권한 등급(Role Level)을 산정하는 헬퍼 함수
 * 0: 관리자 (유종욱, 박용진, 강동균 실장)
 * 1: 1등급 (대표, 부사장님, 경영지원본부)
 * 2: 2등급 (임원 - 직급 실장 이상)
 * 3: 3등급 (PM급 - 직급 책임 이상)
 * 4: 4등급 (일반 - 직급 책임 미만)
 */
export const getUserRoleLevel = (user) => {
  if (!user) return 4; // 기본값 일반(Staff)

  if (user.roleLevel !== undefined && user.roleLevel !== null && user.roleLevel !== '') {
    return Number(user.roleLevel);
  }

  const id = (user.id || '').toLowerCase();
  const empNo = (user.empNo || '').toUpperCase();
  const grade = user.grade || '';
  const role = user.role || '';
  const dept = user.dept || '';

  // 0. 관리자 권한 명시적 부여 (유종욱 실장, 박용진 수석, 강동균 실장)
  if (
    id === 'yjw' || 
    id === 'yjpark' || 
    id === 'kdgang' ||
    empNo === 'CC-002' || 
    empNo === 'EMP-2018-001' || 
    empNo === 'CC-006' ||
    ['유종욱', '박용진', '강동균'].includes(user.userName)
  ) {
    return 0;
  }

  // 1. 1등급 (대표, 부사장님, 경영지원본부 소속 전원)
  if (
    id === 'kodari' ||
    id === 'tgkang' ||
    empNo === 'CC-000' ||
    empNo === 'CC-007' ||
    ['대표', 'CEO', '부사장', 'Executive Vice President'].includes(grade) ||
    dept === '경영지원본부'
  ) {
    return 1;
  }

  // 2. 2등급 임원 (실장 이상 - 상무, 실장, 본부장, 센터장, 이사)
  if (
    ['실장', '본부장', '센터장', '상무', '기술이사', 'General Manager'].includes(grade) ||
    role === '실장' ||
    role === '본부장' ||
    role === '센터장'
  ) {
    return 2;
  }

  // 3. 3등급 PM급 (책임 이상 - 수석, 책임, 팀장, 파트장, Asst. Team Leader)
  if (
    ['수석', '책임', '팀장', '파트장', 'Team Leader', 'Asst. Team Leader'].includes(grade) ||
    role.includes('수석') ||
    role.includes('책임') ||
    role.includes('팀장') ||
    role.includes('파트장') ||
    role.includes('Leader')
  ) {
    return 3;
  }

  // 4. 일반 권한 (책임 미만 - 선임, 프로, 주임, 사원, Staff 등)
  return 4;
};

/**
 * 역할 레벨에 대한 라벨 반환
 */
export const getRoleLabel = (level) => {
  switch (level) {
    case 0:
      return '관리자';
    case 1:
      return '1등급 (대표/부사장/경영지원)';
    case 2:
      return '2등급 (임원 - 실장 이상)';
    case 3:
      return '3등급 (PM급 - 책임 이상)';
    case 4:
      return '4등급 (일반 - 책임 미만)';
    default:
      return '일반';
  }
};
