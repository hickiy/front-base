import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import createAutoImport from './auto-import'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import tailwindcss from '@tailwindcss/vite'
import SvgIcons from './svg-Icons'


export default function createVitePlugins(viteEnv, isBuild = false) {
    const vitePlugins = []
    vitePlugins.push(vue())
    vitePlugins.push(vueJsx())
    vitePlugins.push(createAutoImport())
    vitePlugins.push(createSetupExtend())
    vitePlugins.push(tailwindcss())
    vitePlugins.push(SvgIcons())
    isBuild && vitePlugins.push(...createCompression(viteEnv))
    return vitePlugins
}
