# Firestore 데이터 구조와 보안 규칙

## 개요

Color of Apple은 Firebase Authentication의 Google 로그인을 사용하며, Firestore에는 사용자 프로필, 저장한 컬러 팔레트 프로젝트, 12시간 단위 사용량을 저장한다.

```text
users/{uid}
├── projects/{projectId}
└── usage/{slotId}
```

- `uid`: Firebase Authentication이 발급한 사용자 ID
- `projectId`: 무료 사용자는 `slot-1`부터 `slot-5`, Pro 사용자는 Firestore 자동 ID
- `slotId`: `0` 또는 `12`
- 최상위 컬렉션은 `users` 하나이며, `projects`와 `usage`는 사용자 문서 아래의 서브컬렉션이다.
- Firebase 콘솔에서 컬렉션이나 문서를 미리 만들 필요는 없다. 사용자가 처음 로그인하거나 기능을 사용하면 앱이 자동으로 생성한다.

구현 코드는 `src/lib/firebase/data.ts`, 보안 규칙은 `firestore.rules`, Firebase 연결 설정은 `src/lib/firebase/client.ts`에서 관리한다.

## 사용자 프로필

경로:

```text
users/{uid}
```

Google 로그인에 성공하면 `ensureUserProfile()`이 문서 존재 여부를 확인한다. 최초 로그인에는 `plan: "free"`로 문서를 만들고, 이후 로그인에는 Google 계정의 표시 정보만 갱신한다.

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `displayName` | `string \| null` | 예 | Google 계정 표시 이름 |
| `email` | `string \| null` | 예 | Google 계정 이메일 |
| `photoURL` | `string \| null` | 예 | Google 프로필 이미지 URL |
| `plan` | `"free" \| "pro"` | 예 | 사용자의 서비스 플랜 |
| `createdAt` | `Timestamp` | 예 | 최초 생성 시각 |
| `updatedAt` | `Timestamp` | 예 | 마지막 프로필 동기화 시각 |

예시:

```json
{
  "displayName": "Apple User",
  "email": "user@example.com",
  "photoURL": "https://...",
  "plan": "free",
  "createdAt": "<server timestamp>",
  "updatedAt": "<server timestamp>"
}
```

### 프로필 보안 규칙

- 로그인한 사용자는 자기 `uid`의 문서만 읽고 생성·수정·삭제할 수 있다.
- 최초 생성 시 `plan`은 반드시 `free`여야 한다.
- 클라이언트가 수정할 수 있는 필드는 `displayName`, `email`, `photoURL`, `updatedAt`뿐이다.
- 클라이언트는 `plan`과 `createdAt`을 바꿀 수 없다.
- `createdAt`과 `updatedAt`은 Firestore 서버 시간과 일치해야 한다.
- Pro 전환은 결제 백엔드, Firebase Admin SDK 또는 Firestore 콘솔처럼 신뢰할 수 있는 환경에서만 `plan: "pro"`로 변경해야 한다.

## 저장 프로젝트

경로:

```text
users/{uid}/projects/{projectId}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `title` | `string` | 예 | 현재는 `{HEX} palette` 형식의 프로젝트 이름 |
| `input` | `map` | 예 | 팔레트 생성에 사용한 입력값 |
| `selectedPaletteId` | `string` | 예 | 사용자가 선택한 팔레트 ID |
| `overrides` | `map<string, string>` | 예 | 사용자가 직접 변경한 토큰명과 색상값의 매핑 |
| `createdAt` | `Timestamp` | 예 | 프로젝트 최초 저장 시각 |
| `updatedAt` | `Timestamp` | 예 | 프로젝트 마지막 저장 시각 |

`input` 맵의 현재 필드:

| 필드 | 타입 | 허용 값 또는 설명 |
| --- | --- | --- |
| `hex` | `string` | 기준 색상. 예: `#FF6B35` |
| `mood` | `string` | `balanced`, `vivid`, `soft`, `calm`, `bright`, `highContrast` |
| `neutralStyle` | `string` | `pure`, `warm`, `cool`, `tinted` |
| `secondaryMode` | `string` | `monochrome`, `analogous`, `split`, `complementary` |
| `modes` | `string[]` | `light`, `dark` 중 하나 이상 |
| `accessibilityTarget` | `string` | `AA` 또는 `AAA` |
| `includeAccent` | `boolean` | 액센트 컬러 포함 여부 |
| `previewTarget` | `string` | `web`, `app`, `both` |

예시:

```json
{
  "title": "#FF6B35 palette",
  "input": {
    "hex": "#FF6B35",
    "mood": "balanced",
    "neutralStyle": "tinted",
    "secondaryMode": "analogous",
    "modes": ["light", "dark"],
    "accessibilityTarget": "AA",
    "includeAccent": true,
    "previewTarget": "both"
  },
  "selectedPaletteId": "analogous",
  "overrides": {
    "primary.500": "#FF7040"
  },
  "createdAt": "<server timestamp>",
  "updatedAt": "<server timestamp>"
}
```

### 무료 프로젝트 슬롯

무료 사용자는 다음 다섯 문서 ID만 새로 만들 수 있다.

```text
slot-1
slot-2
slot-3
slot-4
slot-5
```

