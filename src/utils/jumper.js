import { ElMessage } from 'element-plus';
import { getSsoCode, getUrlForJumpToYs, yongyousso } from '@/api/common';
import useUserStore from '@/store/modules/user';

/*
 * oa审批单跳转
 * @param {String} fdId oa流程id
 * @param {Object} options 配置项
 * @param {String} options.ssoUrl sso登录地址
 * @param {String} options.targetUrl 目标地址
 * @param {Object} options.ssoParams sso登录参数
 * @param {Object} options.targetParams 目标参数
 */
export function toOa(
  fdId,
  { ssoUrl, targetUrl, ssoParams, targetParams } = {
    ssoUrl: '/pro/sso/connsso.do',
    targetUrl: '/km/review/km_review_main/kmReviewMain.do',
    ssoParams: {
      method: 'loginSSo',
      serverurl: null,
      code: null
    },
    targetParams: {
      method: 'view',
      fdId: null
    }
  }
) {
  const userStore = useUserStore();
  const oaDomain = import.meta.env.VITE_APP_OA_DOMAIN;
  targetParams.fdId = targetParams.fdId || fdId;
  if (fdId) {
    getSsoCode(userStore.id)
      .then((res) => {
        const targetParamsIncetance = new URLSearchParams(targetParams);
        const ssoParamsIncetance = new URLSearchParams(ssoParams);
        ssoParamsIncetance.set('code', res.data);
        ssoParamsIncetance.set('serverurl', `${oaDomain}${targetUrl}?${targetParamsIncetance.toString()}`);
        // 输出跳转信息
        console.log('\n', `sso登录地址：${oaDomain}${ssoUrl}`);
        console.log('\n', `sso登录方法：${ssoParamsIncetance.get('method')}`);
        console.log('\n', `ssoCode：${ssoParamsIncetance.get('code')}`);
        console.log('\n', `ssoServerurl：${oaDomain}${targetUrl}`);
        console.log('\n', `serveruriMethod：${targetParamsIncetance.get('method')}`);
        console.log('\n', `serverurlFdId：${targetParamsIncetance.get('fdId')}`);
        // 跳转
        const url = `${oaDomain}${ssoUrl}?${ssoParamsIncetance.toString()}`;
        window.open(url, '_blank');
      })
  } else {
    ElMessage.warning('流程id不存在，无法跳转到该审批单！');
  }
}

// 跳转到费控系统具体位置
export function toYsByUrl(url) {
  const userStore = useUserStore();
  getUrlForJumpToYs({ userId: userStore.jobNumber, ysUrl: url })
    .then((res) => {
      window.open(res.data, '_blank');
    });
}

export function toYsHome() {
  const userStore = useUserStore();
  yongyousso({
    userId: userStore.jobNumber
  }).then((res) => {
    window.open(res.data, '_blank');
  });
}
