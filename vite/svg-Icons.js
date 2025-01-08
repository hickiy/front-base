import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';

export default function () {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
    symbolId: 'icon-[name]',
    inject: 'body-first',
  })
}

