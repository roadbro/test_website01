# 압축기 습식세정 외부환경 적기 판단 대시보드

성남시 기상과 전국 전력계통이라는 **외부환경만** 사용해 압축기 습식세정 후보 시간대를 판단하는 Next.js 애플리케이션입니다. 가스터빈 운전상태, 출력, TAT/TIT, 압력비, 진동, 연료량, 급전지시, 작업자·설비 준비상태 등 발전소 내부자료는 수집하거나 추정하지 않습니다.

> 본 판정은 외부 기상 및 전력계통 여건만을 활용한 참고 결과이며, 실제 습식세정 시행 여부는 발전소의 작업 승인 절차에 따라 최종 결정해야 합니다.

## 주요 기능

- 성남시 초단기실황과 향후 6시간 초단기예보
- GK2A IR 10.5 μm 전국 구름영상과 AI 기반 일사량
- KPX 실시간 수요·공급능력·공급/운영예비력
- 금일 시간대별 육지 수요예측(mlfd)과 수집 실적 비교
- 서버가 실제 수집한 이력으로 15·30·60분 증감량 및 MW/min 계산
- `세정 적기 후보 / 관찰 필요 / 보류 권고 / 데이터 확인 필요` 우선순위 판정
- 관리자 판단기준, API 상태·오류, 인증키 설정 안내 화면
- D1 기반 공용 캐시·전력수요 이력·설정 저장
- `MOCK_MODE=true`에서만 분리된 fixture 사용 및 화면 워터마크 표시

## 기술 구성

- Next.js App Router, TypeScript, React 19
- Recharts
- Cloudflare D1 + Drizzle ORM
- 서버 API Route에서만 외부 API 및 인증키 사용
- 모든 화면시간 `Asia/Seoul`

## 환경변수

입력해야 하는 값은 기상청과 공공데이터포털의 **인증키 2개뿐**입니다. 성남 대표지점, 호출주기, 시간대, 샘플모드에는 안전한 기본값이 들어 있습니다.

Windows에서는 프로젝트 폴더의 `setup-env.cmd`를 더블클릭하면 `.env.local`이 생성되고 메모장이 열립니다. 아래 두 줄의 `=` 오른쪽에 실제 키만 입력해 저장합니다.

```dotenv
KMA_API_KEY=발급받은_기상청_API허브_authKey
DATA_GO_KR_SERVICE_KEY=발급받은_공공데이터포털_서비스키
```

터미널을 사용하는 경우에는 다음 명령으로 같은 파일을 만들고 입력 상태를 검사할 수 있습니다.

```bash
pnpm setup:env
pnpm check:env
```

기본 위치는 기상청 관측지점 572번인 **성남 관측지점(성남시청 신청사, WGS84 37.42093 / 127.12476)**입니다. 서버는 이 공식 좌표를 기상청 격자변환 API에 전달합니다. 다른 지점을 사용할 때만 `KMA_LOCATION_LAT/LON`을 선택적으로 재정의합니다.

실제 키가 들어가는 `.env.local`은 `.gitignore`로 제외되어 있습니다. 브라우저에 노출되는 `NEXT_PUBLIC_` 변수, HTML 또는 GitHub에는 인증키를 넣지 마십시오. GitHub 업로드 목록은 [GITHUB_UPLOAD_GUIDE.md](./GITHUB_UPLOAD_GUIDE.md)를 확인하세요.

## 공공 API 활용신청

### 기상청 API 허브

