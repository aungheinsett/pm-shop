// ===== STATE =====
let token = localStorage.getItem('pm_token');
let currentUser = JSON.parse(localStorage.getItem('pm_user') || 'null');
let currentPage = 'dashboard';
const state = {
  products: { page: 1, totalPages: 1, search: '', category: '', selected: new Set() },
  orders: { page: 1, totalPages: 1, search: '', status: '' },
  categories: [],
  users: []
};

// ===== API HELPER =====
async function api(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({ error: 'Invalid response' }));

  if (!res.ok) {
    if (res.status === 401 && window.location.pathname !== '/admin/login') {
      handleLogout();
    }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

// ===== AUTH CHECK =====
function checkAuth() {
  if (!token) {
    window.location.href = '/admin/login';
    return false;
  }
  return true;
}

async function verifyAuth() {
  try {
    await api('/api/auth/me');
    return true;
  } catch {
    handleLogout();
    return false;
  }
}

function handleLogout() {
  localStorage.removeItem('pm_token');
  localStorage.removeItem('pm_user');
  if (!window.location.href.includes('/admin/login')) {
    window.location.href = '/admin/login';
  }
}

// ===== TOAST =====
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== NAVIGATION =====
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navigateTo(link.dataset.page));
});

function navigateTo(page) {
  if (!checkAuth()) return;

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('active');
  document.getElementById('sidebarOverlay').classList.remove('active');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  const navEl = document.querySelector(`[data-page="${page}"]`);
  if (!pageEl || !navEl) return;

  pageEl.classList.add('active');
  navEl.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', products: 'Products', categories: 'Categories',
    banners: 'Hero Banners', orders: 'Orders', settings: 'Settings', users: 'Staff Users'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;
  currentPage = page;

  loadPageData(page);
}

async function loadPageData(page) {
  switch (page) {
    case 'dashboard': loadDashboard(); break;
    case 'products': loadProducts(); break;
    case 'categories': loadCategories(); break;
    case 'banners': loadBanners(); break;
    case 'orders': loadOrders(); break;
    case 'settings': loadSettings(); break;
    case 'users': loadUsers(); break;
  }
}

// ===== DASHBOARD =====
let revenueChart = null;
let categoryChart = null;

