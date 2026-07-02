# 만든 프로그램 및 GitHub 정리

정리일: 2026-07-03

## 전체 요약

OBS 방송 보조 도구, 치지직 연동 봇/오버레이, 로컬 유틸리티, Chrome 확장 프로그램을 중심으로 여러 프로그램을 제작했습니다. 특히 방송 화면에 바로 올릴 수 있는 OBS 브라우저 소스형 도구와, 치지직 OpenAPI/OAuth 기반의 채팅 및 후원 이벤트 연동 도구가 많습니다.

## GitHub에 올라간 저장소

| 프로젝트 | GitHub | 한 줄 설명 |
| --- | --- | --- |
| Downloads Organizer | https://github.com/danryu1541-debug/downloads-organizer | Windows 다운로드 폴더를 자동 분류하는 Python 백그라운드 유틸리티 |
| 치지직 CPM 오버레이 | https://github.com/danryu1541-debug/chzzk-cpm-overlay | 치지직 채팅 속도를 CPM으로 계산해 OBS 오버레이로 보여주는 웹앱 |
| 치지직 명령어 채팅봇 | https://github.com/danryu1541-debug/chzzk-chattingbot | 치지직 채팅 명령어에 자동 답변하는 로컬 실행형 봇 |
| CHZZK OpenAPI Chatbot | https://github.com/danryu1541-debug/new-chat-bot | 치지직 공식 OpenAPI 기반 로컬 실행형 채팅봇 |
| 돼지 의상 룰렛 타이머 | https://github.com/danryu1541-debug/pig-timer | 후원 이벤트로 의상별 타이머를 조절하는 OBS 오버레이 |
| 핀볼 벌칙 추첨기 | https://github.com/danryu1541-debug/pinball-penalty | 로컬 HTML로 실행되는 OBS용 핀볼 벌칙 추첨기 |
| 위플랩 룰렛 듀얼 타이머 | https://github.com/danryu1541-debug/weflab-roulette-timer | 위플랩 룰렛 결과를 감지해 OBS 타이머에 반영하는 로컬 도구 |

## 로컬에 정리된 프로젝트

### 1. Downloads Organizer

- 위치: `download_organizer`, 루트 `README.md`, `downloads_organizer.py`, `run_background.pyw`
- GitHub: https://github.com/danryu1541-debug/downloads-organizer
- 종류: Windows 자동 정리 유틸리티
- 기술: Python
- 주요 기능:
  - 다운로드 폴더를 감시해 파일을 종류별 폴더로 자동 이동
  - 이미지, 문서, 압축파일, 설치파일, 영상, 오디오, 기타 파일 분류
  - `.crdownload`, `.part`, `.tmp` 같은 임시 다운로드 파일 제외
  - 파일 크기가 안정화된 뒤 이동해 다운로드 중 파일 이동 방지
  - Windows 시작 프로그램 등록/해제 기능
- 실행 형태:
  - `python .\downloads_organizer.py scan`
  - `python .\downloads_organizer.py run`
  - `pythonw .\run_background.pyw`

### 2. ChatGPT Soft Dark Theme

- 위치: `chatgpt-soft-dark-theme`
- GitHub: 로컬 폴더 기준으로 원격 저장소 미확인
- 종류: Chrome 확장 프로그램
- 기술: Manifest V3, HTML, CSS, JavaScript
- 주요 기능:
  - `chatgpt.com/*`에서만 작동하는 커스텀 다크 테마
  - 팝업에서 테마 ON/OFF 전환
  - Deep Dark, Soft Dark, Light Dark, Warm Dark, Gray Dark 프리셋 제공
  - Intensity 슬라이더로 어두움 정도 조절
  - 설정값을 `chrome.storage.local`에 저장
- 실행 형태:
  - Chrome 확장 프로그램 개발자 모드에서 압축 해제된 확장 프로그램으로 로드

### 3. 치지직 CPM 오버레이

