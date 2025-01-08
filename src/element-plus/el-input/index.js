/*  hickey 2023/11/7 */
import { ElInput } from 'element-plus';
export default {
  extends: ElInput,
  props: {
    decimal: Number
  },
  setup(props, ctx) {
    const render = ElInput.setup(props, ctx);
    const instance = getCurrentInstance();
    const updateModelValue = instance.vnode?.props?.['onUpdate:modelValue'];
    const wrapFn = (value) => {
      if (updateModelValue) {
        const [integer, decimal] = value.split('.');
        if (decimal?.length > props.decimal) {
          updateModelValue(`${integer}.${decimal.slice(0, props.decimal)}`);
        } else {
          updateModelValue(value)
        }
      }
    };
    const mousewheel = (e) => e.preventDefault();
    return (...args) => {
      const vnode = render(...args)
      if (props.type == 'number' && props.decimal != null) {
        instance.vnode.props['onUpdate:modelValue'] = wrapFn;
      }
      if (props.type == 'number') {
        vnode.props['onMousewheel'] = mousewheel;
      }
      return vnode;
    };
  }
};
