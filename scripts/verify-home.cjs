const { app, BrowserWindow } = require('electron')
const { writeFileSync } = require('fs')
const path = require('path')

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1000,
    height: 760,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'out', 'preload', 'index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })
  win.webContents.on('console-message', (_e, level, message) => console.log('[console]', message))
  win.webContents.on('did-fail-load', (_e, code, desc, url) =>
    console.log('[fail-load]', code, desc, url)
  )
  await win.loadFile(path.join(__dirname, '..', 'out', 'renderer', 'index.html'))
  await new Promise((r) => setTimeout(r, 1200))
  const image = await win.webContents.capturePage()
  writeFileSync(path.join(__dirname, 'verify-home.png'), image.toPNG())
  console.log('wrote scripts/verify-home.png')
  app.quit()
})
