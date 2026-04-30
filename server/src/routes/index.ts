import { Router } from 'express';
import healthRoute from './health.route';
import productRoute from './product.route';
import promotionRoute from './promotion.route';
import orderRoute from './order.route';
import authRoute from './auth.route';
import userRoute from './user.route';
import uploadRoute from './upload.route';

const router = Router();

const defaultRoutes = [
  {
    path: '/health',
    route: healthRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/products',
    route: productRoute,
  },
  {
    path: '/promotions',
    route: promotionRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/upload',
    route: uploadRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
