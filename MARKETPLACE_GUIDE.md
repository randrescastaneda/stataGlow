# StataGlow Marketplace Publishing Guide

**Version:** 2.0.0  
**Last Updated:** February 19, 2026

Complete guide for publishing StataGlow to VS Code Marketplace, Open VSX Registry, and GitHub Releases.

---

## Quick Links

- **VS Code Marketplace:** https://marketplace.visualstudio.com/items?itemName=randrescastaneda.stataGlow
- **Open VSX Registry:** https://open-vsx.org/extension/randrescastaneda/stataGlow
- **GitHub Releases:** https://github.com/randrescastaneda/stataGlow/releases
- **Publisher Portal:** https://marketplace.visualstudio.com/manage/publishers/randrescastaneda

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VS Code Marketplace](#vs-code-marketplace)
3. [Open VSX Registry](#open-vsx-registry)
4. [GitHub Releases](#github-releases)
5. [Post-Publication](#post-publication)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

```bash
# Install vsce (VS Code Extension Manager)
npm install -g @vscode/vsce

# Install ovsx (Open VSX CLI)
npm install -g ovsx

# Install GitHub CLI (optional but recommended)
# Windows: https://cli.github.com/
# Or use: winget install --id GitHub.cli
```

### Required Accounts

1. **Microsoft/Azure Account**
   - Sign up: https://azure.microsoft.com/free/
   - Free tier is sufficient

2. **Azure DevOps Organization**
   - Create at: https://dev.azure.com/
   - Required for VS Code Marketplace publishing

3. **Eclipse Foundation Account**
   - Register: https://accounts.eclipse.org/user/register
   - Required for Open VSX Registry

4. **GitHub Account**
   - Join: https://github.com/join
   - Repository: https://github.com/randrescastaneda/stataGlow

---

## VS Code Marketplace

### Step 1: Create Azure DevOps Organization

1. Navigate to: https://dev.azure.com/
2. Sign in with your Microsoft account
3. Click **"New organization"**
4. Name: `randrescastaneda-extensions` (or similar)
5. Select your region
6. Complete CAPTCHA and create

### Step 2: Generate Personal Access Token (PAT)

1. In Azure DevOps, click your profile icon → **"Personal access tokens"**
2. Click **"+ New Token"**
3. Configure:
   - **Name:** `vscode-marketplace-stataglow`
   - **Organization:** Select your organization
   - **Expiration:** 1 year (recommended)
   - **Scopes:** Custom defined
   - Check: **"Marketplace" → "Manage"**
4. Click **"Create"**
5. **CRITICAL:** Copy token immediately (cannot view again)
6. Store securely

**Documentation:** https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate

### Step 3: Create Publisher

1. Go to: https://marketplace.visualstudio.com/manage
2. Sign in with same Microsoft account
3. Click **"Create publisher"**
4. Fill in:
   - **ID:** `randrescastaneda` (must match package.json)
   - **Name:** Your display name
   - **Description:** Brief bio
5. Click **"Create"**

### Step 4: Publish Extension

```bash
# Navigate to project directory
cd "c:\Users\wb384996\OneDrive - WBG\ado\github_contr\stataGlow"

# Login with PAT
vsce login randrescastaneda
# Paste your PAT when prompted

# Package and publish
vsce publish

# Or publish with version bump
# vsce publish patch  # 2.0.0 -> 2.0.1
# vsce publish minor  # 2.0.0 -> 2.1.0
# vsce publish major  # 2.0.0 -> 3.0.0
```

### Step 5: Verify Publication

- Extension page: https://marketplace.visualstudio.com/items?itemName=randrescastaneda.stataGlow
- Test installation: `code --install-extension randrescastaneda.stataGlow`

**Publishing Guide:** https://code.visualstudio.com/api/working-with-extensions/publishing-extension

---

## Open VSX Registry

Open VSX is an open-source alternative marketplace used by VSCodium, Eclipse Theia, Gitpod, and other VS Code alternatives.

### Step 1: Create Eclipse Account

1. Register: https://accounts.eclipse.org/user/register
2. Verify email
3. Complete profile

### Step 2: Generate Access Token

1. Go to: https://open-vsx.org/
2. Sign in with Eclipse account
3. Click profile → **"Access Tokens"**
4. Click **"Generate New Token"**
5. Copy and store securely

**Note:** If namespace doesn't exist, request it:
- GitHub issue: https://github.com/eclipse/openvsx/issues/new
- Provide: namespace (`randrescastaneda`), repository link, purpose

### Step 3: Publish Extension

```bash
# Publish with token
ovsx publish stataGlow-2.0.0.vsix --pat YOUR_TOKEN_HERE

# Or set environment variable
$env:OVSX_PAT = "YOUR_TOKEN_HERE"
ovsx publish stataGlow-2.0.0.vsix
```

### Step 4: Verify

- Registry page: https://open-vsx.org/extension/randrescastaneda/stataGlow
- Test in VSCodium: `codium --install-extension randrescastaneda.stataGlow`

**Publishing Wiki:** https://github.com/eclipse/openvsx/wiki/Publishing-Extensions

---

## GitHub Releases

### Step 1: Create Git Tag

```bash
# Ensure on main branch with latest changes
git checkout main
git pull

# Create annotated tag
git tag -a v2.0.0 -m "StataGlow v2.0.0 - Professional theming system with 6 themes"

# Push tag to GitHub
git push origin v2.0.0
```

### Step 2: Generate Checksum

```powershell
# Windows PowerShell
certutil -hashfile stataGlow-2.0.0.vsix SHA256 | Out-File stataGlow-2.0.0.vsix.sha256

# Or Git Bash / Linux / macOS
# shasum -a 256 stataGlow-2.0.0.vsix > stataGlow-2.0.0.vsix.sha256
```

### Step 3: Create Release on GitHub

#### Option A: Web Interface

1. Go to: https://github.com/randrescastaneda/stataGlow/releases
2. Click **"Draft a new release"**
3. Select tag: `v2.0.0`
4. Release title: `StataGlow v2.0.0 - Professional Theming System`
5. Description:

```markdown
## 🎨 StataGlow v2.0.0

Professional Stata syntax highlighting with 6 beautiful themes for VS Code and Positron.

### Installation

**From VS Code Marketplace:**
Search for "StataGlow" in VS Code Extensions (Ctrl+Shift+X)

**From VSIX File:**
1. Download `stataGlow-2.0.0.vsix` below
2. VS Code: Ctrl+Shift+P → "Extensions: Install from VSIX"
3. Select downloaded file

### What's New

✨ **6 Professional Themes**
- StataGlow Official - VS Code default palette
- StataGlow Modern - GitHub Copilot-inspired
- StataGlow Kiwi - Nordic-inspired, soft aesthetic
- StataGlow OneDark - Atom One Dark colors
- StataGlow Dracula - Official Dracula palette
- StataGlow Light - High-contrast light theme

🎯 **Features**
- Comprehensive syntax highlighting (1,680+ Stata commands)
- All file types supported (.do, .ado, .mata)
- Zero runtime dependencies
- Compatible with VS Code 1.70.0+ and Positron 2026.02.0+

📦 **Package Details**
- Size: 3.8 MB
- Version: 2.0.0
- License: MIT

### Checksums
```
SHA256: [paste checksum here]
```

### Documentation
- [README](https://github.com/randrescastaneda/stataGlow/blob/main/README.md)
- [CHANGELOG](https://github.com/randrescastaneda/stataGlow/blob/main/CHANGELOG.md)
```

6. Attach files:
   - `stataGlow-2.0.0.vsix`
   - `stataGlow-2.0.0.vsix.sha256`
7. Check **"Set as the latest release"**
8. Click **"Publish release"**

#### Option B: GitHub CLI

```bash
# Authenticate
gh auth login

# Create release with files
gh release create v2.0.0 \
  --title "StataGlow v2.0.0 - Professional Theming System" \
  --notes-file RELEASE_NOTES.md \
  stataGlow-2.0.0.vsix \
  stataGlow-2.0.0.vsix.sha256
```

**GitHub Releases Guide:** https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository

---

## Post-Publication

### 1. Add Badges to README

```markdown
[![VS Code Marketplace](https://img.shields.io/vscode-marketplace/v/randrescastaneda.stataGlow.svg)](https://marketplace.visualstudio.com/items?itemName=randrescastaneda.stataGlow)
[![Downloads](https://img.shields.io/vscode-marketplace/d/randrescastaneda.stataGlow.svg)](https://marketplace.visualstudio.com/items?itemName=randrescastaneda.stataGlow)
[![Rating](https://img.shields.io/vscode-marketplace/r/randrescastaneda.stataGlow.svg)](https://marketplace.visualstudio.com/items?itemName=randrescastaneda.stataGlow)
[![Open VSX](https://img.shields.io/open-vsx/v/randrescastaneda/stataGlow.svg)](https://open-vsx.org/extension/randrescastaneda/stataGlow)
[![License](https://img.shields.io/github/license/randrescastaneda/stataGlow.svg)](https://github.com/randrescastaneda/stataGlow/blob/main/LICENSE)
```

### 2. Announce Release

**Stata Community:**
- Statalist: https://www.statalist.org/
- Reddit r/stata: https://reddit.com/r/stata
- Twitter/X with #Stata and #StataSoftware

**VS Code Community:**
- Reddit r/vscode: https://reddit.com/r/vscode
- VS Code Twitter: Mention @code

**Academic:**
- Personal/institutional blog
- Department mailing lists
- Research group Slack/Teams channels

### 3. Monitor Feedback

- GitHub Issues: https://github.com/randrescastaneda/stataGlow/issues
- Marketplace reviews and ratings
- Download statistics
- User questions and feature requests

### 4. Update Documentation

- Add screenshots to README showing each theme
- Create usage GIFs or video
- Update installation instructions
- Document new features

---

## Troubleshooting

### Issue: "Publisher not found"

**Solution:**
- Verify publisher ID in `package.json` matches marketplace publisher
- Re-login: `vsce login randrescastaneda`
- Check PAT has "Marketplace: Manage" permission
- Verify PAT hasn't expired

### Issue: "Package failed validation"

**Solution:**
```bash
# Run detailed validation
vsce package --no-yarn

# Check for:
# - Missing icon.png (512x512)
# - Invalid package.json fields
# - Missing LICENSE file
# - Files exceeding size limits
```

### Issue: "Authentication failed" (Open VSX)

**Solution:**
- Verify token is current and correct
- Check token hasn't expired
- Regenerate token if needed
- Ensure namespace exists: https://open-vsx.org/user-settings/namespaces

### Issue: Extension not appearing

**Solution:**
- Wait 5-10 minutes for marketplace indexing
- Clear browser cache
- Check extension status in publisher portal
- Verify extension isn't marked as private

### Issue: Icon not displaying

**Solution:**
- Ensure icon.png is exactly 512x512 pixels
- Use PNG format only
- File size under 1MB
- Verify path in package.json: `"icon": "icon.png"`

---

## Updating Published Extensions

### Patch Update (Bug Fixes)

```bash
# Update version and CHANGELOG
# Then publish
vsce publish patch  # 2.0.0 -> 2.0.1
ovsx publish stataGlow-2.0.1.vsix --pat $OVSX_PAT

# Create GitHub release
git tag -a v2.0.1 -m "Bug fixes"
git push origin v2.0.1
gh release create v2.0.1 --generate-notes stataGlow-2.0.1.vsix
```

### Minor Update (New Features)

```bash
# Update version, CHANGELOG, and README
vsce publish minor  # 2.0.0 -> 2.1.0
ovsx publish stataGlow-2.1.0.vsix --pat $OVSX_PAT

# Create GitHub release with detailed notes
git tag -a v2.1.0 -m "New features"
git push origin v2.1.0
gh release create v2.1.0 --notes-file RELEASE_NOTES.md stataGlow-2.1.0.vsix
```

---

## Useful Resources

### Documentation
- **VS Code Publishing:** https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **Extension Manifest:** https://code.visualstudio.com/api/references/extension-manifest
- **Open VSX Wiki:** https://github.com/eclipse/openvsx/wiki
- **GitHub Releases:** https://docs.github.com/en/repositories/releasing-projects-on-github

### Tools
- **vsce Documentation:** https://github.com/microsoft/vscode-vsce
- **ovsx Documentation:** https://github.com/eclipse/openvsx/tree/master/cli
- **GitHub CLI:** https://cli.github.com/

### Community
- **VS Code Extensions:** https://marketplace.visualstudio.com/
- **Open VSX Registry:** https://open-vsx.org/
- **VS Code API:** https://code.visualstudio.com/api

---

## Publication Checklist

### Pre-Publication
- [ ] All tests passing
- [ ] Grammar builds successfully
- [ ] README complete and accurate
- [ ] CHANGELOG up to date
- [ ] LICENSE file present
- [ ] Icon correct (512x512 PNG)
- [ ] Version number updated
- [ ] Repository URL correct

### VS Code Marketplace
- [ ] Azure DevOps organization created
- [ ] Personal Access Token generated
- [ ] Publisher account created
- [ ] Extension packaged
- [ ] Extension published
- [ ] Marketplace listing verified

### Open VSX
- [ ] Eclipse account created
- [ ] Publisher token generated
- [ ] Namespace approved
- [ ] Extension published
- [ ] Registry listing verified

### GitHub Release
- [ ] Git tag created
- [ ] Tag pushed to GitHub
- [ ] Release created
- [ ] VSIX attached
- [ ] Checksum attached
- [ ] Release notes complete

### Post-Publication
- [ ] Badges added to README
- [ ] Community announcements made
- [ ] Issue tracker monitored
- [ ] Statistics reviewed
- [ ] User feedback addressed

---

**Last Updated:** February 19, 2026  
**Maintainer:** R.Andrés Castañeda  
**Repository:** https://github.com/randrescastaneda/stataGlow
