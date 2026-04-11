// src/utils/dateHelper.ts

export function getAcademicYear(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  // 日本の学校教育法では、4月2日〜翌年4月1日生まれで1学年となる。
  // つまり、1〜3月、および4月1日生まれは「前年度」の扱いとなる。
  if (month < 4 || (month === 4 && day === 1)) {
    return year - 1
  }
  return year
}

export function calculateAgeAndGrade(birthdateStr: string | null): { age: number | null, grade: string | null } {
  if (!birthdateStr) return { age: null, grade: null }
  
  const birthDate = new Date(birthdateStr)
  if (isNaN(birthDate.getTime())) return { age: null, grade: null }

  const today = new Date()

  // --- 計算：年齢 ---
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  // 今年まだ誕生日を迎えていない場合はマイナス1
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  // --- 計算：学年 ---
  const birthAcademicYear = getAcademicYear(birthDate)
  const currentAcademicYear = getAcademicYear(today)
  const diff = currentAcademicYear - birthAcademicYear

  let grade = null
  if (diff === 4) grade = '年中'
  else if (diff === 5) grade = '年長'
  else if (diff === 6) grade = '小1'
  else if (diff === 7) grade = '小2'
  else if (diff === 8) grade = '小3'
  else if (diff === 9) grade = '小4'
  else if (diff === 10) grade = '小5'
  else if (diff === 11) grade = '小6'
  else if (diff === 12) grade = '中1'
  else if (diff === 13) grade = '中2'
  else if (diff === 14) grade = '中3'
  else if (diff > 0 && diff < 4) grade = '未就園・年少'
  else if (diff > 14) grade = '高校生以上'

  return { age, grade }
}
