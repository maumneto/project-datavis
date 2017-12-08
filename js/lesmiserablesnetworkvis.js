function Network() {
  var allData = [],
      width = 400,
      height = 400,
      // our force directed layout
      force = d3.layout.force(), 
      // these will point to the circles and lines
      // of the nodes and links
      link = null,
      node = null,
      // these will hold the svg groups for
      // accessing the nodes and links display
      linksG = null,
      nodesG = null,
      // tooltip used to display details
      tooltip = Tooltip("vis-tooltip", 230),
      network; //function

  // Helper function to map node id's to node objects.
  // Returns d3.map of ids -> nodes
  function mapNodes(nodes) {
    var nodesMap;
    nodesMap = d3.map();
    nodes.forEach(function(n) {
      return nodesMap.set(n.id, n);
    });
    return nodesMap;
  }

  function setupData(data) {
    var circleRadius, countExtent;
    // initialize circle radius scale
    countExtent = d3.extent(data.nodes, function(d) {
      sum = 0;

      data.links.forEach(function(l) 
      {
        if ((l.source == d.id) || (l.target == d.id))
          sum = sum + 1;  
      });
   
      return sum;
    });

    circleRadius = d3.scale.sqrt().range([3, 15]).domain(countExtent);

    //First let's randomly dispose data.nodes (x/y) within the the width/height
    // of the visualization and set a fixed radius for now
    count = 0;
    data.nodes.forEach(function(n) {
      // Add int label in nodes.
      count = count + 1; 
      n.label = count; 

      // Add Edges count in nodes.
      n.ednum = 0;
      data.links.forEach(function(l) 
      {
        if ((l.source == n.id) || (l.target == n.id))
          n.ednum = n.ednum + 1;  
      });

      // set initial x/y to values within the width/height
      // of the visualization
      var randomnumber;
      n.x = randomnumber = Math.floor(Math.random() * width);
      n.y = randomnumber = Math.floor(Math.random() * height);
      
      // add radius to the node so we can use it later
      n.radius = circleRadius(n.value/20);
    });

    // Create linear color map.
    var color2= d3.scale.ordinal( ).domain([0, count/2, count]).range(colorbrewer.Paired[12]);
    var color = d3.scale.linear().domain([0, count/2, count]).range(["red", "green", "blue"]);    

    // Set color of each node according with color map.
    data.nodes.forEach(function(n) { n.color = color2(n.label); });

    // Then we will create a map with
    // id's -> node objects
    // using the mapNodes function above and store it in the nodesMap variable.
    var nodesMap = mapNodes(data.nodes);
    // Then we will switch links to point to node objects instead of id's.
    data.links.forEach(function(l) {
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
    });

    // Finally we will return the data
    return data;
  }

  // Mouseover tooltip function
  function showDetails(d, i) {
    var content;
    content = '<p class="main">' + d.id + '</span></p>';
    content += '<hr class="tooltip-hr">';
    content += '<p class="main">'+ "Ações: " + d.value + '</span></p>';
    content += '<p class="main">'+ "Parcerias: " + d.ednum + '</span></p>';
    tooltip.showTooltip(content, d3.event);
    
    // highlight the node being moused over
    return d3.select(node).style("color", d.color).style("stroke", d.color).style("stroke-width", 2.0);
  }

  // Mouseout function
  function hideDetails(d, i) 
  {
      tooltip.hideTooltip();
      // watch out - don't mess with node if search is currently matching
      node.style("stroke", function(n) {
        return n.color;//"#555"
      })
      .style("stroke-width", function(n) {
        return 1.0;
      });
  }

  // enter/exit display for nodes
  function updateNodes() {
    //select all node elements in svg group of nodes
    node = nodesG.selectAll("circle.node")
      .data(allData.nodes, function(d) {
        return d.id;
       });

    // set cx, cy, r attributes and stroke-width style
    node.enter()
    .append("circle").attr("class", "node").attr("cx", function(d) {
      return d.x;})
    .attr("cy", function(d) {
      return d.y;})
    .attr("r", function(d) {
      return d.radius;})

.style("fill", function(d) {
      return d.color;})
    .style("stroke-width", 1.0);

    node.on("mouseover", showDetails).on("mouseout", hideDetails);
  }

  // enter/exit display for links
  function updateLinks() {
    link = linksG.selectAll("line.link")
      .data(allData.links, function(d) {
        return `${d.source.id}_${d.target.id}`; });
    link.enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#ddd")
      .attr("stroke-opacity", 0.8)
      .attr("x1", function(d) {
        return d.source.x; })
      .attr("y1", function(d) {
        return d.source.y; })
      .attr("x2", function(d) {
        return d.target.x; })
      .attr("y2", function(d) {
        return d.target.y; });
  }

  // tick function for force directed layout
  var forceTick = function(e) {
    node.attr("cx", function(d) {
      return d.x; })
    .attr("cy", function(d) {
      return d.y; });
    link.attr("x1", function(d) {
      return d.source.x; })
    .attr("y1", function(d) {
      return d.source.y; })
    .attr("x2", function(d) {
      return d.target.x; })
    .attr("y2", function(d) {
      return d.target.y;});
  };

  // Starting point for network visualization
  // Initializes visualization and starts force layout
  network = function(selection, data) {

    // format our data
    allData = setupData(data);

    // create our svg and groups
    vis = d3.select(selection).append("svg").attr("width", width).attr("height", height);
    linksG = vis.append("g").attr("id", "links");
    nodesG = vis.append("g").attr("id", "nodes");

    // setup the size of the force environment
    force.size([width, height]);

    // setup nodes and links
    force.nodes(allData.nodes);
    force.links(allData.links);

    // enter / exit for nodes
    updateNodes();

    // enter / exit for links
    updateLinks();

   // set the tick callback, charge and linkDistance
   force.on("tick", forceTick).charge(-200).linkDistance(50);
   
   // perform rendering and start force layout
   return force.start();
  };

  // Final act of Network() function is to return the inner 'network()' function.
  return network;
}
