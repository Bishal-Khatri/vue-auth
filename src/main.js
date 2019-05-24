import Vue from 'vue'
import App from './App.vue'

import router from './router'
import store from './store'
import axios from 'axios'

axios.defaults.baseURL = "https://axios-e60a7.firebaseio.com";
// axios.defaults.headers.common['Authorization'] = 'token';
axios.defaults.headers.get['Accepts'] = 'application/json';

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
