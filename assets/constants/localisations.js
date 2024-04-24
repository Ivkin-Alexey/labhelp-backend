const localisations = {
    startMessage: 'Хочешь к нам?',
    selectResearches: "Выбери научное направление: 👇",
    researchDescription: "Описание направления",
    iDontUnderstand: "Я не понимаю...",
    equipment: {
        dbIsReloadedMsg: "База данных обновлена",
        dbIsReloading: "База данных обновляется...",
    },
    botAnswers: {
        invitationToRegistration: "Отлично! Для отправки заявки необходимо заполнить еще некоторые данные о себе",
    },
    superAdministratorActions: {
        confirmStudentApplication: "Ваша заявка подтверждена. Приходите для встречи с руководителем направления в ауд. 3215 в 11:00 по вторникам и четвергам",
        confirmWorkerApplication: "Администратор подтвердил Ваш аккаунт",
        denyApplication: "Администратор удалил Ваш аккаунт"
    },
    postRequests: {
        startEquipment: {success: "Начата работа на оборудовании"}
    },
    prompts: {
        topicDoesntExist: "Промпта с такой темой не существует"
    },
    reagents: {
        notifications: {
            appConfirmationForManager: "Заявка подтверждена",
            appDoesntExist: "Такой заявки не существует",
            appConfirmation: "Ваша заявка подтверждена. Получите реактивы в установленном порядке",
            appRejection: "Ваша заявка отклонена"
        }
    },
    users: {
        errors: {
            userAccessError: "Данное действие доступно только для суперадминистраторов",
            unregisteredUserError: "Пользователь с таким chat ID не зарегистрирован"
        }
    }
};

module.exports = localisations;

