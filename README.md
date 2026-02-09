# WhatsApp Web Plus

אפליקציית Next.js לחיבור ל-WhatsApp עם תשובות מהירות (תבניות) ושליחת הודעות מתוזמנות (בפיתוח).

---

## Monorepo (new stack)

הפרויקט כולל מונורפו: **client** (Vite + React Router 7) ו-**server** (Nest + Fastify) באותו ריפו.

### מבנה

| path | תיאור |
|------|--------|
| `packages/contracts` | ts-rest contract + Zod schemas (types/DTOs משותפים) |
| `packages/db` | Prisma (SQLite) + better-sqlite3 |
| `apps/api` | Nest + Fastify, SWC – API (quick-replies, send, whatsapp) |
| `apps/web` | Vite + React 19 + React Router 7 + TanStack Query |

### Build

```bash
npm install
npm run build
```

סדר הבנייה: contracts → db → api → web.

אם ב-Windows מופיעה שגיאת `EPERM` או `ENOTEMPTY` בבניית ה-API – עצור את שרת ה-API (`npm run dev:api`) ונסה שוב.

### הרצה

- **API** (פורט 3001):  
  `npm run dev:api`
- **Web** (פורט 3000, proxy ל-API ב-`/api`):  
  `npm run dev:web`

לבדיקה: להריץ את שני השרתים (בטרמינלים נפרדים), לפתוח [http://localhost:3000](http://localhost:3000). ה-Web משתמש ב-proxy ל-`/api` שמפנה ל-`http://localhost:3001`.

### משתני סביבה

- **API:** `DATABASE_URL` (אופציונלי; ברירת מחדל SQLite), `PORT` (ברירת מחדל 3001).
- **Web:** `VITE_API_URL` (אופציונלי; ברירת מחדל `/api` – מתאים ל-proxy ב-dev).

### בדיקות E2E (Playwright)

הפרויקט משתמש ב-**Playwright** לבדיקות קצה-לקצה (הכי מומלץ ועכשווי).

- **הרצת בדיקות:**  
  `npm run test:e2e` (מהריצה מהשורש) או מתוך `apps/web`: `npm run test:e2e`
- **ממשק גרפי:**  
  `npm run test:e2e:ui` (מתוך `apps/web`)
- **הרצה עם דפדפן גלוי:**  
  `npm run test:e2e:headed`

בפעם הראשונה: `cd apps/web && npx playwright install` (הורדת Chromium; אופציונלי גם Firefox ו-WebKit). הבדיקות מפעילות אוטומטית את שרת ה-Web.

---

## טכנולוגיות (Next.js – קיים)

- **Next.js 16** (App Router) + TypeScript  
- **whatsapp-web.js** + Puppeteer – חיבור ל-WhatsApp  
- **Prisma** + **SQLite** – תבניות ומסד נתונים  
- **Tailwind CSS** + **Shadcn/ui** – ממשק  

## התקנה והרצה

```bash
npm install
cp .env.example .env   # או צור .env עם DATABASE_URL
npx prisma generate
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000).

## משתני סביבה

צור קובץ `.env` (או `.env.local`) עם:

```
DATABASE_URL="file:./prisma/dev.db"
```

## תכונות

- **התחברות** – סריקת QR וחיבור ל-WhatsApp  
- **תשובות מהירות** – ניהול תבניות הודעה ושליחה בלחיצה  
- **שלח מהיר** – הזנת מספר, בחירת תבנית, שליחה  

## העלאה לפרויקט Git חדש (GitHub / GitLab)

הפרויקט כבר מאותחל עם Git ו-commit ראשון. כדי להעלות לריפו חדש:

### 1. צור ריפו חדש ב-GitHub (או GitLab)

- ב-GitHub: **New repository** → שם (למשל `whatsapp-web-plus`) → **לא** לסמן "Add a README"  
- העתק את כתובת ה-URL (HTTPS או SSH), למשל:  
  `https://github.com/YOUR_USER/whatsapp-web-plus.git`

### 2. חבר את הריפו המקומי לריפו המרוחק והעלה

בטרמינל, מתוך תיקיית הפרויקט:

```powershell
cd C:\Users\adm_user\whatsapp-web-plus

# הוסף את הריפו המרוחק (החלף ב-URL שלך)
git remote add origin https://github.com/YOUR_USER/whatsapp-web-plus.git

# אופציונלי: שנה את שם הענף ל-main אם הריפו החדש משתמש ב-main
git branch -M main

# העלה את כל הקומיטים
git push -u origin main
```

אם הענף הנוכחי אצלך הוא `mastar` ואתה רוצה להעלות אותו כ-main:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USER/whatsapp-web-plus.git
git push -u origin main
```

אם כבר הוגדר `origin` (למשל מפרויקט אחר), תחילה הסר והגדר מחדש:

```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USER/whatsapp-web-plus.git
git push -u origin main
```
