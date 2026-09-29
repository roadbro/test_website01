# GitHub 업로드 안내

가장 안전하고 간단한 방법은 프로젝트 최상위 폴더에서 `git add .`를 사용하는 것입니다. 이 프로젝트의 `.gitignore`가 인증키와 생성파일을 자동으로 제외합니다.

## GitHub에 올릴 항목

다음 파일과 폴더는 그대로 올립니다.

### 최상위 설정파일

- `.env.example` — 키 이름만 있는 공개 템플릿
- `.gitignore`
- `.openai/hosting.json` — Sites 프로젝트 및 D1 논리 바인딩 설정, 인증키 없음
- `.npmrc`
- `README.md`
- `GITHUB_UPLOAD_GUIDE.md`
- `setup-env.cmd`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.json`
- `next.config.ts`
- `vite.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `drizzle.config.ts`
- `cloudflare-env.d.ts`
- `components.json`

### 소스 및 실행 폴더

- `app/`
- `build/`
- `components/`
- `db/`
- `drizzle/`
- `hooks/`
- `lib/`
- `public/`
- `scripts/`
- `tests/`
- `vendor/`

`examples/`가 포함되어 있어도 보안상 문제는 없지만 실행에 필수는 아닙니다.

## 절대로 GitHub에 올리면 안 되는 항목

- `.env.local`, `.env`, `.env.production` 등 실제 인증키가 들어간 파일
- `node_modules/`
- `.next/`, `.vinext/`, `dist/`, `out/`
- `.wrangler/`
- `.sites-runtime/`
- `.git/`
- `site-build*.tar.gz`
- `tsconfig.tsbuildinfo`
- 인증키를 복사한 메모·스크린샷·로그파일

## 권장 업로드 명령

```bash
git init
git add .
git status
git commit -m "Initial compressor wash dashboard"
git branch -M main
git remote add origin 본인의_GitHub_저장소_URL
git push -u origin main
```

`git status` 단계에서 `.env.local`이 보이면 업로드를 중단하고 `.gitignore`를 확인합니다. 정상이라면 `.env.example`은 보이고 `.env.local`은 보이지 않아야 합니다.

## GitHub에 올린 뒤 배포환경에 입력할 값

GitHub 파일에 키를 기록하는 것이 아니라 Vercel, Cloudflare 또는 Sites의 서버 환경변수 화면에 아래 두 값을 별도로 등록합니다.

```text
KMA_API_KEY
DATA_GO_KR_SERVICE_KEY
```
