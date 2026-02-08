// ===== Minishop-v3 Backend (Google Apps Script) =====

// ===== Configuration =====
const CONFIG = {
  // Thunder Solution API Configuration
  THUNDER_API_URL: 'https://api.thethunder.solutions/slipverify',
  THUNDER_API_KEY: 'YOUR_THUNDER_API_KEY_HERE', // แทนที่ด้วย API Key จริง
  
  // LINE Notify Token (สำหรับแจ้งเตือนออเดอร์ใหม่)
  LINE_NOTIFY_TOKEN: 'YOUR_LINE_NOTIFY_TOKEN_HERE', // แทนที่ด้วย Token จริง
  
  // Spreadsheet Configuration
  SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  
  // Sheet Names
  SHEETS: {
    PRODUCTS: 'products',
    ORDERS: 'orders',
    STORE_SETTINGS: 'store_settings'
  }
};

// ===== Initial Setup Function =====
/**
 * ฟังก์ชันสำหรับสร้างฐานข้อมูลเริ่มต้น
 * วิธีใช้: กดรัน initialSetup() ใน Apps Script Editor เพียงครั้งเดียว
 */
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // สร้าง Sheet: products
    createProductsSheet(ss);
    
    // สร้าง Sheet: orders
    createOrdersSheet(ss);
    
    // สร้าง Sheet: store_settings
    createStoreSettingsSheet(ss);
    
    Logger.log('✅ Initial setup completed successfully!');
    
    // แสดงข้อความยืนยัน
    SpreadsheetApp.getUi().alert(
      'สำเร็จ!',
      'ระบบสร้างฐานข้อมูลเรียบร้อยแล้ว\n\n' +
      '✓ Sheet: products\n' +
      '✓ Sheet: orders\n' +
      '✓ Sheet: store_settings\n\n' +
      'กรุณาเพิ่มข้อมูลสินค้าใน Sheet products',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    Logger.log('❌ Setup error: ' + error.toString());
    SpreadsheetApp.getUi().alert(
      'เกิดข้อผิดพลาด',
      'ไม่สามารถสร้างฐานข้อมูลได้: ' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

// ===== Create Products Sheet =====
function createProductsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  
  // ถ้ามี Sheet อยู่แล้ว ให้ลบก่อน
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  
  // สร้าง Sheet ใหม่
  sheet = ss.insertSheet(CONFIG.SHEETS.PRODUCTS);
  
  // ตั้งค่า Header
  const headers = ['id', 'name', 'price', 'stock', 'is_available', 'image', 'category'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // จัดรูปแบบ Header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2563eb');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // เพิ่มข้อมูลตัวอย่าง
  const sampleData = [
    [1, 'ข้าวสารหอมมะลิ 5 กก.', 180, 50, true, 'https://via.placeholder.com/200?text=Rice', 'อาหาร'],
    [2, 'น้ำดื่ม 6 ขวด', 25, 100, true, 'https://via.placeholder.com/200?text=Water', 'เครื่องดื่ม'],
    [3, 'สบู่ไลฟ์บอย 4 ก้อน', 45, 30, true, 'https://via.placeholder.com/200?text=Soap', 'ของใช้'],
    [4, 'นมกล่อง UHT 12 กล่อง', 120, 20, false, 'https://via.placeholder.com/200?text=Milk', 'เครื่องดื่ม']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  // ปรับความกว้างคอลัมน์
  sheet.autoResizeColumns(1, headers.length);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  Logger.log('✓ Products sheet created');
}

// ===== Create Orders Sheet =====
function createOrdersSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS);
  
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  
  sheet = ss.insertSheet(CONFIG.SHEETS.ORDERS);
  
  const headers = [
    'order_id', 'timestamp', 'customer_name', 'customer_userId', 
    'items', 'total_price', 'shipping_fee', 'address', 
    'slip_url', 'trans_ref', 'status'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#10b981');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
  
  Logger.log('✓ Orders sheet created');
}

// ===== Create Store Settings Sheet =====
function createStoreSettingsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.STORE_SETTINGS);
  
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  
  sheet = ss.insertSheet(CONFIG.SHEETS.STORE_SETTINGS);
  
  const headers = ['setting_key', 'setting_value'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#f59e0b');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // ข้อมูลเริ่มต้น
  const defaultSettings = [
    ['shop_lat', '13.7563'],     // ละติจูดร้าน (กรุงเทพฯ)
    ['shop_lng', '100.5018'],    // ลองจิจูดร้าน (กรุงเทพฯ)
    ['flat_rate', '50'],         // ค่าส่งเหมา
    ['distance_rate', '10'],     // ค่าส่งต่อกม.
    ['admin_password', 'admin123'] // รหัสผ่าน Admin (เปลี่ยนทันที!)
  ];
  
  sheet.getRange(2, 1, defaultSettings.length, 2).setValues(defaultSettings);
  sheet.autoResizeColumns(1, 2);
  sheet.setFrozenRows(1);
  
  Logger.log('✓ Store settings sheet created');
}

// ===== Web App Entry Point =====
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getProducts':
        return getProducts();
      
      case 'getSettings':
        return getSettings();
      
      case 'getOrders':
        return getOrders();
      
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    Logger.log('doGet error: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = e.parameter.action;
    
    switch(action) {
      case 'verifySlip':
        return verifySlipAndCreateOrder(data);
      
      case 'verifyAdmin':
        return verifyAdminPassword(data);
      
      case 'toggleProduct':
        return toggleProductAvailability(data);
      
      case 'updateOrderStatus':
        return updateOrderStatus(data);
      
      case 'updateSettings':
        return updateStoreSettings(data);
      
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    Logger.log('doPost error: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

// ===== Get Products =====
function getProducts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  
  if (!sheet) {
    return createResponse(false, 'Products sheet not found. Please run initialSetup()');
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    const product = {};
    headers.forEach((header, index) => {
      if (header === 'is_available') {
        product[header] = row[index] === true || row[index] === 'TRUE' || row[index] === 1;
      } else {
        product[header] = row[index];
      }
    });
    
    products.push(product);
  }
  
  return createResponse(true, 'Success', { products });
}

// ===== Get Settings =====
function getSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.STORE_SETTINGS);
  
  if (!sheet) {
    return createResponse(false, 'Settings sheet not found');
  }
  
  const data = sheet.getDataRange().getValues();
  const settings = {};
  
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    
    if (key === 'shop_lat' || key === 'shop_lng' || key === 'flat_rate' || key === 'distance_rate') {
      settings[key] = parseFloat(value);
    } else {
      settings[key] = value;
    }
  }
  
  return createResponse(true, 'Success', { settings });
}

