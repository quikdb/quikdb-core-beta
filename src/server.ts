import { App } from '@/app';
import { AuthRoute, ProjectRoute, PaymentRoute } from '@/routes';
import { ValidateEnv } from './utils';

ValidateEnv();

const app = new App([new AuthRoute(), new ProjectRoute(), new PaymentRoute()]);
app.listen();

export default app;
