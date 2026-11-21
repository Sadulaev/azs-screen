export const defaultConfig = {
  title: 'ЦЕНЫ НА ТОПЛИВО',
  brand: 'МУСТАНГ',
  layout: 'grid-2x3',
  backgroundUrl: '',
  logoUrl: '',
  fuels: [
    { id: 'f100', name: '100', price: '118', unit: 'руб', icon: 'pump' },
    { id: 'f95', name: '95', price: '98', unit: 'руб', icon: 'pump' },
    { id: 'f92', name: '92', price: '94', unit: 'руб', icon: 'pump' },
    { id: 'fgas', name: 'Газ', price: '44', unit: 'руб', icon: 'flame' },
    { id: 'fdt', name: 'ДТ', price: '62', unit: 'руб', icon: 'pump' },
    { id: 'fdte', name: 'ДТ Евро', price: '90', unit: 'руб', icon: 'pump' },
  ],
  updatedAt: null,
};

export const LAYOUTS = [
  {
    id: 'grid-2x3',
    name: 'Сетка 2×3',
    description: 'Две колонки, три ряда — как на первом макете',
  },
  {
    id: 'list-logo-left',
    name: 'Список + лого слева',
    description: 'Вертикальный список цен, логотип слева — второй макет',
  },
];
