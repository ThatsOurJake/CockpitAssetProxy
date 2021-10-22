import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';

import config from './config';
import logger from './logger';
import axios from 'axios';

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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      ctx.status = error.response!.status;
      ctx.body = error.response!.data;
      logger.error('Proxy Failed', { res: error.response });
    } else {
      const err = error as Error;
      ctx.status = 400;
      ctx.body = err.message;
      logger.error(`Proxy Failed: ${err.message}`);
    }
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(config.port, () => {
  logger.info(`Listening on port: ${config.port}`);
});
