(() => {
  const answers = [
    ['LAYER','층 — 경험 위에 경험을 쌓다.'], ['STACK','축적 — 작은 시도를 하나의 형태로.'],
    ['BUILD','구축 — 생각을 작업으로 만들다.'],
    ['TRACE','흔적 — 지나온 과정이 남긴 선.'], ['DRAFT','초안 — 완성으로 향하는 첫 시도.'],
    ['SHAPE','형태 — 쌓인 생각에 윤곽을 주다.'], ['FRAME','틀 — 새로운 관점을 담다.'],
    ['CRAFT','만듦 — 손과 시간으로 완성하다.'], ['LEARN','배움 — 다음 작업의 바탕.'],
    ['STUDY','탐구 — 질문을 깊이 쌓다.'], ['THINK','사유 — 모든 디자인의 출발점.'],
    ['TRIAL','시도 — 실패도 축적의 일부.'], ['SHIFT','전환 — 익숙한 시선에서 한 걸음.'],
    ['BLOOM','개화 — 축적된 시간이 피어나다.'], ['BRICK','단위 — 하나씩 쌓여 전체가 되다.'],
    ['BLEND','융합 — 서로 다른 경험을 겹치다.'], ['STAGE','단계 — 오늘의 작업이 다음을 열다.'],
    ['PRINT','인쇄 — 생각을 물성으로 남기다.'], ['SPACE','공간 — 우리의 축적이 만나는 곳.'],
    ['FORGE','창조 — 시도와 시간으로 빚어내다.']
  ].filter(([word]) => word.length === 5);
  let game = null, dictionary = null;
  let dictionaryPromise = null;
  const wordListUrl = new URL('word-list.json', document.currentScript.src);
  const loadFallbackWords = () => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('word-list.js', wordListUrl);
    script.onload = () => resolve(window.accumulationWordList);
    script.onerror = reject;
    document.head.append(script);
  });
  const loadDictionary = () => {
    if (!dictionaryPromise) {
      dictionaryPromise = fetch(wordListUrl)
        .then(response => {
          if (!response.ok) throw Error('Word list request failed');
          return response.json();
        })
        .catch(loadFallbackWords)
        .then(words => {
          if (!Array.isArray(words)) throw Error('Word list is invalid');
          dictionary = new Set([...words, ...answers.map(([word]) => word)]);
        });
    }
    return dictionaryPromise;
  };
  const score = (guess, answer) => {
    const result = Array(5).fill('absent'), remaining = {};
    for (let i=0;i<5;i++) {
      if (guess[i] === answer[i]) result[i] = 'exact';
      else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
    }
    for (let i=0;i<5;i++) if (result[i] !== 'exact' && remaining[guess[i]] > 0) {
      result[i] = 'present'; remaining[guess[i]]--;
    }
    return result;
  };
  window.initAccumulationWordle = () => {
    window.wordleController?.abort();
    const controller = new AbortController(); window.wordleController = controller;
    const $ = s => document.querySelector(s);
    const animations = new Set();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cancelMotion = () => { animations.forEach(animation => animation.cancel()); animations.clear(); };
    controller.signal.addEventListener('abort', cancelMotion, {once:true});
    const animate = async (element, frames, duration, delay = 0) => {
      if (!element || reducedMotion.matches || controller.signal.aborted) return;
      const animation = element.animate(frames, {duration, delay, easing:'ease-in-out', fill:'backwards'});
      animations.add(animation);
      try { await animation.finished; } catch {} finally { animations.delete(animation); }
    };
    const currentCells = () => [...$('#word-board').querySelectorAll('.word-row.current .word-cell')];
    const message = text => { $('#word-message').textContent = text; };
    const invalid = text => {
      message(text);
      const row = $('#word-board').querySelector('.word-row.current');
      row?.getAnimations().forEach(animation => animation.cancel());
      void animate(row, [0,-5,5,-5,5,-3,3,0].map(x => ({transform:`translateX(${x}px)`})), 420);
    };
    const newGame = () => {
      cancelMotion();
      const choices = answers.filter(x => x[0] !== game?.answer);
      const [answer, meaning] = choices[Math.floor(Math.random()*choices.length)];
      game = {answer,meaning,guesses:[],input:'',done:false,busy:false,hintLevel:0};
    };
    newGame();
    const render = () => {
      $('#word-board').innerHTML = Array.from({length:6},(_,row) => {
        const guess = game.guesses[row], value = guess || (row === game.guesses.length ? game.input : '');
        const states = guess ? score(guess, game.answer) : [];
        return `<div class="word-row ${!game.done && row===game.guesses.length?'current':''}" style="grid-row: ${6-row}" aria-label="${row+1}번째 시도">${Array.from({length:5},(_,i) => {
          const state = states[i] || (value[i] && !guess ? 'filled' : '');
          return `<span class="word-cell ${state}" aria-label="${value[i]||'빈 칸'}${states[i]?', '+({exact:'위치 일치',present:'다른 위치',absent:'없음'}[states[i]]):''}">${value[i]||''}</span>`;
        }).join('')}</div>`;
      }).join('');
      $('#word-progress').textContent = `${String(game.guesses.length).padStart(2, '0')} / 06`;
      [...$('#word-progress-dots').children].forEach((dot, index) => {
        dot.classList.toggle('used', index < game.guesses.length);
        dot.classList.toggle('current', !game.done && index === game.guesses.length);
      });
      const keyboardRanks = {absent:1,present:2,exact:3};
      const keyboardStates = new Map();
      game.guesses.forEach(guess => score(guess, game.answer).forEach((state, index) => {
        const letter = guess[index];
        if (keyboardRanks[state] > (keyboardRanks[keyboardStates.get(letter)] || 0)) keyboardStates.set(letter, state);
      }));
      $('#word-keyboard').querySelectorAll('[data-key]').forEach(key => {
        const state = keyboardStates.get(key.dataset.key.toUpperCase());
        key.classList.remove('exact', 'present', 'absent');
        if (state) key.classList.add(state);
        key.disabled = game.done || game.busy;
      });
    };
    const input = async key => {
      if (game.done || game.busy) return;
      let typed = false;
      if (key === 'Backspace' || key === '⌫') game.input = game.input.slice(0,-1);
      else if (key === 'Enter' || key === '↵') {
        if (game.input.length !== 5) return invalid('영어 다섯 글자를 입력해주세요.');
        if (!dictionary) return invalid('단어 목록을 불러오는 중입니다. 잠시 후 다시 제출해주세요.');
        if (!dictionary.has(game.input)) return invalid('단어 목록에 없는 단어입니다. 다른 영어 단어를 입력해주세요.');
        if (game.guesses.includes(game.input)) return invalid('이미 시도한 단어입니다. 새로운 단어를 입력해주세요.');
        const round = game;
        const cells = currentCells();
        const states = score(game.input, game.answer);
        game.busy = true;
        const alive = () => game === round && !controller.signal.aborted;
        await Promise.all(cells.map(async (cell, i) => {
          cell.getAnimations().forEach(animation => animation.cancel());
          await animate(cell, [{transform:'rotateX(0deg)'},{transform:'rotateX(90deg)'}], 160, i * 180);
          if (!alive()) return;
          cell.classList.remove('filled');
          cell.classList.add(states[i]);
          cell.setAttribute('aria-label', `${round.input[i]}, ${{exact:'위치 일치',present:'다른 위치',absent:'없음'}[states[i]]}`);
          await animate(cell, [{transform:'rotateX(-90deg)'},{transform:'rotateX(0deg)'}], 160);
        }));
        if (!alive()) return;
        const won = game.input === game.answer;
        game.guesses.push(game.input); game.input = '';
        game.done = won || game.guesses.length === 6;
        $('#word-hint-button').disabled = game.done;
        if (game.done) message(`${won ? game.guesses.length+'번의 시도로 완성!' : '여섯 번의 시도가 쌓였습니다.'} ${game.answer} · ${game.meaning}`);
        else message(`${game.guesses.length} / 6 — 단서를 쌓아 다음 단어를 입력하세요.`);
        render();
        if (won) {
          const winningCells = [...$('#word-board').children[game.guesses.length-1].children];
          await Promise.all(winningCells.map((cell,i) => animate(cell, [
            {transform:'translateY(0)'}, {transform:'translateY(-18%)',offset:.35},
            {transform:'translateY(5%)',offset:.65}, {transform:'translateY(-7%)',offset:.82},
            {transform:'translateY(0)'}
          ], 520, i*90)));
        }
        if (alive()) {
          game.busy = false;
          $('#word-keyboard').querySelectorAll('[data-key]').forEach(key => { key.disabled = game.done; });
        }
        return;
      } else if (/^[a-z]$/i.test(key) && game.input.length < 5) { game.input += key.toUpperCase(); typed = true; }
      else return;
      render();
      if (typed) void animate(currentCells()[game.input.length-1], [{transform:'scale(1)'},{transform:'scale(1.09)',offset:.45},{transform:'scale(1)'}], 120);
    };
    $('#word-hint-button').addEventListener('click', () => {
      if (game.done || game.hintLevel >= 2) return;
      game.hintLevel++;
      $('#word-hint').textContent = game.hintLevel === 1
        ? `힌트: ${game.meaning}`
        : `글자 힌트: 정답은 ${game.answer[0]}로 시작합니다.`;
      if (game.hintLevel === 1) $('#word-hint-button').textContent = '글자 힌트 보기';
      else {
        $('#word-hint-button').textContent = '힌트 모두 사용';
        $('#word-hint-button').disabled = true;
      }
    },{signal:controller.signal});
    $('#word-keyboard').addEventListener('click', event => {
      const key = event.target.closest('button[data-key]');
      if (key) void input(key.dataset.key);
    },{signal:controller.signal});
    document.addEventListener('keydown', e => {
      if (!$('#word-board').isConnected||!$('.portal').classList.contains('open')||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.target.matches('input,textarea,[contenteditable=true]')||document.querySelector('dialog[open]')) return;
      if (/^[a-z]$/i.test(e.key)||['Enter','Backspace'].includes(e.key)) { e.preventDefault(); input(e.key); }
    },{signal:controller.signal});
    $('#word-new').onclick = () => {
      newGame();
      render();
      $('#word-hint').textContent = '화면 키보드 또는 영문 키보드로 입력하세요. Enter로 제출하고, Backspace로 지울 수 있어요.';
      $('#word-hint-button').textContent = '힌트 보기';
      $('#word-hint-button').disabled = false;
      message('새로운 단어입니다. 영어 다섯 글자를 입력하세요.');
    };
    render();
    if(game.done) message(`${game.answer} · ${game.meaning}`);
    if (!dictionary) loadDictionary().catch(() => {
      if (!controller.signal.aborted) message('단어 목록을 불러오지 못했습니다. 사이트의 word-list 파일을 확인해주세요.');
    });
  };
})();
