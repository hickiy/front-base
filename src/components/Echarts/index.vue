<template>
  <div @mouseover="handleMouseOver" @mouseout="handleMouseOut" ref="el" class="echarts-panel echarts-main">
    <transition name="el-fade-in">
      <el-empty v-if="!isEmpty" />
    </transition>
  </div>
</template>
<script>
  // 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
  import * as echarts from 'echarts/core';
  // 引入柱状图图表，图表后缀都为 Chart
  import { BarChart, LineChart, PieChart } from 'echarts/charts';
  // 引入标题，提示框，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    GraphicComponent,
    LegendComponent,
    DataZoomComponent,
    ToolboxComponent
  } from 'echarts/components';
  // 标签自动布局、全局过渡动画等特性
  import { LabelLayout, UniversalTransition } from 'echarts/features';
  // 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
  import { CanvasRenderer } from 'echarts/renderers';

  // 注册必须的组件
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    GraphicComponent,
    LegendComponent,
    DataZoomComponent,
    ToolboxComponent,
    BarChart,
    LineChart,
    PieChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
  ]);

  export default {
    name: 'ECharts',
    props: ['autoTooltip'],
    data() {
      return {
        isEmpty: false, // 是否为空
        $echarts: null, // echarts实例
        $isMouseOver: false, // 鼠标是否在图表上
        $timer: null, // 定时器
        $currentIndex: 0, // 当前索引
        // 监听dom大小变化，自适应图表
        $resizeObserver: new ResizeObserver(() => {
          this.$data.$echarts?.resize();
        })
      };
    },
    onMounted() {
      this.$data.$resizeObserver.observe(this.$refs.el);
    },
    onUnmounted() {
      this.$data.$resizeObserver?.disconnect();
      clearInterval(this.$data.$timer);
    },
    methods: {
      // 初始化图表
      initChart() {
        // chart实例
        this.$data.$echarts = echarts.init(this.$refs.el);
        // 自动显示tooltip
        if (this.autoTooltip) {
          this.playTooltip();
        }
      },
      // 获取图表配置选项
      getOption() {
        return this.$data.$echarts.getOption();
      },
      // 设置图表数据
      setOption(option) {
        // 设置图表数据, 必须在渲染完成后调用，在dom宽高确定的情况下，否则echarts无法初始化图表canvas宽高
        this.$nextTick(() => {
          if (!this.$data.$echarts) {
            this.initChart();
          }
          if (option && Object.keys(option).length) {
            this.$data.$echarts.clear();
            this.$data.$echarts.setOption(option, true);
            this.isEmpty = false;
          } else {
            this.$data.$echarts.clear();
            this.isEmpty = true;
          }
        });
      },
      // 播放tooltip
      playTooltip() {
        const chart = this.$data.$echarts;
        this.$data.$timer = setInterval(() => {
          if (!this.isMouseOver) {
            const dataLen = chart.getOption().series[0].data.length;
            this.$data.$currentIndex = (this.$data.$currentIndex + 1) % dataLen;
            chart.dispatchAction({
              type: 'showTip',
              seriesIndex: 0,
              dataIndex: this.$data.$currentIndex
            });
          }
        }, 2000);
      },
      // 鼠标移入暂停播放
      handleMouseOver() {
        if (!this.autoTooltip) return;
        this.$data.$isMouseOver = true;
        clearInterval(this.$data.$timer);
      },
      // 鼠标移出继续播放
      handleMouseOut() {
        if (!this.autoTooltip) return;
        this.$data.$isMouseOver = false;
        this.playTooltip();
      }
    }
  };
</script>
<style lang="scss" scoped>
  .echarts-panel {
    user-select: none;
    position: relative;
  }
  .echarts-main {
    width: 100%;
    height: 100%;
  }
</style>
