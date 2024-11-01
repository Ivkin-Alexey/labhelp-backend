const defaultResearchSelectOption = {
  value: 'Без направления',
  label: 'Без направления',
}

const researches = [
  {
    id: 10,
    name: 'Обогащение',
    advisor: 'Александрова Татьяна Николаевна',
    degree: 'докт. техн. наук',
  },
  { id: 9, name: 'Алюминий', advisor: 'Горланов Евгений Сергеевич', degree: 'докт. техн. наук' },
  { id: 8, name: 'Сплавы', advisor: 'Бажин Владимир Юрьевич', degree: 'докт. техн. наук' },
  {
    id: 7,
    name: 'Редкие металлы',
    advisor: 'Черемисина Ольга Владимировна',
    degree: 'докт. техн. наук',
  },
  { id: 6, name: 'Агломерация', advisor: 'Лебедев Андрей Борисович', degree: 'канд. техн. наук' },
  { id: 5, name: 'Кремнегель', advisor: 'Пягай Игорь Николаевич', degree: 'докт. техн. наук' },
  {
    id: 4,
    name: 'Катализаторы',
    advisor: 'Спецов Евгений Александрович',
    degree: 'канд. техн. наук',
  },
  { id: 3, name: 'Углерод', advisor: 'Рудко Вячеслав Алексеевич', degree: 'канд. техн. наук' },
  { id: 2, name: 'Удобрения', advisor: 'Карапетян Кирилл Гарегинович', degree: 'докт. техн. наук' },
  { id: 1, name: 'Сапонит', advisor: 'Зубкова Ольга Сергеевна', degree: 'канд. техн. наук' },
  {
    id: 0,
    name: 'Кинетика процессов',
    advisor: 'Шариков Феликс Юрьевич',
    degree: 'докт. техн. наук',
  },
]

const researchTopics = researches.map(el => el.name)

const researchesSelectOptions = researches.reduce(
  (sum, cur) => [...sum, { value: cur.name, label: cur.name }],
  [defaultResearchSelectOption],
)

export { researchesSelectOptions, researches, researchTopics, defaultResearchSelectOption }
