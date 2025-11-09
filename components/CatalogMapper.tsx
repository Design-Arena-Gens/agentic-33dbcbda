"use client";

import { useEffect, useMemo, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { guessMappings, MARKETPLACES, performMapping, type MappingConfig } from '@/lib/mapping'
import useAssistantStore from '@/lib/store'

export default function CatalogMapper() {
  const [rawFile, setRawFile] = useState<File | null>(null)
  const [catalogFile, setCatalogFile] = useState<File | null>(null)
  const [marketplace, setMarketplace] = useState<keyof typeof MARKETPLACES>('amazon')
  const [mapping, setMapping] = useState<MappingConfig>({})
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [catalogHeaders, setCatalogHeaders] = useState<string[]>([])
  const [output, setOutput] = useState<Array<Record<string, any>> | null>(null)
  const { addMessage } = useAssistantStore()

  const rawInputRef = useRef<HTMLInputElement>(null)
  const catInputRef = useRef<HTMLInputElement>(null)

  function readHeaders(file: File, cb: (headers: string[]) => void) {
    const reader = new FileReader()
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[]
      const headers = (json[0] || []).map((h: any) => String(h))
      cb(headers)
    }
    reader.readAsArrayBuffer(file)
  }

  useEffect(() => {
    if (rawFile) readHeaders(rawFile, setRawHeaders)
  }, [rawFile])
  useEffect(() => {
    if (catalogFile) readHeaders(catalogFile, setCatalogHeaders)
  }, [catalogFile])

  useEffect(() => {
    if (rawHeaders.length && catalogHeaders.length) {
      const m = guessMappings(rawHeaders, catalogHeaders, MARKETPLACES[marketplace].synonyms)
      setMapping(m)
    }
  }, [rawHeaders, catalogHeaders, marketplace])

  function onProcess() {
    if (!rawFile) return
    const reader = new FileReader()
    reader.onload = () => {
      const wb = XLSX.read(new Uint8Array(reader.result as ArrayBuffer), { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Array<Record<string, any>>

      const targetHeaders = catalogHeaders.length ? catalogHeaders : MARKETPLACES[marketplace].requiredHeaders
      const resultRows = performMapping(rows, targetHeaders, mapping, MARKETPLACES[marketplace].defaults)
      setOutput(resultRows)
      addMessage({ role: 'assistant', content: `Prepared ${resultRows.length} rows for ${marketplace}. You can download now.` })
    }
    reader.readAsArrayBuffer(rawFile)
  }

  function download() {
    if (!output) return
    const ws = XLSX.utils.json_to_sheet(output)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Output')
    const fname = `catalog_${marketplace}.xlsx`
    XLSX.writeFile(wb, fname)
  }

  const mappingUI = useMemo(() => {
    const targets = catalogHeaders.length ? catalogHeaders : MARKETPLACES[marketplace].requiredHeaders
    return (
      <div className="space-y-2">
        {targets.map((target) => (
          <div key={target} className="grid grid-cols-2 gap-2 items-center">
            <div className="text-sm font-medium">{target}</div>
            <select
              className="rounded border p-1"
              value={mapping[target] || ''}
              onChange={(e) => setMapping({ ...mapping, [target]: e.target.value })}
            >
              <option value="">? Select source ?</option>
              {rawHeaders.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    )
  }, [mapping, rawHeaders, catalogHeaders, marketplace])

  return (
    <div className="card p-4 space-y-4">
      <h2 className="font-semibold">Catalog Mapper</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Raw Data (XLSX/CSV)</label>
          <input ref={rawInputRef} type="file" accept=".xlsx,.xls,.csv" className="block mt-1" onChange={(e) => setRawFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="text-sm">Catalog Template (optional, XLSX)</label>
          <input ref={catInputRef} type="file" accept=".xlsx,.xls" className="block mt-1" onChange={(e) => setCatalogFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <div>
          <label className="text-sm">Marketplace</label>
          <select className="block rounded border p-2" value={marketplace} onChange={(e) => setMarketplace(e.target.value as any)}>
            {Object.keys(MARKETPLACES).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <button className="btn" onClick={() => { setRawFile(null); setCatalogFile(null); setMapping({}); setOutput(null); rawInputRef.current!.value=''; catInputRef.current!.value=''; }}>Reset</button>
        <button className="btn btn-primary" onClick={onProcess} disabled={!rawFile}>Process</button>
        <button className="btn" onClick={download} disabled={!output}>Download XLSX</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Field Mapping</h3>
          {rawHeaders.length ? mappingUI : <p className="text-sm text-gray-600">Upload raw data to configure mapping.</p>}
        </div>
        <div>
          <h3 className="font-medium mb-2">Preview</h3>
          {output ? (
            <div className="overflow-auto max-h-72 border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(output[0] || {}).map((h) => <th key={h} className="px-2 py-1 text-left border-b">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {output.slice(0, 20).map((row, i) => (
                    <tr key={i} className="odd:bg-white even:bg-gray-50">
                      {Object.keys(output[0] || {}).map((h) => <td key={h} className="px-2 py-1 border-b">{String((row as any)[h] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Process to see a preview.</p>
          )}
        </div>
      </div>
    </div>
  )
}
