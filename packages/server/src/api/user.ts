import type { Router } from 'express';

export function createUserController() {
  return {
    getUser() {
      return {
        name: 'John Doe',
        email: 'john.doe@email.com',
      };
    },
  };
}

export function createUserRoutes(router: Router) {
  const controller = createUserController();

  router.get('/user', (_req, res) => {
    res.json(controller.getUser());
  });
}
