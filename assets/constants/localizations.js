const localizations = {
  startMessage: 'Хочешь к нам?',
  selectResearches: 'Выбери научное направление: 👇',
  researchDescription: 'Описание направления',
  iDontUnderstand: 'Я не понимаю...',
  equipment: {
    dbIsReloadedMsg: 'База данных обновлена',
    dbIsReloading: 'База данных обновляется...',
    searchError: 'Оборудование с таким ID не найдено',
    favorite: {
      addedToDB: 'Оборудование добавлено в избранное',
      deletedFromDB: 'Оборудование удалено из избранного',
      errors: {
        notUnique: 'Это оборудование уже добавлено в избранное',
        notExist: 'Такого оборудования нет в избранном',
        emptyList: 'Список избранного пуст',
      },
    },
    operating: {
      delete: 'Работа на оборудовании завершена',
      empty: 'Такого оборудования нет в списке работающего',
    },
    searchHistory: {
      addedToDB: 'Поисковый запрос сохранен',
      deletedFromDB: 'Поисковый запрос удален',
      errors: {
        notUnique: 'Такой поисковый запрос уже сохранен',
        emptyList: 'Список поисковых запросов пуст',
        notExist: 'Такого поискового запроса не найдено',
      },
    },
  },
  botAnswers: {
    invitationToRegistration:
      'Отлично! Для отправки заявки необходимо заполнить еще некоторые данные о себе',
  },
  superAdministratorActions: {
    confirmStudentApplication:
      'Ваша заявка подтверждена. Приходите для встречи с руководителем направления в ауд. 3215 в 11:00 по вторникам и четвергам',
    confirmWorkerApplication: 'Администратор подтвердил Ваш аккаунт',
    denyApplication: 'Администратор удалил Ваш аккаунт',
  },
  postRequests: {
    startEquipment: { success: 'Начата работа на оборудовании' },
  },
  prompts: {
    topicDoesntExist: 'Промпта с такой темой не существует',
  },
  reagents: {
    notifications: {
      appConfirmationForManager: 'Заявка подтверждена',
      appDoesntExist: 'Такой заявки не существует',
      appConfirmation: 'Ваша заявка подтверждена. Получите реактивы в установленном порядке',
      appRejection: 'Ваша заявка отклонена',
    },
  },
  users: {
    errors: {
      userAccessError: 'Данное действие доступно только для суперадминистраторов',
      unregisteredUserError: 'Пользователь с таким chat ID не зарегистрирован',
    },
  },
}

export default localizations
