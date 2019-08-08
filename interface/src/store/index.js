import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = () =>
  new Vuex.Store({
    state: {
      server: {
        ip: "",
        account: "",
        password: "",
        domain: ""
      },
      mysql: {
        account: "",
        password: ""
      }
    },
    getters: {},
    mutations: {
      SET_SERVER(state, serverInfo) {
        state.server = serverInfo;
      },
      SET_MYSQL(state, mysqlInfo) {
        state.mysql = mysqlInfo;
      }
    },
    actions: {}
  });

export default store();
