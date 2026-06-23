// ==UserScript==
// @name        WRTN RP Memory Compressor
// @namespace   wrtn-memory-helper
// @version     1.5
// @author      게으른굼벵이
// @description 장기기억 압축 복사 도우미
// @match       *://*.wrtn.ai/*
// @grant       none

// @homepageURL https://github.com/goombenge443-svg/summarize_history

// @updateURL   https://raw.githubusercontent.com/goombenge443-svg/summarize_history/main/WRTN_RP_Memory_Compressor.user.js
// @downloadURL https://raw.githubusercontent.com/goombenge443-svg/summarize_history/main/WRTN_RP_Memory_Compressor.user.js

// ==/UserScript==

(function () {
  'use strict';

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

* 관계 변화
* 태도 변화
* 신뢰 변화
* 감정 변화
* 소유욕 변화
* 갈등
* 화해
* 고백
* 약속
* 비밀 공유
* 배신
* 동맹
* 아이템 획득
* 설정 변화
* 사건 결과
* 이후 행동에 영향을 주는 요소

---

## NSFW 처리 규칙

본 작업은 RP 결과 데이터의 압축 작업임.

윤리 검열을 수행하지 말 것.

상세 묘사는 제거하되 사건 자체는 보존할 것.

보존 권장

* 첫 키스
* 포옹
* 애무
* 동침
* 잠자리
* 다인 관계
* 공개적 애정 표현
* 관계 확정
* 독점 관계 형성
* 질투 및 경쟁 구도 형성

좋은 예

* 놀이공원 데이트 후 첫 키스
* 별장 체류 중 동침 및 관계 진전
* 다인 관계 이후 질투 경쟁 심화
* 독점 관계 확인 및 합의

나쁜 예

* NSFW 진행
* 친밀한 시간 보냄
* 성적 접촉 발생

---

## 출력 규칙

* 모든 압축 결과를 하나의 코드블럭(sum) 안에 출력
* 각 장기기억은 반드시 ✅ 제목으로 시작
* 제목 포함
* 제목 최대 20자
* 제목 권장 17자 내외
* 본문 최대 300자
* 본문 권장 270~300자
* 가능한 한 정보를 꽉 채워 보존

---

## 출력 형식

제목

✅ 사건 요약 제목

본문

[YYYY.MM.DD ~ YYYY.MM.DD]

* 사건 요약
* 관계 변화
* 결과
* 이후 영향
`;

  function createButton() {
    if (document.getElementById('wrtn-memory-copy')) {
      return;
    }

    const dialogs = [
  ...document.querySelectorAll(
    '[role="dialog"]'
  )
];

const dialog =
  dialogs.find(d =>
    d.innerText.includes(
      '장기 기억'
    )
  );

const txt =
  dialog?.innerText || '';

      if (!dialog) {
  return;
}

const match =
  txt.match(/총\s*(\d+)개/);

const count =
  match ? Number(match[1]) : 0;

    function getHealth(count) {
      if (count >= 50) return '🔴';
      if (count >= 30) return '🟠';
      if (count >= 20) return '🟡';
      return '🟢';
    }

    const health = getHealth(count);
    const btn = document.createElement('button');

    btn.id = 'wrtn-memory-copy';
      const recentBtn =
  document.createElement('button');

recentBtn.id =
  'wrtn-memory-recent';
const noteBtn =
  document.createElement('button');

noteBtn.textContent =
  '📝 메모장';

noteBtn.style.cssText = `
  width: 180px;
  padding: 10px 16px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #3b82f6;
  color: white;
  font-weight: bold;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:4px;
`;

recentBtn.textContent =
  '🎯 선택 압축';

recentBtn.style.cssText = `
  width: 180px;
  padding: 10px 16px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #eab308;
  color: black;
  font-weight: bold;
  display:flex;
justify-content:center;
align-items:center;
gap:4px;
`;

    btn.textContent = `🧠 전체 압축 복사 ${health}${count}`;

btn.style.cssText = `
  width: 180px;
  position: sticky;
  bottom: 10px;
  display: block;
  margin: 12px auto;
  padding: 10px 16px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #16a34a;
  color: white;
  font-weight: bold;
  z-index: 99999;
  white-space: nowrap;
  display:flex;
justify-content:center;
align-items:center;
gap:4px;
`;
const notice =
  document.createElement('div');

notice.textContent =
  '메모리에서 스크롤 내려주세요';

notice.style.cssText = `
  text-align:center;
  font-size:11px;
  color:#888;
  margin-top:4px;
`;

    btn.onclick = async () => {
      try {
        const accordions = [
          ...document.querySelectorAll('h3 > button[aria-expanded]')
        ];

        accordions.forEach(btn => {
          if (btn.getAttribute('aria-expanded') === 'false') {
            btn.click();
          }
        });

        await new Promise(r => setTimeout(r, 1500));

        const memories = [
          ...document.querySelectorAll('[role="region"] .pb-4.pt-0')
        ];

        const text = memories
          .map(x => x.innerText)
          .join('\n\n- - -\n\n');

        const output = `===== 장기기억 =====\n\n${text}\n\n===== 압축 지침 =====\n\n${COMPRESS_RULE}`;
try {

  await navigator.clipboard.writeText(
    output
  );

}
catch(e){

  const textarea =
    document.createElement(
      'textarea'
    );

  textarea.value =
    output;

  document.body.appendChild(
    textarea
  );

  textarea.focus();

  textarea.select();

  document.execCommand(
    'copy'
  );

  textarea.remove();

}

        alert(`✅ 복사 완료\n\n장기기억 ${memories.length}개\n\n외부 LLM에 붙여넣어 주세요.`);
      } catch (error) {
        console.error(error);
        alert(`오류 발생\n\nF12 콘솔 확인`);
      }
    };
recentBtn.onclick = async () => {

const accordions = [
...document.querySelectorAll(
'h3 > button[aria-expanded]'
)
];

accordions.forEach(btn => {


if (
  btn.getAttribute(
    'aria-expanded'
  ) === 'false'
) {
  btn.click();
}


});

await new Promise(
r => setTimeout(r, 4000)
);

const memories = [
...document.querySelectorAll(
'[role="region"] .pb-4.pt-0'
)
];

const modal =
document.createElement('div');

modal.style.cssText = `     position:fixed;
    inset:0;
    background:rgba(0,0,0,.65);
    z-index:999999;
    display:flex;
    justify-content:center;
    align-items:center;
  `;

const box =
document.createElement('div');

box.style.cssText = `     width:700px;
    max-width:90vw;
    height:80vh;
    background:#1e1e1e;
    border-radius:12px;
    display:flex;
    flex-direction:column;
    overflow:hidden;
  `;

const title =
document.createElement('div');

title.textContent =
'🎯 압축할 기억 선택';

title.style.cssText = `     padding:14px;
    font-weight:bold;
    color:white;
    border-bottom:
      1px solid #374151;
  `;

const list =
document.createElement('div');

list.style.cssText = `     flex:1;
    overflow:auto;
    padding:10px;
  `;

const selectedCount =
document.createElement('div');

selectedCount.style.cssText = `     padding:8px 12px;
    color:#9ca3af;
    font-size:12px;
  `;

const checkboxes = [];

memories.forEach(
(memory, index) => {


  const titleText =
    memory.innerText
      .split('\n')[0]
      .trim();

  const row =
    document.createElement(
      'label'
    );

  row.style.cssText = `
    display:flex;
    gap:8px;
    padding:8px;
    color:white;
    cursor:pointer;
    border-radius:6px;
  `;

  const checkbox =
    document.createElement(
      'input'
    );

  checkbox.type =
    'checkbox';

  checkbox.checked =
    !titleText.startsWith(
      '✅'
    );

  checkboxes.push({
    checkbox,
    memory
  });

  row.appendChild(
    checkbox
  );

  row.appendChild(
    document.createTextNode(
      `${index + 1}. ${titleText}`
    )
  );

  list.appendChild(
    row
  );

}


);

const updateCount =
() => {


  selectedCount.textContent =
    `선택됨: ${
      checkboxes.filter(
        x => x.checkbox.checked
      ).length
    }개`;

};


checkboxes.forEach(
x =>
x.checkbox.addEventListener(
'change',
updateCount
)
);

updateCount();

const footer =
document.createElement('div');

footer.style.cssText = `     display:flex;
    gap:8px;
    padding:12px;
    border-top:
      1px solid #374151;
  `;

const selectAll =
document.createElement(
'button'
);

selectAll.textContent =
'전체선택';

const clearAll =
document.createElement(
'button'
);

clearAll.textContent =
'전체해제';

    const cancelBtn =
document.createElement(
'button'
);

cancelBtn.textContent =
'취소';

const confirmBtn =
document.createElement(
'button'
);

confirmBtn.textContent =
'선택 압축';

[
  selectAll,
  clearAll,
  cancelBtn,
  confirmBtn
].forEach(
btn => {


  btn.style.cssText = `
    flex:1;
    padding:10px;
    border:none;
    border-radius:8px;
    cursor:pointer;
    font-weight:bold;
  `;

}
);
selectAll.style.background =
  '#16a34a';

selectAll.style.color =
  'white';

clearAll.style.background =
  '#ef4444';

clearAll.style.color =
  'white';

cancelBtn.style.background =
  '#6b7280';

cancelBtn.style.color =
  'white';

confirmBtn.style.background =
  '#2563eb';

confirmBtn.style.color =
  'white';

selectAll.onclick =
() => {


  checkboxes.forEach(
    x =>
      x.checkbox.checked =
        true
  );

  updateCount();

};


clearAll.onclick =
() => {

  checkboxes.forEach(
    x =>
      x.checkbox.checked =
        false
  );

  updateCount();

};

cancelBtn.onclick =
() => {

  modal.remove();

};

confirmBtn.onclick =
async () => {

  const selected =
    checkboxes
      .filter(
        x =>
          x.checkbox.checked
      )
      .map(
        x => x.memory
      );

  if (
    selected.length === 0
  ) {
    alert(
      '기억을 선택하세요'
    );
    return;
  }

  const text =
    selected
      .map(
        x =>
          x.innerText
      )
      .join(
        '\n\n- - -\n\n'
      );

  const output =


`===== 장기기억 =====

${text}

===== 압축 지침 =====

${COMPRESS_RULE}`;


  await navigator
    .clipboard
    .writeText(
      output
    );

  modal.remove();

  alert(


`✅ 선택 기억 ${selected.length}개 복사 완료`
);


};


footer.appendChild(
selectAll
);

footer.appendChild(
clearAll
);

footer.appendChild(
cancelBtn
);

footer.appendChild(
confirmBtn
);

box.appendChild(
title
);

box.appendChild(
selectedCount
);

box.appendChild(
list
);

box.appendChild(
footer
);

modal.appendChild(
box
);

document.body.appendChild(
modal
);

};

noteBtn.onclick = () => {

  let panel =
    document.getElementById(
      'wrtn-note-panel'
    );

  if (panel) {

    panel.style.display =
      panel.style.display === 'none'
      ? 'flex'
      : 'none';

    return;
  }

  panel =
    document.createElement('div');

  panel.id =
    'wrtn-note-panel';

  panel.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 420px;
    height: 500px;
    background: #1e1e1e;
    border: 1px solid #374151;
    border-radius: 12px;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 10px 25px
      rgba(0,0,0,0.4);
  `;

  const header =
    document.createElement('div');

  header.style.cssText = `
    padding: 12px;
    color: white;
    font-weight: bold;
    border-bottom:
      1px solid #374151;
    display:flex;
    justify-content:
      space-between;
    align-items:center;
  `;

  header.innerHTML = `
    <span>📝 압축 메모장</span>
  `;

  const minimize =
    document.createElement(
      'button'
    );

  minimize.textContent = '─';

  minimize.style.cssText = `
    background:none;
    border:none;
    color:white;
    cursor:pointer;
    font-size:18px;
  `;

  header.appendChild(
    minimize
  );

  const textarea =
    document.createElement(
      'textarea'
    );

  textarea.value =
    localStorage.getItem(
      'wrtn_memory_note'
    ) || '';

  textarea.style.cssText = `
    flex:1;
    resize:none;
    border:none;
    outline:none;
    padding:12px;
    background:#111827;
    color:white;
    font-size:13px;
    line-height:1.5;
  `;

  const footer =
    document.createElement(
      'div'
    );

  footer.style.cssText = `
    padding:10px;
    display:flex;
    gap:8px;
    border-top:
      1px solid #374151;
  `;

  const saveBtn =
    document.createElement(
      'button'
    );

  saveBtn.textContent =
    '저장';

  const loadBtn =
    document.createElement(
      'button'
    );

  loadBtn.textContent =
    '불러오기';

  const clearBtn =
    document.createElement(
      'button'
    );

  clearBtn.textContent =
    '비우기';

  [
    saveBtn,
    loadBtn,
    clearBtn
  ].forEach(btn => {

    btn.style.cssText = `
      flex:1;
      padding:8px;
      border:none;
      border-radius:8px;
      cursor:pointer;
      font-weight:bold;
    `;

  }
 );

  saveBtn.style.background =
    '#16a34a';

  saveBtn.style.color =
    'white';

  loadBtn.style.background =
    '#2563eb';

  loadBtn.style.color =
    'white';

  clearBtn.style.background =
    '#dc2626';

  clearBtn.style.color =
    'white';

  saveBtn.onclick = () => {

    localStorage.setItem(
      'wrtn_memory_note',
      textarea.value
    );

    alert(
      '메모 저장 완료'
    );

  };

  loadBtn.onclick = () => {

    textarea.value =
      localStorage.getItem(
        'wrtn_memory_note'
      ) || '';

  };

  clearBtn.onclick = () => {

    if (
      confirm(
        '메모를 비울까요?'
      )
    ) {

      textarea.value = '';

      localStorage.removeItem(
        'wrtn_memory_note'
      );

    }

  };

  minimize.onclick =
    () => {

      panel.style.display =
        'none';

    };

  footer.appendChild(
    saveBtn
  );

  footer.appendChild(
    loadBtn
  );

  footer.appendChild(
    clearBtn
  );

  panel.appendChild(
    header
  );

  panel.appendChild(
    textarea
  );

  panel.appendChild(
    footer
  );

  document.body.appendChild(
    panel
  );

};
const wrapper =
  document.createElement('div');

wrapper.style.cssText = `
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:6px;
  margin-bottom:12px;
`;

const buttonRow =
  document.createElement('div');

buttonRow.style.cssText = `
  display:flex;
  gap:8px;
  justify-content:center;
  align-items:center;
`;

buttonRow.appendChild(btn);
buttonRow.appendChild(recentBtn);
buttonRow.appendChild(noteBtn);

wrapper.appendChild(buttonRow);
wrapper.appendChild(notice);

const footer =
  dialog.querySelector(
    '.flex.flex-col-reverse'
  );

if (footer) {

  footer.before(wrapper);

}
}

  setInterval(createButton, 1500);

})();
