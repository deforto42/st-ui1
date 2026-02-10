Next.js 정적 랜딩 페이지 (구글 시트 연동, Cloudflare/가비아 배포 가능)

## GitHub 새 레포에 올리기

1. **GitHub에서 새 저장소 생성**  
   - [github.com/new](https://github.com/new) 접속  
   - Repository name 입력 (예: `ui-landing`)  
   - Public 선택, **README / .gitignore / license 추가하지 않음** (로컬에 이미 있음)  
   - **Create repository** 클릭  

2. **로컬에서 원격 추가 후 푸시** (아래 `YOUR_USERNAME`, `REPO_NAME`을 본인 값으로 변경):

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

   SSH를 쓰는 경우:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

배포 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md) 참고.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
