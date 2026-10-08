import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const BASE = SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/';
const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
};

async function request(path, body) {
  let res;
  try {
    res = await fetch(BASE + path, body === undefined
      ? { headers: HEADERS }
      : { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  } catch {
    throw new Error('서버에 연결할 수 없어요. js/config.js 설정을 확인해 주세요.');
  }
  if (!res.ok) {
    let msg = '잠시 문제가 생겼어요. 다시 시도해 주세요.';
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

const COLS = 'select=id,mirim,korean,example,note,author,created_at';
let cache = null;

// 전체 목록 (created_at 오름차순, 페이지당 1회 로드)
export async function list() {
  if (!cache) cache = await request(`words_public?${COLS}&order=created_at.asc,id.asc`);
  return cache;
}

export async function get(id) {
  const rows = await request(`words_public?${COLS}&id=eq.${encodeURIComponent(id)}`);
  return rows[0] || null;
}

export async function getMany(ids) {
  if (!ids.length) return [];
  const rows = await request(`words_public?${COLS}&id=in.(${ids.map(encodeURIComponent).join(',')})`);
  return ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean); // 저장 순서 유지
}

export const add = (w) => request('rpc/add_word', {
  p_mirim: w.mirim, p_korean: w.korean, p_pin: w.pin,
  p_example: w.example, p_note: w.note, p_author: w.author,
});

export const update = (id, pin, w) => request('rpc/update_word', {
  p_id: id, p_pin: pin, p_mirim: w.mirim, p_korean: w.korean,
  p_example: w.example, p_note: w.note, p_author: w.author,
});

export const remove = (id, pin) => request('rpc/delete_word', { p_id: id, p_pin: pin });

export const PIN_MESSAGE = {
  wrong_pin: '비밀번호가 맞지 않아요.',
  locked: '여러 번 틀려서 잠시 잠겼어요. 10분 뒤에 다시 시도해 주세요.',
  not_found: '사라진 말이에요.',
};
