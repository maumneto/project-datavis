	let geojson;
        var StateCountMap = d3.map();
        var StateNamesMap = d3.map();
	var NameCountMap  = d3.map( );
        var line;
        let brewerColors = colorbrewer.Reds[9];
        var StateChairMap = d3.map();

        // Carrega o mapa de cadeiras por estado:
        StateChairMap.set("AC",11);
        StateChairMap.set("AL",12);
        StateChairMap.set("AM",11);
        StateChairMap.set("AP",11);
        StateChairMap.set("BA",42);
        StateChairMap.set("CE",25);
        StateChairMap.set("DF",11);
        StateChairMap.set("ES",13);
        StateChairMap.set("GO",20);
        StateChairMap.set("MA",21);
        StateChairMap.set("MG",56);
        StateChairMap.set("MS",11);
        StateChairMap.set("MT",11);
        StateChairMap.set("PA",20);
        StateChairMap.set("PB",15);
        StateChairMap.set("PE",28);
        StateChairMap.set("PI",13);
        StateChairMap.set("PR",33);
        StateChairMap.set("RJ",49);
        StateChairMap.set("RN",11);
        StateChairMap.set("RO",11);
        StateChairMap.set("RR",11);
        StateChairMap.set("RS",34);
        StateChairMap.set("SC",19);
        StateChairMap.set("SE",11);
        StateChairMap.set("SP",73);
        StateChairMap.set("TO",8);

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
                        " Por cadeira: " + (StateCountMap.get(feat.properties.sigla)/StateChairMap.get(feat.properties.sigla)).toFixed(2) 
                        + "<br><br>" +
			StateNamesMap.get(feat.properties.sigla) ) : 'Passe o mouse sobre um Estado');
	};

	info.addTo(map);
	
	// get color depending on number of cases
	let quantize = d3.scale.linear()
                         .domain([0,0.25,0.5,0.75,1.0,1.5,2.0,2.5,3.0])
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
			quantize(StateCountMap.get(feature.properties.sigla)/StateChairMap.get(feature.properties.sigla))
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
				//d3.round(fromto[i]) + (d3.round(fromto[i+1]) ? '&ndash;' + d3.round(fromto[i+1]) : '+'));
                                fromto[i] + (fromto[i+1] ? '&ndash;' + fromto[i+1] : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

   	legend.addTo(map);


