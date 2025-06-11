import request from '@/utils/request';
import { parseStrEmpty } from '@/utils/sys';

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  });
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get'
  });
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data: data
  });
}

// 修改用户
export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data: data
  });
}

// 删除用户
export function delUser(userId) {
  return request({
    url: '/system/user/' + userId,
    method: 'delete'
  });
}

export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  };
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    data
  });
}

// 用户密码重置
export function resetUserPwd(userId, accountId, password) {
  const data = {
    userId,
    accountId,
    password
  };
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data: data
  });
}

// 用户状态修改
export function changeUserStatus(userId, accountId, status) {
  const data = {
    userId,
    accountId,
    status
  };
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: data
  });
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get'
  });
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data
  });
}

// 用户密码重置
export function modifyPwd(data) {
  return request({
    url: '/system/user/profile/updatePwd',
    data,
    method: 'put'
  });
}

// 强制修改密码
export function restPwd(data) {
  return request({
    url: '/system/user/resetDealerPwd',
    data,
    method: 'put'
  });
}

// 忘记密码的账号校验
export function validateAccount(params) {
  return request({
    url: '/batteryRental/dealer/accountCheck',
    method: 'get',
    params
  });
}

// 根据账号获取验证码
export function getCodeByAccount(params) {
  return request({
    url: '/batteryRental/dealer/getVerifyCode',
    method: 'get',
    params
  });
}

// 忘记密码提交
export function forgetSubmit(params) {
  return request({
    url: '/system/user/verify/updatePwd',
    method: 'get',
    params
  });
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: data
  });
}

// 查询授权角色
export function getAuthRole(userId) {
  return request({
    url: '/system/user/authRole/' + userId,
    method: 'get'
  });
}

// 保存授权角色
export function updateAuthRole(data) {
  return request({
    url: '/system/user/authRole',
    method: 'put',
    params: data
  });
}

// 生成邮件签名图片
export function emailWatermark(data) {
  return request({
    url: '/system/user/emailWatermark',
    method: 'post',
    data: data
  });
}

// 系统埋点操作
export function burialPoint(data) {
  return request({
    url: '/system/user/burialPoint',
    method: 'post',
    data: data,
    headers: {
      repeatSubmit: false
    }
  });
}

// 获取首页指定静态资源
export const indexResource = (data) =>
  request({
    method: 'post',
    data,
    url: '/system/user/indexResource'
  });
