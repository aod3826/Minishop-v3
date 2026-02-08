// ===== Global Variables =====
let userProfile = null;
let products = [];
let cart = [];
let storeSettings = {};
let currentLocation = null;
let selectedSlipFile = null;
let isAdmin = false;

// ===== Initialize LIFF =====
async function initializeLiff() {
    try {
        await liff.init({ liffId: CONFIG.liffId });
        
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }
        
        userProfile = await liff.getProfile();
        displayUserInfo();
        
        // Check if user is admin (simple check - can be enhanced)
        checkAdminStatus();
        
        await loadProducts();
        await loadStoreSettings();
        
    } catch (error) {
        console.error('LIFF Initialization failed:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเชื่อมต่อกับระบบได้',
            confirmButtonColor: '#2563eb'
        });
    }
}

// ===== Display User Information =====
function displayUserInfo() {
    if (userProfile) {
        document.getElementById('userName').textContent = userProfile.displayName;
        const userPicture = document.getElementById('userPicture');
        if (userProfile.pictureUrl) {
            userPicture.src = userProfile.pictureUrl;
            userPicture.classList.remove('hidden');
        }
    }
}

// ===== Check Admin Status =====
function checkAdminStatus() {
    // Simple check - you can enhance this with LINE User ID verification
    const adminBtn = document.getElementById('adminBtn');
    // For demo, show admin button to all users
    // In production, check against specific LINE User IDs
    adminBtn.classList.remove('hidden');
}

// ===== Load Products from Server =====
async function loadProducts() {
    try {
        const response = await fetch(`${CONFIG.scriptUrl}?action=getProducts`);
        const data = await response.json();
        
        if (data.success) {
            products = data.products;
            displayProducts(products);
            displayCategories();
        } else {
            throw new Error(data.message || 'ไม่สามารถโหลดสินค้าได้');
        }
    } catch (error) {
        console.error('Load products error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดรายการสินค้าได้',
            confirmButtonColor: '#2563eb'
        });
    }
}

// ===== Load Store Settings =====
async function loadStoreSettings() {
    try {
        const response = await fetch(`${CONFIG.scriptUrl}?action=getSettings`);
        const data = await response.json();
        
        if (data.success) {
            storeSettings = data.settings;
        }
    } catch (error) {
        console.error('Load settings error:', error);
    }
}

