/* ------------------------------------------------------------------
   Dados da vitrine — Brenda Honda · Motorac Toritama
   Preços = Preço Público Sugerido (base São Paulo, sem frete), pesquisados
   em 14/11/2026. Mudam com frequência: confirme com a Brenda.
   Fotos: ficam em /assets/motos/ e são ligadas a cada cor em "fotos" (a primeira
   é a lateral; as demais aparecem como outros ângulos na janela de detalhes).
   Cor sem "fotos" mostra a ilustração desenhada em js/bikes.js.
------------------------------------------------------------------- */

const CONFIG = {
  // Número da Brenda no WhatsApp (se ficar vazio, os botões abrem o Instagram dela).
  whatsapp: "5581994391218",
  instagram: "brendahonda_",
  loja: "Motorac Toritama",
  dataPrecos: "14/11/2026",
  // Texto do topo do site (editável no painel). l1–l3 = as 3 linhas do título.
  hero: {
    l1: "Sua próxima",
    l2: "Honda sai",
    l3: "daqui.",
    texto: "Eu sou a Brenda, vendedora interna da Motorac, em Toritama. Veja as Honda 0 km, compare os modelos e me chame para conversar.",
    btn1: "Falar com a Brenda",
    btn2: "Ver as motos"
  },
  // Texto do rodapé, no final do site (editável no painel). nome = em negrito;
  // cargo = vem depois do nome, separado por vírgula; aviso = linha em letra menor.
  rodape: {
    nome: "Brenda Honda",
    cargo: "vendedora interna da Motorac, Toritama.",
    aviso: "Site de divulgação da vendedora. Honda é marca de Honda Motor Co., Ltd. As imagens são ilustrativas; consulte cores, versões e condições oficiais com a Brenda."
  }
};

const F = n => "assets/motos/" + n + ".webp";

