<template>
  <div class="table-head-chart">
    <Echarts v-show="windowEnd" ref="thumbnail-line-chart" />
    <el-dialog class="ion-dialog" v-model="dialogVisible" :title="title" width="760px" top="15vh">
      <Echarts :autoTooltip="autoTooltip" ref="dialog-line-chart" class="h-95! mt-2.5" />
    </el-dialog>
  </div>
</template>

<script>
  import { graphic } from 'echarts/core';
  import arrowLeft from './arrow_left.webp';
  import arrowRight from './arrow_right.webp';
  export default {
    name: 'TableHeardChart',
    props: {
      // 标题
      title: {
        type: String,
        default: ''
      },
      // 图例标题
      legendTitle: {
        type: String,
        default: ''
      },
      // 是否自动播放tooltip
      autoTooltip: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        windowEnd: 0, // 窗口结束位置
        dialogVisible: false, // 弹窗显示
        $chartData: {} // 图表数据
      };
    },
    watch: {
      windowEnd() {
        this.setOption();
      },
      dialogVisible(val) {
        if (!val) return;
        this.$nextTick(() => {
          let option = this.getDialogOption(this.$data.$chartData);
          this.$refs['dialog-line-chart'].setOption(option);
        });
      }
    },
    methods: {
      init(data) {
        this.$data.$chartData = data;
        this.windowEnd = data.length;
        this.setOption();
      },
      setOption() {
        let option = this.getOption(this.$data.$chartData.slice(this.windowEnd > 5 ? this.windowEnd - 5 : 0, this.windowEnd));
        this.$refs['thumbnail-line-chart'].setOption(option);
      },
      next() {
        if (this.windowEnd + 5 < this.$data.$chartData.length) {
          this.windowEnd += 5;
        } else {
          this.windowEnd = this.$data.$chartData.length;
        }
      },
      prev() {
        if (this.windowEnd - 5 > 5) {
          this.windowEnd -= 5;
        } else {
          this.windowEnd = 5;
        }
      },
      getOption(data) {
        return {
          grid: {
            left: 50, // 左边距
            right: 145, // 右边距
            top: 0, // 上边距
            bottom: 0 // 下边距
          },
          color: ['#E5E6EB'],
          xAxis: {
            type: 'category',
            data: data.map((item) => item.x?.replace(/^\d{4}-/g, '')),
            boundaryGap: false,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              color: '#86909C',
              fontSize: 12,
              margin: -10
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: ['#A7BBEF'],
                type: 'dashed',
                dashOffset: 5
              }
            }
          },
          yAxis: {
            type: 'value',
            show: false,
            boundaryGap: ['40%', '40%']
          },
          series: [
            {
              data: data.map((item) => {
                // 计算中位数
                let arr = data.map((item) => item.y);
                let min = Math.min(...arr);
                let max = Math.max(...arr);
                let centerPoint = (min + max) / 2.15;
                return {
                  value: item.y,
                  label: {
                    position: data.length == 1 || item.y > centerPoint ? 'right' : 'top'
                  }
                };
              }),
              type: 'line',
              smooth: true,
              symbol: 'circle',
              symbolSize: 6,
              silent: true,
              label: {
                show: true,
                distance: 3,
                color: '#1E2E4E',
                textAlign: 'center',
                fontSize: 12,
                backgroundColor: '#fff',
                shadowColor: 'rgba(78,92,128,0.2)',
                shadowBlur: 8,
                padding: [2, 6],
                borderRadius: 4
              },
              areaStyle: {
                color: new graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: 'RGBA(65, 119, 255, 0.4)'
                  },
                  {
                    offset: 1,
                    color: 'RGBA(65, 119, 255, 0)'
                  }
                ])
              }
            }
          ],
          graphic: [
            {
              type: 'image',
              left: 0,
              top: 8,
              style: {
                image: arrowLeft,
                width: 30,
                height: 30
              },
              onclick: this.prev
            },
            {
              type: 'image',
              right: 70,
              top: 8,
              style: {
                image: arrowRight,
                width: 30,
                height: 30
              },
              onclick: this.next
            },
            {
              type: 'group',
              right: 20,
              top: 7,
              width: 40,
              height: 32,
              children: [
                {
                  type: 'rect',
                  style: {
                    fill: '#EBF2FB'
                  },

                  shape: {
                    width: '40',
                    height: '32',
                    r: 4
                  }
                },
                {
                  type: 'text',
                  left: 'center',
                  top: 'center',
                  style: {
                    text: '更多',
                    fill: '#637EA4'
                  }
                }
              ],
              onclick: () => {
                this.dialogVisible = true;
              }
            }
          ]
        };
      },
      getDialogOption(data) {
        return {
          grid: {
            left: 60, // 左边距
            right: 60, // 右边距
            top: 40, // 上边距
            bottom: 80 // 下边距
          },
          color: ['#4177FF'],
          toolbox: {
            feature: {
              restore: {},
              saveAsImage: {}
            }
          },
          legend: {
            show: true,
            icon: 'circle',
            itemStyle: {
              color: '#45B1FF',
              fontSize: 12
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              lineStyle: {
                color: '#C9CDD4',
                width: 1,
                type: 'solid'
              }
            },
            backgroundColor: '#fff',
            padding: [8, 12],
            textStyle: {
              color: '#1E2E4E',
              fontSize: 12
            },
            extraCssText: 'box-shadow: 0px 4px 16px 0px rgba(0,0,0,0.08);border-radius: 4px;'
          },
          xAxis: {
            type: 'category',
            data: data.map((item) => item.x),
            boundaryGap: false,
            axisLine: {
              show: false
            },
            axisTick: {
              lineStyle: {
                color: '#C9CDD4'
              }
            },
            axisLabel: {
              margin: 15,
              showMinLabel: true,
              showMaxLabel: true,
              formatter: (value, index) => {
                let dataZoom = this.$refs['dialog-line-chart'].getOption().dataZoom[0];
                if (index == 0 || index == dataZoom.endValue) {
                  return value;
                } else {
                  return value.replace(/^\d{4}-/g, '');
                }
              }
            }
          },
          yAxis: {
            type: 'value',
            show: true,
            name: '数量',
            nameGap: 25,
            offset: 40,
            axisLabel: {
              color: '#86909C',
              fontSize: 12,
              margin: -10
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#EDF1F5',
                type: 'dashed',
                dashOffset: 5
              }
            }
          },
          series: [
            {
              data: data.map((item) => item.y),
              name: this.legendTitle,
              type: 'line',
              smooth: true,
              areaStyle: {
                color: new graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: 'RGBA(65, 119, 255, 0.4)'
                  },
                  {
                    offset: 1,
                    color: 'RGBA(65, 119, 255, 0)'
                  }
                ])
              }
            }
          ],
          dataZoom: [
            {
              type: 'slider',
              left: 80,
              right: 80,
              labelFormatter: (value) => {
                return '';
              }
            }
          ],
          graphic: [
            {
              type: 'text',
              left: 0,
              bottom: 15,
              style: {
                text: data[0]?.x,
                fill: '#86909C',
                fontSize: 12
              }
            },
            {
              type: 'text',
              right: 0,
              bottom: 15,
              style: {
                text: data[data.length - 1]?.x,
                fill: '#86909C',
                fontSize: 12
              }
            }
          ]
        };
      }
    }
  };
</script>

<style></style>
