import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Timer from './components/Timer.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Timer', Timer)
  }
}
