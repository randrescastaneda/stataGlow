/*
StataGlow - Comprehensive Syntax Highlighting Test File
Generated: 2026-02-12

This file demonstrates ALL Stata syntax elements for highlighting verification.
Enable/disable categories in VS Code settings: language-stata.highlight.*
*/

// =================================================================
// SECTION 1: COMMANDS (Three Tiers)
// =================================================================

// OFFICIAL COMMANDS (176 total - showing samples)
sysuse auto, clear
regress mpg weight displacement
mixed score || school:
margins, over(group)
fmm 2: regress y x
melogit outcome || school:
gsem (x -> y) (y -> z)
teffects ipw (y) (treatment x1 x2)

// CUSTOM COMMANDS (user-defined via settings)
// Add custom commands in: language-stata.customCommands

// =================================================================
// SECTION 2: FUNCTIONS
// =================================================================

// Mathematical Functions
gen sine = sin(x)
gen cosine = cos(x)
gen absolute = abs(value)
gen exponent = exp(x)
gen logarithm = ln(x)
gen log_base10 = log10(x)
gen square_root = sqrt(x)
gen tangent = tan(x)
gen ceiling_val = ceil(x)
gen floor_val = floor(x)
gen maximum = max(x, y, z)
gen minimum = min(a, b)
gen modulo = mod(x, 3)
gen rounded = round(x, 0.01)
gen sign_val = sign(x)

// String Functions
gen length = strlen(name)
gen uppercase = upper(name)
gen lowercase = lower(text)
gen substring = substr(text, 1, 5)
gen reversed = strreverse(text)
gen trimmed = trim(text)
gen left_trim = ltrim(text)
gen right_trim = rtrim(text)
gen position = strpos(text, "word")
gen proper_case = proper(name)
gen word1 = word(sentence, 1)
gen nwords = wordcount(sentence)

// Statistical Distribution Functions
gen normal_prob = normal(x)
gen normal_den = normalden(x)
gen inv_normal = invnormal(p)
gen t_prob = t(df, x)
gen t_den = tden(df, x)
gen inv_t = invt(df, p)
gen chi2_prob = chi2(df, x)
gen chi2_den = chi2den(df, x)
gen inv_chi2 = invchi2(df, p)
gen f_prob = F(df1, df2, x)
gen binomial_prob = binomial(n, k, p)
gen poisson_prob = poisson(mean, k)

// Date and Time Functions
gen today_date = date("2024-01-15", "YMD")
gen year_val = year(date_var)
gen month_val = month(date_var)
gen day_val = day(date_var)
gen dow_val = dow(date_var)
gen doy_val = doy(date_var)
gen quarter_val = quarter(date_var)
gen week_val = week(date_var)
gen clock_val = clock("12:30:45", "hms")
gen hours_val = hh(clock_var)
gen minutes_val = mm(clock_var)
gen seconds_val = ss(clock_var)

// Random Number Functions
gen random_uniform = runiform()
gen random_normal = rnormal()
gen random_normal2 = rnormal(10, 2)
gen random_int = runiformint(1, 100)
gen random_binomial = rbinomial(10, 0.5)
gen random_poisson = rpoisson(5)


// Double side commands

bootstrap, reps(100): regress y x
by group: regress y x

// =================================================================
// SECTION 3: MACROS (Local & Global)
// =================================================================

// Local Macro Definition
local myvar "weight displacement"
local count = 5
local ++count
local --count

// Local Macro Usage
display "`myvar'" 
regress mpg `myvar'
local result = `count' * 2

// Global Macro Definition
global xvars "weight length displacement"
global depvar "mpg"
global datapath "C:/data/project"

// Global Macro Usage
regress $depvar $xvars
regress ${depvar} ${xvars}
display "$depvar and $xvars"
display "$depvar and ${xvars}"
use "$datapath/mydata.dta", clear

// Extended Macro Functions
local nvar: word count `myvar'
local first: word 1 of `myvar'
local sorted: list sort myvar
local unique: list uniq duplicates
local combined: list myvar | othervar
local intersection: list myvar & othervar
local vartype: type myvar
local varlabel: variable label myvar

// Tempvar, Tempname, Tempfile
tempvar temp1 temp2
tempname matrix1 scalar1
tempfile tmpdata

// =================================================================
// SECTION 4: STRINGS
// =================================================================

// Regular Strings (double quotes)
local title "My Analysis Title"
display "Results for year 2024"
label variable mpg "Miles per Gallon"

// Compound Strings (backtick-quote pairs)
local text `"This is a "compound" string"'
display `"Line with `myvar' interpolation"'
local nested `"Outer `"inner"' string"'

// String with Macros
local message "Variable `myvar' has value $global1"

// =================================================================
// SECTION 5: OPERATORS
// =================================================================

// Arithmetic Operators
gen result = x + y - z * w / u ^ 2
gen negation = -x
local new_val = 5 + 3

// Logical Operators
gen logic1 = (x > 10) & (y < 5)
gen logic2 = (a == 1) | (b == 2)
gen not_val = !condition

// Comparison Operators
gen equal = (x == y)
gen not_equal = (x != y)
gen less = (x < y)
gen greater = (x > y)
gen less_eq = (x <= y)
gen greater_eq = (x >= y)

