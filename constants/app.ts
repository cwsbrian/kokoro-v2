import { Platform } from 'react-native'

/** App Store URL (iOS). Set EXPO_PUBLIC_APP_STORE_URL in .env when published. */
const APP_STORE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_APP_STORE_URL) ||
  'https://apps.apple.com/app/id000000000'

/** Play Store URL (Android). Set EXPO_PUBLIC_PLAY_STORE_URL in .env when published. */
const PLAY_STORE_URL =
  (typeof process !== 'undefined' &&
    process.env?.EXPO_PUBLIC_PLAY_STORE_URL) ||
  'https://play.google.com/store/apps/details?id=com.example.app'

/** Store link for the current platform (for share message). */
export const storeLink = Platform.select({
  ios: APP_STORE_URL,
  android: PLAY_STORE_URL,
  default: APP_STORE_URL,
})

/** 이용약관 URL. Set EXPO_PUBLIC_TERMS_URL in .env when published. */
export const termsUrl =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_TERMS_URL) ||
  ''

/** 개인정보처리방침 URL. Set EXPO_PUBLIC_PRIVACY_URL in .env when published. */
export const privacyUrl =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_PRIVACY_URL) ||
  ''
