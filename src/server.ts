import { App } from '@/app';
import { AuthRoute } from '@/routes';
import { ValidateEnv } from './utils';

ValidateEnv();

const app = new App([new AuthRoute()]);

app.listen();

export default app;
