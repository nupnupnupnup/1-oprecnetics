# Penugasan 1 OPREC NETICS - CI/CD

## Identitas

- **Nama:** Tunas Bimatara Chrisnanta Budiman  
- **NRP:** 5025231999

---

## Deskripsi Penugasan

Implementasi modul CI/CD pada sistem API sederhana yang memiliki endpoint `/health`. API ini menampilkan informasi tentang status server dan dideploy secara otomatis menggunakan GitHub Actions ke server VPS.

---

## Teknologi yang Digunakan

- Node.js (Express.js)
- Docker (Multi-stage build)
- GitHub Actions (CI/CD)
- SSH Deployment
- VPS Publik (Ubuntu)

---

## Langkah Pengerjaan

### Pembuatan API `/health`

File `index.js`:
```javascript
const express = require('express');
const os = require('os');

const app = express();
const port = 3000;

const startTime = Date.now();

app.get('/health', (req, res) => {
  const currentTime = new Date();
  const uptime = process.uptime();

  res.json({
    nama: "Tunas Bimatara Chrisnanta Budiman",
    nrp: "5025231999",
    status: "UP",
    timestamp: currentTime.toISOString(),
    uptime: `${Math.floor(uptime)} seconds`
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

### Dockerfile (Multi-stage)

File `Dockerfile`:
```dockerfile
# Stage 1: Build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000
CMD ["node", "index.js"]
```

### Menyiapkan VPS dan Port

- VPS publik menggunakan Ubuntu.
- Port 3000 dibuka menggunakan UFW.
- SSH dikonfigurasi dengan private key untuk GitHub Actions.

### Setup GitHub Actions

File `.github/workflows/deploy.yml`:
```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Build Docker image
      run: docker build -t ${{ secrets.DOCKER_USERNAME }}/health-api:latest .

    - name: Login to DockerHub
      run: echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin

    - name: Push to DockerHub
      run: docker push ${{ secrets.DOCKER_USERNAME }}/health-api:latest

    - name: Deploy to VPS via SSH
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_KEY }}
        script: |
          docker pull ${{ secrets.DOCKER_USERNAME }}/health-api:latest
          docker stop health-api || true
          docker rm health-api || true
          docker run -d --name health-api -p 3000:3000 ${{ secrets.DOCKER_USERNAME }}/health-api:latest
```

### Verifikasi

Akses API di: `http://<ip-vps>:3000/health`

Contoh Output:
```json
{
  "nama": "Tunas Bimatara Chrisnanta Budiman",
  "nrp": "5025231999",
  "status": "UP",
  "timestamp": "2025-04-06T08:00:00.000Z",
  "uptime": "10 seconds"
}
```

### Struktur Folder

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── Dockerfile
├── index.js
├── package.json
└── README.md
```

> *Note: Folder `node_modules` tidak dimasukkan ke dalam repo.*

### Dokumentasi Tambahan

- File `package.json` berisi dependensi `express`.
- Secrets diatur melalui GitHub Repo > Settings > Secrets.
