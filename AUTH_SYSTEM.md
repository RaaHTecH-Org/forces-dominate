# Auth System Documentation

This document describes the enhanced authentication system implemented in the BlackForce application.

## Overview

The authentication system provides both password-based and magic link authentication options using Supabase Auth. It includes comprehensive error handling, loading states, and a modern UI built with shadcn/ui components.

## Components

### AuthPage.tsx
**Location**: `src/pages/AuthPage.tsx`

The main authentication component that provides:
- **Dual Authentication Methods**: Password-based and magic link authentication
- **Form Validation**: Using react-hook-form with Zod schemas
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Loading States**: Visual feedback during authentication attempts
- **Responsive Design**: Mobile-friendly interface

**Features**:
- Toggle between password and magic link authentication
- Password visibility toggle
- Real-time form validation
- Automatic tab switching on certain actions (e.g., account already exists)
- Toast notifications for user feedback

### AuthContext.tsx
**Location**: `src/contexts/AuthContext.tsx`

Provides global authentication state management:
- **User Session Management**: Handles user state and session persistence
- **Authentication Methods**:
  - `signIn(email, password)` - Password-based authentication
  - `signInWithOtp(email)` - Magic link authentication
  - `signUp(email, password, fullName)` - User registration
  - `signOut()` - User logout
- **Session Persistence**: Automatic session restoration on app reload

### ErrorMessage.tsx
**Location**: `src/components/ErrorMessage.tsx`

Reusable error display component:
- **Multiple Error Types**: Error, warning, info, success
- **Dismissible**: Optional dismiss functionality
- **Accessible**: Proper ARIA labels and semantic HTML

### AuthDemo.tsx
**Location**: `src/pages/AuthDemo.tsx`

Demo page for testing authentication:
- **Protected Route**: Demonstrates route protection
- **User Information Display**: Shows authenticated user details
- **Sign Out Functionality**: Test logout functionality

## Authentication Flow

### Password Authentication
1. User enters email and password
2. Form validation ensures proper email format and password length
3. `signIn` method called from AuthContext
4. Supabase handles authentication
5. Success: User redirected to dashboard
6. Error: Error message displayed with specific feedback

### Magic Link Authentication
1. User enters email address
2. Form validation ensures proper email format
3. `signInWithOtp` method called from AuthContext
4. Supabase sends magic link to user's email
5. Success: Confirmation message shown
6. User clicks link in email to complete authentication
7. User redirected to dashboard

### User Registration
1. User fills out registration form (name, email, password, confirm password)
2. Form validation including password matching
3. `signUp` method called from AuthContext
4. Supabase creates account and sends confirmation email
5. User switched to sign-in tab with email pre-filled
6. User must confirm email before signing in

## Error Handling

The system provides specific error messages for common scenarios:

- **Invalid Credentials**: "Invalid email or password. Please check your credentials and try again."
- **Email Not Confirmed**: "Please check your email and click the confirmation link before signing in."
- **Account Already Exists**: "An account with this email already exists. Please sign in instead."
- **Magic Link Failures**: Specific error messages from Supabase
- **Generic Errors**: "Please try again later." for unexpected errors

## Routes

- `/auth` - Original authentication page
- `/auth-page` - New enhanced authentication page
- `/auth-demo` - Demo page for testing authentication
- `/dashboard/*` - Protected dashboard routes

## Usage

### Basic Implementation
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    // Show login form or redirect to auth
    return <Navigate to="/auth-page" />;
  }
  
  // User is authenticated
  return <DashboardContent user={user} />;
}
```

### Protected Routes
```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route path="/dashboard/*" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Environment Variables

Ensure these environment variables are set:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

1. **Visit `/auth-page`** to test the new authentication UI
2. **Test Password Authentication**: Create account and sign in with password
3. **Test Magic Link**: Use magic link option to receive email link
4. **Test Error States**: Try invalid credentials, unconfirmed emails, etc.
5. **Visit `/auth-demo`** to see user information and test sign out

## Features Included

✅ **Password Authentication** with Supabase Auth  
✅ **Magic Link Authentication** for passwordless login  
✅ **Form Validation** with Zod schemas  
✅ **Error Handling** with user-friendly messages  
✅ **Loading Spinners** for all async operations  
✅ **Responsive Design** for mobile and desktop  
✅ **Toast Notifications** for user feedback  
✅ **Password Visibility Toggle**  
✅ **Session Persistence** across page reloads  
✅ **Protected Routes** for authenticated content  
✅ **Email Confirmation** workflow  
✅ **Automatic Error Recovery** (switching tabs, clearing errors)  

## Security Considerations

- Passwords are handled securely by Supabase
- Magic links include security tokens and expire automatically
- Session tokens are stored securely in localStorage
- Email confirmation required for new accounts
- CSRF protection provided by Supabase
