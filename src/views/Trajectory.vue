<template>
  <el-container>
    <!-- <el-row>
      <el-date-picker
        v-model="time_range"
        type="datetimerange"
        value-format="yy-M-d HH:mm"
        range-separator="To"
        start-placeholder="Start date"
        end-placeholder="End date"
        @input="chooseTimeRange"
      >
      </el-date-picker>
    </el-row> -->
    <el-row>
      <el-col :span="24">
        <div class="png-background">
          <img
            src="../assets/tourist.png"
            :width="svgWidth"
            :height="svgHeight"
          />
        </div>
        <div class="svg-layer">
          <svg class="map"></svg>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="time-brush">
        <svg class="brush"></svg>
      </el-col>
    </el-row>
  </el-container>
</template>

<script>
import * as d3 from "d3";
import axios from "axios";
import moment from "moment";
import * as d3Chromatic from "d3-scale-chromatic";

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
      abila: null,
      car_paths: null,
      car_id: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 101, 104,
        105, 106, 107,
      ],
    };
  },
  mounted() {
    this.generateBackground();
    this.sliderSnap();
  },
  created() {},
  methods: {
    generateBackground() {
      this.mapContainer = d3
        .select(".map")
        .attr("height", this.svgHeight)
        .attr("width", this.svgWidth);

      axios.get("http://localhost:5000/fetch_map").then((abila) => {
        // console.log(abila);
        this.projection = d3
          .geoIdentity()
          .reflectY(true)
          .fitSize([this.svgWidth, this.svgHeight], abila.data);
        var path = d3.geoPath(this.projection);
        this.pathGenerator = d3.geoPath().projection(this.projection);

        this.mapContainer
          .selectAll("path")
          .data(abila.data.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("fill", "none")
          .style("stroke-width", 1)
          .style("stroke", "#cc6600");
      });
    },
    drawPaths() {
      axios
        .get("http://localhost:5000/fetch_gps", {
          params: {
            id: 19,
            time_start: this.start_time,
            time_end: this.end_time,
          },
        })
        .then((car_paths) => {
          d3.select("#id").remove();
          let pathGenerator = d3.geoPath().projection(this.projection);
          let color = d3.scaleSequential(d3Chromatic.interpolateTurbo);
          let num = car_paths.data.features.length;
          this.mapContainer
            .selectAll()
            .data(car_paths.data.features)
            .enter()
            .append("path")
            .attr("d", function (d) {
              return pathGenerator(d.geometry);
            })
            .attr("fill", "none")
            .attr("id", "id")
            .style("stroke-width", 4)
            .style("stroke", function (d) {
              console.log(color(d.properties.path_id / num));
              return color(d.properties.path_id / num);
            });
        });
    },
    sliderSnap() {
      let range = [
        Math.round(new Date(2014, 0, 6, 0, 0).getTime() / 60000),
        Math.round(new Date(2014, 0, 6, 23, 59).getTime() / 60000),
      ];
      let w = 1800;
      let h = 300;
      let margin = {
        top: 130,
        bottom: 135,
        left: 80,
        right: 80,
      };
      // dimensions of slider bar
      let width = w - margin.left - margin.right;
      let height = h - margin.top - margin.bottom;

      // create x scale
      let x = d3
        .scaleLinear()
        .domain(range) // data space
        .range([0, width]); // display space
      let svg = d3.select(".brush").attr("height", h).attr("width", w);
      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      // draw background lines
      g.append("g")
        .selectAll("line")
        .data(d3.range(range[0], range[1] + 1))
        .enter()
        .append("line")
        .attr("x1", (d) => x(d))
        .attr("x2", (d) => x(d))
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", "#ccc");
      // labels
      let labelL = g
        .append("text")
        .attr("id", "labelleft")
        .attr("x", 0)
        .attr("y", height + 5)
        .text(range[0]);

      let labelR = g
        .append("text")
        .attr("id", "labelright")
        .attr("x", 0)
        .attr("y", height + 5)
        .text(range[1]);

      // define brush
      let vm = this;
      let brush = d3
        .brushX()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("brush", function (event) {
          var s = event.selection;
          // update and move labels
          labelL
            .attr("x", s[0])
            .text(
              moment
                .unix(Math.round(x.invert(s[0])) * 60)
                .format("MM-DD HH:mm:ss")
            );
          labelR
            .attr("x", s[1])
            .text(
              moment
                .unix((Math.round(x.invert(s[1])) - 1) * 60)
                .format("MM-DD HH:mm:ss")
            );
          // move brush handles
          handle.attr("display", null).attr("transform", function (d, i) {
            return "translate(" + [s[i], -height / 4] + ")";
          });
          // update view
          // if the view should only be updated after brushing is over,
          // move these two lines into the on('end') part below
          svg.node().value = s.map((d) => Math.round(x.invert(d)));
          svg.node().dispatchEvent(new CustomEvent("input"));
        })
        .on("end", function (event) {
          if (!event.sourceEvent) return;
          var d0 = event.selection.map(x.invert);
          var d1 = d0.map(Math.round);
          let query = [
            moment.unix(d1[0] * 60).format("YY-M-D HH:mm"),
            moment.unix(d1[1] * 60).format("YY-M-D HH:mm"),
          ];
          vm.chooseTimeRange(query);
          d3.select(this).transition().call(event.target.move, d1.map(x));
        });

      // append brush to g
      var gBrush = g.append("g").attr("class", "brush").call(brush);

      // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
      var brushResizePath = function (d) {
        var e = +(d.type == "e"),
          x = e ? 1 : -1,
          y = height / 2;
        return (
          "M" +
          0.5 * x +
          "," +
          y +
          "A6,6 0 0 " +
          e +
          " " +
          6.5 * x +
          "," +
          (y + 6) +
          "V" +
          (2 * y - 6) +
          "A6,6 0 0 " +
          e +
          " " +
          0.5 * x +
          "," +
          2 * y +
          "Z" +
          "M" +
          2.5 * x +
          "," +
          (y + 8) +
          "V" +
          (2 * y - 8) +
          "M" +
          4.5 * x +
          "," +
          (y + 8) +
          "V" +
          (2 * y - 8)
        );
      };

      var handle = gBrush
        .selectAll(".handle--custom")
        .data([{ type: "w" }, { type: "e" }])
        .enter()
        .append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "#000")
        .attr("fill", "#eee")
        .attr("cursor", "ew-resize")
        .attr("d", brushResizePath);

      // override default behaviour - clicking outside of the selected area
      // will select a small piece there rather than deselecting everything
      // https://bl.ocks.org/mbostock/6498000
      gBrush
        .selectAll(".overlay")
        .each(function (d) {
          d.type = "selection";
        })
        .on("mousedown touchstart", brushcentered);

      function brushcentered() {
        var dx = x(1) - x(0), // Use a fixed width when recentering.
          cx = d3.pointer(this)[0],
          x0 = cx - dx / 2,
          x1 = cx + dx / 2;
        d3.select(this.parentNode).call(
          brush.move,
          x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]
        );
      }

      // select entire range
      gBrush.call(brush.move, range.map(x));
    },
    chooseTimeRange(e) {
      this.$nextTick(() => {
        if (e == null) {
          this.start_time = "";
          this.end_time = "";
        } else {
          this.$set(this, "time_range", [e[0], e[1]]);
          this.start_time = this.time_range[0];
          this.end_time = this.time_range[1];
          this.drawPaths();
        }
      });
    },
  },
};
</script>

<style>
.png-background,
.svg-layer {
  position: absolute;
}

.route-map {
  margin: 10px;
}

.time-brush {
  margin: 10px;
  top: 550px;
  position: absolute;
}

rect.overlay {
  stroke: black;
}

rect.selection {
  stroke: none;
  fill: steelblue;
  fill-opacity: 0.6;
}

#labelleft,
#labelright {
  dominant-baseline: hanging;
  font-size: 12px;
}

#labelleft {
  text-anchor: end;
}

#labelright {
  text-anchor: start;
}
.chart {
  position: absolute;
}
</style>
