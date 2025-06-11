import { ElPagination } from "element-plus";
export default {
  extends: ElPagination,
  props: {
    size: {
      type: String,
      default: 'default'
    },
  },
  setup: ElPagination.setup
}