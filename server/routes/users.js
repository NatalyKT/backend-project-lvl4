// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

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
    .get('/users/:id/edit', { name: 'users#edit', preValidation: app.authenticate }, async (req, reply) => {
      if (Number(req.params.id) !== Number(req.user.id)) {
        req.flash('error', i18next.t('flash.users.update.failure'));
        return reply.redirect(app.reverse('users#index'));
      }
      const user = await app.objection.models.user.query().findById(req.params.id);
      reply.render('users/edit', { user });
      return reply;
    })
    .post('/users', { name: 'users#create' }, async (req, reply) => {
      const user = new app.objection.models.user();

      user.$set(req.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root#index'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }

      return reply;
    })
    .patch('/users/:id', { name: 'users#update', preValidation: app.authenticate }, async (req, reply) => {
      if (Number(req.params.id) !== Number(req.user.id)) {
        req.flash('error', i18next.t('flash.users.update.failure'));
        return reply.redirect(app.reverse('users#index'));
      }
      const user = await app.objection.models.user.query().findById(req.params.id);
      try {
        await user.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.users.update.success'));
        return reply.redirect(app.reverse('users#index'));
      } catch ({ data }) {
        user.$set(req.body.data);
        req.flash('error', i18next.t('flash.users.update.error'));
        reply.render('users/edit', { user, errors: data });
      }
      return reply;
    })
    .delete('/users/:id', { name: 'users#destroy', preValidation: app.authenticate }, async (req, reply) => {
      if (Number(req.params.id) !== Number(req.user.id)) {
        req.flash('error', i18next.t('flash.users.delete.failure'));
        reply.redirect(app.reverse('users#index'));
        return reply;
      }
      const user = await app.objection.models.user.query().findById(req.params.id);
      const createdTasks = user.$relatedQuery('createdTasks');
      const assignedTasks = await user.$relatedQuery('assignedTasks');

      if (!_.isEmpty(createdTasks) && !_.isEmpty(assignedTasks)) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        return reply.redirect(app.reverse('users#index'));
      }

      try {
        await app.objection.models.user.query().deleteById(req.params.id);
        await req.logOut();
        req.flash('info', i18next.t('flash.users.delete.success'));
        return reply.redirect(app.reverse('users#index'));
      } catch (err) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        return reply.redirect(app.reverse('users#index'));
      }
    });
};
