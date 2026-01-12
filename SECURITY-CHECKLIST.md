# Security Checklist for GitHub

✅ **Your API keys are currently safe!** But here's what to verify before making the repo public.

## 🔒 Pre-Push Security Checklist

### **Files That Should NEVER Be Committed:**

```bash
# Check these are in .gitignore:
✅ .env
✅ .env.local
✅ .env.development
✅ .env.production
✅ src/environments/environment.secrets.ts

# Verify they're not tracked:
git ls-files | grep -E "(\.env|environment\.secrets)"
# Should return nothing (exit code 1)
```

### **What's Safe to Commit:**

```
✅ .env.example (template without real keys)
✅ environment.secrets.ts.example (if you create one)
✅ All documentation files
✅ All source code
✅ Configuration files (without secrets)
✅ README files
✅ Legal disclaimers
```

## 🔍 Security Verification Commands

### **1. Check What's Tracked:**
```bash
git ls-files | grep -i secret
git ls-files | grep -i key
git ls-files | grep -i password
git ls-files | grep "\.env"
```
**Expected**: No results for sensitive files

### **2. Check Git History:**
```bash
git log --all --full-history --source -- .env
git log --all --full-history --source -- src/environments/environment.secrets.ts
```
**Expected**: No results (files never committed)

### **3. Search for Hardcoded Keys:**
```bash
# Search for potential API keys in committed files
git grep -i "sk-proj-" -- '*.ts' '*.js'
git grep -i "apiKey.*:" -- '*.ts' '*.js'
```
**Expected**: Only references in environment.secrets.ts (which is gitignored)

### **4. Check Remote:**
```bash
git remote -v
```
**Verify**: Points to your intended repository

## ⚠️ If You Accidentally Committed Secrets

### **IMMEDIATE ACTION REQUIRED:**

1. **Revoke API Keys Immediately:**
   ```
   OpenAI: https://platform.openai.com/api-keys
   → Delete the exposed key
   → Generate new key
   ```

2. **Remove from Git History:**
   ```bash
   # Nuclear option - rewrite history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch src/environments/environment.secrets.ts" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Or use BFG Repo-Cleaner (easier)
   # Download from: https://rtyley.github.io/bfg-repo-cleaner/
   java -jar bfg.jar --delete-files environment.secrets.ts
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

3. **Force Push (If Already Pushed):**
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

4. **Notify GitHub:**
   - They may have cached the sensitive data
   - Contact: https://support.github.com/

## 🛡️ Best Practices

### **1. Use Example Files:**

Create `.env.example`:
```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
OPENAI_MODEL=gpt-3.5-turbo
```

Create `src/environments/environment.secrets.example.ts`:
```typescript
export const secrets = {
  openai: {
    apiKey: 'your-api-key-here',
    model: 'gpt-3.5-turbo'
  }
};

export const AI_PROVIDER = 'fallback'; // or 'openai', 'gemini', 'anthropic'
```

### **2. Add Setup Instructions:**

In README.md:
```markdown
## Setup

1. Copy environment files:
   ```bash
   cp .env.example .env
   cp src/environments/environment.secrets.example.ts src/environments/environment.secrets.ts
   ```

2. Add your API keys to the new files

3. Never commit the actual secret files!
```

### **3. Pre-Commit Hook:**

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash

# Check for secret files
if git diff --cached --name-only | grep -E "(\.env$|environment\.secrets\.ts)"; then
    echo "❌ ERROR: Attempting to commit secret files!"
    echo "Files with secrets should not be committed."
    exit 1
fi

# Check for API keys in code
if git diff --cached | grep -E "sk-proj-[a-zA-Z0-9_-]{100,}"; then
    echo "❌ ERROR: Found potential API key in commit!"
    echo "Remove hardcoded API keys before committing."
    exit 1
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### **4. GitHub Secret Scanning:**

GitHub automatically scans for exposed secrets. If they find one:
- You'll get an email alert
- The key may be auto-revoked
- Take immediate action

### **5. Regular Audits:**

Monthly checklist:
```bash
# Check .gitignore is still protecting secrets
cat .gitignore | grep -E "(\.env|secrets)"

# Verify no secrets in recent commits
git log --oneline -20

# Check remote repository status
git remote show origin
```

## 📝 Current Status (Your Repo)

✅ **All checks passed!**

```
✅ .env is gitignored
✅ environment.secrets.ts is gitignored
✅ No secrets in git history
✅ No secrets pushed to GitHub
✅ Legal disclaimers added
✅ Documentation includes security notes
```

## 🎯 Before Making Public

If you plan to make the repository public:

- [ ] Run all verification commands above
- [ ] Create .env.example file
- [ ] Create environment.secrets.example.ts
- [ ] Add setup instructions to README
- [ ] Test fresh clone works without secrets
- [ ] Verify legal disclaimers are prominent
- [ ] Add LICENSE file (MIT, Apache, etc.)
- [ ] Consider adding CONTRIBUTING.md
- [ ] Add security policy (SECURITY.md)

## 🚨 Emergency Contacts

**If API keys are exposed:**

- **OpenAI**: https://platform.openai.com/account/api-keys
- **GitHub Support**: https://support.github.com/
- **Have I Been Pwned**: https://haveibeenpwned.com/

**If you're unsure:**
- Better safe than sorry
- Rotate keys immediately
- It's free to generate new ones

## 📚 Additional Resources

- GitHub Secret Scanning: https://docs.github.com/en/code-security/secret-scanning
- Git Secret: https://git-secret.io/
- GitGuardian: https://www.gitguardian.com/
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/

---

**Remember**: Once a secret is pushed to GitHub, assume it's compromised forever. Rotate immediately!
