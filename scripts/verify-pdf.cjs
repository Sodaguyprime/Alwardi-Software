const { app, BrowserWindow } = require('electron')
const { readFileSync, writeFileSync } = require('fs')
const path = require('path')

app.whenReady().then(async () => {
  const html = readFileSync(path.join(__dirname, 'verify.html'), 'utf8')
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } })
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
  await new Promise((r) => setTimeout(r, 500))
  const pdf = await win.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    margins: { top: 0, bottom: 0, left: 0, right: 0 }
  })
  writeFileSync(path.join(__dirname, 'verify.pdf'), pdf)
  console.log('wrote scripts/verify.pdf')
  app.quit()
})
