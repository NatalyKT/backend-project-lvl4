// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .get(
      '/users/:id/edit',
      { name: 'editUser', preValidation: app.authenticate },
      async (req, reply) => {
        const user = await app.objection.models.user.query().findById(req.user.id);
        reply.render('users/edit', { user });
        return reply;
      },
    )
    .post('/users', { name: 'createUser' }, async (req, reply) => {
      try {
        const validUser = await app.objection.models.user.fromJson(
          req.body.data,
        );
        await app.objection.models.user.query().insert(validUser);
        req.flash('success', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (error) {
        const { data } = error;
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.statusCode = 422;
        reply.render('users/new', { user: req.body.data, errors: data });
      }
      return reply;
    });
};
