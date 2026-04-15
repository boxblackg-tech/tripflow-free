# วิธีเอา TripFlow Free ขึ้น GitHub และเปิดใช้บนมือถือ

## ต้องเอาไฟล์ไหนขึ้น GitHub

ให้อัปโหลด "ไฟล์ทั้งหมดที่อยู่ข้างในโฟลเดอร์ `tripflow-free`" ขึ้นไปที่ root ของ repository

หมายความว่าใน GitHub repository ต้องเห็นแบบนี้:

- `index.html`
- `manifest.webmanifest`
- `service-worker.js`
- `README.md`
- `GITHUB_UPLOAD_TH.md`
- โฟลเดอร์ `assets`
- โฟลเดอร์ `styles`
- โฟลเดอร์ `js`

ห้ามอัปทั้งโฟลเดอร์แม่ `New project` ถ้าใน repo มีไฟล์งานอื่นปนอยู่

## วิธีง่ายที่สุดผ่านหน้าเว็บ GitHub

### 1. สร้าง repository ใหม่

1. เปิด [GitHub](https://github.com)
2. ล็อกอิน
3. กดปุ่ม `New`
4. ตั้งชื่อ เช่น `tripflow-free`
5. เลือก `Public`
6. กด `Create repository`

### 2. อัปโหลดไฟล์

1. เข้า repository ที่เพิ่งสร้าง
2. กด `Add file`
3. กด `Upload files`
4. เปิดโฟลเดอร์นี้ในเครื่อง:

`C:\Users\Fern\OneDrive\Documents\New project\tripflow-free`

5. ลากไฟล์และโฟลเดอร์ทั้งหมดข้างใน `tripflow-free` ลงหน้าอัปโหลดของ GitHub
6. รอให้ upload เสร็จ
7. กด `Commit changes`

## เปิดเป็นเว็บไซต์ฟรีด้วย GitHub Pages

1. เข้า repository ของคุณ
2. กด `Settings`
3. กดเมนู `Pages`
4. ที่ `Build and deployment`
5. ตรง `Source` เลือก `Deploy from a branch`
6. Branch เลือก `main`
7. Folder เลือก `/ (root)`
8. กด `Save`

จากนั้นรอประมาณ 1-5 นาที GitHub จะสร้างลิงก์เว็บให้

ลิงก์จะหน้าตาประมาณนี้:

`https://ชื่อบัญชีของคุณ.github.io/tripflow-free/`

## ต้องใส่ไฟล์ไว้ตรงไหน

คำตอบสั้นที่สุดคือ:

- ใส่ไว้ที่ root ของ repository
- โดยให้ `index.html` อยู่ระดับบนสุดของ repo

ถูกต้อง:

`repo/index.html`

ไม่ควรเป็น:

`repo/tripflow-free/index.html`

ยกเว้นคุณตั้งใจจะใช้โฟลเดอร์ย่อยเอง

## ถ้าอยากให้ง่ายที่สุด

หลังสร้าง repo ใหม่ ให้เปิดหน้า upload แล้ว "ลากทุกอย่างในโฟลเดอร์ `tripflow-free` เข้าไปทั้งหมด"

## ถ้าเปิดบนมือถือแล้วหน้าไม่ขึ้น

เช็ก 4 อย่างนี้:

1. `index.html` อยู่ root ของ repo
2. เปิด GitHub Pages จาก branch `main`
3. รอ deploy 1-5 นาที
4. เปิดลิงก์ Pages ไม่ใช่ลิงก์ไฟล์ใน repo

## ถ้าคุณอยากให้ผมช่วยต่อ

ผมช่วยต่อได้ 2 แบบ:

1. ผมเตรียมโครงสำหรับ GitHub Pages ให้เรียบร้อยเพิ่มอีกนิด
2. ผมสอนคุณกดทีละขั้นจากหน้าจอ GitHub แบบละเอียดมาก
