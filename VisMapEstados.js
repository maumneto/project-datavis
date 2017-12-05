	let geojson;
        var StateCountMap = d3.map();
        let brewerColors = colorbrewer.Reds[3];

        // load data from a csv file
        d3.csv("data_csv_datavis.csv", function (data) {
          data.forEach(function(d) { 
            d.nome    = d.NOME;
            d.cargo   = d.CARGO;
            d.partido = d.PARTIDO;
            d.estado  = d.ESTADO;
            d.crime   = d.CRIME;

            // Conta o número de por estado.
	    if (StateCountMap.get(d.estado) == null)
	      StateCountMap.set(d.estado,1);
	    else
	      StateCountMap.set(d.estado,StateCountMap.get(d.estado)+1);
          });

	  console.log(StateCountMap);

           
         //bairrosData is defined in file bairros.js		 		
	  geojson = L.geoJson(EstadoData, {
            style: style,
            onEachFeature: onEachFeature
	  }).addTo(map);
           
          // Run the data through crossfilter and load our 'facts'
          var facts = crossfilter(data);

          // Cria uma tabela de dados usando o Estado.
          var StateDimension = facts.dimension(function (d) {
          	return d.estado;
          });

          // Cria um grupo para o estado que conta o número de elementos.
          var stateDimensionCount = StateDimension.group( );
	  
	  console.log(stateDimensionCount.top(1));
	  console.log(StateCountMap.get("SC"));

          //Create dataTable dimension using the date (dtg)
	  /*
          var dateDimension = facts.dimension(function (d) {
          	return d.dtg;
          });
          
          //Create a dimension for Magnitude
          var magDimension = facts.dimension(function (d) {
          	return d.mag;
          });
          
          //Create a group for Magnitude that just counts the number of elements in the group
          var magDimensionCount = magDimension.group( );

          // Create a dimension for Depth
          var depDimension = facts.dimension(function (d) {
          	return d.depth;
          });

          //Create a group for Depth that just counts the number of elements in the group
          var depDimensionCount = depDimension.group( );

          // Create a dimension just for the hour from the datetime in the dataset
          //hint: use d3.time.hour() function
          var hourDimension = facts.dimension(function (d) {
          	return d3.time.hour(d.dtg);
          });
	  */
        });



	let map = L.map('map', {maxBoundsViscosity: 1.0}).setView([-10.0,-50.50], 4);

	L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
	{ attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>', 
	maxZoom: 18,maxBoundsViscosity: 1.0}).addTo(map);

        // control that shows state info on hover
	let info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (feat) {
			this._div.innerHTML = '<h5> Quantidade de Crimes </h5>'
			+ (feat ? (feat.properties.name + ":" +
			StateCountMap.get(feat.properties.sigla) ) : 'Passe o mouse sobre um Estado');
	};

	info.addTo(map);
	
	// get color depending on number of cases
	let quantize = d3.scale.linear()
                         .domain([0,5])
                         .range(brewerColors);

	function style(feature) 
	{
		return {
			weight: 1,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.6,
			fillColor: 
			quantize(StateCountMap.get(feature.properties.sigla))
		};
	}
	function highlightFeature(e) {
		let layer = e.target;
        //console.log(e.target)

		layer.setStyle({
					weight: 2,
					color: '#AAA',
					dashArray: '',
					fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}

		info.update(layer.feature);
	}
        function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}

	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}

        function onEachFeature(feature, layer) {
		layer.on({
					mouseover: highlightFeature,
					mouseout: resetHighlight,
					click: zoomToFeature
				});
	}

