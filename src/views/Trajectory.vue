<template>
  <div class="container">
    <el-row :gutter="20">
      <el-col :span="8" style="height: 100%">
        <el-table
          :data="tableData"
          ref="multipleTable"
          height="550"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="45"> </el-table-column>
          <el-table-column prop="LastName" label="LastName" width="90">
          </el-table-column>
          <el-table-column prop="FirstName" label="FirstName" width="90">
          </el-table-column>
          <el-table-column prop="CarID" label="CarID" width="90">
          </el-table-column>
          <el-table-column
            prop="CurrentEmploymentType"
            label="CurrentEmploymentType"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="CurrentEmploymentTitle"
            label="CurrentEmploymentTitle"
            width="120"
          ></el-table-column>
        </el-table>
        <div style="margin-top: 20px">
          <el-button @click="toggleSelection()">Cancel Selection</el-button>
          <el-button @click="renderPaths()">Query</el-button>
        </div>
      </el-col>
      <el-col :span="16" style="height: 100%">
        <img
          src="../assets/tourist.png"
          :width="svgWidth"
          :height="svgHeight"
        />
        <svg class="map"></svg>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="time-brush">
          <svg class="brush"></svg>
        </div>
      </el-col>
    </el-row>
  </div>
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
</template>

<script>
import * as d3 from "d3";
import axios from "axios";
import moment from "moment";
import * as d3Chromatic from "d3-scale-chromatic";
import d3Tip from "d3-tip";
import tableData from "../static/carAssignment.json";
import locationInfo from "../static/locationInfo.json";
// import { tip as d3tip } from "d3-v6-tip";

