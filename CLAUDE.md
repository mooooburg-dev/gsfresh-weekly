# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

여러 파일을 커밋할 때는 세부 내용을 구분해서 커밋을 분리해줘.
커밋 메시지를 작성할때 CLAUDE 관련 텍스트는 제외하고 깃모지를 활용한 한글로 작성해줘.

## Project Overview

GS Fresh Weekly is a web application that displays weekly promotional products from GS Fresh supermarket. The site updates with new weekly sales flyers and allows price comparison with Coupang.

**Tech Stack:**

- Next.js 16.0.7 (App Router)
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4
- Supabase (PostgreSQL + Authentication)
- Cheerio (web scraping for Coupang prices)

## Development Commands

```bash
npm run dev     # Start development server on port 4400
npm run build   # Production build
npm start       # Start production server on port 4400
npm run lint    # Run ESLint
```

## Environment Setup

Required environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Supabase anonymous key
```

**Note:** After creating or modifying `.env.local`, restart the dev server.

## High-Level Architecture

### Data Flow Pattern

**Consumer View (`/`):**

1. Page loads → fetches latest flyer (by `week_start DESC`)
2. Fetches all products for that flyer
3. Client-side filtering by category
4. Products displayed via `ProductCard` components

**Admin View (`/admin`):**

1. Protected by Supabase RLS (requires authenticated user)
2. Server Actions handle Coupang price scraping
3. Form submission → Database update → Refetch products

### Key Architectural Decisions

- **Server/Client Boundary:** Pages are Client Components (`'use client'`), expensive operations (Coupang scraping) use Server Actions (`'use server'`)
- **State Management:** Local component state with `useState` - no global state manager
- **Type Safety:** Centralized types in `lib/supabase.ts` exported for reuse
- **Security:** Supabase Row Level Security (RLS) - public read, authenticated write

## Database Schema

**Tables:**

- `gsfresh_weekly_flyers`: Week metadata (week_start, week_end, image_url)
- `gsfresh_weekly_products`: Product details with foreign key to flyers

**Key Fields in Products:**

- Price fields: `original_price`, `sale_price`, `special_price`, `coupang_price`
- `special_discount_text`: Conditions like "GS Pay 결제시"
- `coupang_url`: Link for price comparison scraping

**Indexes:**

- `flyer_id` (fast product lookup)
- `category` (fast filtering)
- `week_start` (latest flyer retrieval)

## Important Patterns & Conventions

### Categories

Hardcoded in components (not in database):

```typescript
['전체', '정육', '채소', '과일', '수산', '가공식품'];
// All, Meat, Vegetables, Fruit, Seafood, Processed Foods
```

### Database Field Naming

- Use `snake_case`: `week_start`, `sale_price`, `flyer_id`
- Price fields are integers (stored in won, no decimal points)
- Dates use PostgreSQL `DATE` type

### Component Structure

- TypeScript interfaces for props: `interface Props { ... }`
- Tailwind CSS utilities (no separate CSS modules)
- Lucide React for icons
- Next.js `Image` component with responsive sizing

### Error Handling

- Try-catch in async functions
- `alert()` for user feedback in admin
- `console.error()` for debugging
- Graceful UI fallbacks (loading states, empty states)

## Code Organization

```
app/
  ├── page.tsx              # Consumer view (main page)
  ├── layout.tsx            # Root layout with metadata
  ├── admin/
  │   ├── page.tsx          # Admin dashboard
  │   └── actions.ts        # Server action: fetchCoupangPrice()
components/
  ├── ProductCard.tsx       # Product display with price logic
  └── CountdownTimer.tsx    # Real-time countdown to next Thursday
lib/
  └── supabase.ts          # Client instance + TypeScript types
supabase/
  └── schema.sql           # Database schema + RLS policies
```

## Key Implementation Details

### Image Optimization

- Next.js `Image` component configured for Unsplash remote patterns
- Lazy loading enabled by default
- Responsive sizing with `sizes` attribute

### Coupang Price Scraping

- Server Action in `app/admin/actions.ts`
- Uses Cheerio to parse HTML selectors
- Extracts: `.total-price .total-price-value` and `.prod-buy-header__title img`
- User-Agent header required for successful requests
- Returns `{ price, imageUrl }` or error

### Update Schedule

- Weekly updates every **Thursday** (업데이트 주기: 매주 목요일)
- Products valid for 7 days (Thursday to next Wednesday)
- `CountdownTimer` shows time until next Thursday

## Supabase Integration

### Client Initialization

```typescript
// lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Common Query Patterns

```typescript
// Get latest flyer
const { data } = await supabase
  .from('gsfresh_weekly_flyers')
  .select('*')
  .order('week_start', { ascending: false })
  .limit(1);

// Get products for flyer
const { data } = await supabase
  .from('gsfresh_weekly_products')
  .select('*')
  .eq('flyer_id', flyerId);
```

### RLS Policies

- **Public read:** Anyone can view flyers/products (no authentication)
- **Authenticated write:** Only authenticated users can insert/update
- No explicit update/delete policies shown (add as needed)

## Path Aliases

TypeScript path alias configured:

```typescript
import { supabase } from '@/lib/supabase'; // @ = project root
```

## Common Gotchas

1. **Environment variables:** Must restart dev server after changing `.env.local`
2. **RLS policies:** Admin operations require Supabase authentication (not just visiting `/admin`)
3. **Coupang scraping:** HTML selectors may break if Coupang changes their markup
4. **No pagination:** All products loaded at once (consider adding for large datasets)
5. **Port 4400:** Custom port configured in package.json scripts
