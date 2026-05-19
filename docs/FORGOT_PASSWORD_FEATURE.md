# Forgot Password Feature Documentation

## Overview

The Forgot Password feature allows administrators to securely recover their account access by requesting a password reset link sent to their registered email address.

## Features

### 1. **Email-Based Recovery**
- Admin enters their registered email address
- System validates email format
- Checks if email exists in the database
- Sends secure reset link to verified email

### 2. **Email Validation**
- Real-time format validation
- Database lookup to verify registration
- Clear error messages for invalid or unregistered emails

### 3. **Success & Error States**

#### **Success State**
When email is found and reset link is sent:
- ✅ Confirmation message with email address
- 📧 Clear next steps instructions
- ⏰ Expiration notice (60 minutes)
- 🔄 Option to try again if email not received

#### **Error States**
- ❌ Invalid email format
- ❌ Email not registered in system
- ❌ Network/server errors

### 4. **Security Features**
- Encrypted reset links
- Time-limited tokens (60 minutes)
- Single-use reset tokens
- Email verification before sending

## User Flow

### Step 1: Access Forgot Password Page
```
Route: /pakiadmin/forgot-password
```

User can access via:
1. Direct URL navigation
2. "Forgot Password?" link on login page
3. "Back to Login" navigation header

### Step 2: Enter Email Address
1. User enters their admin email
2. System validates email format in real-time
3. User clicks "Send Recovery Link"

### Step 3: Email Verification
System checks if email is registered:
- **If registered**: Proceed to send reset link
- **If not registered**: Show error message

### Step 4: Success Confirmation
If email is found:
1. Display success message
2. Show submitted email address
3. Provide next steps instructions
4. Offer option to return to login or try again

### Step 5: Error Handling
If email is not found:
```
Error: "This email address is not registered in our system. 
Please check your email or contact support."
```

## Testing the Feature

### Registered Test Emails

The following emails are pre-registered for testing:

```
✅ admin@pakiadmin.ph
✅ juandelacruz@pakiadmin.ph
✅ marthaburgos@pakiadmin.ph
✅ test@pakiadmin.ph
✅ demo@pakiadmin.ph
```

### Test Scenarios

#### Scenario 1: Valid Email (Success) ✅
```
1. Navigate to /pakiadmin/forgot-password
2. Enter: admin@pakiadmin.ph
3. Click "Send Recovery Link"
4. See success message
5. Email address is displayed
6. Next steps are shown
```

#### Scenario 2: Unregistered Email (Error) ❌
```
1. Navigate to /pakiadmin/forgot-password
2. Enter: unknown@example.com
3. Click "Send Recovery Link"
4. See error: "This email address is not registered..."
5. Form remains active for retry
```

#### Scenario 3: Invalid Email Format (Error) ❌
```
1. Navigate to /pakiadmin/forgot-password
2. Enter: invalid-email
3. Click "Send Recovery Link"
4. See error: "Please enter a valid email address."
```

#### Scenario 4: Retry After Success ✅
```
1. Complete successful submission
2. Click "Try again" link
3. Form resets to initial state
4. User can submit different email
```

## UI Components

### Main Form
- Email input field with Mail icon
- Validation helper text
- Submit button with loading state
- Back to login link

### Success Screen
- Large green checkmark icon (20x20)
- Bold success heading
- Email address display box
- Next steps card with:
  - Email icon
  - Numbered instructions
  - Expiration warning
- Return to login button
- "Try again" option

### Error Display
- Red error banner at top
- AlertCircle icon
- Clear error message
- Form remains visible for correction

## Design System

### Colors
- **Primary Purple**: `#2c0735`
- **Light Purple**: `#dec0f1`
- **Success Green**: Green shades
- **Error Red**: Red shades
- **Warning Amber**: Amber shades (for expiration notice)

### Typography
- **Headings**: `font-black` (900 weight)
- **Labels**: Uppercase, tracked, small (10px)
- **Body**: `font-semibold` or `font-bold`

### Components
- Rounded cards: `rounded-[2.5rem]`
- Input fields: `rounded-xl`
- Smooth animations: `animate-in` utilities
- Hover effects on interactive elements

## Backend Integration

In production, the forgot password flow would include:

### 1. Email Verification Endpoint
```typescript
POST /api/auth/forgot-password
Request: { email: string }
Response: 
  - 200: { message: "Reset link sent" }
  - 404: { error: "Email not found" }
  - 400: { error: "Invalid email format" }
```

