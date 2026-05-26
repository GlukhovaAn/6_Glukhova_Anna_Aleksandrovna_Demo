<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  login: "",
  password: "",
  full_name: "",
  birth_date: "",
  phone: "",
  email: "",
});

const errors = ref({});
const success = ref("");
const loading = ref(false);
const showPassword = ref(false);
const agreeTerms = ref(false);

function validate() {
  errors.value = {};
  if (!/^[a-zA-Z0-9]{6,}$/.test(form.login)) {
    errors.value.login = "Логин: только латиница и цифры, минимум 6 символов";
  }
  if (form.password.length < 8) {
    errors.value.password = "Пароль минимум 8 символов";
  }
  if (!form.full_name.trim()) {
    errors.value.full_name = "Введите ФИО";
  }
  if (!form.birth_date) {
    errors.value.birth_date = "Введите дату рождения";
  }
  if (!form.phone.trim()) {
    errors.value.phone = "Введите телефон";
  } else if (!/^[\d\s\+\(\)\-]{10,}$/.test(form.phone)) {
    errors.value.phone = "Введите корректный номер телефона";
  }
  if (!form.email.trim()) {
    errors.value.email = "Введите e-mail";
  } else if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(form.email)) {
    errors.value.email = "Введите корректный email";
  }
  if (!agreeTerms.value) {
    errors.value.terms = "Необходимо согласие на обработку данных";
  }
  return Object.keys(errors.value).length === 0;
}

