import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import Login from '../pages/Login.vue';
import Products from '../pages/Products.vue';
import Transactions from '../pages/Transactions.vue';
import Users from '../pages/Users.vue';
import Notes from '../pages/Notes.vue';
import Files from '../pages/Files.vue';
import Home from '../pages/Home.vue';
import NoteView from '../pages/NoteView.vue';
import NoteEdit from '../pages/NoteEdit.vue';
import FileView from '../pages/FileView.vue';
import Profile from '../pages/Profile.vue';
import About from '../pages/About.vue';
import Terms from '../pages/Terms.vue';
import FAQ from '../pages/FAQ.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
    },
    {
        path: '/notes/:id/edit',
        name: 'note-edit',
        component: NoteEdit,
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: { guest: true }
    },
    {
        path: '/login/verify',
        name: 'login-verify',
        component: Login,
        meta: { guest: true }
    },
    {
        path: '/products',
        name: 'products',
        component: Products,
        meta: { requiresAuth: true }
    },
    {
        path: '/transactions',
        name: 'transactions',
        component: Transactions,
        meta: { requiresAuth: true }
    },
    {
        path: '/users',
        name: 'users',
        component: Users,
        meta: { requiresAuth: true }
    },
    {
        path: '/notes',
        name: 'notes',
        component: Notes,
        meta: { requiresAuth: true }
    },
    {
        path: '/files',
        name: 'files',
        component: Files,
        meta: { requiresAuth: true }
    },
    {
        path: '/about',
        name: 'about',
        component: About,
    },
    {
        path: '/terms',
        name: 'terms',
        component: Terms,
    },
    {
        path: '/faq',
        name: 'faq',
        component: FAQ,
    },
    {
        path: '/:idOrSlug',
        name: 'note-view',
        component: NoteView,
    },
    {
        path: '/file/:idOrSlug',
        name: 'file-view',
        component: FileView,
    },
];

const router = createRouter({
    history: createWebHistory('/chs/noteshare-express/'),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('auth_token');
    
    if (to.meta.requiresAuth && !token) {
        next('/login');
    } else if (to.meta.guest && token) {
        next('/');
    } else {
        next();
    }
});

export default router;