// ===== Display Categories =====
function displayCategories() {
    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
    const categoryFilter = document.getElementById('categoryFilter').querySelector('.flex');
    
    categoryFilter.innerHTML = categories.map(cat => `
        <button class="category-btn ${cat === 'all' ? 'active' : ''} px-4 py-2 rounded-full whitespace-nowrap" 
                data-category="${cat}">
            ${cat === 'all' ? 'ทั้งหมด' : cat}
        </button>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active', 'bg-blue-600', 'text-white'));
            this.classList.add('active', 'bg-blue-600', 'text-white');
            
            const category = this.dataset.category;
            const filtered = category === 'all' ? products : products.filter(p => p.category === category);
            displayProducts(filtered);
        });
    });
}

// ===== Display Products =====
function displayProducts(productList) {
    const grid = document.getElementById('productsGrid');
    
    if (productList.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full empty-state">
                <i class="fas fa-box-open"></i>
                <p class="text-lg font-semibold mt-4">ไม่มีสินค้าในหมวดหมู่นี้</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = productList.map(product => `
        <div class="product-card ${!product.is_available ? 'unavailable' : ''}" 
             onclick="${product.is_available ? `addToCart(${product.id})` : ''}">
            <div class="relative">
                <img src="${product.image || 'https://via.placeholder.com/200'}" 
                     alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                ${!product.is_available ? '<div class="product-badge">ไม่พร้อมขาย</div>' : ''}
                ${product.stock <= 5 && product.is_available ? `<div class="product-badge" style="background: #f59e0b;">เหลือ ${product.stock}</div>` : ''}
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-800 mb-1 line-clamp-2">${product.name}</h3>
                <p class="text-blue-600 font-bold text-lg">฿${product.price.toLocaleString()}</p>
                ${product.is_available ? `
                    <button class="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition" 
                            onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="fas fa-cart-plus mr-2"></i>เพิ่มลงตะกร้า
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// ===== Cart Functions =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.is_available) return;
    
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        if (cartItem.quantity >= product.stock) {
            Swal.fire({
                icon: 'warning',
                title: 'สินค้าไม่เพียงพอ',
                text: `มีสินค้าในสต็อกเพียง ${product.stock} ชิ้น`,
                confirmButtonColor: '#2563eb'
            });
            return;
        }
        cartItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            stock: product.stock
        });
    }
    
    updateCartUI();
    
    // Show toast
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
    
    Toast.fire({
        icon: 'success',
        title: 'เพิ่มสินค้าลงตะกร้าแล้ว'
    });
}

function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const shippingFeeEl = document.getElementById('shippingFee');
    const totalPriceEl = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state py-8">
                <i class="fas fa-shopping-cart"></i>
                <p class="text-lg font-semibold mt-4">ตะกร้าสินค้าว่างเปล่า</p>
            </div>
        `;
        subtotalEl.textContent = '฿0';
        shippingFeeEl.textContent = '฿0';
        totalPriceEl.textContent = '฿0';
        checkoutBtn.disabled = true;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
            <div class="cart-item-info">
                <p class="font-semibold text-gray-800">${item.name}</p>
                <p class="text-blue-600 font-bold">฿${item.price.toLocaleString()}</p>
            </div>
            <div class="cart-item-controls">
                <button class="bg-red-100 text-red-600 hover:bg-red-200" onclick="updateCartQuantity(${item.id}, -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="font-semibold text-gray-800 w-8 text-center">${item.quantity}</span>
                <button class="bg-green-100 text-green-600 hover:bg-green-200" onclick="updateCartQuantity(${item.id}, 1)">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = currentLocation ? calculateShippingFee(currentLocation) : (storeSettings.flat_rate || 0);
    const total = subtotal + shippingFee;
    
    subtotalEl.textContent = `฿${subtotal.toLocaleString()}`;
    shippingFeeEl.textContent = `฿${shippingFee.toLocaleString()}`;
    totalPriceEl.textContent = `฿${total.toLocaleString()}`;
    checkoutBtn.disabled = false;
}

function updateCartQuantity(productId, change) {
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;
    
    cartItem.quantity += change;
    
    if (cartItem.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    } else if (cartItem.quantity > cartItem.stock) {
        cartItem.quantity = cartItem.stock;
        Swal.fire({
            icon: 'warning',
            title: 'สินค้าไม่เพียงพอ',
            text: `มีสินค้าในสต็อกเพียง ${cartItem.stock} ชิ้น`,
            confirmButtonColor: '#2563eb'
        });
    }
    
    updateCartUI();
    displayCart();
}

// ===== Shipping Calculation =====
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
}

function calculateShippingFee(location) {
    if (!storeSettings.shop_lat || !storeSettings.shop_lng) {
        return storeSettings.flat_rate || 50;
    }
    
    const distance = calculateDistance(
        storeSettings.shop_lat,
        storeSettings.shop_lng,
        location.lat,
        location.lng
    );
    
    const fee = Math.ceil(distance * (storeSettings.distance_rate || 10));
    return Math.max(fee, storeSettings.flat_rate || 30);
}

// ===== Location Functions =====
async function getUserLocation() {
    Swal.fire({
        title: 'กำลังดึงตำแหน่ง...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        if (liff.isApiAvailable('shareTargetPicker')) {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
            
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                type: 'pin'
            };
            
            const locationStatus = document.getElementById('locationStatus');
            locationStatus.textContent = `📍 พิกัด: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`;
            locationStatus.classList.remove('hidden');
            
            document.getElementById('confirmAddressBtn').disabled = false;
            
            Swal.fire({
                icon: 'success',
                title: 'ดึงตำแหน่งสำเร็จ',
                text: 'ระบบจะคำนวณค่าจัดส่งตามระยะทาง',
                confirmButtonColor: '#2563eb'
            });
            
        } else {
            throw new Error('ไม่รองรับการดึงตำแหน่ง');
        }
    } catch (error) {
        console.error('Location error:', error);
        Swal.fire({
            icon: 'error',
            title: 'ไม่สามารถดึงตำแหน่งได้',
            text: 'กรุณาเลือกพิมพ์ที่อยู่แทน',
            confirmButtonColor: '#2563eb'
        });
    }
}

