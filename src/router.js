import Vue from 'vue';
import Router from 'vue-router';
import Index from './views/Index.vue';
import Trajectory from './views/Trajectory.vue';
import Card from './views/Card.vue';


Vue.use(Router);

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [{
        path: '/',
        redirect: '/index'
    },
    {
        path: '/index',
        name: 'index',
        component: Index,
        children: [
            {
                path: '/trajectory',
                name: 'trajectory',
                component: Trajectory
            },
            {
                path: '/card',
                name: 'card',
                component: Card
            }
    ]
    }
]
})

export default router