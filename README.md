# Minishop-v3
# 📖 คู่มือการติดตั้งและใช้งาน Minishop-v3

## 📋 สารบัญ
1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [การติดตั้ง Google Sheets และ Apps Script](#การติดตั้ง-google-sheets-และ-apps-script)
3. [การสร้างฐานข้อมูลด้วย initialSetup()](#การสร้างฐานข้อมูลด้วย-initialsetup)
4. [การตั้งค่า LIFF และ LINE](#การตั้งค่า-liff-และ-line)
5. [การติดตั้งไฟล์ HTML/JS/CSS](#การติดตั้งไฟล์-htmljscss)
6. [การตั้งค่า Thunder API](#การตั้งค่า-thunder-api)
7. [การตั้งค่า LINE Notify](#การตั้งค่า-line-notify)
8. [การทดสอบระบบ](#การทดสอบระบบ)
9. [FAQ และแก้ไขปัญหา](#faq-และแก้ไขปัญหา)

---

## ข้อกำหนดเบื้องต้น

### บัญชีที่ต้องมี:
- ✅ Google Account
- ✅ LINE Developers Account ([developers.line.biz](https://developers.line.biz))
- ✅ Thunder Solution API Key ([thethunder.solutions](https://www.thethunder.solutions))
- ✅ LINE Notify Token (ถ้าต้องการรับแจ้งเตือน)

---

## การติดตั้ง Google Sheets และ Apps Script

### ขั้นตอนที่ 1: สร้าง Google Spreadsheet ใหม่

1. เปิด [Google Sheets](https://sheets.google.com)
2. คลิก **"Blank spreadsheet"** (สมุดงานเปล่า)
3. ตั้งชื่อไฟล์ว่า **"Minishop-v3-Database"**

### ขั้นตอนที่ 2: เปิด Apps Script Editor

1. ในไฟล์ Sheets คลิก **Extensions** > **Apps Script**
2. จะเปิดหน้าต่างใหม่ของ Apps Script Editor
3. ลบโค้ดเริ่มต้นทั้งหมดออก

### ขั้นตอนที่ 3: วางโค้ด Code.gs

1. คัดลอกโค้ดทั้งหมดจากไฟล์ `Code.gs`
2. วางในหน้า Apps Script Editor
3. **สำคัญ**: แก้ไขค่า Configuration ดังนี้:

```javascript
const CONFIG = {
  THUNDER_API_URL: 'https://api.thethunder.solutions/slipverify',
  THUNDER_API_KEY: 'ใส่ API Key จาก Thunder Solution',
  LINE_NOTIFY_TOKEN: 'ใส่ Token จาก LINE Notify (ถ้ามี)',
  // ... ส่วนอื่นๆ ไม่ต้องแก้
};
```

4. บันทึกโดยคลิก **💾 (Ctrl+S)** หรือ **File** > **Save**
5. ตั้งชื่อโปรเจกต์ว่า **"Minishop-v3-Backend"**

---

## การสร้างฐานข้อมูลด้วย initialSetup()

### 🚀 ขั้นตอนการรัน initialSetup()

1. ในหน้า Apps Script Editor ให้เลือกฟังก์ชัน `initialSetup` จาก Dropdown ด้านบน
   
   ```
   [Select function] ▼  →  เลือก "initialSetup"
   ```

2. คลิกปุ่ม **▶️ Run** (หรือกด Ctrl+R)

3. **ครั้งแรก** ระบบจะขออนุญาต:
   - คลิก **Review Permissions**
   - เลือกบัญชี Google ของคุณ
   - คลิก **Advanced** > **Go to Minishop-v3-Backend (unsafe)**
   - คลิก **Allow**

4. รอสักครู่ ระบบจะแสดงข้อความ:
   ```
   ✅ สำเร็จ!
   ระบบสร้างฐานข้อมูลเรียบร้อยแล้ว
   
   ✓ Sheet: products
   ✓ Sheet: orders
   ✓ Sheet: store_settings
   ```

5. กลับไปที่ Google Sheets จะเห็น 3 sheets ใหม่:
   - 📦 **products** - เก็บข้อมูลสินค้า (มีตัวอย่าง 4 รายการ)
   - 🛒 **orders** - เก็บประวัติการสั่งซื้อ
   - ⚙️ **store_settings** - ตั้งค่าร้านค้า

### ✏️ แก้ไขข้อมูลสินค้าเริ่มต้น

เปิด Sheet **products** และแก้ไข:
- `id` - รหัสสินค้า (ไม่ซ้ำกัน)
- `name` - ชื่อสินค้า
- `price` - ราคา (บาท)
- `stock` - จำนวนในคลัง
- `is_available` - TRUE = พร้อมขาย, FALSE = ปิดขาย
- `image` - URL รูปภาพ (ใช้ Imgur, Google Drive หรือ URL อื่นๆ)
- `category` - หมวดหมู่ (เช่น อาหาร, เครื่องดื่ม, ของใช้)

**ตัวอย่าง:**
```
id | name              | price | stock | is_available | image                  | category
1  | ข้าวหอมมะลิ 5 กก. | 180   | 50    | TRUE         | https://i.imgur.com/... | อาหาร
2  | น้ำดื่ม 6 ขวด     | 25    | 100   | TRUE         | https://i.imgur.com/... | เครื่องดื่ม
```

---

## การตั้งค่า LIFF และ LINE

### ขั้นตอนที่ 1: สร้าง LINE Login Channel

1. เข้า [LINE Developers Console](https://developers.line.biz/console/)
2. คลิก **Create a new provider** (ถ้ายังไม่มี)
3. ตั้งชื่อ Provider เช่น "Minishop"
4. คลิก **Create a Messaging API channel**
   - Channel type: **Messaging API**
   - Channel name: **Minishop v3**
   - กรอกข้อมูลที่จำเป็น
   - คลิก **Create**

### ขั้นตอนที่ 2: สร้าง LIFF App

1. ใน Channel ที่สร้าง ไปที่แท็บ **LIFF**
2. คลิก **Add**
3. กรอกข้อมูล:
   - **LIFF app name**: Minishop Web
   - **Size**: Full
   - **Endpoint URL**: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
     (ยังไม่ต้องกรอก รอก่อน)
   - **Scope**: 
     - ✅ profile
     - ✅ openid
   - **Bot link feature**: On

4. คลิก **Add**
5. **คัดลอก LIFF ID** (รูปแบบ: `1234567890-abcdefgh`)

### ขั้นตอนที่ 3: Deploy Apps Script เป็น Web App

1. กลับไปที่ Apps Script Editor
2. คลิก **Deploy** > **New deployment**
3. คลิก **⚙️ (Settings icon)** > เลือก **Web app**
4. กรอกข้อมูล:
   - **Description**: Minishop v3 API
   - **Execute as**: Me
   - **Who has access**: Anyone
5. คลิก **Deploy**
6. **คัดลอก Web App URL** 
   - รูปแบบ: `https://script.google.com/macros/s/AKfycbz.../exec`

### ขั้นตอนที่ 4: อัพเดต LIFF Endpoint

1. กลับไปที่ LINE Developers Console > LIFF
2. แก้ไข LIFF App ที่สร้างไว้
3. ใส่ **Endpoint URL** ที่คัดลอกมา
4. บันทึก

---

## การติดตั้งไฟล์ HTML/JS/CSS

### ⚠️ สำคัญมาก: แก้ไขไฟล์ config.js

เปิดไฟล์ `config.js` และแก้ไข:

```javascript
const CONFIG = {
    // LIFF ID ที่คัดลอกจาก LINE Developers
    liffId: '1234567890-abcdefgh',  // ← แก้ไขที่นี่
    
    // Web App URL ที่คัดลอกจาก Apps Script
    scriptUrl: 'https://script.google.com/macros/s/AKfycbz.../exec',  // ← แก้ไขที่นี่
    
    googleMapsKey: '',  // ไม่จำเป็น (ใช้ Haversine แทน)
};
```

### วิธีอัพโหลดไฟล์ไปที่ Apps Script

**วิธีที่ 1: ใช้ Apps Script (แนะนำ)**

1. ในหน้า Apps Script Editor
2. คลิก **➕** ข้างๆ Files > **HTML**
3. ตั้งชื่อ `index`
4. ลบโค้ดเริ่มต้น และวางโค้ดจาก `index.html`
5. ทำซ้ำสำหรับ:
   - `config.js` → สร้างเป็น **Script file**
   - `app.js` → สร้างเป็น **Script file**
   - `style.css` → สร้างเป็น **HTML file** แล้วเปลี่ยนนามสกุล

**วิธีที่ 2: Host บน GitHub Pages / Netlify**

1. สร้าง Repository ใหม่บน GitHub
2. อัพโหลดไฟล์ทั้งหมด
3. เปิดใช้ GitHub Pages
4. ใช้ URL ที่ได้เป็น LIFF Endpoint แทน

---

## การตั้งค่า Thunder API

### ขั้นตอนการขอ API Key

1. เข้า [thethunder.solutions](https://www.thethunder.solutions)
2. สมัครสมาชิก / เข้าสู่ระบบ
3. ไปที่ **API Management**
4. คลิก **Create New API Key**
5. คัดลอก API Key

### วางใน Code.gs

```javascript
const CONFIG = {
  THUNDER_API_KEY: 'sk_test_xxxxxxxxxxxxxxxx',  // ← วางที่นี่
  // ...
};
```

### ทดสอบการทำงาน

```javascript
// รันฟังก์ชันนี้ใน Apps Script Editor เพื่อทดสอบ
function testThunderAPI() {
  const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const result = verifySlipWithThunderAPI(testImage, 100);
  Logger.log(result);
}
```

---

## การตั้งค่า LINE Notify

### ขั้นตอนการขอ Token

1. เข้า [notify-bot.line.me](https://notify-bot.line.me/)
2. เข้าสู่ระบบด้วยบัญชี LINE
3. คลิก **My Page**
4. คลิก **Generate token**
5. ตั้งชื่อ: **Minishop Notification**
6. เลือกกลุ่ม/แชทที่ต้องการรับแจ้งเตือน
7. คลิก **Generate token**
8. **คัดลอก Token ทันที** (จะแสดงครั้งเดียว)

### วางใน Code.gs

```javascript
const CONFIG = {
  LINE_NOTIFY_TOKEN: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',  // ← วางที่นี่
  // ...
};
```

---

## การทดสอบระบบ

### ✅ Checklist ก่อนเปิดใช้งาน

- [ ] รัน `initialSetup()` สำเร็จแล้ว
- [ ] เพิ่มข้อมูลสินค้าใน Sheet products
- [ ] ตั้งค่า `config.js` ถูกต้อง (liffId, scriptUrl)
- [ ] ตั้งค่า Thunder API Key ใน `Code.gs`
- [ ] Deploy Apps Script เป็น Web App แล้ว
- [ ] อัพเดต LIFF Endpoint URL แล้ว

### ขั้นตอนการทดสอบ

1. **ทดสอบ LIFF**
   - เปิด LIFF URL ใน LINE App
   - ตรวจสอบว่าแสดงชื่อผู้ใช้และรูปโปรไฟล์

2. **ทดสอบโหลดสินค้า**
   - ตรวจสอบว่าสินค้าแสดงครบถ้วน
   - ทดสอบกดเพิ่มลงตะกร้า

3. **ทดสอบตะกร้า**
   - เพิ่ม/ลดจำนวนสินค้า
   - ตรวจสอบการคำนวณราคา

4. **ทดสอบการชำระเงิน**
   - อัพโหลดสลิปทดสอบ
   - ตรวจสอบว่าได้รับ LINE Notify

5. **ทดสอบ Admin**
   - เข้าสู่ระบบ Admin (รหัสผ่านเริ่มต้น: `admin123`)
   - ทดสอบเปิด/ปิดสินค้า
   - ทดสอบอัพเดตสถานะออเดอร์

---

## FAQ และแก้ไขปัญหา

### ❓ Q1: LIFF ไม่เปิด / ขึ้น Error

**A:** ตรวจสอบ:
- LIFF Endpoint URL ถูกต้องไหม
- Apps Script Deploy แล้วหรือยัง
- Scope ใน LIFF ครบไหม (profile, openid)

### ❓ Q2: สินค้าไม่แสดง

**A:** 
- ตรวจสอบว่า Sheet `products` มีข้อมูล
- เปิด Console (F12) ดู Error
- ตรวจสอบ `scriptUrl` ใน `config.js`

### ❓ Q3: ตรวจสอบสลิปไม่ผ่าน

**A:**
- ตรวจสอบ Thunder API Key ถูกต้องไหม
- ตรวจสอบ Credit ใน Thunder Account
- ดู Log ใน Apps Script: **Executions** > ดูรายละเอียด Error

### ❓ Q4: ไม่ได้รับ LINE Notify

**A:**
- ตรวจสอบ LINE_NOTIFY_TOKEN
- ตรวจสอบว่าเชิญ LINE Notify Bot เข้ากลุ่มแล้ว

### ❓ Q5: Admin Login ไม่ได้

**A:**
- รหัสผ่านเริ่มต้น: `admin123`
- แก้ไขใน Sheet `store_settings` หรือผ่านหน้า Admin

### ❓ Q6: ค่าจัดส่งผิดพลาด

**A:**
- ตรวจสอบ `shop_lat`, `shop_lng` ใน Sheet settings
- ตรวจสอบ `flat_rate`, `distance_rate`

---

## 🎉 เสร็จสิ้น!

ขอบคุณที่ใช้ **Minishop-v3**

หากต้องการความช่วยเหลือเพิ่มเติม:
- ตรวจสอบ Console Log
- ดู Execution log ใน Apps Script
- ทดสอบทีละส่วน

**Good luck! 🚀**