// ===== Get Orders =====
function getOrders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS);
  
  if (!sheet) {
    return createResponse(false, 'Orders sheet not found');
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const orders = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    const order = {};
    headers.forEach((header, index) => {
      order[header] = row[index];
    });
    
    orders.push(order);
  }
  
  // เรียงจากใหม่ไปเก่า
  orders.reverse();
  
  return createResponse(true, 'Success', { orders });
}

// ===== Verify Slip and Create Order =====
function verifySlipAndCreateOrder(data) {
  try {
    // 1. ตรวจสอบสลิปด้วย Thunder API
    const slipData = verifySlipWithThunderAPI(data.image, data.expectedAmount);
    
    if (!slipData.success) {
      return createResponse(false, slipData.message || 'ตรวจสอบสลิปไม่สำเร็จ');
    }
    
    // 2. ตรวจสอบ trans_ref ซ้ำ
    if (isTransRefDuplicate(slipData.transRef)) {
      return createResponse(false, 'สลิปนี้ถูกใช้งานแล้ว');
    }
    
    // 3. สร้างออเดอร์
    const orderId = createOrder(data, slipData);
    
    // 4. ส่ง LINE Notify
    sendLineNotification(orderId, data);
    
    return createResponse(true, 'ชำระเงินสำเร็จ', { orderId });
    
  } catch (error) {
    Logger.log('Verify slip error: ' + error.toString());
    return createResponse(false, 'เกิดข้อผิดพลาด: ' + error.toString());
  }
}

