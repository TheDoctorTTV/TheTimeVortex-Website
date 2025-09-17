#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function main() {
  const commitHash = getCommitHash();
  const pagesDir = path.join(__dirname, 'pages');

  const hasPagesDir = await directoryExists(pagesDir);
  if (!hasPagesDir) {
    console.warn(`Directory not found: ${pagesDir}`);
    return;
  }

  const htmlFiles = await collectHtmlFiles(pagesDir);
  await Promise.all(htmlFiles.map((file) => updateFileVersion(file, commitHash)));
}

async function directoryExists(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

function getCommitHash() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    if (!hash) {
      throw new Error('Commit hash is empty');
    }
    return hash;
  } catch (error) {
    console.error('Failed to retrieve commit hash:', error.message);
    process.exitCode = 1;
    throw error;
  }
}

async function collectHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function updateFileVersion(filePath, commitHash) {
  const originalContent = await fs.readFile(filePath, 'utf8');
  const updatedContent = applyVersionQuery(originalContent, commitHash);

  if (updatedContent !== originalContent) {
    await fs.writeFile(filePath, updatedContent, 'utf8');
  }
}

function applyVersionQuery(content, commitHash) {
  const assetRegex = /(["'])(\/assets\/(?:styles|scripts)\/[^"']+?\.(?:css|js))(\?[^"']*)?\1/g;

  return content.replace(assetRegex, (match, quote, assetPath, existingQuery = '') => {
    const params = existingQuery ? existingQuery.slice(1).split('&').filter(Boolean) : [];
    const filteredParams = params.filter((param) => !param.startsWith('v='));
    filteredParams.push(`v=${commitHash}`);

    const newQuery = `?${filteredParams.join('&')}`;
    return `${quote}${assetPath}${newQuery}${quote}`;
  });
}

main().catch((error) => {
  if (!process.exitCode) {
    console.error(error);
    process.exit(1);
  }
});
