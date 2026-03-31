const fs = require('fs')
const path = require('path')
const multer = require('multer')

const uploadRoot = path.join(__dirname, '..', '..', 'uploads')

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot)
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, `${Date.now()}-${safeName}`)
  }
})

const pdfOnly = (_req, file, cb) => {
  const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')

  if (!isPdf) {
    return cb(new Error('Only PDF files are allowed'))
  }

  cb(null, true)
}

const uploadPdf = multer({
  storage,
  fileFilter: pdfOnly,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

module.exports = { uploadPdf, uploadRoot }
