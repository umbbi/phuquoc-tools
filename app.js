const PHU_QUOC_TIMEZONE = 'Asia/Ho_Chi_Minh';
const SEOUL_TIMEZONE = 'Asia/Seoul';
const PHU_QUOC_COORDS = { lat: 10.2899, lon: 103.9840 };

const phraseCards = [
  { ko: '뉴월드 리조트 가주세요', vi: 'Cho tôi đến New World Phu Quoc Resort.' },
  { ko: '카드 되나요?', vi: 'Ở đây có thanh toán bằng thẻ không?' },
  { ko: '현금만 가능한가요?', vi: 'Chỉ thanh toán tiền mặt thôi đúng không?' },
  { ko: '얼마예요?', vi: 'Cái này bao nhiêu tiền?' },
  { ko: '공항 가주세요', vi: 'Cho tôi đến sân bay.' },
  { ko: '물 한 병 주세요', vi: 'Cho tôi một chai nước.' },
  { ko: '화장실 어디예요?', vi: 'Nhà vệ sinh ở đâu?' },
  { ko: '감사합니다', vi: 'Cảm ơn.' },
];

const tips = [
  { title: '공항 이동', body: '푸꾸옥 공항에서 뉴월드 리조트까지 차로 약 20~25분 정도 걸립니다.' },
  { title: '환전', body: '환전소를 찾기보다 공항이나 시내 ATM에서 소액 인출하는 편이 현실적입니다.' },
  { title: '결제', body: '카드 결제 시 원화가 아니라 현지통화 VND로 결제해야 환율이 덜 불리합니다.' },
  { title: '현금', body: '작은 식당·로컬 상점·팁 용도로는 현금이 필요할 수 있어 첫날 쓸 돈은 조금 준비하는 편이 좋습니다.' },
  { title: '날씨', body: '덥고 습하며 짧은 스콜성 비가 올 수 있습니다. 한낮보다 아침·해질녘 이동이 편합니다.' },
];

const state = {
  ratePer100Vnd: 5.64,
  mode: 'vnd-to-krw',
};

const elements = {
  phuQuocTime: document.getElementById('phuQuocTime'),
  phuQuocDate: document.getElementById('phuQuocDate'),
  seoulTime: document.getElementById('seoulTime'),
  seoulDate: document.getElementById('seoulDate'),
  weatherText: document.getElementById('weatherText'),
  rateUpdated: document.getElementById('rateUpdated'),
  vndInput: document.getElementById('vndInput'),
  krwInput: document.getElementById('krwInput'),
  swapBtn: document.getElementById('swapBtn'),
  translateInput: document.getElementById('translateInput'),
  translateBtn: document.getElementById('translateBtn'),
  translatedText: document.getElementById('translatedText'),
  translateStatus: document.getElementById('translateStatus'),
  copyTranslatedBtn: document.getElementById('copyTranslatedBtn'),
  speakTranslatedBtn: document.getElementById('speakTranslatedBtn'),
  quickPhraseList: document.getElementById('quickPhraseList'),
  ttsPlayer: document.getElementById('ttsPlayer'),
  tipsList: document.getElementById('tipsList'),
  rateSummary: document.getElementById('rateSummary'),
  toast: document.getElementById('toast'),
};

function formatTime(date, timeZone) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function formatDate(date, timeZone) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(date);
}

function updateClocks() {
  const now = new Date();
  elements.phuQuocTime.textContent = formatTime(now, PHU_QUOC_TIMEZONE);
  elements.phuQuocDate.textContent = formatDate(now, PHU_QUOC_TIMEZONE);
  elements.seoulTime.textContent = formatTime(now, SEOUL_TIMEZONE);
  elements.seoulDate.textContent = formatDate(now, SEOUL_TIMEZONE);
}

function parseNumber(input) {
  const numeric = String(input).replace(/[^\d.]/g, '');
  return numeric ? Number(numeric) : 0;
}

