const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const names = ['DEPARTMENT', 'COMMITTEE', 'LOGO', 'COLOR', 'TYPOGRAPHY', 'POSTER', 'FILM', 'STUDENTS', 'CATALOGUE', 'GOODS', 'EXHIBITION', 'PLAY'];
const korean = ['계대 시디 소개', '졸준위원 소개', '로고', '컬러', '타이포그래피', '포스터', '영상', '학생', '온라인 도록', '굿즈', '전시장', '알파벳 퍼즐'];
const mapping = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const letters = 'accumulation'.split('');

$('.logo-stack').innerHTML = letters.map((c, i) =>
  `<button class="glyph" data-section="${mapping[i]}" data-letter="${c}" data-title="${korean[mapping[i]]}" aria-label="${c} — ${korean[mapping[i]]}">
     <b class="glyph-letter" aria-hidden="true" style="background-position:${(i % 6) * 20}% ${Math.floor(i / 6) * 100}%"></b>
   </button>`
).join('');

const glyphs = $$('.glyph');
const dropOrder = [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
let raf = false;

function fallingState(progress, distance, direction) {
  if (progress <= 0) return { y: -distance, rotation: direction * 12 };
  if (progress >= 1) return { y: 0, rotation: 0 };

  if (progress < 0.72) {
    const phase = progress / 0.72;
    return {
      y: -distance * (1 - phase * phase),
      rotation: direction * 12 * (1 - phase * phase)
    };
  }

  const settle = (progress - 0.72) / 0.28;
  return {
    y: -Math.abs(Math.sin(settle * Math.PI * 2)) * 22 * (1 - settle),
    rotation: direction * Math.sin(settle * Math.PI * 2) * 2 * (1 - settle)
  };
}

function accumulate() {
  const max = $('.journey').offsetHeight - innerHeight;
  const p = reduced ? 1 : Math.max(0, Math.min(1, scrollY / Math.max(1, max)));
  $('.entry').style.opacity = String(Math.max(0, 1 - p * 12));

  glyphs.forEach((glyph, index) => {
    const rank = dropOrder.indexOf(index);
    const progress = Math.max(0, Math.min(1, (p - 0.08 - rank * 0.066) / 0.16));
    glyph.style.opacity = String(progress);

    if (progress >= 1) {
      glyph.style.transform = '';
    } else {
      const stack = $('.logo-stack');
      const row = Math.floor(index / 6);
      const cellHeight = stack.clientHeight / 2;
      const distance = stack.offsetTop + row * cellHeight + cellHeight + 50;
      const state = fallingState(progress, distance, index % 2 ? 1 : -1);
      glyph.style.transform = `translate3d(0, ${state.y}px, 0) rotate(${state.rotation}deg)`;
    }

    glyph.disabled = progress < 0.72;
  });

  raf = false;
}

addEventListener('scroll', () => {
  if (!raf) {
    raf = true;
    requestAnimationFrame(accumulate);
  }
}, { passive: true });

addEventListener('resize', accumulate);
accumulate();

const portal = $('.portal');
let active = -1, lastFocus, previousOverflow;
let savedScroll = 0;

// 따옴표 간격을 디자인시스템(1.764mm) 변수로 제어하는 인트로 렌더링
const intro = (title, desc, hint) =>
  `<h2 class="portal-title title-en font-doltop" id="portal-title">
     <span class="quote-spacing"><span aria-hidden="true">“</span><span class="quote-text">${title}</span><span aria-hidden="true">”</span></span>
   </h2>
   <div class="subline"><span>${desc}</span><span class="title-en">${hint}</span></div>`;

const legacyPanels = [
  () => intro('BUILD. BREAK.<br>BUILD AGAIN.', '하나의 글자, 하나의 층. 흩어진 조각이 다시 하나가 됩니다.', '01 / LOGO PLAYGROUND') +
        `<div class="logo-lab" aria-label="흩어졌다 쌓이는 Doltop 소문자 로고"><div class="lab-layout">${letters.map((c,j) => `<span class="lab-letter" style="left:${j%6*100/6}%;top:${Math.floor(j/6)*50}%" data-character="${c}">${c}</span>`).join('')}</div></div>
         <div class="controls">
           <button class="control" id="assemble">로고 쌓기</button>
           <button class="control" id="scatter">흩트리기</button>
         </div>
         <p class="asset-note">Doltop 소문자 로고. 흩트리기를 누를 때마다 새로운 위치로 흩어집니다.</p>`,

  () => intro('WORDS<br>HAVE WEIGHT.', '쓰고, 늘리고, 겹치며 나만의 문장을 만들어보세요.', '02 / TYPE PLAYGROUND') +
        `<div class="type-canvas font-doltop" id="type-preview">WHAT’S NEXT?</div>
         <label class="sr-only" for="type-input">타이포그래피 문구</label>
         <input class="type-input title-en" id="type-input" maxlength="35" value="WHAT’S NEXT?">
         <div class="controls">
           <label class="range-wrap">두께 <input id="weight" type="range" min="100" max="900" value="400" step="100"></label>
           <label class="range-wrap">간격 <input id="spacing" type="range" min="-8" max="8" value="-6"></label>
           <button class="control" id="type-invert">색상 반전</button>
         </div>`,

  () => intro('TWO SIDES.<br>ONE ACCUMULATION.', '문자로 쌓고, 형태로 쌓다.', '03 / 펼치기 · 포스터 클릭 시 확대') +
        `<div class="poster-deck">
           <button data-poster="assets/poster-type.jpg" aria-label="타이포그래피 포스터 확대">
             <img src="assets/poster-type.jpg" alt="타이포그래피 전시 포스터">
           </button>
           <button data-poster="assets/poster-stone.jpg" aria-label="돌이 쌓이는 포스터 확대">
             <img src="assets/poster-stone.jpg" alt="돌을 쌓은 전시 포스터">
           </button>
         </div>
         <button class="control" id="spread">포스터 펼치기</button>`,

  () => intro('TIME<br>IN MOTION.', '시간의 흐름을 문장의 축적으로.', '04 / MOTION STUDY') +
        `<div class="film-stage">
           <div class="film-lines"></div>
           <div class="film-word font-doltop">OBSERVE.</div>
         </div>
         <div class="controls">
           <label class="range-wrap">타임라인 <input id="film-time" type="range" min="0" max="100" value="0"></label>
           <span id="film-step" class="title-en">01 / 05</span>
           <button class="control" id="play-film">모션 시안 재생</button>
         </div>
         <p class="asset-note">브라우저에서 구현한 모션 시안입니다. 공식 전시 영상은 준비 중입니다.</p>`,

  () => intro('EVERY WORK.<br>A DIFFERENT LAYER.', '각자의 축적을 펼쳐봅니다.', '05 / PROJECT ARCHIVE') +
        `<div class="work-list">
           ${['시간의 활자', '축적의 형태', '다음의 그리드'].map((n, i) =>
             `<button class="work-item" data-work="${i}">
                <span class="title-en">0${i + 1}</span><strong>${n}</strong><span class="title-en">${['GRAPHIC', 'BRAND', 'DIGITAL'][i]} / 예시</span>
              </button>`
           ).join('')}
         </div>
         <div class="work-detail" aria-live="polite"></div>
         <p class="asset-note">작품과 참여자 자료 공개 전, 아카이브 인터랙션 구성 예시입니다.</p>`,

  () => intro('TURN<br>ANOTHER LAYER.', '한 장씩 넘기며 축적의 순서를 따라갑니다.', '06 / CATALOGUE PREVIEW') +
        `<div class="book">
           <div class="book-page" id="book-left"></div>
           <div class="book-page" id="book-right"></div>
         </div>
         <div class="book-controls">
           <button class="control" id="prev-page" aria-label="이전 도록 페이지">이전</button>
           <span id="page-count" class="title-en">01 / 04</span>
           <button class="control" id="next-page" aria-label="다음 도록 페이지">다음</button>
         </div>
         <p class="asset-note">인터랙티브 도록 시안입니다. 실제 도록 파일은 준비 중입니다.</p>`,

  () => intro('MEET<br>IN REAL SPACE.', '화면을 넘어, 같은 공간에 쌓이는 시간.', '07 / EXHIBITION') +
        `<div class="venue">
           <div>
             <div class="floor">
               <div class="floor-plane">
                 ${['4F', '12.11', '12.16', '축적'].map((n, i) =>
                   `<button data-room="${i}" aria-label="${['장소', '개막식', '폐막일', '전시 소개'][i]} 안내" class="title-en">${n}</button>`
                 ).join('')}
               </div>
             </div>
             <button class="control" id="floor-view">평면으로 보기</button>
             <p class="asset-note">공간 탐색 인터랙션 시안이며 실제 전시장 배치도가 아닙니다.</p>
           </div>
           <div class="venue-info" aria-live="polite">
             <h3 id="venue-heading">대구경북디자인진흥원<br>4F</h3>
             <p id="venue-copy">2026 계명대학교 시각디자인학과 졸업전시</p>
             <div class="info-row"><span>전시 기간</span><span class="title-en">2026.12.11 — 12.16</span></div>
             <div class="info-row"><span>관람 시간</span><span class="title-en">10:00 — 18:00</span></div>
             <div class="info-row"><span>개막 / 폐막</span><span class="title-en">12.11 18:00 / 12.16 14:00</span></div>
             <a href="https://map.naver.com/p/search/대구경북디자인진흥원" target="_blank" rel="noopener">지도에서 위치 보기</a>
           </div>
         </div>`
];

let posterTimer = null, layerObserver = null, bookTimer = null, filmTimer = null;

function revealLayers() {
  layerObserver?.disconnect();
  layerObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('arrived');
        layerObserver.unobserve(e.target);
      }
    });
  }, { root: portal, threshold: .08 });

  [...$('.portal-content').children].forEach((el, j) => {
    el.classList.add('layer');
    el.style.transitionDelay = Math.min(j * .07, .28) + 's';
    layerObserver.observe(el);
  });
}

