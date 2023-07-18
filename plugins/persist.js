import createPersistedState from "vuex-persistedstate";

export default ({ store }) => {
  createPersistedState({
    getState: key => JSON.parse(localStorage.getItem(key)),
    setState: (key, state) => {
      localStorage.setItem(key, JSON.stringify({...state, p2p: {
        ...state.p2p,
        peerInstance: {},
        usersData: {},
        usersConn: []
      }}))
    }
  })(store);
};
