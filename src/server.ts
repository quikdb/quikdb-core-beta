import { App } from '@/app';
import { AuthRoute, AdminRoute, UserRoute } from '@/routes';
import { ValidateEnv } from '@utils/validateEnv';

ValidateEnv();

const app = new App([new AuthRoute(), new AdminRoute(), new UserRoute()]);

app.listen();

export default app;