function formatInteger(value) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(Math.round(value));
}

function updateSummary(vnd, krw) {
  elements.rateSummary.textContent = `${formatInteger(vnd)}동 ≈ ${formatInteger(krw)}원`;
}

function convertFromVnd() {
  const vnd = parseNumber(elements.vndInput.value);
  const krw = (vnd / 100) * state.ratePer100Vnd;
  elements.vndInput.value = formatInteger(vnd);
  elements.krwInput.value = formatInteger(krw);
  updateSummary(vnd, krw);
}

function convertFromKrw() {
  const krw = parseNumber(elements.krwInput.value);
  const vnd = state.ratePer100Vnd === 0 ? 0 : (krw / state.ratePer100Vnd) * 100;
  elements.krwInput.value = formatInteger(krw);
  elements.vndInput.value = formatInteger(vnd);
  updateSummary(vnd, krw);
}

function swapValues() {
  const currentVnd = elements.vndInput.value;
  elements.vndInput.value = elements.krwInput.value;
  elements.krwInput.value = currentVnd;
  if (state.mode === 'vnd-to-krw') {
    state.mode = 'krw-to-vnd';
    convertFromKrw();
  } else {
    state.mode = 'vnd-to-krw';
    convertFromVnd();
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 1600);
}

function setTranslatedText(text) {
  elements.translatedText.textContent = text;
}

function getGoogleTtsUrl(text, language) {
  const params = new URLSearchParams({
    ie: 'UTF-8',
    client: 'tw-ob',
    tl: language,
    q: text,
  });
  return `https://translate.google.com/translate_tts?${params.toString()}`;
}

async function copyTranslatedText() {
  const text = elements.translatedText.textContent.trim();
  if (!text) {
    showToast('복사할 번역문 없음');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast('베트남어 문장 복사됨');
  } catch {
    showToast('복사 실패');
  }
}

function speakWithBrowserTts(text, language) {
  if (!('speechSynthesis' in window)) {
    showToast('이 브라우저는 음성 재생 미지원');
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.92;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  showToast('브라우저 음성 재생 중');
  return true;
}

function playTranslatedSpeech() {
  const text = elements.translatedText.textContent.trim();
  if (!text) {
    showToast('재생할 문장 없음');
    return;
  }

  elements.ttsPlayer.pause();
  elements.ttsPlayer.removeAttribute('src');
  elements.ttsPlayer.load();

  const audioUrl = getGoogleTtsUrl(text, 'vi');
  const fallbackTimer = setTimeout(() => {
    if (elements.ttsPlayer.paused && elements.ttsPlayer.currentTime === 0) {
      speakWithBrowserTts(text, 'vi-VN');
    }
  }, 1200);

  const handleAudioError = () => {
    clearTimeout(fallbackTimer);
    elements.ttsPlayer.removeEventListener('error', handleAudioError);
    speakWithBrowserTts(text, 'vi-VN');
  };

  elements.ttsPlayer.addEventListener('error', handleAudioError, { once: true });
  elements.ttsPlayer.src = audioUrl;
  elements.ttsPlayer.play().then(() => {
    clearTimeout(fallbackTimer);
    showToast('구글 TTS 재생 중');
  }).catch(() => {
    clearTimeout(fallbackTimer);
    speakWithBrowserTts(text, 'vi-VN');
  });
}

async function translateText() {
  const input = elements.translateInput.value.trim();
  if (!input) {
    elements.translateStatus.textContent = '문장을 입력해 주세요';
    setTranslatedText('');
    return;
  }

  elements.translateStatus.textContent = '구글 번역 불러오는 중';

  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'ko',
      tl: 'vi',
      dt: 't',
      q: input,
    });
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
    if (!response.ok) throw new Error('translate fetch failed');
    const data = await response.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map((chunk) => chunk?.[0] || '').join('').trim()
      : '';

    if (!translated) throw new Error('missing translation');

    setTranslatedText(translated);
    elements.translateStatus.textContent = '구글 번역 반영';
  } catch {
    const fallback = phraseCards.find((item) => item.ko === input)?.vi || '번역 실패. 네트워크를 확인해 주세요.';
    setTranslatedText(fallback);
    elements.translateStatus.textContent = fallback.startsWith('번역 실패') ? '번역 실패' : '저장 문장 사용';
  }
}

