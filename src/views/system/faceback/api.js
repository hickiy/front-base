import request from '@/utils/request';
// 查询意见反馈列表
export const backList = params => request({
  params,
  method: 'get',
  url: '/system/back/list'
})