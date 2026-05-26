<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../api";


const router = useRouter();
const auth = useAuthStore();


const hallTypes = ref([
  { name: "зал", id: 1 },
  { name: "ресторан", id: 2 },
  { name: "летняя веранда", id: 3 },
  { name: "закрытая веранда", id: 4 },
]);
const paymentMethods = ref([
  { name: "банковской картой", id: 1 },
  { name: "Спб", id: 2 },
  { name: "наличными", id: 3 },
]);
const form = ref({
  hall_type_id: "",
  payment_method_id: "",
  event_date: "",
});
const errors = ref({});
const success = ref("");
const loading = ref(false);


onMounted(async () => {
  const [h, p] = await Promise.all([
    api.get("/applications/hall-types"),
    api.get("/applications/payment-methods"),
  ]);
  hallTypes.value = h.data;
  paymentMethods.value = p.data;
});


function validate() {
  errors.value = {};
  if (!form.value.hall_type_id) errors.value.hall = "Выберите тип помещения";
  if (!form.value.payment_method_id)
    errors.value.payment = "Выберите способ оплаты";
  if (!form.value.event_date) errors.value.date = "Укажите дату мероприятия";
  return Object.keys(errors.value).length === 0;
}


async function submit() {
  success.value = "";
  if (!validate()) return;
  loading.value = true;
  try {
    await api.post("/applications", form.value);
    success.value = "Бронирование успешно создано! Перенаправляем...";
    setTimeout(() => router.push("/cabinet"), 1500);
  } catch (e) {
    errors.value.general =
      e.response?.data?.message || "Ошибка при создании бронирования";
  } finally {
    loading.value = false;
  }
}


function formatDisplay(val) {
  if (!val) return "";
  const [y, m, d] = val.split("-");
  return `${d}.${m}.${y}`;
}
</script>


<template>
  <div class="application-page">
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo">Банкетам.Нет</div>
        <div class="nav-links">
          <router-link to="/cabinet" class="nav-link">
            Личный кабинет
          </router-link>
          <button
            @click="
              auth.logout();
              $router.push('/login');
            "
            class="logout-btn"
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>


    <div class="application-content">
      <div class="form-card">
        <div class="card-header">
          <h2>Новое бронирование</h2>
          <p>Заполните форму для бронирования помещения</p>
        </div>


        <transition name="fade">
          <div v-if="errors.general" class="alert alert-error">
            {{ errors.general }}
          </div>
        </transition>
        <transition name="fade">
          <div v-if="success" class="alert alert-success">
            {{ success }}
          </div>
        </transition>


        <form @submit.prevent="submit">
          <div class="input-group" :class="{ error: errors.hall }">
            <label>Тип помещения *</label>
            <div class="select-wrapper">
              <span class="select-icon"></span>
              <select v-model="form.hall_type_id">
                <option value="" disabled>Выберите тип помещения</option>
                <option v-for="h in hallTypes" :key="h.id" :value="h.id">
                  {{ h.name }}
                </option>
              </select>
            </div>
            <span v-if="errors.hall" class="error-msg">{{ errors.hall }}</span>
          </div>


          <div class="input-group" :class="{ error: errors.payment }">
            <label>Способ оплаты *</label>
            <div class="select-wrapper">
              <span class="select-icon"></span>
              <select v-model="form.payment_method_id">
                <option value="" disabled>Выберите способ оплаты</option>
                <option v-for="p in paymentMethods" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>
            <span v-if="errors.payment" class="error-msg">{{
              errors.payment
            }}</span>
          </div>


          <div class="input-group" :class="{ error: errors.date }">
            <label>Дата мероприятия *</label>
            <div class="date-wrapper">
              <span class="date-icon"></span>
              <input v-model="form.event_date" type="date" />
            </div>
            <span v-if="form.event_date" class="date-hint">
              Выбрано: {{ formatDisplay(form.event_date) }}
            </span>
            <span v-if="errors.date" class="error-msg">{{ errors.date }}</span>
          </div>


          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Забронировать</span>
            </button>
            <router-link to="/cabinet" class="btn btn-outline">
              Отмена
            </router-link>
          </div>
        </form>
      </div>


      <div class="info-side">
        <div class="image-card">
          <img src="/images/5.jpg" alt="Банкет" />
        </div>
        <div class="info-card">
          <h3>Как это работает?</h3>
          <ul class="steps-list">
            <li><span class="step-num">1</span> Выберите тип помещения</li>
            <li>
              <span class="step-num">2</span> Укажите удобную дату мероприятия
            </li>
            <li><span class="step-num">3</span> Выберите способ оплаты</li>
            <li>
              <span class="step-num">4</span> Заявка отправляется администратору
            </li>
            <li>
              <span class="step-num">5</span> Следите за статусом в личном
              кабинете
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.application-page {
  min-height: 100vh;
  background: linear-gradient(145deg, #f8fafc 0%, #eef2f5 100%);
  font-family: "Segoe UI", Roboto, system-ui, sans-serif;
}


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


.logo span {
  font-size: 28px;
}


.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
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


.application-content {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 0.9fr;
  gap: 32px;
  align-items: start;
}


.form-card {
  background: white;
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}


.form-card:hover {
  transform: translateY(-2px);
}


.card-header {
  margin-bottom: 28px;
  text-align: center;
}


.card-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #0a2b44;
  margin: 0 0 8px 0;
}