function renderQuickPhrases() {
  elements.quickPhraseList.innerHTML = phraseCards.map((item, index) => `
    <button class="quick-phrase-chip" data-index="${index}" type="button">${item.ko}</button>
  `).join('');

  elements.quickPhraseList.querySelectorAll('.quick-phrase-chip').forEach((button) => {
    button.addEventListener('click', () => {
      const idx = Number(button.dataset.index);
      const item = phraseCards[idx];
      elements.translateInput.value = item.ko;
      setTranslatedText(item.vi);
      elements.translateStatus.textContent = '저장 문장 불러옴';
    });
  });
}

function renderTips() {
  elements.tipsList.innerHTML = tips.map((tip) => `
    <div class="tip-item">
      <div class="tip-title">${tip.title}</div>
      <div class="tip-body">${tip.body}</div>
    </div>
  `).join('');
}

async function loadWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${PHU_QUOC_COORDS.lat}&longitude=${PHU_QUOC_COORDS.lon}&current=temperature_2m,weather_code&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('weather fetch failed');
    const data = await response.json();
    const temp = data?.current?.temperature_2m;
    const code = data?.current?.weather_code;
    const label = weatherCodeToText(code);
    elements.weatherText.textContent = `${temp}°C · ${label}`;
  } catch {
    elements.weatherText.textContent = '푸꾸옥 더움 · 스콜 가능';
  }
}

function weatherCodeToText(code) {
  const map = {
    0: '맑음', 1: '대체로 맑음', 2: '약간 흐림', 3: '흐림',
    45: '안개', 48: '짙은 안개', 51: '이슬비', 53: '보통 비',
    61: '비', 63: '강한 비', 80: '소나기', 81: '강한 소나기',
    95: '뇌우'
  };
  return map[code] || '덥고 습함';
}

async function loadExchangeRate() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/KRW');
    if (!response.ok) throw new Error('rate fetch failed');
    const data = await response.json();
    const vndPerKrw = data?.rates?.VND;
    if (!vndPerKrw) throw new Error('missing VND rate');
    const krwPerVnd = 1 / vndPerKrw;
    state.ratePer100Vnd = krwPerVnd * 100;
    elements.rateUpdated.textContent = '실시간 환율 반영';
  } catch {
    state.ratePer100Vnd = 5.64;
    elements.rateUpdated.textContent = '기본 환율 사용';
  }
  convertFromVnd();
}

function bindEvents() {
  elements.vndInput.addEventListener('input', () => {
    state.mode = 'vnd-to-krw';
    convertFromVnd();
  });

  elements.krwInput.addEventListener('input', () => {
    state.mode = 'krw-to-vnd';
    convertFromKrw();
  });

  elements.swapBtn.addEventListener('click', swapValues);

  document.querySelectorAll('.amount-chip').forEach((button) => {
    button.addEventListener('click', () => {
      const amount = Number(button.dataset.vnd || '0');
      state.mode = 'vnd-to-krw';
      elements.vndInput.value = String(amount);
      convertFromVnd();
    });
  });

  elements.translateBtn.addEventListener('click', translateText);
  elements.copyTranslatedBtn.addEventListener('click', copyTranslatedText);
  elements.speakTranslatedBtn.addEventListener('click', playTranslatedSpeech);
}

function init() {
  renderQuickPhrases();
  renderTips();
  bindEvents();
  updateClocks();
  setInterval(updateClocks, 1000 * 30);
  loadWeather();
  loadExchangeRate();
  translateText();
}

init();
