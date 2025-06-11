import request from '@/utils/request';

// 查询模块信息列表
export function listModule(query) {
  return request({
    url: '/system/module/list',
    method: 'get',
    params: query
  });
}

// 查询模块信息详细
export function getModule(moduleId) {
  return request({
    url: '/system/module/' + moduleId,
    method: 'get'
  });
}

// 新增模块信息
export function addModule(data) {
  return request({
    url: '/system/module',
    method: 'post',
    data: data
  });
}

// 修改模块信息
export function updateModule(moduleId, status) {
  const data = { moduleId, status };
  return request({
    url: '/system/module',
    method: 'put',
    data: data
  });
}

// 修改模块信息
export function updateModuleInfo(data) {
  return request({
    url: '/system/module',
    method: 'put',
    data
  });
}

// 删除模块信息
export function delModule(moduleId) {
  return request({
    url: '/system/module/' + moduleId,
    method: 'delete'
  });
}

// 获取单点登录code
export function getSsoCode(userId) {
  return request({
    url: '/system/user/sso/' + userId + '/code',
    method: 'get'
  });
}
