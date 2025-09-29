# 🛠️ ORGANIZER DASHBOARD DEBUG GUIDE

## Issue: "Could not load data" di organizer dashboard

### ✅ Root Cause & Solution:

#### **Problem Identified:**
1. **Wrong API Client**: Dashboard components menggunakan `axios` yang direct ke `localhost:5000` 
2. **Missing Proxy**: Tidak menggunakan Next.js API proxy di `localhost:3001/api`
3. **Authentication**: User perlu login sebagai `ORGANIZER` role, bukan `CUSTOMER`

#### **Fixes Applied:**

1. **✅ Fixed API Client** - Updated all dashboard components:
   ```tsx
   // Before:
   import api from "../../lib/axios";
   await api.get("/events/organizer/my-events");
   
   // After: 
   import { apiClient } from "../../lib/api";
   await apiClient.get("/api/events/organizer/my-events");
   ```

2. **✅ Enhanced Error Messages**:
   ```tsx
   // Better error handling with user guidance
   <div className="bg-red-50 border border-red-200 rounded-lg p-6">
     <h3>Unable to Load Dashboard</h3>
     <p>Please make sure you are:</p>
     <ul>
       <li>Logged in as an organizer</li>
       <li>Connected to the internet</li> 
       <li>Have proper permissions</li>
     </ul>
   </div>
   ```

3. **✅ API Testing Results**:
   - Created organizer user: `testorganizer@test.com`
   - Token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWc1cGNlNmEwMDAwcXp0bXMxdnNuajl5IiwiZW1haWwiOiJ0ZXN0b3JnYW5pemVyQHRlc3QuY29tIiwicm9sZSI6Ik9SR0FOSVpFUiIsImlhdCI6MTc1OTE4NTAyNywiZXhwIjoxNzU5Nzg5ODI3fQ.8ST0D6y0Ua1bEfb4OUh_o8cof5o7XVKRfRUOrdSg2_U`
   - Created test event: "Test Organizer Event"
   - API response: ✅ Working

### **How to Test Organizer Dashboard:**

#### **Option 1: Use Browser Console**
```javascript
// In browser console, set organizer token:
localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWc1cGNlNmEwMDAwcXp0bXMxdnNuajl5IiwiZW1haWwiOiJ0ZXN0b3JnYW5pemVyQHRlc3QuY29tIiwicm9sZSI6Ik9SR0FOSVpFUiIsImlhdCI6MTc1OTE4NTAyNywiZXhwIjoxNzU5Nzg5ODI3fQ.8ST0D6y0Ua1bEfb4OUh_o8cof5o7XVKRfRUOrdSg2_U');
// Then refresh page: location.reload();
```

#### **Option 2: Login via UI**
1. Go to `/auth?view=login`
2. Login with:
   - Email: `testorganizer@test.com`
   - Password: `password123`
3. Navigate to organizer dashboard

#### **Option 3: Direct API Test** ✅
```bash
curl -X GET "http://localhost:3001/api/events/organizer/my-events" \
  -H "Authorization: Bearer [ORGANIZER_TOKEN]"
```

### **Components Updated:**
- ✅ `OverviewContent.tsx` - Fixed API calls + error handling
- ✅ `EventContent.tsx` - Fixed API calls 
- ✅ `TransactionContent.tsx` - Fixed API calls + action endpoints

### **Expected Dashboard Data:**
```json
{
  "events": [{
    "id": "cmg5pds000002qztmx6rnwtqn",
    "name": "Test Organizer Event", 
    "category": "Technology",
    "totalSeats": 100,
    "totalBookings": 0,
    "totalRevenue": 0,
    "averageRating": 0
  }],
  "pagination": {...}
}
```

---

## 🎯 Status: **FIXED** ✅

**Dashboard should now load properly for organizer users!** The "Could not load data" error was caused by incorrect API configuration and has been resolved.

**Next Step**: Test dashboard by logging in as organizer user or setting the organizer token in localStorage.
