var tela;
var ctx;

var cabeca;
var maca;
var bola;
var obstaculo;

var pontos;
var maca_x = [];
var maca_y = [];         
var maca_dourada_x = [];
var maca_dourada_y = [];

var obst_x = [];      //mesmo esquema de variaveis das maças
var obst_y = [];
var ale_x;
var ale_y;

var rept;   // variavel verificar repetição 

let tempo = document.getElementById("tempo");  // variaveis de tempo
let crono = 50;
let intervaloDeTempo;

let vidas = document.getElementById("vidas");   //variaveis de vida
let quantidadeVidas = 0;
let macaEngolidas = 0;

var paraEsquerda = false;
var paraDireita = true;
var paraCima = false;
var paraBaixo = false;
var noJogo = true;
var vitoria = false;    

const TAMANHO_PONTO = 15;
const C_ALTURA = 705;
const C_LARGURA = 900;    
const ALEATORIO_MAXIMO_Y = (C_ALTURA / TAMANHO_PONTO);
const ALEATORIO_MAXIMO_X = (C_LARGURA / TAMANHO_PONTO);

const TECLA_ESQUERDA = 37;
const TECLA_DIREITA = 39;
const TECLA_ACIMA = 38;
const TECLA_ABAIXO = 40;

var x = [];
var y = [];

// variaveis para controle da velocidade da cobrinha

let UltimoMov = 0;
const velocidade_da_cobra = 80;

// variaveis para a cobra se movimentar mais suavemente
var x_anterior2 = [];
var y_anterior2 = [];

//let X_anterior = 0;
//let Y_anterior = 0;
onkeydown = verificarTecla; // Define função chamada ao se pressionar uma tecla

// musica de fundo

var musica = new Audio("musica.mp3");
musica.loop = true;
musica.volume = 0.2;

var musicaFim = new Audio("fim.mp3");
musicaFim.loop = false; 
musicaFim.volume = 0.3;

var MostrarMenu = true;

let JogadorAtual = "";



// Definição das funções

// Essa função IniciarJogo() serve para colocar o nick do jogador
function IniciarJogo() {

    const nick = document.getElementById("NickJogador").value.trim();

    if (nick == "") {

        alert("Coloque seu nick!");
        return;
    }

    JogadorAtual = nick;

    document.getElementById("menu").style.display = "none";
    document.getElementById("jogo").style.display = "flex";

    iniciar();
}


function iniciar() {
    
    tela = document.getElementById("tela");
    ctx = tela.getContext("2d");

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, C_LARGURA, C_ALTURA);

    musica.play();
    carregarImagens();
    criarCobra();
    localizarMaca();
    localizaObstaculo();
    requestAnimationFrame(cicloDeJogo);
    intervalo(); 
    MostrarRanking();
    vidas.textContent = `Vidas: ${quantidadeVidas}`;

}    

function carregarImagens() {
    
    cabeca = new Image();
    cabeca.src = "cabeca.png";    
    
    bola = new Image();
    bola.src = "ponto.png"; 
    
    maca = new Image();
    maca.src = "maca.png"; 

    obstaculo = new Image();
    obstaculo.src = "espinho_10x10_transparente.png"

}

function criarCobra() {
    
    pontos = 3;

    let posicaoValida = false;
    let inicio_x, inicio_y;
    let direcaoEsquerda = Math.random() < 0.5; // 50% de chance de iniciar para a esquerda

    while ( !posicaoValida ) {
        
        inicio_x = Math.floor(Math.random() * (ALEATORIO_MAXIMO_X - pontos)) * TAMANHO_PONTO;
        inicio_y = Math.floor(Math.random() * ALEATORIO_MAXIMO_Y) * TAMANHO_PONTO;

        posicaoValida = true;

        for ( let i = 0; i < pontos; i++ ) {
            
            let cx = direcaoEsquerda ? inicio_x + i * TAMANHO_PONTO : inicio_x - i * TAMANHO_PONTO;
            let cy = inicio_y;

            // Verifica colisão com obstáculos
            for ( let j = 0; j < obst_x.length; j++ ) {
                
                if ( cx === obst_x[j] && cy === obst_y[j] ) {
                    
                    posicaoValida = false;
                    break;
                }
            }

            // Verifica colisão com maçãs
            for ( let j = 0; j < maca_x.length; j++ ) {
                
                if ( cx === maca_x[j] && cy === maca_y[j] ) {
                    
                    posicaoValida = false;
                    break;
                }
            }

            if ( !posicaoValida ) { 
                break;
            }
        }
    }

    // Define posição inicial da cobra
    for ( let i = 0; i < pontos; i++ ) {
        
        x[i] = direcaoEsquerda ? inicio_x + i * TAMANHO_PONTO : inicio_x - i * TAMANHO_PONTO;
        y[i] = inicio_y;

        x_anterior2[i] = x[i];
        y_anterior2[i] = y[i];
    }

    // Define a direção inicial
    paraDireita = !direcaoEsquerda;
    paraEsquerda = direcaoEsquerda;
    paraCima = false;
    paraBaixo = false;
}

