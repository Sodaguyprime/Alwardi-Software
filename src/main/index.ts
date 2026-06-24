import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import Store from 'electron-store'

const store = new Store<{ fields: Record<string, unknown> }>()

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    title: 'Alwardi Software',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // electron-vite injects this env var in dev
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/**
 * Render a standalone HTML string (the live preview) to an A4 PDF using an
 * offscreen BrowserWindow, then let the user save it.
 */
async function exportPdf(html: string): Promise<{ ok: boolean; path?: string; error?: string }> {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export PDF',
    defaultPath: 'letterhead.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })
  if (canceled || !filePath) return { ok: false }

  const pdfWin = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: true }
  })

  try {
    await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    // Give web fonts / images a moment to settle before printing.
    await new Promise((r) => setTimeout(r, 350))
    const data = await pdfWin.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    })
    await writeFile(filePath, data)
    return { ok: true, path: filePath }
  } catch (err) {
    return { ok: false, error: String(err) }
  } finally {
    pdfWin.destroy()
  }
}

async function saveDocx(buffer: ArrayBuffer): Promise<{ ok: boolean; path?: string }> {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export DOCX',
    defaultPath: 'letterhead.docx',
    filters: [{ name: 'Word Document', extensions: ['docx'] }]
  })
  if (canceled || !filePath) return { ok: false }
  await writeFile(filePath, Buffer.from(buffer))
  return { ok: true, path: filePath }
}

app.whenReady().then(() => {
  ipcMain.handle('store:get', () => store.get('fields', null))
  ipcMain.handle('store:set', (_e, fields) => store.set('fields', fields))
  ipcMain.handle('store:clear', () => store.delete('fields'))
  ipcMain.handle('export:pdf', (_e, html: string) => exportPdf(html))
  ipcMain.handle('export:docx', (_e, buffer: ArrayBuffer) => saveDocx(buffer))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
