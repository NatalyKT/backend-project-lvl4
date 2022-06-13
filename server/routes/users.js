// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users#index' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'users#new' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })

    .post('/users', { name: 'users#create' }, async (req, reply) => {
      const user = new app.objection.models.user();
      user.$set(req.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(
          req.body.data,
        );
        await app.objection.models.user.query().insert(validUser);
        req.flash('success', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root#index'));
} catch ({ data }) {
        req.flash('info', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }
      return reply;
    });
};
