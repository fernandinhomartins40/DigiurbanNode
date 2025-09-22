#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Função para copiar arquivos recursivamente
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }

  fs.readdirSync(from).forEach(element => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      const fromPath = path.join(from, element);
      const toPath = path.join(to, element);

      // Se for arquivo .ts, renomear para .js
      if (element.endsWith('.ts')) {
        const newName = element.replace('.ts', '.js');
        const newToPath = path.join(to, newName);
        fs.copyFileSync(fromPath, newToPath);
        console.log(`Copiado: ${fromPath} -> ${newToPath}`);
      } else {
        fs.copyFileSync(fromPath, toPath);
        console.log(`Copiado: ${fromPath} -> ${toPath}`);
      }
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

console.log('🔨 Iniciando build personalizado...');

// Limpar diretório dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('🧹 Diretório dist limpo');
}

// Copiar arquivos de src para dist, convertendo .ts para .js
const srcPath = path.join(__dirname, 'src');
copyFolderSync(srcPath, distPath);

console.log('✅ Build concluído com sucesso!');
console.log(`📁 Arquivos disponíveis em: ${distPath}`);