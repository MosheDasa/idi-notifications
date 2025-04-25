# IDI Notifications

מערכת להצגת התראות בזמן אמת על גבי שולחן העבודה של Windows.

## תכונות עיקריות

- הצגת התראות בפינה הימנית התחתונה של המסך
- תמיכה בחמישה סוגי התראות:
  - מידע (INFO)
  - שגיאה (ERROR)
  - מטבעות (COINS)
  - HTML חופשי
  - HTML מ-URL
- התאמה אוטומטית של גודל החלון למספר ההתראות
- סגירה אוטומטית של התראות זמניות
- השהיית סגירה אוטומטית בעת מעבר עכבר
- שקיפות ואנימציות חלקות

## דרישות מערכת

- Windows 10 ומעלה
- Node.js 14 ומעלה
- npm 6 ומעלה

## התקנה

1. התקנת תלויות:

```bash
npm install
```

2. הגדרת קובץ קונפיגורציה:

```bash
# צור תיקיית קונפיגורציה
mkdir %USERPROFILE%\idi-notifications-config

# צור קובץ קונפיגורציה
echo {
  "API_URL": "http://localhost:3001/notifications/check",
  "API_POLLING_INTERVAL": 10000,
  "LOG": true
} > %USERPROFILE%\idi-notifications-config\config.json
```

## פיתוח

1. הרצת שרת פיתוח:

```bash
npm run dev
```

2. בניית קוד:

```bash
npm run build
```

3. בדיקת לינטינג:

```bash
npm run lint
```

## בניית גרסת הפצה

1. בניית גרסת הפצה:

```bash
npm run make
```

2. הגרסה תיבנה בתיקיית `out/`

## מבנה הפרויקט

```
src/
├── main.ts              # תהליך ראשי של Electron
├── index.tsx           # נקודת כניסה של React
├── components/         # קומפוננטות React
│   ├── common/         # קומפוננטות משותפות
│   ├── info/          # התראות מידע
│   ├── error/         # התראות שגיאה
│   ├── coins/         # התראות מטבעות
│   ├── free-html/     # התראות HTML חופשי
│   └── url-html/      # התראות HTML מ-URL
└── utils/             # פונקציות עזר
```

## קונפיגורציה

המערכת משתמשת בקובץ קונפיגורציה חיצוני:

- **מיקום**: `%USERPROFILE%\idi-notifications-config\config.json`
- **פרמטרים**:
  - `API_URL`: כתובת ה-API לבדיקת התראות
  - `API_POLLING_INTERVAL`: מרווח בדיקה (במילישניות)
  - `LOG`: האם להפעיל לוגים

## לוגים

הלוגים נשמרים בתיקייה:

- **מיקום**: `%USERPROFILE%\idi-notifications-config\log\`
- **פורמט**: `idi-notifications-YYYY-MM-DD.log`

## תקשורת

המערכת מתקשרת עם שרת ההתראות באמצעות WebSocket:

- **חיבור**: `ws://localhost:3001?userId={USERNAME}`
- **פרוטוקול**: JSON מבוסס אירועים
- **התחברות מחדש**: אוטומטית כל 5 שניות בניתוק

## פיתוח עתידי

1. תמיכה במערכות הפעלה נוספות
2. תמיכה בקבוצות התראות
3. אפשרויות עיצוב נוספות
4. אינטגרציה עם מערכות נוספות
5. תמיכה בהתראות מרובות שפות

## תרומה

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. בצע commit לשינויים (`git commit -m 'Add amazing feature'`)
4. Push את ה-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## רישיון

MIT
