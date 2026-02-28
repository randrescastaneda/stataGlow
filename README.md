# StataGlow

Modern, customizable Stata syntax highlighting for VS Code and Positron.

## Features

✨ **Comprehensive Syntax Highlighting**
- 569 official Stata commands (Stata 19) with abbreviation support
- 100 community-contributed SSC commands
- User-defined custom commands with real-time highlighting
- Three-tier visual distinction for command sources
- **Mata language** support — block and inline highlighting with 100+ Mata functions

🎨 **6 Color Schemes (Stata-only)**
- **Official** — VS Code Dark+ inspired
- **Modern** — GitHub Dark Dimmed inspired
- **Kiwi** — Soft, Nordic-inspired palette
- **OneDark** — Atom One Dark palette
- **Dracula** — Dracula palette
- **Light** — Light background for accessibility

Color schemes apply **only to Stata files** — they never affect other languages. Choose any base editor theme and layer a StataGlow color scheme on top.

🔧 **Customizable Highlighting**
- Toggle on/off by category: functions, macros, strings, regex, factor variables, comments
- Enable/disable community command highlighting
- Support for user-defined color schemes via VS Code settings

📦 **User Extensions**
- Add personal commands via `stataGlow.customCommands`
- Load custom commands from `.vscode/stata-custom.json`
- Highlighted in real time using a Semantic Tokens provider

⚡ **Zero Dependencies**
- No runtime dependencies
- All syntax highlighting compiled at build time
- Pure VS Code extension architecture

## Installation

### From VS Code Marketplace

1. Open VS Code or Positron
2. Go to Extensions (**Ctrl+Shift+X** / **Cmd+Shift+X**)
3. Search for **StataGlow**
4. Click **Install**

### From GitHub Release

