$( document ).ready(function(){

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
      height = 400 - margin.top - margin.bottom;

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

  var tip2 = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function(d) {
      return "Total average wage in the year";
  });

  var rect = svg.append("rect")
      .attr("x", 4)
      .attr("width", width - 4)
      .attr("y", height)
      .attr("height", 0)
      .on('mouseover', tip2.show)
      .on('mouseout', tip2.hide) 
      .style("fill", "#aaa");

  dispatch.on("statechange.bar", function(d) {
    rect.transition()
        .attr("y", y(d.total))
        .attr("height", y(0) - y(d.total));
  });

  svg.call(tip2);
});

// Donut Chart
dispatch.on("load.pie", function(stateById) {
  var width = $("#chart1").width() - 100,
      height = 400,
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
var largura_legenda = $("#chart_legend").width();
var svg = d3.select("#chart_legend").append("svg")
      .attr("width", largura_legenda)
      .attr("height", 100)
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
          .attr("transform", "translate(" + (largura_legenda/2 + 20) + "," + ((g-4.6)*20) + ")")
          .style("fill", color(groups3[g].name));
    svg.append("text")
          .attr("transform", "translate(" + (largura_legenda/2 + 30) + "," + ((g-4.3)*20) + ")")
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
      .size([diameter, 585])
      .padding(1.5);

  var svg = d3.select("#chart2").append("svg")
      .attr("width", diameter)
      .attr("height", 585)
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

//Line chart

var margin = {top: 20, right: 50, bottom: 50, left: 100},
    width = $("#chart3").width() - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%Y").parse;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.wage); })
    .interpolate("linear");
    
// Adds the svg canvas
var svg_line = d3.select("#chart3")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("line.csv", function(error, data) {
    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.wage = +d.wage;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.wage; })]);


    // Add the valueline path.
    svg_line.append("path")
        .attr("class", "line")
        .style("fill", "none")
        .style("stroke", color)
        .style('stroke-width',3)
        .attr("d", valueline(data));



    // Add the X Axis
    svg_line.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .style({ 'stroke': 'black', 'fill': 'none', 'stroke-width': '1px'})
        .call(xAxis)
        .selectAll("text")
          .style({ 'stroke': 'none', 'fill': 'black', 'stroke-width': '0px'});

    // Add the Y Axis
    svg_line.append("g")
        .attr("class", "y axis")
        .style({ 'stroke': 'black', 'fill': 'none', 'stroke-width': '1px'})
        .call(yAxis)
        .selectAll("text")
          .style({ 'stroke': 'none', 'fill': 'black', 'stroke-width': '0px'});
    

  });


//Chart  4 - TreeMap

var config = [];
$.ajax({
  type: 'GET',
  url: "config.json",
  dataType: 'json',
  success: function(data) { config = data;},
  async: false
});

var w = $("#chart4").width() - 80,
    h = 800 - 180,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([0, h]),
    color = d3.scale.category10(),
    root,
    node;

// Closure to access members defined as keys
function makeKeyFunction(keyName) {
  var localKeyName = keyName;
  function key(d) {
    return d[localKeyName];
  }
  return key;
}



// Give a key used to give the color (same key = same color)
function ColorKey(d) {
  var key = "";
  for (i in config.hierarchy) {
    key += "." + d[config.hierarchy[i]]
  }
  return key;
}

// Node to zoom on when click occurs
function selectNode(d) {
  return (node == d.parent ? root : d.parent);
}

updateTreeMap();

function updateTreeMap() {

var treemap = d3.layout.treemap()
    .round(false)
    .size([w, h])
    .sticky(true)
	.children(function(d) { return d.values; })
    .value(makeKeyFunction(config.values[0]));

var svg = d3.select("#chart4")
    .attr("class", "chart")
    .style("width", w + "px")
    .style("height", h + "px")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(.5,.5)");

// Zoom from a state to another
function zoom(d) {
  var kx = w / d.dx, ky = h / d.dy;
  x.domain([d.x, d.x + d.dx]);
  y.domain([d.y, d.y + d.dy]);

  var t = svg.selectAll("g.cell").transition()
      .duration(d3.event.altKey ? 7500 : 750)
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

  t.select("rect")
      .attr("width", function(d) { return kx * d.dx - 1; })
      .attr("height", function(d) { return ky * d.dy - 1; })

  t.select("text")
      .attr("x", function(d) { return kx * d.dx / 2; })
      .attr("y", function(d) { return ky * d.dy / 2; })
      .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });

  node = d;
  d3.event.stopPropagation();
  
  if (node == root) {
    document.getElementById("header").innerHTML = "top level";
  }
  else {
    document.getElementById("header").innerHTML = config.hierarchy[0] + ": " + node.key;
  }
}

  var parser = d3.dsv(config.separator, "text/plain");
  parser(config.document, function(data) {
    // Create a nest objet to convert flat data to a tree structure 
    var nested = d3.nest();

    // Add the keys to construct the hierarchy
    for (i in config.hierarchy) {
      var key = config.hierarchy[i]
      nested.key(makeKeyFunction(key)).sortKeys(d3.ascending);
    }
  
    // Build the tree structure
    node = root = {
      "name": "rootnode",
      "values": nested.entries(data)
    };

    // Create all viewable nodes (in this case: leafs)
    var nodes = treemap.nodes(root)
        .filter(function(d) { return !d.children; });

    var cell = svg.selectAll("g")
        .data(nodes)
      .enter().append("svg:g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("title", makeKeyFunction(config.tooltip))
        .on("click", function(d) { return zoom(selectNode(d)); });

    cell.append("svg:rect")
        .attr("width", function(d) { return d.dx - 1; })
        .attr("height", function(d) { return d.dy - 1; })
        .style("fill", function(d) { return color(ColorKey(d)); });

    cell.append("svg:text")
        .attr("x", function(d) { return d.dx / 2; })
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(makeKeyFunction(config.label))
        .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

    // Only if a tooltip column is specified
    if (config.tooltip) {
      cell.append("svg:title")
        .text(makeKeyFunction(config.tooltip));
    }
/*
    // On value source change
    d3.select("select").on("change", function() {
      treemap.value(makeKeyFunction(this.value)).nodes(root);
      zoom(node);
    }); */

  });
}

// handle on click event
d3.select('#opts')
  .on('change', function() {
    var index =  eval(d3.select(this).property('value'));
    if(index=="2002") config.document="dadosTreeMap/dados2002.csv";
    if(index=="2003") config.document="dadosTreeMap/dados2003.csv";
    if(index=="2004") config.document="dadosTreeMap/dados2004.csv";
    if(index=="2005") config.document="dadosTreeMap/dados2005.csv";
    if(index=="2006") config.document="dadosTreeMap/dados2006.csv";
    if(index=="2007") config.document="dadosTreeMap/dados2007.csv";
    if(index=="2008") config.document="dadosTreeMap/dados2008.csv";
    if(index=="2009") config.document="dadosTreeMap/dados2009.csv";
    if(index=="2010") config.document="dadosTreeMap/dados2010.csv";
    if(index=="2011") config.document="dadosTreeMap/dados2011.csv";
    if(index=="2012") config.document="dadosTreeMap/dados2012.csv";
    if(index=="2013") config.document="dadosTreeMap/dados2013.csv";
    if(index=="2014") config.document="dadosTreeMap/dados2014.csv";

    d3.select("#chart4").select("svg").remove();
    updateTreeMap();
});
	
});
