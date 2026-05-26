<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Slider from '../components/Slider.vue'
import api from '../api'

const router = useRouter()
const auth = useAuthStore()

const applications = ref([])
const loading = ref(true)
const reviewText = ref('')
const reviewAppId = ref(null)
const reviewError = ref('')
const reviewSuccess = ref('')
const notification = ref('')

onMounted(async () => {
  await loadApplications()
})

async function loadApplications() {
  loading.value = true
  try {
    const res = await api.get('/applications/my')
    applications.value = res.data
  } catch {
    applications.value = []
  } finally {
    loading.value = false
  }
}

function statusClass(status) {
  if (status === 'Новая') return 'status-new'
  if (status === 'Подтверждена') return 'status-learning'
  return 'status-done'
}

function openReview(id) {
  reviewAppId.value = id
  reviewText.value = ''
  reviewError.value = ''
  reviewSuccess.value = ''
}

function closeReview() {
  reviewAppId.value = null
}

async function submitReview() {
  reviewError.value = ''
  if (!reviewText.value.trim()) {
    reviewError.value = 'Введите текст отзыва'
    return
  }
  try {
    await api.post('/reviews', { application_id: reviewAppId.value, text: reviewText.value })
    reviewSuccess.value = 'Отзыв добавлен!'
    setTimeout(closeReview, 1200)
  } catch (e) {
    reviewError.value = e.response?.data?.message || 'Ошибка'
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU')
}
</script>

<template>
  <div class="cabinet">
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo">
          Банкетам.Нет
        </div>
        <div class="nav-links">
          <div class="user-greeting">
            {{ auth.user?.full_name || 'Пользователь' }}
          </div>
          <router-link to="/application" class="nav-link">
            Подать заявку
          </router-link>
          <button @click="logout" class="logout-btn">
            Выйти
          </button>
        </div>
      </div>
    </nav>

    <div class="cabinet-content">
      <div class="slider-wrap">
        <Slider />
      </div>

      <h2 class="section-title">
        Мои заявки
      </h2>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка заявок...</p>
      </div>

      <div v-else-if="applications.length === 0" class="empty-state">
        <div class="empty-icon"></div>
        <h3>У вас пока нет бронирований</h3>
        <p>Оставьте первую заявку на банкет</p>
        <router-link to="/application" class="btn btn-primary">
          Забронировать помещение
        </router-link>
      </div>

      <div v-else class="applications-grid">
        <div v-for="app in applications" :key="app.id" class="app-card">
          <div class="app-header">
            <div class="app-id-badge">Бронь #{{ app.id }}</div>
            <div class="status-badge" :class="statusClass(app.status)">
              {{ app.status }}
            </div>
          </div>
          <div class="app-details">
            <div class="detail-item">
              <span><strong>Помещение:</strong> {{ app.hall_name }}</span>
            </div>
            <div class="detail-item">
              <span><strong>Оплата:</strong> {{ app.payment_name }}</span>
            </div>
            <div class="detail-item">
              <span><strong>Дата мероприятия:</strong> {{ formatDate(app.event_date) }}</span>
            </div>
            <div class="detail-item">
              <span><strong>Создана:</strong> {{ formatDate(app.created_at) }}</span>
            </div>
          </div>
          <button
            v-if="app.status !== 'Новая'"
            class="btn btn-secondary review-btn"
            @click="openReview(app.id)"
          >
            Оставить отзыв
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="reviewAppId" class="modal-overlay" @click.self="closeReview">
        <div class="modal">
          <div class="modal-header">
            <h3>Оставить отзыв</h3>
            <button class="modal-close" @click="closeReview">Закрыть</button>
          </div>
          <div class="modal-body">
            <div v-if="reviewError" class="alert alert-error">
              {{ reviewError }}
            </div>
            <div v-if="reviewSuccess" class="alert alert-success">
              {{ reviewSuccess }}
            </div>
            <div class="form-group">
              <label>Ваш отзыв</label>
              <textarea 
                v-model="reviewText" 
                rows="4" 
                placeholder="Расскажите о вашем мероприятии..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeReview">Отмена</button>
            <button class="btn btn-primary" @click="submitReview">Отправить отзыв</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Общие стили (соответствуют login/register) */
.cabinet {
  min-height: 100vh;
  background: linear-gradient(145deg, #f8fafc 0%, #eef2f5 100%);
  font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
}

/* Навбар */
.navbar {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
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

.logo span {
  font-size: 28px;
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

.nav-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #1e6f5c;
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
.cabinet-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.slider-wrap {
  margin-bottom: 40px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
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

/* Состояние загрузки */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 22px;
  color: #0a2b44;
  margin-bottom: 8px;
}

.empty-state p {
  color: #5a6e7c;
  margin-bottom: 24px;
}

/* Сетка заявок */
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.app-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef2f5;
}

.app-id-badge {
  font-weight: 600;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 40px;
  font-size: 13px;
  color: #2c7da0;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
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

.app-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #334155;
}

.detail-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.review-btn {
  width: 100%;
  justify-content: center;
}

/* Кнопки в едином стиле */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 40px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(95deg, #0f4c5f, #1e6f5c);
  color: white;
  box-shadow: 0 4px 10px rgba(15, 76, 95, 0.2);
}

.btn-primary:hover {
  transform: scale(1.02);
  background: linear-gradient(95deg, #0e4152, #1a5e4e);
  box-shadow: 0 6px 14px rgba(15, 76, 95, 0.25);
}

.btn-secondary {
  background: #f1f5f9;
  color: #1e6f5c;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover {
  background: #e6edf4;
  transform: translateY(-1px);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: white;
  border-radius: 32px;
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: fadeSlideUp 0.2s ease;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eef2f5;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0a2b44;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #e53e3e;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Формы в модалке */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #1e2f3e;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: all 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #2c7da0;
  box-shadow: 0 0 0 3px rgba(44, 125, 160, 0.1);
}

.alert {
  padding: 12px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-error {
  background: #fee2e2;
  color: #b91c1c;
  border-left: 4px solid #ef4444;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
  border-left: 4px solid #10b981;
}

/* Адаптивность */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
  .nav-links {
    gap: 12px;
  }
  .user-greeting span:last-child {
    display: none;
  }
  .applications-grid {
    grid-template-columns: 1fr;
  }
  .cabinet-content {
    padding: 20px 16px;
  }
}
</style>