// const d3 = {
//   ...d3module,
//   tip: d3tip,
// };
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
      multipleSelection: [],
      abila: null,
      car_paths: null,
      tableData: tableData.data,
      locationInfo: locationInfo.data,
    };
  },
  computed: {},
  mounted() {
    this.initialize();
  },
  created() {},
  methods: {
    initialize() {
      this.generateBackground();
      this.sliderSnap();
    },
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
    drawPaths(car_ids) {
      axios
        .get("http://localhost:5000/fetch_gps", {
          params: {
            id: car_ids,
            time_start: this.start_time,
            time_end: this.end_time,
          },
        })
        .then((car_paths) => {
          d3.select("#id").remove();
          let pathGenerator = d3.geoPath().projection(this.projection);
          let color = d3.scaleSequential(d3Chromatic.interpolateTurbo);
          let vm = this;
          let tip = d3Tip()
            .attr("class", "d3-tip")
            .offset([-20, 0])
            .html(function (d) {
              for (let i = 0; i < vm.tableData.length; i++) {
                if (vm.tableData[i]["CarID"] == d.properties.car_id) {
                  var lastname = vm.tableData[i]["LastName"];
                  var firstname = vm.tableData[i]["FirstName"];
                }
              }
              return (
                "<div style = 'background-color:black; opacity:0.8; color: #fff;border-radius: 2px; " +
                "line-height: 1;font-weight: bold; padding: 12px;' > " +
                "<span style='color:violet'>" +
                firstname +
                " " +
                lastname +
                "</span><br>TimeStamp:<span style='color:pink'>" +
                d.properties.time[0] +
                " " +
                d.properties.time[1] +
                "</div>"
              );
            });
          this.mapContainer.call(tip);
          for (const [id, paths] of Object.entries(car_paths.data)) {
            this.mapContainer
              .selectAll()
              .data(paths[0].features)
              .enter()
              .append("path")
              .attr("d", function (d) {
                return pathGenerator(d.geometry);
              })
              .attr("fill", "none")
              .attr("id", function (d) {
                return d.properties.path_id;
              })
              .style("stroke-width", 4)
              .style("stroke", function () {
                let normalized_id = (id - 1) / (35 - 1);
                return color(normalized_id);
              })
              .on("mouseover", function (event, d) {
                d3.select(this).style("stroke-width", 6);
                tip.show(d, this);
              })
              .on("mouseout", function (event, d) {
                d3.select(this).style("stroke-width", 4);
                tip.hide(d, this);
              });
            for (let i = 0; i < this.locationInfo.length; i++) {
              var isDraw = false;
              for (let j = 0; j < paths[0].features.length; j++) {
                let curr = paths[0].features[j];
                if (isDraw) break;
                for (let k = 0; k < curr.geometry.coordinates.length; k++) {
                  if (
                    this.getDistanceFromLatLon(
                      this.locationInfo[i].Coords,
                      curr.geometry.coordinates[k]
                    ) < 0.05
                  ) {
                    this.drawLocation(this.locationInfo[i].Coords);
                    isDraw = true;
                    break;
                  }
                }
              }
            }
          }
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
    drawLocation(coords) {
      let pathGenerator = d3.geoPath().projection(this.projection);
      let geoJsonPoint = {
        type: "Point",
        coordinates: coords,
      };
      let vm = this;
      let tip = d3Tip()
        .attr("class", "d3-tip")
        .offset([-20, 0])
        .html(function (d) {
          for (let i = 0; i < vm.locationInfo.length; i++) {
            if (vm.locationInfo[i]["Coords"] == d.coordinates) {
              var location = vm.locationInfo[i]["LocationName"];
              var type = vm.locationInfo[i]["Type"];
            }
          }
          return (
            "<div style = 'background-color:black; opacity:0.8; color: #fff;border-radius: 2px; " +
            "line-height: 1;font-weight: bold; padding: 12px;' > " +
            "<span style='color:violet'>" +
            location +
            "</span><br>Type: <span style='color:pink'>" +
            type +
            "</div>"
          );
        });
      this.mapContainer.call(tip);
      this.mapContainer
        .selectAll()
        .data([geoJsonPoint])
        .enter()
        .append("path")
        .attr("d", function (d) {
          return pathGenerator(d);
        })
        .attr("opacity", "0.5")
        .style("stroke", function (d) {
          for (let i = 0; i < vm.locationInfo.length; i++) {
            if (vm.locationInfo[i]["Coords"] == d.coordinates) {
              var type = vm.locationInfo[i]["Type"];
            }
          }
          if (type == "Eat") return "red";
          if (type == "General") return "#800080";
          if (type == "Work") return "blue";
        })
        .style("stroke-width", 20)
        .on("mouseover", function (event, d) {
          d3.select(this).style("stroke-width", 40);
          tip.show(d, this);
        })
        .on("mouseout", function (event, d) {
          d3.select(this).style("stroke-width", 20);
          tip.hide(d, this);
        });
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
          if (this.multipleSelection.length == 0) return;
        }
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    toggleSelection() {
      this.$refs.multipleTable.clearSelection();
      d3.selectAll("svg > *").remove();
      this.initialize();
    },
    renderPaths() {
      let car_ids = this.multipleSelection.map((data) => data.CarID).join(",");
      d3.selectAll("svg > *").remove();
      this.initialize();
      this.drawPaths(car_ids);
    },
    getDistanceFromLatLon(coord1, coord2) {
      var p = 0.017453292519943295; // Math.PI / 180
      var c = Math.cos;
      var a =
        0.5 -
        c((coord2[1] - coord1[1]) * p) / 2 +
        (c(coord1[1] * p) *
          c(coord2[1] * p) *
          (1 - c((coord2[0] - coord1[0]) * p))) /
          2;

      return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    },
  },
};
</script>

<style>
html,
body {
  margin: 0px;
}
.container {
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}

.el-row {
  margin: 10px;
  display: flex;
  flex-wrap: wrap;
}

svg,
img {
  position: absolute;
}

.time-brush {
  margin: 10px;
  /* top: 250px; */
  position: relative;
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

.d3-tip {
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.4;
  padding: 20px;
  pointer-events: none !important;
  color: #203d5d;
  box-shadow: 0 4px 20px 4px rgba(0, 20, 60, 0.1),
    0 4px 80px -8px rgba(0, 20, 60, 0.2);
  background-color: #fff;
  border-radius: 4px;
}

/* Creates a small triangle extender for the tooltip */
.d3-tip:after {
  box-sizing: border-box;
  display: inline;
  font-size: 10px;
  width: 100%;
  line-height: 1;
  color: #fff;
  position: absolute;
  pointer-events: none;
}

/* Northward tooltips */
.d3-tip.n:after {
  content: "▼";
  margin: -1px 0 0 0;
  top: 100%;
  left: 0;
  text-align: center;
}

/* Eastward tooltips */
.d3-tip.e:after {
  content: "◀";
  margin: -4px 0 0 0;
  top: 50%;
  left: -8px;
}

/* Southward tooltips */
.d3-tip.s:after {
  content: "▲";
  margin: 0 0 1px 0;
  top: -8px;
  left: 0;
  text-align: center;
}

/* Westward tooltips */
.d3-tip.w:after {
  content: "▶";
  margin: -4px 0 0 -1px;
  top: 50%;
  left: 100%;
}
</style>
