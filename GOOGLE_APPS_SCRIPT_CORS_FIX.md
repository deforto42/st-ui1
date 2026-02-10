# Google Apps Script CORS 해결 방법

현재 CORS 오류가 발생하는 이유는 Google Apps Script webhook이 CORS 헤더를 반환하지 않기 때문입니다.

## 해결 방법: Google Apps Script에서 CORS 헤더 추가

Google Apps Script의 `doPost` 함수를 다음과 같이 수정하세요:

```javascript
function doPost(e) {
  try {
    // 요청 데이터 처리
    const data = JSON.parse(e.postData.contents);
    
    // 여기에 데이터 처리 로직 추가
    // 예: Google Sheets에 데이터 추가
    // const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // sheet.appendRow([data.name, data.phone, data.carrier, ...]);
    
    // CORS 헤더를 포함한 응답 반환
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

// OPTIONS 요청 처리 (CORS preflight)
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
```

## Web App 배포 설정

1. Google Apps Script 편집기에서 "배포" > "새 배포" 클릭
2. 유형: "웹 앱" 선택
3. 실행 대상: "나" 선택
4. 액세스 권한: "모든 사용자" 선택
5. 배포 후 URL 복사하여 `.env.local`의 `NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL`에 설정

## CORS 헤더 추가 후

CORS 헤더를 추가한 후에는 `components/Landing.tsx`의 코드를 다시 원래 fetch 방식으로 변경할 수 있습니다:

```typescript
const res = await fetch(webhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
```
