const { app, BrowserWindow } = require('electron')
const { readFileSync, writeFileSync } = require('fs')
const path = require('path')

app.whenReady().then(async () => {
  const html = readFileSync(path.join(__dirname, 'verify.html'), 'utf8')
  const win = new BrowserWindow({
    show: false,
    frame: false,
    width: 794,
    height: 1123,
    useContentSize: true,
    webPreferences: { offscreen: false }
  })
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
  win.webContents.setZoomFactor(0.7)
  await new Promise((r) => setTimeout(r, 700))
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 560, height: 790 })
  writeFileSync(path.join(__dirname, 'verify.png'), image.toPNG())
  console.log('wrote scripts/verify.png')
  app.quit()
})
