import { ElMessage } from 'element-plus';
export const isLoading = ref(false); // 是否出于加载中
export default {
  msgError(msg) {
    ElMessage.error(msg);
  },
  loading() {
    isLoading.value = true;
  },
  loadingClose() {
    isLoading.value = false;
  }
}
