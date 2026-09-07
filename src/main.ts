import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'

createApp(App).mount('#app')

if (import.meta.env.PROD) {
  void import('@vercel/analytics').then(({ inject }) => inject()).catch(() => undefined)
}
