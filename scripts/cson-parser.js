#!/usr/bin/env node

/**
 * CSON Parser for StataGlow
 * 
 * Extracts TextMate grammar patterns from stata.cson (Atom format)
 * and converts them to JSON for VS Code compatibility.
 * 
 * This is a targeted parser optimized for the specific structure
 * of the language-stata grammar file.
 */

const fs = require('fs');

/**
 * Parse a CSON file and extract the repository section
 * @param {string} filePath - Path to the CSON file
 * @returns {object} - Parsed grammar object with repository patterns
 */
function parseCSONFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parseCSON(content);
}

/**
 * Parse CSON content string
 * @param {string} csonText - Raw CSON text content
 * @returns {object} - Parsed grammar object
 */
function parseCSON(csonText) {
  // Remove CSON comments (lines starting with #)
  const lines = csonText.split('\n');
  const cleanedLines = lines.filter(line => !line.trim().startsWith('#'));
  const cleanedText = cleanedLines.join('\n');
  
  // Extract top-level properties
  const grammar = {
    scopeName: extractStringProperty(cleanedText, 'scopeName'),
    name: extractStringProperty(cleanedText, 'name'),
    fileTypes: extractArrayProperty(cleanedText, 'fileTypes'),
    foldingStartMarker: extractStringProperty(cleanedText, 'foldingStartMarker'),
    foldingStopMarker: extractStringProperty(cleanedText, 'foldingStopMarker'),
    patterns: [],
    repository: {}
  };
  
  // Extract main patterns array
  grammar.patterns = extractMainPatterns(cleanedText);
  
  // Extract repository section
  grammar.repository = extractRepository(cleanedText);
  
  return grammar;
}

/**
 * Extract a simple string property from CSON
 * @param {string} text - CSON text
 * @param {string} propName - Property name to extract
 * @returns {string|null} - Extracted value or null
 */
function extractStringProperty(text, propName) {
  const regex = new RegExp(`^${propName}:\\s*['"]([^'"]+)['"]`, 'm');
  const match = text.match(regex);
  return match ? match[1] : null;
}

/**
 * Extract an array property from CSON
 * @param {string} text - CSON text
 * @param {string} propName - Property name to extract
 * @returns {string[]} - Extracted array values
 */