### 2. Reset Link Generation
- Generate unique secure token
- Store token with user ID and expiration
- Create reset URL: `/pakiadmin/reset-password?token={token}`

### 3. Email Service
- Send professional HTML email
- Include reset link with token
- Add company branding
- Include expiration notice
- Provide support contact

### 4. Example Email Template
```
Subject: PakiAdmin Password Reset Request

Hello,

We received a request to reset your PakiAdmin password.

Click the link below to create a new password:
[Reset Password Button]

This link will expire in 60 minutes for security.

If you didn't request this, please ignore this email.

Best regards,
PakiAdmin Team
```

## Security Considerations

### 1. **Email Enumeration Prevention**
Current implementation shows specific error when email is not found. In high-security environments, consider showing generic message:
```
"If this email is registered, you will receive a reset link."
```

### 2. **Rate Limiting**
Implement rate limiting to prevent:
- Spam attacks
- Email bombing
- Brute force attempts

Suggested limits:
- 3 requests per email per hour
- 10 requests per IP per hour

### 3. **Token Security**
- Use cryptographically secure random tokens
- Minimum 32 characters
- Store hashed in database
- One-time use only
- Automatic expiration

### 4. **Email Validation**
Current regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

Consider additional checks:
- Domain validation
- Disposable email blocking
- Corporate domain restriction

## Routes

### Forgot Password Route
```typescript
{
  path: 'pakiadmin/forgot-password',
  element: <PakiAdminForgotPassword />,
}
```

### Related Routes
```typescript
// Login page
{ path: 'pakiadmin/login', element: <PakiAdminLogin /> }

// Reset password (after clicking email link)
{ path: 'pakiadmin/reset-password', element: <PakiAdminResetPassword /> }
```

## Navigation Flow

```
Login Page
    ↓
[Forgot Password? link]
    ↓
Forgot Password Page
    ↓
[Enter Email → Submit]
    ↓
    ├─→ Success: Check Email Screen
    │       ↓
    │   [Return to Login]
    │       ↓
    │   Login Page
    │
    └─→ Error: Show Error Message
            ↓
        [Try Again]
```

## Console Logging (Development)

For development/testing, the following is logged to console:

```javascript
console.log('Password reset link would be sent to:', email);
console.log('Reset link: /pakiadmin/reset-password?token=secure_token_' + Date.now());
```

This helps developers:
- Verify email submission
- Test reset flow without email service
- Debug token generation

## Accessibility Features

- Semantic HTML structure
- ARIA labels on form fields
- Keyboard navigation support
- Focus states on interactive elements
- High contrast error messages
- Screen reader friendly

## Browser Support

Works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Error Messages

### Validation Errors
| Scenario | Message |
|----------|---------|
| Invalid format | "Please enter a valid email address." |
| Email not found | "This email address is not registered in our system. Please check your email or contact support." |
| Empty field | Browser default: "Please fill out this field" |

### Success Messages
| State | Message |
|-------|---------|
| Email sent | "Check Your Email!" |
| Confirmation | "We've sent a password reset link to: {email}" |

## Mobile Responsiveness

The page is fully responsive with:
- Single column layout on mobile
- Touch-friendly button sizes
- Readable font sizes
- Proper spacing and padding
- Full-width form fields

## Future Enhancements

Potential improvements:
1. **Multi-language Support**: i18n for error messages
2. **SMS Recovery**: Alternative to email
3. **Security Questions**: Additional verification
4. **Account Lockout**: After multiple failed attempts
5. **Email Preview**: Option to verify email before sending
6. **Resend Cooldown**: Timer before allowing resend
7. **Email Templates**: Customizable branded emails
8. **Audit Logging**: Track all reset requests

## Monitoring & Analytics

Track these metrics:
- Number of reset requests per day
- Success vs. error rate
- Most common errors
- Time to complete reset flow
- Emails not found (potential issues)

## Support & Troubleshooting

### Common User Issues

**Issue**: "I didn't receive the email"
**Solutions**:
1. Check spam/junk folder
2. Verify email address is correct
3. Wait a few minutes for delivery
4. Click "Try again" to resend
5. Contact support if still not received

**Issue**: "Email not found error"
**Solutions**:
1. Verify exact email address
2. Check for typos
3. Ensure using admin email, not personal
4. Contact administrator to verify registration

**Issue**: "Link expired"
**Solutions**:
1. Request new reset link
2. Complete reset within 60 minutes
3. Check email timestamp

---

**Last Updated**: April 30, 2026
**Version**: 1.0.0
