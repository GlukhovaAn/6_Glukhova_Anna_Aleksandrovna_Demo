<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api'

const router = useRouter()
const auth = useAuthStore()

const applications = ref([])
const total = ref(0)
const loading = ref(false)
const notification = ref('')
const notificationType = ref('success')

const filterStatus = ref('')
const page = ref(1)
const limit = 8
const sortField = ref('created_at')
const sortOrder = ref('DESC')

const totalPages = computed(() => Math.ceil(total.value / limit))

const statuses = ['', 'Новая', 'Идет обучение', 'Обучение завершено']

onMounted(loadApplications)

async function loadApplications() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit,
      sort: sortField.value,
      order: sortOrder.value,
    }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.get('/admin/applications', { params })
    applications.value = res.data.data
    total.value = res.data.total
  } catch {
    applications.value = []
  } finally {
    loading.value = false
  }
}

async function changeStatus(id, status) {
  try {
    await api.patch(`/admin/applications/${id}/status`, { status })
    showNotification(`Статус изменён на "${status}"`, 'success')
    await loadApplications()
  } catch (e) {
    showNotification(e.response?.data?.message || 'Ошибка', 'error')
  }
}

function showNotification(msg, type = 'success') {
  notification.value = msg
  notificationType.value = type
  setTimeout(() => { notification.value = '' }, 3000)
}

function statusClass(status) {
  if (status === 'Новая') return 'status-new'
  if (status === 'Идет обучение') return 'status-learning'
  return 'status-done'
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU')
}

function applyFilter() {
  page.value = 1
  loadApplications()
}

function setPage(p) {
  page.value = p
  loadApplications()
}

