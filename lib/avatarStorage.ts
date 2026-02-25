import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'
import { getDownloadURL, listAll, ref } from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AVATAR_KEY = '@kokoro/avatarUrl'
const AVATAR_POOL_PREFIX = 'avatar'
const AVATAR_POOL_MAX = 20
/** 기기에 저장하는 아바타 파일명 (덮어쓰기로 항상 최신 1장만 유지) */
const AVATAR_LOCAL_FILENAME = 'avatar.jpg'

export async function setAvatarToDevice(uri: string): Promise<void> {
  await AsyncStorage.setItem(AVATAR_KEY, uri)
}

export async function getAvatarFromDevice(): Promise<string | null> {
  return AsyncStorage.getItem(AVATAR_KEY)
}

/**
 * 로컬 file:// URI 파일이 아직 존재하는지 확인
 */
export async function isLocalAvatarFileAvailable(uri: string): Promise<boolean> {
  if (!uri.startsWith('file://')) return false
  try {
    const path = uri.replace(/^file:\/\//, '')
    const info = await FileSystem.getInfoAsync(path)
    return info.exists
  } catch {
    return false
  }
}

/**
 * Firebase Storage(또는 https) URL에서 이미지를 다운로드해 기기 documentDirectory에 저장.
 * 기존 아바타 파일을 덮어써서 항상 최신 1장만 유지. 반환값은 로컬 file URI.
 */
export async function downloadAvatarUrlToDevice(downloadUrl: string): Promise<string> {
  const dir = FileSystem.documentDirectory ?? ''
  const fileUri = `${dir}${AVATAR_LOCAL_FILENAME}`
  const result = await FileSystem.downloadAsync(downloadUrl, fileUri)
  const uri = result.uri.startsWith('file://') ? result.uri : `file://${result.uri}`
  if (__DEV__) console.log('[Avatar] downloaded to device:', uri)
  return uri
}

/**
 * 공용 avatar 풀(Storage avatar/)에 있는 이미지 개수
 */
export async function countAvatarPool(): Promise<number> {
  try {
    const listRef = ref(storage, AVATAR_POOL_PREFIX)
    const res = await listAll(listRef)
    return res.items.length
  } catch (err) {
    if (__DEV__) console.warn('[Avatar] countAvatarPool failed:', err)
    return 0
  }
}

/**
 * 풀에 이미지가 AVATAR_POOL_MAX 초과인지
 */
export function isAvatarPoolOverLimit(count: number): boolean {
  return count > AVATAR_POOL_MAX
}

/**
 * 공용 avatar 풀에서 랜덤으로 하나 선택해 download URL 반환. 풀 비어 있으면 null.
 */
export async function getRandomAvatarFromPool(): Promise<string | null> {
  try {
    const listRef = ref(storage, AVATAR_POOL_PREFIX)
    const res = await listAll(listRef)
    if (res.items.length === 0) return null
    const itemRef = res.items[Math.floor(Math.random() * res.items.length)]
    return getDownloadURL(itemRef)
  } catch (err) {
    if (__DEV__) console.warn('[Avatar] getRandomAvatarFromPool failed:', err)
    return null
  }
}

/**
 * 로컬 아바타 파일을 공용 풀(avatar/{id})에 업로드하고 download URL 반환.
 * React Native에서는 uploadString/uploadBytes가 Blob·ArrayBuffer 미지원으로 실패하므로
 * Firebase Storage REST API + FileSystem.uploadAsync로 로컬 파일을 직접 POST.
 */
export async function uploadAvatarToPool(localFileUri: string): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('Avatar pool upload requires signed-in user')
  const idToken = await user.getIdToken()
  const shortId = Math.random().toString(36).slice(2, 8)
  const isPng = localFileUri.toLowerCase().endsWith('.png')
  const ext = isPng ? 'png' : 'jpg'
  const path = `${AVATAR_POOL_PREFIX}/${Date.now()}_${shortId}.${ext}`
  const storageRef = ref(storage, path)
  const bucket = storageRef.bucket
  const restUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodeURIComponent(path)}`
  const contentType = isPng ? 'image/png' : 'image/jpeg'
  const fileUri = localFileUri.startsWith('file://') ? localFileUri : `file://${localFileUri}`
  await FileSystem.uploadAsync(restUrl, fileUri, {
    httpMethod: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': contentType,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  })
  const downloadUrl = await getDownloadURL(storageRef)
  if (__DEV__) console.log('[Avatar] uploaded to pool, path:', path)
  return downloadUrl
}

const PROFILE_AVATAR_DOC = 'avatar'

/**
 * Firestore users/{uid}/profile/avatar 에 avatarUrl 저장
 */
export async function setAvatarUrlToFirestore(
  uid: string,
  url: string
): Promise<void> {
  const docRef = doc(db, 'users', uid, 'profile', PROFILE_AVATAR_DOC)
  await setDoc(docRef, { avatarUrl: url, updatedAt: new Date().toISOString() })
  if (__DEV__) console.log('[Avatar] saved URL to Firestore')
}

/**
 * Firestore에서 프로필 아바타 URL 조회
 */
export async function getAvatarUrlFromFirestore(uid: string): Promise<string | null> {
  try {
    const docRef = doc(db, 'users', uid, 'profile', PROFILE_AVATAR_DOC)
    const snap = await getDoc(docRef)
    const url = snap.data()?.avatarUrl
    return typeof url === 'string' ? url : null
  } catch (err) {
    if (__DEV__) console.warn('[Avatar] Firestore get failed:', err)
    return null
  }
}
