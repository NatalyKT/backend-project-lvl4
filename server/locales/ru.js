// @ts-check

export default {
  translation: {
    appName: 'Task Manager',
    flash: {
      session: {
        create: {
          success: 'Успешный вход в систему',
          error: 'Неверный емейл или пароль',
        },
        delete: {
          success: 'Успешный выход из системы',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      placeholders: {
        firstName: 'Имя',
        lastName: 'Фамилия',
        email: 'Email',
        password: 'Пароль',
      },
      users: {
        id: 'ID',
        fullName: 'Полное имя',
        email: 'Email',
        createdAt: 'Дата создания',
        options: 'Опции',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
      },
      welcome: {
        index: {
          hello: 'Task Manager',
          description:
            'Training project 4 for the profession "Node.js developer"',
          more: 'Learn more',
        },
      },
    },
  },
};
