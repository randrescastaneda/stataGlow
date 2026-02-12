#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const csonParser = require('./cson-parser');

/**
 * StataGlow Build Script (Phase 2)
 * 
 * Converts YAML command registry + stata.cson patterns → stata.json (TextMate format)
 * Generates comprehensive test file with all Stata syntax elements
 * 
 * Usage: npm run build
 */

const COMMANDS_DIR = path.join(__dirname, '..', 'commands');
const GRAMMARS_DIR = path.join(__dirname, '..', 'grammars');
const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');
const WORKSPACE_ROOT = path.join(__dirname, '..');

// ============================================================================
// YAML & Command Registry Functions
// ============================================================================

function loadYAML(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error(`Error loading YAML file ${filePath}:`, error.message);
    return null;
  }
}

function extractCommands(data, sourceType = 'official') {
  const commands = [];
  if (!data || !data.categories) {
    return commands;
  }

  for (const [categoryKey, categoryData] of Object.entries(data.categories)) {
    if (categoryData.commands && Array.isArray(categoryData.commands)) {
      categoryData.commands.forEach(cmd => {
        if (cmd.name) {
          commands.push({
            name: cmd.name,
            category: cmd.category || categoryKey,
            source: sourceType,
            status: cmd.status || 'stable'
          });
        }
      });
    }
  }
  return commands;
}

function buildCommandRegex(commands) {
  // Sort and deduplicate commands
  const sortedCommands = commands
    .map(c => c.name)
    .sort()
    .filter((cmd, idx, arr) => idx === 0 || arr[idx - 1] !== cmd);

  // Build regex pattern
  return sortedCommands.join('|');
}

// ============================================================================
// CSON Pattern Loading
// ============================================================================

function loadCSONPatterns(csonPath) {
  if (!fs.existsSync(csonPath)) {
    console.warn(`⚠ CSON file not found: ${csonPath}`);
    return null;
  }
  
  try {
    const grammar = csonParser.parseCSONFile(csonPath);
    return grammar;
  } catch (error) {
    console.error(`Error parsing CSON: ${error.message}`);
    return null;
  }
}

// ============================================================================
// Grammar Building Functions
// ============================================================================

function createStataGrammarJSON(officialCommands, communityCommands, personalCommands, csonGrammar) {
  // Build command patterns for three tiers
  const commandPatterns = [];
  
  // Official Stata commands (primary)
  if (officialCommands.length > 0) {
    commandPatterns.push({
      comment: 'Official Stata commands (Stata 19)',
      match: `\\b(${buildCommandRegex(officialCommands)})\\b`,
      name: 'keyword.command.official.stata'
    });
  }
  
  // Community commands (SSC/GitHub)
  if (communityCommands.length > 0) {
    commandPatterns.push({
      comment: 'Community-contributed commands (SSC/GitHub)',
      match: `\\b(${buildCommandRegex(communityCommands)})\\b`,
      name: 'keyword.command.community.stata'
    });
  }
  
  // User custom commands
  if (personalCommands.length > 0) {
    commandPatterns.push({
      comment: 'User-defined custom commands',
      match: `\\b(${buildCommandRegex(personalCommands)})\\b`,
      name: 'keyword.command.custom.stata'
    });
  }
  
  // Merge patterns: commands first, then CSON patterns
  let mainPatterns = [...commandPatterns];
  
  // Add CSON main patterns (includes and inline patterns)
  if (csonGrammar && csonGrammar.patterns) {
    mainPatterns = mainPatterns.concat(csonGrammar.patterns);
  } else {
    // Fallback: add essential pattern includes
    mainPatterns.push(
      { include: '#comments' },
      { include: '#strings' },
      { include: '#functions' },
      { include: '#macros' },
      { include: '#operators' }
    );
  }
  
  // Build repository from CSON or use defaults
  let repository = {};
  
  if (csonGrammar && csonGrammar.repository) {
    repository = csonGrammar.repository;
  } else {
    // Fallback: minimal default patterns
    repository = getDefaultRepository();
  }
  
  // Create TextMate grammar
  const grammar = {
    $schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
    name: csonGrammar?.name || 'Stata',
    scopeName: csonGrammar?.scopeName || 'source.stata',
    fileTypes: csonGrammar?.fileTypes || ['do', 'ado', 'mata'],
    foldingStartMarker: csonGrammar?.foldingStartMarker || '\\{\\s*$',
    foldingStopMarker: csonGrammar?.foldingStopMarker || '^\\s*\\}',
    patterns: mainPatterns,
    repository: repository
  };

  return grammar;
}