// ===== Payment Functions =====
async function processPayment() {
    if (!selectedSlipFile) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณาอัพโหลดสลิป',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    Swal.fire({
        title: 'กำลังตรวจสอบสลิป...',
        html: 'โปรดรอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // Convert image to base64
        const base64 = await fileToBase64(selectedSlipFile);
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = currentLocation && currentLocation.type === 'pin' 
            ? calculateShippingFee(currentLocation) 
            : (storeSettings.flat_rate || 0);
        const total = subtotal + shippingFee;
        
        // Call server to verify slip
        const response = await fetch(`${CONFIG.scriptUrl}?action=verifySlip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64,
                expectedAmount: total,
                cart: cart,
                customer: {
                    name: userProfile.displayName,
                    userId: userProfile.userId,
                    pictureUrl: userProfile.pictureUrl
                },
                address: currentLocation,
                shippingFee: shippingFee
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear cart
            cart = [];
            updateCartUI();
            selectedSlipFile = null;
            currentLocation = null;
            
            // Close modals
            document.getElementById('paymentModal').classList.add('hidden');
            document.getElementById('addressModal').classList.add('hidden');
            document.getElementById('cartModal').classList.add('hidden');
            
            Swal.fire({
                icon: 'success',
                title: 'ชำระเงินสำเร็จ!',
                html: `
                    <p class="mb-2">หมายเลขออเดอร์: <strong>${data.orderId}</strong></p>
                    <p class="text-sm text-gray-600">ขอบคุณที่ใช้บริการ</p>
                `,
                confirmButtonColor: '#10b981'
            });
            
        } else {
            throw new Error(data.message || 'ตรวจสอบสลิปไม่สำเร็จ');
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.message || 'ไม่สามารถดำเนินการชำระเงินได้',
            confirmButtonColor: '#ef4444'
        });
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ===== Admin Functions =====
async function loginAdmin() {
    const { value: password } = await Swal.fire({
        title: 'Admin Login',
        input: 'password',
        inputLabel: 'รหัสผ่าน',
        inputPlaceholder: 'ใส่รหัสผ่าน Admin',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'เข้าสู่ระบบ',
        cancelButtonText: 'ยกเลิก'
    });
    
    if (password) {
        try {
            const response = await fetch(`${CONFIG.scriptUrl}?action=verifyAdmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                isAdmin = true;
                document.getElementById('adminModal').classList.remove('hidden');
                loadAdminData();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'รหัสผ่านไม่ถูกต้อง',
                    confirmButtonColor: '#ef4444'
                });
            }
        } catch (error) {
            console.error('Admin login error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                confirmButtonColor: '#ef4444'
            });
        }
    }
}

async function loadAdminData() {
    loadAdminProducts();
    loadAdminOrders();
    loadAdminSettings();
}

async function loadAdminProducts() {
    const list = document.getElementById('adminProductsList');
    list.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div></div>';
    
    await loadProducts();
    
    list.innerHTML = products.map(product => `
        <div class="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <img src="${product.image || 'https://via.placeholder.com/50'}" 
                     alt="${product.name}" 
                     class="w-12 h-12 rounded-lg object-cover">
                <div>
                    <p class="font-semibold text-gray-800">${product.name}</p>
                    <p class="text-sm text-gray-600">฿${product.price} | สต็อก: ${product.stock}</p>
                </div>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" ${product.is_available ? 'checked' : ''} 
                       onchange="toggleProductAvailability(${product.id}, this.checked)">
                <span class="toggle-slider"></span>
            </label>
        </div>
    `).join('');
}

