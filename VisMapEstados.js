	let geojson;
        var StateCountMap = d3.map();
        var StateNamesMap = d3.map();
	var NameCountMap  = d3.map( );
        var line;
        let brewerColors = colorbrewer.Reds[9];

        // load data from a csv file
        d3.csv("data_new.csv", function (data) {

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
           
         //bairrosData is defined in file bairros.js		 		
	  geojson = L.geoJson(EstadoData, {
            style: style,
            onEachFeature: onEachFeature
	  }).addTo(map);
          
        // Run the data through crossfilter and load our 'facts'
        var facts = crossfilter(data);

        // Create dataTable dimension using the party.
        var nameDimension = facts.dimension(function (d) {
        	return d.nome;
        });

        //Create a group for name that just counts the number of elements in the group
        var nameDimensionCount = nameDimension.group( );
        
	// Cria o mapa que contém o somatório dos nomes
	var nameCountVec = nameDimensionCount.top(Infinity);
	var nameSize     = nameDimensionCount.size( );

        for(var i = 0; i < nameSize; ++i)
	  NameCountMap.set(nameCountVec[i].key,nameCountVec[i].value);

	console.log(NameCountMap);

       // Cria o mapa de estados 
       var MapAux = d3.map( );

       data.forEach(function(d) {
            if (MapAux.get(d.nome) == null)
	    {
              // Forma a sting relacionda ao registro atual.
              line = d.nome + " (" + d.partido + "): " +
	      NameCountMap.get(d.nome) +"<br>"; 

	      MapAux.set(d.nome,1);
	 
              // Adiciona esta string no mapa de Nomes por estado.
	      if (StateNamesMap.get(d.estado) == null)
                StateNamesMap.set(d.estado,line);
	      else
	        StateNamesMap.set(d.estado,StateNamesMap.get(d.estado)+line);
            }
          });
        });

	let map = L.map('map', {zoomControl:false, dragging: false,
	doubleClickZoom : false, boxZoom: false, zoomAnimation: false,
	scrollWheelZoom: false,bounceAtZoomLimits: false , maxBoundsViscosity: 1.0, 
        closePopupOnClick:false  }).setView([-12.0,-50.50], 4);

        // control that shows state info on hover
	let info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (feat) {
			this._div.innerHTML = '<h5> Processos </h5>'
			+ (feat ? ("("+feat.properties.sigla + ") Total: " + 
                        StateCountMap.get(feat.properties.sigla) + "<br><br>" +
			StateNamesMap.get(feat.properties.sigla) ) : 'Passe o mouse sobre um Estado');
	};

	info.addTo(map);
	
	// get color depending on number of cases
	let quantize = d3.scale.linear()
                         .domain([0,8,13,16,25,35,50,55,60])
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
					mouseout: resetHighlight
				});
	}


        let legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

		let div = L.DomUtil.create('div', 'info legend'),
			labels = [],
            n = brewerColors.length,
			from, to;

			console.log(n);

		for (let i = 0; i < n; i++) {
			let c = brewerColors[i];
            let fromto = quantize.domain( );//   invertExtent(c);
			labels.push(
				'<i style="background:' + brewerColors[i] + '"></i> ' +
				d3.round(fromto[i]) + (d3.round(fromto[i+1]) ? '&ndash;' + d3.round(fromto[i+1]) : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

   	legend.addTo(map);