function getDefaultRepository() {
  return {
    comments: {
      patterns: [
        {
          name: 'comment.line.double-slash.stata',
          begin: '//',
          end: '$'
        },
        {
          name: 'comment.block.stata',
          begin: '/\\*',
          end: '\\*/'
        }
      ]
    },
    strings: {
      patterns: [
        {
          name: 'string.quoted.double.stata',
          begin: '"',
          end: '"',
          patterns: [
            { name: 'constant.character.escape.stata', match: '\\\\.' }
          ]
        }
      ]
    },
    functions: {
      patterns: [
        {
          name: 'support.function.builtin.stata',
          match: '\\b(abs|acos|acosh|asin|asinh|atan|atan2|atanh|ceil|comb|cos|cosh|exp|floor|int|ln|log|log10|max|min|mod|round|sign|sin|sinh|sqrt|tan|tanh)\\('
        }
      ]
    },
    macros: {
      patterns: [
        {
          name: 'variable.other.macro.local.stata',
          match: '`[a-zA-Z_][a-zA-Z0-9_]*\''
        },
        {
          name: 'variable.other.macro.global.stata',
          match: '\\$[a-zA-Z_][a-zA-Z0-9_]*'
        }
      ]
    },
    operators: {
      patterns: [
        {
          name: 'keyword.operator.arithmetic.stata',
          match: '[+\\-*/^]'
        },
        {
          name: 'keyword.operator.comparison.stata',
          match: '(==|!=|<|>|<=|>=)'
        }
      ]
    }
  };
}

// ============================================================================
// Comprehensive Test File Generation
// ============================================================================

