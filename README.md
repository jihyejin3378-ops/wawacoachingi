# wawa학습코칭센터 홈페이지

Decap CMS로 글과 데이터를 관리하고, Netlify가 빌드해서 배포하는 정적 사이트입니다.
관리자 화면에서 고친 내용이 GitHub에 저장되고, Netlify가 자동으로 다시 만들어 올립니다.

---

## 폴더 구조

```
admin/          관리자 화면 (Decap CMS)
  ├ index.html
  └ config.yml      ← 관리 항목을 정의합니다
assets/         이미지와 CSS
  ├ style.css
  ├ centers.js      전국지점 검색·필터
  ├ student.png
  ├ proof1~3.jpg
  └ uploads/        ← 관리자 화면에서 올린 이미지가 여기 쌓입니다
content/posts/  블로그 글 원고 (마크다운)
data/           사이트 데이터 (JSON)
  ├ site.json       전화번호, 주소, 네이버 코드 등
  ├ centers.json    전국지점 144곳
  └ reviews.json    수강 후기
index.html      메인 페이지 템플릿 ({{ }} 부분은 빌드할 때 채워집니다)
build.mjs       빌드 스크립트
netlify.toml    Netlify 설정
dist/           빌드 결과물 (깃에 올리지 않습니다)
```

**dist/ 는 올리지 마세요.** Netlify가 빌드할 때마다 새로 만듭니다.
`.gitignore` 에 이미 넣어 두었습니다.

---

## 처음 설정하기

### 1. GitHub에 올리기

`dist/` 와 `node_modules/` 를 뺀 나머지를 저장소에 올립니다.

### 2. Netlify 연결

1. [netlify.com](https://netlify.com) → Add new site → Import an existing project
2. GitHub 저장소 선택
3. Build command 와 Publish directory 는 `netlify.toml` 에 적혀 있어서 그대로 두면 됩니다
   (`npm run build` / `dist`)
4. Deploy 를 누르면 `○○○.netlify.app` 주소가 나옵니다

### 3. 관리자 로그인 만들기 — 이 단계를 빼먹으면 관리자 화면이 안 열립니다

1. Netlify 사이트 → **Site configuration → Identity → Enable Identity**
2. Identity → Registration 을 **Invite only** 로 (아무나 가입하면 안 됩니다)
3. Identity → Services → **Git Gateway → Enable**
4. Identity → Invite users 에서 본인 이메일로 초대장을 보내고, 메일의 링크로 비밀번호 설정

이제 `사이트주소/admin/` 으로 들어가면 로그인 화면이 나옵니다.

### 4. 사이트 정보 채우기

관리자 화면 → **사이트 설정** 에서 아래를 채웁니다.

| 항목 | 설명 |
|---|---|
| 사이트 주소 | `https://○○○.netlify.app` — sitemap에 쓰입니다 |
| 우리 지점명 | 전국지점 목록에서 맨 위에 강조됩니다 |
| 네이버 소유확인 코드 | 아래 5번에서 받습니다 |
| 카카오맵 키 | 비우면 구글 지도로 뜹니다 |
| 상담 폼 전송 주소 | [Formspree](https://formspree.io) 에서 받은 주소 |

### 5. 네이버 서치어드바이저

1. [searchadvisor.naver.com](https://searchadvisor.naver.com) 에서 사이트 등록
2. 소유확인 방법으로 **HTML 태그** 선택 → 나온 코드를 복사
3. 관리자 화면 → 사이트 설정 → **네이버 소유확인 코드** 에 붙여넣고 저장
4. 1~2분 뒤 다시 배포되면 소유확인 버튼을 누릅니다
5. 확인되면 **요청 → 사이트맵 제출** 에 `https://사이트주소/sitemap.xml` 입력

구글은 [Search Console](https://search.google.com/search-console) 에서 같은 방식입니다.

---

## 관리자 화면에서 할 수 있는 것

| 메뉴 | 내용 |
|---|---|
| 학습 이야기 | 글 쓰기·수정·삭제. 이미지 업로드 가능 |
| 수강 후기 | 후기 추가·수정. 성적표 이미지 교체 |
| 전국지점 | 지점 144곳 추가·수정·삭제 |
| 사이트 설정 | 전화번호, 주소, 영업시간, SNS 링크 등 |

저장을 누르면 GitHub에 커밋되고, Netlify가 1~2분 안에 사이트를 갱신합니다.

### 지점을 추가할 때

`주소` 는 **시·도로 시작하는 도로명주소**여야 합니다.
`서울특별시` 가 아니라 `서울`, `경기도` 가 아니라 `경기` 입니다.
빌드할 때 이 주소를 보고 시·도 버튼과 구별 소제목을 만들기 때문입니다.

```
○ 서울 강동구 양재대로 1606 3층
○ 경기 성남시 분당구 정자일로 121
✕ 서울특별시 강동구 …
```

---

## 왜 빌드를 거치나

글 내용을 자바스크립트로 그리면 네이버 검색로봇이 본문을 못 읽습니다.
네이버 로봇(Yeti)은 자바스크립트 실행이 약하기 때문입니다.

이 사이트는 빌드할 때 지점 144곳과 글 본문까지 전부 HTML에 박아 넣습니다.
자바스크립트를 꺼도 모든 내용이 그대로 보입니다. 검색로봇이 보는 화면도 같습니다.

---

## 내 컴퓨터에서 확인하기

```bash
npm install     # 처음 한 번만
npm run build   # dist/ 생성
npm run dev     # 빌드 후 localhost:3000 에서 미리보기
```

Node.js 20 이상이 필요합니다.
