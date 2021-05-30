<template>
  <v-chart class="chart" :option="heatmap" />
</template>

<script>
import axios from 'axios';

export default {
    name: "card",
    data() {
      return {
        heatmap: {},
        hours: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
                '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
                '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
                '21:00', '22:00', '23:00'],
        locations: ['Abila Airport',
                    'Abila Scrapyard',
                    'Abila Zacharo',
                    'Ahaggo Museum',
                    "Albert's Fine Clothing",
                    'Bean There Done That',
                    "Brew've Been Served",
                    'Brewed Awakenings',
                    'Carlyle Chemical Inc.',
                    'Chostus Hotel',
                    'Coffee Cameleon',
                    'Coffee Shack',
                    'Daily Dealz',
                    'Desafio Golf Course',
                    "Frank's Fuel",
                    "Frydos Autosupply n' More",
                    'Gelatogalore',
                    'General Grocer',
                    "Guy's Gyros",
                    'Hallowed Grounds',
                    'Hippokampos',
                    "Jack's Magical Beans",
                    'Kalami Kafenion',
                    'Katerina�s Caf�',
                    'Kronos Mart',
                    'Kronos Pipe and Irrigation',
                    'Maximum Iron and Steel',
                    'Nationwide Refinery',
                    "Octavio's Office Supplies",
                    'Ouzeri Elian',
                    'Roberts and Sons',
                    "Shoppers' Delight",
                    'Stewart and Sons Fabrication',
                    'U-Pump']
      }
    },
    mounted() {
      this.drawHeatmap();
    },
    methods: {
      drawHeatmap() {
        axios
        .get("http://localhost:5000/fetch_heatmap")
        .then(data => {
          console.log(data);
          this.heatmap = {
            tooltip: {
              position: "top"
            },
            animation: true,
            grid: {
              top: "5%"
            },
            xAxis: {
              type: 'category',
              data: this.hours,
              splitArea: {
                  show: true
              }
            },
            yAxis: {
              type: 'category',
              data: this.locations,
              splitArea: {
                  show: true
              }
            },
            visualMap: {
                  calculable: true,
                  orient: 'horizontal',
                  left: '91%',
                  bottom: '30%'
              },
              series: [{
                  type: 'heatmap',
                  data: data.data,
                  label: {
                      show: true
                  },
                  emphasis: {
                      itemStyle: {
                          shadowBlur: this.locations.length,
                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                      }
                  }
              }]
          }
        })
      }
    }
}
</script>

<style>
  .echarts {
    width: 100%;
    height: 100%;
  }
</style>