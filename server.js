require('dotenv').config();
const archiver = require('archiver');
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
	const uploadDirectory = path.resolve(__dirname, 'uploads');
	const pdfPath = path.resolve(uploadDirectory, req.file.filename);

	await new PDFBox().exec("PDFToImage", pdfPath);

	fs.rmSync(pdfPath);

	const archive = archiver('zip');
	res.attachment(`${Date.now()}.zip`);
	archive.on('error', () => res.sendStatus(500));
	archive.pipe(res);

	for (const pageImage of fs.readdirSync(uploadDirectory)) {
		if (pageImage === '.gitignore') continue;

		archive.file(path.resolve(uploadDirectory, pageImage), { name: path.basename(pageImage) });
	}

	archive.finalize();

	res.on('finish', () => {
		for (const file of fs.readdirSync(uploadDirectory)) {
			if (file === '.gitignore') continue;

			fs.rmSync(path.resolve(uploadDirectory, file));
		}
	});
});

app.listen(8000);