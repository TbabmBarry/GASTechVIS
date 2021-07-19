<template>
  <v-chart class="chart" :option="heatmap" />
</template>

<script>
import axios from "axios";

export default {
  name: "card",
  data() {
    return {
      heatmap: {},
      hours: [
        "00:00",
        "01:00",
        "02:00",
        "03:00",
        "04:00",
        "05:00",
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
      ],
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    };
  },
  mounted() {
    this.drawHeatmap();
  },
  methods: {
    drawHeatmap() {
      axios.get("http://localhost:5000/fetch_heatmap").then((data) => {
        console.log(data);
        this.heatmap = {
          tooltip: {
            position: "top",
          },
          animation: true,
          grid: [
            {
              top: "5%",
              right: "55%",
            },
            {
              top: "5%",
              left: "55%",
            },
          ],
          xAxis: [
            {
              type: "category",
              data: this.hours,
              splitArea: {
                show: true,
              },
              gridIndex: 0,
            },
            {
              type: "category",
              data: this.days,
              splitArea: {
                show: true,
              },
              gridIndex: 1,
            },
          ],
          yAxis: [
            {
              type: "category",
              data: data.data.cc[1],
              splitArea: {
                show: true,
              },
              gridIndex: 0,
            },
            {
              type: "category",
              data: data.data.loyalty[1],
              splitArea: {
                show: true,
              },
              gridIndex: 1,
            },
          ],
          visualMap: [
            {
              min: 0,
              max: data.data.cc[2],
              calculable: true,
              orient: "vertical",
              right: "52%",
              bottom: "10%",
              seriesIndex: 0,
            },
            {
              min: 0,
              max: data.data.loyalty[2],
              calculable: true,
              orient: "vertical",
              left: "93%",
              bottom: "10%",
              seriesIndex: 1,
            },
          ],
          series: [
            {
              name: "credit card",
              type: "heatmap",
              data: data.data.cc[0],
              xAxisIndex: 0,
              yAxisIndex: 0,
              label: {
                show: true,
              },
              emphasis: {
                itemStyle: {
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
            },
            {
              name: "loyalty",
              type: "heatmap",
              data: data.data.loyalty[0],
              xAxisIndex: 1,
              yAxisIndex: 1,
              label: {
                show: true,
              },
              emphasis: {
                itemStyle: {
                  shadowColor: "#171716",
                },
              },
            },
          ],
        };
      });
    },
  },
};
</script>

<style>
.echarts {
  width: 100%;
  height: 100%;
}
</style>
