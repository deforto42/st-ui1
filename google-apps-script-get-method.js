// GET 방식으로 변경한 버전 (CORS 문제 해결)
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("시트1");

  // GET 파라미터에서 데이터 추출
  var name = e.parameter.name || "";
  var phone = e.parameter.phone || "";
  var carrier = e.parameter.carrier || "";

  // ✅ 한국 시간 기준 현재 시각 생성
  var now = new Date();
  var kstDateTime = Utilities.formatDate(
    now,
    "Asia/Seoul",
    "yyyy-MM-dd HH:mm:ss"
  );

  sheet.appendRow([
    kstDateTime,
    name,
    phone,
    carrier,
  ]);

  // CORS 헤더와 함께 성공 응답 반환
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// application/x-www-form-urlencoded 본문 파싱 (정적 페이지 form 제출용)
function parseFormUrlEncoded(contents) {
  var body = {};
  if (!contents || typeof contents !== "string") return body;
  var pairs = contents.split("&");
  for (var i = 0; i < pairs.length; i++) {
    var idx = pairs[i].indexOf("=");
    if (idx === -1) continue;
    var key = decodeURIComponent(pairs[i].substring(0, idx).replace(/\+/g, " "));
    var value = decodeURIComponent((pairs[i].substring(idx + 1) || "").replace(/\+/g, " "));
    body[key] = value;
  }
  return body;
}

// POST 방식도 유지 (기존 코드 호환성)
// 클라이언트는 application/x-www-form-urlencoded로 전송하므로 반드시 본문 파싱 필요
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("시트1");

  var body = {};
  if (e.postData && e.postData.contents) {
    var type = (e.postData.type || "").toLowerCase();
    if (type.indexOf("application/x-www-form-urlencoded") !== -1) {
      // form 제출(iframe POST) → 본문에서 name, phone, carrier 추출
      body = parseFormUrlEncoded(e.postData.contents);
    } else {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        body = parseFormUrlEncoded(e.postData.contents);
      }
    }
  }
  // fallback: 쿼리 스트링 또는 빈 값
  body.name = body.name || (e.parameter && e.parameter.name) || "";
  body.phone = body.phone || (e.parameter && e.parameter.phone) || "";
  body.carrier = body.carrier || (e.parameter && e.parameter.carrier) || "";

  // ✅ 한국 시간 기준 현재 시각 생성
  var now = new Date();
  var kstDateTime = Utilities.formatDate(
    now,
    "Asia/Seoul",
    "yyyy-MM-dd HH:mm:ss"
  );

  sheet.appendRow([
    kstDateTime,
    body.name,
    body.phone,
    body.carrier,
  ]);

  // CORS 헤더와 함께 성공 응답 반환
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// OPTIONS 요청 처리 (CORS preflight)
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
