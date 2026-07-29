# GuFix para Android e iOS

O site, o aplicativo Android e o aplicativo iOS usam o mesmo frontend React e a API `https://app.gufix.com.br`.

## Atualizar os dois projetos

```powershell
npm install
npm run native:sync
```

## Android / Google Play

1. Instale Android Studio e JDK 21.
2. Configure `android/keystore.properties` usando o arquivo de exemplo.
3. Execute `npm run android:bundle`.
4. Envie o `.aab` gerado em `android/app/build/outputs/bundle/release/` para o Google Play Console.

## iOS / App Store

A compilação e a assinatura iOS exigem um Mac com Xcode e uma conta Apple Developer.

1. No Mac, clone este repositório.
2. Execute `npm install`.
3. Execute `npm run ios:sync`.
4. Execute `npm run ios:open`.
5. No Xcode, selecione o time Apple Developer em **Signing & Capabilities**.
6. Confirme o Bundle Identifier `br.com.gufix.app`.
7. Use **Product > Archive**.
8. No Organizer, escolha **Distribute App > App Store Connect**.

## Versões de loja

- Android: ajuste `versionCode` e `versionName` em `android/app/build.gradle`.
- iOS: ajuste `Version` e `Build` no target **App**, dentro do Xcode.

Antes de cada publicação, execute `npm run native:sync` para copiar a versão web mais recente para Android e iOS.
