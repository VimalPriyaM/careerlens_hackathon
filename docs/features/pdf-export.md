# PDF Export

Download your full analysis as a PDF document.

## How it works

1. User clicks "Download PDF" button in the dashboard header
2. `html2canvas` captures the entire dashboard DOM as a high-res canvas (2x scale)
3. Canvas is converted to a PNG data URL
4. `jsPDF` creates an A4 PDF document and embeds the image
5. Browser downloads: `CareerLens-{role}-{date}.pdf`

## Fallback

If the libraries fail to load (network issue, etc.), the system falls back to `window.print()` which opens the browser's print dialog.

## Libraries used

- `html2canvas` — DOM to canvas rendering
- `jsPDF` — PDF document creation

Both are dynamically imported (not in the main bundle) to keep page load fast.
