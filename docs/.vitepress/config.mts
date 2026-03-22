import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "QJOL Studios",
  description: "QJOL Studios' website",
  base: '/',
  vite: {
    assetsInclude: ['**/*.apk']
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '产品', link: '/products' },
      { text: '下载中心', link: '/download' }
    ],

    sidebar: [
      {
        text: '导航',
        items: [
          { text: '下载中心', link: '/download' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/QJOLStudios/' }
    ]
  }
})