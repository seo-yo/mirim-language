# 미림어 사전

친구가 하는 재밌는 말을 모으는 사전. 로그인 없이 누구나 등록할 수 있고, 고치거나 지울 땐 등록할 때 정한 4자리 비밀번호를 씁니다.

정적 HTML/CSS/JS + Supabase(REST 직접 호출). 빌드 없음.

## 처음 세팅 (한 번만)

1. https://supabase.com 에서 새 프로젝트 생성 (Region: Northeast Asia 권장)
2. 대시보드 > **SQL Editor** 에 `sql/schema.sql` 전체를 붙여 넣고 Run
   - 맨 아래 주석 처리된 샘플 3건은 원하면 주석을 풀고 실행 (비밀번호 0000)
3. 대시보드 > **Project Settings > API** 에서 `Project URL` 과 `anon public` 키를 복사해 `js/config.js` 에 입력
4. 아무 정적 호스팅(GitHub Pages, Vercel, Netlify)에 폴더째 올리면 끝

로컬에서 보려면 폴더에서 `python3 -m http.server 8000` → http://localhost:8000
(ES module 이라 `file://` 로 열면 동작하지 않음)

## 운영

- 잘못 올라온 말 숨기기: 대시보드 > Table Editor > `words` > 해당 행 `hidden` 체크
- 비밀번호를 잊은 항목 고치기: 같은 곳에서 직접 수정
- 비밀번호 5회 연속 실패 시 10분 잠금 (`pin_locked_until`)

## 구조

```
index.html        홈 (오늘의 발견 · 최근 등록)
dictionary.html   전체 사전 (검색 · 초성 색인 · 정렬)
word.html?id=     단어 상세 (저장 · 링크 복사 · 고치기 · 지우기)
add.html[?id=]    등록 / 수정
my.html           내 단어장 (localStorage, 기기별)
css/style.css     디자인 토큰 + 전체 스타일
js/config.js      Supabase URL / anon key
js/api.js         REST 호출 (뷰 조회 + RPC 3개)
js/store.js       localStorage (저장 단어 · 최근 검색 · 등록 간격)
js/layout.js      헤더/푸터 주입
js/util.js        초성 · 날짜 · 오늘의 단어 · 검색 정규화
js/ui.js          아이콘 · 저장 버튼 · 목록 행
js/pages/*.js     페이지별 스크립트
sql/schema.sql    테이블 · 뷰 · RPC · 권한
```