- 위치: `chzzk-chat-speed-meter`
- GitHub: https://github.com/danryu1541-debug/chzzk-cpm-overlay
- 종류: 중앙 서버형 OBS 오버레이 웹앱
- 기술: Node.js, Express, Socket.IO, 치지직 OpenAPI OAuth
- 주요 기능:
  - 치지직 로그인 기반 사용자별 OBS 오버레이 URL 발급
  - 실시간 채팅 이벤트 수신
  - 최근 60초 CPM, 최근 10초 속도, 총 채팅 수, 최고 CPM, 평균 CPM 표시
  - canvas 기반 CPM 그래프
  - OBS용 가로형, 미니, 투명 오버레이 제공
  - 저장된 토큰으로 서버 재시작 후 자동 연결 시도
- 실행 형태:
  - `npm start`

### 4. 치지직 명령어 채팅봇

- 위치: `chzzk-command-bot`
- GitHub: https://github.com/danryu1541-debug/chzzk-chattingbot
- 종류: 로컬 실행형 채팅봇
- 기술: Python, Windows exe 빌드
- 주요 기능:
  - 치지직 채팅에서 `!디스코드`, `!후원`, `!유튜브` 같은 명령어 감지
  - 설정된 답변을 자동으로 채팅에 전송
  - `config.json`으로 채널 ID, 로그인 쿠키, 명령어 답변 설정
  - `build_exe.bat`으로 실행 파일 빌드 가능
- 실행 형태:
  - `dist\chzzk-command-bot.exe`
  - 또는 Python 스크립트 실행

### 5. CHZZK OpenAPI Chatbot

- 위치: `chzzk-openapi-chatbot`
- GitHub: https://github.com/danryu1541-debug/new-chat-bot
- 종류: 치지직 공식 OpenAPI 기반 로컬 실행형 채팅봇
- 기술: TypeScript, Node.js, Express, 치지직 OpenAPI, pkg
- 주요 기능:
  - Windows exe 실행 후 로컬 서버와 브라우저 설정 화면 제공
  - 치지직 로그인 및 봇 설정 중심의 로컬 MVP
  - 공식 OAuth 토큰 발급/갱신 구조
  - 세션 API, 채팅 이벤트 구독, 채팅 메시지 전송, 공지 등록 구조 반영
  - 사용자 토큰과 설정을 PC에만 저장하는 방향으로 설계
- 실행 형태:
  - 개발: `npm run dev`
  - 빌드: `npm run build`
  - Windows 패키징: `npm run package:win`

### 6. 치지직 후원 룰렛 타이머

- 위치: `chzzk-roulette-timer-overlay`
- GitHub: 로컬 폴더 기준으로 원격 저장소 미확인
- 종류: OBS 후원 룰렛 타이머 오버레이
- 기술: Node.js, Express, Socket.IO
- 주요 기능:
  - 후원 금액별 룰렛 결과에 따라 멧돼지/돼지 타이머 조절
  - 3,900원, 4,000원, 39,000원, 40,000원 룰렛 규칙 구성
  - 관리자 페이지와 OBS 오버레이 페이지 제공
  - 타이머, 테스트 후원, 확률표, 오버레이 모양 관리
  - 현재는 테스트 후원 모드 중심이며 실제 후원 자동 연동은 추후 지원 예정
- 실행 형태:
  - `npm start`
  - 관리자 페이지: `http://localhost:3000/admin`
  - OBS 오버레이: `http://localhost:3000/overlay`

### 7. 돼지 의상 룰렛 타이머

- 위치: `pig-timer-repo`
- GitHub: https://github.com/danryu1541-debug/pig-timer
- 종류: OBS 브라우저 소스형 후원 룰렛 타이머
- 기술: React, Vite, Node.js, Express, Socket.IO, 치지직 OAuth/세션 API 구조
- 주요 기능:
  - 돼지 의상/멧돼지 의상 타이머 2개 독립 동작
  - 3,900원 후원: 20분 또는 30분 추가
  - 4,000원 후원: 20분 또는 30분 감소
  - 설정 페이지와 OBS 오버레이 페이지 분리
  - 최근 룰렛 기록과 테스트 후원 버튼 제공
  - 공식 OAuth 및 세션 API 연동 구조 포함
