<template>
    <el-container>
        <el-col :span="12">
            <div class="grid-content bg-purple">
                <el-row>
                    <div class="range-slider">
                        <el-date-picker
                        v-model="time_range"
                        type="datetimerange"
                        value-format="yy-M-d HH:mm"
                        range-separator="To"
                        start-placeholder="Start date"
                        end-placeholder="End date"
                        @input="chooseTimeRange">
                        </el-date-picker>
                    </div>
                </el-row>
                <el-row>
                    <div class="route-map">
                        <img src="../assets/tourist.png" :width="svgWidth" :height="svgHeight" />
                        <svg class="map"></svg>
                    </div>
                </el-row>
            </div>
        </el-col>
            
        <el-col :span="12">
            <div class="grid-content bg-purple">
                <v-chart class="chart" :option="heatmap" />
            </div>
        </el-col>
  </el-container>
</template>

<script>
import * as d3 from "d3";
import axios from "axios";

export default {
    name: "trajectory",
    data() {
        return {
            time_range: [new Date(2014, 0, 6, 0, 0), new Date(2014, 0, 19, 23, 59)],
            start_time: null,
            end_time: null,
            svgWidth: 2710 / 3,
            svgHeight: 1598 / 3,
            mapContainer: null,
            projection: null,
            pathGenerator: null,
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
    mounted() {
        this.generateBackground();
        this.drawHeatmap();
    },
    created() {
        
    },
    methods: {
        generateBackground() {
            this.mapContainer = d3.select(".map")
                .attr("height", this.svgHeight)
                .attr("width", this.svgWidth);

            axios.get("http://localhost:5000/fetch_map")
            .then(abila => {
                // console.log(abila);
                this.projection = d3.geoIdentity().reflectY(true).fitSize([this.svgWidth,this.svgHeight], abila.data);
                var path = d3.geoPath(this.projection);
                this.pathGenerator = d3.geoPath().projection(this.projection);

                this.mapContainer.selectAll("path")
                    .data(abila.data.features)
                    .enter()
                    .append("path")
                    .attr("d",path)
                    .style("fill","none")
                    .style("stroke-width",1)
                    .style("stroke","#cc6600");
            });
        },
        drawPaths() {
            axios.get("http://localhost:5000/fetch_gps", {
                params: {
                    id: 19,
                    time_start: this.start_time,
                    time_end: this.end_time
                }
            })
            .then(car_paths => {
                this.mapContainer.append("path")
                    .attr("d", this.pathGenerator(car_paths.data))
                    .style("fill", "none")
                    .style("stroke-width",2)
                    .style("stroke", "steelblue");
            })
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
      },
      chooseTimeRange(e) {
        this.$nextTick(() => {
            if(e==null){
                this.start_time='';
                this.end_time='';
            }else{
                this.$set(this,"time_range", [e[0], e[1]]);
                this.start_time=this.time_range[0];
                this.end_time=this.time_range[1];
                this.drawPaths();                  
            }

        });
      }
    }
}
</script>

<style>
svg, img {
  position: absolute;
}

.el-main {
background-color: #E9EEF3;
color: #333;
text-align: center;
line-height: 160px;
}

.range-slider {
    margin: 10px;
}

.route-map {
    margin: 10px;
}
.chart {
    position: absolute;
  }
</style>