function generateComprehensiveTestFile(officialCommands, communityCommands) {
  const lines = [];
  
  lines.push('/*');
  lines.push('StataGlow - Comprehensive Syntax Highlighting Test File');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('This file demonstrates ALL Stata syntax elements for highlighting verification.');
  lines.push('Enable/disable categories in VS Code settings: language-stata.highlight.*');
  lines.push('*/');
  lines.push('');
  
  // =================================================================
  // COMMANDS SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 1: COMMANDS (Three Tiers)');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push(`// OFFICIAL COMMANDS (${officialCommands.length} total - showing samples)`);
  lines.push('sysuse auto, clear');
  lines.push('regress mpg weight displacement');
  lines.push('mixed score || school:');
  lines.push('margins, over(group)');
  lines.push('fmm 2: regress y x');
  lines.push('melogit outcome || school:');
  lines.push('gsem (x -> y) (y -> z)');
  lines.push('teffects ipw (y) (treatment x1 x2)');
  lines.push('');
  
  if (communityCommands.length > 0) {
    lines.push('// COMMUNITY COMMANDS (SSC/GitHub)');
    communityCommands.slice(0, 5).forEach(cmd => {
      lines.push(`${cmd.name}  // community command`);
    });
    lines.push('');
  }
  
  lines.push('// CUSTOM COMMANDS (user-defined via settings)');
  lines.push('// Add custom commands in: language-stata.customCommands');
  lines.push('');
  
  // =================================================================
  // FUNCTIONS SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 2: FUNCTIONS');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Mathematical Functions');
  lines.push('gen sine = sin(x)');
  lines.push('gen cosine = cos(x)');
  lines.push('gen absolute = abs(value)');
  lines.push('gen exponent = exp(x)');
  lines.push('gen logarithm = ln(x)');
  lines.push('gen log_base10 = log10(x)');
  lines.push('gen square_root = sqrt(x)');
  lines.push('gen tangent = tan(x)');
  lines.push('gen ceiling_val = ceil(x)');
  lines.push('gen floor_val = floor(x)');
  lines.push('gen maximum = max(x, y, z)');
  lines.push('gen minimum = min(a, b)');
  lines.push('gen modulo = mod(x, 3)');
  lines.push('gen rounded = round(x, 0.01)');
  lines.push('gen sign_val = sign(x)');
  lines.push('');
  
  lines.push('// String Functions');
  lines.push('gen length = strlen(name)');
  lines.push('gen uppercase = upper(name)');
  lines.push('gen lowercase = lower(text)');
  lines.push('gen substring = substr(text, 1, 5)');
  lines.push('gen reversed = strreverse(text)');
  lines.push('gen trimmed = trim(text)');
  lines.push('gen left_trim = ltrim(text)');
  lines.push('gen right_trim = rtrim(text)');
  lines.push('gen position = strpos(text, "word")');
  lines.push('gen proper_case = proper(name)');
  lines.push('gen word1 = word(sentence, 1)');
  lines.push('gen nwords = wordcount(sentence)');
  lines.push('');
  
  lines.push('// Statistical Distribution Functions');
  lines.push('gen normal_prob = normal(x)');
  lines.push('gen normal_den = normalden(x)');
  lines.push('gen inv_normal = invnormal(p)');
  lines.push('gen t_prob = t(df, x)');
  lines.push('gen t_den = tden(df, x)');
  lines.push('gen inv_t = invt(df, p)');
  lines.push('gen chi2_prob = chi2(df, x)');
  lines.push('gen chi2_den = chi2den(df, x)');
  lines.push('gen inv_chi2 = invchi2(df, p)');
  lines.push('gen f_prob = F(df1, df2, x)');
  lines.push('gen binomial_prob = binomial(n, k, p)');
  lines.push('gen poisson_prob = poisson(mean, k)');
  lines.push('');
  
  lines.push('// Date and Time Functions');
  lines.push('gen today_date = date("2024-01-15", "YMD")');
  lines.push('gen year_val = year(date_var)');
  lines.push('gen month_val = month(date_var)');
  lines.push('gen day_val = day(date_var)');
  lines.push('gen dow_val = dow(date_var)');
  lines.push('gen doy_val = doy(date_var)');
  lines.push('gen quarter_val = quarter(date_var)');
  lines.push('gen week_val = week(date_var)');
  lines.push('gen clock_val = clock("12:30:45", "hms")');
  lines.push('gen hours_val = hh(clock_var)');
  lines.push('gen minutes_val = mm(clock_var)');
  lines.push('gen seconds_val = ss(clock_var)');
  lines.push('');
  
  lines.push('// Random Number Functions');
  lines.push('gen random_uniform = runiform()');
  lines.push('gen random_normal = rnormal()');
  lines.push('gen random_normal2 = rnormal(10, 2)');
  lines.push('gen random_int = runiformint(1, 100)');
  lines.push('gen random_binomial = rbinomial(10, 0.5)');
  lines.push('gen random_poisson = rpoisson(5)');
  lines.push('');
  
  // =================================================================
  // MACROS SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 3: MACROS (Local & Global)');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Local Macro Definition');
  lines.push('local myvar "weight displacement"');
  lines.push('local count = 5');
  lines.push('local ++count');
  lines.push('local --count');
  lines.push('');
  
  lines.push('// Local Macro Usage');
  lines.push('display "`myvar\'"');
  lines.push('regress mpg `myvar\'');
  lines.push('local result = `count\' * 2');
  lines.push('');
  
  lines.push('// Global Macro Definition');
  lines.push('global xvars "weight length displacement"');
  lines.push('global depvar "mpg"');
  lines.push('global datapath "C:/data/project"');
  lines.push('');
  
  lines.push('// Global Macro Usage');
  lines.push('regress $depvar $xvars');
  lines.push('display "$depvar and $xvars"');
  lines.push('use "$datapath/mydata.dta", clear');
  lines.push('');
  
  lines.push('// Extended Macro Functions');
  lines.push('local nvar: word count `myvar\'');
  lines.push('local first: word 1 of `myvar\'');
  lines.push('local sorted: list sort myvar');
  lines.push('local unique: list uniq duplicates');
  lines.push('local combined: list myvar | othervar');
  lines.push('local intersection: list myvar & othervar');
  lines.push('local vartype: type myvar');
  lines.push('local varlabel: variable label myvar');
  lines.push('');
  
  lines.push('// Tempvar, Tempname, Tempfile');
  lines.push('tempvar temp1 temp2');
  lines.push('tempname matrix1 scalar1');
  lines.push('tempfile tmpdata');
  lines.push('');
  
  // =================================================================
  // STRINGS SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 4: STRINGS');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Regular Strings (double quotes)');
  lines.push('local title "My Analysis Title"');
  lines.push('display "Results for year 2024"');
  lines.push('label variable mpg "Miles per Gallon"');
  lines.push('');
  
  lines.push('// Compound Strings (backtick-quote pairs)');
  lines.push('local text `"This is a "compound" string"\'');
  lines.push('display `"Line with `myvar\' interpolation"\'');
  lines.push('local nested `"Outer `"inner"\' string"\'');
  lines.push('');
  
  lines.push('// String with Macros');
  lines.push('local message "Variable `myvar\' has value $global1"');
  lines.push('');
  
  // =================================================================
  // OPERATORS SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 5: OPERATORS');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Arithmetic Operators');
  lines.push('gen result = x + y - z * w / u ^ 2');
  lines.push('gen negation = -x');
  lines.push('local new_val = 5 + 3');
  lines.push('');
  
  lines.push('// Logical Operators');
  lines.push('gen logic1 = (x > 10) & (y < 5)');
  lines.push('gen logic2 = (a == 1) | (b == 2)');
  lines.push('gen not_val = !condition');
  lines.push('');
  
  lines.push('// Comparison Operators');
  lines.push('gen equal = (x == y)');
  lines.push('gen not_equal = (x != y)');
  lines.push('gen less = (x < y)');
  lines.push('gen greater = (x > y)');
  lines.push('gen less_eq = (x <= y)');
  lines.push('gen greater_eq = (x >= y)');
  lines.push('');
  
  lines.push('// Assignment Operators');
  lines.push('local x = 5');
  lines.push('global y = 10');
  lines.push('gen z = x + y');
  lines.push('replace z = 0 if missing(z)');
  lines.push('');
  
  // =================================================================
  // COMMENTS SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 6: COMMENTS');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Double-slash line comment');
  lines.push('* Star comment (must be at line start)');
  lines.push('');
  
  lines.push('/* Block comment');
  lines.push('   spanning multiple');
  lines.push('   lines */');
  lines.push('');
  
  lines.push('gen x = 1  // Inline comment after code');
  lines.push('');
  
  lines.push('/// Triple-slash comment (line continuation)');
  lines.push('regress mpg weight ///');
  lines.push('  displacement ///');
  lines.push('  length');
  lines.push('');
  
  // =================================================================
  // FACTOR VARIABLES SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 7: FACTOR VARIABLES');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Basic factor variable notation');
  lines.push('regress y i.group');
  lines.push('regress y c.continuous');
  lines.push('regress y o.outcome');
  lines.push('');
  
  lines.push('// Interactions');
  lines.push('regress y i.group#c.x');
  lines.push('regress y i.group##c.x');
  lines.push('regress y i.year##i.region');
  lines.push('');
  
  lines.push('// Base category specification');
  lines.push('regress y ib2.group');
  lines.push('regress y ib(first).year');
  lines.push('regress y ib(last).year');
  lines.push('regress y ib(freq).category');
  lines.push('');
  
  lines.push('// Specific levels');
  lines.push('regress y i(2012).year');
  lines.push('regress y i(1/5).category');
  lines.push('');
  
  // =================================================================
  // LOOPS AND CONDITIONALS SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 8: LOOPS AND CONDITIONALS');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Foreach Loops');
  lines.push('foreach var of varlist x y z {');
  lines.push('  summarize `var\'');
  lines.push('}');
  lines.push('');
  
  lines.push('foreach val in 1 2 3 4 5 {');
  lines.push('  display `val\'');
  lines.push('}');
  lines.push('');
  
  lines.push('foreach word of local myvar {');
  lines.push('  display "`word\'"');
  lines.push('}');
  lines.push('');
  
  lines.push('// Forvalues Loops');
  lines.push('forvalues i = 1/10 {');
  lines.push('  display "Iteration `i\'"');
  lines.push('}');
  lines.push('');
  
  lines.push('forvalues j = 0(5)100 {');
  lines.push('  display `j\'');
  lines.push('}');
  lines.push('');
  
  lines.push('// While Loops');
  lines.push('local i = 0');
  lines.push('while `i\' < 5 {');
  lines.push('  display `i\'');
  lines.push('  local ++i');
  lines.push('}');
  lines.push('');
  
  lines.push('// If-Else Conditionals');
  lines.push('if x > 0 {');
  lines.push('  display "Positive"');
  lines.push('}');
  lines.push('else if x == 0 {');
  lines.push('  display "Zero"');
  lines.push('}');
  lines.push('else {');
  lines.push('  display "Negative"');
  lines.push('}');
  lines.push('');
  
  // =================================================================
  // REGEX SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 9: REGULAR EXPRESSIONS');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// ASCII Regular Expressions');
  lines.push('if regexm(varname, "^[0-9]+$") {');
  lines.push('  display "All digits"');
  lines.push('}');
  lines.push('');
  
  lines.push('gen cleaned = regexr(text, "[^a-zA-Z]", "")');
  lines.push('gen match = regexm(str, "pattern.*end")');
  lines.push('local captured = regexs(1)');
  lines.push('');
  
  lines.push('// Unicode Regular Expressions');
  lines.push('if ustrregexm(name, "[A-Z][a-z]+") {');
  lines.push('  display "Has capitalized words"');
  lines.push('}');
  lines.push('');
  
  lines.push('gen result = ustrregexrf(str, "\\d+", "X")');
  lines.push('gen all_replaced = ustrregexra(str, "\\s+", " ")');
  lines.push('');
  
  // =================================================================
  // SUBSCRIPTS AND MATRICES SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 10: SUBSCRIPTS AND MATRIX OPERATIONS');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Matrix Subscripts');
  lines.push('matrix A = (1, 2 \\ 3, 4)');
  lines.push('scalar element = A[1,1]');
  lines.push('matrix row1 = A[1, 1..2]');
  lines.push('matrix col1 = A[1..2, 1]');
  lines.push('matrix submat = A[1..2, 1..2]');
  lines.push('');
  
  lines.push('// Variable Subscripts');
  lines.push('gen lagged = x[_n-1]');
  lines.push('gen lead = x[_n+1]');
  lines.push('gen first = x[1]');
  lines.push('gen last = x[_N]');
  lines.push('');
  
  lines.push('// Matrix Functions');
  lines.push('matrix B = J(3, 3, 0)');
  lines.push('matrix I = I(4)');
  lines.push('matrix inv_A = inv(A)');
  lines.push('matrix t_A = A\'');
  lines.push('scalar det_A = det(A)');
  lines.push('scalar trace_A = trace(A)');
  lines.push('');
  
  // =================================================================
  // DATA MANAGEMENT SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 11: DATA MANAGEMENT');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// File Operations');
  lines.push('use "mydata.dta", clear');
  lines.push('save "output.dta", replace');
  lines.push('saveold "oldformat.dta", replace');
  lines.push('');
  
  lines.push('// Variable Operations');
  lines.push('gen newvar = oldvar * 2');
  lines.push('replace newvar = . if newvar < 0');
  lines.push('egen mean_x = mean(x), by(group)');
  lines.push('');
  
  lines.push('// Data Subsetting');
  lines.push('keep if year >= 2020');
  lines.push('drop if _merge == 2');
  lines.push('keep var1 var2 var3');
  lines.push('drop temp*');
  lines.push('');
  
  lines.push('// Sorting and Ordering');
  lines.push('sort country year');
  lines.push('gsort -year country');
  lines.push('order id name, first');
  lines.push('');
  
  lines.push('// Merging');
  lines.push('merge 1:1 id using "other.dta"');
  lines.push('merge m:1 country year using "country_data.dta"');
  lines.push('');
  
  lines.push('// Reshaping');
  lines.push('reshape wide value, i(id) j(year)');
  lines.push('reshape long income, i(id) j(year)');
  lines.push('');
  
  // =================================================================
  // PREFIXES SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 12: COMMAND PREFIXES');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// By Prefix');
  lines.push('by group: summarize x');
  lines.push('bysort country year: gen obs = _n');
  lines.push('');
  
  lines.push('// Quietly and Noisily');
  lines.push('quietly regress y x');
  lines.push('noisily display "This shows"');
  lines.push('');
  
  lines.push('// Capture');
  lines.push('capture drop tempvar');
  lines.push('capture confirm file "test.dta"');
  lines.push('');
  
  lines.push('// Version');
  lines.push('version 17');
  lines.push('');
  
  lines.push('// Bootstrap and Jackknife');
  lines.push('bootstrap coef=_b[x], reps(100): regress y x');
  lines.push('jackknife: regress y x');
  lines.push('');
  
  // =================================================================
  // PROGRAMS SECTION
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 13: PROGRAMS');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Program Definition');
  lines.push('program define myprogram');
  lines.push('  syntax varlist [if] [in], [Option1(string) Option2(real 0)]');
  lines.push('  display "Running myprogram"');
  lines.push('  regress `varlist\'');
  lines.push('end');
  lines.push('');
  
  lines.push('// Program with Arguments');
  lines.push('program myprogram2');
  lines.push('  args var1 var2 var3');
  lines.push('  display "`var1\' `var2\' `var3\'"');
  lines.push('end');
  lines.push('');
  
  lines.push('program drop myprogram');
  lines.push('');
  
  // =================================================================
  // SCALARS AND CONSTANTS
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// SECTION 14: SCALARS AND CONSTANTS');
  lines.push('// =================================================================');
  lines.push('');
  
  lines.push('// Scalar Definition');
  lines.push('scalar pi_val = _pi');
  lines.push('scalar n_obs = _N');
  lines.push('scalar my_const = 2.71828');
  lines.push('');
  
  lines.push('// Built-in Constants');
  lines.push('display _pi');
  lines.push('display _N');
  lines.push('display _n');
  lines.push('display _rc');
  lines.push('');
  
  lines.push('// Missing Values');
  lines.push('gen has_missing = missing(x)');
  lines.push('replace x = . if x < 0');
  lines.push('replace x = .a if condition1');
  lines.push('replace x = .z if condition2');
  lines.push('');
  
  // =================================================================
  // END
  // =================================================================
  lines.push('// =================================================================');
  lines.push('// END OF COMPREHENSIVE TEST FILE');
  lines.push('// =================================================================');
  lines.push('');
  lines.push('// This file is automatically generated by: npm run build');
  lines.push('// Edit to add more test cases for specific syntax elements.');
  lines.push('// Report highlighting issues at: github.com/randrescastaneda/stataGlow');
  lines.push('');
  
  return lines.join('\n');
}

