import { ActionContext } from "vuex/types";
import { ToastProgrammatic as Toast } from "buefy";
import Peer, { DataConnection } from "peerjs";

type userDetail = {
  [key: string]:  { vote: string, name: string }
}

const state = {
  peerInstance: {} as Peer,
  usersConn: [] as DataConnection[],
  usersData: {} as userDetail,
  config: { scanTime: 2e3, birthday: 0, name: "", updateDate: 0 },
  master: ""
};

type State = typeof state;

const mutations = {
  setPeerInstance(state: State, peer: Peer) {
    state.config.birthday = Date.now();
    state.peerInstance = peer;
  },
  setMyName(state: State, name: string) {
    state.config.name = name;
  },
  addConn(state: State, uid: string) {
    if (!state.peerInstance || uid === state.peerInstance.id) return;
    const exist = state.usersConn.some(conn => conn.peer === uid);
    if (!exist) {
      const conn = state.peerInstance.connect(uid);
      state.config.updateDate = Date.now();
      state.usersConn.push(conn);
    }
  },
  addUserData(state: State, data: { value: { vote: string, name: string }, id: string }) {
    state.usersData[data.id] = data.value;
  },
  showFail(_: State, message: string) {
    Toast.open({
      message,
      duration: 8000,
      type: "is-danger",
    });
  },
  showSuccess(_: State, message: string) {
    Toast.open({
      message,
      duration: 5000,
      type: "is-green",
    });
  },
};
declare global {
  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream;
  }
  interface MediaDevices {
    getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  }
}

const actions = {
  sendEveryone: ({ state }: ActionContext<State, any>, msg: {[key: string]: any}) => {
    state.usersConn.forEach(conn => conn.send(msg));
  },
  removeConn({ state, dispatch }: ActionContext<State, any>, uid: string) {
    const idx = state.usersConn.findIndex(conn => conn.peer === uid);
    delete state.usersData[uid];
    state.usersConn.splice(idx, 1);
    if (uid === state.master) {
      // console.log(`
      //   <b>Master caiu: </b> <i>Aguardar eleição</i>
      // `);
      dispatch("sendEveryone", { election: state.config.birthday, round: 0 });
    }
  },
  controller: ({ commit, dispatch, state }: ActionContext<State, any>, {msg, user}: {msg:{[key: string]: any}, user: DataConnection}) => {
    if (msg.scan) {
      const ansewer = {
        users: state.usersConn.map(conn => conn.peer),
        userUpdateList: true,
        source: state.config,
        info: state.usersData[state.peerInstance.id]
      };
      const connUser = state.usersConn.find(conn => user.peer === conn.peer);
      connUser?.send(ansewer);
      if (!state.usersData[user.peer]) {
        state.usersData[user.peer].name = msg.scan;
      }
    } else if (msg.election) {
      if (state.config.birthday < msg.election) {
        location.hash = user.peer;
        // master = state.peerInstance.id;
        dispatch("sendEveryone", { election: state.config.birthday, round: msg.round + 1 });
      } else if (msg.round) {
        location.hash = user.peer; // Mudar a rota aqui
      }
    } else if (msg.userUpdateList && msg.source.master) {
      if (msg.source.date > state.config.updateDate) {}
        state.config.updateDate = msg.source.date;
      state.usersData[user.peer].vote = msg.myVote;
      msg.users.forEach((id: string) => commit("addConn", id));
    } else if (msg.card) {
      if (msg.card === "-") state.usersData[user.peer].vote = "";
      else state.usersData[user.peer].vote = msg.card;
      dispatch("updateVote", {user, msg});
    } else if ([true, false].includes(msg.show)) {
      dispatch("changeViewState", msg.show);
      dispatch("updateAverage", msg.show);
    }
  },

  sendBye: ({ state, dispatch }: ActionContext<State, any>) => {
    dispatch("sendEveryone", {
      date: state.config.updateDate,
      users: state.usersConn.map(conn => conn.peer),
      userUpdateList: true,
      source: state.config
    });
  },
};

const getters = {
  getMyID: (state: State) => state.peerInstance.id,
  getMyName: (state: State) => state.config.name,
  getUsersData: (state: State) => state.usersData 
};

export default {
  state: () => state,
  mutations,
  actions,
  getters,
};
