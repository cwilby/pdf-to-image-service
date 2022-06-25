# PDFBox Service

> Apache PDFBox as an HTTP service

## Requirements

* NodeJS
* Docker

## Getting Started

Clone this repository and use [Docker compose](https://docs.docker.com/compose) to start the web service on port 8000.

```bash
$ docker compose up -d
```

## Endpoints

| Route | PDFBox Function |
| --- | --- |
| `POST /PDFToImage` | [PDFToImage](https://pdfbox.apache.org/2.0/commandline.html#pdftoimage) |

(More to be added over time)

## Example

```js
const fs = require('fs');

/**
 * A function that downloads the given PDF document 
 * as a zip file containing a set of JPEG images
 * for each page in the original document.
 */
export default async function pdfToImage(pdf: File, downloadPath: String) {
    const body = new FormData();
    body.append('pdf', pdf);

    const response = await fetch('http://127.0.0.1:8000/PDFToImage', {
        method: 'POST',
        body
    });

    const fileStream = fs.createWriteStream(downloadPath);

    return new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on('error', reject);
        fileStream.on('finish', resolve);
    });
}
```

## License

This software is released under the [Apache-2.0 License](LICENSE.md).

## Links

- [`Apache PDFBox`](https://pdfbox.apache.org/)
- [`pdfbox-simple`](https://github.com/rse/pdfbox-simple)