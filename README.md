# Company House Monitor Systems

Two implementations for monitoring UK company changes:

1. **Legacy Python Script** - Simple CLI monitor
2. **Next.js Dashboard** - Modern web interface with real-time updates

## Prerequisites

- Node.js 18+ (for Next.js)
- Python 3.8+ (for legacy script)
- [Company House API Key](https://developer.company-information.service.gov.uk/)

## 🔄 Environment Setup

Create `.env` file in both project roots:

```bash
# Shared variables
CH_API_KEY="your_api_key_here"
COMPANY_NUMBER="12345678"  # Company to monitor
NEXT_PUBLIC_POLL_INTERVAL="3600000"  # 1 hour in ms (for Next.js)
POLL_INTERVAL_SECONDS="3600"  # 1 hour in seconds (for Python)
```

## 1. Legacy Python Monitor

### Setup
```bash
cd old\ method
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt  # Install: requests python-dotenv colorama
```

### Running
```bash
python ch_monitor.py
```

Features:
- Console-based color output
- Change detection with local JSON cache
- Error-resistant polling loop
- 10-minute "no changes" notification throttle

## 2. Next.js Dashboard

### Setup
```bash
cd ch-dashboard
npm install
```

### Development
```bash
npm run dev
```
Visit `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

Features:
- Real-time company profile monitoring
- Filing history with PDF downloads
- Officer role tracking
- Responsive grid layout
- SWR-powered stale-while-revalidate caching
- Font optimization with Geist

## Key Differences

| Feature              | Python CLI               | Next.js Dashboard        |
|----------------------|--------------------------|--------------------------|
| Interface            | Console                  | Web UI                   |
| Deployment           | Local script             | Vercel/Node server       |
| History              | Local JSON cache         | Browser memory           |
| Notifications        | Console messages         | Real-time UI updates     |
| Document Access      | Metadata only            | PDF downloads            |
| Dependencies         | Requests, Colorama       | React, Next.js, SWR      |

## Troubleshooting

Common Issues:
- `CH_API_KEY not found` - Verify .env file placement
- CORS errors - Ensure running behind Node server
- Stale data - Check `NEXT_PUBLIC_POLL_INTERVAL` matches between envs
- PDF download failures - Verify document_metadata API endpoint 