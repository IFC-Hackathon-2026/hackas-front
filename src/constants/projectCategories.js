export const PROJECT_CATEGORIES = [
  {
    value: 'educacionais_profissionais', icon: 'mdi-school-outline',
    label: 'Educacionais e Profissionais',
    color: '#DCEFE1',
    textColor: '#267342',
    selectable: false,
    children: [
      {
        value: 'academicos', icon: 'mdi-school-outline',
        label: 'Acadêmicos',
        color: '#93B3D5',
        textColor: '#2767AA',
        children: [
          { value: 'cientificos', icon: 'mdi-flask-outline', label: 'Científicos' },
          { value: 'tecnologicos', icon: 'mdi-laptop', label: 'Tecnológicos' },
          { value: 'educacionais', icon: 'mdi-book-open-page-variant-outline', label: 'Educacionais' },
          { value: 'institucionais', icon: 'mdi-domain', label: 'Institucionais' },
          { value: 'corporativos', icon: 'mdi-briefcase-outline', label: 'Corporativos' },
        ],
      },
      { value: 'workshops', icon: 'mdi-tools', label: 'Workshops', children: [] },
      { value: 'palestras', icon: 'mdi-microphone-outline', label: 'Palestras', children: [] },
    ],
  },
  {
    value: 'culturais_artisticos', icon: 'mdi-palette-outline',
    label: 'Culturais e Artísticos',
    color: '#EBDCF5',
    textColor: '#793AA3',
    children: [
      { value: 'culturais', icon: 'mdi-theater', label: 'Culturais', children: [] },
      { value: 'artisticos', icon: 'mdi-palette-outline', label: 'Artísticos', children: [] },
      { value: 'gastronomicos', icon: 'mdi-silverware-fork-knife', label: 'Gastronômicos', children: [] },
    ],
  },
  {
    value: 'esportivos_competitivos', icon: 'mdi-trophy-outline',
    label: 'Esportivos e Competitivos',
    color: '#F9E2CE',
    textColor: '#A55315',
    children: [
      { value: 'esportivos', icon: 'mdi-soccer', label: 'Esportivos', children: [] },
      { value: 'competitivos', icon: 'mdi-trophy-outline', label: 'Competitivos', children: [] },
    ],
  },
  {
    value: 'sociais_recreativos', icon: 'mdi-account-group-outline',
    label: 'Sociais e Recreativos',
    color: '#F8DDE7',
    textColor: '#AD3465',
    children: [
      { value: 'sociais', icon: 'mdi-account-group-outline', label: 'Sociais', children: [] },
      { value: 'recreativos', icon: 'mdi-party-popper', label: 'Recreativos', children: [] },
      { value: 'comunitarios', icon: 'mdi-handshake-outline', label: 'Comunitários', children: [] },
    ],
  },
  {
    value: 'politicos_religiosos', icon: 'mdi-earth',
    label: 'Políticos e Religiosos',
    color: '#F5EBCB',
    textColor: '#876715',
    children: [
      { value: 'politicos', icon: 'mdi-gavel', label: 'Políticos', children: [] },
      { value: 'diplomaticos', icon: 'mdi-earth', label: 'Diplomáticos', children: [] },
      { value: 'religiosos', icon: 'mdi-hands-pray', label: 'Religiosos', children: [] },
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


function categoryStyles(categorias, parent = {}) {
  return categorias.flatMap((categoria) => {
    const style = {
      color: categoria.textColor || categoria.color || parent.color || '#01295f',
      background: categoria.color || parent.background || '#e7f0fb',
      icon: categoria.icon || categoria.icone || 'mdi-tag-outline',
    }
    return [[categoria.value, style], ...categoryStyles(categoria.children ?? [], style)]
  })
}

export const PROJECT_CATEGORY_STYLES = Object.fromEntries(categoryStyles(PROJECT_CATEGORIES))