새 프로젝트를 저장할 때 트랜잭션으로 다섯 슬롯을 읽고, 비어 있는 첫 슬롯에 저장한다. 다섯 슬롯이 모두 있으면 `ProjectLimitError`가 발생하고 앱은 `/coming-soon`으로 이동한다. 프로젝트를 삭제하면 해당 슬롯 문서가 없어지므로 다시 저장할 수 있다.

Pro 사용자는 슬롯 대신 자동 생성 문서 ID를 사용하며 저장 개수 제한이 없다.

### 프로젝트 보안 규칙

- 사용자는 자기 프로젝트만 읽고 생성·수정·삭제할 수 있다.
- 무료 사용자의 새 문서는 `slot-1`부터 `slot-5`까지만 허용한다.
- Pro 사용자의 새 문서 ID에는 제한이 없다.
- 생성 시 허용된 필드만 포함해야 하고 `createdAt`, `updatedAt`은 서버 시간이어야 한다.
- 수정 시 `createdAt`은 기존 값 그대로 유지하고 `updatedAt`은 서버 시간으로 갱신해야 한다.
- 목록은 `updatedAt` 내림차순으로 조회한다. 현재 쿼리는 단일 필드 정렬이므로 별도의 복합 인덱스가 필요하지 않다.

## 사용량

경로:

```text
users/{uid}/usage/{slotId}
```

사용량은 UTC 기준 고정 12시간 구간으로 나눈다.

- `slotId = "0"`: UTC 00:00 이상 12:00 미만
- `slotId = "12"`: UTC 12:00 이상 다음 날 00:00 미만

문서 ID 두 개를 매일 재사용하고, `year`, `month`, `day`, `slot`이 현재 구간과 다르면 이전 카운트를 0으로 취급한 뒤 새 날짜 값으로 덮어쓴다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `year` | `integer` | 현재 UTC 연도 |
| `month` | `integer` | 현재 UTC 월, 1–12 |
| `day` | `integer` | 현재 UTC 일 |
| `slot` | `integer` | `0` 또는 `12` |
| `generationCount` | `integer` | 해당 구간의 팔레트 생성 횟수 |
| `exportCount` | `integer` | 해당 구간의 복사·다운로드 횟수 합계 |
| `updatedAt` | `Timestamp` | 마지막 차감 시각 |

예시:

```json
{
  "year": 2026,
  "month": 9,
  "day": 29,
  "slot": 12,
  "generationCount": 3,
  "exportCount": 2,
  "updatedAt": "<server timestamp>"
}
```

### 차감 방식

`consumeQuota(uid, kind)`가 Firestore 트랜잭션 안에서 현재 프로필과 사용량 문서를 읽고 다음 값을 저장한다.

- `kind = "generation"`: `generationCount`를 1 증가
- `kind = "export"`: `exportCount`를 1 증가
- 무료 사용자는 각 카운터를 한 구간에 최대 5까지만 증가시킬 수 있다.
- Pro 사용자는 Firestore 사용량 문서를 읽거나 갱신하지 않고 즉시 통과한다.
- 한도에 도달하면 `QuotaLimitError`가 발생하고 앱은 `/coming-soon`으로 이동한다.

트랜잭션을 사용하므로 같은 사용자가 여러 탭에서 동시에 요청해도 읽기-수정-쓰기가 원자적으로 재시도된다.

### 사용량 보안 규칙

- 사용자는 자기 사용량 문서만 읽을 수 있다.
- 문서 ID와 현재 UTC 슬롯이 일치해야 한다.
- 날짜와 슬롯은 Firestore의 `request.time` 기준 현재 UTC 구간이어야 한다.
- 두 카운터는 0 이상 5 이하의 정수여야 한다.
- 최초 쓰기 또는 새 날짜 구간의 첫 쓰기는 정확히 한 카운터만 `1`, 다른 카운터는 `0`이어야 한다.
- 같은 날짜 구간의 수정은 한 번에 한 카운터만 정확히 1 증가시킬 수 있다.
- 사용량 문서 삭제는 허용하지 않는다.

## 배포 및 인덱스

Firebase 프로젝트 연결은 다음과 같다.

```text
projectId: matchu-a1fbb
rules: firestore.rules
indexes: firestore.indexes.json
```

규칙과 인덱스 배포 명령:

```bash
firebase deploy --only firestore
```

현재 `firestore.indexes.json`에는 복합 인덱스나 필드 재정의가 없다.

## 운영 시 주의사항

- Firebase Web API 설정값은 공개 클라이언트 식별 정보이므로 실제 접근 통제는 반드시 Authentication과 Firestore Rules로 수행한다.
- 가격 결제를 붙일 때 클라이언트가 직접 `plan`을 변경하게 해서는 안 된다. 결제 웹훅을 검증한 서버에서 Admin SDK로 변경해야 한다.
- 보안 규칙은 문서의 필드 이름과 기본 타입을 검증하지만, 현재 `input` 및 `overrides` 내부의 모든 키와 값 형식까지 세부 검증하지는 않는다.
- 사용자 프로필 문서를 삭제해도 Firestore 서브컬렉션은 자동 삭제되지 않는다. 계정 삭제 기능을 추가할 때는 Admin SDK 또는 Cloud Functions로 `projects`와 `usage`까지 재귀 삭제해야 한다.
- 현재 Firebase App Check는 구현 범위에 포함되어 있지 않다. 공개 배포 전 활성화를 검토한다.
