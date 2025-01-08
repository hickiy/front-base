import request from '@/utils/request';

// pdf分页获取
export function getFrameByPageOfPdf(data) {
  return request({
    url: '/file/pdfFile/getPdfPageImage',
    method: 'post',
    responseType: 'blob',
    data,
    headers: {
      repeatSubmit: false
    }
  });
}

// 获取跳转oa的tiket
export function getSsoCode(userId) {
  return request({
    url: '/system/user/sso/' + userId + '/code',
    method: 'get'
  });
}

// 跳转费控系统制定位置的链接获取
export const getUrlForJumpToYs = params => request({
  method: 'get',
  url: '/integration/yongyou/getSsoToYSUrl',
  params
})

// 用友获取单点登录链接
export function yongyousso(params) {
  return request({
    url: `integration/yongyou/getSsoUrl`,
    method: 'get',
    params
  });
}

