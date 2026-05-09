import { Hono } from 'hono';

const app = new Hono();

app.get('/', (context) => {
  return context.json({
    ok: true,
    service: 'codename-two-api',
  });
});

export default app;