function openSection(i, update = true) {
  lastFocus = document.activeElement;
  active = i;
  
  $('#portal-label').textContent = `${String(i + 1).padStart(2, '0')} / ${names[i]} — ${korean[i]}`;
  $('.portal-content').innerHTML = panels[i]();

  savedScroll = scrollY;
  portal.classList.add('open');
  portal.scrollTop = 0;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  $('.journey').inert = true;
  $('#close-portal').focus({ preventScroll: true });

  if (update) history.pushState({ section: i }, '', `#${names[i].toLowerCase()}`);
  wire(i);
}

function closeSection(update = true) {
  $('#student-modal').close();
  clearTimeout(bookTimer); bookTimer = null;
  clearInterval(filmTimer); filmTimer = null;
  clearInterval(posterTimer); 
  posterTimer = null;
  layerObserver?.disconnect();

  $('.zoom').classList.remove('open');
  portal.classList.remove('open');
  portal.inert = false;
  document.body.style.overflow = previousOverflow || '';

  $('.journey').inert = false;   scrollTo({ top: savedScroll, behavior: 'instant' });   active = -1;      if (update) history.pushState({}, '', location.pathname);   lastFocus?.focus({ preventScroll: true }); }  $$('[data-section]').forEach(b => b.onclick = () => openSection(+b.dataset.section));$('#close-portal').onclick = () => closeSection();
