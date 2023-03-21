document.querySelector('form').addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = event.target
  const formData = new FormData(form)
  const response = await fetch(form.action, {
    method: form.method,
    body: formData,
  })

  const data = await response.json()

  const fileSizeInMB = (data.fileSummary.fileSize / (1024 * 1024)).toFixed(2)

  const fileSummaryTable = document.getElementById('file-summary')
  const fileSummaryRow = fileSummaryTable.insertRow(-1)
  fileSummaryRow.insertCell(-1).textContent = data.fileSummary.fileName
  fileSummaryRow.insertCell(-1).textContent = fileSizeInMB + ' MB'

  const columnDataTable = document.getElementById('column-data')
  for (const [columnName, dataType] of Object.entries(data.columnData)) {
    const row = columnDataTable.insertRow(-1)
    row.insertCell(-1).textContent = columnName
    row.insertCell(-1).textContent = dataType
  }
})

;(async function fetchPreviousFiles() {
  const response = await fetch('/previous')
  const files = await response.json()

  const previousFilesTable = document.getElementById('previous-files')
  for (const [index, file] of files.entries()) {
    const row = previousFilesTable.insertRow(-1)
    row.insertCell(-1).textContent = file.fileSummary.fileName
    row.insertCell(-1).textContent =
      (file.fileSummary.fileSize / (1024 * 1024)).toFixed(2) + ' MB'
    row.insertCell(-1).textContent = new Date(
      file.fileSummary.lastAnalyzed
    ).toLocaleString()

    const actionsCell = row.insertCell(-1)
    const viewButton = document.createElement('button')
    viewButton.textContent = 'View'
    viewButton.className = 'btn btn-sm btn-info'
    viewButton.onclick = () => displayFileDetails(file)
    actionsCell.appendChild(viewButton)
  }
})()

function displayFileDetails(file) {
  const fileSummaryTable = document.getElementById('file-summary')
  fileSummaryTable.deleteRow(-1)
  const fileSummaryRow = fileSummaryTable.insertRow(-1)
  fileSummaryRow.insertCell(-1).textContent = file.fileSummary.fileName
  fileSummaryRow.insertCell(-1).textContent =
    (file.fileSummary.fileSize / (1024 * 1024)).toFixed(2) + ' MB'

  const columnDataTable = document.getElementById('column-data')
  while (columnDataTable.rows.length > 1) {
    columnDataTable.deleteRow(-1)
  }
  for (const [columnName, dataType] of Object.entries(file.columnData)) {
    const row = columnDataTable.insertRow(-1)
    row.insertCell(-1).textContent = columnName
    row.insertCell(-1).textContent = dataType
  }
}
