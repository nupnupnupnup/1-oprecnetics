# Penugasan 1 OPREC NETICS - CI/CD

## Identitas

- **Nama:** Muhammad Rifqy Febryantoni 
- **NRP:** 5025231106

---

## Deskripsi Penugasan

Implementasi modul CI/CD pada sistem API sederhana yang memiliki endpoint `/health`. API ini menampilkan informasi tentang status server dan dideploy secara otomatis menggunakan GitHub Actions ke server VPS.

---

## Teknologi yang Digunakan

- Node.js (Express.js)
- Docker (Multi-stage build)
- GitHub Actions (CI/CD)
- SSH Deployment
- VPS Publik 

---

## Langkah Pengerjaan

### Pembuatan API `/health`
```
npm init -y

npm install express

cat >> index.js << 'EOF'
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
EOF

node index.js
```

  Cek di local

  ![image](https://github.com/user-attachments/assets/53f869dd-b826-4b34-b807-7147d5dc706e)


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

docker build -t health-api .

docker run -p 3000:3000 health-api
```

  Cek di local

  ![image](https://github.com/user-attachments/assets/53f869dd-b826-4b34-b807-7147d5dc706e)

### Menyiapkan VPS dan Port

1. Set up VPS, disini saya menggunakan google cloud

    ![image](https://github.com/user-attachments/assets/f5a20ab0-2c4a-4083-9ba3-32c9a247b937)

3. Buat instance baru “create instance”
   ```
    Name: vpsnew
    Region: Asia-southeast2 (Jakarta)
    Machine Type: pakai e2-micro
    Boot disk: Ubuntu 22.04 LTS
    Firewall: Centang Allow HTTP dan Allow HTTPS
   ```
4. Setelah berhasil membuat instance, buat access token pada VPS
   ```
   ssh-keygen -t rsa -b 2048 -f ~/.ssh/gcp_key
   ```
   insert key pada:

    ![image](https://github.com/user-attachments/assets/dcb694ed-8e78-4d30-8768-3ae0cee5b8b2)

6. Setelah menjalankan command tersebut kita akan masuk ke SSH instance, lalu install docker pada instance
   ```
    ssh -i ~/.ssh/gcp_key bryantoni@34.101.169.247
    sudo apt update
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    
    sudo apt update
    sudo apt install -y docker-ce
    
    sudo usermod -aG docker $USER
   ```
   SSH pada VPS:

    ![image](https://github.com/user-attachments/assets/2c86ba5a-880d-4777-9cc6-8f5216f60ece)

8. Pada console instance buka port 3000, buat firewall policy baru.
   ```
    Name: allow-3000
    Targets: All instances
    Source IP: 0.0.0.0/0
    Protocols: centang tcp, isi port 3000
   ```
   Tampilan policy baru:

    ![image](https://github.com/user-attachments/assets/7283e872-8e79-4773-ab24-046a518f522e)
10. Lakukan test ping ke VPS untuk tes apabila VPS bekerja

    ![image](https://github.com/user-attachments/assets/6656dd69-7867-483b-b702-164b926b0acb)

12. Untuk mendeploy API. Lakukan langkah yang sama pada point A, namun dilakukan pada SSH vps.

    ![image](https://github.com/user-attachments/assets/e552d4a4-f56e-4e62-a9af-72d415264deb)


### Setup GitHub Actions

1. Set up repository
2. Buat direktori berikut pada file pengerjaan di point A
   ```
   mkdir .github && cd .github
    mkdir workflows
    echo “name: CI/CD Docker Deploy
    
    on:
      push:
        branches:
          - main  
    
    jobs:
      build-and-deploy:
        runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to DockerHub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and Push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/health-api:latest

    - name: SSH to VPS and Deploy
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_PRIVATE_KEY }}
        script: |
          docker pull ${{ secrets.DOCKER_USERNAME }}/health-api:latest
          docker stop health-api || true
          docker rm health-api || true
          docker run -d --name health-api -p 3000:3000 ${{ secrets.DOCKER_USERNAME }}/health-api:latest” >> ci-cd.yml
   ```
3. Set up secrets
   ```
    DOCKER_PASSWORD : generate token pada docker hub
    DOCKER_USERNAME : username di docker hub
    VPS_HOST : IP external vps
    VPS_PRIVATE_KEY : key yang kita gunakan untuk ssh 
    VPS_USER : user pada vps
   ```
4. Push file pengerjaan ke repository
5. Cek actions setelah di-push
6. Akses ip vps:port dengan endpoint /health : http://(IP external vps):3000/health

    ![image](https://github.com/user-attachments/assets/05f4e40b-b641-4e36-88dd-6601478e2302)
