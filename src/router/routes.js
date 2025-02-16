const routes = [
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'), // Separate layout for login
    children: [
      { path: '', component: () => import('pages/Login.vue') }
    ]
  },
  {
    path: '/signup',
    component: () => import('layouts/AuthLayout.vue'), // Use the same AuthLayout
    children: [
      { path: '', component: () => import('pages/signUp.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true }, // Protect main layout
    children: [
      { path: '', component: () => import('pages/PageEntries.vue') },
      { path: 'settings', component: () => import('pages/PageSettings.vue') },
      { path: 'stock', component: () => import('pages/PageStock.vue') },
      { path: 'pos', component: () => import('pages/PagePOS.vue') },
      { path: 'expences', component: () => import('src/pages/PageWallet.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes;
