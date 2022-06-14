// @ts-check

import { fileURLToPath } from "url";
import path from "path";
// @ts-ignore
import fastifyStatic from "fastify-static";
// @ts-ignore
import fastifyErrorPage from "fastify-error-page";
import Rollbar from "rollbar";
import pointOfView from "point-of-view";
// @ts-ignore
import fastifyFormbody from "fastify-formbody";
// @ts-ignore
import fastifySecureSession from "fastify-secure-session";
// @ts-ignore
import fastifyPassport from "fastify-passport";
// @ts-ignore
import fastifySensible from "fastify-sensible";
import { plugin as fastifyReverseRoutes } from "fastify-reverse-routes";
// @ts-ignore
import fastifyMethodOverride from "fastify-method-override";
import fastifyObjectionjs from "fastify-objectionjs";
import qs from "qs";
import Pug from "pug";
import i18next from "i18next";
import ru from "./locales/ru.js";
// @ts-ignore

import addRoutes from "./routes/index.js";
import getHelpers from "./helpers/index.js";
import * as knexConfig from "../knexfile.js";
import models from "./models/index.js";
import FormStrategy from "./lib/passportStrategies/FormStrategy.js";

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const mode = process.env.NODE_ENV || "development";

const setUpViews = (app) => {
  const helpers = getHelpers(app);
  app.register(pointOfView, {
    engine: {
      pug: Pug,
    },
    includeViewExtension: true,
    defaultContext: {
      ...helpers,
      assetPath: (filename) => `/assets/${filename}`,
    },
    templates: path.join(__dirname, "..", "server", "views"),
  });

  app.decorateReply("render", function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this });
  });
};

const setUpStaticAssets = (app) => {
  const pathPublic = path.join(__dirname, "..", "dist");
  app.register(fastifyStatic, {
    root: pathPublic,
    prefix: "/assets/",
  });
};

const setupLocalization = async () => {
  await i18next.init({
    lng: "ru",
    fallbackLng: "en",
    resources: {
      ru,
    },
  });
};

const addHooks = (app) => {
  app.addHook("preHandler", async (req, reply) => {
    reply.locals = {
      isAuthenticated: () => req.isAuthenticated(),
    };
  });
};

const registerPlugins = (app) => {
  app.register(fastifySensible);
  app.register(fastifyErrorPage);
  app.register(fastifyReverseRoutes);
  app.register(fastifyFormbody, { parser: qs.parse });
  app.register(fastifySecureSession, {
    secret: process.env.SESSION_KEY,
    cookie: {
      path: "/",
    },
  });

  // @ts-ignore
  fastifyPassport.registerUserDeserializer((user) =>
    app.objection.models.user.query().findById(user.id)
  );
  // @ts-ignore
  fastifyPassport.registerUserSerializer((user) => Promise.resolve(user));
  // @ts-ignore
  fastifyPassport.use(new FormStrategy("form", app));
  // @ts-ignore
  app.register(fastifyPassport.initialize());
  // @ts-ignore
  app.register(fastifyPassport.secureSession());
  app.decorate("fp", fastifyPassport);
  app.decorate("authenticate", (...args) =>
    // @ts-ignore
    fastifyPassport.authenticate(
      "form",
      {
        failureRedirect: app.reverse("root#index"),
        failureFlash: i18next.t("flash.authError"),
      }
      // @ts-ignore
    )(...args)
  );

  app.register(fastifyMethodOverride);
  app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  });
};

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_KEY,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

const setupErrorHandler = (app) => {
  app.setErrorHandler(async (err, req, reply) => {
    rollbar.error(err, req);
    reply.send(err);
  });
};

// eslint-disable-next-line no-unused-vars
// @ts-ignore
export default async (app, options) => {
    setupErrorHandler(app);
  registerPlugins(app);

  await setupLocalization();
  setUpViews(app);
  setUpStaticAssets(app);
  addRoutes(app);
  addHooks(app);

  return app;
};
