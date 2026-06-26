// ==UserScript==
// @name        WRTN RP Memory Compressor
// @namespace   wrtn-memory-helper
// @version     2.0
// @author      게으른굼벵이
// @description 장기기억 압축 복사 및 추가 전용 자동 저장 도우미
// @match       *://*.wrtn.ai/*
// @grant       none
// ==/UserScript==

(function () {
  'use strict';

  // 🌟 [네트워크 모니터링] API 요청 시 사용되는 인증 및 플랫폼 헤더 참조
  window._wrtn_request_headers = {};

  // 1. XMLHttpRequest 모니터링 (Axios 통신 대응 및 확장 헤더 수집)
  const origSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    const lowerHeader = header.toLowerCase();

    // Authorization 헤더 수집
    if (lowerHeader === 'authorization' && typeof value === 'string' && value.includes('Bearer ')) {
      window._wrtn_request_headers['Authorization'] = value.trim();
    }
    // 401/403 대비용 추가 플랫폼 헤더 수집
    else if (['x-wrtn-id', 'platform', 'wrtn-locale', 'mixpanel-distinct-id'].includes(lowerHeader)) {
      window._wrtn_request_headers[header] = value;
    }

    return origSetRequestHeader.apply(this, arguments);
  };

  // 2. Fetch API 모니터링 (예비용)
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const opts = args[1];
    if (opts && opts.headers) {
      const iterateHeaders = (key, val) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'authorization' && typeof val === 'string' && val.includes('Bearer ')) {
          window._wrtn_request_headers['Authorization'] = val.trim();
        } else if (['x-wrtn-id', 'platform', 'wrtn-locale', 'mixpanel-distinct-id'].includes(lowerKey)) {
          window._wrtn_request_headers[key] = val;
        }
      };

      if (opts.headers instanceof Headers) {
        opts.headers.forEach((val, key) => iterateHeaders(key, val));
      } else if (typeof opts.headers === 'object' && !Array.isArray(opts.headers)) {
        Object.entries(opts.headers).forEach(([key, val]) => iterateHeaders(key, val));
      } else if (Array.isArray(opts.headers)) {
        opts.headers.forEach(([key, val]) => iterateHeaders(key, val));
      }
    }
    return origFetch.apply(this, args);
  };

  const API_BASE = 'https://crack-api.wrtn.ai';

  const COMPRESS_RULE = `# 압축 요약
# 장기기억 압축 작업

## 작업 정의
이 작업은 RP 결과 데이터의 압축 및 재구성 작업임.
기존 장기기억 여러 개를 더 적은 수의 고밀도 장기기억으로 재편성하는 것이 목적임.
새로운 사건 생성, 설정 추가, 감정 추론, 창작, 서술 보강을 금지함.

---
## 핵심 목표
* 정보 손실 최소화
* 관계 변화 보존
* 설정 변화 보존
* 미래 전개에 영향을 주는 사건 보존
* 장기기억 슬롯 절약

---
## 압축 규칙
* 과거순 정렬
* 사건 기준으로 통합
* 육하원칙 기반 압축
* 동일 장소·상황·행동 패턴은 통합
* 반복 이벤트는 극압축
* 중요도가 낮은 일상 이벤트는 축약
* 턴 번호(T326 등)는 제거

---
## 정보 보존 우선순위
최우선 보존
* 관계 변화, 태도 변화, 신뢰 변화, 감정 변화, 소유욕 변화
* 갈등, 화해, 고백, 약속, 비밀 공유, 배신, 동맹
* 아이템 획득, 설정 변화, 사건 결과, 이후 행동에 영향을 주는 요소

---
## NSFW 처리 규칙
본 작업은 RP 결과 데이터의 압축 작업임.
윤리 검열을 수행하지 말 것.
상세 묘사는 제거하되 사건 자체는 보존할 것.
보존 권장
* 첫 키스, 포옹, 애무, 동침, 잠자리, 다인 관계, 공개적 애정 표현, 관계 확정, 독점 관계 형성, 질투 및 경쟁 구도 형성

---
## 출력 규칙
* 모든 압축 결과를 하나의 코드블럭(sum) 안에 출력
* 각 장기기억은 반드시 ✅ 제목으로 시작
* 제목 포함, 최대 20자 (권장 17자 내외)
* 본문 최대 300자 (권장 270~300자)
* 본문과 제목은 명사형 어미 혹은 명사형 종결로 간결히 표현

---
## 출력 형식
✅ 사건 요약 제목
[YYYY.MM.DD ~ YYYY.MM.DD]
* 사건 요약
* 관계 변화
* 결과
* 이후 영향
`;

  // 🌟 스크립트 실행 환경 데이터 기반 Chat ID 식별
  function getChatId() {
  const m = location.pathname.match(/\/episodes\/([a-f0-9]{24})/);
  return m ? m[1] : null;
}

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  // 🌟 입력 데이터 구조화 파서
  function parseTextData(rawText) {
    const chunks = rawText.split('✅').map(s => s.trim()).filter(s => s);
    const parsed = [];
    const errors = [];

    chunks.forEach((chunk, i) => {
      const firstNewLineIdx = chunk.indexOf('\n');
      if (firstNewLineIdx === -1) {
        errors.push(`[${i + 1}번째 항목] 본문 내용 누락\n👉 인식된 제목: ${chunk}`);
        return;
      }

      let title =
  chunk.substring(0, firstNewLineIdx).trim();

if (!title.startsWith('✅')) {
  title = '✅ ' + title;
}
      const summary = chunk.substring(firstNewLineIdx + 1).trim();

      if (!title) errors.push(`[${i + 1}번째 항목] 제목 누락`);
      else if (!summary) errors.push(`[${i + 1}번째 항목] 본문 누락\n👉 인식된 제목: ${title}`);
      else parsed.push({ title, summary });
    });

    return { parsed, errors, totalChunks: chunks.length };
  }

  function preventEventBubbling(element) {
    const blockEvent = (e) => e.stopPropagation();
    element.addEventListener('mousedown', blockEvent);
    element.addEventListener('touchstart', blockEvent);
    element.addEventListener('click', blockEvent);
    element.addEventListener('keydown', blockEvent);
    element.addEventListener('focusin', blockEvent);
  }

  function showPreviewModal(memories) {
    return new Promise((resolve) => {
      const bg = document.createElement('div');
      bg.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.65); z-index:9999999; display:flex; justify-content:center; align-items:center; pointer-events:auto;';
      preventEventBubbling(bg);

      const modal = document.createElement('div');
      modal.style.cssText = 'background:#1e1e1e; color:#e5e7eb; width:500px; max-height:80vh; border-radius:12px; display:flex; flex-direction:column; box-shadow:0 10px 25px rgba(0,0,0,0.5); font-family:sans-serif; pointer-events:auto;';

      const header = document.createElement('div');
      header.innerHTML = `<h3 style="margin:0; padding:16px; border-bottom:1px solid #374151; text-align:center; color:#fff;">📥 신규 기억 생성 확인 (안전 모드)</h3>`;

      const body = document.createElement('div');
      body.style.cssText = 'padding:16px; overflow-y:auto; flex:1;';

      let html = `<div style="text-align:center; margin-bottom:16px; font-size:14px; color:#9ca3af;">
        기존 기억은 수정되거나 삭제되지 않으며,<br/>새로운 항목으로 추가 생성만 진행됩니다.
      </div>
      <div style="text-align:center; margin-bottom:16px; font-size:16px;">
        <span style="color:#4ade80; font-weight:bold;">신규 생성 예정: ${memories.length}개</span>
      </div>`;

      memories.forEach((m, i) => {
        html += `
          <div style="background:#374151; padding:12px; border-radius:8px; margin-bottom:8px;">
            <div style="color:#60a5fa; font-weight:bold; margin-bottom:4px;">${i + 1}. ${m.title}</div>
            <div style="font-size:13px; color:#9ca3af; line-height:1.4; white-space:pre-wrap;">${m.summary.length > 70 ? m.summary.substring(0, 70) + '...' : m.summary}</div>
          </div>
        `;
      });
      body.innerHTML = html;

      const footer = document.createElement('div');
      footer.style.cssText = 'padding:16px; border-top:1px solid #374151; display:flex; justify-content:flex-end; gap:8px;';

      const btnCancel = document.createElement('button');
      btnCancel.textContent = '취소';
      btnCancel.style.cssText = 'padding:8px 16px; border-radius:6px; border:none; background:#4b5563; color:#fff; cursor:pointer; font-weight:bold;';
      btnCancel.onclick = () => { document.body.removeChild(bg); resolve(false); };

      const btnConfirm = document.createElement('button');
      btnConfirm.textContent = '확인 (생성 시작)';
      btnConfirm.style.cssText = 'padding:8px 16px; border-radius:6px; border:none; background:#16a34a; color:#fff; cursor:pointer; font-weight:bold;';
      btnConfirm.onclick = () => { document.body.removeChild(bg); resolve(true); };

      footer.appendChild(btnCancel);
      footer.appendChild(btnConfirm);

      modal.appendChild(header);
      modal.appendChild(body);
      modal.appendChild(footer);
      bg.appendChild(modal);
      document.body.appendChild(bg);
    });
  }

  function createButton() {
    if (document.getElementById('wrtn-memory-copy')) return;

    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const dialog = dialogs.find(d => d.innerText.includes('장기 기억'));
    const txt = dialog?.innerText || '';
    if (!dialog) return;

    const match = txt.match(/총\s*(\d+)개/);
    const count = match ? Number(match[1]) : 0;

    function getHealth(count) {
      if (count >= 50) return '🔴';
      if (count >= 30) return '🟠';
      if (count >= 20) return '🟡';
      return '🟢';
    }

    const health = getHealth(count);
    const btn = document.createElement('button');
    btn.id = 'wrtn-memory-copy';

    const recentBtn = document.createElement('button');
    recentBtn.id = 'wrtn-memory-recent';

    const noteBtn = document.createElement('button');

    noteBtn.textContent = '📝 메모장';
    noteBtn.style.cssText = `
      width: 180px; padding: 10px 16px; border-radius: 999px; border: none; cursor: pointer;
      background: #3b82f6; color: white; font-weight: bold; display:flex; justify-content:center; align-items:center; gap:4px;
    `;

    recentBtn.textContent = '🎯 선택 압축';
    recentBtn.style.cssText = `
      width: 180px; padding: 10px 16px; border-radius: 999px; border: none; cursor: pointer;
      background: #eab308; color: black; font-weight: bold; display:flex; justify-content:center; align-items:center; gap:4px;
    `;

    btn.textContent = `🧠 전체 압축 복사 ${health}${count}`;
    btn.style.cssText = `
      width: 180px; position: sticky; bottom: 10px; display: block; margin: 12px auto; padding: 10px 16px; border-radius: 999px;
      border: none; cursor: pointer; background: #16a34a; color: white; font-weight: bold; z-index: 99999;
      white-space: nowrap; display:flex; justify-content:center; align-items:center; gap:4px;
    `;

    const notice = document.createElement('div');
    notice.textContent = '압축 전, 장기기억 메모리에서 스크롤을 내려주세요';
    notice.style.cssText = `text-align:center; font-size:11px; color:#888; margin-top:4px;`;

    btn.onclick = async () => {
      try {
        const accordions = [...document.querySelectorAll('h3 > button[aria-expanded]')];
        accordions.forEach(btn => { if (btn.getAttribute('aria-expanded') === 'false') btn.click(); });
        await new Promise(r => setTimeout(r, 1500));

        const memories = [...document.querySelectorAll('[role="region"] .pb-4.pt-0')];
        const text = memories.map(x => x.innerText).join('\n\n- - -\n\n');
        const output = `===== 장기기억 =====\n\n${text}\n\n===== 압축 지침 =====\n\n${COMPRESS_RULE}`;

        try {
          await navigator.clipboard.writeText(output);
        } catch(e) {
          const textarea = document.createElement('textarea');
          textarea.value = output;
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
        }
        alert(`✅ 복사 완료\n\n장기기억 ${memories.length}개\n\n외부 LLM에 붙여넣어 주세요.`);
      } catch (error) {
        console.error(error);
        alert(`오류 발생\n\nF12 콘솔 확인`);
      }
    };

    recentBtn.onclick = async () => {
      const accordions = [...document.querySelectorAll('h3 > button[aria-expanded]')];
      accordions.forEach(btn => { if (btn.getAttribute('aria-expanded') === 'false') btn.click(); });
      await new Promise(r => setTimeout(r, 4000));

      const memories = [...document.querySelectorAll('[role="region"] .pb-4.pt-0')];

      const modal = document.createElement('div');
      modal.style.cssText = `position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:999999; display:flex; justify-content:center; align-items:center;`;
      preventEventBubbling(modal);

      const box = document.createElement('div');
      box.style.cssText = `width:700px; max-width:90vw; height:80vh; background:#1e1e1e; border-radius:12px; display:flex; flex-direction:column; overflow:hidden;`;

      const title = document.createElement('div');
      title.textContent = '🎯 압축할 기억 선택';
      title.style.cssText = `padding:14px; font-weight:bold; color:white; border-bottom:1px solid #374151;`;

      const list = document.createElement('div');
      list.style.cssText = `flex:1; overflow:auto; padding:10px;`;

      const selectedCount = document.createElement('div');
      selectedCount.style.cssText = `padding:8px 12px; color:#9ca3af; font-size:12px;`;

      const checkboxes = [];
      memories.forEach((memory, index) => {
        const titleText = memory.innerText.split('\n')[0].trim();
        const row = document.createElement('label');
        row.style.cssText = `display:flex; gap:8px; padding:8px; color:white; cursor:pointer; border-radius:6px;`;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !titleText.startsWith('✅');
        checkboxes.push({ checkbox, memory });
        row.appendChild(checkbox);
        row.appendChild(document.createTextNode(`${index + 1}. ${titleText}`));
        list.appendChild(row);
      });

      const updateCount = () => { selectedCount.textContent = `선택됨: ${checkboxes.filter(x => x.checkbox.checked).length}개`; };
      checkboxes.forEach(x => x.checkbox.addEventListener('change', updateCount));
      updateCount();

      const footer = document.createElement('div');
      footer.style.cssText = `display:flex; gap:8px; padding:12px; border-top:1px solid #374151;`;

      const selectAll = document.createElement('button'); selectAll.textContent = '전체선택';
      const clearAll = document.createElement('button'); clearAll.textContent = '전체해제';
      const cancelBtn = document.createElement('button'); cancelBtn.textContent = '취소';
      const confirmBtn = document.createElement('button'); confirmBtn.textContent = '선택 압축';

      [selectAll, clearAll, cancelBtn, confirmBtn].forEach(btn => {
        btn.style.cssText = `flex:1; padding:10px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;`;
      });
      selectAll.style.background = '#16a34a'; selectAll.style.color = 'white';
      clearAll.style.background = '#ef4444'; clearAll.style.color = 'white';
      cancelBtn.style.background = '#6b7280'; cancelBtn.style.color = 'white';
      confirmBtn.style.background = '#2563eb'; confirmBtn.style.color = 'white';

      selectAll.onclick = () => { checkboxes.forEach(x => x.checkbox.checked = true); updateCount(); };
      clearAll.onclick = () => { checkboxes.forEach(x => x.checkbox.checked = false); updateCount(); };
      cancelBtn.onclick = () => { modal.remove(); };
      confirmBtn.onclick = async () => {
        const selected = checkboxes.filter(x => x.checkbox.checked).map(x => x.memory);
        if (selected.length === 0) { alert('기억을 선택하세요'); return; }
        const text = selected.map(x => x.innerText).join('\n\n- - -\n\n');
        const output = `===== 장기기억 =====\n\n${text}\n\n===== 압축 지침 =====\n\n${COMPRESS_RULE}`;
        await navigator.clipboard.writeText(output);
        modal.remove();
        alert(`✅ 선택 기억 ${selected.length}개 복사 완료`);
      };

      footer.appendChild(selectAll); footer.appendChild(clearAll); footer.appendChild(cancelBtn); footer.appendChild(confirmBtn);
      box.appendChild(title); box.appendChild(selectedCount); box.appendChild(list); box.appendChild(footer);
      modal.appendChild(box); document.body.appendChild(modal);
    };

    noteBtn.onclick = () => {
      let panel = document.getElementById('wrtn-note-panel');
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        return;
      }

      panel = document.createElement('div');
      panel.id = 'wrtn-note-panel';
      panel.style.cssText = `position: fixed; right: 20px; bottom: 20px; width: 420px; height: 500px; background: #1e1e1e; border: 1px solid #374151; border-radius: 12px; z-index: 999999; display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.4);`;
      preventEventBubbling(panel);

      const header = document.createElement('div');
      header.style.cssText = `padding: 12px; color: white; font-weight: bold; border-bottom: 1px solid #374151; display:flex; justify-content: space-between; align-items:center;`;
      header.innerHTML = `<span>📝 압축 메모장</span>`;

      const minimize = document.createElement('button');
      minimize.textContent = '─';
      minimize.style.cssText = `background:none; border:none; color:white; cursor:pointer; font-size:18px;`;
      header.appendChild(minimize);

      const textarea = document.createElement('textarea');
      textarea.value = localStorage.getItem('wrtn_memory_note') || '';
      textarea.style.cssText = `flex:1; resize:none; border:none; outline:none; padding:12px; background:#111827; color:white; font-size:13px; line-height:1.5;`;

      const footer = document.createElement('div');
      footer.style.cssText = `padding:10px; display:flex; gap:8px; border-top: 1px solid #374151;`;

      const saveBtn = document.createElement('button'); saveBtn.textContent = '저장';
      const loadBtn = document.createElement('button'); loadBtn.textContent = '불러오기';
      const clearBtn = document.createElement('button'); clearBtn.textContent = '비우기';

      const apiPostBtn = document.createElement('button');
      apiPostBtn.innerHTML = '📥 <span style="font-size:11px;">딸깍 저장</span>';

      [saveBtn, loadBtn, clearBtn, apiPostBtn].forEach(btn => {
        btn.style.cssText = `flex:1; padding:8px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;`;
      });

      saveBtn.style.background = '#16a34a'; saveBtn.style.color = 'white';
      loadBtn.style.background = '#2563eb'; loadBtn.style.color = 'white';
      clearBtn.style.background = '#dc2626'; clearBtn.style.color = 'white';
      apiPostBtn.style.background = '#8b5cf6'; apiPostBtn.style.color = 'white';

      saveBtn.onclick = () => { localStorage.setItem('wrtn_memory_note', textarea.value); alert('메모 저장 완료'); };
      loadBtn.onclick = () => { textarea.value = localStorage.getItem('wrtn_memory_note') || ''; };
      clearBtn.onclick = () => { if (confirm('메모를 비울까요?')) { textarea.value = ''; localStorage.removeItem('wrtn_memory_note'); } };
      minimize.onclick = () => { panel.style.display = 'none'; };

      // 🌟 신규 데이터 생성 로직 실행 (스마트 재시도 기능 포함)
      apiPostBtn.onclick = async () => {
        const rawText = textarea.value;
        if (!rawText.trim()) { alert('메모장이 비어있습니다.'); return; }

        const { parsed, errors } = parseTextData(rawText);
        if (errors.length > 0) {
          alert(`❌ 데이터 파싱 실패!\n\n아래 블록의 양식을 수정해주세요 (✅ 제목 후 줄바꿈 필요):\n\n${errors.join('\n\n')}`);
          return;
        }
        if (parsed.length === 0) {
          alert('❌ 인식된 기억이 없습니다. 입력값을 확인해주세요.');
          return;
        }

        const isConfirmed = await showPreviewModal(parsed);
        if (!isConfirmed) return;

        try {
          const chatId = getChatId();
          if (!chatId) { alert('❌ Chat ID를 식별하지 못했습니다. 페이지를 새로고침 해주세요.'); return; }

          if (!window._wrtn_request_headers || !window._wrtn_request_headers['Authorization']) {
            alert('❌ 요청 인증 정보를 찾을 수 없습니다. 장기 기억 창을 한 번 닫았다가 다시 열어주세요.');
            return;
          }

          // 기본적으로 Authorization 헤더만 포함하여 구성
          let currentApiHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Authorization': window._wrtn_request_headers['Authorization']
          };

          apiPostBtn.textContent = '🔄 생성중...';
          apiPostBtn.disabled = true;

          let successCount = 0;

          // 데이터 생성 API 순차 요청
          for (let i = 0; i < parsed.length; i++) {
            const payload = {
              title: parsed[i].title,
              summary: parsed[i].summary,
              type: "longTerm"
            };

            let res = await fetch(`${API_BASE}/crack-gen/v3/chats/${chatId}/summaries`, {
              method: 'POST',
              headers: currentApiHeaders,
              body: JSON.stringify(payload),
              credentials: 'include'
            });

            // 🌟 401/403 에러 감지 시 수집된 확장 헤더를 모두 주입하여 재시도
            if (res.status === 401 || res.status === 403) {
              console.warn(`[인증 에러 감지] Status ${res.status} - 수집된 확장 헤더를 포함하여 재시도합니다.`);

              // 저장해 둔 추가 헤더 병합 (향후 반복문 요청에도 적용됨)
              Object.assign(currentApiHeaders, window._wrtn_request_headers);

              res = await fetch(`${API_BASE}/crack-gen/v3/chats/${chatId}/summaries`, {
                method: 'POST',
                headers: currentApiHeaders,
                body: JSON.stringify(payload),
                credentials: 'include'
              });
            }

            if (res.ok) {
              successCount++;
            } else {
              console.error(`생성 실패 (인덱스 ${i} - Status ${res.status}):`, await res.text());
            }
            await delay(300);
          }

          alert(`🎉 안전 생성 완료!\n\n- 성공적으로 추가된 기억: ${successCount}/${parsed.length}개\n\n올바른 화면 갱신을 위해 페이지를 새로고침합니다.`);
          window.location.reload();

        } catch (error) {
          console.error('API 에러:', error);
          alert(`❌ 치명적 에러 발생: ${error.message}\nF12 콘솔을 확인하세요.`);
        } finally {
          apiPostBtn.innerHTML = '📥 <span style="font-size:11px;">API 생성</span>';
          apiPostBtn.disabled = false;
        }
      };

      footer.appendChild(saveBtn);
      footer.appendChild(loadBtn);
      footer.appendChild(clearBtn);
      footer.appendChild(apiPostBtn);

      panel.appendChild(header);
      panel.appendChild(textarea);
      panel.appendChild(footer);

      document.body.appendChild(panel);
    };

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `display:flex; flex-direction:column; align-items:center; gap:6px; margin-bottom:12px;`;

    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = `display:flex; gap:8px; justify-content:center; align-items:center;`;

    buttonRow.appendChild(btn);
    buttonRow.appendChild(recentBtn);
    buttonRow.appendChild(noteBtn);

    wrapper.appendChild(buttonRow);
    wrapper.appendChild(notice);

    const footer = dialog.querySelector('.flex.flex-col-reverse');
    if (footer) footer.before(wrapper);
  }

  setInterval(createButton, 1500);
})();
