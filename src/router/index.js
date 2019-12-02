import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/user/users.vue'
import Roles from '../components/prower/roles.vue'
import Rights from '../components/prower/rights.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [{
    path: '/',
    redirect: '/Login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    }, {
      path: '/users',
      component: Users
    }, {
      path: '/roles',
      component: Roles
    }, {
      path: '/rights',
      component: Rights
    }]
  }
  ]
})

// 解决左侧二级菜单重复导航
const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return routerPush.call(this, location).catch(error => error)
}

// 路由导航
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
