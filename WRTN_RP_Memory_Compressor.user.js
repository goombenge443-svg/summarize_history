// ==UserScript==
// @name        WRTN RP Memory Compressor
// @namespace   wrtn-memory-helper
// @version     1.1
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

* 각 장기기억은 반드시 개별 코드블럭으로 출력
* 코드블럭 하나 = 장기기억 하나
* 제목 포함
* 제목 최대 20자
* 제목 권장 17자 내외
* 본문 최대 300자
* 본문 권장 270~300자
* 가능한 한 정보를 꽉 채워 보존

---

## 출력 형식

제목

🔸 사건 요약 제목

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

recentBtn.textContent =
  '📌 최신 압축 복사';

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
  '압축할 기억까지 메모리를 스크롤 내려주세요';

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

  const n = Number(
    prompt(
      '최근 몇 개의 기억을 압축할까요?',
      '20'
    )
  );

  if (!n || n <= 0) {
    return;
  }

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
    r => setTimeout(r,4000)
  );

  const memories = [
    ...document.querySelectorAll(
      '[role="region"] .pb-4.pt-0'
    )
  ];

  const selected =
    memories.slice(
      0,
      n
    );

  const text =
    selected
      .map(
        x => x.innerText
      )
      .join(
        '\n\n- - -\n\n'
      );

  const output =

`===== 장기기억 =====

${text}

===== 압축 지침 =====

${COMPRESS_RULE}`;

  try {

    await navigator.clipboard
      .writeText(output);

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

  alert(

`✅ 최근 ${selected.length}개 복사 완료`

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