- 실행 형태:
  - 개발: `npm run dev`
  - 빌드: `npm run build`
  - 실행: `npm start`

### 8. 핀볼 벌칙 추첨기

- 위치: `pinball-penalty-picker`
- GitHub: https://github.com/danryu1541-debug/pinball-penalty
- 종류: OBS용 로컬 HTML 핀볼 추첨기
- 기술: HTML, CSS, JavaScript, Matter.js CDN
- 주요 기능:
  - 서버 설치 없이 `index.html`을 브라우저에서 열어 실행
  - START 버튼으로 공을 떨어뜨려 벌칙 결과 표시
  - OBS 브라우저 소스에서 로컬 파일로 사용 가능
  - `script.js`의 `CONFIG.results` 배열로 결과 항목 수정 가능
  - 방송 안정성을 위해 미리 정한 결과 쪽으로 공을 유도하고, 제한 시간 초과 시 결과 강제 표시
- 실행 형태:
  - `index.html` 직접 실행

### 9. Support Timer Overlay

- 위치: `support-timer-overlay`
- GitHub: 로컬 폴더 기준으로 원격 저장소 미확인
- 종류: OBS 브라우저 소스형 후원 타이머 오버레이
- 기술: React, Vite, Node.js, Express, Socket.IO
- 주요 기능:
  - pig costume / boar costume 타이머 2개 독립 동작
  - 후원 이벤트로 룰렛 결과를 만들고 타이머에 시간 추가/감소
  - 설정 페이지와 OBS 오버레이 페이지 분리
  - 최근 룰렛 기록과 로컬 테스트 후원 버튼 제공
  - 외부 연동을 위한 공식 OAuth/session 통합 영역 분리
- 실행 형태:
  - 개발: `npm run dev`
  - 빌드: `npm run build`
  - 실행: `npm start`

### 10. 위플랩 룰렛 듀얼 타이머

- 위치: `weflab-roulette-timer`
- GitHub: https://github.com/danryu1541-debug/weflab-roulette-timer
- 종류: 위플랩 룰렛 결과 감지형 OBS 타이머
- 기술: HTML, JavaScript, Node.js, 로컬 실행 파일
- 주요 기능:
  - 멧돼지/돼지 타이머 2개 독립 실행
  - 위플랩 후원알림 페이지의 룰렛 결과 텍스트 감지
  - `+30분`, `-1시간`, `돼지 +20분` 같은 입력 자동 계산
  - OBS 브라우저 소스용 타이머 주소 제공
  - 조작 패널 숨김, 후원알림 URL 연결, 디버그 확인 기능 제공
  - `start_monitor.exe`와 zip 배포 파일 포함
- 실행 형태:
  - `start_monitor.exe`
  - OBS 타이머 주소: `http://127.0.0.1:17354/timer`

## 포트폴리오식 한 줄 소개

방송 운영자가 OBS에서 바로 사용할 수 있는 실시간 오버레이, 룰렛 타이머, 채팅봇, 후원 이벤트 자동화 도구를 주로 제작했습니다. Node.js/Express/Socket.IO/React/Vite 기반 웹앱과 Python 로컬 유틸리티, Chrome 확장 프로그램까지 다루며, 실제 방송 환경에서 설치와 실행이 쉬운 형태를 목표로 개발했습니다.

## 추가로 보완하면 좋은 내용

- 각 GitHub 저장소의 대표 스크린샷 추가
- 실제 배포 파일 또는 릴리즈 링크 추가
- 각 프로젝트별 완성도 상태 표시: 완료, 테스트 중, 베타, 개발 중
- OBS 적용 화면 예시 이미지 추가
- 치지직 OpenAPI/OAuth 연동 프로젝트끼리 공통 설명 정리
