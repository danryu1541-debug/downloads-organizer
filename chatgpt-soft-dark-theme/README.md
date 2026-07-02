# ChatGPT Soft Dark Theme

ChatGPT 웹사이트(`https://chatgpt.com/*`)에서만 작동하는 Manifest V3 기반 Chrome 확장프로그램입니다. 기본 다크모드보다 부드러운 짙은 회색 계열을 사용하고, 팝업에서 테마 ON/OFF, 프리셋, Intensity 값을 조정할 수 있습니다.

## 기능

- `chatgpt.com/*`에서만 동작
- Manifest V3 사용
- content script로 `styles.css` 주입
- 팝업에서 테마 ON/OFF 전환
- 프리셋 5개 제공
  - `Deep Dark`: 가장 어두운 다크 테마
  - `Soft Dark`: 기본 추천 테마
  - `Light Dark`: 가장 밝은 다크 테마
  - `Warm Dark`: 따뜻한 색감의 다크 테마
  - `Gray Dark`: 중립적인 회색 계열 테마
- `Intensity` 슬라이더 제공
  - 범위: `0`부터 `100`
  - 기본값: `50`
  - 낮을수록 더 어둡게, 높을수록 더 밝게 표시
  - 다크 테마 느낌이 사라지지 않도록 보정 폭 제한
- 설정값을 `chrome.storage.local`에 저장
- 새로고침, 새 대화 이동, 사이드바 열고 닫기 후에도 스타일 유지
- 순수 HTML/CSS/JavaScript만 사용

## 파일 구조

```text
chatgpt-soft-dark-theme/
├─ manifest.json
├─ content.js
├─ styles.css
├─ popup.html
├─ popup.js
└─ README.md
```

## 설치 방법

1. Chrome 브라우저를 엽니다.
2. 주소창에 `chrome://extensions`를 입력하고 이동합니다.
3. 오른쪽 위의 `개발자 모드` 스위치를 켭니다.
4. `압축해제된 확장 프로그램을 로드` 버튼을 누릅니다.
5. 아래 폴더를 선택합니다.

   ```text
   C:\Users\znow1\OneDrive\바탕 화면\코덱스저장소\chatgpt-soft-dark-theme
   ```

6. 확장 프로그램 목록에 `ChatGPT Soft Dark Theme`가 보이면 설치가 완료된 것입니다.
7. `https://chatgpt.com`에 접속하거나 이미 열려 있던 ChatGPT 탭을 새로고침합니다.

## 사용 방법

1. Chrome 오른쪽 위의 확장 프로그램 아이콘을 누릅니다.
2. `ChatGPT Soft Dark Theme`를 선택합니다.
3. `테마 사용` 스위치로 ON/OFF를 전환합니다.
4. `Deep Dark`, `Soft Dark`, `Light Dark`, `Warm Dark`, `Gray Dark` 중 원하는 프리셋을 선택합니다.
5. 필요하면 `Intensity` 슬라이더로 선택한 프리셋을 조금 더 어둡게 또는 밝게 보정합니다.

설정은 자동으로 저장되며 ChatGPT 페이지를 새로고침해도 유지됩니다.

## ON/OFF 설명

- ON: ChatGPT 페이지에 커스텀 다크 테마가 적용됩니다.
- OFF: HTML 루트의 테마 속성과 Intensity CSS 변수가 제거되어 커스텀 스타일이 비활성화됩니다.
- 이 확장프로그램은 manifest 설정상 `https://chatgpt.com/*`에서만 실행됩니다.

## 프리셋 설명

- `Deep Dark`: 가장 어두운 프리셋입니다. 검은색에 가까운 배경을 쓰되 완전한 검정은 피합니다.
- `Soft Dark`: 기본값입니다. 본문 글자색과 구분선 대비를 낮춘 부드러운 짙은 회색 테마입니다.
- `Light Dark`: 가장 밝은 다크 프리셋입니다. 라이트모드처럼 밝아지지 않으면서 UI 구분이 잘 보이도록 합니다.
- `Warm Dark`: 갈색이 섞인 따뜻한 회색 계층을 사용합니다.
- `Gray Dark`: 중립적인 회색 계층을 사용합니다.

## Intensity 슬라이더

- `Intensity: 50`이 기본값입니다.
- `0`에 가까울수록 전체 테마가 더 어두워집니다.
- `100`에 가까울수록 전체 테마가 더 밝아집니다.
- 프리셋 자체를 바꾸는 것이 아니라, 선택된 프리셋 안에서 밝기 보정값을 추가하는 방식입니다.
- 너무 밝아져서 다크 테마가 깨지지 않도록 보정 범위를 제한했습니다.

## 적용이 안 될 때 확인할 것

- ChatGPT 탭을 새로고침하세요.
- Chrome 확장 프로그램 목록에서 이 확장프로그램이 켜져 있는지 확인하세요.
- 주소가 `https://chatgpt.com/`으로 시작하는지 확인하세요.
- 팝업에서 `테마 사용`이 ON인지 확인하세요.
- 확장 프로그램 파일을 수정했다면 `chrome://extensions`에서 확장 프로그램을 새로고침해야 합니다.

## 개발자 모드에서 새로고침하는 방법

1. 주소창에 `chrome://extensions`를 입력합니다.
2. `개발자 모드`가 켜져 있는지 확인합니다.
3. `ChatGPT Soft Dark Theme` 카드에서 새로고침 아이콘을 누릅니다.
4. ChatGPT 탭으로 돌아가 페이지를 새로고침합니다.

## 수정 팁

- 색상을 바꾸고 싶으면 `styles.css`의 `--cgpt-*` CSS 변수를 수정하면 됩니다.
- `content.js`는 HTML 루트 요소에 테마 속성과 Intensity CSS 변수를 붙입니다.
- ChatGPT의 내부 클래스명은 자주 바뀔 수 있으므로 이 확장프로그램은 난수형 클래스명보다 CSS 변수, `main`, `aside`, `nav`, `role`, `data-testid` 같은 비교적 안정적인 선택자를 우선 사용합니다.
