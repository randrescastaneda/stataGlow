#!/usr/bin/env python3
"""
StataGlow Grammar Builder (Python version)
Converts YAML command registry + stata.cson patterns → stata.json (TextMate format)

Usage: python scripts/build-grammar.py

This Python version eliminates the need for Node.js, making it ideal for
data science environments where Python is more commonly available.
"""

import json
import re
import yaml
from pathlib import Path
from datetime import datetime

# Paths
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
COMMANDS_DIR = ROOT_DIR / "commands"
GRAMMARS_DIR = ROOT_DIR / "grammars"
EXAMPLES_DIR = ROOT_DIR / "examples"
CSON_FILE = ROOT_DIR / "stata.cson"


def load_yaml(filepath: Path) -> dict | None:
    """Load and parse a YAML file."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None


def extract_commands(data: dict, source_type: str = "official") -> list[dict]:
    """Extract commands from YAML structure."""
    commands = []
    if not data or "categories" not in data:
        return commands

    for category_key, category_data in data.get("categories", {}).items():
        if "commands" in category_data and isinstance(category_data["commands"], list):
            for cmd in category_data["commands"]:
                if cmd.get("name"):
                    commands.append({
                        "name": cmd["name"],
                        "category": cmd.get("category", category_key),
                        "source": source_type,
                        "status": cmd.get("status", "stable")
                    })
    return commands


def build_command_regex(commands: list[dict]) -> str:
    """Build regex pattern from command list."""
    names = sorted(set(cmd["name"] for cmd in commands))
    return "|".join(names)


def parse_cson_repository(cson_text: str) -> dict:
    """Extract repository patterns from stata.cson. Returns dict of pattern groups."""
    repository = {}
    
    # Find the repository section
    repo_match = re.search(r"'repository':\s*\n(.*)", cson_text, re.DOTALL)
    if not repo_match:
        return repository
    
    repo_text = repo_match.group(1)
    
    # Extract each named pattern group
    pattern_regex = r"'([a-z_-]+)':\s*\n\s*'patterns':\s*\[\s*\n(.*?)(?=\n\s*'[a-z_-]+':|$)"
    
    for match in re.finditer(pattern_regex, repo_text, re.DOTALL):
        pattern_name = match.group(1)
        pattern_content = match.group(2)
        
        patterns = extract_patterns_from_block(pattern_content)
        if patterns:
            repository[pattern_name] = {"patterns": patterns}
    
    return repository


def extract_patterns_from_block(block: str) -> list[dict]:
    """Extract pattern objects from a CSON block."""
    patterns = []
    
    # Split by pattern objects
    pattern_blocks = re.split(r"\n\s*\{\s*\n", block)
    
    for pblock in pattern_blocks:
        if not pblock.strip():
            continue
        
        pattern = {}
        
        # Extract 'match' or 'begin'/'end'
        match_m = re.search(r"'match':\s*'''(.+?)'''", pblock, re.DOTALL)
        if match_m:
            pattern["match"] = clean_regex(match_m.group(1))
        
        begin_m = re.search(r"'begin':\s*'''(.+?)'''", pblock, re.DOTALL)
        if begin_m:
            pattern["begin"] = clean_regex(begin_m.group(1))
        
        end_m = re.search(r"'end':\s*'''(.+?)'''", pblock, re.DOTALL)
        if end_m:
            pattern["end"] = clean_regex(end_m.group(1))
        
        # Extract 'name'
        name_m = re.search(r"'name':\s*'([^']+)'", pblock)
        if name_m:
            pattern["name"] = name_m.group(1)
        
        # Extract 'comment'
        comment_m = re.search(r"'comment':\s*'([^']+)'", pblock)
        if comment_m:
            pattern["comment"] = comment_m.group(1)
        
        if pattern.get("match") or pattern.get("begin"):
            patterns.append(pattern)
    
    return patterns


def clean_regex(regex: str) -> str:
    """Clean up regex pattern from CSON format."""
    # Remove newlines and extra whitespace
    regex = re.sub(r"\s+", " ", regex.strip())
    return regex


def create_stata_grammar(
    official_commands: list[dict],
    community_commands: list[dict],
    cson_patterns: dict
) -> dict:
    """Create the complete TextMate grammar."""
    
    # Build main patterns array
    main_patterns = []
    
    # Official commands
    if official_commands:
        main_patterns.append({
            "comment": "Official Stata commands (Stata 19)",
            "match": f"\\b({build_command_regex(official_commands)})\\b",
            "name": "keyword.command.official.stata"
        })
    
    # Community commands
    if community_commands:
        main_patterns.append({
            "comment": "Community-contributed commands (SSC/GitHub)",
            "match": f"\\b({build_command_regex(community_commands)})\\b",
            "name": "keyword.command.community.stata"
        })
    
    # Include syntax patterns
    main_patterns.extend([
        {"include": "#comments"},
        {"include": "#strings"},
        {"include": "#macros"},
        {"include": "#functions"},
        {"include": "#operators"},
        {"include": "#constants"},
        {"include": "#factor-variables"},
        {"include": "#control-flow"},
        {"include": "#builtin-variables"}
    ])
    
    # Build repository with all patterns
    repository = build_repository(cson_patterns)
    
    return {
        "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
        "name": "Stata",
        "scopeName": "source.stata",
        "fileTypes": ["do", "ado", "mata", "sthlp"],
        "foldingStartMarker": "\\{\\s*$",
        "foldingStopMarker": "^\\s*\\}",
        "patterns": main_patterns,
        "repository": repository
    }


def build_repository(cson_patterns: dict) -> dict:
    """Build the repository section with all pattern groups."""
    
    repository = {
        # Comments
        "comments": {
            "patterns": [
                {
                    "comment": "Block comment /* */",
                    "name": "comment.block.stata",
                    "begin": "/\\*",
                    "end": "\\*/"
                },
                {
                    "comment": "Line comment //",
                    "name": "comment.line.double-slash.stata",
                    "match": "//.*$"
                },
                {
                    "comment": "Line comment * (at line start)",
                    "name": "comment.line.star.stata",
                    "match": "^\\s*\\*.*$"
                },
                {
                    "comment": "Triple-slash continuation",
                    "name": "comment.line.triple-slash.stata",
                    "match": "///.*$"
                }
            ]
        },
        
        # Strings
        "strings": {
            "patterns": [
                {
                    "comment": "Compound string `\"...\"'",
                    "name": "string.quoted.compound.stata",
                    "begin": "`\"",
                    "end": "\"'"
                },
                {
                    "comment": "Regular string \"...\"",
                    "name": "string.quoted.double.stata",
                    "begin": "\"",
                    "end": "\""
                }
            ]
        },
        
        # Macros
        "macros": {
            "patterns": [
                {
                    "comment": "Local macro `name'",
                    "name": "variable.other.macro.local.stata",
                    "match": "`[a-zA-Z_][a-zA-Z0-9_]*'"
                },
                {
                    "comment": "Global macro ${name}",
                    "name": "variable.other.macro.global.stata",
                    "match": "\\$\\{[a-zA-Z_][a-zA-Z0-9_]*\\}"
                },
                {
                    "comment": "Global macro $name",
                    "name": "variable.other.macro.global.stata",
                    "match": "\\$[a-zA-Z_][a-zA-Z0-9_]*"
                }
            ]
        },
        
        # Functions
        "functions": {
            "patterns": [
                {
                    "comment": "Built-in functions",
                    "name": "support.function.builtin.stata",
                    "match": "\\b(abs|acos|acosh|asin|asinh|atan|atan2|atanh|ceil|cloglog|comb|cos|cosh|digamma|exp|expm1|floor|int|invcloglog|invlogit|ln|lnfactorial|lngamma|log|log10|log1m|log1p|logit|max|min|mod|reldif|round|sign|sin|sinh|sqrt|sum|tan|tanh|trigamma|trunc|ibeta|ibetatail|invibeta|invibetatail|binomial|binomialp|binomialtail|invbinomial|invbinomialtail|chi2|chi2den|chi2tail|invchi2|invchi2tail|F|Fden|Ftail|invF|invFtail|gammaden|gammap|gammaptail|invgammap|invgammaptail|hypergeometric|hypergeometricp|invnchi2|invnchi2tail|nchi2|nchi2den|nchi2tail|invnFtail|nFden|nFtail|nibeta|normal|normalden|invnormal|lnnormal|lnnormalden|invttail|tden|ttail|poisson|poissonp|poissontail|invpoisson|invpoissontail|abbrev|char|indexnot|plural|proper|real|regexm|regexr|regexs|reverse|soundex|soundex_nara|strlen|strlower|strltrim|strmatch|strofreal|strpos|strproper|strreverse|strrtrim|strtoname|strtrim|strupper|subinstr|subinword|substr|trim|uchar|udstrlen|uisdigit|uisletter|upper|ustrcompare|ustrfix|ustrleft|ustrlen|ustrlower|ustrltrim|ustrnormalize|ustrpos|ustrregexm|ustrregexra|ustrregexrf|ustrregexs|ustrreverse|ustrright|ustrrightind|ustrsortkey|ustrtitle|ustrto|ustrtohex|ustrtoname|ustrtrim|ustrunescape|ustrupper|ustrword|ustrwordcount|usubinstr|usubstr|word|wordbreaklocale|wordcount|autocode|byteorder|c|_caller|chop|clip|cond|e|el|epsdouble|epsfloat|fileexists|fileread|filereaderror|filewrite|float|fmtwidth|group|has_eprop|inlist|inrange|irecode|matrix|maxbyte|maxdouble|maxfloat|maxint|maxlong|mi|minbyte|mindouble|minfloat|minint|minlong|missing|r|recode|replay|return|s|scalar|smallestdouble|Cofc|Cofd|Cofz|Coft|cofC|date|day|dofC|dofb|dofh|dofm|dofq|dofw|dofy|dow|doy|halfyear|hhC|hofd|hh|hours|mdyhms|mdy|minutes|mm|mmC|mofd|month|monthly|msofhours|msofminutes|msofseconds|qofd|quarter|quarterly|seconds|ss|ssC|tC|tc|td|th|tm|tq|tw|week|weekly|wofd|year|yearly|yh|ym|yofd|yq|yw|bofd|bofC|cofb|cofh|cofm|cofq|cofw|cofy|dofC|dofb|dofh|dofm|dofq|dofw|dofy|hofd|mofd|qofd|wofd|yofd|J|I|cholesky|corr|det|diag|diag0cnt|el|get|hadamard|inv|invsym|issymmetric|matmissing|matuniform|mreldif|nullmat|rowsof|colsof|rownumb|colnumb|rowfreq|colfreq|trace|vec|vecdiag)\\s*(?=\\()"
                }
            ]
        },
        
        # Operators
        "operators": {
            "patterns": [
                {
                    "comment": "Arithmetic operators",
                    "name": "keyword.operator.arithmetic.stata",
                    "match": "[+\\-*/^]"
                },
                {
                    "comment": "Comparison operators",
                    "name": "keyword.operator.comparison.stata",
                    "match": "(==|!=|<=|>=|<|>)"
                },
                {
                    "comment": "Logical operators",
                    "name": "keyword.operator.logical.stata",
                    "match": "(&|\\||!)"
                },
                {
                    "comment": "Assignment",
                    "name": "keyword.operator.assignment.stata",
                    "match": "="
                },
                {
                    "comment": "Factor variable interaction",
                    "name": "keyword.operator.factor.stata",
                    "match": "(##|#)"
                }
            ]
        },
        
        # Constants
        "constants": {
            "patterns": [
                {
                    "comment": "Numeric constant",
                    "name": "constant.numeric.stata",
                    "match": "\\b\\d+\\.?\\d*([eE][+-]?\\d+)?\\b"
                },
                {
                    "comment": "Missing value",
                    "name": "constant.language.missing.stata",
                    "match": "\\.(\\.[a-z])?"
                }
            ]
        },
        
        # Factor Variables
        "factor-variables": {
            "patterns": [
                {
                    "comment": "Factor variable prefix i. c. o. etc",
                    "name": "keyword.other.factor.stata",
                    "match": "\\b(i|c|o|ib|ibn|io)\\."
                },
                {
                    "comment": "Base specification ib()",
                    "name": "keyword.other.factor.base.stata",
                    "match": "\\bib\\((first|last|freq|\\d+)\\)\\."
                }
            ]
        },
        
        # Control Flow
        "control-flow": {
            "patterns": [
                {
                    "comment": "Control flow keywords",
                    "name": "keyword.control.stata",
                    "match": "\\b(if|else|while|foreach|forvalues|continue|break|in|of|local|global|varlist|newlist|numlist)\\b"
                },
                {
                    "comment": "Command prefixes",
                    "name": "keyword.other.prefix.stata",
                    "match": "\\b(by|bysort|quietly|noisily|capture|version|bootstrap|jackknife)\\b"
                }
            ]
        },
        
        # Built-in Variables
        "builtin-variables": {
            "patterns": [
                {
                    "comment": "System variables",
                    "name": "variable.language.stata",
                    "match": "\\b(_n|_N|_rc|_pi|_all|_b|_se|_cons)\\b"
                }
            ]
        }
    }
    
    # Merge any additional CSON patterns
    repository.update(cson_patterns)
    
    return repository


def main():
    print("🔨 Building StataGlow grammar (Python version)...\n")
    
    # Step 1: Load command registries
    print("📖 Step 1: Loading command registries...")
    
    official_data = load_yaml(COMMANDS_DIR / "official_stata_commands.yaml")
    ssc_data = load_yaml(COMMANDS_DIR / "ssc_contributed_commands.yaml")
    github_data = load_yaml(COMMANDS_DIR / "github_contributed_commands.yaml")
    
    if not official_data:
        print("✗ Failed to load official commands")
        return 1
    
    official_commands = extract_commands(official_data, "official")
    ssc_commands = extract_commands(ssc_data, "ssc") if ssc_data else []
    github_commands = extract_commands(github_data, "github") if github_data else []
    community_commands = ssc_commands + github_commands
    
    print(f"✓ Official commands: {len(official_commands)}")
    print(f"✓ Community commands: {len(community_commands)}")
    print()
    
    # Step 2: Parse CSON patterns (optional)
    print("📖 Step 2: Loading syntax patterns from stata.cson...")
    cson_patterns = {}
    
    if CSON_FILE.exists():
        try:
            cson_text = CSON_FILE.read_text(encoding="utf-8")
            cson_patterns = parse_cson_repository(cson_text)
            print(f"✓ Loaded {len(cson_patterns)} pattern groups from stata.cson")
        except Exception as e:
            print(f"⚠ Could not parse stata.cson: {e}")
    else:
        print("⚠ stata.cson not found, using built-in patterns only")
    print()
    
    # Step 3: Build grammar
    print("⚙️  Step 3: Building TextMate grammar...")
    grammar = create_stata_grammar(official_commands, community_commands, cson_patterns)
    
    total_patterns = len(grammar.get("repository", {})) + len(grammar.get("patterns", []))
    print(f"✓ Grammar built with {total_patterns} pattern definitions")
    print()
    
    # Step 4: Write grammar file
    print("💾 Step 4: Writing stata.json...")
    GRAMMARS_DIR.mkdir(exist_ok=True)
    
    grammar_path = GRAMMARS_DIR / "stata.json"
    with open(grammar_path, "w", encoding="utf-8") as f:
        json.dump(grammar, f, indent=2)
    
    grammar_size = grammar_path.stat().st_size / 1024
    print(f"✓ Written: {grammar_path} ({grammar_size:.2f} KB)")
    print()
    
    # Summary
    print("✅ Build complete!")
    print()
    print("Summary:")
    print(f"  • Grammar file: {grammar_path}")
    print(f"  • Official commands: {len(official_commands)}")
    print(f"  • Community commands: {len(community_commands)}")
    print(f"  • Syntax patterns: {total_patterns}")
    print()
    print("Next steps:")
    print("  1. Reload VS Code/Positron window")
    print("  2. Open: examples/comprehensive-syntax-test.do")
    print("  3. Verify syntax highlighting")
    
    return 0


if __name__ == "__main__":
    exit(main())
