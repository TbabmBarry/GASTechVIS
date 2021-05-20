<template>
    <v-app>
        <v-container
            fill-height
        >
            <v-col
                cols="4"
            >
                <v-card>
                    <v-list-item three-line>
                        <v-list-item-content>
                            <div class="overline mb-4">
                            LEGEND
                            </div>
                            <v-list-item-title class="headline mb-1">
                            Car ID
                            </v-list-item-title>
                            <v-list-item-subtitle>Select one specific car id to check its trajectory</v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-avatar
                            tile
                            size="80"
                            color="grey"
                        ></v-list-item-avatar>
                        </v-list-item>
                    <v-card-actions>
                        <v-select
                        :items="car_id"
                        filled
                        label="Select"
                        ></v-select>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col
                cols="8"
            >
                <svg class="chart"></svg>
            </v-col>
        </v-container>
  </v-app>
</template>

<script>
import * as d3 from "d3";
// import axios from "axios";

export default {
    name: "trajectory",
    data() {
        return {
            mapContainer: null,
            abila: null,
            car_paths: null,
            car_id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 101, 104, 105, 106, 107]
        }
    },
    mounted() {
        this.generateChart();
        // axios.get("http://localhost:5000/init_gps")
        //     .then(res => (this.car_paths = res.data));
    },
    methods: {
        generateChart() {
            const svgWidth = 900;
            const svgHeight = 600;
            const padding = 30;

            this.mapContainer = d3.select(".chart")
                .attr("height", svgHeight)
                .attr("width", svgWidth);

            const x0 = padding;
            const y0 = padding;
            const x1 = svgWidth - padding * 2;
            const y1 = svgHeight - padding * 2;

            Promise.all([
                d3.json("http://localhost:5000/fetch_map"),
                d3.json("http://localhost:5000/fetch_gps?id=30&time_start=14-01-7 07:00&time_end=14-1-7 17:00")
            ])
            .then(([abila, car_paths]) => {
                console.log(abila);
                console.log(car_paths);
                let projection = d3.geoMercator().fitExtent(
                    [
                        [x0, y0], //left upper coordinate
                        [x1, y1], //right lower coordinate
                    ], abila);

                let pathGenerator = d3.geoPath().projection(projection);

                // this.mapContainer.append("svg:image")
                //     .attr("xlink:href", require('../assets/MC2-tourist.jpg'))
                //     .attr("width", svgWidth)
                //     .attr("height", svgHeight)
                //     .attr("x", 0)
                //     .attr("y", 0);
                this.mapContainer.selectAll("path")
                    .data(abila.features) //data binding
                    .join("path")
                    .attr("d", pathGenerator) //draw path
                    .attr("stroke-width", 0.5)
                    .attr("stroke", "#000000")
                    .attr("fill", "#ffffff");
                this.mapContainer.append("path")
                    .attr("d", pathGenerator(car_paths))
                    .style("fill", "none")
                    .style("stroke", "orange");
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

</style>