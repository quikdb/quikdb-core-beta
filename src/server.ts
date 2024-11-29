import { App } from '@/app';
import { AuthRoute, ProjectRoute } from '@/routes';
import { ValidateEnv } from './utils';

ValidateEnv();

const app = new App([new AuthRoute(), new ProjectRoute()]);
app.listen();

export default app;
