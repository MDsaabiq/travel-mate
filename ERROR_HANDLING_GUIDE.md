# Error Handling & Troubleshooting Guide

## Overview
This guide helps resolve common issues with the new Chat UI improvements and Notifications system.

---

## Common Issues & Solutions

### 🔴 Issue: Clicking Notification Shows Blank/Error Page

**Problem:** Trip details page shows "Trip not found" or is blank

**Root Causes:**
1. Trip ID is not properly populated in notification
2. Trip was deleted after notification created
3. API endpoint not returning trip data

**Solutions:**

**Solution 1: Verify Notification has trip ID**
```javascript
// Check browser developer tools (F12 → Console)
// Before clicking notification, log it:
// Open Navbar.tsx and add debug log
const handleNotificationClick = async (notification: Notification) => {
  console.log('Notification object:', notification);
  console.log('Trip ID:', notification.trip);
  // ...
}
```

**Solution 2: Check Backend Notification Creation**
```javascript
// In backend/routes/trips.js - join request endpoint
// Ensure trip._id is passed correctly:
const notification = new Notification({
  user: trip.organizer,
  sender: req.user._id,
  type: 'join-request-pending',
  message: `${requestUser.name} requested to join your trip "${trip.title}".`,
  trip: trip._id  // ✅ MUST be trip._id, not trip._id.toString()
});
```

**Solution 3: Verify Trip Endpoint**
```bash
# Test from Postman or curl
GET http://localhost:3000/api/trips/:tripId
# Should return 200 with trip data
# If 404, trip doesn't exist
```

**Solution 4: Check Notifications API**
```bash
# Verify notifications are populated correctly
GET http://localhost:3000/api/notifications
# Response should include:
{
  "notifications": [
    {
      "_id": "...",
      "trip": {
        "_id": "...",
        "title": "...",
        "destination": "..."
      },
      "sender": {
        "name": "..."
      },
      ...
    }
  ]
}
```

---

### 🔴 Issue: Sidebar Won't Close on Mobile

**Problem:** Mobile sidebar stays open or doesn't toggle

**Root Causes:**
1. CSS transform not applied correctly
2. showSidebar state not updating
3. Tailwind CSS purging classes

**Solutions:**

**Solution 1: Verify Tailwind Config**
```javascript
// frontend/tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ✅ Ensure content paths include all component files
}
```

**Solution 2: Check State Management**
```typescript
// In Chat.tsx, verify showSidebar state:
const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);

// Add debug log:
useEffect(() => {
  console.log('Show sidebar:', showSidebar);
}, [showSidebar]);
```

**Solution 3: Clear Browser Cache**
```bash
# Hard refresh browser
CTRL+SHIFT+R (Windows/Linux)
CMD+SHIFT+R (Mac)
# Or clear cache in DevTools Settings
```

**Solution 4: Verify Transform CSS**
```css
/* Check in DevTools that this class exists */
.-translate-x-full {
  transform: translateX(-100%);
}

.translate-x-0 {
  transform: translateX(0);
}
```

---

### 🔴 Issue: Messages Overflow on Mobile

**Problem:** Message text breaks layout or goes off-screen

**Root Causes:**
1. Missing `break-words` class
2. Max-width not set correctly
3. Padding too large

**Solutions:**

**Solution 1: Verify Message Styling**
```typescript
// In Chat.tsx, message rendering:
<div className="px-3 sm:px-4 py-2 rounded-2xl">
  <p className="text-sm break-words">{message.content}</p>
  {/* ✅ break-words ensures text wraps */}
</div>
```

**Solution 2: Check Max Width**
```typescript
// Message container should have:
className={`flex items-end space-x-2 max-w-xs sm:max-w-sm lg:max-w-md ...`}
// ✅ Different widths for different screens
```

**Solution 3: Test with Long Text**
```typescript
// Add test message to verify:
const testMessage = "This is a very long message that should break into multiple lines on mobile without breaking the layout. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
```

---

### 🔴 Issue: Notification Panel Too Wide or Misaligned

**Problem:** Notification dropdown goes off-screen or misaligned

**Root Causes:**
1. Position absolute conflicting with parent
2. Width too large for screen
3. Z-index issues

**Solutions:**

**Solution 1: Verify Position**
```javascript
// In Navbar.tsx:
<div className="absolute right-0 mt-2 w-96 max-w-md ...">
  {/* ✅ absolute right-0 positions from right edge */}
  {/* ✅ max-w-md ensures never too wide */}
</div>
```

**Solution 2: Check Parent Overflow**
```javascript
// Ensure parent div is:
<div className="relative">
  {/* ✅ relative allows absolute positioning inside */}
  <button>Bell Icon</button>
  <div className="absolute">Notification Panel</div>
</div>
```

**Solution 3: Responsive Width**
```javascript
// For mobile, the max-w-md should be enough
// But you can add sm: breakpoint if needed:
className="w-96 sm:w-80 md:w-96"
```

---

### 🔴 Issue: Join Request Notification Not Appearing

**Problem:** No notification appears when user sends join request

**Root Causes:**
1. Join request endpoint error
2. Notification not saving to database
3. User not fetching notifications

**Solutions:**

**Solution 1: Check Backend Join Endpoint**
```javascript
// backend/routes/trips.js - verify this code exists:
// Around line 428-437
const requestUser = await User.findById(req.user._id);
const notification = new Notification({
  user: trip.organizer,
  sender: req.user._id,
  type: 'join-request-pending',
  message: `${requestUser.name} requested to join your trip "${trip.title}".`,
  trip: trip._id
});
await notification.save();
```

