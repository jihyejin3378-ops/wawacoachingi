/**
 * build.mjs
 * ---------------------------------------------------------------
 * content/ 의 원고와 data/ 의 JSON을 읽어 dist/ 에 완성된
 * 정적 HTML을 만듭니다. 브라우저에서 그리는 게 아니라 빌드할 때
 * 본문까지 다 박아 넣기 때문에, 네이버 검색로봇이 글을 그대로 읽습니다.
 *
 *   npm run build   →  dist/ 생성
 */
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import matter from 'gray-matter';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf-8');
const readJSON = (p) => JSON.parse(read(p));
const write = (rel, text) => {
  const out = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, text, 'utf-8');
};

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
           .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ===============================================================
   1. 데이터 읽기
   =============================================================== */
const site = readJSON('data/site.json');
const centers = readJSON('data/centers.json').centers;
const reviews = readJSON('data/reviews.json').reviews;

const SITE_URL = (site.siteUrl || '').replace(/\/$/, '');
const TEL_RAW = (site.tel || '').replace(/-/g, '');

const posts = fs.existsSync(path.join(ROOT, 'content/posts'))
  ? fs.readdirSync(path.join(ROOT, 'content/posts'))
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const { data, content } = matter(read(`content/posts/${f}`));
        const slug = data.slug || f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
        const date = (data.date instanceof Date)
          ? data.date.toISOString().slice(0, 10)
          : String(data.date || '').slice(0, 10);
        return {
          slug, date,
          title: data.title || slug,
          excerpt: data.excerpt || '',
          tags: data.tags || [],
          cover: data.cover || '',
          html: marked.parse(content),
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  : [];

/* ===============================================================
   2. 공통 조각
   =============================================================== */
const NAV = [
  ['/#systems', '학습 시스템'],
  ['/centers.html', '전국지점'],
  ['/reviews.html', '후기'],
  ['/blog.html', '학습 이야기'],
  ['/#faq', '자주 묻는 질문'],
];

const head = ({ title, desc, url, extra = '' }) => `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
${url ? `<link rel="canonical" href="${esc(SITE_URL + url)}" />` : ''}
${site.naverVerification ? `<meta name="naver-site-verification" content="${esc(site.naverVerification)}" />` : ''}
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
${url ? `<meta property="og:url" content="${esc(SITE_URL + url)}" />` : ''}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/style.css" />
${extra}`;

const header = () => `<header class="header">
  <div class="wrap header-in">
    <a class="logo" href="/">
      <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 13l5 5L20 6" fill="none" stroke="#C7362B" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      ${esc(site.name)}
    </a>
    <nav class="nav">
      ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('\n      ')}
    </nav>
    <div class="header-cta">
      <a class="tel-top" href="tel:${TEL_RAW}">${esc(site.tel)}<span>${esc(site.hours)}</span></a>
      <a class="btn btn-solid" href="/#counsel">상담 신청</a>
    </div>
    <button class="burger" id="burger" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mnav">
      <i></i><i></i><i></i>
    </button>
  </div>
</header>

<nav class="mobile-nav" id="mnav">
  ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('\n  ')}
  <a href="/#counsel">상담 신청</a>
</nav>`;

const footer = () => `<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        <h5>${esc(site.name)}</h5>
        <ul>
          <li>${esc(site.address)}</li>
          <li><a href="tel:${TEL_RAW}">${esc(site.tel)}</a></li>
          <li>${esc(site.hoursFull)}</li>
        </ul>
      </div>
      <div>
        <h5>바로가기</h5>
        <ul>
          <li><a href="/centers.html">전국지점</a></li>
          <li><a href="/reviews.html">후기</a></li>
          <li><a href="/blog.html">학습 이야기</a></li>
          <li><a href="/#counsel">상담 신청</a></li>
        </ul>
      </div>
      <div>
        <h5>소식</h5>
        <ul>
          <li><a href="${esc(site.links?.blog || '#')}">네이버 블로그</a></li>
          <li><a href="${esc(site.links?.instagram || '#')}">인스타그램</a></li>
          <li><a href="${esc(site.links?.kakao || '#')}">카카오톡 채널</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-legal">
      ${esc(site.bizInfo)}<br />
      © ${new Date().getFullYear()} ${esc(site.name)}. All rights reserved.
    </p>
  </div>
</footer>

<div class="mobile-bar">
  <a class="btn btn-ghost" href="tel:${TEL_RAW}">전화 상담</a>
  <a class="btn btn-solid" href="/#counsel">상담 신청</a>
</div>`;

const NAV_SCRIPT = `  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mnav');
  burger.addEventListener('click', function () {
    var open = mnav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });`;

const shell = ({ title, desc, url, extra = '', body, script = '', foot = '' }) =>
`<!DOCTYPE html>
<html lang="ko">
<head>
${head({ title, desc, url, extra })}
</head>
<body>
${header()}
${body}
${footer()}
<script>
${NAV_SCRIPT}
${script}
</script>
${foot}
</body>
</html>
`;

/* ===============================================================
   3. 메인
   =============================================================== */
function buildHome() {
  const page = read('index.html')
    .replace('{{HEAD}}', head({
      title: `${site.name} | 초중고 자기주도학습 · 국영수 전문`,
      desc: '스스로 공부하는 힘을 길러주는 초중고 학습코칭센터.',
      url: '/',
    }))
    .replace('{{HEADER}}', header())
    .replace('{{FOOTER}}', footer())
    .replace('{{NAV_SCRIPT}}', NAV_SCRIPT)
    .replace(/\{\{TEL\}\}/g, esc(site.tel))
    .replace(/\{\{TEL_RAW\}\}/g, TEL_RAW)
    .replace(/\{\{TAGLINE\}\}/g, esc(site.tagline))
    .replace(/\{\{HOURS_FULL\}\}/g, esc(site.hoursFull))
    .replace(/\{\{FORM_ACTION\}\}/g, esc(site.formAction || '#'))
    .replace(/\{\{REVIEWS\}\}/g, reviews.slice(0, 3).map(reviewCard).join('\n'));

  write('index.html', page);
}

function reviewCard(r) {
  const bodyHtml = r.body.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('\n          ');
  return `      <div class="review">
        <div class="proof">
          <p class="proof-label">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4.5 4.5L19.5 6.5"/></svg>
            성적표 인증
          </p>
          <a class="proof-img" href="${esc(r.proof)}" target="_blank" rel="noopener"><img src="${esc(r.proof)}" alt="${esc(r.proofAlt)}" loading="lazy" /></a>
          <span class="proof-zoom">누르면 원본 크기로 볼 수 있습니다</span>
        </div>
        <div class="review-body">
          <p class="review-quote">${esc(r.quote).replace(/\n/g, '<br />')}</p>
          ${bodyHtml}
          <p class="review-by">${esc(r.subject)} · ${esc(r.byline)}</p>
        </div>
      </div>`;
}

/* ===============================================================
   4. 후기 페이지
   =============================================================== */
function buildReviews() {
  const body = `<section class="page-head">
  <div class="wrap">
    <p class="crumb"><a href="/">홈</a> · 수강 후기</p>
    <h1 class="h2">실제 수강 후기</h1>
    <p class="lead">성적표로 확인된 사례만 올립니다.</p>
  </div>
</section>

<section class="reviews" style="border-top:0">
  <div class="wrap">
    <div class="review-list">
${reviews.map(reviewCard).join('\n')}
    </div>
  </div>
</section>`;

  write('reviews.html', shell({
    title: `수강 후기 | ${site.name}`,
    desc: '성적표로 확인된 실제 수강생 후기입니다.',
    url: '/reviews.html', body,
  }));
}

/* ===============================================================
   5. 전국지점
   =============================================================== */
const SIDO_ORDER = ['서울','인천','경기','강원','대전','세종','충북','충남',
                    '광주','전북','전남','대구','경북','부산','울산','경남','제주'];
const sidoOf = (c) => c.address.split(' ')[0];
const guOf = (c) => (c.city || '').split(' ')[0] || '기타';

function centerCard(c, idx) {
  const kakao = 'https://map.kakao.com/link/search/' + encodeURIComponent(c.address);
  const mine = site.myCenter && c.name === site.myCenter;
  const q = [c.name, c.city, c.address, c.landmark || '', c.schools || ''].join(' ');
  return `<article class="ct-card${mine ? ' is-mine' : ''}" data-q="${esc(q)}">
  <h4>${esc(c.name)}${mine ? '<span class="ct-mine">우리 센터</span>' : ''}</h4>
  <p class="ct-f addr"><i>주소</i><span>${esc(c.address)}</span></p>
  ${c.landmark ? `<p class="ct-f"><i>위치</i><span>${esc(c.landmark)}</span></p>` : ''}
  ${c.reg ? `<p class="ct-f reg"><i>등록</i><span>${esc(c.reg)}</span></p>` : ''}
  ${c.subjects ? `<p class="ct-subjects">${c.subjects.map((s) => `<span>${esc(s)}</span>`).join('')}</p>` : ''}
  <p class="ct-actions">
    <button class="ct-btn primary" type="button" data-map="${idx}">지도 보기</button>
    <a class="ct-btn" href="${kakao}" target="_blank" rel="noopener">길찾기</a>
  </p>
</article>`;
}

function buildCenters() {
  // 시·도 → 시·군·구 순으로 묶어 미리 그려 둡니다 (검색로봇이 읽을 수 있게)
  let groups = '';
  const order = SIDO_ORDER.slice();
  if (site.myCenter) {
    const mine = centers.find((c) => c.name === site.myCenter);
    if (mine) {
      const ms = sidoOf(mine);
      order.sort((a, b) => (b === ms ? 1 : 0) - (a === ms ? 1 : 0));
    }
  }

  for (const sido of order) {
    const inSido = centers.filter((c) => sidoOf(c) === sido);
    if (!inSido.length) continue;

    const buckets = {};
    for (const c of inSido) (buckets[guOf(c)] ||= []).push(c);
    const gus = Object.keys(buckets).sort((a, b) => a.localeCompare(b, 'ko'));

    let inner = '';
    for (const g of gus) {
      buckets[g].sort((a, b) => {
        if (a.name === site.myCenter) return -1;
        if (b.name === site.myCenter) return 1;
        return a.name.localeCompare(b.name, 'ko');
      });
      inner += `<h3 class="ct-gu-head">${esc(g)}</h3>\n` +
        buckets[g].map((c) => centerCard(c, centers.indexOf(c))).join('\n') + '\n';
    }

    groups += `<section class="ct-sido" data-sido="${esc(sido)}">
  <div class="ct-sido-head"><h2>${esc(sido)}</h2><span>${inSido.length}개</span></div>
  <div class="ct-grid">
${inner}  </div>
</section>\n`;
  }

  const chips = ['<button class="chip" type="button" data-s="all" aria-pressed="true">전체</button>']
    .concat(SIDO_ORDER.filter((s) => centers.some((c) => sidoOf(c) === s))
      .map((s) => `<button class="chip" type="button" data-s="${s}" aria-pressed="false">${s}</button>`))
    .join('\n      ');

  const body = `<section class="page-head">
  <div class="wrap">
    <p class="crumb"><a href="/">홈</a> · 전국지점</p>
    <h1 class="h2">지역별 지점 찾기</h1>
    <div class="ct-search">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" stroke-linecap="round"/></svg>
      <input type="search" id="ctSearch" placeholder="지점명 · 지역 · 주소 · 학교명으로 검색" aria-label="지점 검색" />
    </div>
    <div class="ct-chips" id="ctChips" role="group" aria-label="지역 필터">
      ${chips}
    </div>
    <p class="ct-total" id="ctTotal">총 <b>${centers.length}개</b> 지점</p>
  </div>
</section>

<section>
  <div class="wrap ct-results" id="ctResults">
${groups}  </div>
</section>

<div class="ct-modal" id="ctModal" role="dialog" aria-modal="true" aria-labelledby="ctModalName">
  <div class="ct-modal-box">
    <div class="ct-modal-top">
      <div><h3 id="ctModalName"></h3><p id="ctModalAddr"></p></div>
      <button class="ct-close" type="button" id="ctClose" aria-label="닫기">&times;</button>
    </div>
    <div class="ct-modal-map" id="ctModalMap"></div>
    <p class="ct-modal-schools" id="ctModalSchools"></p>
  </div>
</div>`;

  write('centers.html', shell({
    title: `전국지점 | ${site.name}`,
    desc: `전국 ${centers.length}개 지점. 지역별로 가까운 센터를 찾아보세요.`,
    url: '/centers.html', body,
    script: `var CENTERS = ${JSON.stringify(centers)};
var KAKAO_KEY = ${JSON.stringify(site.kakaoMapKey || '')};`,
    foot: '<script src="/assets/centers.js"></script>',
  }));
}

/* ===============================================================
   6. 블로그
   =============================================================== */
function buildBlog() {
  const items = posts.map((p) => `      <a class="bl-item" href="/posts/${p.slug}.html">
        <p class="bl-meta"><time datetime="${p.date}">${p.date}</time>${p.tags.map((t) => `<span class="bl-tag">${esc(t)}</span>`).join('')}</p>
        <h2>${esc(p.title)}</h2>
        ${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}
      </a>`).join('\n');

  const body = `<section class="page-head">
  <div class="wrap">
    <p class="crumb"><a href="/">홈</a> · 학습 이야기</p>
    <h1 class="h2">학습 이야기</h1>
    <p class="lead">공부법, 시험 준비, 학습 습관에 대해 코치들이 쓰는 기록입니다.</p>
    <p class="rv-count">글 ${posts.length}편</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="bl-list">
${items || '      <p class="bl-empty">아직 발행된 글이 없습니다.</p>'}
    </div>
  </div>
</section>`;

  write('blog.html', shell({
    title: `학습 이야기 | ${site.name}`,
    desc: '공부법, 시험 준비, 학습 습관에 대한 코치들의 기록입니다.',
    url: '/blog.html', body,
  }));

  for (const p of posts) {
    const url = `/posts/${p.slug}.html`;
    const ld = {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: p.title, datePublished: p.date, dateModified: p.date,
      description: p.excerpt, mainEntityOfPage: SITE_URL + url,
      author: { '@type': 'Organization', name: site.name },
      publisher: { '@type': 'Organization', name: site.name },
    };

    const body = `<article class="wrap post">
  <div class="post-head">
    <p class="bl-meta"><time datetime="${p.date}">${p.date}</time>${p.tags.map((t) => `<span class="bl-tag">${esc(t)}</span>`).join('')}</p>
    <h1>${esc(p.title)}</h1>
    ${p.excerpt ? `<p class="lead">${esc(p.excerpt)}</p>` : ''}
  </div>
  ${p.cover ? `<img src="${esc(p.cover)}" alt="" style="border-radius:12px;margin-bottom:28px" />` : ''}
  <div class="post-body">
${p.html}
  </div>
  <div class="post-foot">
    <a class="btn btn-ghost" href="/blog.html">목록으로</a>
    <a class="btn btn-solid" href="/#counsel">상담 신청</a>
  </div>
</article>`;

    write(`posts/${p.slug}.html`, shell({
      title: `${p.title} | ${site.name}`,
      desc: p.excerpt, url, body,
      extra: `<meta property="og:type" content="article" />
<meta property="article:published_time" content="${p.date}" />
<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    }));
  }
}

/* ===============================================================
   7. 검색엔진용 파일
   =============================================================== */
function buildSeo() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/centers.html', '/reviews.html', '/blog.html']
    .map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`)
    .concat(posts.map((p) => `  <url><loc>${SITE_URL}/posts/${p.slug}.html</loc><lastmod>${p.date}</lastmod></url>`));

  write('sitemap.xml',
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`);

  write('robots.txt',
`User-agent: *
Allow: /
Disallow: /admin/

User-agent: Yeti
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);
}

/* ===============================================================
   8. 정적 파일 복사
   =============================================================== */
function copyStatic() {
  for (const dir of ['assets', 'admin']) {
    const src = path.join(ROOT, dir);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(DIST, dir), { recursive: true });
  }
}

/* ===============================================================
   실행
   =============================================================== */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

buildHome();
buildReviews();
buildCenters();
buildBlog();
buildSeo();
copyStatic();

console.log(`빌드 완료 → dist/`);
console.log(`  지점 ${centers.length}곳 · 후기 ${reviews.length}건 · 글 ${posts.length}편`);
if (!site.siteUrl || site.siteUrl.includes('example')) {
  console.log('  ⚠ data/site.json 의 siteUrl 을 실제 주소로 바꿔 주세요 (sitemap에 쓰입니다)');
}
if (!site.naverVerification) {
  console.log('  ⚠ data/site.json 의 naverVerification 이 비어 있습니다 (네이버 소유확인용)');
}