function extractArrayProperty(text, propName) {
  const regex = new RegExp(`${propName}:\\s*\\[([^\\]]+)\\]`, 's');
  const match = text.match(regex);
  if (!match) return [];
  
  // Extract quoted strings from the array
  const items = match[1].match(/['"]([^'"]+)['"]/g) || [];
  return items.map(item => item.replace(/['"]/g, ''));
}

/**
 * Extract the main patterns array from CSON
 * @param {string} text - CSON text
 * @returns {object[]} - Array of pattern objects
 */
function extractMainPatterns(text) {
  // Find the patterns: section (before repository:)
  const patternsStart = text.indexOf('\npatterns:');
  const repositoryStart = text.indexOf("\n'repository':");
  
  if (patternsStart === -1) return [];
  
  const endPos = repositoryStart !== -1 ? repositoryStart : text.length;
  const patternsSection = text.substring(patternsStart, endPos);
  
  return extractPatternArray(patternsSection);
}

/**
 * Extract the repository section with all named patterns
 * @param {string} text - CSON text
 * @returns {object} - Repository object with pattern groups
 */
function extractRepository(text) {
  const repositoryStart = text.indexOf("'repository':");
  if (repositoryStart === -1) return {};
  
  const repoText = text.substring(repositoryStart);
  const repository = {};
  
  // Find all pattern group names (e.g., 'functions':, 'comments':, etc.)
  const patternGroupRegex = /^\s{2}'([a-z-]+)':\s*$/gm;
  let match;
  const groupPositions = [];
  
  while ((match = patternGroupRegex.exec(repoText)) !== null) {
    groupPositions.push({
      name: match[1],
      start: match.index + match[0].length
    });
  }
  
  // Extract each pattern group
  for (let i = 0; i < groupPositions.length; i++) {
    const group = groupPositions[i];
    const nextStart = i + 1 < groupPositions.length 
      ? groupPositions[i + 1].start - (groupPositions[i + 1].name.length + 6)
      : repoText.length;
    
    const groupContent = repoText.substring(group.start, nextStart);
    
    try {
      const patterns = extractPatternArray(groupContent);
      if (patterns.length > 0) {
        repository[group.name] = { patterns };
      }
    } catch (e) {
      console.warn(`Warning: Could not parse pattern group '${group.name}': ${e.message}`);
    }
  }
  
  return repository;
}

/**
 * Extract an array of pattern objects from CSON block
 * @param {string} text - CSON block containing patterns
 * @returns {object[]} - Array of pattern objects
 */
function extractPatternArray(text) {
  const patterns = [];
  
  // Find all include patterns
  const includeRegex = /\{include:\s*['"]([^'"]+)['"]\}/g;
  let match;
  while ((match = includeRegex.exec(text)) !== null) {
    patterns.push({ include: match[1] });
  }
  
  // Find simple match patterns
  const simpleMatchRegex = /\{\s*(?:comment:\s*['"][^'"]*['"]\s*)?(?:name:\s*['"]([^'"]+)['"]\s*)?match:\s*['"]([^'"]+)['"]\s*(?:name:\s*['"]([^'"]+)['"]\s*)?\}/g;
  while ((match = simpleMatchRegex.exec(text)) !== null) {
    const pattern = {};
    const name = match[1] || match[3];
    if (name) pattern.name = name;
    if (match[2]) pattern.match = match[2];
    if (pattern.match) patterns.push(pattern);
  }
  
  // Find begin/end patterns
  const beginEndRegex = /\{\s*(?:comment:\s*['"][^'"]*['"]\s*)?(?:name:\s*['"]([^'"]+)['"]\s*)?begin:\s*['"]([^'"]+)['"]\s*(?:beginCaptures:[^}]+)?\s*end:\s*['"]([^'"]+)['"]/g;
  while ((match = beginEndRegex.exec(text)) !== null) {
    const pattern = {
      begin: match[2],
      end: match[3]
    };
    if (match[1]) pattern.name = match[1];
    patterns.push(pattern);
  }
  
  return patterns;
}

/**
 * Convert parsed CSON grammar to JSON-compatible structure
 * @param {object} grammar - Parsed grammar object
 * @returns {object} - JSON-compatible grammar
 */
function toJSON(grammar) {
  return JSON.parse(JSON.stringify(grammar));
}

/**
 * Get list of all repository pattern names
 * @param {object} grammar - Parsed grammar object
 * @returns {string[]} - Array of pattern names
 */
function getRepositoryPatternNames(grammar) {
  return Object.keys(grammar.repository || {});
}

/**
 * Extract a specific pattern group from the repository
 * @param {object} grammar - Parsed grammar object
 * @param {string} patternName - Name of the pattern group
 * @returns {object|null} - Pattern group or null
 */
function getPatternGroup(grammar, patternName) {
  return grammar.repository ? grammar.repository[patternName] : null;
}

module.exports = {
  parseCSON,
  parseCSONFile,
  extractRepository,
  extractMainPatterns,
  toJSON,
  getRepositoryPatternNames,
  getPatternGroup
};

// CLI support for testing
if (require.main === module) {
  const path = require('path');
  const csonPath = process.argv[2] || path.join(__dirname, '..', 'stata.cson');
  
  console.log(`Parsing: ${csonPath}\n`);
  
  try {
    const grammar = parseCSONFile(csonPath);
    
    console.log('Top-level properties:');
    console.log(`  scopeName: ${grammar.scopeName}`);
    console.log(`  name: ${grammar.name}`);
    console.log(`  fileTypes: ${grammar.fileTypes.join(', ')}`);
    console.log(`  foldingStartMarker: ${grammar.foldingStartMarker}`);
    console.log(`  foldingStopMarker: ${grammar.foldingStopMarker}`);
    console.log('');
    
    console.log(`Main patterns: ${grammar.patterns.length}`);
    console.log('');
    
    const repoNames = getRepositoryPatternNames(grammar);
    console.log(`Repository patterns (${repoNames.length}):`);
    repoNames.forEach(name => {
      const group = grammar.repository[name];
      const count = group.patterns ? group.patterns.length : 0;
      console.log(`  ${name}: ${count} patterns`);
    });
    
    console.log('\n✅ CSON parsing successful');
  } catch (error) {
    console.error('Error parsing CSON:', error.message);
    process.exit(1);
  }
}
