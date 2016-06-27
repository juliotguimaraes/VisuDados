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

  var diameter = $("#chart2").width(),
    format = d3.format(",d"),
    color = d3.scale.category10();

  var bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(1.5);

  var svg = d3.select("#chart2").append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
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