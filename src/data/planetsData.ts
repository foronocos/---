import { PlanetData } from '../types';

export const planetsData: PlanetData[] = [
  {
    id: 'sun',
    name: 'Sun',
    russianName: 'Солнце',
    category: 'star',
    diameterKm: 1392700,
    massKg: '1.989 × 10^30',
    massEarthRelative: 333000,
    distanceFromSunMillionKm: 0,
    distanceFromSunAU: 0,
    orbitalPeriodDays: 0,
    orbitalSpeedKmS: 0,
    rotationalPeriodHours: 609.6, // ~25.4 дня на экваторе
    axialTiltDeg: 7.25,
    surfaceTempC: { min: 5500, avg: 5500, max: 15000000 },
    gravityMs2: 274.0,
    gravityEarthRelative: 27.9,
    moonsCount: 0,
    notableMoons: [],
    atmosphere: [
      { gas: 'Водород (H₂)', percentage: 73.4 },
      { gas: 'Гелий (He)', percentage: 24.8 },
      { gas: 'Кислород и др. элементы', percentage: 1.8 },
    ],
    color: '#FBBF24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    summary: 'Желтый карлик спектрального класса G2V, содержащий 99.86% всей массы Солнечной системы.',
    features: [
      'Каждую секунду перерабатывает 600 млн тонн водорода в гелий',
      'Температура в ядре достигает 15 миллионов градусов Цельсия',
      'Свет от Солнца до Земли долетает за 8 минут и 20 секунд',
      'Один оборот вокруг центра Млечного Пути занимает 230 млн лет'
    ],
    famousMissions: [
      { name: 'Parker Solar Probe', agency: 'NASA', year: '2018', achievement: 'Первый аппарат, коснувшийся солнечной короны' },
      { name: 'Solar Orbiter', agency: 'ESA/NASA', year: '2020', achievement: 'Снимки полюсов Солнца в высоком разрешении' },
      { name: 'SOHO', agency: 'ESA/NASA', year: '1995', achievement: 'Непрерывный мониторинг солнечной активности и корональных выбросов' }
    ]
  },
  {
    id: 'mercury',
    name: 'Mercury',
    russianName: 'Меркурий',
    category: 'terrestrial',
    diameterKm: 4879,
    massKg: '3.301 × 10^23',
    massEarthRelative: 0.055,
    distanceFromSunMillionKm: 57.9,
    distanceFromSunAU: 0.387,
    orbitalPeriodDays: 87.97,
    orbitalSpeedKmS: 47.36,
    rotationalPeriodHours: 1407.6, // 58.6 земных суток
    axialTiltDeg: 0.034,
    surfaceTempC: { min: -180, avg: 167, max: 430 },
    gravityMs2: 3.7,
    gravityEarthRelative: 0.38,
    moonsCount: 0,
    notableMoons: [],
    atmosphere: [
      { gas: 'Кислород (O₂)', percentage: 42.0 },
      { gas: 'Натрий (Na)', percentage: 29.0 },
      { gas: 'Водород (H₂)', percentage: 22.0 },
      { gas: 'Гелий и калий', percentage: 7.0 }
    ],
    color: '#9CA3AF',
    glowColor: 'rgba(156, 163, 175, 0.25)',
    summary: 'Самая маленькая планета Солнечной системы и ближайшая к Солнцу, с экстремальными температурными перепадами.',
    features: [
      'Год длится всего 88 земных суток, а один солнечный день — 176 земных суток',
      'Огромное железное ядро занимает около 85% радиуса планеты',
      'На дне полярных кратеров обнаружен водяной лед, куда никогда не попадает солнечный свет',
      'Практически лишен атмосферы — окружен лишь тончайшей экзосферой'
    ],
    famousMissions: [
      { name: 'MESSENGER', agency: 'NASA', year: '2004', achievement: 'Составил 100% карту поверхности и обнаружил лед на полюсах' },
      { name: 'BepiColombo', agency: 'ESA/JAXA', year: '2018', achievement: 'Изучение структуры ядра и экзосферы на орбите Меркурия' }
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    russianName: 'Венера',
    category: 'terrestrial',
    diameterKm: 12104,
    massKg: '4.867 × 10^24',
    massEarthRelative: 0.815,
    distanceFromSunMillionKm: 108.2,
    distanceFromSunAU: 0.723,
    orbitalPeriodDays: 224.7,
    orbitalSpeedKmS: 35.02,
    rotationalPeriodHours: -5832.5, // ретроградное вращение (243 дня)
    axialTiltDeg: 177.3,
    surfaceTempC: { min: 462, avg: 464, max: 475 },
    gravityMs2: 8.87,
    gravityEarthRelative: 0.904,
    moonsCount: 0,
    notableMoons: [],
    atmosphere: [
      { gas: 'Углекислый газ (CO₂)', percentage: 96.5 },
      { gas: 'Азот (N₂)', percentage: 3.5 },
      { gas: 'Диоксид серы (SO₂)', percentage: 0.015 }
    ],
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    summary: 'Самая горячая планета из-за мощного парникового эффекта. Вращается вокруг оси в обратную сторону.',
    features: [
      'Давление на поверхности в 92 раза выше земного — как на глубине 900 метров под водой',
      'Облака состоят из концентрированной серной кислоты',
      'День на Венере длиннее, чем ее год вокруг Солнца',
      'Второй по яркости естественный объект на ночном небе Земли после Луны'
    ],
    famousMissions: [
      { name: 'Венера-13', agency: 'СССР', year: '1981', achievement: 'Первые цветные панорамы раскаленной поверхности Венеры' },
      { name: 'Magellan', agency: 'NASA', year: '1989', achievement: 'Радарное картирование 98% поверхности сквозь облака' }
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    russianName: 'Земля',
    category: 'terrestrial',
    diameterKm: 12742,
    massKg: '5.972 × 10^24',
    massEarthRelative: 1.0,
    distanceFromSunMillionKm: 149.6,
    distanceFromSunAU: 1.0,
    orbitalPeriodDays: 365.256,
    orbitalSpeedKmS: 29.78,
    rotationalPeriodHours: 23.934,
    axialTiltDeg: 23.44,
    surfaceTempC: { min: -89.2, avg: 15, max: 56.7 },
    gravityMs2: 9.807,
    gravityEarthRelative: 1.0,
    moonsCount: 1,
    notableMoons: ['Луна'],
    atmosphere: [
      { gas: 'Азот (N₂)', percentage: 78.08 },
      { gas: 'Кислород (O₂)', percentage: 20.95 },
      { gas: 'Аргон (Ar)', percentage: 0.93 },
      { gas: 'CO₂ и водяной пар', percentage: 0.04 }
    ],
    color: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    summary: 'Единственное известное тело во Вселенной, населенное живыми организмами, с океанами жидкой воды.',
    features: [
      '71% поверхности покрыто Мировым океаном',
      'Мощная магнитосфера защищает биосферу от губительной космической радиации',
      'Тектоника плит постоянно обновляет кору и регулирует уровень углекислого газа',
      'Луна стабилизирует наклон земной оси, обеспечивая предсказуемую смену времен года'
    ],
    famousMissions: [
      { name: 'Аполлон-11', agency: 'NASA', year: '1969', achievement: 'Первая высадка людей на поверхность Луны' },
      { name: 'МКС', agency: 'Международный', year: '1998', achievement: 'Непрерывное присутствие человека на околоземной орбите' }
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    russianName: 'Марс',
    category: 'terrestrial',
    diameterKm: 6779,
    massKg: '6.417 × 10^23',
    massEarthRelative: 0.107,
    distanceFromSunMillionKm: 227.9,
    distanceFromSunAU: 1.524,
    orbitalPeriodDays: 686.98,
    orbitalSpeedKmS: 24.07,
    rotationalPeriodHours: 24.62,
    axialTiltDeg: 25.19,
    surfaceTempC: { min: -140, avg: -63, max: 20 },
    gravityMs2: 3.72,
    gravityEarthRelative: 0.379,
    moonsCount: 2,
    notableMoons: ['Фобос', 'Деймос'],
    atmosphere: [
      { gas: 'Углекислый газ (CO₂)', percentage: 95.32 },
      { gas: 'Азот (N₂)', percentage: 2.6 },
      { gas: 'Аргон (Ar)', percentage: 1.9 },
      { gas: 'Кислород и водяной пар', percentage: 0.18 }
    ],
    color: '#FB7185',
    glowColor: 'rgba(251, 113, 133, 0.3)',
    summary: '«Красная планета», покрытая оксидом железа (ржавчиной), с гигантскими потухшими вулканами и каньонами.',
    features: [
      'Гора Олимп — высочайший вулкан Солнечной системы высотой 21.9 км (почти в 3 раза выше Эвереста)',
      'Долины Маринер — каньон длиной более 4000 км и глубиной до 7 км',
      'В прошлом на Марсе текли реки, существовали озера и, возможно, океан',
      'Сутки (сол) длятся 24 часа 39 минут — очень близко к Земле'
    ],
    famousMissions: [
      { name: 'Perseverance & Ingenuity', agency: 'NASA', year: '2020', achievement: 'Поиск биосигнатур и первый управляемый полет вертолета на другой планете' },
      { name: 'Curiosity', agency: 'NASA', year: '2011', achievement: 'Доказательство того, что Марс когда-то был пригоден для микробной жизни' }
    ]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    russianName: 'Юпитер',
    category: 'gas_giant',
    diameterKm: 139820,
    massKg: '1.898 × 10^27',
    massEarthRelative: 317.8,
    distanceFromSunMillionKm: 778.6,
    distanceFromSunAU: 5.204,
    orbitalPeriodDays: 4332.59, // 11.86 земных лет
    orbitalSpeedKmS: 13.07,
    rotationalPeriodHours: 9.93,
    axialTiltDeg: 3.13,
    surfaceTempC: { min: -145, avg: -110, max: -70 },
    gravityMs2: 24.79,
    gravityEarthRelative: 2.53,
    moonsCount: 95,
    notableMoons: ['Ганимед', 'Каллисто', 'Ио', 'Европа'],
    atmosphere: [
      { gas: 'Водород (H₂)', percentage: 89.8 },
      { gas: 'Гелий (He)', percentage: 10.2 },
      { gas: 'Метан, аммиак', percentage: 0.1 }
    ],
    color: '#E0A96D',
    glowColor: 'rgba(224, 169, 109, 0.3)',
    ringSystem: {
      innerRadius: 1.4,
      outerRadius: 1.8,
      color: 'rgba(224, 169, 109, 0.15)'
    },
    summary: 'Крупнейшая планета системы. Обладает самым сильным магнитным полем и легендарным вихрем — Большим Красным Пятном.',
    features: [
      'Масса Юпитера в 2.5 раза больше массы всех остальных планет Солнечной системы вместе взятых',
      'Большое Красное Пятно бушует уже как минимум 350 лет и превышает по размеру Землю',
      'Спутник Ганимед больше Меркурия и имеет собственное магнитное поле',
      'Под ледяной корой Европы скрывается глобальный океан с запасом воды большим, чем на Земле'
    ],
    famousMissions: [
      { name: 'Juno', agency: 'NASA', year: '2011', achievement: 'Изучение гравитационного поля, полярных циклонов и внутреннего ядра' },
      { name: 'Galileo', agency: 'NASA', year: '1989', achievement: 'Первый зонд на орбите Юпитера, сбросивший датчик в атмосферу' }
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    russianName: 'Сатурн',
    category: 'gas_giant',
    diameterKm: 116460,
    massKg: '5.683 × 10^26',
    massEarthRelative: 95.2,
    distanceFromSunMillionKm: 1433.5,
    distanceFromSunAU: 9.582,
    orbitalPeriodDays: 10759.22, // 29.45 лет
    orbitalSpeedKmS: 9.69,
    rotationalPeriodHours: 10.7,
    axialTiltDeg: 26.73,
    surfaceTempC: { min: -178, avg: -140, max: -130 },
    gravityMs2: 10.44,
    gravityEarthRelative: 1.06,
    moonsCount: 146,
    notableMoons: ['Титан', 'Энцелад', 'Мимас', 'Япет'],
    atmosphere: [
      { gas: 'Водород (H₂)', percentage: 96.3 },
      { gas: 'Гелий (He)', percentage: 3.25 },
      { gas: 'Метан, дейтерий', percentage: 0.45 }
    ],
    color: '#FDE68A',
    glowColor: 'rgba(253, 230, 138, 0.3)',
    ringSystem: {
      innerRadius: 1.3,
      outerRadius: 2.3,
      color: 'rgba(253, 230, 138, 0.45)'
    },
    summary: 'Властелин колец с самой низкой плотностью — Сатурн мог бы плавать в воде, если бы нашелся гигантский бассейн.',
    features: [
      'Система колец простирается на 282 000 км, но их толщина местами составляет всего 10–30 метров',
      'Кольца состоят на 99% из водяного льда размером от песчинок до айсбергов',
      'Спутник Титан обладает плотной азотной атмосферой и озерами из жидкого метана и этана',
      'Гейзеры Энцелада выбрасывают струи океанической воды с органическими молекулами в космос'
    ],
    famousMissions: [
      { name: 'Cassini-Huygens', agency: 'NASA/ESA/ASI', year: '1997', achievement: '13 лет на орбите и посадка зонда «Гюйгенс» на Титан' },
      { name: 'Voyager 1 & 2', agency: 'NASA', year: '1977', achievement: 'Первые детальные снимки ледяных колец и структуры спутников' }
    ]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    russianName: 'Уран',
    category: 'ice_giant',
    diameterKm: 50724,
    massKg: '8.681 × 10^25',
    massEarthRelative: 14.54,
    distanceFromSunMillionKm: 2872.5,
    distanceFromSunAU: 19.2,
    orbitalPeriodDays: 30685.4, // 84 года
    orbitalSpeedKmS: 6.81,
    rotationalPeriodHours: -17.24, // обратное вращение
    axialTiltDeg: 97.77, // «лежит на боку»
    surfaceTempC: { min: -224, avg: -195, max: -197 },
    gravityMs2: 8.69,
    gravityEarthRelative: 0.886,
    moonsCount: 28,
    notableMoons: ['Титания', 'Оберон', 'Умбриэль', 'Миранда'],
    atmosphere: [
      { gas: 'Водород (H₂)', percentage: 82.5 },
      { gas: 'Гелий (He)', percentage: 15.2 },
      { gas: 'Метан (CH₄)', percentage: 2.3 }
    ],
    color: '#67E8F9',
    glowColor: 'rgba(103, 232, 249, 0.3)',
    ringSystem: {
      innerRadius: 1.5,
      outerRadius: 1.9,
      color: 'rgba(103, 232, 249, 0.2)'
    },
    summary: 'Ледяной гигант с уникальным наклоном оси вращения 98 градусов — планета буквально «катится» по орбите.',
    features: [
      'Полюс Урана обращен к Солнцу на протяжении 42 земных лет подряд',
      'Имеет самую холодную атмосферу среди всех планет системы (-224 °C)',
      'Бирюзовый цвет обусловлен поглощением красного спектра метаном в верхних слоях атмосферы',
      'Имеет 13 темных узких колец, открытых в 1977 году'
    ],
    famousMissions: [
      { name: 'Voyager 2', agency: 'NASA', year: '1986', achievement: 'Единственный космический корабль в истории, сблизившийся с Ураном' }
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    russianName: 'Нептун',
    category: 'ice_giant',
    diameterKm: 49244,
    massKg: '1.024 × 10^26',
    massEarthRelative: 17.15,
    distanceFromSunMillionKm: 4495.1,
    distanceFromSunAU: 30.07,
    orbitalPeriodDays: 60189.0, // 164.8 земных лет
    orbitalSpeedKmS: 5.43,
    rotationalPeriodHours: 16.11,
    axialTiltDeg: 28.32,
    surfaceTempC: { min: -218, avg: -201, max: -200 },
    gravityMs2: 11.15,
    gravityEarthRelative: 1.14,
    moonsCount: 16,
    notableMoons: ['Тритон', 'Протей', 'Нереида'],
    atmosphere: [
      { gas: 'Водород (H₂)', percentage: 80.0 },
      { gas: 'Гелий (He)', percentage: 19.0 },
      { gas: 'Метан (CH₄)', percentage: 1.5 }
    ],
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    ringSystem: {
      innerRadius: 1.4,
      outerRadius: 1.7,
      color: 'rgba(59, 130, 246, 0.2)'
    },
    summary: 'Самая ветреная планета, где скорость ураганов достигает сверхзвуковых 2100 км/ч. Первая планета, открытая «на кончике пера».',
    features: [
      'Открыт математическим расчетом Леверье на основе аномалий в орбите Урана в 1846 году',
      'Спутник Тритон вращается в противоположную сторону (ретроградно) и имеет криовулканы с жидким азотом',
      'Глубокий лазурно-синий цвет создается кристаллами метанового льда в атмосфере',
      'Завершил свой первый полный оборот вокруг Солнца с момента открытия только в 2011 году'
    ],
    famousMissions: [
      { name: 'Voyager 2', agency: 'NASA', year: '1989', achievement: 'Сближение с Нептуном, открытие Большого Темного Пятна и гейзеров Тритона' }
    ]
  },
  {
    id: 'pluto',
    name: 'Pluto',
    russianName: 'Плутон',
    category: 'dwarf',
    diameterKm: 2376,
    massKg: '1.303 × 10^22',
    massEarthRelative: 0.0022,
    distanceFromSunMillionKm: 5906.4,
    distanceFromSunAU: 39.48,
    orbitalPeriodDays: 90560.0, // 248 земных лет
    orbitalSpeedKmS: 4.74,
    rotationalPeriodHours: -153.3,
    axialTiltDeg: 122.53,
    surfaceTempC: { min: -240, avg: -229, max: -218 },
    gravityMs2: 0.62,
    gravityEarthRelative: 0.063,
    moonsCount: 5,
    notableMoons: ['Харон', 'Никта', 'Гидра', 'Кербер', 'Стикс'],
    atmosphere: [
      { gas: 'Азот (N₂)', percentage: 99.0 },
      { gas: 'Метан (CH₄)', percentage: 0.5 },
      { gas: 'Оксид углерода (CO)', percentage: 0.5 }
    ],
    color: '#C4B5FD',
    glowColor: 'rgba(196, 181, 253, 0.25)',
    summary: 'Крупнейшая карликовая планета пояса Койпера со знаменитой азотной ледяной равниной в форме сердца (Равнина Спутника).',
    features: [
      'Харон настолько велик относительно Плутона (половина его диаметра), что они образуют двойную систему',
      'Орбита Плутона наклонена на 17 градусов к плоскости эклиптики',
      'На поверхности возвышаются горы из водяного льда высотой до 3500 метров',
      'В 2006 году решением МАС был переклассифицирован в карликовую планету'
    ],
    famousMissions: [
      { name: 'New Horizons', agency: 'NASA', year: '2006', achievement: 'Исторический пролет 14 июля 2015 года, первые четкие фото «сердца» Плутона' }
    ]
  }
];
