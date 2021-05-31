<template>
    <v-app>
        <v-container
            fill-height
        >
        <img src="../assets/tourist.png" :width="svgWidth" :height="svgHeight" />
        <svg class="chart"></svg>
        </v-container>
  </v-app>
</template>

<script>
import * as d3 from "d3";
// import axios from "axios";
// import topojson from "topojson";

export default {
    name: "trajectory",
    data() {
        return {
            svgWidth: 2710 / 4,
            svgHeight: 1598 / 4,
            mapContainer: null,
            abila: null,
            car_paths: null,
            car_id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 101, 104, 105, 106, 107]
        }
    },
    mounted() {
        this.generateChart();
    },
    methods: {
        generateChart() {

            this.mapContainer = d3.select(".chart")
                .attr("height", this.svgHeight)
                .attr("width", this.svgWidth);

            Promise.all([
                d3.json("http://localhost:5000/fetch_map"),
                d3.json("http://localhost:5000/fetch_gps?id=30&time_start=14-01-7 07:00&time_end=14-1-7 17:00")
            ])
            .then(([abila, car_paths]) => {
                console.log(abila);
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

        }
    }
}
</script>

<style>
svg, img {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
}
</style>