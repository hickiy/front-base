import { burialPoint } from '@/api/common';

export function trackEvent(operCode) {
  if (!operCode) return;
  burialPoint({
    operCode
  });
}
