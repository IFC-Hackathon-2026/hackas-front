export const PROJECT_CATEGORIES = [
  {
    value: 'educacionais_profissionais',
    label: 'Educacionais e Profissionais',
    color: '#DCEFE1',
    selectable: false,
    children: [
      {
        value: 'academicos',
        label: 'Acadêmicos',
        color: '#93B3D5',
        children: [
          { value: 'cientificos', label: 'Científicos' },
          { value: 'tecnologicos', label: 'Tecnológicos' },
          { value: 'educacionais', label: 'Educacionais' },
          { value: 'institucionais', label: 'Institucionais' },
          { value: 'corporativos', label: 'Corporativos' },
        ],
      },
      { value: 'workshops', label: 'Workshops', children: [] },
      { value: 'palestras', label: 'Palestras', children: [] },
    ],
  },
  {
    value: 'culturais_artisticos',
    label: 'Culturais e Artísticos',
    color: '#EBDCF5',
    children: [
      { value: 'culturais', label: 'Culturais', children: [] },
      { value: 'artisticos', label: 'Artísticos', children: [] },
      { value: 'gastronomicos', label: 'Gastronômicos', children: [] },
    ],
  },
  {
    value: 'esportivos_competitivos',
    label: 'Esportivos e Competitivos',
    color: '#F9E2CE',
    children: [
      { value: 'esportivos', label: 'Esportivos', children: [] },
      { value: 'competitivos', label: 'Competitivos', children: [] },
    ],
  },
  {
    value: 'sociais_recreativos',
    label: 'Sociais e Recreativos',
    color: '#F8DDE7',
    children: [
      { value: 'sociais', label: 'Sociais', children: [] },
      { value: 'recreativos', label: 'Recreativos', children: [] },
      { value: 'comunitarios', label: 'Comunitários', children: [] },
    ],
  },
  {
    value: 'politicos_religiosos',
    label: 'Políticos e Religiosos',
    color: '#F5EBCB',
    children: [
      { value: 'politicos', label: 'Políticos', children: [] },
      { value: 'diplomaticos', label: 'Diplomáticos', children: [] },
      { value: 'religiosos', label: 'Religiosos', children: [] },
    ],
  },
]

function flattenCategories(categorias) {
  return categorias.flatMap((categoria) => [
    categoria,
    ...flattenCategories(categoria.children ?? []),
  ])
}

export const PROJECT_CATEGORY_LABELS = Object.fromEntries(
  flattenCategories(PROJECT_CATEGORIES)
    .map((categoria) => [categoria.value, categoria.label]),
)
