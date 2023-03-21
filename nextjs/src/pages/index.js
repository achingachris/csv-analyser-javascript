import { useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Home() {
  const [fileSummary, setFileSummary] = useState(null)
  const [columnData, setColumnData] = useState([])
  const [previousFiles, setPreviousFiles] = useState([])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      setFileSummary(data.fileSummary)
      setColumnData(data.columnData)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const fetchPreviousFiles = async () => {
    try {
      const response = await fetch('/api/previous')
      const data = await response.json()
      setPreviousFiles(data)
    } catch (error) {
      console.error('Error fetching previous files:', error)
    }
  }

  return (
    <>
      <div className='container'>
        <h1 className='my-4'>CSV File Analyzer</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='csvfile'>Upload a CSV file:</label>
            <input
              type='file'
              className='form-control-file'
              id='csvfile'
              name='csvfile'
              accept='.csv'
              required
            />
          </div>
          <button type='submit' className='btn btn-primary'>
            Analyze
          </button>
        </form>
      </div>
      <div className='container'>
        <h2 className='my-4'>File Summary</h2>
        <table className='table table-bordered table-hover'>
          <thead>
            <tr>
              <th>File Name</th>
              <th>File Size</th>
            </tr>
          </thead>
          <tbody>
            {fileSummary && (
              <tr>
                <td>{fileSummary.fileName}</td>
                <td>{(fileSummary.fileSize / (1024 * 1024)).toFixed(2)} MB</td>
              </tr>
            )}
          </tbody>
        </table>
        <h2 className='my-4'>Column Data</h2>
        <table className='table table-bordered table-hover'>
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
            </tr>
          </thead>
          <tbody>
            {columnData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.columnName}</td>
                <td>{entry.dataType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
