# Field `residence` - Database Persistence

## Problem Solved

The residence selected by the user during registration was only stored in localStorage, which caused it to be lost when refreshing the page or switching devices.

## Implemented Changes

### 1. Database Schema (Prisma)

**File:** `prisma/schema.prisma`

```prisma
model User {
  // ... other fields
  residence        String? // Residence chosen by the user (e.g. 'ONE' or 'AMBRO')
  // ... other fields
}
```

- ✅ Uncommented the `residence` field in the User model
- ✅ Applied with `npx prisma db push`

### 2. Frontend - Registration Form

**File:** `src/app/registro/page.tsx`

```typescript
const payload = {
  // ... other fields
  residence: formData.residence || null, // Include selected residence
  // ... other fields
};
```

- ✅ Added `residence` to the payload sent to the API
- ✅ The selected value is sent from the registration form

### 3. Backend - Registration API

**File:** `src/app/api/auth/register/route.ts`

```typescript
// Destructuring received data
const { 
  // ... other fields
  residence,
  // ... other fields
} = await request.json();

// Saving to database
if (residence) userData.residence = residence; // Save selected residence
```

- ✅ Receives the `residence` field from the frontend
- ✅ Saves it in the database during registration

### 4. Backend - User API

**File:** `src/app/api/user/by-email/route.ts`

```typescript
const userProfile = {
  // ... other fields
  residence: (user as any).residence ?? null, // Include residence from database
  // ... other fields
};
```

- ✅ Includes the `residence` field when returning user data
- ✅ It is obtained directly from the database

## Full Flow

### User Registration
1. User selects a residence in the form
2. Frontend sends `residence` in the payload to the API
3. Backend saves `residence` in the User table
4. The user is registered with a persistent residence

### User Load (Login/Refresh)
1. AuthContext requests user data via `/api/user/by-email`
2. API queries the database including the `residence` field
3. Frontend receives the complete user data
4. Residence remains available without relying on localStorage

## Benefits

✅ **Real persistence**: Residence is stored in the database
✅ **Multi-device sync**: Available on any device
✅ **Recovery after refresh**: Not lost on page refresh
✅ **Data consistency**: Consistent and reliable data
✅ **Compatibility**: Works with existing users (null by default)

## Compatibility with Existing Users

- Users registered before this change will have `residence: null`
- They can update their residence via the profile (future functionality)
- No data migration required for existing users

## Testing

The field was tested successfully:
- ✅ Field added to the database
- ✅ Write and read working correctly
- ✅ Compatible with existing users
- ✅ APIs updated and working

## Next Steps

To complete the feature, consider:
- [ ] Add an option to edit residence in the user profile
- [ ] Validation of allowed values for `residence`
- [ ] Migration of localStorage data to the database for existing users
