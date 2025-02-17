const routes = [
 
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/PagePOS.vue') }, // Default page
      { path: 'settings', component: () => import('pages/PageSettings.vue') },
      { path: 'stock', component: () => import('pages/PageStock.vue') },
      { path: 'expenses', component: () => import('src/pages/PageWallet.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;