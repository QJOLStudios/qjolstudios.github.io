import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Timer from './components/Timer.vue'
import UserAuth from './components/UserAuth.vue'
import NavBarAuth from './components/NavBarAuth.vue'
import UserProfile from './components/UserProfile.vue'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app }) {
    app.component('Timer', Timer)
    app.component('UserAuth', UserAuth)
    app.component('NavBarAuth', NavBarAuth)
    app.component('UserProfile', UserProfile)
  }
}
