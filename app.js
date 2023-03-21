const express = require('express')
const multer = require('multer')
const csv = require('csv-parser')
const fs = require('fs')
// const fileType = require('file-type')

const app = express()
const upload = multer({ dest: 'uploads/' })

const analyzedFiles = []

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/previous', (req, res) => {
  res.json(analyzedFiles)
})

app.post('/upload', upload.single('csvfile'), (req, res) => {
  const { path } = req.file
  const columnData = {}
  const fileSummary = {
    fileName: req.file.originalname,
    fileSize: req.file.size,
  }

  fs.createReadStream(path)
    .pipe(csv())
    .on('headers', (headers) => {
      headers.forEach((header) => {
        columnData[header] = 'Unknown'
      })
    })
    .on('data', (row) => {
      for (const [columnName, value] of Object.entries(row)) {
        if (columnData[columnName] !== 'String') {
          const valueType = typeof value
          columnData[columnName] =
            valueType.charAt(0).toUpperCase() + valueType.slice(1)
        }
      }
    })
    .on('end', () => {
      res.json({
        fileId: analyzedFiles.length,
        fileSummary,
        columnData,
      })

      analyzedFiles.push({
        fileSummary: {
          ...fileSummary,
          lastAnalyzed: new Date().toISOString(),
        },
        columnData,
      })

      fs.unlink(path, (err) => {
        if (err) {
          console.error('Error deleting file:', err)
        }
      })
    })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
