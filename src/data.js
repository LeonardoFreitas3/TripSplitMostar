// Itinerário inicial. É só o ponto de partida: assim que editas algo na app,
// passa a ser guardado no telemóvel (localStorage). Para repor isto, usa "Repor".

export const HOTELS = {
  split: { name: 'Bel Etage Luxury Rooms', lat: 43.5037643, lng: 16.4962506 },
  mostar: { name: 'Hotel Amicus', lat: 43.362246, lng: 17.8177494 },
}

// Cor por dia: Split em tons de azul (Adriático), Mostar em terracota
// (telhados otomanos), e o dia de viagem em ardósia. A cor codifica a base.
export const DAY_COLORS = [
  '#2BB7E6', // D1 Split
  '#1E9BC9', // D2 Split
  '#0E7C9B', // D3 Split
  '#C9612F', // D4 Split -> Mostar
  '#D9743B', // D5 Mostar
  '#E0935A', // D6 Mostar
  '#5B6B73', // D7 viagem
]

export const INITIAL_DATA = {
  meta: {
    title: 'Split & Mostar',
    subtitle: '5 – 11 Agosto',
    start: '2026-08-05',
    end: '2026-08-11',
  },
  days: [
    {
      id: 'd1',
      date: '2026-08-05',
      weekday: 'Quarta',
      title: 'Chegada a Split',
      base: 'split',
      narrative: 'Chegada às 18:00. Noite tranquila no centro histórico.',
      hotel: { ...HOTELS.split },
      stops: [
        {
          id: 's1', name: 'Palácio de Diocleciano', time: '19:30', durationMin: 90,
          lat: 43.5082646, lng: 16.4401754,
          notes: 'Passear ao fim do dia, quando os cruzeiros já saíram e está mais fresco.',
        },
        {
          id: 's2', name: 'Riva (Obala HNP)', time: '21:00', durationMin: 90,
          lat: 43.5077507, lng: 16.4384962,
          notes: 'Jantar e bebida na marginal. É daqui que partem os barcos da Gruta Azul amanhã.',
        },
      ],
    },
    {
      id: 'd2',
      date: '2026-08-06',
      weekday: 'Quinta',
      title: 'Gruta Azul + ilhas',
      base: 'split',
      narrative: 'Dia inteiro de barco. Partir cedo é essencial para evitar filas na gruta. Reservar com antecedência (Jul–Ago esgota) e levar dinheiro para a entrada (~€12–24). Depende do mar; se houver ondulação, trocar com o dia de Krka.',
      hotel: { ...HOTELS.split },
      stops: [
        {
          id: 's3', name: 'Partida do tour — Riva', time: '07:00', durationMin: 660,
          lat: 43.5077507, lng: 16.4384962,
          notes: 'Lancha: ~1h30 até Biševo, gruta + Vis/Hvar/Pakleni. Regresso ~18:00. Não se nada dentro da gruta.',
        },
      ],
    },
    {
      id: 'd3',
      date: '2026-08-07',
      weekday: 'Sexta',
      title: 'Parque Nacional de Krka',
      base: 'split',
      narrative: 'Sair cedo de Split (~1h15 de carro). Comprar bilhete online e entrar à abertura (8h) para evitar os autocarros de grupos.',
      hotel: { ...HOTELS.split },
      stops: [
        {
          id: 's4', name: 'Krka — entrada Lozovac', time: '08:00', durationMin: 240,
          lat: 43.8666017, lng: 15.9724838,
          notes: 'Entrada para quem vem de carro. Shuttle gratuito até Skradinski Buk. Sem banhos na cascata principal (proibido desde 2021).',
        },
        {
          id: 's5', name: 'Trogir (regresso)', time: '14:00', durationMin: 120,
          lat: 43.5175453, lng: 16.2504585,
          notes: 'Paragem opcional no caminho de volta — cidade UNESCO pequena e bonita para almoçar.',
        },
      ],
    },
    {
      id: 'd4',
      date: '2026-08-08',
      weekday: 'Sábado',
      title: 'Split → Mostar',
      base: 'mostar',
      narrative: 'Manhã em Split, depois ~2h30 de carro + fronteira para Mostar. Levar passaporte e autorização da rentadora para sair da Croácia. Em Agosto a fronteira pode ter filas.',
      hotel: { ...HOTELS.mostar },
      stops: [
        {
          id: 's6', name: 'Miradouro de Marjan', time: '09:00', durationMin: 120,
          lat: 43.5086437, lng: 16.4188964,
          notes: 'Vista panorâmica sobre Split antes de partir.',
        },
        {
          id: 's7', name: 'Stari Most (Ponte Velha)', time: '17:00', durationMin: 150,
          lat: 43.3372866, lng: 17.815006,
          notes: 'Ver ao pôr-do-sol/noite, quando os excursionistas de dia já partiram.',
        },
      ],
    },
    {
      id: 'd5',
      date: '2026-08-09',
      weekday: 'Domingo',
      title: 'Mostar + Blagaj',
      base: 'mostar',
      narrative: 'Cidade velha cedo de manhã, depois nascente de Blagaj a ~15 min.',
      hotel: { ...HOTELS.mostar },
      stops: [
        {
          id: 's8', name: 'Bazar / Stari Most de manhã', time: '08:30', durationMin: 180,
          lat: 43.3372866, lng: 17.815006,
          notes: 'Kujundžiluk (bazar otomano) vazio antes das 10h. Saltos dos mergulhadores ao meio-dia.',
        },
        {
          id: 's9', name: 'Blagaj Tekke (Vrelo Bune)', time: '13:00', durationMin: 150,
          lat: 43.2568475, lng: 17.9033714,
          notes: 'Mosteiro sufi do séc. XVI na nascente do rio Buna. Almoço junto à água.',
        },
      ],
    },
    {
      id: 'd6',
      date: '2026-08-10',
      weekday: 'Segunda',
      title: 'Počitelj + Kravica',
      base: 'mostar',
      narrative: 'Dia a sul de Mostar: vila medieval e cascatas para nadar.',
      hotel: { ...HOTELS.mostar },
      stops: [
        {
          id: 's10', name: 'Fortaleza de Počitelj', time: '09:30', durationMin: 90,
          lat: 43.134643, lng: 17.7337592,
          notes: 'Vila otomana sobre o Neretva. Subir à torre pela vista. Pouca gente de manhã.',
        },
        {
          id: 's11', name: 'Cascatas de Kravica', time: '11:30', durationMin: 240,
          lat: 43.15602, lng: 17.6081011,
          notes: 'Permitido nadar no verão. Entrada ~20 BAM/€10. Chegar antes do meio-dia evita grupos.',
        },
      ],
    },
    {
      id: 'd7',
      date: '2026-08-11',
      weekday: 'Terça',
      title: 'Mostar → Aeroporto de Split',
      base: 'travel',
      narrative: 'Sair de Mostar até às 08:30 para ter margem na fronteira. Voo às 13:00.',
      hotel: null,
      stops: [
        {
          id: 's12', name: 'Aeroporto de Split (SPU)', time: '11:30', durationMin: 90,
          lat: 43.5367044, lng: 16.2990251,
          notes: 'Chegar ~90 min antes do voo das 13:00.',
        },
      ],
    },
  ],
}
