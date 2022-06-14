// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/labels', { name: 'labels#index', preValidation: app.authenticate }, async (req, reply) => {
      const labels = await app
        .objection
        .models
        .label
        .query();
      reply.render('labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'labels#new', preValidation: app.authenticate }, async (req, reply) => {
      const label = await new app
        .objection
        .models
        .label();
      reply.render('labels/new', { label });
    })
    .get('/labels/:id/edit', { name: 'labels#edit', preValidation: app.authenticate }, async (req, reply) => {
      const label = await app
        .objection
        .models
        .label
        .query()
        .findById(req.params.id);
      reply.render('labels/edit', { label });
      return reply;
    })
    .post('/labels', { name: 'labels#create', preValidation: app.authenticate }, async (req, reply) => {
      const label = new app
        .objection
        .models
        .label();

      label.$set(req.body.data);

      try {
        const validLabel = await
        app
          .objection
          .models
          .label
          .fromJson(req.body.data);

        await app
          .objection
          .models
          .label
          .query()
          .insert(validLabel);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels#index'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label, errors: data });
      }

      return reply;
    })
    .patch('/labels:id', { name: 'labels#update', preValidation: app.authenticate }, async (req, reply) => {
      const label = await
      app
        .objection
        .models
        .label
        .query()
        .findById(req.params.id);

      try {
        await label.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.labels.update.success'));
        reply.redirect(app.reverse('labels#index'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.update.error'));
        reply.render('labels#edit', { label, errors: data });
      }
      return reply;
    })
    .delete('/labels/:id', { name: 'labels#destroy', preValidation: app.authenticate }, async (req, reply) => {
      try {
        await app.objection.models.label.query().deleteById(req.params.id);
        req.flash('info', i18next.t('flash.labels.delete.success'));
        return reply.redirect(app.reverse('labels#index'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.delete.error'));
        return reply.redirect(app.reverse('labels#index'));
      }
    });
};