// Assignment Operators
local x = 5
global y = 10
gen z = x + y
replace z = 0 if missing(z)

// =================================================================
// SECTION 6: COMMENTS
// =================================================================

// Double-slash line comment
* Star comment (must be at line start)

/* Block comment
   spanning multiple
   lines */

gen x = 1  // Inline comment after code

/// Triple-slash comment (line continuation)
regress mpg weight ///
  displacement ///
  length

// =================================================================
// SECTION 7: FACTOR VARIABLES
// =================================================================

// Basic factor variable notation
regress y i.group
regress y c.continuous
regress y o.outcome

// Interactions
regress y i.group#c.x
regress y i.group##c.x
regress y i.year##i.region

// Base category specification
regress y ib2.group
regress y ib(first).year
regress y ib(last).year
regress y ib(freq).category

// Specific levels
regress y i(2012).year
regress y i(1/5).category

// =================================================================
// SECTION 8: LOOPS AND CONDITIONALS
// =================================================================

// Foreach Loops
foreach var of varlist x y z {
  summarize `var'
}

foreach val in 1 2 3 4 5 {
  display `val'
}

foreach word of local myvar {
  display "`word'"
}

// Forvalues Loops
forvalues i = 1/10 {
  display "Iteration `i'"
}

forvalues j = 0(5)100 {
  display `j'
}

// While Loops
local i = 0
while `i' < 5 {
  display `i'
  local ++i
}

// If-Else Conditionals
if x > 0 {
  display "Positive"
}
else if x == 0 {
  display "Zero"
}
else {
  display "Negative"
}

// =================================================================
// SECTION 9: REGULAR EXPRESSIONS
// =================================================================

// ASCII Regular Expressions
if regexm(varname, "^[0-9]+$") {
  display "All digits"
}

gen cleaned = regexr(text, "[^a-zA-Z]", "")
gen match = regexm(str, "pattern.*end")
local captured = regexs(1)

// Unicode Regular Expressions
if ustrregexm(name, "[A-Z][a-z]+") {
  display "Has capitalized words"
}

gen result = ustrregexrf(str, "\d+", "X")
gen all_replaced = ustrregexra(str, "\s+", " ")

// =================================================================
// SECTION 10: SUBSCRIPTS AND MATRIX OPERATIONS
// =================================================================

// Matrix Subscripts
matrix A = (1, 2 \ 3, 4)
scalar element = A[1,1]
matrix row1 = A[1, 1..2]
matrix col1 = A[1..2, 1]
matrix submat = A[1..2, 1..2]

// Variable Subscripts
gen lagged = x[_n-1]
gen lead = x[_n+1]
gen first = x[1]
gen last = x[_N]

// Matrix Functions
matrix B = J(3, 3, 0)
matrix I = I(4)
matrix inv_A = inv(A)
matrix t_A = A'
scalar det_A = det(A)
scalar trace_A = trace(A)

// =================================================================
// SECTION 11: DATA MANAGEMENT
// =================================================================

// File Operations
use "mydata.dta", clear
save "output.dta", replace
saveold "oldformat.dta", replace

// Variable Operations
gen newvar = oldvar * 2
replace newvar = . if newvar < 0
egen mean_x = mean(x), by(group)

// Data Subsetting
keep if year >= 2020
drop if _merge == 2
keep var1 var2 var3
drop temp*

// Sorting and Ordering
sort country year
gsort -year country
order id name, first

// Merging
merge 1:1 id using "other.dta"
merge m:1 country year using "country_data.dta"

// Reshaping
reshape wide value, i(id) j(year)
reshape long income, i(id) j(year)

// =================================================================
// SECTION 12: COMMAND PREFIXES
// =================================================================

// By Prefix
by group: summarize x
bysort country year: gen obs = _n

// Quietly and Noisily
quietly regress y x
noisily display "This shows"

// Capture
capture drop tempvar
capture confirm file "test.dta"

// Version
version 17

// Bootstrap and Jackknife
bootstrap coef=_b[x], reps(100): regress y x
jackknife: regress y x

// =================================================================
// SECTION 13: PROGRAMS
// =================================================================

// Program Definition
program define myprogram
  syntax varlist [if] [in], [Option1(string) Option2(real 0)]
  display "Running myprogram"
  regress `varlist'
end

// Program with Arguments
program myprogram2
  args var1 var2 var3
  display "`var1' `var2' `var3'"
end

program drop myprogram

// =================================================================
// SECTION 14: SCALARS AND CONSTANTS
// =================================================================

// Scalar Definition
scalar pi_val = _pi
scalar n_obs = _N
scalar my_const = 2.71828

// Built-in Constants
display _pi
display _N
display _n
display _rc

// Missing Values
gen has_missing = missing(x)
replace x = . if x < 0
replace x = .a if condition1
replace x = .z if condition2

// =================================================================
// END OF COMPREHENSIVE TEST FILE
// =================================================================

// This file is automatically generated by: npm run build
// Edit to add more test cases for specific syntax elements.
// Report highlighting issues at: github.com/randrescastaneda/stataGlow