function pontuacao(nick, pontos) {
    
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    
    // Verifica se o jogador já está no ranking
    const NoRanking = ranking.findIndex(j => j.nome === nick);
    
    if ( NoRanking !== -1 ) {
        
        if (pontos > ranking[NoRanking].pontos) {
            
            ranking[NoRanking].pontos = pontos;
        
        }
    } else {
        
        ranking.push({nome: nick, pontos: pontos}); // registra um novo jogador
    }
    
    ordenar(ranking);
    ranking = ranking.slice(0, 10); // Mantém apenas os 10 melhores aparecendo no ranking
    
    localStorage.setItem("ranking", JSON.stringify(ranking));
    MostrarRanking();
}

// Função para mostrar o ranking na tela

function MostrarRanking() {
    
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    
    const div = document.getElementById("ranking");
    div.innerHTML = "<h3>Ranking - Top 10 Jogadores</h3>";

    if ( ranking.length === 0 ) {
        
        div.innerHTML = "<p>Nenhum recorde ainda</p>";
        return;
    }

    for ( let i = 0; i < Math.min(ranking.length, 10); i++ ) {
        
        const jogador = ranking[i];
        const item = document.createElement("div");
        
        item.style.marginBottom = "8px";
        item.innerHTML = `<strong>${i + 1}.</strong> ${jogador.nome}: ${jogador.pontos} pontos`;
        div.appendChild(item);
    }
}

// Bubble sort para ordenar o ranking

function ordenar(ranking) {
    
    let tamanho = ranking.length;
    let trocou;
    
    do {
      
        trocou = false;
      
        for (let i = 0; i < tamanho - 1; i++) {
        
            if (ranking[i].pontos < ranking[i + 1].pontos) {
          
            let temp = ranking[i];
            
            ranking[i] = ranking[i + 1];
            ranking[i + 1] = temp;
            trocou = true;
            
            }
        }
      
      tamanho--; 
    
    } while (trocou); 
  }

//diferente do codigo original que tentamos incrementar todos o valores de uma vez e comparar acho melhor incrementar um por vez e comparando
function localizarMaca() {
    
    while ( maca_x.length < 15 ) { // while para garantir que 15 macas vao ser geradas
            
        const aux_x =  Math.floor(Math.random() * ALEATORIO_MAXIMO_X) * TAMANHO_PONTO; //valor aleatorio do ponto x 
        const aux_y = Math.floor(Math.random() * ALEATORIO_MAXIMO_Y) * TAMANHO_PONTO; //valor aleatorio do ponto y

        rept = false   // começa falso
           
        for ( let j = 0; j < maca_x.length; j++ ) {  // no começo não vai ter nada no vetor ent ele vai pular essa logica
            
            if ( maca_x[j] == aux_x && maca_y[j] == aux_y ) {
                    
                rept = true;
                break;
                
            }
        }
            
        for ( let f = 0; f < pontos; f++ ) { //ele pega os pontos da cobra e compara pra não ficar no mesmo ponto
                
            if ( x[f] == aux_x && y[f] == aux_y ) {
                    
                    rept = true;
                    break;
                
                }
        }
            
        if ( rept != true ) { // de primeira ele ja vai adicionar o valor dos pontos no vetor pois não a nada pra comparar
               
            maca_x.push(aux_x) // adiciona o valor do ponto x no vetor x
            maca_y.push(aux_y) // adiciona o valor do ponto y no vetor y
        
        }
    }  
}

function localizaObstaculo() {     // função nova mesmo esquema do localizar maçãs só que com 11 valores

    while ( obst_x.length < 11 ) {
        
        ale_x = Math.floor(Math.random() * ALEATORIO_MAXIMO_X) * TAMANHO_PONTO;
        ale_y = Math.floor(Math.random() * ALEATORIO_MAXIMO_Y) * TAMANHO_PONTO;
        
        rept = false;
        
        for ( let i = 0; i < obst_x.length; i++ ) {
            
            if ( obst_x[i] == ale_x && obst_y[i] == ale_y ) {
                
                rept = true;
                break;
            }
        }
        
        for ( let j = 0; j < pontos; j++ ) {
            
            if ( x[j] == ale_x && y[j] == ale_y ) {
                
                rept = true;
                break;
            }
        }        
    
        for ( let k = 0; k < maca_x.length; k++ ) {
            
            if ( maca_x[k] == ale_x && maca_y[k] == ale_y ) {
                
                rept = true;
                break;
            }
        }
        
        if ( !rept ) {
            
            obst_x.push(ale_x);
            obst_y.push(ale_y);
        }
    }
}