**Solution 2: Enable Debug Logging**
```javascript
// In trips.js, add console logs:
console.log('Creating notification for organizer:', trip.organizer);
console.log('From user:', req.user._id);
notification.save().then(() => {
  console.log('Notification saved successfully');
}).catch(err => {
  console.error('Failed to save notification:', err);
});
```

**Solution 3: Verify Organizer is Receiving It**
```bash
# Test: Get notifications for organizer
GET http://localhost:3000/api/notifications
# Should show join-request-pending type
```

**Solution 4: Check Notification Model**
```javascript
// Verify backend/models/Notification.js has:
enum: ['join-request-accepted', 'join-request-rejected', 'join-request-pending', 'new-message']
// ✅ Must include 'join-request-pending'
```

---

### 🔴 Issue: Search Not Working in Chat Sidebar

**Problem:** Typing in search box doesn't filter trips

**Root Causes:**
1. onChange handler not connected
2. filteredTrips not computed correctly
3. Search field not clearing

**Solutions:**

**Solution 1: Verify Search State**
```typescript
// In Chat.tsx, check this exists:
const [searchText, setSearchText] = useState('');

// Input field should have:
<input
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
  placeholder="Search trips..."
/>
```

**Solution 2: Verify Filter Logic**
```typescript
// Computed state should be:
const filteredTrips = userTrips.filter(trip =>
  trip.title.toLowerCase().includes(searchText.toLowerCase()) ||
  trip.destination.toLowerCase().includes(searchText.toLowerCase())
);

// Render filteredTrips, not userTrips:
{filteredTrips.map((trip) => (
  // ✅ Use filteredTrips here
))}
```

**Solution 3: Test Filter**
```typescript
// Add debug to check filtering:
console.log('Search text:', searchText);
console.log('User trips:', userTrips);
console.log('Filtered trips:', filteredTrips);
```

---

## Database Consistency Issues

### 🔴 Issue: Old Notifications Causing Errors

**Problem:** Old notifications have invalid type, causing errors

**Solution: Run Cleanup**
```bash
# Call cleanup endpoint once
POST http://localhost:3000/api/notifications/cleanup/invalid

# Or manually in MongoDB:
db.notifications.deleteMany({
  type: { $nin: ['join-request-accepted', 'join-request-rejected', 'join-request-pending', 'new-message'] }
})
```

---

## Network & API Issues

### 🔴 Issue: Notification Fetch Fails

**Problem:** "Failed to fetch notifications" error

**Root Causes:**
1. API endpoint error
2. Authentication failed
3. Network timeout

**Solutions:**

**Solution 1: Check API Response**
```javascript
// In browser console:
fetch('/notifications')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error('Error:', e));
```

**Solution 2: Verify Auth Token**
```javascript
// Check if token exists:
console.log('Auth token:', localStorage.getItem('token'));
```

**Solution 3: Check Network Tab**
1. Open DevTools (F12)
2. Go to Network tab
3. Click bell icon
4. Check the `/notifications` request
5. Status should be 200, not 401/403/500

---

## Performance Issues

### 🔴 Issue: Chat Page Slow on Mobile

**Problem:** Sidebar animation stutters or messages load slow

**Solutions:**

**Solution 1: Optimize List Rendering**
```typescript
// Use React.memo for trip items:
const TripItem = React.memo(({ trip, selected, onClick }) => (
  // Trip rendering
));
```

**Solution 2: Lazy Load Messages**
```typescript
// Limit initial messages:
const displayMessages = messages.slice(-50); // Show last 50
```

**Solution 3: Check Console**
```javascript
// Look for:
// - Warning about large lists
// - Memory leaks
// - Re-renders
```

---

## Testing Checklist Before Deployment

- [ ] **Chat Mobile**: Sidebar opens/closes smoothly
- [ ] **Chat Mobile**: Messages don't overflow
- [ ] **Chat Search**: Filter works correctly
- [ ] **Notifications**: Panel appears and closes
- [ ] **Notifications**: Can scroll if many items
- [ ] **Join Request**: Notification created immediately
- [ ] **Join Request**: Notification has sender info
- [ ] **Trip Navigation**: Clicking notification loads trip
- [ ] **Trip Navigation**: Trip details show without errors
- [ ] **Responsive**: Works on 320px, 768px, 1200px screens
- [ ] **Performance**: No console errors
- [ ] **Performance**: Animations smooth (60fps)

---

## Debug Commands

```javascript
// Test join request (backend):
curl -X POST http://localhost:3000/api/trips/TRIP_ID/join \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

// Test get notifications:
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer TOKEN"

// Test get trip:
curl -X GET http://localhost:3000/api/trips/TRIP_ID
```

---

## When to Clear Cache

Clear browser cache if:
- ✅ CSS classes not showing
- ✅ Old code running
- ✅ Styles disappearing randomly
- ✅ Can't see new features

**Clear Cache:**
```
Chrome/Edge: Ctrl+Shift+Delete
Firefox: Ctrl+Shift+Delete
Safari: Cmd+Shift+Delete
```

**Or Force Refresh:**
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

---

## Still Having Issues?

1. **Check console** for JavaScript errors (F12)
2. **Check Network tab** for failed API requests
3. **Verify database** has new notification types
4. **Clear cache** and hard refresh
5. **Check backend logs** for server errors
6. **Restart servers** (both backend and frontend)

---

## Support Resources

- See **IMPROVEMENTS_SUMMARY.md** for code details
- See **QUICK_START_GUIDE.md** for usage instructions
- Check git diff for exact changes made
- Review backend/routes/trips.js for join request logic
- Review backend/routes/notifications.js for notification logic
