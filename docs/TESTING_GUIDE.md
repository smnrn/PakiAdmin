# Testing Guide: Password Recovery Flow

## Overview

This guide covers testing for both:
1. **Forgot Password** - Request reset link via email
2. **Reset Password** - Create new password with token

---

# Part 1: Forgot Password Feature

## Quick Test: Forgot Password

### Test with Valid Email (Success) ✅

1. **Navigate to Forgot Password Page**
   ```
   URL: /pakiadmin/forgot-password
   ```

2. **Enter Registered Email**
   ```
   Email: admin@pakiadmin.ph
   ```

3. **Submit Form**
   - Click "Send Recovery Link"
   - Wait for processing (1.5 seconds)

4. **Verify Success Screen**
   - Green checkmark appears
   - Email address is displayed
   - Next steps are shown
   - Expiration notice (60 minutes)

### Test with Unregistered Email (Error) ❌

1. **Navigate to Forgot Password Page**
2. **Enter Unregistered Email**
   ```
   Email: notregistered@example.com
   ```
3. **Submit Form**
4. **Verify Error Message**
   ```
   "This email address is not registered in our system. 
   Please check your email or contact support."
   ```

### Test with Invalid Format (Error) ❌

1. **Navigate to Forgot Password Page**
2. **Enter Invalid Email**
   ```
   Email: invalid-email
   ```
3. **Submit Form**
4. **Verify Error Message**
   ```
   "Please enter a valid email address."
   ```

## Registered Test Emails

Use these emails for successful tests:
```
✅ admin@pakiadmin.ph
✅ juandelacruz@pakiadmin.ph
✅ marthaburgos@pakiadmin.ph
✅ test@pakiadmin.ph
✅ demo@pakiadmin.ph
```

## Forgot Password Test Scenarios

### Scenario 1: Happy Path ✅
```
1. Go to /pakiadmin/forgot-password
2. Email: admin@pakiadmin.ph
3. Click "Send Recovery Link"
4. See success screen
5. Verify email displayed
6. Click "Return to Login"
```

### Scenario 2: Email Not Found ❌
```
1. Go to /pakiadmin/forgot-password
2. Email: unknown@test.com
3. Click "Send Recovery Link"
4. See error message
5. Correct email
6. Resubmit
```

### Scenario 3: Try Again Flow ✅
```
1. Complete successful submission
2. On success screen, click "Try again"
3. Form resets
4. Enter different email
5. Submit again
```

---

# Part 2: Password Reset Feature

## Quick Start

### Test the Complete Password Reset Flow

1. **Navigate to Login Page**
   ```
   URL: /pakiadmin/login
   ```

2. **Request Password Reset**
   - Click "Forgot Password?" link
   - Enter email: `admin@pakiadmin.ph`
   - Click "Request Access Reset"
   - See confirmation message

3. **Access Reset Page (Demo)**
   ```
   URL: /pakiadmin/reset-password?token=demo_reset_token_123
   ```
   *Note: In production, users would click this link from their email*

4. **Test Password Validation**

   Try these password examples:

   ❌ **Too Short**
   ```
   Password: "Pass1!"
   Result: Fails minimum length requirement
   ```

   ❌ **No Special Character**
   ```
   Password: "Password123"
   Result: Fails special character requirement
   ```

   ❌ **No Number**
   ```
   Password: "Password!"
   Result: Fails number requirement
   ```

   ✅ **Valid Password**
   ```
   New Password: "SecurePass123!"
   Confirm Password: "SecurePass123!"
   Result: All validations pass, form submittable
   ```

5. **Complete Reset**
   - Enter valid password in both fields
   - Watch validation checklist turn green
   - Click "Reset Password"
   - See success message
   - Auto-redirect to login page

## Test Scenarios

### Scenario 1: Happy Path ✅
```
1. Go to /pakiadmin/reset-password?token=abc123
2. New Password: "MyNewPassword123!"
3. Confirm: "MyNewPassword123!"
4. All checks green ✓
5. Submit → Success → Redirect
```

### Scenario 2: Invalid Token ❌
```
1. Go to /pakiadmin/reset-password (no token)
2. See error screen
3. Click "Return to Login"
4. Back at login page
```

### Scenario 3: Password Mismatch ❌
```
1. Go to /pakiadmin/reset-password?token=abc123
2. New Password: "StrongPass123!"
3. Confirm: "DifferentPass123!"
4. See "Passwords do not match" error
5. Fix and resubmit
```

### Scenario 4: Weak Password ❌
```
1. Go to /pakiadmin/reset-password?token=abc123
2. New Password: "weak"
3. Multiple validation items fail
4. Submit button disabled
5. Strengthen password to proceed
```

## Visual Validation Checklist

When entering password, you'll see these checks:

