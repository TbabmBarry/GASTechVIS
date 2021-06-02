<template>
    <v-app>
        <v-container
            fill-height
        >
            <v-row
                class="mb-16"
                no-gutters
            >
                <v-col
                    cols="6"
                    sm="4"
                    md="6"
                >
                <div class="range-slider">
                    <vue-range-slider v-model="value" :min="min" :max="max" :enable-cross="enableCross"></vue-range-slider>
                </div>
                    <img src="../assets/tourist.png" :width="svgWidth" :height="svgHeight" />
                    <svg class="map"></svg>
                </v-col>
                <v-col
                    cols="6"
                    sm="4"
                    md="6"
                >
                    <v-chart class="chart" :option="heatmap" />
                </v-col>
            </v-row>
        </v-container>
  </v-app>
</template>

<script>
import * as d3 from "d3";
import axios from "axios";
import 'vue-range-component/dist/vue-range-slider.css';
import VueRangeSlider from 'vue-range-component';

export default {
    name: "trajectory",
    data() {
        return {
            value: [0,100],
            svgWidth: 2710 / 4,
            svgHeight: 1598 / 4,
            mapContainer: null,
            heatmap: {},
            hours: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
                    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
                    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
                    '21:00', '22:00', '23:00'],
            abila: null,
            car_paths: null,
            car_id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 101, 104, 105, 106, 107]
        }
    },
    components: {
        VueRangeSlider
    },
    mounted() {
        this.generateChart();
        this.drawHeatmap();
    },
    created() {
        this.min = 0
        this.max = 250
        this.enableCross = false
    },
    methods: {
        generateChart() {
            this.mapContainer = d3.select(".map")
                .attr("height", this.svgHeight)
                .attr("width", this.svgWidth);

            Promise.all([
                d3.json("http://localhost:5000/fetch_map"),
                d3.json("http://localhost:5000/fetch_gps?id=30&time_start=14-01-7 07:00&time_end=14-1-7 17:00")
            ])
            .then(([abila, car_paths]) => {
                // console.log(abila);
                var projection = d3.geoIdentity().reflectY(true).fitSize([this.svgWidth,this.svgHeight], abila);
                var path = d3.geoPath(projection);
                let pathGenerator = d3.geoPath().projection(projection);

                this.mapContainer.selectAll("path")
                    .data(abila.features)
                    .enter()
                    .append("path")
                    .attr("d",path)
                    .style("fill","none")
                    .style("stroke-width",1)
                    .style("stroke","#cc6600");
                this.mapContainer.append("path")
                    .attr("d", pathGenerator(car_paths))
                    .style("fill", "none")
                    .style("stroke-width",2)
                    .style("stroke", "steelblue");
            })

            const zoom = d3.zoom()
                .on('zoom', (event) => {
                    this.mapContainer.attr('transform', event.transform);
                })
                .scaleExtent([1, 40]);
            this.mapContainer.call(zoom).append('g');

        },
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
                grid: [{
                top: "5%",
                right: "55%",
                }],
                xAxis: [{
                    type: 'category',
                    data: this.hours,
                    splitArea: {
                        show: true
                    },
                    gridIndex: 0
                }],
                yAxis: [{
                    type: 'category',
                    data: data.data.cc[1],
                    splitArea: {
                        show: true
                    },
                    gridIndex: 0
                }],
                visualMap: [{
                    min: 0,
                    max: data.data.cc[2],
                    calculable: true,
                    orient: 'vertical',
                    right: '52%',
                    bottom: '10%',
                    seriesIndex: 0
                }],
                series: [{
                    name: 'credit card',
                    type: 'heatmap',
                    data: data.data.cc[0],
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    label: {
                        show: true
                    },
                    emphasis: {
                        itemStyle: {
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
svg, img {
  position: absolute;
  top: 50;
  left: 20;
  margin: 0;
  padding: 0;
}
.range-slider {
  padding:40px 15px;
}
.chart {
    position: absolute;
    top: 0;
    right: 20;
    margin: 0;
    padding: 0;
    height: 500;
  }
</style>