import Peer from "peerjs";

export default ({ store: { commit, dispatch, getters } }) => {
  var peer = new Peer();
  commit("setPeerInstance", peer);

  // peer.on("open", function (uid) {
  //   commit("setMyUID", uid);
  // });
    
  peer.on("close", function () {
    console.log(`Sua conexão caiu`);
  });
  
  peer.on("connection", function (conn) {
    conn.on("data", function (msg) {
      console.log(msg)
      dispatch("controller", { msg, user: conn });
    });
    conn.on('open', function(){
      dispatch("addConn", conn.peer);
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