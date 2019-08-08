import Vue from "vue";
import VueRouter from "vue-router";
import { Message } from "element-ui";

import store from "@/store";

import LayoutFull from "@/layout/full";

import Welcome from "@/pages/welcome";
import Server from "@/pages/server";
import Environment from "@/pages/environment";
import Mysql from "@/pages/mysql";
import Install from "@/pages/install";
import Over from "@/pages/over";

Vue.use(VueRouter);

const routerList = [
  {
    path: "/welcome",
    component: Welcome
  },
  {
    path: "/server",
    component: Server
  },
  {
    path: "/environment",
    component: Environment
  },
  {
    path: "/mysql",
    component: Mysql
  },
  {
    path: "/install",
    component: Install
  },
  {
    path: "/over",
    component: Over
  }
];

const getLayout = layout => {
  if (!layout) {
    return LayoutFull;
  } else {
    switch (layout) {
      case "full":
        return LayoutFull;
    }
  }
};

const router = new VueRouter({
  routes: [
    {
      path: "/",
      redirect: "/welcome"
    },
    ...routerList.map(item => {
      if (!item.component && !!item.redirect) {
        return {
          path: item.path,
          redirect: item.redirect
        };
      }
      return {
        path: item.path,
        component: getLayout(item.component.layout),
        children: [
          { path: "", component: item.component, children: item.children }
        ]
      };
    })
  ]
});

router.beforeEach((to, from, next) => {
  if (
    to.path !== "/" &&
    to.path !== "/welcome" &&
    to.path !== "/server" &&
    to.path !== "/over"
  ) {
    if (
      store.state.server.ip &&
      store.state.server.account &&
      store.state.server.password
    ) {
      next();
    } else {
      Message({
        message: "请重新登录！",
        type: "warning",
        duration: 1200
      });
      next("/welcome");
    }
  } else {
    next();
  }
});

export default router;