async function loadDashboard() {
  try {
    showLoadingStats();
    const [stats, revenue, catSales, recent, top] = await Promise.all([
      api('/api/dashboard/stats'),
      api('/api/dashboard/revenue-chart'),
      api('/api/dashboard/category-sales'),
      api('/api/dashboard/recent-orders'),
      api('/api/dashboard/top-products')
    ]);

    renderStats(stats.stats);
    renderRevenueChart(revenue.chartData);
    renderCategoryChart(catSales.data);
    renderRecentOrders(recent.orders);
    renderTopProducts(top.data);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showLoadingStats() {
  document.getElementById('statRevenue').textContent = '...';
  document.getElementById('statOrders').textContent = '...';
  document.getElementById('statProducts').textContent = '...';
  document.getElementById('statCustomers').textContent = '...';
}

function formatMMK(n) {
  return Number(n || 0).toLocaleString() + ' MMK';
}

function renderStats(stats) {
  document.getElementById('statRevenue').textContent = formatMMK(stats.totalRevenueMmk);
  document.getElementById('statOrders').textContent = stats.totalOrders;
  document.getElementById('statProducts').textContent = stats.totalProducts;
  document.getElementById('statCustomers').textContent = stats.totalCustomers;
  document.getElementById('statWeek').textContent = formatMMK(stats.weeklyRevenueMmk);
  document.getElementById('statMonth').textContent = formatMMK(stats.monthRevenueMmk);
  document.getElementById('statPending').textContent = stats.pendingOrders;
}

function renderRevenueChart(chartData) {
  if (revenueChart) revenueChart.destroy();
  const ctx = document.getElementById('revenueChart').getContext('2d');
  revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.map(d => d.label),
      datasets: [{
        label: 'Revenue (MMK)',
        data: chartData.map(d => d.revenue),
        backgroundColor: 'rgba(192, 57, 43, 0.7)',
        borderColor: '#c0392b',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => formatMMK(ctx.raw)
          }
        }
      },
      scales: {
        y: {
          ticks: { callback: (v) => (v / 1000) + 'k' },
          grid: { color: '#f0ebe4' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderCategoryChart(data) {
  if (categoryChart) categoryChart.destroy();
  const ctx = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.total),
        backgroundColor: ['#c0392b', '#e74c3c', '#f1948a', '#a93226', '#28a745', '#7a5555', '#fd7e14', '#6610f2'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.label}: ${formatMMK(ctx.raw)}` }
        }
      }
    }
  });
}

function renderRecentOrders(orders) {
  const body = document.getElementById('recentOrdersBody');
  if (!orders || orders.length === 0) {
    body.innerHTML = '<tr><td colspan="5" class="empty">No orders yet</td></tr>';
    return;
  }
  body.innerHTML = orders.map(o => `
    <tr onclick="openOrderDetail('${o._id}')" style="cursor:pointer;">
      <td class="product-name-main">${o.orderNumber}</td>
      <td>${o.customer.name}<br><small class="product-sku">${o.customer.phone}</small></td>
      <td class="product-name-main">${formatMMK(o.totalMmk)}</td>
      <td><span class="status-badge status-${o.orderStatus}">${capitalize(o.orderStatus)}</span></td>
      <td>${formatDate(o.createdAt)}</td>
    </tr>
  `).join('');
}

function renderTopProducts(data) {
  const body = document.getElementById('topProductsBody');
  if (!data || data.length === 0) {
    body.innerHTML = '<tr><td colspan="4" class="empty">No sales data yet</td></tr>';
    return;
  }
  body.innerHTML = data.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="product-name-main">${p.name}</td>
      <td>${p.totalSold}</td>
      <td>${formatMMK(p.revenue)}</td>
    </tr>
  `).join('');
}

// ===== PRODUCTS =====
async function loadProducts() {
  try {
    const params = new URLSearchParams({
      page: state.products.page,
      limit: 10,
      isAdmin: 'true'
    });
    if (state.products.search) params.append('search', state.products.search);
    if (state.products.category) params.append('categoryId', state.products.category);

    const data = await api(`/api/products?${params}`);
    state.products.page = data.page;
    state.products.totalPages = data.totalPages || 1;

    document.getElementById('navProductCount').textContent = data.total;

    // Populate category filter if empty
    const catFilter = document.getElementById('productCategoryFilter');
    if (catFilter.options.length <= 1) {
      await loadCategoryOptionsFlat(catFilter);
    }

    const body = document.getElementById('productsBody');
    if (!data.products || data.products.length === 0) {
      body.innerHTML = '<tr><td colspan="8" class="empty">No products found</td></tr>';
    } else {
      body.innerHTML = data.products.map(p => `
        <tr>
          <td><input type="checkbox" class="product-check" value="${p._id}" ${state.products.selected.has(p._id) ? 'checked' : ''}></td>
          <td>
            <div class="product-cell">
              <div class="product-thumb">${p.images && p.images[0] ? `<img src="${p.images[0].url}" alt="">` : `<i class="${p.icon || 'fas fa-box'}"></i>`}</div>
              <div>
                <div class="product-name-main">${p.name}</div>
                <div class="product-sku">SKU: ${p.sku || 'N/A'} ${p.isFeatured ? '⭐' : ''}</div>
              </div>
            </div>
          </td>
          <td>${p.category?.name || 'N/A'}</td>
          <td class="product-name-main">${formatMMK(p.priceMmk)}</td>
          <td>฿${(p.priceBaht || 0).toLocaleString()}</td>
          <td>${p.stock}</td>
          <td>
            <span class="status-badge status-${p.isActive ? 'true' : 'false'}">${p.isActive ? 'Active' : 'Inactive'}</span>
          </td>
          <td>
            <button class="btn btn-icon btn-edit" onclick="openProductModal('${p._id}')" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-icon btn-view" onclick="toggleProductStatus('${p._id}')" title="Toggle Status"><i class="fas ${p.isActive ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
            <button class="btn btn-icon btn-delete" onclick="deleteProduct('${p._id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }

    renderPagination('productsPagination', state.products.page, state.products.totalPages, (page) => {
      state.products.page = page;
      loadProducts();
    });

    updateBulkDeleteBtn();
    bindSelectAll();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadCategoryOptionsFlat(select) {
  try {
    const data = await api('/api/categories?includeInactive=true');
    select.innerHTML = '<option value="">All Categories</option>' +
      data.categories.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
  } catch {}
}

function bindSelectAll() {
  const selectAll = document.getElementById('selectAllProducts');
  const checkboxes = document.querySelectorAll('.product-check');
  if (selectAll) {
    selectAll.checked = checkboxes.length > 0 && checkboxes.length === state.products.selected.size;
    selectAll.onchange = () => {
      checkboxes.forEach(cb => {
        cb.checked = selectAll.checked;
        if (selectAll.checked) state.products.selected.add(cb.value);
        else state.products.selected.delete(cb.value);
      });
      updateBulkDeleteBtn();
    };
  }
  checkboxes.forEach(cb => {
    cb.onchange = () => {
      if (cb.checked) state.products.selected.add(cb.value);
      else state.products.selected.delete(cb.value);
      updateBulkDeleteBtn();
    };
  });
}

function updateBulkDeleteBtn() {
  document.getElementById('bulkDeleteBtn').style.display = state.products.selected.size > 0 ? '' : 'none';
}

async function bulkDeleteProducts() {
  if (!confirm(`Delete ${state.products.selected.size} products?`)) return;
  try {
    await api('/api/products/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ ids: [...state.products.selected] })
    });
    state.products.selected.clear();
    showToast('Products deleted');
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Product Modal
async function openProductModal(id = null) {
  await loadCategoryOptionsFlat(document.getElementById('pCategory'));
  document.getElementById('productModalTitle').textContent = id ? 'Edit Product' : 'Add Product';
  document.getElementById('productForm').reset();
  document.getElementById('pId').value = id || '';
  document.getElementById('pFeatured').value = 'false';

  if (id) {
    try {
      const data = await api(`/api/products/${id}`);
      const p = data.product;
      document.getElementById('pId').value = p._id;
      document.getElementById('pName').value = p.name;
      document.getElementById('pCategory').value = p.category._id || p.category;
      document.getElementById('pIcon').value = p.icon || '';
      document.getElementById('pPriceMmk').value = p.priceMmk;
      document.getElementById('pPriceBaht').value = p.priceBaht || 0;
      document.getElementById('pStock').value = p.stock;
      document.getElementById('pFeatured').value = p.isFeatured ? 'true' : 'false';
      document.getElementById('pShortDesc').value = p.shortDescription || '';
      document.getElementById('pDescription').value = p.description || '';
      document.getElementById('pImage').value = p.images?.[0]?.url || '';
      if (p.images?.[0]?.url) showProductImagePreview(p.images[0].url);
    } catch (err) {
      showToast(err.message, 'error');
      return;
    }
  } else {
    document.getElementById('productImagePreview').style.display = 'none';
    document.getElementById('productImageUpload').style.display = '';
  }

  document.getElementById('productModal').style.display = 'flex';
  document.getElementById('productModalOverlay').style.display = '';
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
  document.getElementById('productModalOverlay').style.display = 'none';
}

function showProductImagePreview(url) {
  const preview = document.getElementById('productImagePreview');
  document.getElementById('productImagePreviewImg').src = url;
  preview.style.display = 'inline-block';
  document.getElementById('productImageUpload').style.display = 'none';
}

function removeProductImage() {
  document.getElementById('pImage').value = '';
  document.getElementById('productImagePreview').style.display = 'none';
  document.getElementById('productImageUpload').style.display = '';
}

async function saveProduct() {
  const id = document.getElementById('pId').value;
  const payload = {
    name: document.getElementById('pName').value,
    category: document.getElementById('pCategory').value,
    icon: document.getElementById('pIcon').value || 'fas fa-box',
    priceMmk: parseFloat(document.getElementById('pPriceMmk').value),
    priceBaht: parseFloat(document.getElementById('pPriceBaht').value) || 0,
    stock: parseInt(document.getElementById('pStock').value) || 0,
    isFeatured: document.getElementById('pFeatured').value === 'true',
    shortDescription: document.getElementById('pShortDesc').value,
    description: document.getElementById('pDescription').value,
  };
  const imgUrl = document.getElementById('pImage').value;
  if (imgUrl) payload.images = [{ url: imgUrl, isPrimary: true }];

  try {
    if (id) {
      await api(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Product updated');
    } else {
      await api('/api/products', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Product created');
    }
    closeProductModal();
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await api(`/api/products/${id}`, { method: 'DELETE' });
    showToast('Product deleted');
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleProductStatus(id) {
  try {
    const data = await api(`/api/products/${id}`);
    await api(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !data.product.isActive })
    });
    showToast('Status updated');
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== CATEGORIES =====
async function loadCategories() {
  try {
    const data = await api('/api/categories?includeInactive=true');
    state.categories = data.categories;
    const body = document.getElementById('categoriesBody');
    if (!data.categories || data.categories.length === 0) {
      body.innerHTML = '<tr><td colspan="5" class="empty">No categories yet</td></tr>';
      return;
    }
    body.innerHTML = data.categories.map(c => `
      <tr>
        <td class="product-name-main">${c.name}</td>
        <td>${c.description || '-'}</td>
        <td>${c.productCount || 0}</td>
        <td><span class="status-badge status-${c.isActive ? 'true' : 'false'}">${c.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn btn-icon btn-edit" onclick="openCategoryModal('${c._id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-icon btn-delete" onclick="deleteCategory('${c._id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openCategoryModal(id = null) {
  document.getElementById('categoryModalTitle').textContent = id ? 'Edit Category' : 'Add Category';
  document.getElementById('categoryForm').reset();
  document.getElementById('catId').value = id || '';
  document.getElementById('catActive').value = 'true';

  if (id) {
    const cat = state.categories.find(c => c._id === id);
    if (cat) {
      document.getElementById('catName').value = cat.name;
      document.getElementById('catDescription').value = cat.description || '';
      document.getElementById('catActive').value = cat.isActive ? 'true' : 'false';
    }
  }
  document.getElementById('categoryModal').style.display = 'flex';
  document.getElementById('categoryModalOverlay').style.display = '';
}

function closeCategoryModal() {
  document.getElementById('categoryModal').style.display = 'none';
  document.getElementById('categoryModalOverlay').style.display = 'none';
}

async function saveCategory() {
  const id = document.getElementById('catId').value;
  const payload = {
    name: document.getElementById('catName').value,
    description: document.getElementById('catDescription').value,
    isActive: document.getElementById('catActive').value === 'true'
  };
  try {
    if (id) {
      await api(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Category updated');
    } else {
      await api('/api/categories', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Category created');
    }
    closeCategoryModal();
    loadCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  try {
    await api(`/api/categories/${id}`, { method: 'DELETE' });
    showToast('Category deleted');
    loadCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== HERO BANNERS =====
async function loadBanners() {
  try {
    const data = await api('/api/hero-banners');
    const body = document.getElementById('bannersBody');
    if (!data.banners || data.banners.length === 0) {
      body.innerHTML = '<tr><td colspan="7" class="empty">No banners yet</td></tr>';
      return;
    }
    body.innerHTML = data.banners.map(b => `
      <tr>
        <td>${b.imageUrl ? `<img src="${b.imageUrl}" style="width:80px;height:40px;object-fit:cover;border-radius:6px;">` : `<div style="width:80px;height:40px;background:${b.bgColor};border-radius:6px;"></div>`}</td>
        <td class="product-name-main">${b.title}</td>
        <td>${b.subtitle || '-'}</td>
        <td>${b.buttonText || '-'}</td>
        <td>${b.sortOrder}</td>
        <td><span class="status-badge status-${b.isActive ? 'true' : 'false'}">${b.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn btn-icon btn-edit" onclick="openBannerModal('${b._id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-icon btn-delete" onclick="deleteBanner('${b._id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

let stateBanners = [];

async function openBannerModal(id = null) {
  document.getElementById('bannerModalTitle').textContent = id ? 'Edit Banner' : 'Add Banner';
  document.getElementById('bannerForm').reset();
  document.getElementById('bannerId').value = id || '';
  document.getElementById('bannerActive').value = 'true';
  document.getElementById('bannerImagePreview').style.display = 'none';

  // Load products into dropdown
  try {
    const prodData = await api('/api/products?isActive=true&limit=200');
    const prodSelect = document.getElementById('bannerProductLink');
    prodSelect.innerHTML = '<option value="">-- None --</option>';
    (prodData.products || []).forEach(p => {
      prodSelect.innerHTML += `<option value="${p._id}">${p.name}</option>`;
    });
  } catch (e) {}

  if (id) {
    try {
      const data = await api('/api/hero-banners');
      const b = data.banners.find(x => x._id === id);
      if (b) {
        document.getElementById('bannerTitle').value = b.title;
        document.getElementById('bannerSubtitle').value = b.subtitle || '';
        document.getElementById('bannerBtnText').value = b.buttonText || 'Shop Now';
        document.getElementById('bannerBgColor').value = b.bgColor || '#c0392b';
        document.getElementById('bannerSortOrder').value = b.sortOrder || 0;
        document.getElementById('bannerActive').value = b.isActive ? 'true' : 'false';
        if (b.imageUrl) {
          document.getElementById('bannerImagePreviewImg').src = b.imageUrl;
          document.getElementById('bannerImagePreview').style.display = 'block';
        }
        // Set link dropdowns
        if (b.buttonLink && b.buttonLink.startsWith('#')) {
          document.getElementById('bannerBtnLink').value = b.buttonLink;
        } else if (b.buttonLink && !b.buttonLink.startsWith('#')) {
          document.getElementById('bannerProductLink').value = b.buttonLink;
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
      return;
    }
  }
  document.getElementById('bannerModal').style.display = 'flex';
  document.getElementById('bannerModalOverlay').style.display = '';
}

function closeBannerModal() {
  document.getElementById('bannerModal').style.display = 'none';
  document.getElementById('bannerModalOverlay').style.display = 'none';
}

async function saveBanner() {
  const id = document.getElementById('bannerId').value;
  const fileInput = document.getElementById('bannerImageFile');
  let imageUrl = document.getElementById('bannerImageUrl').value;

  if (fileInput.files.length > 0) {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    try {
      const token = localStorage.getItem('pm_token');
      const res = await fetch('/api/upload/image', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: formData });
      const data = await res.json();
      if (data.success) imageUrl = data.image.url;
    } catch (e) {
      showToast('Image upload failed', 'error');
      return;
    }
  }

  const productLink = document.getElementById('bannerProductLink').value;
  const sectionLink = document.getElementById('bannerBtnLink').value;
  const finalLink = productLink || sectionLink || '#';

  const payload = {
    title: document.getElementById('bannerTitle').value,
    subtitle: document.getElementById('bannerSubtitle').value,
    buttonText: document.getElementById('bannerBtnText').value,
    buttonLink: finalLink,
    imageUrl: imageUrl,
    bgColor: document.getElementById('bannerBgColor').value,
    sortOrder: parseInt(document.getElementById('bannerSortOrder').value) || 0,
    isActive: document.getElementById('bannerActive').value === 'true'
  };

  try {
    if (id) {
      await api(`/api/hero-banners/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Banner updated');
    } else {
      await api('/api/hero-banners', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Banner created');
    }
    closeBannerModal();
    loadBanners();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteBanner(id) {
  if (!confirm('Delete this banner?')) return;
  try {
    await api(`/api/hero-banners/${id}`, { method: 'DELETE' });
    showToast('Banner deleted');
    loadBanners();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== ORDERS =====
async function loadOrders() {
  try {
    const params = new URLSearchParams({ page: state.orders.page, limit: 15 });
    if (state.orders.search) params.append('search', state.orders.search);
    if (state.orders.status) params.append('orderStatus', state.orders.status);

    const data = await api(`/api/orders?${params}`);
    state.orders.page = data.page;
    state.orders.totalPages = data.totalPages || 1;

    document.getElementById('navOrderCount').textContent = data.total;

    const body = document.getElementById('ordersBody');
    if (!data.orders || data.orders.length === 0) {
      body.innerHTML = '<tr><td colspan="8" class="empty">No orders found</td></tr>';
    } else {
      body.innerHTML = data.orders.map(o => `
        <tr>
          <td class="product-name-main">${o.orderNumber}</td>
          <td>${o.customer.name}<br><small class="product-sku">${o.customer.phone}</small></td>
          <td>${o.items.reduce((s, i) => s + i.quantity, 0)}</td>
          <td class="product-name-main">${formatMMK(o.totalMmk)}</td>
          <td><span class="status-badge status-${o.paymentStatus}">${capitalize(o.paymentStatus)}</span></td>
          <td><span class="status-badge status-${o.orderStatus}">${capitalize(o.orderStatus)}</span></td>
          <td>${formatDate(o.createdAt)}</td>
          <td>
            <button class="btn btn-icon btn-view" onclick="openOrderDetail('${o._id}')"><i class="fas fa-eye"></i></button>
            <button class="btn btn-icon btn-delete" onclick="deleteOrder('${o._id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }

    renderPagination('ordersPagination', state.orders.page, state.orders.totalPages, (page) => {
      state.orders.page = page;
      loadOrders();
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openOrderDetail(id) {
  fetchOrderAndShow(id);
}

async function fetchOrderAndShow(id) {
  try {
    const data = await api(`/api/orders/${id}`);
    const o = data.order;
    document.getElementById('orderDetailModalOverlay').style.display = '';
    document.getElementById('orderDetailModalTitle').textContent = `Order ${o.orderNumber}`;
    document.getElementById('orderDetailModalBody').innerHTML = `
      <div class="order-detail-grid">
        <div>
          <div class="order-info-block">
            <h4>Customer</h4>
            <p>${o.customer.name}</p>
            <p>${o.customer.email}</p>
            <p>${o.customer.phone}</p>
            <p>${o.customer.address?.street || ''}, ${o.customer.address?.city || ''} ${o.customer.address?.state || ''}</p>
          </div>
          <div class="order-info-block">
            <h4>Items</h4>
            ${o.items.map(i => `<p style="display:flex;justify-content:space-between;"><span>${i.name} x${i.quantity}</span><span style="font-weight:600;">${formatMMK(i.priceMmk * i.quantity)}</span></p>`).join('')}
          </div>
        </div>
        <div>
          <div class="order-info-block">
            <h4>Summary</h4>
            <p>Subtotal: ${formatMMK(o.subtotalMmk)}</p>
            <p>Shipping: ${o.shippingMmk ? formatMMK(o.shippingMmk) : 'Free'}</p>
            <p style="font-weight:700;font-size:1.1rem;margin-top:8px;">Total: ${formatMMK(o.totalMmk)}</p>
            <p style="color:var(--gold);font-weight:600;">฿${(o.totalBaht || 0).toLocaleString()}</p>
          </div>
          <div class="order-info-block">
            <h4>Status</h4>
            <label>Order Status</label>
            <select id="oaOrderStatus" class="filter-select" style="width:100%;margin-bottom:10px;">
              ${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${s === o.orderStatus ? 'selected' : ''}>${capitalize(s)}</option>`).join('')}
            </select>
            <label>Payment Status</label>
            <select id="oaPaymentStatus" class="filter-select" style="width:100%;margin-bottom:10px;">
              ${['pending','paid','failed','refunded'].map(s => `<option value="${s}" ${s === o.paymentStatus ? 'selected' : ''}>${capitalize(s)}</option>`).join('')}
            </select>
            <label>Tracking Number</label>
            <input type="text" id="oaTracking" class="search-input" style="width:100%;margin-bottom:10px;" value="${o.trackingNumber || ''}">
            <button class="btn btn-primary" style="width:100%;" onclick="saveOrderStatus('${o._id}')"><i class="fas fa-save"></i> Update Status</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('orderDetailModal').style.display = 'flex';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function saveOrderStatus(id) {
  const orderStatus = document.getElementById('oaOrderStatus').value;
  const paymentStatus = document.getElementById('oaPaymentStatus').value;
  const trackingNumber = document.getElementById('oaTracking').value;
  try {
    await api(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus, paymentStatus, trackingNumber })
    });
    showToast('Order status updated');
    closeOrderDetail();
    loadOrders();
    if (currentPage === 'dashboard') loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function closeOrderDetail() {
  document.getElementById('orderDetailModal').style.display = 'none';
  document.getElementById('orderDetailModalOverlay').style.display = 'none';
}

async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  try {
    await api(`/api/orders/${id}`, { method: 'DELETE' });
    showToast('Order deleted');
    loadOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== COUPONS =====
// ===== SETTINGS =====
async function loadSettings() {
  try {
    const data = await api('/api/settings');
    const s = data.settings;
    document.getElementById('sName').value = s.storeName || '';
    document.getElementById('sTagline').value = s.storeTagline || '';
    document.getElementById('sEmail').value = s.storeEmail || '';
    document.getElementById('sPhone').value = s.storePhone || '';
    document.getElementById('sAddress').value = s.storeAddress || '';
    document.getElementById('sFacebook').value = s.social?.facebook || '';
    document.getElementById('sInstagram').value = s.social?.instagram || '';
    document.getElementById('sViber').value = s.social?.viber || '';
    document.getElementById('sTiktok').value = s.social?.tiktok || '';
    document.getElementById('sSeoTitle').value = s.seo?.title || '';
    document.getElementById('sSeoDescription').value = s.seo?.description || '';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = {
      storeName: document.getElementById('sName').value,
      storeTagline: document.getElementById('sTagline').value,
      storeEmail: document.getElementById('sEmail').value,
      storePhone: document.getElementById('sPhone').value,
      storeAddress: document.getElementById('sAddress').value,
      social: {
        facebook: document.getElementById('sFacebook').value,
        instagram: document.getElementById('sInstagram').value,
        viber: document.getElementById('sViber').value,
        tiktok: document.getElementById('sTiktok').value
      },
      seo: {
        title: document.getElementById('sSeoTitle').value,
        description: document.getElementById('sSeoDescription').value
      }
    };
    await api('/api/settings', { method: 'PUT', body: JSON.stringify(payload) });
    showToast('Settings saved');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ===== USERS =====
async function loadUsers() {
  try {
    const data = await api('/api/auth/users');
    const body = document.getElementById('usersBody');
    if (!data.users || data.users.length === 0) {
      body.innerHTML = '<tr><td colspan="7" class="empty">No users found</td></tr>';
      return;
    }
    body.innerHTML = data.users.map(u => `
      <tr>
        <td class="product-name-main">${u.name}${u._id === (currentUser && currentUser._id) ? ' (you)' : ''}</td>
        <td>${u.email}</td>
        <td><span class="status-badge status-${u.role === 'admin' ? 'true' : 'processing'}">${u.role}</span></td>
        <td>${u.phone || '-'}</td>
        <td>${u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</td>
        <td><span class="status-badge status-${u.isActive ? 'true' : 'false'}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn btn-icon btn-edit" onclick="openUserModal('${u._id}','${u.name}','${u.email}','${u.role}','${u.phone||''}','${u.isActive}')"><i class="fas fa-edit"></i></button>
          ${u._id !== (currentUser && currentUser._id) ? `<button class="btn btn-icon btn-delete" onclick="deleteUser('${u._id}')"><i class="fas fa-trash"></i></button>` : ''}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openUserModal(id = null, name = '', email = '', role = 'staff', phone = '', isActive = 'true') {
  document.getElementById('userModalTitle').textContent = id ? 'Edit User' : 'Add Staff User';
  document.getElementById('userForm').reset();
  document.getElementById('uId').value = id || '';
  document.getElementById('uName').value = name;
  document.getElementById('uEmail').value = email;
  document.getElementById('uPassword').value = '';
  document.getElementById('uRole').value = role;
  document.getElementById('uPhone').value = phone;
  document.getElementById('uActive').value = isActive === 'true' ? 'true' : 'false';
  document.getElementById('uPassword').placeholder = id ? 'Leave blank to keep current password' : 'Enter password';
  document.getElementById('userModal').style.display = 'flex';
  document.getElementById('userModalOverlay').style.display = '';
}

function closeUserModal() {
  document.getElementById('userModal').style.display = 'none';
  document.getElementById('userModalOverlay').style.display = 'none';
}

async function saveUser() {
  const id = document.getElementById('uId').value;
  const payload = {
    name: document.getElementById('uName').value,
    email: document.getElementById('uEmail').value,
    role: document.getElementById('uRole').value,
    phone: document.getElementById('uPhone').value,
    isActive: document.getElementById('uActive').value === 'true'
  };
  const password = document.getElementById('uPassword').value;
  if (password) payload.password = password;

  try {
    if (id) {
      await api(`/api/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('User updated');
    } else {
      if (!password) {
        showToast('Password is required for new users', 'error');
        return;
      }
      await api('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Staff user created');
    }
    closeUserModal();
    loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  try {
    await api(`/api/auth/users/${id}`, { method: 'DELETE' });
    showToast('User deleted');
    loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== HELPERS =====
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function renderPagination(containerId, current, total, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (total <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  if (current > 1) html += `<button class="page-btn" onclick="navigatePage(${current - 1}, '${containerId}')"><i class="fas fa-chevron-left"></i></button>`;

  for (let i = 1; i <= total; i++) {
    if (i === current || i === 1 || i === total || Math.abs(i - current) <= 1) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="navigatePage(${i}, '${containerId}')">${i}</button>`;
    } else if (i === current - 2 || i === current + 2) {
      html += `<span>...</span>`;
    }
  }

  if (current < total) html += `<button class="page-btn" onclick="navigatePage(${current + 1}, '${containerId}')"><i class="fas fa-chevron-right"></i></button>`;

  container.innerHTML = html;
}

window.navigatePage = function(page, containerId) {
  const callbacks = {
    productsPagination: (p) => { state.products.page = p; loadProducts(); },
    ordersPagination: (p) => { state.orders.page = p; loadOrders(); }
  };
  if (callbacks[containerId]) callbacks[containerId](page);
};

// ===== EVENT BINDINGS =====
document.getElementById('logoutBtn').addEventListener('click', handleLogout);

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('active');
  document.getElementById('sidebarOverlay').classList.add('active');
});

document.getElementById('sidebarClose').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('active');
  document.getElementById('sidebarOverlay').classList.remove('active');
});

document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('active');
  document.getElementById('sidebarOverlay').classList.remove('active');
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('spinning');
  loadPageData(currentPage);
  setTimeout(() => btn.classList.remove('spinning'), 800);
});

// Search inputs - debounced
let searchTimer;
document.getElementById('productSearch').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.products.search = e.target.value;
    state.products.page = 1;
    loadProducts();
  }, 400);
});

document.getElementById('productCategoryFilter').addEventListener('change', (e) => {
  state.products.category = e.target.value;
  state.products.page = 1;
  loadProducts();
});

document.getElementById('orderSearch').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.orders.search = e.target.value;
    state.orders.page = 1;
    loadOrders();
  }, 400);
});

document.getElementById('orderStatusFilter').addEventListener('change', (e) => {
  state.orders.status = e.target.value;
  state.orders.page = 1;
  loadOrders();
});

// Product image upload
document.getElementById('productImageUpload').addEventListener('click', () => {
  document.getElementById('pImageInput').click();
});

document.getElementById('pImageInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);
  try {
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('pImage').value = data.image.url;
      showProductImagePreview(data.image.url);
      showToast('Image uploaded');
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Keyboard: ESC closes modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    executeModalsClose();
  }
});

function executeModalsClose() {
  document.querySelectorAll('.modal').forEach(m => {
    if (m.style.display !== 'none') {
      m.style.display = 'none';
      const overlay = document.getElementById(m.id.replace('Modal', 'ModalOverlay'));
      if (overlay) overlay.style.display = 'none';
      if (m.id === 'productModal') {
        m.querySelector('.modal-footer').style.display = '';
      }
    }
  });
}

// ===== INIT =====
(async function init() {
  if (!checkAuth()) return;
  const authed = await verifyAuth();
  if (!authed) return;

  if (currentUser) {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;
  }

  loadPageData(currentPage);
})();
