import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getFields: () => ipcRenderer.invoke('store:get'),
  setFields: (fields: unknown) => ipcRenderer.invoke('store:set', fields),
  clearFields: () => ipcRenderer.invoke('store:clear'),
  exportPdf: (html: string) => ipcRenderer.invoke('export:pdf', html),
  exportDocx: (buffer: ArrayBuffer) => ipcRenderer.invoke('export:docx', buffer),
  exportPng: (dataUrl: string, name?: string) => ipcRenderer.invoke('export:png', dataUrl, name)
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