async function submit() {
  success.value = "";
  if (!validate()) return;
  loading.value = true;
  try {
    await auth.register(form);
    success.value = "Регистрация успешна! Перенаправляем на вход...";
    setTimeout(() => router.push("/login"), 1500);
  } catch (e) {
    errors.value.general =
      e.response?.data?.message ||
      "Ошибка регистрации. Попробуйте другой логин или email.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-left">
      <img src="/images/5.jpg" alt="Водить.РФ" class="bg-img" />
      <div class="overlay">
        <div class="brand"><span>⚓</span> Водить.РФ</div>
        <p>Курсы вождения речного транспорта</p>
        <div class="wave"></div>
      </div>
    </div>

    <div class="register-right">
      <div class="register-card">
        <div class="card-header">
          <h2>Создать аккаунт</h2>
          <p>Заполните форму для регистрации</p>
        </div>

        <transition name="fade">
          <div v-if="errors.general" class="alert alert-error">
            <span class="alert-icon">⚠️</span> {{ errors.general }}
          </div>
        </transition>

        <transition name="fade">
          <div v-if="success" class="alert alert-success">
            <span class="alert-icon">✅</span> {{ success }}
          </div>
        </transition>

        <form @submit.prevent="submit">
          <div class="input-group" :class="{ error: errors.login }">
            <label>Логин *</label>
            <div class="input-icon">
              <span class="icon">👤</span>
              <input
                v-model="form.login"
                type="text"
                placeholder="Только латиница и цифры, мин. 6"
                autocomplete="username"
              />
            </div>
            <span v-if="errors.login" class="error-msg">{{
              errors.login
            }}</span>
          </div>

          <div class="input-group" :class="{ error: errors.password }">
            <label>Пароль *</label>
            <div class="input-icon">
              <span class="icon">🔒</span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Минимум 8 символов"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? "🙈" : "👁️" }}
              </button>
            </div>
            <span v-if="errors.password" class="error-msg">{{
              errors.password
            }}</span>
          </div>

          <div class="input-group" :class="{ error: errors.full_name }">
            <label>ФИО *</label>
            <div class="input-icon">
              <span class="icon">📝</span>
              <input
                v-model="form.full_name"
                type="text"
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <span v-if="errors.full_name" class="error-msg">{{
              errors.full_name
            }}</span>
          </div>

          <div class="input-group" :class="{ error: errors.birth_date }">
            <label>Дата рождения *</label>
            <div class="input-icon">
              <span class="icon">🎂</span>
              <input v-model="form.birth_date" type="date" />
            </div>
            <span v-if="errors.birth_date" class="error-msg">{{
              errors.birth_date
            }}</span>
          </div>

          <div class="input-group" :class="{ error: errors.phone }">
            <label>Телефон *</label>
            <div class="input-icon">
              <span class="icon">📞</span>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="+7 (999) 999-99-99"
              />
            </div>
            <span v-if="errors.phone" class="error-msg">{{
              errors.phone
            }}</span>
          </div>

          <div class="input-group" :class="{ error: errors.email }">
            <label>E-mail *</label>
            <div class="input-icon">
              <span class="icon">✉️</span>
              <input
                v-model="form.email"
                type="email"
                placeholder="example@mail.ru"
              />
            </div>
            <span v-if="errors.email" class="error-msg">{{
              errors.email
            }}</span>
          </div>

          <div class="terms-group" :class="{ error: errors.terms }">
            <label class="checkbox">
              <input type="checkbox" v-model="agreeTerms" />
              <span
                >Я принимаю
                <a href="#" target="_blank"
                  >условия обработки персональных данных</a
                ></span
              >
            </label>
            <span v-if="errors.terms" class="error-msg">{{
              errors.terms
            }}</span>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>🚀 Зарегистрироваться</span>
          </button>
        </form>

        <div class="divider">
          <span>уже есть аккаунт?</span>
        </div>

        <button class="btn btn-outline" @click="router.push('/login')">
          🔑 Войти в систему
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Общие переменные (соответствуют странице логина) */
.register-page {
  display: flex;
  min-height: 100vh;
  font-family: "Segoe UI", Roboto, system-ui, sans-serif;
}

/* Левая панель */
.register-left {
  flex: 1.2;
  position: relative;
  overflow: hidden;
}

.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.register-left:hover .bg-img {
  transform: scale(1.03);
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(2, 62, 138, 0.85),
    rgba(0, 35, 80, 0.9)
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  backdrop-filter: blur(2px);
}

.brand {
  font-size: 46px;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand span {
  font-size: 52px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.overlay p {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 80%;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: repeating-linear-gradient(
    transparent 0px,
    transparent 29px,
    rgba(255, 255, 255, 0.2) 30px
  );
}

/* Правая панель с прокруткой (много полей) */
.register-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f8fafc 0%, #eef2f5 100%);
  padding: 32px 24px;
  overflow-y: auto;
}

.register-card {
  max-width: 480px;
  width: 100%;
  background: white;
  border-radius: 32px;
  padding: 36px 32px;
  box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.register-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 30px 50px -15px rgba(0, 0, 0, 0.25);
}

.card-header {
  text-align: center;
  margin-bottom: 28px;
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

/* Сообщения alert */
.alert {
  padding: 12px 16px;
  border-radius: 16px;
  margin-bottom: 24px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
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

.alert-icon {
  font-size: 18px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Поля ввода */
.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #1e2f3e;
  font-size: 14px;
}

.input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon .icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  color: #7f8c8d;
  pointer-events: none;
}

.input-icon input {
  width: 100%;
  padding: 14px 14px 14px 44px;
  font-size: 15px;
  border: 1px solid #e0e7ed;
  border-radius: 20px;
  background: #ffffff;
  transition: all 0.2s;
  outline: none;
}

.input-icon input:focus {
  border-color: #2c7da0;
  box-shadow: 0 0 0 3px rgba(44, 125, 160, 0.1);
}

.toggle-password {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  color: #7f8c8d;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #2c7da0;
}

.error-msg {
  display: block;
  font-size: 12px;
  color: #e53e3e;
  margin-top: 6px;
  margin-left: 12px;
}

.input-group.error input {
  border-color: #e53e3e;
}

/* Чекбокс согласия */
.terms-group {
  margin: 20px 0;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #3a5468;
  font-size: 13px;
}

.checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2c7da0;
}

.checkbox a {
  color: #2c7da0;
  text-decoration: none;
}

.checkbox a:hover {
  text-decoration: underline;
}

/* Кнопки */
.btn {
  width: 100%;
  padding: 14px;
  border-radius: 40px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(95deg, #0f4c5f, #1e6f5c);
  color: white;
  box-shadow: 0 8px 18px rgba(15, 76, 95, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: scale(1.02);
  background: linear-gradient(95deg, #0e4152, #1a5e4e);
  box-shadow: 0 10px 22px rgba(15, 76, 95, 0.3);
}

.btn-outline {
  background: transparent;
  border: 1.5px solid #1e6f5c;
  color: #1e6f5c;
}

.btn-outline:hover:not(:disabled) {
  background: #eef6f3;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
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

/* Разделитель */
.divider {
  text-align: center;
  margin: 24px 0 16px;
  position: relative;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 42%;
  height: 1px;
  background: #dce5ec;
}

.divider::before {
  left: 0;
}
.divider::after {
  right: 0;
}

.divider span {
  background: white;
  padding: 0 12px;
  color: #8ba0ae;
  font-size: 13px;
}

/* Адаптивность */
@media (max-width: 820px) {
  .register-left {
    display: none;
  }
  .register-right {
    flex: 1;
    padding: 20px;
  }
  .register-card {
    padding: 28px 20px;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 24px 16px;
    border-radius: 24px;
  }
  .brand {
    font-size: 34px;
  }
  .card-header h2 {
    font-size: 24px;
  }
}
</style>
