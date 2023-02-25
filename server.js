require('dotenv').config();
const archiver = require('archiver');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const PDFBox = require("pdfbox-simple");

const uploadDirectory = path.resolve(__dirname, 'uploads');

const upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, done) => done(null, 'uploads/'),
		filename: (req, file, done) => done(null, `${Date.now()}${path.extname(file.originalname)}`)
	})
});

const app = express();

app.use(morgan('combined'));

app.post('/pdf-to-jpg', upload.single('pdf'), async (req, res) => {
	res.on('finish', () => fs.readdirSync(uploadDirectory).forEach(filename => {
		if (filename === '.gitignore') return;
		fs.rmSync(path.resolve(uploadDirectory, filename));
	}));

	const pdfPath = path.resolve(uploadDirectory, req.file.filename);
	await new PDFBox().exec("PDFToImage", pdfPath);

	fs.rmSync(pdfPath);

	const archive = archiver('zip');
	res.attachment(`${Date.now()}.zip`);
	archive.on('error', () => res.sendStatus(500));
	archive.pipe(res);
	fs.readdirSync(uploadDirectory).filter(f => f !== '.gitignore').forEach((filename, index) => {
		if (filename === '.gitignore') return;
		archive.file(path.resolve(uploadDirectory, filename), { name: `${index}.jpg` });
	});
	archive.finalize();
});

app.get('/health', (req, res) => res.sendStatus(200));

app.listen(8000);