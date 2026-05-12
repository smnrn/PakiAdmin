# Password Recovery - Quick Start Guide

## 🚀 One-Minute Test

### Option 1: Test Forgot Password (Email Request)

```bash
1. Navigate to: /pakiadmin/forgot-password
2. Enter email: admin@pakiadmin.ph
3. Click "Send Recovery Link"
4. ✅ See success message with email confirmation
```

### Option 2: Test Reset Password (New Password)

```bash
1. Navigate to: /pakiadmin/reset-password?token=test123
2. Password: SecurePass123!
3. Confirm: SecurePass123!
4. ✅ See success message, redirect to login
```

---

## 📋 Test Emails

**Valid (Will Work):**
- ✅ `admin@pakiadmin.ph`
- ✅ `test@pakiadmin.ph`
- ✅ `demo@pakiadmin.ph`

**Invalid (Will Fail):**
- ❌ `notfound@example.com`
- ❌ `random@test.com`

---

## 🎯 Feature Highlights

### Forgot Password Page
- ✉️ Email validation
- 🔍 Database lookup
- ✅ Success confirmation
- ❌ Error if email not found
- 🔗 Generates reset link

### Reset Password Page
- 🔐 Password strength validation
- 👁️ Show/hide toggles
- ✓ Real-time requirement checklist
- 🎯 6 validation rules
- ✅ Success with redirect

---

## 🔄 Complete Flow

```
┌─────────────────┐
│   Login Page    │
└────────┬────────┘
         │ Forgot Password?
         ↓
┌─────────────────────┐
│ Forgot Password Page │
│                      │
│ Enter: admin@        │
│ pakiadmin.ph         │
└──────────┬───────────┘
           │ Submit
           ↓
    ┌─────────────┐
    │ Email Found?│
    └──────┬──────┘
           │
    ┌──────┴───────┐
    │              │
   YES            NO
    │              │
    ↓              ↓
┌─────────┐  ┌──────────┐
│SUCCESS! │  │  ERROR   │
│         │  │          │
│Check    │  │Email not │
│Email    │  │found     │
└────┬────┘  └────┬─────┘
     │            │
     │            └→ Try Again
     │
     ↓
┌────────────────┐
│ Email Received │
│ (Dev: Console) │
└────────┬───────┘
         │ Click Link
         ↓
┌─────────────────────┐
│ Reset Password Page │
│                     │
│ Token: ✓ Valid      │
└──────────┬──────────┘
           │
           ↓
┌────────────────────┐
│ Enter New Password │
│                    │
│ Password: ●●●●●●●● │
│ Confirm:  ●●●●●●●● │
└──────────┬─────────┘
           │
           ↓
    ┌─────────────┐
    │ All Valid?  │
    └──────┬──────┘
           │
    ┌──────┴───────┐
    │              │
   YES            NO
    │              │
    ↓              ↓
┌─────────┐  ┌──────────┐
│SUCCESS! │  │  ERROR   │
│         │  │          │
│Password │  │Fix issues│
│Updated  │  │          │
└────┬────┘  └────┬─────┘
     │            │
     │            └→ Fix & Retry
     │
     ↓
┌──────────────┐
│ Redirect to  │
│ Login (3sec) │
└──────────────┘
```

---

## 🧪 Quick Tests

### Test 1: Valid Email ✅
```
URL: /pakiadmin/forgot-password
Email: admin@pakiadmin.ph
Expected: Success screen, email shown
Time: ~2 seconds
```

### Test 2: Invalid Email ❌
```
URL: /pakiadmin/forgot-password
Email: notfound@test.com
Expected: Error message
Time: ~2 seconds
```

### Test 3: Valid Password Reset ✅
```
URL: /pakiadmin/reset-password?token=abc123
Password: SecurePass123!
Expected: All checks green, submit enabled
Time: Instant validation
```

### Test 4: Weak Password ❌
```
URL: /pakiadmin/reset-password?token=abc123
Password: weak
Expected: Multiple checks fail, button disabled
Time: Instant validation
```

---

## 📊 Validation Rules (Reset Password)

| Rule | Example Pass | Example Fail |
|------|-------------|--------------|
| 8+ characters | `Password1!` | `Pass1!` |
| Uppercase | `Password1!` | `password1!` |
| Lowercase | `Password1!` | `PASSWORD1!` |
| Number | `Password1!` | `Password!` |
| Special char | `Password1!` | `Password1` |
| Passwords match | Both same | Different |

---

## 🐛 Troubleshooting

### "Email not found"
- ✓ Use registered email from test list
- ✓ Check for typos
- ✓ Try: `admin@pakiadmin.ph`

### "Invalid reset token"
- ✓ Ensure URL has `?token=` parameter
- ✓ Example: `/pakiadmin/reset-password?token=abc123`

### "Submit button disabled"
- ✓ Check all validation items are green
- ✓ Ensure passwords match exactly
- ✓ Try: `SecurePass123!`

---

## 🎨 Visual States

### Forgot Password States

**Initial State:**
```
┌─────────────────────────┐
│  Forgot Password?       │
│  ─────────────────────  │
│  Email Address          │
│  [admin@pakiadmin.ph ]  │
│                         │
│  [ Send Recovery Link ] │
└─────────────────────────┘
```

**Success State:**
```
┌─────────────────────────┐
│  ✅ Check Your Email!   │
│  ─────────────────────  │
│  We've sent a link to:  │
│  admin@pakiadmin.ph     │
│                         │
│  Next Steps:            │
│  1. Check inbox         │
│  2. Click link          │
│  3. Create password     │
│                         │
│  [ Return to Login ]    │
└─────────────────────────┘
```

**Error State:**
```
┌─────────────────────────┐
│  Forgot Password?       │
│  ─────────────────────  │
│  ⚠️ Email not found!    │
│                         │
│  Email Address          │
│  [unknown@example.com]  │
│                         │
│  [ Send Recovery Link ] │
└─────────────────────────┘
```

### Reset Password States

**Validation Checklist:**
```
Password Requirements:
⚪ At least 8 characters
⚪ Uppercase letter
⚪ Lowercase letter  
⚪ Number
⚪ Special character
⚪ Passwords match

[ Reset Password ] ← Disabled
```

**All Valid:**
```
Password Requirements:
✅ At least 8 characters
✅ Uppercase letter
✅ Lowercase letter  
✅ Number
✅ Special character
✅ Passwords match

[ Reset Password ] ← Enabled
```

---

## 💡 Pro Tips

1. **Check Browser Console**
   - Reset links are logged for testing
   - Copy token from console log

2. **Use Valid Test Emails**
   - Stick to the provided test list
   - Saves time on error troubleshooting

3. **Copy Valid Password**
   - Use: `SecurePass123!`
   - Passes all validations instantly

4. **Test Both Flows**
   - Test forgot → reset flow
   - Test direct reset link

5. **Mobile Testing**
   - Pages are fully responsive
   - Test on phone viewport

---

## 📞 Support

**Common Questions:**

Q: Where do I find the reset link?
A: Check browser console (F12) during development

Q: What if email isn't working?
A: Use registered test emails from the list above

Q: Can I skip forgot password?
A: Yes, navigate directly to reset password with token

Q: How do I test without email service?
A: Use console-logged links during development

---

## 🔗 Quick Links

| Feature | URL |
|---------|-----|
| Login | `/pakiadmin/login` |
| Forgot Password | `/pakiadmin/forgot-password` |
| Reset Password | `/pakiadmin/reset-password?token=test123` |

---

**Happy Testing! 🎉**

*Last Updated: April 30, 2026*
