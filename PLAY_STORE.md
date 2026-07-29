# Publicação do GuFix na Google Play

O projeto Android nativo está na pasta `android/` e usa o identificador `br.com.gufix.app`.

## Pré-requisitos

1. Instale Android Studio com Android SDK 36.
2. Instale o JDK indicado pelo Android Studio (JDK 21 recomendado).
3. No Android Studio, abra a pasta `android/` e aguarde o Gradle sincronizar.

## Atualizar o aplicativo Android

Sempre que alterar o React, execute:

```powershell
npm run android:sync
```

## Criar a chave de upload

Execute uma única vez e guarde o arquivo e as senhas em local seguro:

```powershell
keytool -genkeypair -v -keystore android\gufix-upload.jks -alias gufix -keyalg RSA -keysize 2048 -validity 10000
```

Duplique `android/keystore.properties.example` com o nome `android/keystore.properties` e preencha as senhas. Esses arquivos estão ignorados pelo Git.

## Gerar o Android App Bundle

```powershell
npm run android:bundle
```

Arquivo gerado:

```text
Mobile/android/app/build/outputs/bundle/release/app-release.aab
```

Esse é o arquivo que deve ser enviado para o Google Play Console.

## Antes de publicar

- Corrija e valide `https://app.gufix.com.br`, pois o aplicativo Android usa esse endereço para acessar a API MySQL.
- Prepare ícone de loja 512x512, banner 1024x500, capturas de tela e política de privacidade.
- Preencha Segurança dos dados e Classificação de conteúdo no Play Console.
- Aumente `versionCode` e `versionName` em `android/app/build.gradle` a cada nova versão.
