# วิธีเอา TripFlow Free ขึ้น GitHub และเปิดใช้บนมือถือ

## ต้องเอาไฟล์ไหนขึ้น GitHub

ให้อัปโหลดไฟล์ทั้งหมดที่อยู่ข้างในโฟลเดอร์ `tripflow-free` ขึ้นไปที่ root ของ repository

ใน GitHub repository ควรเห็นโครงสร้างแบบนี้:

- `index.html`
- `manifest.webmanifest`
- `service-worker.js`
- `README.md`
- `GITHUB_UPLOAD_TH.md`
- โฟลเดอร์ `assets`
- โฟลเดอร์ `styles`
- โฟลเดอร์ `js`

จุดสำคัญคือ `index.html` ต้องอยู่ที่ระดับบนสุดของ repo ไม่ใช่อยู่ซ้อนในโฟลเดอร์ย่อยอีกชั้น

## วิธีง่ายที่สุดผ่านหน้าเว็บ GitHub

### 1. สร้าง repository ใหม่

1. เปิด [GitHub](https://github.com)
2. ล็อกอิน
3. กดปุ่ม `New`
4. ตั้งชื่อ repo เช่น `tripflow-free`
5. เลือก `Public`
6. กด `Create repository`

### 2. อัปโหลดไฟล์

1. เข้า repository ที่เพิ่งสร้าง
2. กด `Add file`
3. กด `Upload files`
4. เปิดโฟลเดอร์โปรเจกต์นี้ในเครื่อง
5. ลากไฟล์และโฟลเดอร์ทั้งหมดจากข้างใน `tripflow-free` ลงในหน้าอัปโหลด
6. รอให้ upload เสร็จ
7. กด `Commit changes`

## เปิดเป็นเว็บฟรีด้วย GitHub Pages

1. เข้า repository ของคุณ
2. กด `Settings`
3. เข้าเมนู `Pages`
4. ที่ `Build and deployment`
5. ตั้ง `Source` เป็น `Deploy from a branch`
6. เลือก branch `main`
7. เลือก folder เป็น `/ (root)`
8. กด `Save`

หลังจากนั้นรอประมาณ 1-5 นาที GitHub จะสร้างลิงก์เว็บให้

ลิงก์จะมีหน้าตาประมาณนี้:

`https://ชื่อบัญชีของคุณ.github.io/tripflow-free/`

## ต้องวางไฟล์ไว้ตรงไหน

คำตอบสั้นที่สุดคือ:

- ใส่ไว้ที่ root ของ repository
- ให้ `index.html` อยู่ระดับบนสุดของ repo

ถูกต้อง:

`repo/index.html`

ไม่ควรเป็น:

`repo/tripflow-free/index.html`

## ถ้าเปิดบนมือถือแล้วหน้าไม่ขึ้น

เช็ก 4 อย่างนี้:

1. `index.html` อยู่ที่ root ของ repo
2. เปิด GitHub Pages จาก branch `main`
3. รอ deploy 1-5 นาที
4. เปิดลิงก์ GitHub Pages ไม่ใช่ลิงก์ดูไฟล์ใน repo

## ถ้าต้องการให้ช่วยต่อ

ช่วยได้ 2 แบบ:

1. จัดโครงโปรเจกต์ให้พร้อมสำหรับ GitHub Pages
2. ไล่ดูปัญหาในโค้ดและแก้ต่อให้ทีละจุด
