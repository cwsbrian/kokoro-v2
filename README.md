# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## To Build

- npx eas-cli build --platform android --profile production

## Google Sign-In (EAS/내부 테스트 빌드)

EAS로 빌드한 앱에서 구글 로그인이 안 되면, **앱 서명 키(SHA-1/SHA-256)** 가 Firebase에 없어서일 수 있다.

1. **EAS에서 SHA-1/SHA-256 확인**
   ```bash
   npx eas-cli credentials --platform android
   ```
   → 프로필(production/preview) 선택 후 **Keystore** 항목에서 SHA-1, SHA-256 확인. (또는 [expo.dev](https://expo.dev) → 프로젝트 → Credentials → Android)

2. **Firebase에 등록**
   - [Firebase Console](https://console.firebase.google.com) → 프로젝트 → ⚙️ 프로젝트 설정
   - "내 앱" → Android 앱 (`com.cwsbrian.kokoro`) → **지문 추가** → 위에서 확인한 SHA-1, SHA-256 입력 후 저장

3. **Google Cloud Console에서 OAuth 클라이언트 확인**
   - [Google Cloud Console](https://console.cloud.google.com) → Firebase 프로젝트와 같은 프로젝트 선택
   - APIs 및 서비스 → **사용자 인증 정보** → **OAuth 2.0 클라이언트 ID**
   - **Android** 타입 클라이언트가 있어야 함: 패키지 이름 `com.cwsbrian.kokoro`, SHA-1이 EAS keystore와 **완전히 동일**해야 함
   - 없거나 SHA가 다르면 Firebase에서 지문 추가 후 저장하면 동기화됨. 또는 여기서 직접 Android 클라이언트 생성 (패키지명 + SHA-1)

4. **같은 프로필 SHA 사용**
   - 내부 테스트에 **production** 프로필로 빌드했다면, Firebase에 넣은 SHA-1은 **production** keystore 것
   - **preview**로 빌드했다면 **preview** keystore의 SHA-1을 넣어야 함 (프로필마다 keystore가 다를 수 있음)

5. **(선택)** `google-services.json` 이 바뀌었다면 EAS 파일 시크릿 `GOOGLE_SERVICES_JSON` 을 새 파일로 덮어쓰고 다시 빌드.