// ============================================================================
// Main Build Process
// ============================================================================

function main() {
  console.log('🔨 Building StataGlow grammar (Phase 2)...\n');

  // Step 1: Load command registries
  console.log('📖 Step 1: Loading command registries...');
  const officialData = loadYAML(path.join(COMMANDS_DIR, 'official_stata_commands.yaml'));
  const sscData = loadYAML(path.join(COMMANDS_DIR, 'ssc_contributed_commands.yaml'));
  const githubData = loadYAML(path.join(COMMANDS_DIR, 'github_contributed_commands.yaml'));

  if (!officialData) {
    console.error('✗ Failed to load official commands');
    process.exit(1);
  }

  const officialCommands = extractCommands(officialData, 'official');
  const sscCommands = extractCommands(sscData, 'ssc');
  const githubCommands = extractCommands(githubData, 'github');
  const communityCommands = [...sscCommands, ...githubCommands];

  console.log(`✓ Official commands: ${officialCommands.length}`);
  console.log(`✓ Community commands: ${communityCommands.length} (${sscCommands.length} SSC + ${githubCommands.length} GitHub)`);
  console.log('');

  // Step 2: Load CSON patterns
  console.log('📖 Step 2: Loading syntax patterns from stata.cson...');
  const csonPath = path.join(WORKSPACE_ROOT, 'stata.cson');
  let csonGrammar = null;

  if (fs.existsSync(csonPath)) {
    csonGrammar = loadCSONPatterns(csonPath);
    if (csonGrammar && csonGrammar.repository) {
      const patternCount = Object.keys(csonGrammar.repository).length;
      console.log(`✓ Loaded ${patternCount} pattern groups from stata.cson`);
    } else {
      console.warn('⚠ Could not parse repository patterns from stata.cson');
      console.warn('  Using default patterns');
    }
  } else {
    console.warn(`⚠ stata.cson not found at ${csonPath}`);
    console.warn('  Grammar will use default patterns only');
  }
  console.log('');

  // Step 3: Build grammar
  console.log('⚙️  Step 3: Building TextMate grammar...');
  const grammar = createStataGrammarJSON(
    officialCommands,
    communityCommands,
    [], // personalCommands - loaded at runtime via config
    csonGrammar
  );

  // Count patterns
  const repoPatternCount = grammar.repository ? Object.keys(grammar.repository).length : 0;
  const mainPatternCount = grammar.patterns ? grammar.patterns.length : 0;
  console.log(`✓ Grammar built with ${mainPatternCount} main patterns and ${repoPatternCount} repository groups`);
  console.log('');

  // Step 4: Write grammar file
  console.log('💾 Step 4: Writing stata.json...');
  
  // Ensure grammars directory exists
  if (!fs.existsSync(GRAMMARS_DIR)) {
    fs.mkdirSync(GRAMMARS_DIR, { recursive: true });
  }

  const grammarsPath = path.join(GRAMMARS_DIR, 'stata.json');
  fs.writeFileSync(grammarsPath, JSON.stringify(grammar, null, 2));
  const grammarSize = (fs.statSync(grammarsPath).size / 1024).toFixed(2);
  console.log(`✓ Written: ${grammarsPath} (${grammarSize} KB)`);
  console.log('');

  // Step 5: Generate comprehensive test file
  console.log('📝 Step 5: Generating comprehensive test file...');
  
  // Ensure examples directory exists
  if (!fs.existsSync(EXAMPLES_DIR)) {
    fs.mkdirSync(EXAMPLES_DIR, { recursive: true });
  }

  const testContent = generateComprehensiveTestFile(officialCommands, communityCommands);
  const testPath = path.join(EXAMPLES_DIR, 'comprehensive-syntax-test.do');
  fs.writeFileSync(testPath, testContent);
  const testSize = (fs.statSync(testPath).size / 1024).toFixed(2);
  const lineCount = testContent.split('\n').length;
  console.log(`✓ Written: ${testPath} (${testSize} KB, ${lineCount} lines)`);
  console.log('');

  // Summary
  console.log('✅ Build complete!');
  console.log('');
  console.log('Summary:');
  console.log(`  • Grammar file: grammars/stata.json`);
  console.log(`  • Test file: examples/comprehensive-syntax-test.do`);
  console.log(`  • Official commands: ${officialCommands.length}`);
  console.log(`  • Community commands: ${communityCommands.length}`);
  console.log(`  • Repository patterns: ${repoPatternCount}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Test in VS Code/Positron: examples/comprehensive-syntax-test.do');
  console.log('  2. Verify highlighting for each syntax category');
  console.log('  3. Run: npm run validate');
  console.log('  4. Proceed to Phase 3 (publishing)');
}

if (require.main === module) {
  main();
}

module.exports = {
  extractCommands,
  buildCommandRegex,
  createStataGrammarJSON,
  generateComprehensiveTestFile,
  loadCSONPatterns
};
