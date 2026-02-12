# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-12

### Added

#### Foundation
- **New StataGlow Extension**: Complete rewrite of language-stata for VS Code/Positron with modern architecture
- **Command Registry System**: YAML-based command registry with automatic grammar generation
- **Three-Tier Command Highlighting**: Official (blue) → Community (blue+italic) → Custom (purple)
- **Granular Highlighting Toggles**: Per-category enable/disable via VS Code settings
- **Zero Runtime Dependencies**: All syntax highlighting pre-compiled; extension ships with no external dependencies

#### Features
- Official Stata commands (1,680 through Stata 19)
- Support for SSC/GitHub community commands
- User-defined custom commands via settings or workspace file
- Two built-in themes: "StataGlow Official" and "StataGlow Modern"
- TextMate grammar (stata.json) auto-generated from YAML registry

#### Configuration
- `language-stata.highlight.functions` - Toggle function highlighting
- `language-stata.highlight.macros` - Toggle macro highlighting
- `language-stata.highlight.strings` - Toggle string highlighting
- `language-stata.highlight.regex` - Toggle regex highlighting
- `language-stata.highlight.factorVariables` - Toggle factor variable highlighting
- `language-stata.highlight.comments` - Toggle comment highlighting
- `language-stata.enableCommunityCommands` - Enable/disable community commands
- `language-stata.customCommands` - Array of custom command names

#### Build System
- `npm run build` - Generate stata.json from YAML registry
- `npm run validate` - Validate command registry schema
- `npm run test` - Run basic tests
- Build system automatically generates test files and documentation

#### Documentation
- Comprehensive README with installation and usage instructions
- CONTRIBUTING.md with guidelines for adding commands
- Language configuration for VS Code (language-configuration.json)
- Theme files with category-aware token colors
- Command registry schema (schema.json)

### Changed

- Migrated from Atom extension to VS Code/Positron extension
- Converted from Atom-specific entry point (lib/main.js) to VS Code extension API (extension.js)
- Replaced monolithic command list in grammar with structured YAML registry
- Removed lodash dependency (was only used for autocomplete)
- Converted CSON format to modular JSON (TextMate standard)

### Removed

- Atom-specific code and APIs
- Runtime autocomplete provider (users can rely on VS Code's native completion)
- Monolithic command list in grammar file

## Architecture

### From Original
- Core TextMate grammar patterns (comments, strings, macros, functions, operators, etc.)
- Support for all Stata syntax elements (functions, operators, macros, strings, regex patterns)
- File type associations (.do, .ado, .mata)

### New
- Command registry (YAML → JSON → TextMate)
- Configuration management (config-manager.js)
- Theme system with category-aware scopes
- Build automation
- User customization system

## Migration Notes

For users of the original language-stata extension:

1. Uninstall `kylebarron/language-stata`
2. Install `StataGlow` from VS Code Marketplace
3. Your personal customizations may need updating (see README.md)
4. Report any issues or missing features via GitHub

## Future Roadmap

- [ ] Automated weekly scraping of Stata docs and SSC archive
- [ ] Enhanced autocomplete with function signatures
- [ ] Modular grammar (split CSON into includes)
- [ ] LSP support for advanced features (linting, diagnostics)
- [ ] Integration with Stata help system
- [ ] More theme variants

---

**Note**: This is a complete rewrite of language-stata for modern VS Code/Positron development. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.