function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortField.value = field
    sortOrder.value = 'DESC'
  }
  loadApplications()
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-panel">
    <!-- Современный навбар -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo">
          <span>⚓</span> Водить.РФ
          <span class="badge-admin">Администратор</span>
        </div>
        <div class="nav-links">
          <div class="user-greeting">
            <span class="user-icon">👤</span>
            <span>{{ auth.user?.full_name || 'Admin' }}</span>
          </div>
          <button @click="logout" class="logout-btn">
            <span>🚪</span> Выйти
          </button>
        </div>
      </div>
    </nav>

    <!-- Уведомление -->
    <Transition name="toast">
      <div v-if="notification" class="toast" :class="notificationType === 'success' ? 'toast-success' : 'toast-error'">
        <span class="toast-icon">{{ notificationType === 'success' ? '✅' : '⚠️' }}</span>
        {{ notification }}
      </div>
    </Transition>

    <div class="admin-content">
      <h2 class="section-title">
        <span>📋</span> Управление заявками
      </h2>

      <!-- Карточка фильтров -->
      <div class="filters-card">
        <div class="filter-group">
          <label>Фильтр по статусу</label>
          <select v-model="filterStatus" @change="applyFilter" class="filter-select">
            <option value="">Все статусы</option>
            <option v-for="s in statuses.slice(1)" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="sort-group">
          <span class="sort-label">Сортировка:</span>
          <button 
            class="sort-chip" 
            :class="{ active: sortField === 'created_at' }" 
            @click="toggleSort('created_at')"
          >
            📅 Дата создания
            <span v-if="sortField === 'created_at'" class="sort-arrow">
              {{ sortOrder === 'DESC' ? '↓' : '↑' }}
            </span>
          </button>
          <button 
            class="sort-chip" 
            :class="{ active: sortField === 'status' }" 
            @click="toggleSort('status')"
          >
            🏷️ Статус
            <span v-if="sortField === 'status'" class="sort-arrow">
              {{ sortOrder === 'DESC' ? '↓' : '↑' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Таблица заявок -->
      <div class="table-wrapper">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка заявок...</p>
        </div>
        <table v-else class="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Пользователь</th>
              <th>Транспорт</th>
              <th>Оплата</th>
              <th>Дата начала</th>
              <th>Создана</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in applications" :key="app.id" class="table-row">
              <td class="app-id">#{{ app.id }}</td>
              <td>
                <div class="user-info">
                  <span class="user-name">{{ app.full_name }}</span>
                  <span class="user-login">@{{ app.login }}</span>
                </div>
              </td>
              <td>
                <span class="transport-badge">🚢 {{ app.transport_name }}</span>
              </td>
              <td>
                <span class="payment-badge">💰 {{ app.payment_name }}</span>
              </td>
              <td>{{ formatDate(app.start_date) }}</td>
              <td>{{ formatDate(app.created_at) }}</td>
              <td>
                <div class="status-badge" :class="statusClass(app.status)">
                  <span class="status-icon">
                    <span v-if="app.status === 'Новая'">🆕</span>
                    <span v-else-if="app.status === 'Идет обучение'">⚙️</span>
                    <span v-else>✅</span>
                  </span>
                  {{ app.status }}
                </div>
              </td>
              <td>
                <select class="status-select" :value="app.status" @change="changeStatus(app.id, $event.target.value)">
                  <option value="Новая">Новая</option>
                  <option value="Идет обучение">Идет обучение</option>
                  <option value="Обучение завершено">Обучение завершено</option>
                </select>
              </td>
            </tr>
            <tr v-if="applications.length === 0 && !loading">
              <td colspan="8" class="empty-row">
                <div class="empty-icon">📭</div>
                <p>Заявок не найдено</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
      <div class="pagination-container" v-if="totalPages > 1">
        <div class="pagination">
          <button 
            class="page-btn" 
            :disabled="page === 1"
            @click="setPage(page - 1)"
          >←</button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="page-btn"
            :class="{ active: p === page }"
            @click="setPage(p)"
          >{{ p }}</button>
          <button 
            class="page-btn" 
            :disabled="page === totalPages"
            @click="setPage(page + 1)"
          >→</button>
        </div>
        <div class="total-info">Всего заявок: {{ total }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-panel {
  min-height: 100vh;
  background: linear-gradient(145deg, #f8fafc 0%, #eef2f5 100%);
  font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
}

/* Навбар — единый стиль */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  color: #0a2b44;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo span:first-child {
  font-size: 28px;
}

.badge-admin {
  background: linear-gradient(95deg, #0f4c5f, #1e6f5c);
  color: white;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 40px;
  margin-left: 12px;
  font-weight: 500;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eef2f5;
  padding: 8px 16px;
  border-radius: 40px;
  font-weight: 500;
  color: #1e6f5c;
}

.user-icon {
  font-size: 18px;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #e53e3e;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 40px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fee2e2;
}

/* Контент */
.admin-content {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 24px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #0a2b44;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Карточка фильтров */
.filters-card {
  background: white;
  border-radius: 24px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}

.filter-group {
  flex: 2;
  min-width: 180px;
}

.filter-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1e2f3e;
  margin-bottom: 8px;
}

.filter-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #2c7da0;
  box-shadow: 0 0 0 3px rgba(44, 125, 160, 0.1);
}

.sort-group {
  flex: 3;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sort-label {
  font-size: 14px;
  color: #5a6e7c;
  font-weight: 500;
}

.sort-chip {
  background: #f1f5f9;
  border: none;
  padding: 8px 18px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2c3e50;
}

.sort-chip.active {
  background: linear-gradient(95deg, #0f4c5f, #1e6f5c);
  color: white;
}

.sort-chip:hover:not(.active) {
  background: #e6edf4;
}

.sort-arrow {
  font-size: 14px;
  margin-left: 4px;
}

/* Таблица */
.table-wrapper {
  background: white;
  border-radius: 24px;
  overflow-x: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.applications-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.applications-table th {
  background: #f8fafc;
  padding: 16px 16px;
  text-align: left;
  font-weight: 600;
  color: #1e6f5c;
  border-bottom: 1px solid #e2e8f0;
}

.applications-table td {
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  vertical-align: middle;
}

.table-row:hover td {
  background: #f9fbfd;
}

.app-id {
  font-weight: 600;
  color: #2c7da0;
  font-family: monospace;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 500;
  color: #0a2b44;
}

.user-login {
  font-size: 12px;
  color: #7f8c8d;
}

.transport-badge,
.payment-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 40px;
  font-size: 13px;
}

/* Статус-бейджи (как в кабинете) */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 40px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.status-new {
  background: #fff7e5;
  color: #b85c00;
}

.status-learning {
  background: #e0f2fe;
  color: #0369a1;
}

.status-done {
  background: #d1fae5;
  color: #065f46;
}

/* Селект статуса */
.status-select {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 40px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.status-select:hover {
  border-color: #2c7da0;
}

.status-select:focus {
  outline: none;
  border-color: #2c7da0;
  box-shadow: 0 0 0 2px rgba(44, 125, 160, 0.2);
}

/* Пустое состояние */
.empty-row td {
  text-align: center;
  padding: 48px 16px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-row p {
  color: #5a6e7c;
  font-size: 14px;
}

/* Загрузка */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid #e2e8f0;
  border-top-color: #1e6f5c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Пагинация */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #eef2f5;
  border-color: #1e6f5c;
}

.page-btn.active {
  background: linear-gradient(95deg, #0f4c5f, #1e6f5c);
  color: white;
  border-color: transparent;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.total-info {
  background: #eef2f5;
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 14px;
  color: #1e6f5c;
  font-weight: 500;
}

/* Уведомление */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 14px 24px;
  border-radius: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.toast-success {
  background: rgba(209, 250, 229, 0.95);
  color: #065f46;
  border-left: 4px solid #10b981;
}

.toast-error {
  background: rgba(254, 226, 226, 0.95);
  color: #b91c1c;
  border-left: 4px solid #ef4444;
}

.toast-icon {
  font-size: 18px;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from, .toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Адаптивность */
@media (max-width: 820px) {
  .nav-container {
    padding: 0 16px;
  }
  .user-greeting span:last-child {
    display: none;
  }
  .admin-content {
    padding: 0 16px;
  }
  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }
  .sort-group {
    justify-content: flex-start;
  }
  .pagination-container {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 640px) {
  .applications-table th,
  .applications-table td {
    padding: 12px 8px;
  }
  .sort-chip {
    padding: 6px 12px;
    font-size: 12px;
  }
  .badge-admin {
    font-size: 10px;
    padding: 2px 8px;
  }
}
</style>