1. Download the `.vsix` file from [Releases](https://github.com/randrescastaneda/stataGlow/releases)
2. **Ctrl+Shift+P** → *Extensions: Install from VSIX*
3. Select the downloaded `.vsix` file

## Quick Start

Open any `.do`, `.ado`, or `.mata` file. Stata code is highlighted automatically.

> **⚠️ Competing extensions:** Other extensions that register the `source.stata` grammar (e.g. `kylebarron.stata-enhanced`, `mdob2k.stata-language`) may shadow StataGlow's grammar. VS Code only uses one grammar per `scopeName`, so **disable** any other Stata grammar extensions for StataGlow to work correctly.

## Settings

All StataGlow settings live under the `stataGlow.*` prefix. You can configure them in the **Settings UI** or in `settings.json`.

### Settings UI

1. Open **Settings** (**Ctrl+,** / **Cmd+,**)
2. Search for **StataGlow**
3. All extension settings appear in one place — color scheme, highlighting toggles, custom commands

### Color Scheme

Pick a color scheme via the Settings UI or in `settings.json`:

```json
{
  "stataGlow.colorScheme": "Dracula"
}
```

Available values: `Official`, `Modern`, `Kiwi`, `OneDark`, `Dracula`, `Light`, `None`.

Setting `"None"` disables StataGlow color injection entirely — Stata files will use your base editor theme's defaults.

| Scheme | Type | Palette |
|--------|------|---------|
| **Official** | Dark | VS Code Dark+ |
| **Modern** | Dark | GitHub Dark Dimmed |
| **Kiwi** | Dark | Nord-inspired, muted |
| **OneDark** | Dark | Atom One Dark |
| **Dracula** | Dark | Dracula |
| **Light** | Light | High contrast |

### Highlighting Toggles

```json
{
  "stataGlow.highlight.functions": true,
  "stataGlow.highlight.macros": true,
  "stataGlow.highlight.strings": true,
  "stataGlow.highlight.regex": true,
  "stataGlow.highlight.factorVariables": true,
  "stataGlow.highlight.comments": true
}
```

Set any to `false` to disable that category.

### Custom Commands

Add your own commands to highlight in all Stata files:

```json
{
  "stataGlow.customCommands": ["mycommand1", "mycommand2", "custom_analysis"]
}
```

Custom commands are highlighted in real time — no rebuild required. They appear with a distinctive style (`keyword.command.custom.stata`) in every Stata file.

You can also place a `.vscode/stata-custom.json` in your workspace:

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

### Enable/Disable Community Commands

```json
{
  "stataGlow.enableCommunityCommands": true
}
```

## Command Tiers

StataGlow highlights commands in three visually distinct tiers:

| Tier | Source | Count | Scope |
|------|--------|-------|-------|
| Official | Stata Corp. | 569 | `keyword.command.official.stata` and specialized scopes |
| Community | SSC / GitHub | 100 | `keyword.command.community.stata` |
| Custom | User-defined | — | `keyword.command.custom.stata` |

Official commands include specialized scopes for control flow (`forvalues`, `foreach`, `if`, `else`, etc.), program definitions (`program`, `end`, `capture`), scalars, matrices, and prefix commands (`bysort`, `quietly`, `noisily`).

## Mata Support

StataGlow provides full Mata highlighting:

- **Block Mata** — `mata:` / `mata` ... `end` blocks
- **Inline Mata** — `mata: expression` single-line statements
- **Mata internals** — types (`real`, `complex`, `string`, `pointer`, `void`, `transmorphic`), control flow (`if`, `else`, `for`, `while`, `do`, `return`, `break`, `continue`), the `function` keyword, and 100+ built-in Mata functions

Mata blocks are highlighted with distinctive colors in every color scheme, making them clearly distinguishable from regular Stata code.

## Building from Source

### Prerequisites

- Python 3.8+ with the `pyyaml` package

### Build Commands

```bash
# Install build dependency
pip install pyyaml

# Rebuild the grammar from command registries
python .process/scripts/build_grammar_v2.py
```

The build script reads the YAML command registries in `commands/` and generates `grammars/stata.json`.

### Project Structure

```
stataGlow/
├── commands/
│   ├── official_stata_commands.yaml    # 569 official commands
│   ├── ssc_contributed_commands.yaml   # 100 SSC commands
│   ├── github_contributed_commands.yaml # GitHub packages (future)
│   └── schema.json                     # Registry validation schema
├── grammars/
│   └── stata.json                      # Generated TextMate grammar
├── themes/
│   ├── stata-glow-official.json        # Color scheme definitions
│   ├── stata-glow-modern.json
│   ├── stata-glow-kiwi.json
│   ├── stata-glow-onedark.json
│   ├── stata-glow-dracula.json
│   └── stata-glow-light.json
├── lib/
│   └── config-manager.js               # Configuration & command loading
├── .process/
│   └── scripts/
│       └── build_grammar_v2.py         # Grammar build script
├── extension.js                        # Extension entry point
└── package.json
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Adding Official Commands

1. Add entries to `commands/official_stata_commands.yaml`
2. Run: `python .process/scripts/build_grammar_v2.py`
3. Test highlighting on your `.do` files
4. Submit a PR

### Adding Community Commands

1. Add entries to `commands/ssc_contributed_commands.yaml` or `commands/github_contributed_commands.yaml`
2. Include: command name, category, description, and source URL
3. Rebuild the grammar and submit a PR

### Command Entry Format

```yaml
- name: "mycommand"
  category: "estimation"
  description: "Brief description"
  url: "https://github.com/user/repo"
```

## Development Documentation

For developers working on StataGlow:

- **Development History**: See `.process/` directory for phase documentation
- **Architecture**: See `.process/PROJECT_STRUCTURE.md`
- **Implementation Summary**: See `.process/IMPLEMENTATION_SUMMARY.md`

The `.process/` directory is excluded from the extension package but preserved in the Git repository.

## Related

- **Original Extension**: [kylebarron/language-stata](https://github.com/kylebarron/language-stata)
- **Stata Documentation**: [stata.com/help](https://www.stata.com/help.cgi)
- **SSC Archive**: [repec.org/ado/ssc](https://repec.org/ado/ssc)

## License

MIT License — see [LICENSE](LICENSE) for details.

## Feedback & Issues

- [Report Issues](https://github.com/randrescastaneda/stataGlow/issues)
- [Start a Discussion](https://github.com/randrescastaneda/stataGlow/discussions)
- [Submit a PR](https://github.com/randrescastaneda/stataGlow/pulls)
