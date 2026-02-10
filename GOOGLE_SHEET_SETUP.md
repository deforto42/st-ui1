# 구글 시트 연동 설정 가이드 (정적 페이지 호스팅)

랜딩 페이지에서 입력받은 이름/연락처/통신사를 **구글 시트**에 저장하려면 아래 순서대로 설정하면 됩니다.

---

## 1. 원인 정리 (왜 안 됐는지)

- **정적 빌드(`out` 폴더)** 로 호스팅할 때는 서버 API가 없어서, 폼이 **Google Apps Script 웹 앱 URL**로 직접 POST 합니다.
- 다음 두 가지가 맞아야 합니다.
  1. **빌드 시점**에 `NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL` 이 들어가 있어야 함 (빌드된 JS에 URL이 포함됨).
  2. **Google Apps Script**의 `doPost`에서 **form 데이터**(`application/x-www-form-urlencoded`)를 제대로 파싱해야 함.

이전에는 GAS에서 JSON만 파싱하고 form body는 파싱하지 않아, 이름/연락처/통신사가 빈 값으로 들어갔을 수 있습니다.  
프로젝트의 `google-apps-script-get-method.js`를 GAS에 **그대로 반영**하면 form 제출이 정상 동작합니다.

---

## 2. 구글 시트 준비

1. [Google 스프레드시트](https://sheets.google.com)에서 새 스프레드시트를 만듭니다.
2. 첫 번째 시트 이름을 **`시트1`** 로 두거나, 아래 스크립트의 `getSheetByName("시트1")` 부분을 실제 시트 이름에 맞게 수정합니다.
3. 첫 번째 행에 헤더(원하는 경우) 예:
   - `A1`: `제출일시`  
   - `B1`: `이름`  
   - `C1`: `연락처`  
   - `D1`: `통신사`  
   데이터는 2행부터 쌓입니다.

---

## 3. Google Apps Script 배포

1. 해당 스프레드시트에서 **확장 프로그램 → Apps Script** 를 엽니다.
2. 기본 생성된 `function myFunction() {}` 는 삭제하고, 이 프로젝트 루트의 **`google-apps-script-get-method.js`** 내용 전체를 복사해 붙여넣습니다.
3. **저장** (Ctrl+S / Cmd+S) 후 상단 **배포 → 새 배포** 를 클릭합니다.
4. **유형 선택** 에서 **웹 앱** 을 선택합니다.
5. 설정:
   - **설명**: 원하는 대로 (예: "랜딩 시트 수집")
   - **실행 계정**: **나**
   - **액세스 권한**: **모든 사용자** (앱에 접속한 모든 사용자)
6. **배포** 를 누르면 **웹 앱 URL** 이 나옵니다.  
   형식 예: `https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec`  
   이 URL을 복사합니다.

---

## 4. 정적 빌드 시 웹훅 URL 넣기

정적 페이지는 **빌드할 때** `NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL` 값이 번들에 포함됩니다.  
배포/호스팅하는 환경에서 **빌드 직전**에 이 값을 설정해야 합니다.

### 방법 A: 로컬에서 빌드할 때

프로젝트 루트에 `.env.local` (또는 `.env.production`) 파일을 만들고:

```env
NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/여기에_복사한_배포_URL/exec
```

그 다음:

```bash
npm run build
```

생성된 `out` 폴더를 그대로 정적 호스팅하면 됩니다.

### 방법 B: CI/서버에서 빌드할 때

빌드 명령 실행 전에 환경 변수를 설정합니다.

- **Linux/macOS**:
  ```bash
  export NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/xxxx/exec"
  npm run build
  ```
- **Windows (CMD)**:
  ```cmd
  set NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/xxxx/exec
  npm run build
  ```

`.env.local`을 CI에 올리지 않으려면, CI의 “Secret / 환경 변수”에  
`NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL` 를 등록하고, 빌드 스크립트에서 위처럼 export/set 하면 됩니다.

---

## 5. 동작 확인

1. **다시 빌드**: `NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL` 이 설정된 상태에서 `npm run build` 한 뒤, `out` 으로 서비스 중인 페이지에 접속합니다.
2. 랜딩 폼에서 **이름, 연락처, 통신사**를 입력하고 약관 동의 후 제출합니다.
3. 구글 시트 **시트1** 2행 이후에 **제출일시, 이름, 연락처, 통신사**가 한 행씩 추가되는지 확인합니다.

---

## 6. 문제 해결

| 증상 | 확인 사항 |
|------|-----------|
| "Webhook URL이 설정되지 않았습니다." | 빌드 시 `NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL` 이 설정되었는지 확인. **반드시 빌드 전에** 환경 변수를 넣고 다시 `npm run build` 해야 합니다. |
| 제출은 되는데 시트에 빈 행만 쌓임 | GAS에 `google-apps-script-get-method.js` 최신 버전( form-urlencoded 파싱 포함)이 배포되었는지 확인. **배포 → 배포 관리** 에서 기존 웹 앱을 **편집 → 버전: 새 버전** 으로 저장 후 다시 테스트. |
| 제출 시 "오류가 발생했습니다" | 브라우저 개발자 도구 **네트워크** 탭에서 form이 어떤 URL로 POST 되는지, 응답 코드(200/4xx/5xx) 확인. GAS **실행 로그**(Apps Script 편집기에서 실행 로그/실행 기록) 확인. |
| 시트에 "시트1"이 없다고 나옴 | Apps Script의 `getSheetByName("시트1")` 과 실제 시트 이름이 **완전히 동일**한지 확인(공백, 대소문자 포함). |

---

## 7. 요약 체크리스트

- [ ] 구글 시트 생성, 첫 시트 이름 `시트1` (또는 스크립트에서 동일하게 수정)
- [ ] Apps Script에 `google-apps-script-get-method.js` 전체 붙여넣기 후 저장
- [ ] 배포 → 웹 앱 → 실행 계정 "나", 액세스 "모든 사용자" → 배포 후 URL 복사
- [ ] `NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL` 에 위 URL 넣고 **다시 빌드** (`npm run build`)
- [ ] `out` 폴더로 정적 호스팅 후 폼 제출 → 시트에 행 추가되는지 확인

위 순서대로 하면 정적 페이지에서도 구글 시트 수집이 정상적으로 동작합니다.