1. [기상청 API 허브](https://apihub.kma.go.kr) 회원가입
2. 마이페이지의 `authKey` 확인
3. 동네예보의 초단기실황·초단기예보 활용신청
4. 천리안위성 2A호 영상 활용신청
5. GK2A AI 기반 일사량 활용신청
6. 서버 환경변수 `KMA_API_KEY`에 저장

### 공공데이터포털

1. [공공데이터포털](https://www.data.go.kr) 회원가입 및 로그인
2. 서비스 ID `15056640` 활용신청
3. 서비스 ID `15131225` 활용신청
4. 마이페이지에서 서비스키 확인
5. 서버 환경변수 `DATA_GO_KR_SERVICE_KEY`에 저장
6. 5분 호출이 필요하면 운영계정/트래픽 확대 승인 후 `KPX_REALTIME_POLL_MINUTES=5` 설정

개발계정의 일 호출량이 100회라면 15분 간격은 하루 96회이므로 수동 강제 새로고침과 실패 재시도를 고려하면 여유가 작습니다. 운영 전 승인량을 확인하고 필요 시 더 긴 주기를 사용하십시오.

## 설치 및 실행

Node.js 22.13 이상이 필요합니다.

```bash
pnpm install
pnpm setup:env
pnpm check:env
pnpm db:generate
pnpm build
pnpm wrangler d1 migrations apply DB --local --config dist/server/wrangler.json
pnpm start
```

개발 서버는 `pnpm dev`로 실행합니다.

## 검증

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

테스트는 정상범위 판정, 보류 우선순위, 기준 미설정 시 판정 중단, 오래된 자료 차단, 미래 시간대 판정을 검증합니다.

## 판정 우선순위

1. 필수 API 실패·인증/호출량 오류·오래된 자료·기준 미설정 → `데이터 확인 필요`
2. 하나 이상의 보류기준 초과 → `보류 권고`
3. 보류는 아니지만 하나 이상의 주의기준 진입 → `관찰 필요`
4. 모든 외부조건 정상 → `세정 적기 후보`

판정은 점수화하지 않으며 결과를 발생시킨 구체적인 항목과 값을 함께 표시합니다. 미래 시간대는 기상 및 하루전 수요예측만 사용하고 미래 운영예비력을 임의 예측하지 않습니다.

## 서버 캐시 및 이력

- 초단기실황·예보: 10분
- 구름영상: 10분 HTTP 공유 캐시
- 일사량: 30분
- 실시간 전력수급: `KPX_REALTIME_POLL_MINUTES`(기본 15분)
- 하루전 수요예측: 첫 요청 후 다음 23:10 KST까지 공용 캐시하며 이후 매일 23:10 기준으로 갱신합니다.

`api_snapshots`에 마지막 정상자료와 상태를 저장하므로 여러 사용자가 접속해도 캐시 유효기간 안에는 공공 API를 다시 호출하지 않습니다. 오류 시 이전 정상자료를 지우지 않지만 상태는 `오류`로 바뀌며 현재자료인 것처럼 판정에 사용하지 않습니다. `power_history`에는 API에서 실제 수신한 기준시각·수요만 저장합니다.

현재 배포형은 화면이 열려 있는 동안 5분마다 서버 대시보드 API를 조회하고, 서버는 위 공용 캐시주기에 따라 외부 API 호출 여부를 결정합니다. 방문 요청이 전혀 없는 시간에도 이력을 쌓으려면 Sites에 연결된 일정 실행 기능 또는 별도 승인된 스케줄러가 `/api/dashboard`를 호출하도록 추가 구성이 필요합니다. 스케줄러가 없을 때도 과거값을 임의 생성하지 않으며 이력 부족은 `이력 수집 중`으로 표시됩니다.

## 사용한 공식 API와 필드

| 데이터 | 공식 경로/서비스 | 사용하는 응답 필드 |
|---|---|---|
| 초단기실황 | KMA `VilageFcstInfoService_2.0/getUltraSrtNcst` | `category`, `obsrValue` (`T1H`, `RN1`, `PTY`, `WSD`, `VEC`, `REH`) |
| 초단기예보 | KMA `VilageFcstInfoService_2.0/getUltraSrtFcst` | `fcstDate`, `fcstTime`, `category`, `fcstValue` (`T1H`, `RN1`, `PTY`, `SKY`, `WSD`, `REH`) |
| 격자변환 | KMA `nph-dfs_xy_lonlat` | 입력 위·경도에 대한 공식 X/Y 응답 |
| 전국 구름영상 | KMA `nph-gk2a_img` | `tm`, `obs=ir105`; 영상은 정성적 구름분포 보조지표 |
| AI 일사량 | KMA `nph_sun_sat_ana_txt` | 공식 응답 헤더에서 단위와 수치열을 확인할 수 있을 때만 표시 |
| 실시간 전력수급 | ID `15056640`, `getSukub5mMaxDatetime` | `baseDatetime`, `suppAbility`, `currPwrTot`, `forecastLoad`, `suppReservePwr`, `suppReserveRate`, `operReservePwr`, `operReserveRate` |
| 하루전 수요예측 | ID `15131225`, `getSmpWithForecastDemand` | `date`, `hour`, `areaName`, `mlfd` (육지); `smp`는 사용하지 않음 |

## 구현 제한사항

- 초단기예보 API는 강수확률(POP)을 제공하지 않으므로 임의 계산하지 않고 미제공으로 표시합니다. POP가 반드시 필요하면 공식 단기예보 서비스 추가 활용신청과 명세 확인이 필요합니다.
- GK2A AI 일사량은 공식 응답에서 수치 열과 단위를 확정할 수 없는 경우 값을 숨깁니다. 사용 중인 활용신청 상품의 응답 예제·변수 정의서가 추가로 필요합니다.
- 실시간 전력수급 API가 과거 시계열을 제공하지 않는 구간은 서버가 실제로 수집한 이후부터만 증감량을 계산합니다.
- 하루전 수요예측 응답에 별도 생성시각 필드가 없는 경우 서버의 마지막 정상 수신시각을 갱신시각으로 보존합니다.
- 전국 구름영상은 태양광 출력 MW로 환산하지 않습니다.
- 급전지시·발전계획·DCS 또는 내부 설비자료를 사용하지 않습니다.

## 배포

배포 환경에 D1 바인딩 이름 `DB`를 연결하고 Drizzle 마이그레이션을 적용한 뒤 `KMA_API_KEY`, `DATA_GO_KR_SERVICE_KEY` 두 값을 서버 비밀값으로 등록합니다. 나머지는 코드 기본값을 사용합니다. 인증키 교체 후에는 새 배포 또는 런타임 환경변수 재적용이 필요합니다.
