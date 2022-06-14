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
    })
    .get(
      '/users/:id/edit',
      { name: 'users#edit', preValidation: app.authenticate },
      async (req, reply) => {
        if (Number(req.params.id) !== Number(req.user.id)) {
          req.flash('error', i18next.t('flash.users.update.error'));
          return reply.redirect(app.reverse('users'));
        }
        const user = await app.objection.models.user
          .query()
          .findById(req.user.id);
        reply.render('users/edit', { user });
        return reply;
      },
    )
    .patch(
      '/users/:id',
      { name: 'users#update', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.user;
        if (req.params.id !== Number(id)) {
          req.flash('error', i18next.t('flash.users.edit.accessError'));
          return reply.redirect(app.reverse('users#index'));
        }
      },
    );
};
