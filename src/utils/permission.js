/**
 * 사용자의 권한 등급(Role Level)을 산정하는 헬퍼 함수
 * 1: 관리자, 2: 임원, 3: PM, 4: 일반
 */
export const getUserRoleLevel = (user) => {
  if (!user) return 4; // 기본값 일반(Staff)

  const id = (user.id || '').toLowerCase();
  const empNo = (user.empNo || '').toUpperCase();
  const grade = user.grade || '';
  const role = user.role || '';

  // 1. 관리자 권한 명시적 부여 (유종욱 실장, 박용진 수석, 코다리 대표 및 grade가 대표, CEO, 상무 등)
  if (
    id === 'yjw' || 
    id === 'yjpark' || 
    empNo === 'CC-002' || 
    empNo === 'EMP-2018-001' || 
    id === 'kodari' ||
    ['대표', 'CEO', '상무'].includes(grade)
  ) {
    return 1;
  }

  // 2. 임원 권한 (부사장, 본부장, 실장, 센터장, Executive Vice President 등)
  if (
    ['부사장', '본부장', '실장', '센터장', 'Executive Vice President'].includes(grade) ||
    role === '실장' ||
    role === '본부장' ||
    role === '센터장'
  ) {
    return 2;
  }

  // 3. PM 권한 (팀장, 파트장, Team Leader, Asst. Team Leader 등)
  if (
    ['팀장', '파트장', 'Team Leader', 'Asst. Team Leader'].includes(grade) ||
    role.includes('팀장') ||
    role.includes('파트장') ||
    role.includes('Leader')
  ) {
    return 3;
  }

  // 4. 일반 권한
  return 4;
};

/**
 * 역할 레벨에 대한 라벨 반환
 */
export const getRoleLabel = (level) => {
  switch (level) {
    case 1:
      return '관리자';
    case 2:
      return '임원';
    case 3:
      return 'PM';
    default:
      return '일반';
  }
};
