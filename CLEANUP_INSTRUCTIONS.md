# Cleanup Invalid Notifications

## Problem
Old notifications in the database have invalid enum values that cause validation errors.

## Solution

### Automatic Cleanup (Recommended)
1. Restart the backend server
2. Refresh the frontend
3. Invalid notifications will be automatically deleted when fetching

### Manual Cleanup (Optional)
Use this curl command or Postman to manually clean up all invalid notifications:

```bash
# Using curl (replace YOUR_AUTH_TOKEN with your actual token)
curl -X DELETE http://localhost:3000/api/notifications/cleanup/invalid \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Or using PowerShell:
```powershell
# Replace YOUR_AUTH_TOKEN with your actual token
Invoke-RestMethod -Uri "http://localhost:3000/api/notifications/cleanup/invalid" `
  -Method DELETE `
  -Headers @{ "Authorization" = "Bearer YOUR_AUTH_TOKEN" }
```

## Valid Notification Types
- `join-request-accepted`
- `join-request-rejected`
- `new-message`

## What Was Fixed
1. Chat notifications now use `new-message` instead of `new_message`
2. Added `sender` field to all notifications
3. Auto-cleanup of invalid notifications on fetch
4. Manual cleanup endpoint for maintenance