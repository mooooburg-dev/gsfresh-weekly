# GS FRESH Weekly

GS FRESH 마트의 주간 행사 상품 정보를 제공하는 웹사이트입니다.

## 주요 기능

- 매주 수요일 업데이트되는 행사 상품 정보
- 전단지 이미지 OCR 분석
- 카테고리별 상품 필터링
- 모바일 친화적 UI

## 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **OCR**: Google Cloud Vision API
- **Deployment**: Vercel

## 개발 환경 설정

1. 저장소 클론
```bash
git clone https://github.com/your-username/gsfresh-weekly.git
cd gsfresh-weekly
```

2. 패키지 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.example`을 복사하여 `.env.local` 파일 생성 후 필요한 값 입력
```bash
cp .env.example .env.local
```

4. Supabase 설정
- Supabase 프로젝트 생성
- `supabase/schema.sql` 파일의 SQL 실행하여 테이블 생성

5. 개발 서버 실행
```bash
npm run dev
```

## 배포

Vercel에 자동 배포됩니다.

## 프로젝트 구조

```
gsfresh-weekly/
├── app/                    # Next.js 앱 라우터
│   ├── page.tsx           # 메인 페이지
│   ├── admin/             # 관리자 페이지
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 함수
│   └── supabase.ts       # Supabase 클라이언트
└── supabase/             # 데이터베이스 스키마
    └── schema.sql        # SQL 스키마
```

## 업데이트 주기

- 매주 수요일: 새로운 주간 행사 전단지 업로드
- 행사 기간: 수요일 ~ 다음주 화요일 (7일간)

## 라이선스

MIT

## 문의

- Email: mooburg@drawyourmind.com
- Blog: https://blog.drawyourmind.com
