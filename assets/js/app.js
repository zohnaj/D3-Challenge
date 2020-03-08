var width = parseInt(d3.select("#scatter").style("width"));
var height = width - width / 3.9;
var margins = 20;
var labels = 110;
var bottom_padding = 40;
var left_padding = 40;

var svg = d3.select("#scatter").append("svg").attr("width", width).attr("height", height).attr("class", "chart");

var sizeCircles;

function crGet() {
  if (width <= 530) {
    sizeCircles = 5;
  }
  else {
    sizeCircles = 10;
  }
}
crGet();

svg.append("g").attr("class", "x_group");

var x_group = d3.select(".x_group");

function refresh() {x_group.attr("transform","translate(" + ((width - labels) / 2 + labels) + ", " + (height - margins - bottom_padding) + ")");}
refresh();

x_group
  .append("text")
  .attr("y", -20)
  .attr("variable", "poverty")
  .attr("variable_axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

x_group
  .append("text")
  .attr("y", 0)
  .attr("variable", "age")
  .attr("variable_axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

  x_group
  .append("text")
  .attr("y", 20)
  .attr("variable", "income")
  .attr("variable_axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)")
;

var left_x= margins + left_padding;
var left_y= (height + labels)/2 -labels;

svg.append("g").attr("class", "y_group");

var y_group = d3.select(".y_group");

function y_grouprefresh() {y_group.attr("transform","translate(" + left_x + ", " + left_y + ")rotate(-90)");}
y_grouprefresh();

y_group
  .append("text")
  .attr("y", -20)
  .attr("variable", "obesity")
  .attr("variable_axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

y_group
  .append("text")
  .attr("x", 0)
  .attr("variable", "smokes")
  .attr("variable_axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

  y_group
  .append("text")
  .attr("y", 20)
  .attr("variable", "healthcare")
  .attr("variable_axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");
  
d3.csv("assets/data/data.csv").then(function(data) {
  visualize(data);
});

function visualize(theData) {
  var data_x = "poverty";
  var data_y = "obesity";

  var x_value_min;
  var x_value_max;
  var y_value_min;
  var y_value_max;

  var toolTip = d3.tip().attr("class", "d3-tip").offset([30, -50]).html(function(d) {
      var chosen_x;
      var state_name = "<div>" + d.state + "</div>";
      var chosen_y = "<div>" + data_y + ": " + d[data_y] + "%</div>";

      if (data_x === "poverty") {
        chosen_x = "<div>" + data_x + ": " + d[data_x] + "%</div>";
      }
      else {
        chosen_x = "<div>" +data_x +": " + parseFloat(d[data_x]).toLocaleString("en") + "</div>";
      }
      return state_name + chosen_x + chosen_y;
    });

  svg.call(toolTip);

  function x_value_min_max() {
    x_value_min = d3.min(theData, function(d) {
      return parseFloat(d[data_x]) * 0.90;
    });

    x_value_max = d3.max(theData, function(d) {
      return parseFloat(d[data_x]) * 1.10;
    });
  }

  function y_value_min_max() {
    y_value_min = d3.min(theData, function(d) {
      return parseFloat(d[data_y]) * 0.90;
    });

    y_value_max = d3.max(theData, function(d) {
      return parseFloat(d[data_y]) * 1.10;
    });
  }

  function labelChange(axis, clicked) {
    d3.selectAll(".aText").filter("." + axis).filter(".active").classed("active", false).classed("inactive", true);

    clicked.classed("inactive", false).classed("active", true);
  }

  x_value_min_max();
  y_value_min_max();

  var x_circle_scale = d3
    .scaleLinear()
    .domain([x_value_min, x_value_max])
    .range([margins + labels, width - margins]);

  var y_circle_scale = d3
    .scaleLinear()
    .domain([y_value_min, y_value_max])
    .range([height - margins - labels, margins]);

  var x_axis = d3.axisBottom(x_circle_scale);
  var y_axis = d3.axisLeft(y_circle_scale);

  function num_ticks() {
    if (width <= 500) {
      x_axis.ticks(5);
      y_axis.ticks(5);
    }
    else {
      x_axis.ticks(10);
      y_axis.ticks(10);
    }
  }
  num_ticks();

  svg.append("g").call(x_axis).attr("class", "x_axis").attr("transform", "translate(0," + (height - margins - labels) + ")");
  
  svg.append("g").call(y_axis).attr("class", "y_axis").attr("transform", "translate(" + (margins + labels) + ", 0)");

  var circleGroup = svg.selectAll("g circleGroup").data(theData).enter();

  circleGroup
    .append("circle")
    .attr("cx", function(d) {
      return x_circle_scale(d[data_x]);
    })
    .attr("cy", function(d) {
      return y_circle_scale(d[data_y]);
    })
    .attr("r", sizeCircles)
    .attr("class", function(d) {
      return "state_in_circle " + d.abbr;
    })
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      d3.select(this).style("stroke", "#333333");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "#e3e3e3");
    });

  circleGroup
    .append("text")
    .text(function(d) {
      return d.abbr;
    })
    .attr("dx", function(d) {
      return x_circle_scale(d[data_x]);
    })
    .attr("dy", function(d) {
      return y_circle_scale(d[data_y]) + sizeCircles / 2.5;
    })
    .attr("font-size", sizeCircles)
    .attr("class", "stateText")
    .on("mouseover", function(d) {
      toolTip.show(d);
      d3.select("." + d.abbr).style("stroke", "#333333");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  d3.selectAll(".aText").on("click", function() {
    var sel_clicked = d3.select(this);

    if (sel_clicked.classed("inactive")) {
      var axis = sel_clicked.attr("variable_axis");
      var name = sel_clicked.attr("variable");

      if (axis === "x") {
        data_x = name;

        x_value_min_max();

        x_circle_scale.domain([x_value_min, x_value_max]);

        svg.select(".x_axis").transition().duration(300).call(x_axis);

        d3.selectAll("circle").each(function() {
          d3.select(this).transition().attr("cx", function(d) {
            return x_circle_scale(d[data_x]);
            })
            .duration(300);
        });

        d3.selectAll(".stateText").each(function() {
          d3.select(this).transition().attr("dx", function(d) {
            return x_circle_scale(d[data_x]);
            })
            .duration(300);
        });

        labelChange(axis, sel_clicked);
      }
      else {
        data_y = name;

        y_value_min_max();

        y_circle_scale.domain([y_value_min, y_value_max]);

        svg.select(".y_axis").transition().duration(300).call(y_axis);

        d3.selectAll("circle").each(function() {
          d3.select(this).transition().attr("cy", function(d) {
            return y_circle_scale(d[data_y]);
            })
            .duration(300);
        });

        d3.selectAll(".stateText").each(function() {
          d3.select(this).transition().attr("dy", function(d) {
            return y_circle_scale(d[data_y]) + sizeCircles / 3;
            })
            .duration(300);
        });

        labelChange(axis, sel_clicked);
      }
    }
  })};