function cronometro() {
        
    crono = crono - 1
        
    tempo.textContent = `Tempo: ${crono}`; // isso vai substituindo o tempo no navegador
     
    if ( crono == 0 ) {
        
        noJogo = false
        
        clearInterval(intervaloDeTempo); // serve para parar a variavel de intervalo
    }
}

function intervalo() {
   
    intervaloDeTempo = setInterval(cronometro,1000); //a função do cronometro a cada 1000 milis = 1 s vai ser chamada
}


function cicloDeJogo(timestamp) { // timestamp é uma função que funciona como um contador de tempo, é a única que achei que se encaixa na interpolação que eu queria fazer.
    
    if ( !noJogo ) {
        
        fimDeJogo()
        return;
    }
    
    if ( vitoria != false ){
        
        Vitoria()
        return;
    }

    if ( !UltimoMov ) {  // se não tiver o ultimo movimento, ele será o timestamp para começar a contagem de tempo em que ele passará entre a "malha quadriculada" do mapa            
        
        UltimoMov = timestamp;
    }

    const variacao_tempo = timestamp - UltimoMov;

    if ( variacao_tempo >= velocidade_da_cobra ) {
        
        verificarMaca();
        verificarObstaculo();
        verificarColisao();
        mover();
        
        UltimoMov = timestamp;
    }
    
    fazerDesenho(timestamp);

    requestAnimationFrame(cicloDeJogo);

}

function verificarMaca() {  // acho que o erro de congelamento esta nessa função
    
    for ( let i = maca_x.length - 1; i >= 0; i-- ) {       // aqui so adicionei um for pra verificar todas as maçãs
    
        if ( ( x[0] == maca_x[i]) && (y[0] == maca_y[i] ) ) {
            
            const som_maca = document.getElementById("som_maca");
            
            som_maca.currentTime = 0;
            som_maca.play();
            
            macaEngolidas = macaEngolidas + 1
            pontos++

            maca_x.splice(i, 1); // essa função não conhecia tive que ver no chat gpt, mas ela pelo que eu vi remove um valor de um vetor serve pra fazer a maça sumir que era a parte que tava com problema
            maca_y.splice(i, 1);
        
            if ( macaEngolidas % 3 === 0 ) {  // no começo a boleana não se aplica pela variavel ser 0 mas a partir que vai encrementando ela vai sendo
                
                quantidadeVidas = quantidadeVidas + 1
                vidas.textContent = `Vidas: ${quantidadeVidas}`;
            }
            
            if ( maca_x.length == 0 ) {
                
                vitoria = true
            }
        }
    }
}    

function verificarObstaculo(){   // quando colidir com obstáculo perde uma vida, só acaba o jogo se vidas chegarem a zero
    
    for ( let i = 0; i < obst_x.length; i++ ) {         
        
        if ( (x[0] == obst_x[i]) && (y[0] == obst_y[i]) ) {
            
            const som_obstaculo = new Audio("som_obstaculo.mp3"); // Cria um novo objeto Audio
            
            som_obstaculo.volume = 0.4;
            som_obstaculo.currentTime = 0;
            som_obstaculo.play();
            
            quantidadeVidas--;        
            vidas.textContent = `Vidas: ${quantidadeVidas}`;

            // Remove o obstáculo que bateu para evitar perder múltiplas vidas na mesma posição
            obst_x.splice(i, 1);
            obst_y.splice(i, 1);

            if ( quantidadeVidas <= 0 ) {
                
                noJogo = false; 
            }

            break; 
        }   
    }
}

function verificarColisao() {
    
    for ( var z = 1; z < pontos; z++ ) {
        
        if ( x[0] == x[z] && y[0] == y[z] ) {
            
            pontos = 2;
            x.length = 2;
            y.length = 2;
            x_anterior2.length = 2;
            y_anterior2.length = 2;
            break;
        }
    }
}

