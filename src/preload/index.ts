import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getFields: () => ipcRenderer.invoke('store:get'),
  setFields: (fields: unknown) => ipcRenderer.invoke('store:set', fields),
  clearFields: () => ipcRenderer.invoke('store:clear'),
  exportPdf: (html: string) => ipcRenderer.invoke('export:pdf', html),
  exportDocx: (buffer: ArrayBuffer) => ipcRenderer.invoke('export:docx', buffer)
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
