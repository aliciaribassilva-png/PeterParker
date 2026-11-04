document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvasJogo");
    const ctx = canvas.getContext("2d");
    const wrapper = document.getElementById("jogoWrapper");
    const btnTelaCheia = document.getElementById("btnTelaCheia");
    const telaInfo = document.getElementById("telaInfo");
    const textoInfo = document.getElementById("textoInfo");

    // Configurações do Jogo
    let estado = "START"; // START, JOGANDO, GAMEOVER
    let score = 0;
    let highQuantity = localStorage.getItem("dinoHighScore") || 0;
    let velocidade = 6;
    let frameId;

    // Configurações do Dino
    const dino = {
        x: 50,
        y: 110,
        w: 20,
        h: 40,
        vy: 0,
        gravidade: 1.2,
        pulo: -15,
        noChao: true,
        frameAgachado: false
    };

    // Obstáculos
    let obstaculos = [];

    // Captura de Teclas / Toques
    document.addEventListener("keydown", (e) => {
        if ((e.code === "Space" || e.code === "ArrowUp")) {
            e.preventDefault();
            acaoPular();
        }
        if (e.code === "ArrowDown" && estado === "JOGANDO") {
            e.preventDefault();
            dino.frameAgachado = true;
            dino.h = 25; // Encolhe
            if(dino.noChao) dino.y = 125;
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.code === "ArrowDown") {
            dino.frameAgachado = false;
            dino.h = 40;
            if(dino.noChao) dino.y = 110;
        }
    });

    // Suporte para Telas Touch (Celular)
    wrapper.addEventListener("touchstart", (e) => {
        e.preventDefault();
        acaoPular();
    });

    function acaoPular() {
        if (estado === "START" || estado === "GAMEOVER") {
            resetJogo();
        } else if (estado === "JOGANDO" && dino.noChao) {
            dino.vy = dino.pulo;
            dino.noChao = false;
        }
    }

    // Botão de Tela Cheia
    btnTelaCheia.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen().catch(err => {
                console.log(`Erro ao ativar tela cheia: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    function resetJogo() {
        estado = "JOGANDO";
        score = 0;
        velocidade = 6;
        obstaculos = [];
        dino.y = 110;
        dino.vy = 0;
        dino.noChao = true;
        telaInfo.style.display = "none";
        cancelAnimationFrame(frameId);
        atualizar();
    }

    function gerarObstaculo() {
        if (obstaculos.length === 0 || canvas.width - obstaculos[obstaculos.length - 1].x > Math.random() * 200 + 150) {
            // Alterna entre cacto fino, largo ou duplo
            let tipo = Math.random();
            let largura = tipo > 0.6 ? 25 : 15;
            let altura = tipo > 0.3 ? 35 : 45;
            
            obstaculos.push({
                x: canvas.width,
                y: canvas.height - altura,
                w: largura,
                h: altura
            });
        }
    }

    function atualizar() {
        if (estado !== "JOGANDO") return;

        // Limpar tela
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Pontuação aumenta gradativamente
        score += 0.15;
        velocidade += 0.001; // Aumenta dificuldade

        // Desenhar Chão (Linha clássica do Chrome)
        ctx.strokeStyle = "#535353";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 140);
        ctx.lineTo(canvas.width, 140);
        ctx.stroke();

        // Gravidade e Pulo do Dino
        dino.vy += dino.gravidade;
        dino.y += dino.vy;

        // Limite do Chão
        let chaoAtual = dino.frameAgachado ? 125 : 110;
        if (dino.y >= chaoAtual) {
            dino.y = chaoAtual;
            dino.vy = 0;
            dino.noChao = true;
        }

        // Desenhar Dinossauro (Estilo silhueta pixelada)
        ctx.fillStyle = "#535353";
        ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
        
        // Detalhe do Olho do Dino para parecer idêntico
        ctx.fillStyle = "#fff";
        ctx.fillRect(dino.x + 12, dino.y + 4, 3, 3);

        // Gerenciar e desenhar Cactos
        gerarObstaculo();
        ctx.fillStyle = "#535353";

        for (let i = obstaculos.length - 1; i >= 0; i--) {
            let obs = obstaculos[i];
            obs.x -= velocidade;

            // Desenhar Cacto
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

            // Detecção de colisão precisa
            if (
                dino.x < obs.x + obs.w &&
                dino.x + dino.w > obs.x &&
                dino.y < obs.y + obs.h &&
                dino.y + dino.h > obs.y
            ) {
                fimDeJogo();
            }

            // Remover obstáculos que saíram da tela
            if (obs.x + obs.w < 0) {
                obstaculos.splice(i, 1);
            }
        }

        // Mostrar Pontuação na Tela (Canto Superior Direito)
        ctx.fillStyle = "#535353";
        ctx.font = "14px 'Courier New'";
        let pontosAtuais = Math.floor(score).toString().padStart(5, '0');
        let recordeMaximo = Math.floor(highQuantity).toString().padStart(5, '0');
        ctx.fillText(`HI ${recordeMaximo}  ${pontosAtuais}`, canvas.width - 120, 20);

        frameId = requestAnimationFrame(atualizar);
    }

    function fimDeJogo() {
        estado = "GAMEOVER";
        if (score > highQuantity) {
            highQuantity = score;
            localStorage.setItem("dinoHighScore", highQuantity);
        }
        textoInfo.innerHTML = "G A M E  O V E R<br><span style='font-size:12px; font-weight:normal;'>Pressione ESPAÇO para tentar novamente</span>";
        telaInfo.style.display = "flex";
    }
});
