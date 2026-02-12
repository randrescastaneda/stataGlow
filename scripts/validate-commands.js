#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const schemaPath = path.join(__dirname, '..', 'commands', 'schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

function validateYAML(filePath, name) {
  console.log(`\n📋 Validating ${name}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    if (!data.metadata) {
      console.error('❌ Missing metadata');
      return false;
    }
    
    if (!data.categories) {
      console.error('❌ Missing categories');
      return false;
    }
    
    let totalCommands = 0;
    let validCommands = 0;
    
    for (const [catKey, catData] of Object.entries(data.categories)) {
      if (!catData.commands || !Array.isArray(catData.commands)) {
        console.warn(`⚠️  Category "${catKey}" has no commands array`);
        continue;
      }
      
      catData.commands.forEach(cmd => {
        totalCommands++;
        if (!cmd.name || typeof cmd.name !== 'string') {
          console.error(`❌ Invalid command in ${catKey}: missing or invalid name`);
        } else {
          validCommands++;
        }
      });
    }
    
    console.log(`✓ Metadata valid`);
    console.log(`✓ ${validCommands}/${totalCommands} commands valid`);
    
    if (validCommands !== totalCommands) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

function checkDuplicates() {
  console.log('\n🔍 Checking for duplicate commands...');
  
  const allCommands = {};
  const files = [
    'official_stata_commands.yaml',
    'ssc_contributed_commands.yaml',
    'github_contributed_commands.yaml'
  ];
  
  files.forEach(file => {
    const filePath = path.join(COMMANDS_DIR, file);
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    if (!data.categories) return;
    
    Object.values(data.categories).forEach(cat => {
      if (!cat.commands) return;
      cat.commands.forEach(cmd => {
        if (cmd.name) {
          if (allCommands[cmd.name]) {
            console.warn(`⚠️  Duplicate: "${cmd.name}" in ${file}`);
          }
          allCommands[cmd.name] = file;
        }
      });
    });
  });
  
  console.log(`✓ Total unique commands: ${Object.keys(allCommands).length}`);
}

function main() {
  console.log('🔧 StataGlow Command Registry Validator\n');
  console.log('=' . repeat(50));
  
  let allValid = true;
  
  allValid &= validateYAML(path.join(COMMANDS_DIR, 'official_stata_commands.yaml'), 'Official Commands');
  allValid &= validateYAML(path.join(COMMANDS_DIR, 'ssc_contributed_commands.yaml'), 'SSC Commands');
  allValid &= validateYAML(path.join(COMMANDS_DIR, 'github_contributed_commands.yaml'), 'GitHub Commands');
  
  checkDuplicates();
  
  console.log('\n' + '=' . repeat(50));
  if (allValid) {
    console.log('✅ All validations passed!');
    process.exit(0);
  } else {
    console.log('❌ Validation failed!');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateYAML,
  checkDuplicates
};
