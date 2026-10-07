export interface QATestResult {
  testName: string
  passed: boolean
  details: string
}

export interface QAReport {
  timestamp: Date
  results: QATestResult[]
  score: number
}

export function qaAgent(tests: { name: string; run: () => boolean }[]): Promise<QAReport> {
  const results: QATestResult[] = tests.map((t) => ({
    testName: t.name,
    passed: t.run(),
    details: t.run() ? 'OK' : 'Falhou',
  }))
  const passed = results.filter((r) => r.passed).length
  return Promise.resolve({
    timestamp: new Date(),
    results,
    score: tests.length > 0 ? Math.round((passed / tests.length) * 100) : 100,
  })
}
