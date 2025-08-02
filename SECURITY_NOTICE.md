# 🔒 Security Notice

## ⚠️ Important Security Reminders

### 🚨 **NEVER commit real credentials to public repositories!**

This project uses placeholder values for security. Before deploying:

### 📝 Required Replacements

Replace these placeholders with your actual values:

#### 🌐 Server Configuration
```bash
YOUR_SERVER_IP      # Replace with your actual server IP
YOUR_USERNAME       # Replace with your GitHub username
YOUR_REPO          # Replace with your repository name
```

#### 🗄️ Database Configuration
```bash
YOUR_DB_HOST       # Database server IP/hostname
YOUR_DB_USER       # Database username
YOUR_DB_PASSWORD   # Database password
YOUR_DB_NAME       # Database name
```

#### 🔑 Authentication Secrets
```bash
YOUR_JWT_SECRET_HERE        # Generate a strong JWT secret
YOUR_JWT_REFRESH_SECRET_HERE # Generate a different refresh secret
```

#### ☁️ Supabase Configuration (Optional)
```bash
YOUR_PROJECT               # Your Supabase project ID
YOUR_SUPABASE_SERVICE_KEY  # Your Supabase service role key
```

### 🛡️ Security Best Practices

#### 1. **Generate Strong Secrets**
```bash
# Generate JWT secrets (32+ characters)
openssl rand -base64 32

# Or use online generators (ensure they're secure)
# - Password generators
# - Cryptographic random generators
```

#### 2. **Environment Variables**
```bash
# Production secrets should be set as environment variables
export JWT_SECRET="your-actual-secret-here"
export DATABASE_URL="postgresql://user:pass@host:port/db"
```

#### 3. **GitHub Secrets**
```bash
# Set in Repository Settings → Secrets and Variables → Actions
SERVER_IP
SERVER_USERNAME  
SERVER_SSH_KEY
DATABASE_URL
JWT_SECRET
JWT_REFRESH_TOKEN_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

#### 4. **File Permissions**
```bash
# Protect sensitive files
chmod 600 ~/.ssh/id_rsa
chmod 600 .env.production
```

#### 5. **Network Security**
```bash
# Configure firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP  
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # Frontend
sudo ufw allow 4000/tcp # Backend
sudo ufw enable
```

### 🚫 What NOT to Commit

❌ **Never commit these files with real data:**
- `.env` files with real credentials
- Private SSH keys
- Database passwords
- JWT secrets
- API keys
- Server IP addresses
- Usernames

✅ **Safe to commit:**
- `.env.example` files with placeholders
- Documentation with placeholder values
- Configuration templates

### 🔍 Before Going Public

1. **Review all files** for sensitive information
2. **Use placeholder values** in documentation
3. **Set up proper secrets management** in CI/CD
4. **Test with fake data** first
5. **Use `.gitignore`** for sensitive files

### 📋 Gitignore Essentials

Ensure your `.gitignore` includes:
```gitignore
# Environment files
.env
.env.local
.env.production
.env.staging

# SSH keys
*.pem
*.key
id_rsa*

# Database files
*.db
*.sqlite

# Logs with sensitive data
*.log
logs/

# Temporary files
tmp/
temp/
```

### 🆘 If You Accidentally Commit Secrets

1. **Immediately rotate** all exposed credentials
2. **Force push** new commits to overwrite history:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch path/to/file' \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Notify your team** if applicable
4. **Update deployment** with new credentials

### 📞 Security Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Security Guidelines](https://owasp.org/)
- [Docker Security](https://docs.docker.com/engine/security/)

---

**Remember: Security is everyone's responsibility!** 🛡️

If you find any security issues in this project, please report them responsibly.