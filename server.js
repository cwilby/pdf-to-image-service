require('dotenv').config();
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const PDFBox = require("pdfbox-simple");

const app = express();

app.use(morgan('combined'));

const storage = multer.diskStorage({
	destination: (req, file, done) => done(null, 'uploads/'),
	filename: (req, file, done) => done(null, `${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage });

app.get('/health', (req, res) => res.sendStatus(200));

app.post('/pdf-to-jpg', upload.single('pdf'), async (req, res) => {
	const pdfPath = path.resolve(__dirname, 'uploads', req.file.filename);
	const jpgPath = `${pdfPath.replace('.pdf', '')}1.jpg`;
	
	await new PDFBox().exec("PDFToImage", pdfPath);

	res.sendFile(jpgPath);

	res.on('finish', () => {
		fs.rmSync(pdfPath);
		fs.rmSync(jpgPath);
	});
});

app.listen(8000);