$('#close-zoom').onclick = closeZoom;

function closeZoom() {
  $('.zoom').classList.remove('open');
  portal.inert = false;
  document.querySelector('[data-poster]')?.focus();
}

addEventListener('keydown', e => {
  if ($('#student-modal').open || $('#chapter-index').open) return;
  if (e.key === 'Escape') {
    if ($('.zoom').classList.contains('open')) closeZoom();
    else if (active >= 0) closeSection();
  }
  if (e.key === 'Tab' && active >= 0) {
    const root = $('.zoom').classList.contains('open') ?$('.zoom') : portal;
    const focus = [...root.querySelectorAll('button, a, input')].filter(x => !x.disabled && x.offsetParent !== null);
    const first = focus[0], last = focus[focus.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

addEventListener('popstate', () => {
  const i = names.findIndex(n => '#' + n.toLowerCase() === location.hash);
  if (active >= 0) closeSection(false);
  if (i >= 0) openSection(i, false);
});

function legacyWire(i) {
  if (i === 0) {
    const lab = $('.logo-lab');     const parts = $$('.lab-letter');
    const scatter = () => {
      const width = lab.clientWidth, height = lab.clientHeight;
      parts.forEach((part,j) => {
        const cellWidth = width / 6, cellHeight = width * 799 / 3558 / 2;
        const homeX = (j%6+.5)*cellWidth;
        const homeY = height/2 + (Math.floor(j/6)-.5)*cellHeight;
        const targetX = cellWidth/2 + Math.random()*(width-cellWidth);
        const targetY = cellHeight/2 + Math.random()*Math.max(0,height-cellHeight);
        part.style.transform = `translate(${targetX-homeX}px, ${targetY-homeY}px) rotate(${Math.random()*300-150}deg) scale(${.55+Math.random()*.4})`;
        part.style.zIndex = String(Math.floor(Math.random()*12));
        part.style.transitionDelay = '0ms';
      });
    };
    scatter();
    document.fonts.load('1000px Doltop').then(() => {
      if (!lab.isConnected) return;
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = '1000px Doltop';
      parts.forEach(part => {
        const c = part.dataset.character, m = ctx.measureText(c);
        part.innerHTML = `<svg viewBox="${-m.actualBoundingBoxLeft} ${-m.actualBoundingBoxAscent} ${m.actualBoundingBoxLeft+m.actualBoundingBoxRight} ${m.actualBoundingBoxAscent+m.actualBoundingBoxDescent}" preserveAspectRatio="none" aria-hidden="true"><text x="0" y="0" style="font-size:1000px;letter-spacing:0">${c}</text></svg>`;
      });
    });
    $('#assemble').onclick = () => parts.forEach((part,j) => {
      part.style.transitionDelay = reduced ? '0ms' : `${(j>=6?j-6:j+6)*65}ms`;
      part.style.transform = 'none';
      part.style.zIndex = '1';
    });
    $('#scatter').onclick = scatter;
  }

  if (i === 1) {
    $('#type-input').oninput = e => $('#type-preview').textContent = e.target.value || 'ACCUMULATION';
    $('#weight').oninput = e => $('#type-preview').style.fontWeight = e.target.value;
    $('#spacing').oninput = e => $('#type-preview').style.letterSpacing = e.target.value / 100 + 'em';
    $('#type-preview').style.fontWeight = '400';
    $('#type-invert').onclick = () => {
      const el = $('#type-preview');
      el.classList.toggle('inverted');
      el.style.background = el.classList.contains('inverted') ? 'var(--red)' : 'var(--ink)';
      el.style.color = el.classList.contains('inverted') ? 'var(--ink)' : 'var(--red)';
    };
  }

  if (i === 2) {
    $('#spread').onclick = () => {
      const el = $('.poster-deck');
      el.classList.toggle('spread');
      $('#spread').textContent = el.classList.contains('spread') ? '다시 겹치기' : '포스터 펼치기';     };     $$('[data-poster]').forEach(b => b.onclick = () => {$('.zoom img').src = b.dataset.poster;
      $('.zoom').classList.add('open');
      portal.inert = true;
      $('#close-zoom').focus();
    });
  }

  if (i === 3) {
    const words = ['OBSERVE.', 'TRY.', 'MAKE.', 'ACCUMULATE.', 'WHAT’S NEXT?'];
    const render = v => {
      const j = Math.min(4, Math.floor(v / 21));
      $('.film-word').textContent = words[j];$('.film-word').style.transform = reduced ? 'none' : `translateY(${(v % 21 - 10) * 2}px) scale(${0.85 + (v % 21) / 70})`;
      $('#film-step').textContent = String(j + 1).padStart(2, '0') + ' / 05';
    };
    
    $('#film-time').oninput = e => render(+e.target.value);
    $('#play-film').onclick = () => {
      if (filmTimer) {
        clearInterval(filmTimer);
        filmTimer = null;
        $('#play-film').textContent = '모션 시안 재생';
        return;
      }
      let v = +$('#film-time').value;
      if (v >= 100) v = 0;
      $('#play-film').textContent = '일시정지';
      
      filmTimer = setInterval(() => {
        v++;
        $('#film-time').value = v;
        render(v);
        if (v >= 100) {
          clearInterval(filmTimer);
          filmTimer = null;
          $('#play-film').textContent = '다시 재생';         }       }, 80);     };   }    if (i === 4) {     $$('[data-work]').forEach(b => b.onclick = () => {
      const j = +b.dataset.work;
      const el = $('.work-detail');
      el.classList.add('show');
      el.innerHTML = `<span class="title-en">PROJECT STUDY 0${j + 1}</span>
                      <h3>${['시간의 활자', '축적의 형태', '다음의 그리드'][j]}</h3>
                      <p>${['질문과 실험이 타이포그래피의 형태로 축적되는 그래픽 디자인 시안.', '서로 다른 형태가 하나의 정체성으로 이어지는 브랜드 디자인 시안.', '한 번의 선택이 다음 화면의 층이 되는 디지털 경험 시안.'][j]}</p>
                      <p>실제 작품 이미지와 참여자 소개는 추후 공개됩니다.</p>`;
      el.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest' });
    });
  }

  if (i === 5) {
    let page = 0;
    const pages = [
      ['ACCUMU-<br>LATION.', '축적', '2026 계명대학교<br>시각디자인학과 졸업전시'],
      ['01.<br>OBSERVE.', '관찰', '익숙한 일상에 새로운 질문을 더하는 것.'],
      ['02.<br>MAKE.', '시도', '만들고, 고치고, 다시 시작한 순간들.'],
      ['03.<br>WHAT’S NEXT?', '다음', '지나온 시간의 층 위에 우리의 다음을 쌓다.']
    ];
    
    const render = () => {
      $('#book-left').innerHTML = `<span class="title-en">ACCUMULATION / 2026</span><h3 class="title-en">${pages[page][0]}</h3><span class="title-en">0${page + 1}</span>`;
      $('#book-right').innerHTML = `<span class="title-en">CATALOGUE STUDY</span><h3>${pages[page][1]}</h3><p>${pages[page][2]}</p>`;
      $('#page-count').textContent = `0${page + 1} / 04`;
      $('#prev-page').disabled = page === 0;
      $('#next-page').disabled = page === 3;
    };
    
    const turn = d => {
      if (bookTimer !== null) return;
      $('#book-right').classList.add('turn');
      bookTimer = setTimeout(() => {
        page = Math.max(0, Math.min(3, page + d));
        render();
        $('#book-right').classList.remove('turn');
        bookTimer = null;
      }, reduced ? 0 : 220);
    };
    
    $('#prev-page').onclick = () => turn(-1);
    $('#next-page').onclick = () => turn(1);
    render();
  }

  if (i === 6) {
    $('#floor-view').onclick = () => {
      $('.floor').classList.toggle('flat');$('#floor-view').textContent = $('.floor').classList.contains('flat') ? '입체로 보기' : '평면으로 보기';     };          const headings = ['대구경북디자인진흥원 4F', '개막식 · 12.11 18:00', '폐막 · 12.16 14:00', 'ACCUMULATION · 축적'];     const copies = ['각자의 축적이 한 공간에서 만납니다.', '2026년 12월 11일, 우리의 축적을 처음 펼칩니다.', '마지막 날은 14:00에 전시를 마칩니다.', '2026 계명대학교 시각디자인학과 졸업전시'];      $$('[data-room]').forEach(b => b.onclick = () => {$$('[data-room]').forEach(x => x.classList.toggle('selected', x === b));$('#venue-heading').textContent = headings[+b.dataset.room];
      $('#venue-copy').textContent = copies[+b.dataset.room];
    });
  }
}

const exhibitionData = {
  video: null,
  students: [], 
  committee: [], 
  goods: [],
  cataloguePdf: null 
};

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const previewStudents = Array.from({length:52}, (_,i) => ({
  name:`학생 ${String(i+1).padStart(2,'0')}`, 
  project:'작품 자료 준비 중', 
  medium:'매체 정보 준비 중',
  thumbnail:i%2?'assets/poster-stone.jpg':'assets/poster-type.jpg',
  description:'실제 학생과 작품 자료가 들어갈 썸네일 구성 예시입니다.'
}));

const studentRecords = exhibitionData.students.length ? exhibitionData.students : previewStudents;
const roleDescriptions = ['전체 일정과 전시 준비를 연결합니다.','포스터와 전시의 시각 언어를 구성합니다.','참여자의 작업을 온라인 공간으로 연결합니다.','영상과 모션으로 축적의 시간을 전달합니다.','학생의 작업을 한 권에 쌓아 기록합니다.','전시장과 굿즈의 경험을 준비합니다.'];
const roles = ['기획 · 운영','그래픽 · 브랜딩','웹 · 아카이브','영상 · 모션','도록 · 편집','공간 · 굿즈'];

const panels = [
  () => intro('우리의 질문이<br>디자인이 되기까지.', '계명대학교 시각디자인학과 · 2026 졸업전시', 'DEPARTMENT') + 
        `<p class="regular-copy">보고, 묻고, 만들고, 다시 시도합니다. 이번 전시는 서로 다른 관찰과 실험이 쌓여 만들어진 우리의 현재를 나누는 자리입니다.</p>
         <div class="stack-panel">
           <div class="stack-rows" id="department-layers"></div>
         </div>
         <div class="controls">
           <button class="control" id="department-add">다음 층 쌓기</button>
           <button class="control" id="department-reset">처음부터</button>
         </div>`,
         
  () => intro('함께 쌓아 올린<br>하나의 전시.', '졸업전시준비위원회', 'COMMITTEE') + 
        `<div class="role-grid">
           ${roles.map((r,i) => `<button class="role-card" data-role="${i}"><span class="title-en">0${i+1}</span><strong>${r}</strong><span class="title-en">역할 보기 ↗</span></button>`).join('')}
         </div>
         <div class="role-info" aria-live="polite">각 역할을 선택해 전시를 만드는 과정을 만나보세요.</div>
         <p class="asset-note">위원회 역할 구성 시안입니다. 확정된 역할과 이름은 실제 명단으로 교체됩니다.</p>`,
         
  () => legacyPanels[0](),
  
  () => intro('COLOR<br>ADDS A LAYER.', '네 가지 색을 선택하여 나만의 층을 쌓아보세요.', 'COLOR') + 
        `<div class="palette">
           ${['#FF5349','#000007','#F0EEE9','#FFFFFF'].map((c,i) => `<button class="swatch" data-color="${c}" style="background:${c};color:${i===1?'var(--paper)':'var(--ink)'}"><span class="title-en">0${i+1}</span><strong class="title-en">${c}</strong></button>`).join('')}
         </div>
         <div class="color-sculpture" aria-label="선택한 색상의 축적"></div>
         <div class="controls">
           <button class="control" id="color-reset">층 비우기</button>
           <span id="color-count" class="title-en" aria-live="polite">0 / 8 LAYERS</span>
         </div>`,
         
  () => legacyPanels[1]() + 
        `<div class="controls">
           <button class="control" id="type-stack">이 문장 쌓기</button>
           <button class="control" id="type-clear">문장 비우기</button>
         </div>
         <div class="type-layers" aria-live="polite"></div>`,
         
  () => intro('A POSTER.<br>SIX LAYERS.', '아래에서부터 완성되는 ACCUMULATION 포스터.', 'POSTER / MOTION') + 
        `<div class="poster-experience">
           <div class="motion-sheet" aria-label="여섯 층으로 쌓이는 포스터">
             ${Array.from({length:6},(_,i) => `<div class="poster-slice" style="background-image:url('assets/poster-stone.jpg');background-position:center ${i*20}%"></div>`).join('')}
           </div>
           <div class="motion-copy">
             <h3>한 층씩.<br>하나의 포스터로.</h3>
             <label for="poster-progress">축적의 진행</label>
             <input id="poster-progress" class="motion-range" type="range" min="0" max="6" step="1" value="0">
             <span id="poster-count" class="title-en" aria-live="polite">00 / 06</span>
             <div class="controls">
               <button class="control" id="poster-play">모션 재생</button>
               <button class="control" id="poster-switch">타이포 포스터로</button>
               <button class="control" data-poster="assets/poster-stone.jpg">원본 확대</button>
             </div>
             <p class="asset-note">제공된 포스터 원본에 적용한 웹 모션입니다.</p>
           </div>
         </div>`,
         
  () => intro('TIME<br>ACCUMULATED.', '우리의 축적을 움직이는 이미지로.', 'FILM') + 
        (exhibitionData.video ? `<video class="film-player" controls playsinline preload="metadata" src="${escapeHtml(exhibitionData.video)}" poster="assets/poster-stone.jpg"></video>` : 
        `<div class="film-placeholder"><strong class="title-en font-doltop">COMING<br>IN MOTION.</strong><span>해욱 제작 · 전시 영상 준비 중</span></div>
         <p class="asset-note">완성된 영상 파일을 받으면 이 공간에서 재생됩니다.</p>`),
         
  () => intro('각자의 시간.<br>각자의 축적.', '썸네일을 선택해 학생과 작업을 만나보세요.', 'STUDENTS') + 
        `<p class="regular-copy">52명의 축적</p>
         <div class="student-grid">
           ${studentRecords.map((r,i) => 
             `<button class="student-tile" data-student="${i}" data-category="${escapeHtml(r.category)}">
                <div class="student-thumb">
                  <img src="${escapeHtml(r.thumbnail)}" alt="${escapeHtml(r.project)}${exhibitionData.students.length?'':' — 썸네일 시안'}" loading="lazy">
                  ${exhibitionData.students.length?'':`<b class="title-en">STUDY ${String(i+1).padStart(2,'0')}</b>`}
                </div>
                <div class="student-meta">
                  <span>${escapeHtml(r.name)}</span>
                  <span class="title-en">${escapeHtml(r.project)}</span>
                </div>
              </button>`
           ).join('')}
         </div>
         ${exhibitionData.students.length?'':'<p class="asset-note">포스터를 사용한 썸네일 구성 시안입니다. 실제 학생 이름과 작품 자료는 준비 중입니다.</p>'}`,
         
  () => legacyPanels[5]() + 
        (exhibitionData.cataloguePdf ? `<a class="control" href="${escapeHtml(exhibitionData.cataloguePdf)}" target="_blank" rel="noopener">전체 도록 PDF 보기</a>` : ''),
        
  () => intro('TAKE<br>A LAYER HOME.', '전시의 기억을 일상에 쌓다.', 'GOODS') + 
        `<div class="goods-grid">
           ${(exhibitionData.goods.length ? exhibitionData.goods : [
             {name:'포스터',image:'assets/poster-type.jpg',description:'전시의 시각 언어를 담는 인쇄물 구성 시안.'},
             {name:'아트 프린트',image:'assets/poster-stone.jpg',description:'축적의 형태를 담는 인쇄물 구성 시안.'},
             {name:'그래픽 카드',image:'assets/poster-type.jpg',description:'전시 그래픽을 활용하는 카드 구성 시안.'}
           ]).map((g,i) => 
             `<button class="good" data-good="${i}">
                <img src="${escapeHtml(g.image)}" alt="${escapeHtml(g.name)}${exhibitionData.goods.length?'':' 구성 시안'}" loading="lazy">
                <h3>${escapeHtml(g.name)}</h3>
                <p>${exhibitionData.goods.length?'제품 정보 보기':'구성 시안 · 확정 전'}</p>
              </button>`
           ).join('')}
         </div>
         <div class="goods-info" aria-live="polite">이미지를 선택해 구성 정보를 살펴보세요.</div>
         <p class="asset-note">굿즈 종류·제작 여부·가격·수령 방식은 확정 후 안내됩니다.</p>`,
         
  () => legacyPanels[6](),
  
  () => intro('PLAY.<br>MAKE A WORD.', '알파벳을 골라 단어를 완성하세요. 완성한 단어가 아래에서부터 쌓입니다.', 'ALPHABET PUZZLE') + 
        `<p class="puzzle-status" id="puzzle-hint"></p>
         <div class="puzzle-target" aria-label="선택한 알파벳"></div>
         <div class="puzzle-bank" aria-label="선택 가능한 알파벳"></div>
         <div class="controls">
           <button class="control" id="puzzle-check">단어 확인</button>
           <button class="control" id="puzzle-undo">한 글자 되돌리기</button>
           <button class="control" id="puzzle-reset">다시 시작</button>
         </div>
         <p class="puzzle-status" id="puzzle-result" aria-live="polite"></p>
         <div class="completed-words title-en" aria-label="완성한 단어의 축적"></div>`
];

function wire(i) {
  const legacy = { 2:0, 4:1, 8:5, 10:6 };
  if (Object.hasOwn(legacy, i)) legacyWire(legacy[i]);
  
  if (i === 0) {
    let next = 0;
    const layers = ['01 / OBSERVE — 관찰하고 질문하기', '02 / TRY — 시도하고 수정하기', '03 / MAKE — 생각을 형태로 만들기', '04 / ACCUMULATE — 우리의 다음 쌓기'];
    
    $('#department-add').onclick = () => {
      if (next >= layers.length) return;
      const row = document.createElement('div');
      row.className = 'stack-row title-en';
      row.textContent = layers[next++];
      $('#department-layers').append(row);
      $('#department-add').disabled = next === layers.length;
    };
    
    $('#department-reset').onclick = () => {
      $('#department-layers').replaceChildren();
      next = 0;
      $('#department-add').disabled = false;
    };
  }
  
  if (i === 1) {
    $$('[data-role]').forEach(b => b.onclick = () => {       const j = +b.dataset.role;       $$
('[data-role]').forEach(x => x.classList.toggle('selected', x === b));
      const members = exhibitionData.committee.filter(x => x.role === roles[j]).map(x => x.name);
      $('.role-info').textContent = roles[j] + ' — ' + roleDescriptions[j] + (members.length ? ' / ' + members.join(', ') : ' / 위원 명단 준비 중');
      $('.role-info').animate(reduced ? [] : [{opacity: 0, transform: 'translateY(45px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 500, fill: 'both'});     });   }      if (i === 3) {     $$('[data-color]').forEach(b => b.onclick = () => {
      const host = $('.color-sculpture');
      if (host.children.length >= 8) host.firstElementChild.remove();
      const row = document.createElement('div');
      row.className = 'color-stripe title-en';
      row.style.background = b.dataset.color;
      row.style.color = b.dataset.color === '#000007' ? 'var(--paper)' : 'var(--ink)';
      row.textContent = b.dataset.color;
      host.append(row);
      $('#color-count').textContent = host.children.length + ' / 8 LAYERS';
    });
    
    $('#color-reset').onclick = () => {
      $('.color-sculpture').replaceChildren();$('#color-count').textContent = '0 / 8 LAYERS';
    };
  }
  
  if (i === 4) {
    $('#type-stack').onclick = () => {
      const host = $('.type-layers');
      if (host.children.length >= 6) host.firstElementChild.remove();
      const row = document.createElement('div');
      row.className = 'type-layer title-en font-doltop';
      row.textContent = $('#type-preview').textContent;
      row.style.fontWeight = $('#type-preview').style.fontWeight;
      row.style.letterSpacing = $('#type-preview').style.letterSpacing;
      host.append(row);
    };
    $('#type-clear').onclick = () => $('.type-layers').replaceChildren();   }      if (i === 5) {     let current = 'assets/poster-stone.jpg';     const render = n => {       $$('.poster-slice').forEach((el, j) => el.classList.toggle('landed', j >= 6 - n));$('#poster-progress').value = n;
      $('#poster-count').textContent = String(n).padStart(2, '0') + ' / 06';
    };
    
    const stop = () => {
      clearInterval(posterTimer);
      posterTimer = null;
      $('#poster-play').textContent = '모션 재생';
    };
    
    const play = () => {
      stop();
      let n = 0;
      render(0);
      $('#poster-play').textContent = '일시정지';
      posterTimer = setInterval(() => {
        render(++n);
        if (n >= 6) stop();
      }, reduced ? 150 : 600);
    };
    
    $('#poster-progress').oninput = e => {
      stop();
      render(+e.target.value);
    };
    
    $('#poster-play').onclick = () => posterTimer ? stop() : play();
    
    $('#poster-switch').onclick = () => {       current = current.includes('stone') ? 'assets/poster-type.jpg' : 'assets/poster-stone.jpg';       $$('.poster-slice').forEach(el => el.style.backgroundImage = `url('${current}')`);
      $('[data-poster]').dataset.poster = current;
      $('#poster-switch').textContent = current.includes('stone') ? '타이포 포스터로' : '돌 포스터로';
      play();
    };
    
    $('[data-poster]').onclick = () => {$('.zoom img').src = current;
      $('.zoom').classList.add('open');
      portal.inert = true;
      $('#close-zoom').focus();     };     play();   }      if (i === 7) {     $$('[data-student]').forEach(b => b.onclick = () => {
      const r = studentRecords[+b.dataset.student];
      const dialog = $('#student-modal');
      dialog.innerHTML = `<button class="control detail-close" autofocus>닫기 ×</button>
        <h3 id="student-modal-title">${escapeHtml(r.name)}</h3>
        <p>${escapeHtml(r.project)}</p>
        <p><strong>매체</strong> · ${escapeHtml(r.medium || r.category || '매체 정보 준비 중')}</p>
        <img src="${escapeHtml(r.image || r.thumbnail)}" alt="${escapeHtml(r.project)}">
        <p>${escapeHtml(r.description)}</p>`;
      $('.detail-close').onclick = () => dialog.close();       dialog.showModal();     });   }      if (i === 9) {     const goods = exhibitionData.goods.length ? exhibitionData.goods : [       { description: '포스터 원본을 사용하는 인쇄물 구성 시안입니다. 실제 사양은 준비 중입니다.' },       { description: '돌 포스터의 그래픽을 사용하는 인쇄물 구성 시안입니다. 실제 사양은 준비 중입니다.' },       { description: '전시 그래픽을 사용하는 카드 구성 시안입니다. 실제 사양은 준비 중입니다.' }     ];          $$('[data-good]').forEach(b => b.onclick = () => {
      const el = $('.goods-info');
      el.textContent = goods[+b.dataset.good].description;
      el.animate(reduced ? [] : [{opacity: 0, transform: 'translateY(45px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 500, fill: 'both'});
    });
  }
  
  if (i === 11) {
    wirePuzzle();
  }
  
  revealLayers();
}

function wirePuzzle() {
  const words = ['MAKE', 'LAYER', 'ACCUMULATION'];
  const hints = ['생각을 형태로 만드는 행위.', '하나씩 쌓이는 층.', '이번 전시의 영문 콘셉트.'];
  let round = 0, chosen = [], tiles = [], completed = [];
  let solved = false;
  
  const render = () => {
    const target = words[round];
    $('#puzzle-hint').innerHTML = `<span class="title-en">${round + 1} / 3</span> — ${hints[round]}`;
    
    $('.puzzle-target').innerHTML = [...target].map((_, j) => 
      `<span class="puzzle-slot title-en">${chosen[j] === undefined ? '' : tiles[chosen[j]]}</span>`
    ).join('');
    
    $('.puzzle-bank').innerHTML = tiles.map((c, j) => 
      `<button class="puzzle-letter title-en" data-tile="${j}" aria-label="${c} 알파벳 선택" ${chosen.includes(j) || solved ? 'disabled' : ''}>${c}</button>`
    ).join('');
    
    $$('[data-tile]').forEach(b => b.onclick = () => {
      if (chosen.length >= target.length) return;
      chosen.push(+b.dataset.tile);
      $('#puzzle-result').textContent = '';
      render();
    });
    
    $('.completed-words').innerHTML = completed.map(w => `<div>${w}</div>`).join('');
    $('#puzzle-check').textContent = solved ? (round === 2 ? '모든 단어 완성' : '다음 단어 쌓기') : '단어 확인';
    $('#puzzle-check').disabled = solved && round === 2;
    $('#puzzle-undo').disabled = solved || chosen.length === 0;
  };
  
  const shuffle = () => {
    tiles = [...words[round]];
    for (let j = tiles.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [tiles[j], tiles[k]] = [tiles[k], tiles[j]];
    }
    chosen = [];
    solved = false;
    render();
  };
  
  $('#puzzle-check').onclick = () => {
    if (solved) {
      round++;
      $('#puzzle-result').textContent = '';
      shuffle();
      return;
    }
    
    if (chosen.map(j => tiles[j]).join('') === words[round]) {
      solved = true;
      completed.push(words[round]);
      $('#puzzle-result').textContent = round === 2 ? '세 개의 단어를 모두 쌓았습니다. 당신의 다음은 무엇인가요?' : '완성! 한 층이 더 쌓였습니다.';
      render();
    } else {
      $('#puzzle-result').textContent = '아직 완성되지 않았습니다. 한 글자씩 다시 살펴보세요.';
    }
  };
  
  $('#puzzle-undo').onclick = () => {
    chosen.pop();
    $('#puzzle-result').textContent = '';
    render();
  };
  
  $('#puzzle-reset').onclick = () => {
    round = 0;
    completed = [];
    $('#puzzle-result').textContent = '';
    shuffle();
  };
  
  shuffle();
}

const initial = names.findIndex(n => '#' + n.toLowerCase() === location.hash);
if (initial >= 0) openSection(initial, false);
// Connect the chapter controls supplied in the HTML.
const chapterIndex = $('#chapter-index');
function navigateChapter(index) {
  chapterIndex.close();
  if (active >= 0) closeSection(false);
  openSection((index + names.length) % names.length);
}
$('#chapter-prev').onclick = () => navigateChapter(active - 1);
$('#chapter-next').onclick = () => navigateChapter(active + 1);
$('#chapter-index-list').innerHTML = names.map((name,i) => `<button class="control" data-chapter="${i}">${String(i+1).padStart(2,'0')} / ${korean[i]} · ${name}</button>`).join('');
$$('[data-chapter]').forEach(button => button.onclick = () => navigateChapter(+button.dataset.chapter));
$('#chapter-index-toggle').onclick = () => { chapterIndex.showModal(); $('#chapter-index-toggle').setAttribute('aria-expanded','true'); };
$('#chapter-index-close').onclick = () => chapterIndex.close();
chapterIndex.addEventListener('close', () => $('#chapter-index-toggle').setAttribute('aria-expanded','false'));
