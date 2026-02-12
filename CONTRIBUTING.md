# Contributing to StataGlow

Thank you for your interest in contributing to StataGlow! We welcome contributions of all kinds: bug reports, feature suggestions, command additions, and code improvements.

## Getting Started

### Prerequisites

- Node.js 14+
- Git
- Basic familiarity with YAML and JSON

### Setup

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/stataGlow.git
cd stataGlow

# Install dependencies
npm install

# Create a feature branch
git checkout -b add-myfeature
```

## Adding Commands

### Official Stata Commands

Official commands (through Stata 19) are already included. After each new Stata release, we'll update the registry.

### Community Commands (SSC / GitHub)

We actively welcome community contributions. To add SSC or GitHub packages:

#### Step 1: Edit the Registry

Add entries to the appropriate file:

```bash
# For SSC packages
nano commands/ssc_contributed_commands.yaml

# For GitHub packages
nano commands/github_contributed_commands.yaml
```

#### Step 2: Command Entry Format

```yaml
- name: "packagename"
  category: "estimation"                 # See category list below
  status: "stable"                       # stable | experimental
  description: "Brief one-line description"
  url: "https://github.com/user/repo or https://ssc.command.com/..."
  author: "Author Name"
  since: "1.0"                           # Package version
```

#### Step 3: Build & Test

```bash
# Rebuild the grammar
npm run build

# Validate the registry
npm run validate

# Check highlighting in the test file
# Open: examples/test_all_commands.do in VS Code
```

#### Step 4: Submit PR

```bash
git add commands/
git commit -m "Add: SSC package 'packagename' for category XYZ"
git push origin add-myfeature
```

Create a PR with:
- Clear title: "Add: SSC package 'packagename'"
- Description of the package
- Link to package documentation
- Why it should be included

### Command Categories

Use one of these categories when adding commands:

| Category | Description | Icon |
|----------|-------------|------|
| `estimation` | Estimation & inference | 📊 |
| `panel_longitudinal` | Panel/longitudinal data | 📈 |
| `causal_inference` | Causal inference | 🔗 |
| `lasso_ml` | Lasso & machine learning | 🤖 |
| `data_management` | Data manipulation & frames | 🔧 |
| `bayesian` | Bayesian analysis | 📉 |
| `survival` | Survival analysis | ⏱️ |
| `tables_collections` | Tables & collections | 📋 |
| `spatial` | Spatial analysis | 🗺️ |
| `ssc_commands` | Generic SSC packages | 📦 |
| `github_commands` | Generic GitHub packages | 🐙 |

## Reporting Issues

Found a bug or missing command?

1. Check [existing issues](https://github.com/randrescastaneda/stataGlow/issues)
2. If not found, [create a new issue](https://github.com/randrescastaneda/stataGlow/issues/new)

### Issue Title

- **Missing command**: "Add command: `commandname`"
- **Bug**: "Bug: highlighting breaks on [description]"
- **Feature**: "Feature: [description]"

### Issue Body

Include:
- Stata version
- Extension version
- VS Code/Positron version
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Screenshots (if visual issue)

## Code Contributions

### Style Guide

- **JavaScript**: Follow [Airbnb style guide](https://github.com/airbnb/javascript)
- **YAML**: Use 2-space indentation
- **JSON**: Format with 2-space indentation
- **Comments**: Be descriptive and include why, not just what

### Testing

Before submitting, run:

```bash
npm run validate    # Check command registry
npm run build       # Rebuild grammar
npm run test        # Run tests
```

### Commit Messages

Use conventional commits:

```
type(scope): subject

body (optional)
```

Examples:
```
feat(commands): add 10 new SSC packages
fix(grammar): fix regex highlighting in function calls
docs(readme): update customization section
refactor(build): optimize grammar generation
```

## Development Workflow

### Making Changes

1. Create a branch from `master`
2. Make your changes
3. Commit with meaningful messages
4. Push to your fork
5. Submit a PR

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows style guide
- [ ] All tests pass: `npm run test`
- [ ] Grammar validates: `npm run validate`
- [ ] Build succeeds: `npm run build`
- [ ] Updated relevant documentation
- [ ] PR description clearly explains changes
- [ ] Commits are atomic and well-messaged

## Questions?

- 💬 [Start a Discussion](https://github.com/randrescastaneda/stataGlow/discussions)
- 📧 [Open an Issue](https://github.com/randrescastaneda/stataGlow/issues) (label: question)

## Recognition

Contributors will be recognized in:
- [CHANGELOG.md](CHANGELOG.md)
- Release notes
- GitHub contributors page

Thank you for making StataGlow better! 🎉
