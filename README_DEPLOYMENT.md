# Quick Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
1. Install dependencies: `npm install`
2. Run database migrations: `npm run db:push`
3. Seed test data: `npx tsx src/scripts/seed-test-data.ts`

### Test Credentials
- **Business Login**: `business@test.com` / `password123`
- **Business URL**: `/en/login` or `/en/onboarding`

### Deploy Steps
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Verify Deployment
- ✅ Business Dashboard: `/en/onboarding?tab=appointments`
- ✅ Admin Appointments: `/en/admin/appointments`
- ✅ Admin Business Browser: `/en/admin/businesses`

For detailed instructions, see `DEPLOYMENT_GUIDE.md` in the artifacts folder.
