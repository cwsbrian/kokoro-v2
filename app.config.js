const appJson = require('./app.json')

module.exports = {
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    // EAS Build: 파일 시크릿이 설정되면 그 경로 사용, 로컬은 ./google-services.json
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? appJson.expo.android.googleServicesFile,
  },
}
