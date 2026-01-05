# 🔧 Fix "Failed to Fetch" Error

## Problem
The payment modal shows "Failed to fetch" error when trying to initialize payment.

## Cause
The backend payment API server is not running. The frontend tries to connect to `http://localhost:3001/api/payments` but the server isn't available.

## Solution

### Step 1: Start the Backend Payment API Server

**Open a NEW terminal window** (keep your frontend running in the other terminal) and run:

```bash
npm run payment-api
```

You should see:
```
✅ Stripe Payment API server running on port 3001
📝 Make sure STRIPE_SECRET_KEY is set in .env
🔗 API endpoint: http://localhost:3001/api/payments
```

**Important:** Keep this terminal window open - the backend server must stay running!

### Step 2: Verify the Server is Running

Test the server by opening in your browser:
```
http://localhost:3001/health
```

You should see:
```json
{"status":"ok","provider":"stripe"}
```

### Step 3: Check Your Frontend .env

Make sure your `.env` file (in the root directory) has:

```env
REACT_APP_PAYMENT_API_URL=http://localhost:3001/api/payments
```

### Step 4: Restart Your Frontend

After starting the backend server, restart your frontend:

```bash
# Stop frontend (Ctrl+C)
npm start
```

## Verification

1. ✅ Backend server running (`npm run payment-api`)
2. ✅ Backend accessible at `http://localhost:3001/health`
3. ✅ Frontend `.env` has `REACT_APP_PAYMENT_API_URL`
4. ✅ Frontend restarted after backend is running

## Common Issues

### "Port 3001 already in use"
- Another process is using port 3001
- Change `PORT=3001` to `PORT=3002` in `server/.env`
- Update `REACT_APP_PAYMENT_API_URL` in `.env` to match

### "Cannot find module 'express'"
- Run: `npm install express stripe cors dotenv --legacy-peer-deps`

### CORS errors
- Make sure `ALLOWED_ORIGINS` in `server/.env` includes your frontend URL
- Default: `http://localhost:3000,http://localhost:3001`

## Quick Test

Once both servers are running:

1. Open payment modal
2. Should see "Initializing payment..." then Stripe Elements
3. No "Failed to fetch" error

