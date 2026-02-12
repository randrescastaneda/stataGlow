# StataGlow

Modern, customizable Stata syntax highlighting for VS Code and Positron.

## Features

✨ **Modern Syntax Highlighting**
- Official Stata commands (1,680+ commands through Stata 19)
- Community-contributed commands (SSC, GitHub)
- User-defined custom commands
- Three-tier visual distinction for command sources

🎨 **Customizable Highlighting**
- Toggle on/off by category: functions, macros, strings, regex, factor variables, comments
- Two built-in themes: Official and Modern
- Support for user-defined themes via VS Code settings

🔧 **User Extensions**
- Add personal commands via `language-stata.customCommands` setting
- Load custom commands from `.vscode/stata-custom.json`
- Community contributions welcome for SSC/GitHub packages

📦 **Zero Dependencies**
- Extension ships with no runtime dependencies
- All syntax highlighting compiled at build time
- Pure VS Code extension architecture

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "StataGlow"
4. Click Install

### From GitHub Release

1. Download the `.vsix` file from [Releases](https://github.com/randrescastaneda/stataGlow/releases)
2. In VS Code: Ctrl+Shift+P → "Extensions: Install from VSIX"
3. Select the downloaded `.vsix` file

## Usage

### Basic Syntax Highlighting

Open any `.do`, `.ado`, or `.mata` file. Stata code will be highlighted automatically.

### Customization

#### Toggle Highlighting Categories

Add to your `settings.json`:

```json
{
  "language-stata.highlight.functions": true,
  "language-stata.highlight.macros": true,
  "language-stata.highlight.strings": true,
  "language-stata.highlight.regex": true,
  "language-stata.highlight.factorVariables": true,
  "language-stata.highlight.comments": true
}
```

Set any to `false` to disable that category's highlighting.

#### Add Custom Commands

In `settings.json`:

```json
{
  "language-stata.customCommands": ["mycommand1", "mycommand2", "custom_analysis"]
}
```

Or create `.vscode/stata-custom.json` in your workspace:

```json
{
  "commands": [
    {
      "name": "mycommand",
      "description": "My custom Stata command"
    }
  ]
}
```

#### Enable/Disable Community Commands

```json
{
  "language-stata.enableCommunityCommands": true
}
```

#### Choose a Theme

1. In VS Code, press Ctrl+K Ctrl+T (or Cmd+K Cmd+T)
2. Select **StataGlow Official** or **StataGlow Modern**

## Command Tiers & Highlighting

| Tier | Source | Style | Scope |
|------|--------|-------|-------|
| Official | Stata Inc. | Blue | `keyword.command.official.stata` |
| Community | SSC / GitHub | Blue + Italic | `keyword.command.community.stata` |
| Custom | User-defined | Purple | `keyword.command.custom.stata` |

## Building from Source

### Prerequisites

- Node.js 14+
- npm or yarn

### Build Commands

```bash
# Install dependencies
npm install

# Build grammar from command registry
npm run build

# Validate command registry
npm run validate

# Run tests
npm run test
```

### Project Structure

```
stataGlow/
├── commands/
│   ├── official_stata_commands.yaml    # Official commands (1,680)
│   ├── ssc_contributed_commands.yaml   # SSC packages
│   ├── github_contributed_commands.yaml # GitHub packages
│   └── schema.json                     # Validation schema
├── scripts/
│   ├── build-grammar.js                # Generate stata.json
│   ├── validate-commands.js            # Validate registries
│   └── scrape-stata.js                 # Scrape Stata docs (future)
├── grammars/
│   └── stata.json                      # Generated TextMate grammar
├── themes/
│   ├── stata-glow-official.json
│   └── stata-glow-modern.json
├── lib/
│   └── config-manager.js               # Configuration handling
├── extension.js                        # VS Code extension entry point
└── package.json
```

## Contributing

We welcome contributions! Here's how to add commands:

### Adding Official Commands (After Upstream Merge)

1. Update `commands/official_stata_commands.yaml`
2. Run: `npm run build`
3. Verify highlighting in `examples/test_all_commands.do`
4. Submit PR with changes

### Adding Community Commands

1. Create a PR to add entries to `commands/ssc_contributed_commands.yaml` or `commands/github_contributed_commands.yaml`
2. Include:
   - Command name(s)
   - SSC package name or GitHub URL
   - Brief description
   - Stata version compatibility (if known)

### Command Entry Format

```yaml
- name: "mycommand"
  category: "estimation"           # or other category
  status: "stable"                 # stable | experimental | deprecated
  description: "Brief description"
  url: "https://github.com/user/repo"
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Related

- **Original Extension**: [kylebarron/language-stata](https://github.com/kylebarron/language-stata)
- **Stata Documentation**: [stata.com/help](https://www.stata.com/help.cgi)
- **SSC Archive**: [repec.org/ado/ssc](https://repec.org/ado/ssc)

## License

MIT License — see [LICENSE](LICENSE) for details.

## Feedback & Issues

Found a bug? Missing commands? Have a suggestion?

- 🐛 [Report Issues](https://github.com/randrescastaneda/stataGlow/issues)
- 💬 [Start a Discussion](https://github.com/randrescastaneda/stataGlow/discussions)
- 📝 [Submit a PR](https://github.com/randrescastaneda/stataGlow/pulls)

---

**Made with ❤️ for the Stata community**
