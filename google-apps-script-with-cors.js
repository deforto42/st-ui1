function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("시트1"); // 시트 이름 확인

  var body = JSON.parse(e.postData.contents);

  // ✅ 한국 시간 기준 현재 시각 생성
  var now = new Date();
  var kstDateTime = Utilities.formatDate(
    now,
    "Asia/Seoul",
    "yyyy-MM-dd HH:mm:ss"
  );

  sheet.appendRow([
    kstDateTime,                 // ← 항상 KST
    body.name || "",
    body.phone || "",
    body.carrier || "",
  ]);

  // ✅ CORS 헤더 추가
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// ✅ OPTIONS 요청 처리 (CORS preflight)
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
