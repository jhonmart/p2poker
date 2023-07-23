import { ActionContext } from "vuex/types";
import { ToastProgrammatic as Toast } from "buefy";
import Peer, { DataConnection } from "peerjs";

export interface RouterProps {
  history: { current: { path: string } };
  replace: (path: string) => void;
  push: (path: string) => void;
  back: () => void;
}

type userDetail = {
  [key: string]:  { vote: string, name: string, alive: boolean }
}

const state = {
  peerInstance: {} as Peer,
  usersConn: [] as DataConnection[],
  usersData: {} as userDetail,
  peoples: [] as { vote: string, name: string, id: string }[],
  config: { scanTime: 2e3, birthday: 0, name: "", updateDate: 0 },
  master: {} as DataConnection,
  myUID: ""
};

type State = typeof state;

const mutations = {
  setMyUID(state: State, peerID: string) {
    state.myUID = peerID;
  },
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
    // Verificar a criação de tratativa de tempo de vida ou exclusão de instancias antigas (else)
    if (!exist) {
      const conn = state.peerInstance.connect(uid);
      state.config.updateDate = Date.now();
      state.usersConn.push(conn);
      if(!state.master.peer) state.master = conn;
      return conn;
    }
  },
  updatePeople(state: State) {
    state.peoples = Object.entries(state.usersData)
    .reduce((acc: any, current) =>
      acc.concat([{ id: current[0], ...current[1] }]), []
    );
    console.log(state.peoples.map(el => el.vote))
  },
  addUserData(state: State, data: { value: { vote: string, name: string, alive: boolean }, id: string }) {
    console.log("Alterando dados: " + data.id)
    state.usersData[data.id] = data.value;
  },
  updateUser(state: State, data: { value: Record<string, string>, id: string }) {
    console.log("Atualizando dados: " + data.id)
    if (!state.usersData[data.id]) return;
    state.usersData[data.id] = { ...state.usersData[data.id], ...data.value };
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
    if (uid === state.master.peer) {
      // console.log(`
      //   <b>Master caiu: </b> <i>Aguardar eleição</i>
      // `);
      dispatch("sendEveryone", { election: state.config.birthday, round: 0 });
    }
  },
  controller: ({ commit, dispatch, state }: ActionContext<State, any>, {msg, user, router}: {msg:{[key: string]: any}, user: DataConnection, router: RouterProps }) => {
    if (msg.scan) {
      const ansewer = {
        users: state.usersConn.map(conn => conn.peer),
        userUpdateList: true,
        source: state.config,
        info: state.usersData[state.peerInstance.id]
      };
      const connUser = state.usersConn.find(conn => user.peer === conn.peer);
      connUser?.send(ansewer);
      commit("updateUser", { value: { name: msg.scan, alive: true }, id: user.peer });
      commit("updatePeople");
    } else if (msg.election) {
      if (state.config.birthday < msg.election) {
        router.replace("/sala/" + user.peer); //Atualizar sala
        // master = state.peerInstance.id;
        dispatch("sendEveryone", { election: state.config.birthday, round: msg.round + 1 });
      } else if (msg.round) {
        router.replace("/sala/" + user.peer); //Atualizar sala
      }
    } else if (msg.userUpdateList) {
      msg.users.forEach((id: string) => commit("addConn", id));
    } else if (msg.card) {
      const vote = msg.card === "-" ? "" : msg.card;
      commit("updateUser", { value: { vote }, id: user.peer });
      commit("updatePeople");
    } else if ([true, false].includes(msg.show)) {
      dispatch("changeViewState", msg.show);
      dispatch("updateAverage", msg.show);
    } else if (msg.check) {
      if (msg.check === "connection") {
        const me = { value: { name: msg.scan, vote: "", alive: true }, id: user.peer }
        const connUser = state.usersConn.find(conn => user.peer === conn.peer);
        connUser?.send({ update: me });
      }
    } else if (msg.update) {
      commit("updateUser", { value: msg.update, id: user.peer });
      commit("updatePeople");
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

  addMe: ({ getters, commit }: ActionContext<State, any>) => {
    commit("addUserData", { value: { name: getters.getMyName, vote: "", alive: true }, id: getters.getMyID });
    commit("updatePeople");
  },

  updateMe: ({ getters, commit }: ActionContext<State, any>, value: Record<string, string>) => {
    commit("updateUser", { value, id: getters.getMyID });
    commit("updatePeople");
  },

  addServe: async ({ state, commit }: ActionContext<State, any>, room: string) => {
    if (room === state.myUID) return;
    const maxTries = 100;
    const timeTry = 1e3;
    let interval: any;
    let triesCount = 0;
    commit("addConn", room);
    commit("addUserData", { value: { name: "", vote: "", alive: false }, id: room });

    await new Promise((resolve, reject) => {
      interval = setInterval(() => {
        triesCount++;
        console.log([
          triesCount,
          interval,
          state.usersData[room]
        ])
        if (triesCount >= maxTries){
          clearInterval(interval);
          reject("Timeout connection room");
        } else {
          state.master.send({ check: "connection" });
          if(state.usersData[room].alive) {
            clearInterval(interval);
            resolve({ connection: true });
          }
        }
        if (triesCount % 10 === 0) commit("addConn", room);
      }, timeTry);
    });
  }
};

const getters = {
  getMyID: (state: State) => state.myUID,
  getMyName: (state: State) => state.config.name,
  getUsersData: (state: State) => state.usersData,
  getPeerInstance: (state: State) => state.peerInstance,
  getPeople: (state: State) => state.peoples
};

export default {
  state: () => state,
  mutations,
  actions,
  getters,
};
