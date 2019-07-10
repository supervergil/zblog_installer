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
      },
      code: ""
    },
    getters: {},
    mutations: {
      SET_SERVER(state, serverInfo) {
        state.server = serverInfo;
      },
      SET_MYSQL(state, mysqlInfo) {
        state.mysql = mysqlInfo;
      },
      SET_CODE(state, code) {
        state.code = code;
      }
    },
    actions: {}
  });

export default store();
