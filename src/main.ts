import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import 'vue3-treeselect/dist/vue3-treeselect.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Treeselect from 'vue3-treeselect'
import { Transition } from 'vue'


import App from './App.vue'
import router from './router'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('Treeselect', Treeselect)
app.component('Transition', Transition);

// Use type assertion to fix TypeScript error
(app.config as any).compatConfig = {
  RENDER_FUNCTION: true
}

app.mount('#app')