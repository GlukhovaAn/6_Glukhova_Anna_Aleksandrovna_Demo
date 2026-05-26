<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";


const router = useRouter();
const auth = useAuthStore();


const login = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const showPassword = ref(false);
const rememberMe = ref(false);


async function submit() {
  error.value = "";
  if (!login.value || !password.value) {
    error.value = "Заполните все поля";
    return;
  }
  loading.value = true;
  try {
    await auth.login(login.value, password.value);
    router.push("/cabinet");
  } catch (e) {
    error.value = e.response?.data?.message || "Неверный логин или пароль";
  } finally {
    loading.value = false;
  }
}


async function adminSubmit() {
  error.value = "";
  if (!login.value || !password.value) {
    error.value = "Заполните все поля";
    return;
  }
  loading.value = true;
  try {
    await auth.adminLogin(login.value, password.value);
    router.push("/admin");
  } catch (e) {
    error.value = e.response?.data?.message || "Неверный логин или пароль";
  } finally {
    loading.value = false;
  }
}
</script>


<template>
  <div class="login-page">
    <div class="login-left">
      <img src="/images/5.jpg" alt="Банкетам.Нет" class="bg-img" />
      <div class="overlay">
        <div class="brand">Банкетам.Нет</div>
        <p>Бронирование банкетных залов и помещений</p>
        <div class="wave"></div>
      </div>
    </div>


    <div class="login-right">
      <div class="login-card">
        <div class="card-header">
          <h2>Добро пожаловать</h2>
          <p>Войдите, чтобы продолжить</p>
        </div>


        <transition name="fade">
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>
        </transition>


        <form @submit.prevent="submit">
          <div class="input-group">
            <label>Логин</label>
            <div class="input-icon">
              <span class="icon"></span>
              <input
                v-model="login"
                type="text"
                placeholder="Введите логин"
                autocomplete="username"
              />
            </div>
          </div>


          <div class="input-group">
            <label>Пароль</label>
            <div class="input-icon">
              <span class="icon"></span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Введите пароль"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? "Скрыть" : "Показать" }}
              </button>
            </div>
          </div>


          <div class="options">
            <label class="checkbox">
              <input type="checkbox" v-model="rememberMe" />
              <span>Запомнить меня</span>
            </label>
            <a href="#" class="forgot-link">Забыли пароль?</a>
          </div>


          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Войти как пользователь</span>
          </button>
        </form>


        <div class="divider">
          <span>или</span>
        </div>


        <button
          class="btn btn-outline"
          @click="adminSubmit"
          :disabled="loading"
        >
          Войти как администратор
        </button>


        <p class="register-link">
          Нет аккаунта?
          <router-link to="/register">Зарегистрироваться</router-link>
        </p>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Переменные и общие стили */
.login-page {
  display: flex;
  min-height: 100vh;
  font-family: "Segoe UI", Roboto, system-ui, sans-serif;
}


/* Левая панель с изображением */
.login-left {
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


.login-left:hover .bg-img {
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


/* Правая панель */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f8fafc 0%, #eef2f5 100%);
  padding: 24px;
}


.login-card {
  max-width: 420px;
  width: 100%;
  background: white;
  border-radius: 32px;
  padding: 40px 32px;
  box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}


.login-card:hover {
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


/* Ошибка */
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
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  color: #7f8c8d;
  transition: color 0.2s;
}


.toggle-password:hover {
  color: #2c7da0;
}


/* Чекбокс и forgot */
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  font-size: 13px;
}


.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #3a5468;
}


.checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2c7da0;
}


.forgot-link {
  color: #2c7da0;
  text-decoration: none;
  font-weight: 500;
}


.forgot-link:hover {
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
  margin: 24px 0;
  position: relative;
}


.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
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


/* Ссылка регистрации */
.register-link {
  text-align: center;
  margin-top: 28px;
  font-size: 14px;
  color: #5e7a93;
}


.register-link a {
  color: #1e6f5c;
  font-weight: 600;
  text-decoration: none;
  margin-left: 5px;
}


.register-link a:hover {
  text-decoration: underline;
}


/* Адаптивность */
@media (max-width: 820px) {
  .login-left {
    display: none;
  }
  .login-right {
    flex: 1;
  }
  .login-card {
    padding: 32px 24px;
  }
}


@media (max-width: 480px) {
  .login-card {
    padding: 28px 20px;
    border-radius: 24px;
  }
  .brand {
    font-size: 34px;
  }
  .options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>