- ⚪ → ✅ At least 8 characters
- ⚪ → ✅ Contains uppercase letter (A-Z)
- ⚪ → ✅ Contains lowercase letter (a-z)
- ⚪ → ✅ Contains number (0-9)
- ⚪ → ✅ Contains special character (!@#$%...)
- ⚪ → ✅ Passwords match

*Gray circles = Not met*
*Green circles with checkmarks = Met*

## Example Valid Passwords

Copy and paste these for quick testing:

```
SecureAdmin2024!
MyP@ssw0rd!
Str0ngP@ss!
Admin#Pass123
Test$ecure99
```

## Example Invalid Passwords

Test validation with these:

```
short1!          → Too short
NoNumbers!       → Missing number
nonumbersorspec  → Missing number & special char
ALLUPPERCASE1!   → Missing lowercase
alllowercase1!   → Missing uppercase
NoSpecial123     → Missing special character
```

## Developer Console Logs

When requesting password reset, check browser console for:

```javascript
// Console output:
Reset link would be sent to: admin@pakiadmin.ph
Demo reset link: /pakiadmin/reset-password?token=demo_reset_token_123
```

## URLs Reference

| Page | URL |
|------|-----|
| Login | `/pakiadmin/login` |
| Signup | `/pakiadmin/signup` |
| **Forgot Password** | `/pakiadmin/forgot-password` |
| Reset Password (Demo) | `/pakiadmin/reset-password?token=demo_reset_token_123` |
| Reset Password (Custom) | `/pakiadmin/reset-password?token={any_token}` |

## Complete Recovery Flow Test

Test the entire password recovery process from start to finish:

```
1. Login Page (/pakiadmin/login)
   ↓
   Click "Forgot Password?"
   ↓
2. Forgot Password Modal
   → Click modal link or navigate to /pakiadmin/forgot-password
   ↓
3. Forgot Password Page
   → Enter: admin@pakiadmin.ph
   → Click "Send Recovery Link"
   ↓
4. Success Screen
   → See confirmation
   → Check browser console for reset link
   ↓
5. Copy reset link from console
   → Example: /pakiadmin/reset-password?token=secure_token_1234567890
   ↓
6. Navigate to reset link
   ↓
7. Reset Password Page
   → New Password: SecurePass123!
   → Confirm: SecurePass123!
   ↓
8. Success Screen
   → Auto-redirect to login
   ↓
9. Login with new password
```

## Testing Checklist

Use this checklist to verify all features work:

### Forgot Password Features
- [ ] Email input field accepts valid email format
- [ ] Email validation works in real-time
- [ ] Submit button shows loading state
- [ ] Valid email shows success screen
- [ ] Unregistered email shows error message
- [ ] Invalid format shows error message
- [ ] Success screen displays correct email
- [ ] "Try again" resets form correctly
- [ ] "Return to Login" navigates correctly
- [ ] "Back to Login" header link works
- [ ] Console logs reset link for testing
- [ ] Animations work smoothly
- [ ] Page is responsive on mobile

### Reset Password Form Features
- [ ] Both password fields have show/hide toggle
- [ ] Clicking eye icon reveals/hides password
- [ ] Password fields masked by default
- [ ] Validation updates in real-time as user types
- [ ] Submit button disabled until all validations pass
- [ ] Submit button enabled when all validations pass

### Validation Items
- [ ] Minimum 8 characters check works
- [ ] Uppercase letter check works
- [ ] Lowercase letter check works
- [ ] Number check works
- [ ] Special character check works
- [ ] Password match check works

### Error Handling
- [ ] Missing token shows error page
- [ ] Invalid token shows error page
- [ ] Password mismatch shows error message
- [ ] Weak password shows error message
- [ ] Error messages are clear and helpful

### Success Flow
- [ ] Success screen appears after valid submission
- [ ] Success message is clear and reassuring
- [ ] Auto-redirect works after 3 seconds
- [ ] Manual "Proceed to Login" button works
- [ ] Redirect goes to correct login page

### Design & UX
- [ ] Page matches PakiAdmin purple theme
- [ ] All animations work smoothly
- [ ] Form is responsive on mobile
- [ ] Buttons have hover states
- [ ] Focus states are visible
- [ ] Icons are properly aligned

### Navigation
- [ ] "Back to Login" link works on reset page
- [ ] "Return to Login" works on error page
- [ ] "Proceed to Login" works on success page
- [ ] Browser back button works correctly

## Common Issues & Solutions

### Issue: "Invalid or missing reset token"
**Solution**: Make sure URL includes `?token=` parameter
```
❌ /pakiadmin/reset-password
✅ /pakiadmin/reset-password?token=abc123
```

### Issue: Submit button stays disabled
**Solution**: Check that all validation items are green
- Review password requirements
- Ensure both passwords match exactly
- Try example valid password above

### Issue: Form submitted but nothing happens
**Solution**: Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page
- Clear browser cache if needed

## Integration Testing

For full end-to-end testing:

1. **Start Application**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Open Browser**
   ```
   Navigate to: http://localhost:5173
   ```

3. **Follow Happy Path**
   - Complete login page → forgot password → reset password → success → login

4. **Test Edge Cases**
   - Try all invalid password scenarios
   - Test token validation
   - Test navigation flows

## Automated Testing (Future)

Consider adding these test cases:

```typescript
describe('Password Reset Flow', () => {
  it('should show error when token is missing', () => {
    // Test token validation
  });

  it('should validate password requirements', () => {
    // Test each validation rule
  });

  it('should show error when passwords do not match', () => {
    // Test password matching
  });

  it('should successfully reset password with valid input', () => {
    // Test happy path
  });

  it('should redirect to login after successful reset', () => {
    // Test redirect logic
  });
});
```

## Support

If you encounter issues:
1. Check this guide first
2. Review `PASSWORD_RESET_FLOW.md` for technical details
3. Check browser console for errors
4. Verify all dependencies are installed

---

**Last Updated**: April 30, 2026
**Version**: 1.0.0