// ===== Verify Slip with Thunder API =====
function verifySlipWithThunderAPI(base64Image, expectedAmount) {
  try {
    const payload = {
      files: [base64Image]
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${CONFIG.THUNDER_API_KEY}`
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(CONFIG.THUNDER_API_URL, options);
    const result = JSON.parse(response.getContentText());
    
    Logger.log('Thunder API Response: ' + JSON.stringify(result));
    
    // ตรวจสอบผลลัพธ์
    if (result.status === 'success' && result.data && result.data.length > 0) {
      const slipInfo = result.data[0];
      
      // ตรวจสอบยอดเงิน
      const amount = parseFloat(slipInfo.amount || 0);
      
      if (Math.abs(amount - expectedAmount) > 1) { // อนุญาตให้ต่างไม่เกิน 1 บาท
        return {
          success: false,
          message: `ยอดเงินไม่ตรงกับที่ต้องชำระ (ในสลิป: ${amount} บาท, ต้องชำระ: ${expectedAmount} บาท)`
        };
      }
      
      return {
        success: true,
        transRef: slipInfo.transRef || slipInfo.ref || Date.now().toString(),
        amount: amount,
        date: slipInfo.date || new Date().toISOString()
      };
      
    } else {
      return {
        success: false,
        message: 'ไม่สามารถอ่านข้อมูลจากสลิปได้'
      };
    }
    
  } catch (error) {
    Logger.log('Thunder API error: ' + error.toString());
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสลิป'
    };
  }
}

// ===== Check Duplicate Trans Ref =====
function isTransRefDuplicate(transRef) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS);
  
  if (!sheet) return false;
  
  const data = sheet.getDataRange().getValues();
  const transRefCol = data[0].indexOf('trans_ref');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][transRefCol] === transRef) {
      return true;
    }
  }
  
  return false;
}

// ===== Create Order =====
function createOrder(data, slipData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS);
  
  const orderId = 'ORD' + Date.now();
  const timestamp = new Date().toLocaleString('th-TH');
  
  // Upload slip image to Drive (optional)
  const slipUrl = uploadSlipToDrive(data.image, orderId);
  
  // จัดรูปแบบ items
  const itemsText = data.cart.map(item => 
    `${item.name} x${item.quantity} (฿${item.price})`
  ).join(', ');
  
  // จัดรูปแบบ address
  let addressText = '';
  if (data.address) {
    if (data.address.type === 'pin') {
      addressText = `พิกัด: ${data.address.lat}, ${data.address.lng}`;
    } else {
      addressText = data.address.address || '';
    }
  }
  
  const newRow = [
    orderId,
    timestamp,
    data.customer.name,
    data.customer.userId,
    itemsText,
    data.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    data.shippingFee || 0,
    addressText,
    slipUrl,
    slipData.transRef,
    'pending'
  ];
  
  sheet.appendRow(newRow);
  
  return orderId;
}

// ===== Upload Slip to Drive =====
function uploadSlipToDrive(base64Image, orderId) {
  try {
    // สร้างโฟลเดอร์ slips ใน Drive (ถ้ายังไม่มี)
    const folders = DriveApp.getFoldersByName('Minishop_Slips');
    let folder;
    
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('Minishop_Slips');
    }
    
    // แปลง base64 เป็น blob
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Image),
      'image/jpeg',
      `slip_${orderId}.jpg`
    );
    
    // อัพโหลดไฟล์
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
    
  } catch (error) {
    Logger.log('Upload slip error: ' + error.toString());
    return '';
  }
}

// ===== Send LINE Notification =====
function sendLineNotification(orderId, data) {
  if (!CONFIG.LINE_NOTIFY_TOKEN || CONFIG.LINE_NOTIFY_TOKEN === 'YOUR_LINE_NOTIFY_TOKEN_HERE') {
    Logger.log('LINE Notify token not configured');
    return;
  }
  
  try {
    const itemsText = data.cart.map(item => 
      `• ${item.name} x${item.quantity}`
    ).join('\n');
    
    const total = data.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grandTotal = total + (data.shippingFee || 0);
    
    const message = `
🛍️ ออเดอร์ใหม่! #${orderId}

👤 ลูกค้า: ${data.customer.name}

📦 สินค้า:
${itemsText}

💰 ยอดรวม: ฿${grandTotal.toLocaleString()}
   (สินค้า ฿${total.toLocaleString()} + ค่าส่ง ฿${data.shippingFee || 0})

📍 ที่อยู่: ${data.address.type === 'pin' ? 'ปักหมุด' : 'พิมพ์ที่อยู่'}
    `.trim();
    
    const options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CONFIG.LINE_NOTIFY_TOKEN}`
      },
      payload: {
        message: message
      },
      muteHttpExceptions: true
    };
    
    UrlFetchApp.fetch('https://notify-api.line.me/api/notify', options);
    
  } catch (error) {
    Logger.log('LINE Notify error: ' + error.toString());
  }
}

// ===== Verify Admin Password =====
function verifyAdminPassword(data) {
  const settingsResponse = getSettings();
  const settings = JSON.parse(settingsResponse.getContent()).settings;
  
  if (data.password === settings.admin_password) {
    return createResponse(true, 'Login successful');
  } else {
    return createResponse(false, 'Invalid password');
  }
}

// ===== Toggle Product Availability =====
function toggleProductAvailability(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  
  const dataRange = sheet.getDataRange().getValues();
  const idCol = dataRange[0].indexOf('id');
  const availCol = dataRange[0].indexOf('is_available');
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][idCol] == data.productId) {
      sheet.getRange(i + 1, availCol + 1).setValue(data.isAvailable);
      return createResponse(true, 'Updated');
    }
  }
  
  return createResponse(false, 'Product not found');
}

// ===== Update Order Status =====
function updateOrderStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS);
  
  const dataRange = sheet.getDataRange().getValues();
  const orderIdCol = dataRange[0].indexOf('order_id');
  const statusCol = dataRange[0].indexOf('status');
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][orderIdCol] === data.orderId) {
      sheet.getRange(i + 1, statusCol + 1).setValue(data.status);
      return createResponse(true, 'Updated');
    }
  }
  
  return createResponse(false, 'Order not found');
}

// ===== Update Store Settings =====
function updateStoreSettings(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.STORE_SETTINGS);
  
  const dataRange = sheet.getDataRange().getValues();
  
  Object.keys(data).forEach(key => {
    let found = false;
    
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(data[key]);
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([key, data[key]]);
    }
  });
  
  return createResponse(true, 'Settings updated');
}

// ===== Helper: Create Response =====
function createResponse(success, message, data = {}) {
  const response = {
    success: success,
    message: message,
    ...data
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
