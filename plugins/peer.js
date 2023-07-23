import Peer from "peerjs";

export default ({ store: { commit, dispatch, getters }, router }) => {
  var peer = new Peer(getters.getMyID);
  commit("setPeerInstance", {});
  
  peer.on("open", function (uid) {
    commit("setMyUID", uid);
    commit("setPeerInstance", peer);
    dispatch("addMe");
  });

  peer.on("close", function () {
    console.log(`Sua conexão caiu`);
  });

  peer.on("connection", function (conn) {
    commit("addConn", conn.peer);
    conn.on("data", function (msg) {
      dispatch("controller", { msg, user: conn, router });
    });
    conn.on('open', function(){
      commit("addConn", conn.peer);
    });
    conn.on('close', function(){
      dispatch("removeConn", conn.peer);
    });
  });

  peer.on("disconnected", function (uid) {
    dispatch("removeConn", uid);
    dispatch("sendBye");
  });

  window.addEventListener('beforeunload', function() {
    dispatch("sendBye");
  });

  setInterval(() => {
    dispatch("sendEveryone", { scan: getters.getMyName });
  }, 2e3);

  // peer.on("call", function (call) {
  //   store.commit("addCall", call);
  //   call.on("stream", function (remoteStream) {
  //     store.commit("addStream", remoteStream);
  //   });
  // });
};