function mover() {
    
    for ( let w = 0; w < pontos; w++ ) {

        x_anterior2[w] = x[w];
        y_anterior2[w] = y[w];
    }
    
    for (let z = pontos; z > 0; z--) {
        
        x[z] = x[z - 1];
        y[z] = y[z - 1];
    
    }

    if (paraEsquerda) {
        
        x[0] -= TAMANHO_PONTO;
    }

    if (paraDireita) {
        
        x[0] += TAMANHO_PONTO;
    }

    if (paraCima) {
        
        y[0] -= TAMANHO_PONTO;
    }

    if (paraBaixo) {
        
        y[0] += TAMANHO_PONTO;
    } 

    // serie de if`s para a cobra teleportar para o outro lado do mapa caso ela colida com as bordas.
    
    if ( x[0] >= C_LARGURA ) {
        
        x[0] = 0;
    }

    else if ( x[0] < 0 ) {

        x[0] = C_LARGURA - TAMANHO_PONTO;
    }

    if ( y[0] > C_ALTURA ) {
        
        y[0] = 0;
    }

    else if ( y[0] < 0 ) {

        y[0] = C_ALTURA - TAMANHO_PONTO;
    }
}    

function fazerDesenho(timestamp) {
    
    ctx.clearRect(0, 0, C_LARGURA, C_ALTURA);
	ctx.fillRect(0, 0, C_LARGURA, C_ALTURA);
	
    if (noJogo) {
        
        for ( let i = 0; i < maca_x.length ; i++ ) { // parte de desenho foi facil so colocar todos os valores do vetor
        
            ctx.drawImage(maca, maca_x[i], maca_y[i], TAMANHO_PONTO, TAMANHO_PONTO);
        }
        
        for (let z = 0; z < obst_x.length ; z++) {  
            
            ctx.drawImage(obstaculo, obst_x[z], obst_y[z], TAMANHO_PONTO, TAMANHO_PONTO);
        }

        let variacao_tempo = timestamp - UltimoMov;
        
        let tempo = Math.min(variacao_tempo / velocidade_da_cobra, 1);

        for ( let z = 0; z < pontos; z++ ) {       // Interpolação, cirei duas variáveis para cada eixo interpolado e um for para fazer em toda a cobra e depois só usei a lógica do código original porém usei o operador ternário ao invés do if else clássico, só pra recapitular, o if else ternário ai serve para organizar a posição da cabeça no corpo direitinho.
            
            let interpolacao_X = x_anterior2[z] + (x[z] - x_anterior2[z]) * tempo;
            let interpolacao_Y = y_anterior2[z] + (y[z] - y_anterior2[z]) * tempo;
        
            z == 0 ? ctx.drawImage(cabeca, interpolacao_X, interpolacao_Y, TAMANHO_PONTO, TAMANHO_PONTO) :
            
            ctx.drawImage(bola, interpolacao_X, interpolacao_Y, TAMANHO_PONTO, TAMANHO_PONTO);
        
        } 
    
    } else {
        
        fimDeJogo();
    }
    
    ctx.fillStyle = "black";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "right";

    //ctx.fillText(`Tempo: ${crono}`, C_LARGURA - 10, 20);
    //ctx.fillText(`Vidas: ${quantidadeVidas}`, C_LARGURA - 10, 40);
}

function fimDeJogo() {
    
    ctx.fillStyle = "white";
    
    ctx.textBaseline = "middle"; 
    
    ctx.textAlign = "center"; 
    
    ctx.font = "normal bold 18px serif";
    
    ctx.fillText("Fim de Jogo", C_LARGURA / 2, C_ALTURA / 2);

    pontuacao(JogadorAtual, macaEngolidas);

    musicaFim.play();

    musica.pause();
    musica.currentTime = 0;

}

function Vitoria() {
    
    ctx.fillStyle = "green";
    
    ctx.textBaseline = "middle"; 
    
    ctx.textAlign = "center"; 
    
    ctx.font = "normal bold 18px serif";
    
    ctx.fillText("Você ganhou", C_LARGURA / 2, C_ALTURA / 2);

    pontuacao(JogadorAtual, macaEngolidas);
}

function verificarTecla(e) {
    
    var tecla = e.keyCode;

    if ( (tecla == TECLA_ESQUERDA) && (!paraDireita) ) {
        
        paraEsquerda = true;
        paraCima = false;
        paraBaixo = false;
    }

    if ( (tecla == TECLA_DIREITA) && (!paraEsquerda) ) {
        
        paraDireita = true;
        paraCima = false;
        paraBaixo = false;
    }

    if ( (tecla == TECLA_ACIMA) && (!paraBaixo) ) {

        paraCima = true;
        paraDireita = false;
        paraEsquerda = false;
    }

    if ( (tecla == TECLA_ABAIXO) && (!paraCima) ) {
        
        paraBaixo = true;
        paraDireita = false;
        paraEsquerda = false;
    }
}