import { Experiment } from './experiment-tracker'

const complexityDescriptions: Record<string, string> = {
  bubble: `Bubble Sort has a time complexity of O(n²) in the worst and average cases, making it inefficient for large datasets. 
However, it has a best-case complexity of O(n) when the array is already sorted. 
Space complexity is O(1) as it sorts in place.`,
  quick: `Quick Sort has an average-case time complexity of O(n log n), making it efficient for most real-world applications. 
The worst-case complexity is O(n²) when the pivot is poorly chosen. 
Space complexity is O(log n) due to recursive call stack.`,
  merge: `Merge Sort guarantees O(n log n) time complexity in all cases (best, average, and worst), making it very predictable. 
This makes it ideal when consistent performance is required. 
Space complexity is O(n) as it requires additional space for merging.`,
}

export function generatePDFReport(experiment: Experiment): string {
  const date = new Date(experiment.timestamp).toLocaleString()
  const complexity = complexityDescriptions[experiment.algorithm] || 'N/A'

  // Using HTML format for easy browser printing
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Algorithm Performance Report - ${experiment.algorithm}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 40px;
          color: #333;
          background: white;
        }
        .header {
          border-bottom: 3px solid #667eea;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          color: #667eea;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .section h2 {
          background: #f0f4ff;
          padding: 10px;
          border-left: 4px solid #667eea;
          color: #667eea;
          margin-top: 0;
        }
        .metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 15px 0;
        }
        .metric {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #667eea;
        }
        .metric-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #667eea;
          margin-top: 5px;
        }
        .description {
          background: #f0f4ff;
          padding: 15px;
          border-radius: 5px;
          font-size: 14px;
          line-height: 1.6;
          color: #555;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #999;
        }
        @media print {
          body { margin: 0; }
          .footer { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${experiment.algorithm.toUpperCase()} Performance Report</h1>
        <p>Generated on ${date}</p>
      </div>

      <div class="section">
        <h2>Execution Metrics</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Array Size</div>
            <div class="metric-value">${experiment.arraySize}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Data Type</div>
            <div class="metric-value">${experiment.dataType}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Execution Time</div>
            <div class="metric-value">${experiment.executionTime}ms</div>
          </div>
          <div class="metric">
            <div class="metric-label">Comparisons</div>
            <div class="metric-value">${experiment.comparisons}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Operations</div>
            <div class="metric-value">${experiment.operations}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Operations/Comparison</div>
            <div class="metric-value">${(experiment.operations / experiment.comparisons).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Algorithm Analysis</h2>
        <div class="description">
          ${complexity}
        </div>
      </div>

      <div class="section">
        <h2>Performance Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f0f4ff;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Metric</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Value</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">Total Time</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${experiment.executionTime}ms</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">Comparisons per Element</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${(experiment.comparisons / experiment.arraySize).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">Operations per Element</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${(experiment.operations / experiment.arraySize).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">Speed (Elements/ms)</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${(experiment.arraySize / experiment.executionTime).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Complexity Notes</h2>
        <div style="font-size: 13px; line-height: 1.6; color: #555;">
          <p><strong>Big-O Notation</strong> describes how an algorithm's runtime grows with input size:</p>
          <ul>
            <li><strong>O(1)</strong> - Constant: Runtime doesn't change with input size</li>
            <li><strong>O(log n)</strong> - Logarithmic: Time grows slowly with input size</li>
            <li><strong>O(n)</strong> - Linear: Time grows proportionally with input size</li>
            <li><strong>O(n log n)</strong> - Linearithmic: Optimal for comparison-based sorting</li>
            <li><strong>O(n²)</strong> - Quadratic: Time grows exponentially with input size</li>
          </ul>
        </div>
      </div>

      <div class="footer">
        <p>This report was generated by the Algorithm Performance Analyzer.</p>
        <p>For more information, visit the dashboard and analyze more algorithms.</p>
      </div>
    </body>
    </html>
  `

  return html
}

export function downloadPDFReport(experiment: Experiment) {
  const html = generatePDFReport(experiment)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${experiment.algorithm}_report_${experiment.id}.html`
  link.click()
  URL.revokeObjectURL(url)
}