.card-header p {
  color: #5a6e7c;
  font-size: 14px;
  margin: 0;
}


.input-group {
  margin-bottom: 24px;
}


.input-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #1e2f3e;
  font-size: 14px;
}


.select-wrapper,
.date-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}


.select-icon,
.date-icon {
  position: absolute;
  left: 16px;
  font-size: 18px;
  pointer-events: none;
  z-index: 1;
  color: #7f8c8d;
}


select,
input[type="date"] {
  width: 100%;
  padding: 14px 14px 14px 46px;
  font-size: 15px;
  border: 1px solid #e0e7ed;
  border-radius: 60px;
  background: white;
  transition: all 0.2s;
  font-family: inherit;
  cursor: pointer;
}


select:focus,
input:focus {
  outline: none;
  border-color: #2c7da0;
  box-shadow: 0 0 0 3px rgba(44, 125, 160, 0.1);
}


input[type="date"] {
  padding-right: 12px;
}


.error-msg {
  display: block;
  font-size: 12px;
  color: #e53e3e;
  margin-top: 6px;
  margin-left: 16px;
}


.date-hint {
  display: block;
  font-size: 12px;
  color: #2c7da0;
  margin-top: 6px;
  margin-left: 16px;
}


.input-group.error select,
.input-group.error input {
  border-color: #e53e3e;
}


.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}


.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 60px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}


.btn-primary {
  flex: 1;
  background: linear-gradient(95deg, #0f4c5f, #1e6f5c);
  color: white;
  box-shadow: 0 4px 12px rgba(15, 76, 95, 0.2);
}


.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  background: linear-gradient(95deg, #0e4152, #1a5e4e);
  box-shadow: 0 8px 18px rgba(15, 76, 95, 0.25);
}


.btn-outline {
  background: transparent;
  border: 1.5px solid #cbd5e1;
  color: #2c3e50;
}


.btn-outline:hover {
  background: #f1f5f9;
  border-color: #1e6f5c;
}


.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}


.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}


@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


.alert {
  padding: 12px 18px;
  border-radius: 60px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
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


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


.info-side {
  display: flex;
  flex-direction: column;
  gap: 24px;
}


.image-card {
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 15px 30px -12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
}


.image-card:hover {
  transform: scale(1.01);
}


.image-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}


.info-card {
  background: white;
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 10px 25px -8px rgba(0, 0, 0, 0.08);
}


.info-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0a2b44;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}


.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}


.steps-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #1e2f3e;
}


.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #0f4c5f, #1e6f5c);
  color: white;
  border-radius: 40px;
  font-size: 13px;
  font-weight: bold;
  flex-shrink: 0;
}


@media (max-width: 820px) {
  .application-content {
    grid-template-columns: 1fr;
    gap: 28px;
    margin: 24px auto;
  }
  .form-card {
    padding: 28px;
  }
  .image-card img {
    height: 180px;
  }
}


@media (max-width: 480px) {
  .nav-container {
    padding: 0 16px;
  }
  .nav-links {
    gap: 12px;
  }
  .nav-link span:first-child {
    display: none;
  }
  .logout-btn span:first-child {
    display: none;
  }
  .form-card {
    padding: 20px;
  }
  .form-actions {
    flex-direction: column;
  }
  .btn-outline {
    text-align: center;
  }
  .card-header h2 {
    font-size: 24px;
  }
}
</style>



