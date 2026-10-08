export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export const qs = (name) => new URLSearchParams(location.search).get(name);

export const normalize = (s) => String(s ?? '').replace(/\s+/g, '').toLowerCase();

// 한국어·미림어·예문 어디에 있든 찾힘 (양방향 검색)
export function matches(w, q) {
  const n = normalize(q);
  return !!n && [w.mirim, w.korean, w.example].some((f) => normalize(f).includes(n));
}

const CHO = ['ㄱ', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅂ', 'ㅅ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
export const CHO_LIST = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// 첫 글자 초성 (쌍자음은 기본 자음으로). 한글 아니면 '#'
export function chosung(str) {
  const ch = String(str).trim()[0] || '';
  const code = ch.charCodeAt(0) - 0xac00;
  if (code >= 0 && code < 11172) return CHO[Math.floor(code / 588)];
  return CHO_LIST.includes(ch) ? ch : '#';
}

export function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 날짜가 씨앗 → 같은 날엔 누가 봐도 같은 단어 (words 는 created_at 오름차순)
export function todayWord(words) {
  if (!words.length) return null;
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return words[seed % words.length];
}

export const byKorean = (a, b) => a.mirim.localeCompare(b.mirim, 'ko');
export const byNewest = (a, b) => b.created_at.localeCompare(a.created_at);
