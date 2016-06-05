var data = [4, 8, 15, 16, 23, 42];

var altura_svg = 420,
    largura_barra = 20;


//descobrir qq essa parte faz
//Acho q essa parte normaliza os dados nao?
var tratar_dados = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, altura_svg]);

//altera largura e altura do container
var grafico_barras = d3.select("#grafico_barras")
    .attr("height", altura_svg)
    .attr("width", largura_barra * data.length);

//adiciona barras no svg container
var barras = grafico_barras.selectAll("g")
    .data(data)
  .enter().append("g")
    .attr("transform", function(d, i) { return "translate(" + i * largura_barra + ",0)"; });

//cria o retangulo para cada barra
barras.append("rect")
    .attr("width", largura_barra - 1) //largura -1 para dar distancia
    .attr("height", tratar_dados) //altura da barra de acordo com a funcao de tratar dados
    .attr("y", function(d) { return altura_svg - tratar_dados(d) - 3; }); //posiciona a barra de acordo com seu tamanho

//adiciona label de cada barra
barras.append("text")
    .text(function(d) { if(d >= 10) { return d; } else { return "0" + d; } }) //define qual o texto (se for menor que 10, acrescenta o zero a esquerda)
    .attr("y", function(d) { return altura_svg - tratar_dados(d) + 10; }) //coloca dentro da barra
    .attr("x", largura_barra / 2) //define localizacao horizontal do texto
    .attr("dx", ".4em"); //centralizar dentro da barra