async function toggleProductAvailability(productId, isAvailable) {
    try {
        const response = await fetch(`${CONFIG.scriptUrl}?action=toggleProduct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, isAvailable })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
            
            Toast.fire({
                icon: 'success',
                title: 'อัพเดตสำเร็จ'
            });
            
            await loadProducts();
            displayProducts(products);
        }
    } catch (error) {
        console.error('Toggle product error:', error);
    }
}

async function loadAdminOrders() {
    const list = document.getElementById('adminOrdersList');
    list.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div></div>';
    
    try {
        const response = await fetch(`${CONFIG.scriptUrl}?action=getOrders`);
        const data = await response.json();
        
        if (data.success && data.orders.length > 0) {
            list.innerHTML = data.orders.map(order => `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-semibold text-gray-800">Order #${order.order_id}</p>
                            <p class="text-sm text-gray-600">${order.customer_name}</p>
                            <p class="text-sm text-gray-500">${order.timestamp}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }">
                            ${order.status === 'success' ? 'สำเร็จ' : 'รอดำเนินการ'}
                        </span>
                    </div>
                    <div class="text-sm text-gray-600 mb-2">
                        <p>ยอดรวม: ฿${order.total_price}</p>
                        <p>ค่าส่ง: ฿${order.shipping_fee}</p>
                    </div>
                    ${order.status !== 'success' ? `
                        <button onclick="updateOrderStatus('${order.order_id}', 'success')" 
                                class="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
                            <i class="fas fa-check mr-1"></i>ทำเครื่องเสร็จ
                        </button>
                    ` : ''}
                    ${order.slip_url ? `
                        <a href="${order.slip_url}" target="_blank" 
                           class="block w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition text-center mt-2">
                            <i class="fas fa-receipt mr-1"></i>ดูสลิป
                        </a>
                    ` : ''}
                </div>
            `).join('');
        } else {
            list.innerHTML = `
                <div class="empty-state py-8">
                    <i class="fas fa-receipt"></i>
                    <p class="text-lg font-semibold mt-4">ยังไม่มีออเดอร์</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load orders error:', error);
        list.innerHTML = '<p class="text-center text-red-600">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${CONFIG.scriptUrl}?action=updateOrderStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId, status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'อัพเดตสำเร็จ',
                confirmButtonColor: '#10b981',
                timer: 2000
            });
            loadAdminOrders();
        }
    } catch (error) {
        console.error('Update order error:', error);
    }
}

async function loadAdminSettings() {
    await loadStoreSettings();
    
    document.getElementById('shopLatInput').value = storeSettings.shop_lat || '';
    document.getElementById('shopLngInput').value = storeSettings.shop_lng || '';
    document.getElementById('flatRateInput').value = storeSettings.flat_rate || '';
    document.getElementById('distanceRateInput').value = storeSettings.distance_rate || '';
}

