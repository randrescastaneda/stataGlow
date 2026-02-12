#!/usr/bin/env node

/**
 * Basic test suite for StataGlow
 */

const fs = require('fs');
const path = require('path');

function testGrammarExists() {
  console.log('Testing: Grammar file exists...');
  const grammarPath = path.join(__dirname, '..', 'grammars', 'stata.json');
  
  if (!fs.existsSync(grammarPath)) {
    console.error('❌ Grammar file not found. Run: npm run build');
    return false;
  }
  
  try {
    const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
    if (!grammar.scopeName || grammar.scopeName !== 'source.stata') {
      console.error('❌ Invalid grammar structure');
      return false;
    }
    console.log('✓ Grammar file valid');
    return true;
  } catch (error) {
    console.error('❌ Grammar JSON parse error:', error.message);
    return false;
  }
}

function testPackageJSON() {
  console.log('Testing: package.json configuration...');
  
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  const checks = [
    { name: 'name field', check: () => pkg.name === 'stataGlow' },
    { name: 'main entry', check: () => pkg.main === './extension.js' },
    { name: 'contributes.languages', check: () => pkg.contributes?.languages?.length > 0 },
    { name: 'contributes.grammars', check: () => pkg.contributes?.grammars?.length > 0 },
    { name: 'contributes.themes', check: () => pkg.contributes?.themes?.length > 0 },
    { name: 'contributes.configuration', check: () => pkg.contributes?.configuration?.properties }
  ];
  
  let passed = 0;
  checks.forEach(({ name, check }) => {
    if (check()) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.error(`❌ ${name}`);
    }
  });
  
  return passed === checks.length;
}

function testThemes() {
  console.log('Testing: Theme files...');
  
  const themes = ['stata-glow-official.json', 'stata-glow-modern.json'];
  let allValid = true;
  
  themes.forEach(theme => {
    const themePath = path.join(__dirname, '..', 'themes', theme);
    if (!fs.existsSync(themePath)) {
      console.error(`❌ Theme not found: ${theme}`);
      allValid = false;
      return;
    }
    
    try {
      const themeContent = JSON.parse(fs.readFileSync(themePath, 'utf8'));
      if (!themeContent.name || !themeContent.tokenColors) {
        console.error(`❌ Invalid theme structure: ${theme}`);
        allValid = false;
      } else {
        console.log(`✓ ${theme}`);
      }
    } catch (error) {
      console.error(`❌ Theme parse error: ${theme}`, error.message);
      allValid = false;
    }
  });
  
  return allValid;
}

function main() {
  console.log('🧪 StataGlow Test Suite\n');
  console.log('=' . repeat(50));
  
  let results = [];
  
  results.push(testGrammarExists());
  console.log();
  
  results.push(testPackageJSON());
  console.log();
  
  results.push(testThemes());
  
  console.log('\n' + '=' . repeat(50));
  const passed = results.filter(r => r).length;
  console.log(`\n${passed}/${results.length} tests passed\n`);
  
  process.exit(results.every(r => r) ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  testGrammarExists,
  testPackageJSON,
  testThemes
};
