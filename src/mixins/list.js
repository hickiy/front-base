
export default {
  data() {
    return {
      loading: false, // 加载状态
      total: 0, // 总条数
      pageSize: 20, // 每页条数
      pageSizes: [20, 50, 100, 500, 1000], // 每页条数选项参数
      currentPage: 1, // 当前页数
    };
  },
  computed: {
    _pageInfo() {
      return { pageNum: this.currentPage, pageSize: this.pageSize }
    }
  },
  methods: {
    // 查询数据
    // 每页条数变化时
    sizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.search();
    },
    // 页码切换时
    currentChange(val) {
      this.currentPage = val;
      this.search();
    },
  },
};
