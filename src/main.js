const peerInstance = new Peer();
const othersUsers = [];
const myConfig = { scanTime: 2e3, birthday: Date.now() };
const userNames = {};

let master = location.hash.slice(1);
let userName = localStorage.getItem("p2pokerUserName");
let votes = {};

if (userName)
  myConfig.name = userName;

if (!myConfig.name) {
  myConfig.name = prompt("Digite seu nome:");
  localStorage.setItem("p2pokerUserName", myConfig.name);
}

const addConn = uid => {
  if (uid === myConfig.id) return;
  const exist = othersUsers.some(conn => conn.peer === uid);
  if (!exist) {
    const conn = peerInstance.connect(uid);
    myConfig.updateDate = Date.now();
    othersUsers.push(conn);
  }
}

const removeConn = uid => {
  const idx = othersUsers.findIndex(conn => conn.peer === uid);
  delete userNames[uid];
  delete votes[uid];
  othersUsers.splice(idx, 1);
  if (uid === master) {
    console.log(`
      <b>Master caiu: </b> <i>Aguardar eleição</i>
    `);
    sendEveryone({ election: myConfig.birthday, round: 0 });
  }
}

const configRoom = () => {
  myConfig.master = !Boolean(master);
  if (master) {
    addConn(master);
  } else {
    location.hash = myConfig.id;
  }
}

const controller = (user, obj) => {
  if (obj.scan) {
    const ansewer = {
      users: othersUsers.map(conn => conn.peer),
      userUpdateList: true,
      source: myConfig
    };
    const connUser = othersUsers.find(conn => user.peer === conn.peer);
    connUser.send(ansewer);
    if (!userNames[user.peer]) {
      userNames[user.peer] = obj.scan;
      createUpdateUser();
    }
  } else if (obj.election) {
    console.log(obj)
    if (myConfig.birthday < obj.election) {
      myConfig.master = true;
      location.hash = user.peer;
      master = myConfig.id;
      sendEveryone({ election: myConfig.birthday, round: obj.round + 1 });
    } else if (obj.round) {
      location.hash = user.peer;
      master = user.peer;
      myConfig.master = false;
    }
  } else if (obj.userUpdateList && obj.source.master) {
    if (obj.source.date > myConfig.updateDate)
      myConfig.updateDate = obj.source.date;
    obj.users.map(addConn);
  } else if (obj.card) {
    votes[user.peer] = obj.card;
    createUpdateUser();
  }
}

const sendEveryone = msg => othersUsers.forEach(conn => conn.send(msg));

const sendCard = value => {
  sendEveryone({ card: value });
  votes[myConfig.id] = value;
  createUpdateUser();
};

peerInstance.on("open", function (uid) {
  myConfig.id = uid;
  userNames[myConfig.id] = myConfig.name;
  createUpdateUser();
  configRoom();
});

peerInstance.on("close", function () {
  alert(`Sua conexão caiu`);
});

peerInstance.on("connection", function (conn) {
  conn.on("data", function (data) {
    controller(conn, data);
  });
  conn.on('open', function(){
    addConn(conn.peer);
  });
  conn.on('close', function(){
    removeConn(conn.peer);
  });
});

peerInstance.on("disconnected", function (uid) {
  removeConn(uid);
});

window.addEventListener('beforeunload', function() {
  sendEveryone({
    date: myConfig.updateDate,
    users: othersUsers.map(conn => conn.peer),
    userUpdateList: true,
    source: myConfig
  });
});

const scanInterval = setInterval(() => {
  if (myConfig.master) location.hash = myConfig.id;
  sendEveryone({ scan: myConfig.name });
}, myConfig.scanTime);
