import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';

import config from './config';
import logger from './logger';
import axios, { AxiosError } from 'axios';

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());

router.get('/image', async ctx => {
  const { path } = ctx.request.query;

  if (!path) {
    ctx.status = 400;
    ctx.body = {
      error: 'Path not provided'
    }
    return;
  }

  logger.info(`Proxying: '${path}'`);

  try {
    const url = `${config.cockpitUrl}/${path}`;
    const { data, headers } = await axios.get(url, {
      responseType: 'stream'
    });

    ctx.res.setHeader('content-type', headers['content-type']);
    ctx.res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    ctx.body = data;
    ctx.status = 200;
  } catch (err) {
    const error = err as AxiosError;
    logger.error(`Proxy Failed: ${error.message}`, { res: error.response, req: error.request });
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(config.port, () => {
  logger.info(`Listening on port: ${config.port}`);
});
