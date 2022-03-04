import { createApp } from 'vue'
import Antd from 'ant-design-vue';
import App from './App.vue'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons-vue';

import "ant-design-vue/dist/antd.css"
import './assets/css/index.less'

const app = createApp(App);
app.use(Antd);

app.component('PlusOutlined', PlusOutlined)
  .component('MinusCircleOutlined', MinusCircleOutlined)

app.mount('#app')