async function saveSettings() {
    const settings = {
        shop_lat: parseFloat(document.getElementById('shopLatInput').value),
        shop_lng: parseFloat(document.getElementById('shopLngInput').value),
        flat_rate: parseFloat(document.getElementById('flatRateInput').value),
        distance_rate: parseFloat(document.getElementById('distanceRateInput').value),
        admin_password: document.getElementById('adminPasswordInput').value
    };
    
    try {
        const response = await fetch(`${CONFIG.scriptUrl}?action=updateSettings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ',
                confirmButtonColor: '#10b981'
            });
            await loadStoreSettings();
        }
    } catch (error) {
        console.error('Save settings error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            confirmButtonColor: '#ef4444'
        });
    }
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize LIFF
    initializeLiff();
    
    // Cart Button
    document.getElementById('cartBtn').addEventListener('click', function() {
        displayCart();
        document.getElementById('cartModal').classList.remove('hidden');
    });
    
    document.getElementById('closeCartBtn').addEventListener('click', function() {
        document.getElementById('cartModal').classList.add('hidden');
    });
    
    // Checkout Button
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        if (cart.length === 0) return;
        document.getElementById('addressModal').classList.remove('hidden');
    });
    
    // Address Mode Toggle
    document.getElementById('usePinBtn').addEventListener('click', function() {
        this.classList.add('border-blue-600', 'text-blue-600');
        this.classList.remove('border-gray-300', 'text-gray-600');
        document.getElementById('useTextBtn').classList.remove('border-blue-600', 'text-blue-600');
        document.getElementById('useTextBtn').classList.add('border-gray-300', 'text-gray-600');
        
        document.getElementById('pinSection').classList.remove('hidden');
        document.getElementById('textSection').classList.add('hidden');
        currentLocation = null;
        document.getElementById('confirmAddressBtn').disabled = true;
    });
    
    document.getElementById('useTextBtn').addEventListener('click', function() {
        this.classList.add('border-blue-600', 'text-blue-600');
        this.classList.remove('border-gray-300', 'text-gray-600');
        document.getElementById('usePinBtn').classList.remove('border-blue-600', 'text-blue-600');
        document.getElementById('usePinBtn').classList.add('border-gray-300', 'text-gray-600');
        
        document.getElementById('pinSection').classList.add('hidden');
        document.getElementById('textSection').classList.remove('hidden');
        currentLocation = null;
        document.getElementById('confirmAddressBtn').disabled = true;
    });
    
    // Get Location
    document.getElementById('getLocationBtn').addEventListener('click', getUserLocation);
    
    // Address Text Input
    document.getElementById('addressText').addEventListener('input', function() {
        const hasText = this.value.trim().length > 10;
        document.getElementById('confirmAddressBtn').disabled = !hasText;
        
        if (hasText) {
            currentLocation = {
                type: 'text',
                address: this.value.trim()
            };
        }
    });
    
    // Confirm Address
    document.getElementById('confirmAddressBtn').addEventListener('click', function() {
        document.getElementById('addressModal').classList.add('hidden');
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = currentLocation && currentLocation.type === 'pin' 
            ? calculateShippingFee(currentLocation) 
            : (storeSettings.flat_rate || 0);
        const total = subtotal + shippingFee;
        
        document.getElementById('paymentAmount').textContent = `฿${total.toLocaleString()}`;
        document.getElementById('paymentModal').classList.remove('hidden');
    });
    
    document.getElementById('cancelAddressBtn').addEventListener('click', function() {
        document.getElementById('addressModal').classList.add('hidden');
        currentLocation = null;
    });
    
    // Slip Upload
    document.getElementById('slipInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            selectedSlipFile = file;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('slipImage').src = e.target.result;
                document.getElementById('slipPreview').classList.remove('hidden');
                document.getElementById('submitPaymentBtn').disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('removeSlipBtn').addEventListener('click', function() {
        selectedSlipFile = null;
        document.getElementById('slipInput').value = '';
        document.getElementById('slipPreview').classList.add('hidden');
        document.getElementById('submitPaymentBtn').disabled = true;
    });
    
    // Submit Payment
    document.getElementById('submitPaymentBtn').addEventListener('click', processPayment);
    
    document.getElementById('cancelPaymentBtn').addEventListener('click', function() {
        document.getElementById('paymentModal').classList.add('hidden');
        selectedSlipFile = null;
        document.getElementById('slipInput').value = '';
        document.getElementById('slipPreview').classList.add('hidden');
    });
    
    // Admin Button
    document.getElementById('adminBtn').addEventListener('click', loginAdmin);
    
    document.getElementById('closeAdminBtn').addEventListener('click', function() {
        document.getElementById('adminModal').classList.add('hidden');
    });
    
    // Admin Tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.admin-tab').forEach(t => {
                t.classList.remove('active', 'text-blue-600', 'border-blue-600');
                t.classList.add('text-gray-600');
            });
            this.classList.add('active', 'text-blue-600', 'border-blue-600');
            this.classList.remove('text-gray-600');
            
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(this.dataset.tab + 'Tab').classList.remove('hidden');
        });
    });
    
    // Save Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
});
