// Itinerário inicial. É só o ponto de partida: assim que editas algo na app,
// passa a ser guardado na base de dados. Para repor isto, usa "Repor original".

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
      title: 'Trogir + Krka',
      base: 'split',
      narrative: '* Compras supermecado;\n* Trogir;\n* Cascatas Krak',
      hotel: { ...HOTELS.split },
      stops: [
        {
          id: 's3', name: 'Trogir', time: '11:00', durationMin: null,
          lat: 43.5330035, lng: 16.2578229,
          notes: '.......\n + almoço volante',
        },
        {
          id: 'xz61fx9z', name: 'Cascatas Krak', time: '15:00', durationMin: 0,
          lat: 43.79535, lng: 15.96854,
          notes: '*Entrada a pé Lozovac - Buffet Krak',
        },
      ],
    },
    {
      id: 'd3',
      date: '2026-08-07',
      weekday: 'Sexta',
      title: 'Game of Thrones + Piscina Hotel + Marjan viewpoint',
      base: 'split',
      narrative: '',
      hotel: { ...HOTELS.split },
      stops: [
        {
          id: 's4', name: 'Game of Thrones Museum', time: '11:00', durationMin: 100,
          lat: 43.5043408, lng: 16.2624031,
          notes: '* Visita guiada às 11h ao museu de Game of Thrones\n* Visita guiada + história de Split',
        },
        {
          id: 's5', name: 'Piscina Hotel', time: '15:00', durationMin: null,
          lat: null, lng: null,
          notes: '',
        },
        {
          id: 'xjnejlxd', name: 'Marjan Viewpoint', time: '19:00', durationMin: 60,
          lat: 43.5111658, lng: 16.4385556,
          notes: '',
        },
      ],
    },
    {
      id: 'd4',
      date: '2026-08-08',
      weekday: 'Sábado',
      title: 'Split o dia todo → Mostar à noite',
      base: 'mostar',
      narrative: '',
      hotel: { ...HOTELS.mostar },
      stops: [
        {
          id: 's13', name: 'Praia de Kasjuni', time: '10:00', durationMin: 240,
          lat: 43.5023529, lng: 16.4467679,
          notes: '',
        },
        {
          id: 'xhv8n1xh', name: 'Viagem até Mostar', time: '17:00', durationMin: 150,
          lat: null, lng: null,
          notes: '',
        },
        {
          id: 's7', name: 'Stari Most (Ponte Velha)', time: '20:30', durationMin: 120,
          lat: 43.3372866, lng: 17.815006,
          notes: 'Chegada a Mostar à noite: ponte iluminada, bazar mais calmo e jantar junto ao Neretva. Check-in no Hotel Amicus.',
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
