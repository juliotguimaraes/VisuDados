$( document ).ready(function() {

  $('.number1').each(function () {
    $(this).prop('Counter',0).animate({
        Counter: $(this).text()
    }, {
        duration: 1000,
        easing: 'swing',
        step: function (now) {
            $(this).text(Math.ceil(now));
        }
    });
  });
  $('.number2').each(function () {
    $(this).prop('Counter',0).animate({
        Counter: $(this).text()
    }, {
        duration: 1000,
        easing: 'swing',
        step: function (now) {
            $(this).text(now.toFixed(1));
        }
    });
  });
  $('.number3').each(function () {
    $(this).prop('Counter',0).animate({
        Counter: $(this).text()
    }, {
        duration: 1000,
        easing: 'swing',
        step: function (now) {
            $(this).text(now.toFixed(2));
        }
    });
  });

  //Chart 1
  var dispatch = d3.dispatch("load", "statechange");

  var groups3 = [
    {
      id: 1,
      name: "Public Sector Officials and Business Managers",
    },
    {
      id: 2,
      name: "Professionals of Arts and Sciences",
    },
    {
      id: 3,
      name: "Skilled Workers",
    },
    {
      id: 4,
      name: "Administrative Workers",
    },
    {
      id: 5,
      name: "Service and Retail Workers",
    },
    {
      id: 6,
      name: "Agriculture Workers",
    },
    {
      id: 7,
      name: "Specialized Production Workers",
    },
    {
      id: 8,
      name: "Industrial Workers",
    },
    {
      id: 9,
      name: "Maintenance and Repair Workers",
    },
    {
      id: "x",
      name: "Unreported",
    },
  ];

  var groups = [
   "1",
   "2",
   "3",
   "4",
   "5",
   "6",
   "7",
   "8",
   "9",
   "x"
  ];

var format = d3.format(",d"),
    color = d3.scale.category10();

d3.csv("donut.csv", type, function(error, states) {
  if (error) throw error;
  var stateById = d3.map();
  states.forEach(function(d) { stateById.set(d.id, d); });
  dispatch.load(stateById);
  dispatch.statechange(stateById.get("2002"));
});

// A drop-down menu for selecting a state; uses the "menu" namespace.
dispatch.on("load.menu", function(stateById) {
  var select = d3.select("#chart1")
    .append("div")
    .append("select")
      .on("change", function() { dispatch.statechange(stateById.get(this.value)); });

  select.selectAll("option")
      .data(stateById.values())
    .enter().append("option")
      .attr("value", function(d) { return d.id; })
      .text(function(d) { return d.id; });

  dispatch.on("statechange.menu", function(state) {
    select.property("value", state.id);
  });
});

// Bar Chart
dispatch.on("load.bar", function(stateById) {
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 80 - margin.left - margin.right,
      height = 460 - margin.top - margin.bottom;

  var y = d3.scale.linear()
      .domain([0, d3.max(stateById.values(), function(d) { return d.total; })])
      .rangeRound([height, 0])
      .nice();

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));

  var svg = d3.select("#chart1").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var rect = svg.append("rect")
      .attr("x", 4)
      .attr("width", width - 4)
      .attr("y", height)
      .attr("height", 0)
      .style("fill", "#aaa");

  dispatch.on("statechange.bar", function(d) {
    rect.transition()
        .attr("y", y(d.total))
        .attr("height", y(0) - y(d.total));
  });
});

// Donut Chart
dispatch.on("load.pie", function(stateById) {
  var width = $("#chart1").width() - 100,
      height = 460,
      radius = Math.min(width, height) / 2;

  
  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);

  var pie = d3.layout.pie()
      .sort(null);

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return $.grep(groups3, function(e){ return e.id == d.data; })[0].name + "<br >Average wage: " + d.value;
  })

  var svg = d3.select("#chart1").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg.call(tip);

  var path = svg.selectAll("path")
      .data(groups)
    .enter().append("path")
      .attr("id", function(d) { return d.id })
      .attr("name", function(d) { return d.name })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide) 
      .style("fill", function(d) {
        console.log(d);
        console.log();
       return color($.grep(groups3, function(e){ return e.id == d; })[0].name); })
      .each(function() { this._current = {startAngle: 0, endAngle: 0}; });

  dispatch.on("statechange.pie", function(d) {
    path.data(pie.value(function(g) { return d[g]; })(groups)).transition()
        .attrTween("d", function(d) {
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function(t) {
            return arc(interpolate(t));
          };
        });
  });
});

function type(d) {
  d.total = d3.sum(groups, function(k) { return d[k] = +d[k]; });
  return d;
}
var diameter = $("#chart_legend").width();
var svg = d3.select("#chart_legend").append("svg")
      .attr("width", diameter)
      .attr("height", 480)
      .attr("class", "legenda");

var desl = 0;
for (g in groups3){
  if(g < 5){
    svg.append("circle")
          .attr("r", 7)
          .attr("x", 20)
          .attr("transform", "translate(" + 20 + "," + 2*(g+5) + ")")
          .style("fill", color(groups3[g].name));
    svg.append("text")
          .attr("transform", "translate(" + 30 + "," + 2*(g+8) + ")")
          .style("fill", color(groups3[g].name))
          .text(groups3[g].name);
  }
  else{
    svg.append("circle")
          .attr("r", 7)
          .attr("x", 60)
          .attr("y", 0)
          .attr("transform", "translate(" + diameter/3 + "," + (2*(g) + 5) + ")")
          .style("fill", color(groups3[g].name));
    svg.append("text")
          .attr("transform", "translate(" + (diameter/3 + 10) + "," + 2*(g+8) + ")")
          .style("fill", color(groups3[g].name))
          .text(groups3[g].name);
  }
}

//Chart 2
  var diameter = $("#chart2").width(),
    format = d3.format(",d"),
    color = d3.scale.category10();

  var bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, 480])
      .padding(1.5);

  var svg = d3.select("#chart2").append("svg")
      .attr("width", diameter)
      .attr("height", 480)
      .attr("class", "bubble");

  d3.json("bubble.json", function(error, root) {
    if (error) throw error;

    var node = svg.selectAll(".node")
        .data(bubble.nodes(classes(root))
        .filter(function(d) { return !d.children; }))
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset(function (d) {
            return [0, 0]
        })
        .html(function (d) {
            return d.className + "<br />" + "Number of jobs: " + format(d.value) ;
        });
        
    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.className); })
        .on('mouseenter', tip.show)
        .on('mouseleave', tip.hide);

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { if((d.r/4) > 7) return d.className.substring(0, d.r / 4); else return "" })
        .style("fill", "white");

    svg.call(tip);
    
    
  });

  function classes(root) {
    var classes = [];

    function recurse(name, node) {
      if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
      else classes.push({packageName: name, className: node.name, value: node.size});
    }

    recurse(null, root);
    return {children: classes};
  }

  d3.select(self.frameElement).style("height", diameter + "px");


});