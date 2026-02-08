// ===== Configuration File =====
// กรุณาแก้ไขค่าเหล่านี้ให้ตรงกับข้อมูลของคุณ

const CONFIG = {
    // LIFF ID จาก LINE Developers Console
    liffId: 'YOUR_LIFF_ID_HERE',
    
    // Google Apps Script Web App URL
    scriptUrl: 'YOUR_SCRIPT_URL_HERE',
    
    // Google Maps API Key (ถ้ามี - ไม่จำเป็นสำหรับการคำนวณระยะทางแบบ Haversine)
    googleMapsKey: '',
    
    // Thunder Solution API Configuration (ตั้งค่าที่ Code.gs แทน - นี่คือตัวอย่าง)
    // thunderApi: {
    //     baseUrl: 'https://api.thethunder.solutions/slipverify',
    //     apiKey: 'YOUR_THUNDER_API_KEY'
    // }
};

// ตรวจสอบการตั้งค่า
if (CONFIG.liffId === 'YOUR_LIFF_ID_HERE' || CONFIG.scriptUrl === 'YOUR_SCRIPT_URL_HERE') {
    console.warn('⚠️ กรุณาตั้งค่า LIFF ID และ Script URL ในไฟล์ config.js');
}
