# 랜딩 사이트 호스팅 가이드 (Cloudflare vs 가비아)

이 프로젝트는 **Next.js 정적 내보내기**(`out` 폴더)이므로, 별도 서버 없이 정적 파일만 올리면 됩니다.

---

## 1. 어떤 서비스를 쓸지 제안

| 구분 | **Cloudflare Pages** | **가비아 웹호스팅** |
|------|----------------------|---------------------|
| **비용** | 무료 (트래픽·빌드 한도 넉넉) | 유료 (호스팅 상품에 따라 월 수천 원~) |
| **속도/CDN** | 전 세계 CDN, 매우 빠름 | 국내 위주, 상품에 따라 다름 |
| **설정 난이도** | 쉬움 (드래그 앤 드롭 또는 Git 연동) | FTP/파일 매니저로 업로드 |
| **HTTPS** | 자동 무료 | 대부분 지원 (설정 필요할 수 있음) |
| **도메인** | 외부 도메인 연결 쉬움 (가비아에서 산 도메인도 연결 가능) | 가비아에서 도메인+호스팅 같이 쓰기 편함 |
| **한국어 지원** | 영어 위주 (문서 한글 일부 있음) | 한국어, 국내 결제/고객센터 |

### 추천 정리

- **무료로 빠르게 올리고, 전 세계 사용자도 고려한다**  
  → **Cloudflare Pages** 추천.
- **이미 가비아에서 도메인·호스팅을 쓰고 있고, 국내 사용자만 대상이다**  
  → **가비아 웹호스팅**으로 `out` 폴더 내용만 업로드해도 됨.
- **도메인은 가비아에서 구매했는데, 호스팅은 무료로 하고 싶다**  
  → Cloudflare Pages에 배포한 뒤, 가비아에서 구매한 도메인을 Cloudflare(또는 Pages)에 연결하면 됨.

아래는 두 가지 모두에 대한 **실제 배포 방법**입니다.

---

## 2. Cloudflare Pages로 배포 (추천)

### 2-1. 배포 전 준비

- 빌드 시 **구글 시트 연동**을 쓸 거라면, 배포 전에 `NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL` 환경 변수를 설정해야 합니다.  
  Cloudflare Pages에서는 **설정 → Environment variables**에서 변수 추가 후 재배포합니다.

### 2-2. 방법 A: 드래그 앤 드롭 (가장 간단)

1. [Cloudflare 대시보드](https://dash.cloudflare.com) 로그인 후 **Workers & Pages** 메뉴로 이동.
2. **Create** → **Pages** → **Upload assets** 선택.
3. 프로젝트에서 **빌드**:
   ```bash
   npm run build
   ```
4. 생성된 **`out` 폴더 전체**를 ZIP으로 압축  
   (Windows: `out` 폴더 우클릭 → 압축, Mac: `out` 폴더 선택 후 우클릭 → 압축).
5. Cloudflare에서 **프로젝트 이름** 입력 후, ZIP 파일을 **드래그 앤 드롭**으로 업로드.
6. 배포가 끝나면 `https://<프로젝트이름>.pages.dev` 주소로 접속 가능.

### 2-3. 방법 B: Git 연동 (자동 배포)

1. 프로젝트를 **GitHub/GitLab** 등에 푸시.
2. Cloudflare **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. 저장소 선택 후 빌드 설정:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: (비워두거나 프로젝트 루트)
4. **Environment variables**에 `NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL` 추가 (구글 시트 사용 시).
5. 저장 후 자동으로 빌드·배포됩니다. 이후 `main`(또는 선택한 브랜치)에 푸시할 때마다 자동 재배포됩니다.

### 2-4. Cloudflare Workers + Wrangler (Git 빌드 후 wrangler deploy)

Git 저장소와 연결한 **Workers** 프로젝트에서 빌드 후 `npx wrangler deploy`로 배포하는 경우:

- 프로젝트 루트에 **`wrangler.jsonc`** 가 있어야 합니다. 이 프로젝트에는 이미 포함되어 있으며, Next.js 정적 빌드 결과물(`out`)을 에셋으로 올리도록 설정되어 있습니다.
- Cloudflare 빌드 설정 예:
  - **Build command**: `npm run build`
  - **Deploy command**: `npx wrangler deploy`
  - **Root directory**: `/`
- `npm run build`로 `out`이 생성된 뒤 `wrangler deploy`가 `out` 폴더를 정적 사이트로 배포합니다.

### 2-5. 커스텀 도메인 (가비아 도메인 연결)

- Cloudflare Pages 프로젝트 → **Custom domains** → **Set up a custom domain**.
- 가비아에서 구매한 도메인 입력 후, 안내에 따라 **네임서버를 Cloudflare로 변경**하거나 **A/CNAME 레코드**를 Cloudflare가 안내한 값으로 설정합니다.  
  (가비아 DNS 관리 화면에서 A 레코드: `@` → Cloudflare에서 알려준 IP, CNAME: `www` → `xxx.pages.dev` 등으로 설정.)

---

## 3. 가비아 웹호스팅으로 배포

### 3-1. 가비아에서 할 일

1. [가비아](https://www.gabia.com)에서 **웹호스팅** 상품 가입 (또는 기존 호스팅 사용).
2. 호스팅 제어판(또는 FTP 정보)에서 **FTP 주소, 아이디, 비밀번호** 확인.
3. 도메인이 있다면 호스팅에 연결(가비아 안내에 따름).

### 3-2. 로컬에서 빌드

```bash
npm run build
```

`out` 폴더가 생성됩니다.

### 3-3. 업로드

- **FTP 클라이언트** (FileZilla, WinSCP 등)로 접속.
- **웹 루트 디렉터리**를 확인합니다.  
  보통 `www`, `public_html`, `html` 등입니다. (가비아 안내 또는 제어판에서 확인.)
- **`out` 폴더 안의 내용**을 웹 루트에 그대로 업로드합니다.  
  - `out/index.html` → 웹 루트의 `index.html`  
  - `out/_next` 폴더 → 웹 루트의 `_next`  
  - `out/404.html`, `out/404` 폴더 등도 모두 업로드.

즉, `out` **자체**를 올리는 게 아니라, **`out` 안의 파일·폴더 전체**를 웹 루트에 넣습니다.

### 3-4. 환경 변수 (구글 시트)

가비아는 정적 호스팅이므로 **빌드 시점**에만 환경 변수가 들어갑니다.  
로컬에서 `NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL`을 설정한 뒤 `npm run build` 하고, 그렇게 만든 `out` 내용을 업로드해야 합니다.

### 3-5. 404 페이지

일부 호스팅에서는 `404.html`을 자동으로 404 페이지로 인식합니다.  
인식이 안 되면 가비아 제어판에서 “에러 페이지” 또는 “404 설정” 메뉴가 있다면 `404.html`로 지정합니다.

---

## 4. 요약

| 목적 | 추천 |
|------|------|
| 무료 + 빠른 CDN + 간단 설정 | **Cloudflare Pages** (드래그 앤 드롭 또는 Git 연동) |
| 가비아 도메인·호스팅 이미 사용 중 | **가비아 웹호스팅**에 `out` 내용 업로드 |
| 도메인은 가비아, 호스팅은 무료로 | **Cloudflare Pages**에 배포 후 가비아 도메인만 연결 |

공통: 반드시 **`npm run build`** 한 뒤, **`out` 폴더의 내용**만 업로드하면 됩니다.
