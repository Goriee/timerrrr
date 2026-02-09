# Frontend README

## Overview

Next.js 14 frontend with TypeScript, Tailwind CSS, and FullCalendar for Guild Boss Timer.

## Structure

```
frontend/
├── app/
│   ├── page.tsx          # Home page (boss list)
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── calendar/
│       └── page.tsx      # Calendar view
├── components/
│   ├── LiveTimer.tsx     # Live countdown timer
│   ├── PasswordModal.tsx # Password authentication
│   └── EditBossModal.tsx # Boss editing form
├── lib/
│   ├── api.ts            # API client functions
│   └── utils.ts          # Utility functions
├── types/
│   └── index.ts          # TypeScript interfaces
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind CSS config
└── next.config.js        # Next.js config
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Configure environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start development server:
```bash
npm run dev
```

Frontend runs on http://localhost:3000

## Features

### Home Page (Boss List)
- Live countdown timers
- Filter by location
- Filter by attack type
- Filter by status (alive/scheduled)
- Edit boss times (password protected)
- Mark boss as killed (password protected)
- Auto-refresh every minute

### Calendar Page
- Monthly/weekly/daily views
- Color-coded events (red=melee, purple=magic)
- Click event to edit boss
- FullCalendar integration

### Components

**LiveTimer**
- Real-time countdown
- Updates every second
- Color changes based on time remaining
- Shows "ALIVE" when timer hits zero

**PasswordModal**
- Password authentication
- Used before editing or killing boss
- Default password: "naiwan"

**EditBossModal**
- Edit last kill time
- Edit next spawn time
- Edit respawn hours
- Auto-calculate next spawn

## Styling

Built with Tailwind CSS:

- Dark mode support
- Responsive design
- Mobile-friendly
- Custom colors for melee/magic

## API Integration

All API calls in `lib/api.ts`:

```typescript
import { bossApi } from '@/lib/api';

// Get all bosses
const bosses = await bossApi.getAllBosses();

// Mark boss as killed
await bossApi.killBoss(bossId, password);

// Update boss
await bossApi.updateBoss(bossId, password, updates);
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:3001 |

Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |

## Dependencies

### Production
- `next` - React framework
- `react` - UI library
- `react-dom` - React DOM renderer
- `axios` - HTTP client
- `@fullcalendar/react` - Calendar component
- `date-fns` - Date utilities

### Development
- `typescript` - TypeScript compiler
- `tailwindcss` - CSS framework
- `autoprefixer` - CSS post-processor
- `eslint` - Linting
- `@types/*` - TypeScript types

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import to Vercel
3. Set root directory to `frontend`
4. Set `NEXT_PUBLIC_API_URL` environment variable
5. Deploy

See `DEPLOYMENT.md` for detailed instructions.

## Customization

### Add New Filter
Edit `app/page.tsx`:
```typescript
const [filterCustom, setFilterCustom] = useState('all');
```

### Change Timer Colors
Edit `lib/utils.ts`:
```typescript
export function getTimerColor(totalMs: number): string {
  // Customize color thresholds
}
```

### Modify Calendar Colors
Edit `app/calendar/page.tsx`:
```typescript
backgroundColor: boss.attackType === 'melee' ? '#ef4444' : '#a855f7'
```

### Add New Boss Field
1. Update `types/index.ts`
2. Update backend API
3. Update `EditBossModal.tsx`
4. Update display components

## Troubleshooting

### Build fails
```bash
# Clear cache
rm -rf .next
npm run build
```

### API connection issues
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check browser console for errors
- Verify CORS settings in backend

### Styling issues
```bash
# Rebuild Tailwind
npm run dev
```

### TypeScript errors
```bash
# Check types
npx tsc --noEmit
```

## Best Practices

1. **Keep API calls in lib/api.ts**
2. **Use Server Components when possible**
3. **Use Client Components only when needed** ('use client' directive)
4. **Follow Next.js App Router conventions**
5. **Keep types in sync with backend**

## Development Tips

### Hot Reload
Changes to files trigger automatic reload. If not working:
```bash
# Restart dev server
Ctrl+C
npm run dev
```

### Debug API Calls
Check Network tab in browser DevTools to see all API requests.

### Test Responsive Design
Use browser DevTools mobile emulator (F12 → Device toolbar)

## File Organization

```
app/           # Next.js routes (App Router)
components/    # Reusable React components
lib/           # Utility functions and API client
types/         # TypeScript type definitions
public/        # Static files
```

## Performance

- Server Components for static content
- Client Components for interactivity
- Auto-refresh limited to 60 seconds
- Countdown timer optimized with single interval

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast (WCAG AA)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers
