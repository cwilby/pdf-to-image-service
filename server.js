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
	const zipPath = path.resolve(uploadDirectory, req.file.filename.replace('.pdf', '.zip'));

	await new PDFBox().exec("PDFToImage", pdfPath);

	fs.rmSync(pdfPath);

	const output = fs.createWriteStream(zipPath);
	const archive = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});

	archive.on('close', () => {
		res.sendFile(zipPath);

		res.on('finish', () => {
			fs.readDir(uploadDirectory, function (err, files) {
				for (const file of files) {
					const filePath = path.resolve(uploadDirectory, file);
					
					fs.rmSync(filePath);
				}
			});
		});
	})

	archive.on('error', function (err) {
		throw err;
	});

	archive.pipe(output);

	fs.readDir(uploadDirectory, function (err, files) {
		for (const file of files) {
			const filePath = path.resolve(uploadDirectory, file);
			const stream = fs.createReadStream(filePath);
			archive.append(stream, { name: file });
		}

		archive.finalize();
	});

});

app.listen(8000);