const MOTOS = [
  {
    id: "pop", nome: "Pop 110i ES", cat: "dia", tipo: "cub", camb: "semi",
    tag: "A menor e mais leve da linha Honda",
    versoes: [{ n: "Pop 110i ES", p: 10588 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("pop-vermelha")] },
      { n: "Branca", h: "#f1f2f4", fotos: [F("pop-branca")] },
      { n: "Azul", h: "#1c2b70", fotos: [F("pop-azul")] }
    ],
    uso: { trabalho: 2, cidade: 3, estrada: 0, lazer: 1 },
    spec: {
      cil: "109,5 cm³", pot: "8,4 cv a 7.250 rpm", potN: 8.43, torque: "0,945 kgf.m a 5.000 rpm",
      cambio: "Semiautomático, 4 marchas", tanque: "4,2 L", tanqueN: 4.2,
      peso: "88 kg", pesoN: 88, banco: "747 mm", freio: "CBS, tambor na frente e atrás",
      comb: "Gasolina"
    },
    destaques: [
      "Câmbio semiautomático: sem embreagem, ideal para quem está começando",
      "Rodas de liga leve e pneus sem câmara na linha 2027",
      "Consumo de referência de 49,1 km/l"
    ]
  },
  {
    id: "biz", nome: "Biz 125", cat: "dia", tipo: "cub", camb: "semi",
    tag: "Prática, econômica e com espaço sob o banco",
    versoes: [{ n: "Biz 125 ES", p: 13505 }, { n: "Biz 125 EX (flex, freio a disco)", p: 16840 }],
    cores: [
      { n: "Vermelha (EX)", h: "#d6001c", fotos: [F("biz-ex-vermelha")] },
      { n: "Cinza (EX)", h: "#9aa0ab", fotos: [F("biz-ex-cinza")] },
      { n: "Pérola (EX)", h: "#efe6d2", fotos: [F("biz-ex-branca")] },
      { n: "Branca (ES)", h: "#f1f2f4", fotos: [F("biz-es-branca")] },
      { n: "Preta (ES)", h: "#24262c", fotos: [F("biz-es-preta")] }
    ],
    uso: { trabalho: 3, cidade: 3, estrada: 0, lazer: 1 },
    spec: {
      cil: "123,9 cm³", pot: "9,53 cv a 7.500 rpm", potN: 9.53, torque: "1,03 kgf.m a 6.000 rpm",
      cambio: "Semiautomático, 4 marchas", tanque: "5 L", tanqueN: 5,
      peso: "96 kg", pesoN: 96, banco: "753 mm (EX)", freio: "ES: tambor · EX: disco na frente, CBS",
      comb: "ES: gasolina · EX: flex"
    },
    destaques: [
      "Compartimento sob o banco para guardar o capacete",
      "Leve (96 kg a seco) e fácil de manobrar no trânsito",
      "EX com motor flex, freio a disco e USB-C"
    ]
  },
  {
    id: "elite", nome: "Elite 125", cat: "scooter", tipo: "scooter", camb: "auto",
    tag: "Scooter automática, leve e fácil de manobrar",
    versoes: [{ n: "Elite 125", p: 14300 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("elite-vermelha")] },
      { n: "Cinza", h: "#8e93a8", fotos: [F("elite-cinza")] },
      { n: "Roxa", h: "#5b2a9a", fotos: [F("elite-roxa")] }
    ],
    uso: { trabalho: 1, cidade: 3, estrada: 0, lazer: 2 },
    spec: {
      cil: "123,9 cm³", pot: "8,2 cv a 6.250 rpm", potN: 8.2, torque: "1,06 kgf.m a 5.000 rpm",
      cambio: "Automático (CVT)", tanque: "5,3 L", tanqueN: 5.3,
      peso: "100 kg", pesoN: 100, banco: "765 mm", freio: "Disco na frente, tambor atrás (CBS)",
      comb: "Gasolina"
    },
    destaques: [
      "Câmbio automático: é só acelerar",
      "19,7 litros de espaço sob o assento",
      "Idling Stop desliga o motor nas paradas para economizar"
    ]
  },
  {
    id: "cg", nome: "CG 160", cat: "dia", tipo: "street", camb: "manual",
    tag: "A moto mais vendida do Brasil",
    versoes: [
      { n: "CG 160 Start", p: 17778 }, { n: "CG 160 Cargo", p: 18884 },
      { n: "CG 160 Fan", p: 19449 }, { n: "CG 160 Titan (ABS)", p: 21098 }
    ],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("cg-titan-vermelha"), F("cg-fan-vermelha"), F("cg-start-vermelha")], legendas: ["Titan", "Fan", "Start"] },
      { n: "Preta", h: "#24262c", fotos: [F("cg-titan-preta"), F("cg-fan-preta"), F("cg-start-preta")], legendas: ["Titan", "Fan", "Start"] },
      { n: "Prata", h: "#a9adb5", fotos: [F("cg-fan-prata"), F("cg-start-prata")], legendas: ["Fan", "Start"] },
      { n: "Azul", h: "#1d4aa8", fotos: [F("cg-titan-azul")] }
    ],
    uso: { trabalho: 3, cidade: 3, estrada: 2, lazer: 1 },
    spec: {
      cil: "162,7 cm³", pot: "14,7 cv (etanol) · 14,4 cv (gasolina)", potN: 14.7, torque: "1,43 kgf.m (etanol) a 6.750 rpm",
      cambio: "Manual, 5 marchas", tanque: "14 L", tanqueN: 14,
      peso: "117 a 120 kg", pesoN: 117, banco: "796 mm", freio: "Disco na frente · Titan com ABS",
      comb: "Flex (gasolina ou etanol)"
    },
    destaques: [
      "Motor flex em todas as versões da linha 2027",
      "Tanque de 14 litros para rodar mais entre um abastecimento e outro",
      "Entrada USB-C em todas as versões"
    ]
  },
  {
    id: "bros", nome: "NXR 160 Bros", cat: "trail", tipo: "trail", camb: "manual",
    tag: "Trail para rua e estrada de terra",
    versoes: [{ n: "NXR 160 Bros CBS", p: 22830 }, { n: "NXR 160 Bros ABS", p: 23970 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("bros-vermelha"), F("bros-vermelha-3q")] },
      { n: "Preta", h: "#24262c", fotos: [F("bros-preta")] },
      { n: "Verde", h: "#5f7a4a", fotos: [F("bros-verde"), F("bros-verde-3q")] }
    ],
    uso: { trabalho: 2, cidade: 2, estrada: 3, lazer: 2 },
    spec: {
      cil: "162,7 cm³", pot: "14,3 cv (etanol) · 14,2 cv (gasolina) a 8.000 rpm", potN: 14.3, torque: "1,47 kgf.m a 5.500 rpm",
      cambio: "Manual, 5 marchas", tanque: "12 L", tanqueN: 12,
      peso: "125 kg", pesoN: 125, banco: "836 mm", freio: "CBS ou ABS (1 canal)",
      comb: "Flex (gasolina ou etanol)"
    },
    destaques: [
      "247 mm de vão livre do solo para encarar buracos e terra",
      "Pisca de LED e alerta de frenagem (ESS) na versão ABS",
      "Quadro de aço e motor simples de manter"
    ]
  },
  {
    id: "pcx", nome: "PCX 160", cat: "scooter", tipo: "scooter2", camb: "auto",
    tag: "Scooter para a cidade, com 30 litros sob o banco",
    versoes: [
      { n: "PCX 160 CBS", p: 18710 }, { n: "PCX 160 ABS", p: 20570 }, { n: "PCX 160 DLX ABS", p: 21050 }
    ],
    cores: [
      { n: "Azul (ABS)", h: "#1d4aa8", fotos: [F("pcx-azul"), F("pcx-azul-3q")] },
      { n: "Branca (CBS)", h: "#f1f2f4", fotos: [F("pcx-branca"), F("pcx-branca-3q")] }
    ],
    uso: { trabalho: 1, cidade: 3, estrada: 1, lazer: 3 },
    spec: {
      cil: "156,9 cm³", pot: "16 cv a 8.500 rpm", potN: 16, torque: "1,5 kgf.m a 6.500 rpm",
      cambio: "Automático (CVT)", tanque: "8 L", tanqueN: 8,
      peso: "124 a 126 kg", pesoN: 124, banco: "764 mm", freio: "CBS ou ABS (disco nas duas rodas)",
      comb: "Gasolina"
    },
    destaques: [
      "Compartimento de 30 litros sob o banco",
      "Chave presencial e porta USB no porta-luvas",
      "Controle de torque HSTC nas versões ABS e DLX"
    ]
  },
  {
    id: "adv", nome: "ADV 160", cat: "scooter", tipo: "scooter2", camb: "auto",
    tag: "A scooter aventureira, com pegada de trilha e conforto de cidade",
    versoes: [{ n: "ADV 160", p: 25520 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("adv-vermelha")] },
      { n: "Cinza", h: "#8e939c", fotos: [F("adv-cinza")] }
    ],
    uso: { trabalho: 1, cidade: 3, estrada: 1, lazer: 3 },
    spec: {
      cil: "156,9 cm³", pot: "16 cv a 8.500 rpm", potN: 16, torque: "1,5 kgf.m a 6.500 rpm",
      cambio: "Automático (CVT)", tanque: "8 L", tanqueN: 8,
      peso: "128 kg (a seco)", pesoN: 128, banco: "780 mm", freio: "Disco nas duas rodas, ABS na dianteira",
      comb: "Gasolina"
    },
    destaques: [
      "Para-brisa regulável em duas posições e visual de aventureira",
      "Controle de torque HSTC, que ajuda a segurar a tração em piso escorregadio",
      "29 litros sob o banco, Smart Key e tomada USB-C"
    ]
  },
  {
    id: "xre190", nome: "XRE 190", cat: "trail", tipo: "adv", camb: "manual",
    tag: "Trail de entrada com visual de Sahara",
    versoes: [{ n: "XRE 190", p: 24530 }, { n: "XRE 190 Adventure", p: 25080 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("xre190-vermelha"), F("xre190-vermelha-3q")] },
      { n: "Cinza", h: "#8b8f98", fotos: [F("xre190-cinza-3q")] }
    ],
    uso: { trabalho: 1, cidade: 2, estrada: 3, lazer: 2 },
    spec: {
      cil: "184,4 cm³", pot: "16 cv (etanol) · 15,9 cv (gasolina) a 8.000 rpm", potN: 16, torque: "1,66 kgf.m (etanol) a 6.000 rpm",
      cambio: "Manual, 5 marchas", tanque: "12 L", tanqueN: 12,
      peso: "128 kg", pesoN: 128, banco: "836 mm", freio: "Disco de 240 mm na frente com ABS de 1 canal, disco de 220 mm atrás",
      comb: "Flex (gasolina ou etanol)"
    },
    destaques: [
      "Visual inspirado na Sahara, com iluminação toda em LED",
      "Suspensão de longo curso: 180 mm na frente",
      "Motor flex de 184 cc, leve e econômico"
    ]
  },
  {
    id: "twister", nome: "CB 300F Twister", cat: "naked", tipo: "naked", camb: "manual",
    tag: "Naked esportiva com suspensão invertida",
    versoes: [{ n: "CB 300F Twister ABS", p: 26880 }, { n: "CB 300F Twister S", p: 27680 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("twister-vermelha"), F("twister-vermelha-3q")] },
      { n: "Preta", h: "#24262c", fotos: [F("twister-preta"), F("twister-preta-3q")] }
    ],
    uso: { trabalho: 0, cidade: 2, estrada: 2, lazer: 3 },
    spec: {
      cil: "293,5 cm³", pot: "24,7 cv (etanol) · 24,5 cv (gasolina) a 7.500 rpm", potN: 24.7, torque: "2,67 kgf.m a 5.500 rpm",
      cambio: "Manual, 6 marchas", tanque: "14,1 L", tanqueN: 14.1,
      peso: "142 kg", pesoN: 142, banco: "789 mm", freio: "Disco 276 mm na frente, ABS nas duas rodas",
      comb: "Flex (gasolina ou etanol)"
    },
    destaques: [
      "Suspensão dianteira invertida e controle de tração HSTC",
      "ABS de série e iluminação toda em LED",
      "Versão S com rabeta monoposto e acabamento esportivo"
    ]
  },
  {
    id: "tornado", nome: "XR 300L Tornado", cat: "trail", tipo: "trail", camb: "manual",
    tag: "Trail leve de 300 cc para terra e rua",
    versoes: [{ n: "XR 300L Tornado", p: 31700 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("tornado-vermelha")] }
    ],
    uso: { trabalho: 0, cidade: 1, estrada: 3, lazer: 3 },
    spec: {
      cil: "293,5 cm³", pot: "25,2 cv (etanol) · 24,8 cv (gasolina) a 7.500 rpm", potN: 25.2, torque: "2,74 kgf.m (etanol) a 5.750 rpm",
      cambio: "Manual, 6 marchas", tanque: "13,8 L", tanqueN: 13.8,
      peso: "143 kg", pesoN: 143, banco: "890 mm", freio: "ABS de 2 canais, com ABS traseiro desligável",
      comb: "Flex (gasolina ou etanol)"
    },
    destaques: [
      "Leve para a categoria: 143 kg a seco",
      "Suspensão com 245 mm de curso na frente e 227 mm atrás",
      "Linha 2027 com controle de tração e antifurto",
      "Banco a 890 mm do chão: vale sentar antes de decidir"
    ]
  },
  {
    id: "sahara", nome: "XRE 300 Sahara", cat: "trail", tipo: "adv", camb: "manual",
    tag: "Trail de 300 cc para estrada e terra",
    versoes: [
      { n: "Sahara Standard", p: 31855 }, { n: "Sahara Rally", p: 32555 }, { n: "Sahara Adventure", p: null }
    ],
    cores: [
      { n: "Cinza", h: "#8b8f98", fotos: [F("sahara-cinza")] },
      { n: "Branca", h: "#f1f2f4", fotos: [F("sahara-branca"), F("sahara-branca-3q")] }
    ],
    uso: { trabalho: 0, cidade: 1, estrada: 3, lazer: 3 },
    spec: {
      cil: "293,5 cm³", pot: "25,2 cv (etanol) · 24,8 cv (gasolina) a 7.500 rpm", potN: 25.2, torque: "2,74 kgf.m (etanol) a 5.750 rpm",
      cambio: "Manual, 6 marchas", tanque: "13,8 L", tanqueN: 13.8,
      peso: "146 a 149 kg", pesoN: 146, banco: "859 mm", freio: "Disco 256 mm na frente, ABS de 2 canais",
      comb: "Flex (gasolina ou etanol)"
    },
    destaques: [
      "Suspensão com 245 mm de curso na frente e 225 mm atrás",
      "ABS de 2 canais, controle de tração HSTC e antifurto HISS",
      "Painel LCD com USB-C e luz de alerta de frenagem"
    ]
  },
  {
    id: "cb500", nome: "CB 500 Hornet", cat: "naked", tipo: "naked", camb: "manual",
    tag: "Naked média com suspensão invertida e painel TFT",
    versoes: [{ n: "CB 500 Hornet", p: 43470 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("cb500-vermelha")] },
      { n: "Preta", h: "#24262c", fotos: [F("cb500-preta")] },
      { n: "Prata", h: "#a9adb5", fotos: [F("cb500-cinza")] }
    ],
    uso: { trabalho: 0, cidade: 2, estrada: 3, lazer: 3 },
    spec: {
      cil: "471 cm³", pot: "49,6 cv a 8.500 rpm", potN: 49.6, torque: "4,5 kgf.m a 7.000 rpm",
      cambio: "Manual, 6 marchas, embreagem assistida e deslizante", tanque: "17,1 L", tanqueN: 17.1,
      peso: "175 kg", pesoN: 175, banco: "785 mm", freio: "Discos duplos de 296 mm na frente, disco de 240 mm atrás, ABS",
      comb: "Gasolina"
    },
    destaques: [
      "Suspensão dianteira invertida e freios radiais Nissin",
      "Painel TFT colorido de 5 polegadas e controle de tração HSTC",
      "Tanque de 17,1 litros para rodar mais entre abastecimentos"
    ]
  },
  {
    id: "nx500", nome: "NX 500", cat: "trail", tipo: "adv", camb: "manual",
    tag: "Crossover de 500 cc para viajar e rodar na cidade",
    versoes: [{ n: "NX 500", p: 46260 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("nx500-vermelha")] },
      { n: "Preta", h: "#24262c", fotos: [F("nx500-preta")] },
      { n: "Cinza", h: "#8b8f98", fotos: [F("nx500-cinza")] }
    ],
    uso: { trabalho: 0, cidade: 1, estrada: 3, lazer: 3 },
    spec: {
      cil: "471 cm³", pot: "49,6 cv a 8.500 rpm", potN: 49.6, torque: "4,5 kgf.m a 7.000 rpm",
      cambio: "Manual, 6 marchas, embreagem assistida e deslizante", tanque: "17,7 L", tanqueN: 17.7,
      peso: "183 kg", pesoN: 183, banco: "834 mm", freio: "Discos duplos na frente, disco atrás, ABS",
      comb: "Gasolina"
    },
    destaques: [
      "Tanque de 17,7 litros, com autonomia teórica perto de 480 km",
      "Painel TFT de 5 polegadas, controle de tração HSTC e iluminação em LED",
      "Roda dianteira de 19 polegadas e mais curso de suspensão que a Hornet"
    ]
  },
  {
    id: "cb750", nome: "CB 750 Hornet", cat: "naked", tipo: "naked", camb: "manual",
    tag: "A Hornet bicilíndrica de 755 cc, leve e cheia de torque",
    versoes: [{ n: "CB 750 Hornet", p: 53694 }],
    cores: [
      { n: "Branca", h: "#f1f2f4", fotos: [F("cb750-branca")] },
      { n: "Preta", h: "#24262c", fotos: [F("cb750-preta")] }
    ],
    uso: { trabalho: 0, cidade: 2, estrada: 2, lazer: 3 },
    spec: {
      cil: "755 cm³", pot: "69,3 cv a 7.000 rpm", potN: 69.3, torque: "7,04 kgf.m a 7.000 rpm",
      cambio: "Manual, 6 marchas, embreagem assistida e deslizante", tanque: "15,2 L", tanqueN: 15.2,
      peso: "180 kg", pesoN: 180, banco: "795 mm", freio: "Discos na frente e atrás, com ABS",
      comb: "Gasolina"
    },
    destaques: [
      "Peso seco de 180 kg, leve para uma 750",
      "Cinco modos de pilotagem, com controle de tração HSTC e antiempinada",
      "Painel TFT colorido de 5 polegadas"
    ]
  },
  {
    id: "cb1000", nome: "CB 1000 Hornet", cat: "naked", tipo: "naked", camb: "manual",
    tag: "Naked de 4 cilindros com motor de Fireblade",
    versoes: [{ n: "CB 1000 Hornet ABS", p: 68800 }, { n: "CB 1000 Hornet SP", p: 76750 }],
    cores: [
      { n: "Branca", h: "#f1f2f4", fotos: [F("cb1000-branca")] },
      { n: "Vermelha", h: "#d6001c", fotos: [F("cb1000-vermelha"), F("cb1000-vermelha-3q")] }
    ],
    uso: { trabalho: 0, cidade: 1, estrada: 2, lazer: 3 },
    spec: {
      cil: "999 cm³", pot: "147,4 cv a 11.000 rpm", potN: 147.4, torque: "10,3 kgf.m a 9.000 rpm",
      cambio: "Manual, 6 marchas", tanque: "17 L", tanqueN: 17,
      peso: "197 kg", pesoN: 197, banco: "809 mm", freio: "Discos duplos na frente, disco atrás, ABS",
      comb: "Gasolina"
    },
    destaques: [
      "Motor de 4 cilindros em linha derivado da CBR 1000RR Fireblade",
      "Acelerador eletrônico, modos de pilotagem e painel TFT de 5 polegadas",
      "Quickshifter bidirecional na versão SP"
    ]
  },
  {
    id: "crf300f", nome: "CRF 300F", cat: "offroad", tipo: "trail", camb: "manual", semQuiz: true,
    tag: "Moto de trilha, só para uso fora de estrada",
    versoes: [{ n: "CRF 300F", p: 24027 }],
    cores: [
      { n: "Vermelha", h: "#d6001c", fotos: [F("crf300f-vermelha")] }
    ],
    uso: { trabalho: 0, cidade: 0, estrada: 0, lazer: 3 },
    spec: {
      cil: "293,5 cm³", pot: "24,6 cv a 7.500 rpm", potN: 24.6, torque: "2,59 kgf.m a 6.000 rpm",
      cambio: "Manual, 6 marchas", tanque: "7 L", tanqueN: 7,
      peso: "119 kg", pesoN: 119, banco: "890 mm", freio: "Discos wave de 240 mm na frente e 220 mm atrás, sem ABS",
      comb: "Gasolina"
    },
    destaques: [
      "Uso exclusivo fora de estrada: não é homologada para rodar em vias públicas",
      "Chassi twin tube, rodas de 21 e 18 polegadas e pneus Pirelli Scorpion XC",
      "Câmbio de 6 marchas e radiador de óleo"
    ]
  }
];

const CATEGORIAS = [
  { id: "todas", nome: "Todas" },
  { id: "dia", nome: "Dia a dia" },
  { id: "scooter", nome: "Scooter" },
  { id: "trail", nome: "Trail" },
  { id: "naked", nome: "Naked" },
  { id: "offroad", nome: "Off-road" }
];

const PROMESSAS = [
  { t: "Atendimento ágil", d: "Respondo rápido, sem enrolação, e te ajudo a decidir com calma." },
  { t: "Transparência em cada etapa", d: "Você sabe o que está comprando e acompanha cada passo até a retirada." },
  { t: "As melhores condições do mercado", d: "Busco a condição que cabe no seu bolso e no seu planejamento." },
  { t: "Qualidade e tradição Honda", d: "Moto nova, com a garantia de fábrica e a confiança da marca." }
];
