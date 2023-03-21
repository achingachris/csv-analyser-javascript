import multer from 'multer'
import csv from 'csv-parser'
import fs from 'fs'

const upload = multer({ dest: 'uploads/' })

const analyzedFiles = []

async function processUpload(req, res) {
  const { path } = req.file
  const columnData = {}
  const fileSummary = {
    fileName: req.file.originalname,
    fileSize: req.file.size,
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(csv())
      .on('headers', (headers) => {
        headers.forEach((header) => {
          columnData[header] = { columnName: header, dataType: 'Unknown' }
        })
      })
      .on('data', (row) => {
        for (const [columnName, value] of Object.entries(row)) {
          if (columnData[columnName].dataType !== 'String') {
            const valueType = typeof value
            columnData[columnName].dataType =
              valueType.charAt(0).toUpperCase() + valueType.slice(1)
          }
        }
      })
      .on('end', () => {
        res.json({
          fileId: analyzedFiles.length,
          fileSummary,
          columnData: Object.values(columnData),
        })

        analyzedFiles.push({
          fileSummary: {
            ...fileSummary,
            lastAnalyzed: new Date().toISOString(),
          },
          columnData: Object.values(columnData),
        })

        fs.unlink(path, (err) => {
          if (err) {
            console.error('Error deleting file:', err)
          }
        })

        resolve()
      })
      .on('error', reject)
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await new Promise((resolve, reject) => {
      upload.single('csvfile')(req, res, (err) => {
        if (err) {
          res.status(500).json({ error: err.message })
          reject(err)
        } else {
          resolve()
        }
      })
    })

    try {
      await processUpload(req, res)
    } catch (error) {
      console.error('Error processing file:', error)
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
