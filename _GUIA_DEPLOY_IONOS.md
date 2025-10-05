# 🚀 GUIA DE DEPLOY PARA IONOS

## ✅ STATUS ATUAL
- Build de produção: ✅ Concluído
- Pasta `dist` criada: ✅ Pronta
- Próximo passo: Upload para IONOS

---

## 📤 MÉTODO 1: FTP COM FILEZILLA (RECOMENDADO)

### 1. Download FileZilla
```
https://filezilla-project.org/download.php
```

### 2. Conectar ao IONOS

**Credenciais:**
- **Host:** `ftp.seudominio.com` ou IP do IONOS
- **Usuário:** Seu usuário FTP (verifique no painel IONOS)
- **Senha:** Sua senha FTP
- **Porta:** 21 (FTP) ou 22 (SFTP)

**Onde encontrar credenciais:**
1. Login no painel IONOS
2. Vá em "Hosting" ou "Websites & Lojas"
3. Procure "Acesso FTP" ou "Credenciais"

### 3. Upload dos Arquivos

**IMPORTANTE:** Você precisa fazer upload do **CONTEÚDO** da pasta `dist`, não a pasta inteira!

```
❌ ERRADO:
public_html/
  └── dist/
      └── index.html
      └── assets/

✅ CORRETO:
public_html/
  └── index.html
  └── assets/
```

**Passos:**
1. No FileZilla, painel direito (servidor): navegue até `public_html/` ou `htdocs/`
2. No painel esquerdo (local): navegue até `C:\Users\vboxuser\Downloads\inventory-control\dist`
3. **Selecione TODOS os arquivos DENTRO de `dist`**
4. Arraste para o servidor
5. Aguarde o upload completar

### 4. Limpar Cache

Após upload, limpe o cache:
- No navegador: Ctrl + Shift + R (Windows/Linux) ou Cmd + Shift + R (Mac)
- Ou abra em aba anônima

---

## 📤 MÉTODO 2: WINSCP (Windows)

### 1. Download WinSCP
```
https://winscp.net/eng/download.php
```

### 2. Configurar Conexão

**Novo Site:**
- Protocolo: SFTP ou FTP
- Host: `ftp.seudominio.com`
- Porta: 22 (SFTP) ou 21 (FTP)
- Usuário: seu_usuario
- Senha: sua_senha

### 3. Upload

1. Conecte
2. Navegue até pasta pública no servidor
3. Arraste arquivos de `dist` para o servidor
4. Sobrescreva os existentes

---

## 📤 MÉTODO 3: VIA SSH (Se tiver acesso)

### 1. Conectar via SSH
```bash
ssh seu_usuario@seudominio.com
# ou
ssh seu_usuario@IP_DO_SERVIDOR
```

### 2. Instalar Git (se ainda não tiver)
```bash
git --version
# Se não tiver:
# apt install git (Ubuntu/Debian)
# yum install git (CentOS)
```

### 3. Clonar/Atualizar Repositório
```bash
cd /caminho/da/pasta/publica
# Primeira vez:
git clone https://github.com/seu-usuario/seu-repo.git .

# Atualizações:
git pull origin main
```

### 4. Instalar Node.js (se não tiver)
```bash
node --version
# Se não tiver:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 5. Fazer Build no Servidor
```bash
npm install
npm run build
```

### 6. Copiar dist para pasta pública
```bash
cp -r dist/* /var/www/html/
# ou onde estiver sua pasta pública
```

---

## 🔧 MÉTODO 4: USAR GITHUB ACTIONS (Automático)

### 1. Criar arquivo `.github/workflows/deploy.yml`

```yaml
name: Deploy to IONOS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.3.3
        with:
          server: ftp.seudominio.com
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /public_html/
```

### 2. Adicionar Secrets no GitHub

1. Vá em: `Settings` → `Secrets and variables` → `Actions`
2. Adicione:
   - `FTP_USERNAME`: seu usuário FTP
   - `FTP_PASSWORD`: sua senha FTP

### 3. Commit e Push

```bash
git add .github/workflows/deploy.yml
git commit -m "Add auto deploy to IONOS"
git push
```

Agora toda vez que você fizer push, o deploy será automático!

---

## 📋 CHECKLIST DE DEPLOY

### Antes do Upload
- [x] Build executado (`npm run build`)
- [x] Pasta `dist` criada
- [ ] Credenciais FTP em mãos
- [ ] FileZilla ou WinSCP instalado

### Durante o Upload
- [ ] Conectado ao servidor
- [ ] Navegado até pasta pública
- [ ] Upload do CONTEÚDO de `dist` (não a pasta)
- [ ] Todos os arquivos transferidos

### Após o Upload
- [ ] Cache do navegador limpo (Ctrl+Shift+R)
- [ ] Site testado no domínio
- [ ] Todas as páginas funcionando
- [ ] Análise ABC visível

---

## 🐛 TROUBLESHOOTING

### Problema: "404 Not Found" após deploy
**Solução:**
1. Verifique se o arquivo `.htaccess` está correto
2. Crie/atualize `.htaccess` na raiz:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Problema: "Blank page" (página branca)
**Solução:**
1. Abra DevTools (F12)
2. Veja erros no Console
3. Verifique se os caminhos dos assets estão corretos
4. Pode precisar configurar `base` no `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/', // ou '/subpasta/' se estiver em subpasta
  // ...
})
```

### Problema: Mudanças não aparecem
**Solução:**
1. Limpe cache: Ctrl + Shift + R
2. Abra em aba anônima
3. Verifique se o upload foi completo
4. Verifique data/hora dos arquivos no servidor

### Problema: Erros 500
**Solução:**
1. Verifique logs de erro no painel IONOS
2. Verifique permissões dos arquivos (644 para arquivos, 755 para pastas)
3. Verifique `.htaccess` se tiver sintaxe errada

---

## 📊 ARQUIVOS A SEREM ENVIADOS

Do diretório `dist`, envie:

```
✅ index.html (3.32 KB)
✅ assets/
   ├── index-FghqetIv.css (85.37 KB)
   ├── purify.es-BFmuJLeH.js (21.93 KB)
   ├── qr-scanner-worker.min-D85Z9gVD.js (43.95 KB)
   ├── index.es-CG2uCY0E.js (149.98 KB)
   ├── html2canvas.esm-CBrSDip1.js (201.42 KB)
   └── index-CgkazRZm.js (1.77 MB)

Total: ~2.3 MB
```

---

## 🎯 RESUMO RÁPIDO

### Opção Mais Simples (FTP):

1. **Baixe FileZilla:** https://filezilla-project.org/
2. **Conecte:**
   - Host: `ftp.seudominio.com`
   - Usuário/Senha: do painel IONOS
3. **Upload:**
   - Vá em `public_html/`
   - Arraste conteúdo de `dist/` para lá
4. **Teste:**
   - Abra seu domínio
   - Ctrl + Shift + R para limpar cache

---

## 📞 SUPORTE IONOS

Se tiver dúvidas sobre credenciais:
- Login: https://login.ionos.com/
- Suporte: https://www.ionos.com/help/
- Telefone: Verifique no painel

---

**Status:** ✅ Build pronto, aguardando upload  
**Próximo passo:** Conectar via FTP e fazer upload  
**Tempo estimado:** 5-10 minutos  

🚀 **Boa sorte com o deploy!**

