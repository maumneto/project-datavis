           // Create the dc.js chart objects & link to divs
            var dataTable  = dc.dataTable("#dc-table-graph"); 
            var partyChart = dc.rowChart('#party-chart');
            var stateChart = dc.barChart('#state-chart');
      //      var crimeChart = dc.rowChart('#crime-chart');
            
            // load data from a csv file
            d3.csv("data_new.csv", function (data) {
              data.forEach(function(d) { 
                d.nome    = d.NOME;
                d.cargo   = d.CARGO;
                d.partido = d.PARTIDO;
                d.estado  = d.ESTADO;
                d.crime   = d.CRIME;
              });

              // Run the data through crossfilter and load our 'facts'
              var facts = crossfilter(data);

              // Create dataTable dimension using the party.
              var partyDimension = facts.dimension(function (d) {
              	return d.partido;
              });

              //Create a group for party that just counts the number of elements in the group
              var partyDimensionCount = partyDimension.group( );
              
              //Create a dimension for State
              var stateDimension = facts.dimension(function (d) {
              	return d.estado;
              });
              
              //Create a group for state that just counts the number of elements in the group
              var stateDimensionCount = stateDimension.group( );

              // Create a dimension for crime
       //       var crimeDimension = facts.dimension(function (d) {
       //       	return d.crime;
       //       });

              //Create a group for crime that just counts the number of elements in the group
       //       var crimeDimensionCount = crimeDimension.group( );

              // Create a dimension for name
              var nameDimension = facts.dimension(function (d) {
              	return d.nome;
              });

              // Cria uma escala ordinal para receber os Partidos.
              var PartyScale = d3.scale.ordinal( );

              var numParty    = partyDimensionCount.size( );
              var PartyDimMap = partyDimensionCount.top(Infinity);
	      var PartyList   = Array(numParty);

	      for (i = 0; i < numParty; ++i) PartyList[i] = PartyDimMap[i].key;
	      PartyScale.domain(PartyList).range(colorbrewer.Set3[12]);

              // Cria uma escala ordinal para receber os estados.
              var StateScale = d3.scale.ordinal( );

              var numState    = stateDimensionCount.size( );
              var StateDimMap = stateDimensionCount.top(Infinity);
	      var StateList   = Array(numState);

	      for (i = 0; i < numState; ++i) StateList[i] = StateDimMap[i].key;
	      StateScale.domain(StateList).range(colorbrewer.Paired[12]);

              // Cria uma escala ordinal para receber os crimes.
	      /*
              var CrimeScale = d3.scale.ordinal( );

              var numCrime    = crimeDimensionCount.size( );
              var CrimeDimMap = crimeDimensionCount.top(Infinity);
	      var CrimeList   = Array(numCrime);

	      for (i = 0; i < numCrime; ++i) CrimeList[i] = CrimeDimMap[i].key;
	      CrimeScale.domain(CrimeList).range(colorbrewer.Paired[12]);
              */

              // Configuração barras  total crime BarChart.  
              partyChart.width(600)
              	.height(300)
              	.margins({top: 10, right: 10, bottom: 20, left:40})
              	.dimension(partyDimension)
              	.group(partyDimensionCount)
              	.transitionDuration(500)
              	.gap(1)
		.x(PartyScale)
                .rowsCap(16)
                .ordinalColors(PartyScale.range( ))
              	.elasticX(true);


              // Configure Depth bar graph
              // 480 x 150
              // x dimension domain: [0, 100]
	      
              stateChart.width(600)
              	.height(150)
              	.margins({top: 10, right: 10, bottom: 20, left:40})
              	.dimension(stateDimension)
              	.group(stateDimensionCount)
              	.transitionDuration(500)
              	.centerBar(false)
              	.gap(1)
              	//.x(d3.scale.ordinal( ).domain(["ES","SP","RJ"]))
		.x(StateScale)
                .xUnits(dc.units.ordinal)
              	.elasticY(true);
	      
              // Configuração barras  total crime BarChart.  
	      /*
              crimeChart.width(800)
              	.height(700)
              	.margins({top: 10, right: 10, bottom: 20, left:40})
              	.dimension(crimeDimension)
              	.group(crimeDimensionCount)
              	.transitionDuration(500)
              	.gap(1)
		.x(CrimeScale)
                .rowsCap(20)
               // .ordinalColors(CrimeScale.range( ))
              	.elasticX(true);
		*/

              dataTable.width(960)
              	.height(800)
              	.dimension(nameDimension)
              	.group(function(d) { 
              		return "Tabela com os dados";})
              	.size(300)
              	.columns([
              		function(d) { return d.nome;    },
              		function(d) { return d.cargo;   },
              		function(d) { return d.partido; },
              		function(d) { return d.estado;   },
              		function(d) { return d.crime;  }])
              	.sortBy(function(d) { return d.nome;    })
              	.order(d3.ascending);

              // Render the Charts
              dc.renderAll();
  
            });

