<template>
  <div class="login w-screen h-screen">
    <!-- 登录输入框 -->
    <div class="content flex flex-col justify-around">
      <div class="form-sub-title">欢迎您进入运营管理中心！</div>
      <el-form class="login-form" ref="loginRef" :model="loginForm" :rules="loginRules" hide-required-asterisk>
        <el-form-item prop="username" label="账号">
          <el-input v-model="loginForm.username" prefix-icon="icon-user" type="text" auto-complete="user" placeholder="请输入账号或手机号">
          </el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            auto-complete="pwd"
            prefix-icon="icon-lock"
            placeholder="请输入密码（6-20个字符）"
            @keyup.enter.native="handleLogin"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div>
        <el-button :loading="loading" type="primary" style="width: 100%" @click.native.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </div>
    </div>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2021-2022 Ion Rocking. All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import Cookies from 'js-cookie';
import useUserStore from '@/store/modules/user';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: '',
  password: ''
});

const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }]
};

const loading = ref(false);
// 注册开关
const redirect = ref(undefined);

watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
  },
  { immediate: true }
);

function handleLogin() {
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      loading.value = true;
      // 调用action的登录方法
      userStore
        .login(loginForm.value)
        .then(() => {
          const query = route.query;
          const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
            if (cur !== 'redirect') {
              acc[cur] = query[cur];
            }
            return acc;
          }, {});
          router.push({ path: redirect.value || '/', query: otherQueryParams });
        })
        .catch(() => {
          loading.value = false;
        });
    }
  });
}

function getCookie() {
  const username = Cookies.get('username');
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username
  };
}
getCookie();
</script>

<style lang="scss" scoped>
.login {
  background: url('@/assets/login/login_logo_white@2x.png') 140px 60px / 140px auto no-repeat,
    url('@/assets/login/login_title_2@2x.png') center 80px / 507px auto no-repeat, url('@/assets/login/login_bg@2x.png') 0 0 / 100% no-repeat, #f7f8fa;
  display: grid;
  grid-template-rows: auto 38px;
  grid-template-columns: 100%;
  justify-items: center;
  align-items: center;
}
.content {
  margin-top: 120px;
  width: 860px;
  height: 460px;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0px 7.98px 19.98px 1.02px rgba(14, 54, 122, 0.1);
  padding: 30px 40px 30px 480px;
  background: url('@/assets/login/login_img@2x.png') 19.98px center / 420px auto no-repeat, #ffffff;
  .type-change {
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background-size: 100%;
  }
}
.form-title {
  font-size: 24px;
  color: #1e2e4e;
}
.form-sub-title {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 30px;
}
.login-form {
  &:deep(.el-form-item__label) {
    font-size: 14px;
    color: #1e2e4e;
  }
  .el-input__inner {
    text-indent: 10px;
    border-color: transparent;
    background: #f5f7fa;
    &:hover {
      border-color: #c9cdd4;
    }
    &:focus {
      background: #e8f3ff;
      border-color: #165dff;
    }
  }
  .el-input__icon {
    font-size: 16px !important;
  }
  .el-input__prefix {
    left: 10px !important;
  }
  .el-input__suffix {
    right: 10px !important;
  }
  .el-form-item__error {
    left: initial;
    right: 0;
  }
}
.agreement {
  margin-top: 12px;
}
.el-login-footer {
  color: #80a1de;
  font-size: 12px;
}
</style>
