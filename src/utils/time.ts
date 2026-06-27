export const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}
function checkScore(score: number): string {
  if (score >= 85) {
    return '';
  } else if (score >= 70) {
    return '';
  } else if (score >= 50) {
    return '';
  } else {
    return '' ;
  }
}

console.log(checkScore(90)); // Giỏi
console.log(checkScore(72)); // Khá
console.log(checkScore(40)); // Yếu