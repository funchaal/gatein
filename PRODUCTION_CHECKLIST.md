# 🚀 Checklist de Produção - App Mobile (GateIn)

Este documento serve como guia definitivo para o processo de build, assinatura e lançamento do aplicativo mobile nas lojas (Google Play Store e Apple App Store).

---

### 1. ⚙️ Variáveis de Ambiente & Configuração
- [ ] **Ambiente `.env`**: Alterar `ENVIRONMENT=development` para `ENVIRONMENT=production` no arquivo `.env`.
- [ ] **URLs da API**: Confirmar se `API_BASE_URL_PROD` está apontando para o servidor HTTPS de produção (`https://api.gatein.com.br/api/mobile`).
- [ ] **Reset de Cache do Metro**: Após alterar o `.env`, executar sempre:
  ```bash
  npx react-native start --reset-cache
  ```

---

### 2. 🔐 Segurança & Armazenamento Seguro
- [ ] **Keychain Service Name**: Verificado que o `secureStorage.js` utiliza `com.gatein.auth`.
- [ ] **Logs Sensíveis**: Confirmado que `console.log({ token })` e `console.log({ deviceId })` em `api.js` estão desativados em ambiente de produção (`ENVIRONMENT === 'production'`).
- [ ] **Firebase / FCM**: Verificar se o arquivo `google-services.json` (Android) e `GoogleService-Info.plist` (iOS) de produção estão incluídos e atualizados nas pastas nativas.

---

### 3. 🤖 Android Release (APK / App Bundle - AAB)
- [ ] **Keystore de Release**: Gerar a chave de assinatura de produção (`release.keystore`) e colocar em `android/app/release.keystore`.
- [ ] **Gradle Build Configuration**: Atualizar o arquivo `android/app/build.gradle`:
  ```groovy
  signingConfigs {
      release {
          if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
              storeFile file(MYAPP_RELEASE_STORE_FILE)
              storePassword MYAPP_RELEASE_STORE_PASSWORD
              keyAlias MYAPP_RELEASE_KEY_ALIAS
              keyPassword MYAPP_RELEASE_KEY_PASSWORD
          }
      }
  }
  buildTypes {
      release {
          signingConfig signingConfigs.release
          minifyEnabled true // Proguard / R8 ativado
          proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
      }
  }
  ```
- [ ] **Version Code & Name**: Incrementar `versionCode` (ex: `1`) e `versionName` (ex: `"1.0.0"`) no `build.gradle`.
- [ ] **Comando de Build (Android)**:
  ```bash
  cd android
  ./gradlew bundleRelease
  ```
  O arquivo AAB gerado estará em: `android/app/build/outputs/bundle/release/app-release.aab`.

---

### 4. 🍏 iOS Release (IPA / App Store Connect)
- [ ] **Bundle Identifier**: Garantir que o Bundle ID seja `br.com.gatein.app` / `com.gatein.app` no Xcode.
- [ ] **Certificados & Provisioning Profiles**: Configurar os certificados de distribuição na Apple Developer Console e App Store Connect.
- [ ] **Version & Build Number**: Atualizar a versão e build number no Target do Xcode.
- [ ] **Permissões de Info.plist**: Verificar as descrições de uso (`NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, etc.) com textos claros explicando o motivo do uso aos avaliadores da App Store.

---

### 5. 🧪 Testes Finais Pré-Lançamento (Sanity Check)
- [ ] **Check-in por QR Code / Terminal**: Testar a leitura de QR Code e comunicação com a API.
- [ ] **Notificações Push (FCM)**: Testar o recebimento de pushes em background e foreground.
- [ ] **Sessão Offline / Reconexão**: Garantir que o app lida corretamente sem conexão à internet.
- [ ] **Logout & Troca de Conta**: Testar se o token é limpo do Keychain ao deslogar.
