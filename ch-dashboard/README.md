# Company House Dashboard

Real-time monitoring system for UK company changes with Next.js 14.

## Features

- 📊 Company profile monitoring
- 📑 Filing history with PDF downloads
- 👥 Officer role tracking & history
- 🔄 Real-time updates with SWR
- 📱 Responsive grid layout
- ⚡ ISR Caching (10-minute revalidation)

## API Routes

### Company Endpoints

| Route                                | Method | Description                          |
|--------------------------------------|--------|--------------------------------------|
| `/api/company/[number]`             | GET    | Company profile data                 |
| `/api/company/[number]/officers`    | GET    | List of company officers             |
| `/api/company/[number]/filings`     | GET    | Filing history with metadata         |
| `/api/company/[number]/filings/[transaction_id]/document` | GET | PDF document download |

### Officer Endpoints

| Route                                | Method | Description                          |
|--------------------------------------|--------|--------------------------------------|
| `/api/officer/[id]/appointments`    | GET    | Officer's company appointments       |

### Document Endpoints

| Route                  | Method | Query Params | Description              |
|------------------------|--------|--------------|--------------------------|
| `/api/document`        | GET    | `metaPath`   | Fetch document metadata  |

## 🛠️ Setup Instructions

1. **Environment Variables**
```bash
# .env
CH_API_KEY="your_company_house_key"
COMPANY_NUMBER="12345678"  # Default company to track
NEXT_PUBLIC_POLL_INTERVAL="600000"  # 10 minutes (milliseconds)
```

2. **Install Dependencies**
```bash
npm install
# Key dependencies: next, react, swr, @vercel/geist
```

3. **Development Server**
```bash
npm run dev
```
Access at `http://localhost:3000`

4. **Production Build**
```bash
npm run build && npm start
```

## API Usage Examples

**Get Company Profile**
```javascript
const { data } = useSWR(`/api/company/12345678`, fetcher);
```

**Download Filing PDF**
```javascript
const downloadPdf = async (transactionId) => {
  const res = await fetch(`/api/company/12345678/filings/${transactionId}/document`);
  const blob = await res.blob();
  // Handle PDF download...
};
```

**Get Officer Appointments**
```javascript
const { data } = useSWR(
  `/api/officer/o7x4yEaZRq6HlQ8vGbN3/appointments`,
  fetcher
);
```

## Deployment

Vercel is the recommended deployment platform:
```bash
1. Connect your GitHub/GitLab repository
2. Add environment variables in Vercel dashboard
3. Enable ISR (Incremental Static Regeneration)
4. Deploy!
```

## Troubleshooting

**Common Issues**
- 🔑 `CH_API_KEY not found`: Verify `.env` file is in root directory
- 📄 PDF Download Failures: Check document_metadata endpoint availability
- 🔄 Stale Data: Ensure `NEXT_PUBLIC_POLL_INTERVAL` matches backend
- 🛑 CORS Errors: Only occurs in production - configure CORS in Vercel

**Cache Management**
```javascript
// Force refresh all company data
mutate(/^\/api\/company/);
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-repo%2Fch-dashboard)
