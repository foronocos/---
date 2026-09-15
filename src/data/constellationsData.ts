import { Constellation } from '../types';

export const constellationsData: Constellation[] = [
  {
    id: 'orion',
    name: 'Орион',
    latinName: 'Orion (The Hunter)',
    season: 'Зима',
    centerX: 250,
    centerY: 300,
    lore: 'В древнегреческой мифологии — великий охотник-великан, сын Посейдона. Его пояс образован тремя яркими звездами: Минтака, Альнилам и Альнитак. У ног охотника лежит сияющая Туманность Ориона.',
    stars: [
      { id: 'betelgeuse', name: 'Бетельгейзе', russianName: 'Бетельгейзе (α Ориона)', bayer: 'α Ori', magnitude: 0.5, spectralType: 'M1-2 Ia-ab', color: '#EF4444', x: 200, y: 220, distanceLy: 548, description: 'Красный сверхгигант на грани взрыва сверхновой. Радиус превышает 700 радиусов Солнца.' },
      { id: 'bellatrix', name: 'Беллатрикс', russianName: 'Беллатрикс (γ Ориона)', bayer: 'γ Ori', magnitude: 1.64, spectralType: 'B2 III', color: '#93C5FD', x: 300, y: 230, distanceLy: 250, description: 'Голубой гигант, известная как «Звезда Амазонок». Яркость в 9200 раз превышает солнечную.' },
      { id: 'alnitak', name: 'Альнитак', russianName: 'Альнитак (ζ Ориона)', bayer: 'ζ Ori', magnitude: 1.77, spectralType: 'O9.5 Ibe', color: '#60A5FA', x: 230, y: 290, distanceLy: 1260, description: 'Левая звезда Пояса Ориона, рядом с которой находится знаменитая туманность Конская Голова.' },
      { id: 'alnilam', name: 'Альнилам', russianName: 'Альнилам (ε Ориона)', bayer: 'ε Ori', magnitude: 1.69, spectralType: 'B0 Ia', color: '#93C5FD', x: 250, y: 295, distanceLy: 2000, description: 'Центральная звезда Пояса Ориона, колоссальный голубой сверхгигант.' },
      { id: 'mintaka', name: 'Минтака', russianName: 'Минтака (δ Ориона)', bayer: 'δ Ori', magnitude: 2.23, spectralType: 'O9.5 II', color: '#93C5FD', x: 270, y: 300, distanceLy: 1200, description: 'Правая звезда Пояса Ориона, расположена почти точно на небесном экваторе.' },
      { id: 'saiph', name: 'Саиф', russianName: 'Саиф (κ Ориона)', bayer: 'κ Ori', magnitude: 2.07, spectralType: 'B0.5 Ia', color: '#60A5FA', x: 220, y: 370, distanceLy: 650, description: 'Голубой сверхгигант в юго-восточной части фигуры созвездия.' },
      { id: 'rigel', name: 'Ригель', russianName: 'Ригель (β Ориона)', bayer: 'β Ori', magnitude: 0.13, spectralType: 'B8 Ia', color: '#38BDF8', x: 290, y: 365, distanceLy: 860, description: 'Самая яркая звезда созвездия, сияющая в 120 000 раз сильнее нашего Солнца.' }
    ],
    lines: [
      [0, 1], // Betelgeuse - Bellatrix
      [0, 2], // Betelgeuse - Alnitak
      [1, 4], // Bellatrix - Mintaka
      [2, 3], // Alnitak - Alnilam
      [3, 4], // Alnilam - Mintaka (Пояс)
      [2, 5], // Alnitak - Saiph
      [4, 6], // Mintaka - Rigel
      [5, 6]  // Saiph - Rigel
    ],
    deepSkyObjects: [
      { name: 'M42 (Туманность Ориона)', type: 'Диффузная эмиссионная туманность', magnitude: 4.0, description: 'Ближайшая к Земле область активного звездообразования, видна невооруженным глазом.' },
      { name: 'B33 (Конская Голова)', type: 'Темная поглощающая туманность', magnitude: 8.0, description: 'Силуэт конской головы на фоне светящегося водородного газа IC 434.' }
    ]
  },
  {
    id: 'ursa_major',
    name: 'Большая Медведица',
    latinName: 'Ursa Major',
    season: 'Всесезонное',
    centerX: 600,
    centerY: 180,
    lore: 'Нимфа Каллисто, обращенная ревнивой Герой в медведицу. Знаменитый «Большой Ковш» (астеризм из 7 звезд) служит главным ориентиром северного неба для поиска Полярной звезды.',
    stars: [
      { id: 'dubhe', name: 'Дубхе', russianName: 'Дубхе (α Медведицы)', bayer: 'α UMa', magnitude: 1.79, spectralType: 'K0 III', color: '#FBBF24', x: 670, y: 150, distanceLy: 123, description: 'Оранжевый гигант, верхняя звезда стенки Ковша. Указывает на Полярную звезду.' },
      { id: 'merak', name: 'Мерак', russianName: 'Мерак (β Медведицы)', bayer: 'β UMa', magnitude: 2.37, spectralType: 'A1 V', color: '#F8FAFC', x: 670, y: 200, distanceLy: 79.7, description: 'Белая звезда главной последовательности, нижняя точка указателя на север.' },
      { id: 'phecda', name: 'Фекда', russianName: 'Фекда (γ Медведицы)', bayer: 'γ UMa', magnitude: 2.44, spectralType: 'A0 Ve', color: '#F8FAFC', x: 610, y: 205, distanceLy: 83.2, description: 'Нижняя левая звезда чаши Ковша.' },
      { id: 'megrez', name: 'Мегрец', russianName: 'Мегрец (δ Медведицы)', bayer: 'δ UMa', magnitude: 3.31, spectralType: 'A3 V', color: '#F8FAFC', x: 615, y: 160, distanceLy: 80.5, description: 'Самая тусклая из семи звезд Ковша, соединяющая чашу и ручку.' },
      { id: 'alioth', name: 'Алиот', russianName: 'Алиот (ε Медведицы)', bayer: 'ε UMa', magnitude: 1.77, spectralType: 'A1 III-IVp', color: '#F8FAFC', x: 560, y: 155, distanceLy: 82.6, description: 'Самая яркая звезда во всем созвездии Большой Медведицы.' },
      { id: 'mizar', name: 'Мицар', russianName: 'Мицар (ζ Медведицы)', bayer: 'ζ UMa', magnitude: 2.23, spectralType: 'A2 V', color: '#F8FAFC', x: 520, y: 175, distanceLy: 82.9, description: 'Знаменитая оптическая и гравитационная кратная звезда, рядом с которой виден тусклый Алькор.' },
      { id: 'alkaid', name: 'Бенетнаш (Алькаид)', russianName: 'Алькаид (η Медведицы)', bayer: 'η UMa', magnitude: 1.86, spectralType: 'B3 V', color: '#93C5FD', x: 470, y: 200, distanceLy: 103.9, description: 'Голубая звезда на конце «ручки» ковша.' }
    ],
    lines: [
      [0, 1], // Dubhe - Merak
      [1, 2], // Merak - Phecda
      [2, 3], // Phecda - Megrez
      [3, 0], // Megrez - Dubhe (Ковш)
      [3, 4], // Megrez - Alioth
      [4, 5], // Alioth - Mizar
      [5, 6]  // Mizar - Alkaid (Ручка)
    ],
    deepSkyObjects: [
      { name: 'M81 (Галактика Боде)', type: 'Спиральная галактика', magnitude: 6.9, description: 'Величественная спиральная галактика с идеально очерченными рукавами.' },
      { name: 'M82 (Галактика Сигара)', type: 'Галактика со вспышкой звездообразования', magnitude: 8.4, description: 'Галактика с бурным рождением звезд и мощными выбросами горячего водорода.' }
    ]
  },
  {
    id: 'cassiopeia',
    name: 'Кассиопея',
    latinName: 'Cassiopeia',
    season: 'Осень',
    centerX: 720,
    centerY: 340,
    lore: 'Тщеславная царица Эфиопии, наказанная богами за хвастовство своей красотой. Созвездие образует легко узнаваемую латинскую букву «W» или «М» в зависимости от времени года.',
    stars: [
      { id: 'schedar', name: 'Шедар', russianName: 'Шедар (α Кассиопеи)', bayer: 'α Cas', magnitude: 2.24, spectralType: 'K0 IIIa', color: '#FBBF24', x: 710, y: 350, distanceLy: 228, description: 'Оранжевый гигант, главная звезда короны царицы.' },
      { id: 'caph', name: 'Каф', russianName: 'Каф (β Кассиопеи)', bayer: 'β Cas', magnitude: 2.28, spectralType: 'F2 III', color: '#FEF08A', x: 670, y: 330, distanceLy: 54.7, description: 'Желто-белый субгигант переменного типа Дельта Щита.' },
      { id: 'gamma_cas', name: 'Нави (γ Кассиопеи)', russianName: 'Гамма Кассиопеи', bayer: 'γ Cas', magnitude: 2.15, spectralType: 'B0.5 IVe', color: '#93C5FD', x: 740, y: 320, distanceLy: 550, description: 'Центральная вспыхивающая звезда «W», вращающаяся с колоссальной скоростью 400 км/с.' },
      { id: 'ruchbah', name: 'Рукбах', russianName: 'Рукбах (δ Кассиопеи)', bayer: 'δ Cas', magnitude: 2.68, spectralType: 'A5 V', color: '#F8FAFC', x: 770, y: 345, distanceLy: 99.4, description: 'Затменная двойная система, колено Кассиопеи.' },
      { id: 'segin', name: 'Сегин', russianName: 'Сегин (ε Кассиопеи)', bayer: 'ε Cas', magnitude: 3.35, spectralType: 'B3 V', color: '#93C5FD', x: 800, y: 325, distanceLy: 460, description: 'Бело-голубой гигант, замыкающий восточный край буквы W.' }
    ],
    lines: [
      [1, 0], // Caph - Schedar
      [0, 2], // Schedar - Gamma
      [2, 3], // Gamma - Ruchbah
      [3, 4]  // Ruchbah - Segin
    ],
    deepSkyObjects: [
      { name: 'Кассиопея A', type: 'Остаток сверхновой', magnitude: 6.0, description: 'Сильнейший радиоисточник на небе за пределами Солнечной системы, свет сверхновой дошел в 1680 г.' }
    ]
  },
  {
    id: 'cygnus',
    name: 'Лебедь',
    latinName: 'Cygnus (The Swan)',
    season: 'Лето',
    centerX: 450,
    centerY: 420,
    lore: 'Олицетворение Зевса, принявшего образ лебедя. Астеризм образует четкий «Северный Крест», летящий вдоль серебристой полосы Млечного Пути.',
    stars: [
      { id: 'deneb', name: 'Денеб', russianName: 'Денеб (α Лебедя)', bayer: 'α Cyg', magnitude: 1.25, spectralType: 'A2 Ia', color: '#F8FAFC', x: 450, y: 360, distanceLy: 2615, description: 'Один из мощнейших белых сверхгигантов, вершина Летне-Осеннего Треугольника. Светит как 200 000 Солнц.' },
      { id: 'sadr', name: 'Садр', russianName: 'Садр (γ Лебедя)', bayer: 'γ Cyg', magnitude: 2.23, spectralType: 'F8 Ib', color: '#FEF08A', x: 450, y: 410, distanceLy: 1800, description: 'Сердце Лебедя, окруженное диффузной светящейся водородной туманностью IC 1318.' },
      { id: 'albireo', name: 'Альбирео', russianName: 'Альбирео (β Лебедя)', bayer: 'β Cyg', magnitude: 3.05, spectralType: 'K3 II + B9.5 V', color: '#FBBF24', x: 450, y: 490, distanceLy: 430, description: 'Красивейшая двойная звезда: контраст золотисто-янтарного гиганта и сапфирово-голубого спутника.' },
      { id: 'gienah', name: 'Дженах', russianName: 'Дженах (ε Лебедя)', bayer: 'ε Cyg', magnitude: 2.48, spectralType: 'K0 III', color: '#FBBF24', x: 490, y: 425, distanceLy: 73, description: 'Восточное крыло летящего лебедя.' },
      { id: 'delta_cyg', name: 'Фаварис (δ Лебедя)', russianName: 'Дельта Лебедя', bayer: 'δ Cyg', magnitude: 2.87, spectralType: 'B9.5 IV', color: '#93C5FD', x: 410, y: 405, distanceLy: 165, description: 'Западное крыло лебедя.' }
    ],
    lines: [
      [0, 1], // Deneb - Sadr
      [1, 2], // Sadr - Albireo
      [4, 1], // Delta - Sadr
      [1, 3]  // Sadr - Gienah
    ],
    deepSkyObjects: [
      { name: 'Туманность Северная Америка (NGC 7000)', type: 'Эмиссионная туманность', magnitude: 4.0, description: 'Гигантское газовое облако, очертаниями повторяющее континент Северной Америки.' },
      { name: 'Лебедь X-1', type: 'Рентгеновская двойная система', magnitude: 8.9, description: 'Первый общепризнанный кандидат в черные дыры звездной массы.' }
    ]
  },
  {
    id: 'taurus',
    name: 'Телец',
    latinName: 'Taurus',
    season: 'Зима',
    centerX: 180,
    centerY: 440,
    lore: 'Белоснежный бык, переплывший море с финикийской царевной Европой на спине. В созвездии сияет «глаз быка» — гигант Альдебаран, а также легендарные звездные скопления Плеяды и Гиады.',
    stars: [
      { id: 'aldebaran', name: 'Альдебаран', russianName: 'Альдебаран (α Тельца)', bayer: 'α Tau', magnitude: 0.85, spectralType: 'K5 III', color: '#F97316', x: 190, y: 450, distanceLy: 65.3, description: 'Красный гигант, сияющий яростным оранжевым пламенем в скоплении Гиады.' },
      { id: 'elnath', name: 'Эль-Нат', russianName: 'Эль-Нат (β Тельца)', bayer: 'β Tau', magnitude: 1.65, spectralType: 'B7 III', color: '#93C5FD', x: 230, y: 390, distanceLy: 134, description: 'Северный рог быка, расположенный на границе с созвездием Возничего.' },
      { id: 'tianguan', name: 'Тяньгуань (ζ Тельца)', russianName: 'Зета Тельца', bayer: 'ζ Tau', magnitude: 3.0, spectralType: 'B2 IIIpe', color: '#93C5FD', x: 235, y: 440, distanceLy: 440, description: 'Южный рог быка, рядом с которым произошла вспышка сверхновой 1054 года (Крабовидная туманность).' },
      { id: 'ain', name: 'Аин (ε Тельца)', russianName: 'Аин (Северный глаз)', bayer: 'ε Tau', magnitude: 3.53, spectralType: 'K0 III', color: '#FBBF24', x: 165, y: 430, distanceLy: 147, description: 'Звезда в скоплении Гиады, вокруг которой обнаружена экзопланета.' }
    ],
    lines: [
      [0, 1], // Aldebaran - Elnath
      [0, 2], // Aldebaran - Tianguan
      [0, 3]  // Aldebaran - Ain
    ],
    deepSkyObjects: [
      { name: 'M45 (Плеяды / Семь Сестер)', type: 'Рассеянное звездное скопление', magnitude: 1.6, description: 'Одно из самых ярких и красивых звездных скоплений, погруженное в сапфировую пылевую туманность.' },
      { name: 'M1 (Крабовидная туманность)', type: 'Остаток сверхновой', magnitude: 8.4, description: 'Остаток взрыва звезды, зарегистрированного китайскими и арабскими астрономами в 1054 году.' }
    ]
  }
];
