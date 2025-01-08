<template>
  <nav class="navbar">
    <div class="opener" @click="toggleSideBar">
      <el-icon size="1.5em">
        <Fold v-if="appStore.sidebar.opened"></Fold>
        <Expand v-else></Expand>
      </el-icon>
    </div>
    <a href="/">
      <img class="right-logo" src="@/assets/images/home_logo@2x.png" />
    </a>
    <el-divider direction="vertical"></el-divider>
    <div class="text-xl font-bold grow ml-2">{{ title }}</div>
    <el-icon><Bell /></el-icon>
    <div class="avatar-container pr-5">
      <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper flex items-center">
          <img src="@/assets/images/profile.jpg" class="user-avatar ml-5 mr-2" />
          <span class="text-sm font-bold">{{ userStore.name }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </nav>
</template>

<script setup name="Navbar">
import { ElIcon, ElMessageBox } from 'element-plus';
import useAppStore from '@/store/modules/app';
import useUserStore from '@/store/modules/user';

const appStore = useAppStore();
const userStore = useUserStore();

const title = import.meta.env.VITE_TITLE;

function toggleSideBar() {
  appStore.toggleSideBar();
}

function handleCommand(command) {
  switch (command) {
    case 'logout':
      logout();
      break;
    default:
      break;
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      userStore.logOut().then(() => {
        location.href = '/index';
      });
    })
    .catch(() => {});
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';
.navbar {
  height: $base-navbar-height;
  background: #ffffff;
  box-shadow: 0px 4px 4px 0px rgba(56, 85, 119, 0.07);
  display: flex;
  align-items: center;
  .opener {
    cursor: pointer;
    background-color: #e9eaef;
    width: 50px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 24px;
  }
  .right-logo{
    width: 140px;
  }
  .right-menu-item {
    display: inline-block;
    padding: 0 8px;
    font-size: 18px;
    color: #5a5e66;
    vertical-align: text-bottom;
    &.hover-effect {
      cursor: pointer;
    }
    .user-avatar {
      cursor: pointer;
      width: 24px;
      height: 24px;
      border-radius: 20px;
    }
  }
}
</style>
