# Downloads Organizer

Windows 11에서 사용자의 `Downloads` 폴더를 백그라운드로 감시하고, 다운로드가 완료된 파일만 종류별 폴더로 자동 이동하는 프로그램입니다.

## 분류 규칙

| 폴더 | 확장자 |
| --- | --- |
| Images | jpg, jpeg, png, gif, webp |
| Documents | pdf, docx, doc, xlsx, xls, pptx, txt |
| Archives | zip, rar, 7z |
| Installers | exe, msi |
| Videos | mp4, mov, mkv |
| Audio | mp3, wav, flac |
| Others | 위 분류에 없는 모든 파일 |

임시 다운로드 파일인 `.crdownload`, `.part`, `.tmp`는 이동하지 않습니다. 파일 크기가 여러 번 연속으로 변하지 않을 때만 다운로드 완료로 판단합니다.

## 설치 방법

1. Windows 11에 Python 3.10 이상을 설치합니다.
2. 이 폴더에서 PowerShell을 엽니다.
3. 아래 명령으로 정상 실행 여부를 확인합니다.

```powershell
python .\downloads_organizer.py scan
```

별도 Python 패키지는 필요하지 않습니다.

## 사용법

한 번만 정리하려면:

```powershell
python .\downloads_organizer.py scan
```

백그라운드 감시를 현재 터미널에서 실행하려면:

```powershell
python .\downloads_organizer.py run
```

GUI 없이 실행하려면 `run_background.pyw`를 실행합니다.

```powershell
pythonw .\run_background.pyw
```

Windows 시작 시 자동 실행을 켜려면:

```powershell
python .\downloads_organizer.py startup-enable
```

자동 실행 상태를 확인하려면:

```powershell
python .\downloads_organizer.py startup-status
```

자동 실행을 끄려면:

```powershell
python .\downloads_organizer.py startup-disable
```

## 로그

오류와 이동 내역은 기본적으로 아래 파일에 기록됩니다. 권한 문제로 생성할 수 없으면 프로그램을 실행한 폴더의 `DownloadsOrganizer.log`에 기록됩니다.

```text
%USERPROFILE%\DownloadsOrganizer.log
```

## 동작 방식

- `Downloads` 폴더를 2초마다 감시하며, 모든 파일의 크기 변화를 동시에 추적합니다.
- 카테고리 폴더가 없으면 자동으로 생성합니다.
- 동일한 파일명이 이미 있으면 `file (1).ext`, `file (2).ext`처럼 이름을 바꿔 저장합니다.
- 다운로드 중인 파일과 잠겨 있는 파일은 건너뜁니다.
- 파일 크기가 여러 번 연속으로 안정화된 뒤에만 이동합니다.
- 분류 폴더가 아닌 일반 폴더도 내용이 안정화된 뒤 `Others`로 이동합니다.
