# Contributing to StataGlow

Thank you for your interest in contributing to StataGlow! We welcome contributions of all kinds: bug reports, feature suggestions, command additions, and code improvements.

## Getting Started

### Prerequisites

- Python 3.8+ with the `pyyaml` package
- Git
- Basic familiarity with YAML and JSON

### Setup

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/stataGlow.git
cd stataGlow

# Install build dependency
pip install pyyaml

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

- `commands/ssc_contributed_commands.yaml` — for SSC packages
- `commands/github_contributed_commands.yaml` — for GitHub packages

#### Step 2: Command Entry Format

```yaml
- name: "packagename"
  category: "estimation"                 # See category list below
  description: "Brief one-line description"
  url: "https://github.com/user/repo"
```

#### Step 3: Build & Test

```bash
# Rebuild the grammar
python .process/scripts/build_grammar_v2.py

# Open a .do file in VS Code / Positron and verify highlighting
```

#### Step 4: Submit PR

```bash
git add commands/ grammars/
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

| Category | Description |
|----------|-------------|
| `estimation` | Estimation & inference |
| `panel_timeseries` | Panel & time-series data |
| `causal_inference` | Causal inference |
| `data_management` | Data manipulation |
| `statistics` | Summary statistics & distributions |
| `survival` | Survival analysis |
| `spatial` | Spatial analysis |
| `visualization` | Plotting & output |
| `utilities` | General utilities |

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
- VS Code / Positron version
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

Before submitting:

```bash
# Rebuild grammar
python .process/scripts/build_grammar_v2.py

# Open a .do or .ado file and verify highlighting
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

1. Create a branch from `main`
2. Make your changes
3. Rebuild the grammar if you modified command registries
4. Commit with meaningful messages
5. Push to your fork
6. Submit a PR

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows style guide
- [ ] Grammar builds successfully: `python .process/scripts/build_grammar_v2.py`
- [ ] Highlighting looks correct on test `.do` files
- [ ] Updated relevant documentation
- [ ] PR description clearly explains changes
- [ ] Commits are atomic and well-messaged

## Questions?

- [Start a Discussion](https://github.com/randrescastaneda/stataGlow/discussions)
- [Open an Issue](https://github.com/randrescastaneda/stataGlow/issues) (label: question)

## Recognition

Contributors will be recognized in:
- [CHANGELOG.md](CHANGELOG.md)
- Release notes
- GitHub contributors page

Thank you for making StataGlow better!
