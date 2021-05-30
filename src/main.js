import Vue from "vue";
import ECharts from 'vue-echarts';
import App from "./App.vue";
import router from './router';
import vuetify from "./plugins/vuetify";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
} from 'echarts/components';
use([
  CanvasRenderer,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent
]);
Vue.component('v-chart', ECharts);
Vue.config.productionTip = false;
new Vue({
  router,
  vuetify,
  render: function (h) {
    return h(App);
  },
}).$mount("#app");
