import Vue, { createApp } from "vue";
import ECharts from "vue-echarts";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import locale from "element-ui/lib/locale/lang/en";

import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
} from "echarts/components";
use([
  CanvasRenderer,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
]);
Vue.use(ElementUI, { locale });
Vue.component("v-chart", ECharts);
createApp({
  vuetify,

  render: function (h) {
    return h(App);
  },
})
  .use(router)
  .mount("#app");
