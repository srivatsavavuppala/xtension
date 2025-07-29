#!/usr/bin/env node

/**
 * Manifest Validation Script
 * Validates the Chrome extension manifest for common issues
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest.json');

function validateManifest() {
  console.log('🔍 Validating manifest.json...\n');

  // Check if manifest exists
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ manifest.json not found!');
    process.exit(1);
  }

  // Read and parse manifest
  let manifest;
  try {
    const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
    manifest = JSON.parse(manifestContent);
  } catch (error) {
    console.error('❌ Failed to parse manifest.json:', error.message);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // Required fields validation
  const requiredFields = ['manifest_version', 'name', 'version', 'description'];
  requiredFields.forEach(field => {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Manifest version validation
  if (manifest.manifest_version !== 3) {
    warnings.push('Consider using Manifest V3 for better compatibility');
  }

  // Version format validation
  if (manifest.version && !/^\d+\.\d+(\.\d+)?$/.test(manifest.version)) {
    errors.push('Version should follow semantic versioning (e.g., 1.0.0)');
  }

  // Description length validation
  if (manifest.description && manifest.description.length > 132) {
    warnings.push('Description is too long (max 132 characters for Chrome Web Store)');
  }

  // Icons validation
  if (manifest.icons) {
    const requiredSizes = ['16', '48', '128'];
    requiredSizes.forEach(size => {
      if (!manifest.icons[size]) {
        warnings.push(`Missing icon size: ${size}px`);
      } else {
        const iconPath = path.join(__dirname, '..', manifest.icons[size]);
        if (!fs.existsSync(iconPath)) {
          errors.push(`Icon file not found: ${manifest.icons[size]}`);
        }
      }
    });
  }

  // Content scripts validation
  if (manifest.content_scripts) {
    manifest.content_scripts.forEach((script, index) => {
      if (!script.matches || script.matches.length === 0) {
        errors.push(`Content script ${index} missing matches`);
      }
      if (!script.js || script.js.length === 0) {
        errors.push(`Content script ${index} missing js files`);
      } else {
        script.js.forEach(jsFile => {
          const jsPath = path.join(__dirname, '..', jsFile);
          if (!fs.existsSync(jsPath)) {
            errors.push(`Content script file not found: ${jsFile}`);
          }
        });
      }
    });
  }

  // Background script validation
  if (manifest.background) {
    if (manifest.manifest_version === 3 && manifest.background.service_worker) {
      const swPath = path.join(__dirname, '..', manifest.background.service_worker);
      if (!fs.existsSync(swPath)) {
        errors.push(`Service worker file not found: ${manifest.background.service_worker}`);
      }
    }
  }

  // Popup validation
  if (manifest.action && manifest.action.default_popup) {
    const popupPath = path.join(__dirname, '..', manifest.action.default_popup);
    if (!fs.existsSync(popupPath)) {
      errors.push(`Popup file not found: ${manifest.action.default_popup}`);
    }
  }

  // Permissions validation
  if (manifest.permissions) {
    const dangerousPermissions = ['tabs', 'history', 'bookmarks', 'cookies'];
    const usedDangerous = manifest.permissions.filter(p => dangerousPermissions.includes(p));
    if (usedDangerous.length > 0) {
      warnings.push(`Using potentially sensitive permissions: ${usedDangerous.join(', ')}`);
    }
  }

  // Host permissions validation
  if (manifest.host_permissions) {
    const broadPermissions = manifest.host_permissions.filter(p => 
      p.includes('*://*/*') || p.includes('http://*/*') || p.includes('https://*/*')
    );
    if (broadPermissions.length > 0) {
      warnings.push('Using broad host permissions - consider being more specific');
    }
  }

  // Report results
  console.log('📋 Validation Results:\n');

  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(error => console.log(`   • ${error}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   • ${warning}`));
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Manifest validation passed! No issues found.');
  } else if (errors.length === 0) {
    console.log(`✅ Manifest validation passed with ${warnings.length} warning(s).`);
  } else {
    console.log(`❌ Manifest validation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
    process.exit(1);
  }

  // Additional info
  console.log('\n📊 Manifest Summary:');
  console.log(`   Name: ${manifest.name}`);
  console.log(`   Version: ${manifest.version}`);
  console.log(`   Manifest Version: ${manifest.manifest_version}`);
  console.log(`   Permissions: ${manifest.permissions ? manifest.permissions.length : 0}`);
  console.log(`   Host Permissions: ${manifest.host_permissions ? manifest.host_permissions.length : 0}`);
  console.log(`   Content Scripts: ${manifest.content_scripts ? manifest.content_scripts.length : 0}`);
}

// Run validation
if (require.main === module) {
  validateManifest();
}

module.exports = { validateManifest };