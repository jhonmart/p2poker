const cards = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?"];

function updateVote(conn, data) {
  const person = document.querySelector(`[user-id='${conn.peer || conn.id}']`);
  if (!person) return; 
  person.setAttribute("user-vote", data.card || "");

  if (Number.isInteger(parseInt(data.card))) person.classList.add("voted");
  else person.classList.remove("voted");
  return person;
}

function genereteUser(user, idx, list) {
  const person = document.createElement("div");
  const count = list.length;

  person.classList.add("person");
  if (Number.isInteger(parseInt(user.vote))) person.classList.add("voted");
  else person.classList.remove("voted");

  const angle = (idx / count) * 2 * Math.PI;
  const radius = table.offsetWidth - 150; // 50 é o raio da bolinha
  const left =
    Math.round(Math.cos(angle) * radius + table.offsetWidth / 2) -
    table.offsetWidth * 0.1;
  const top =
    Math.round(Math.sin(angle) * radius + table.offsetHeight / 2) -
    table.offsetHeight * 0.1;
  person.style.left = `${left}px`;
  person.style.top = `${top}px`;
  person.setAttribute("user-name", user.name);
  person.setAttribute("user-vote", user.vote);
  person.setAttribute("user-id", user.id);

  table.appendChild(person);
}

function createUpdateUser() {
  const list = Object.entries(userNames).map(person => ({ name: person[1], id: person[0], vote: votes[person[0]] || "" }));
  document
    .querySelectorAll("[user-name]")
    .forEach(element => {
      element.remove();
    });
  list.forEach(genereteUser);
  const show = table.classList.contains("show");
  updateAverage(show);
}

function generateCards(card) {
  const el = document.createElement("button");
  el.innerText = card;
  el.onclick = () => {
    const selected = el.classList.contains("selected");

    updateVote(myConfig, { card });
    sendCard(selected ? '-' : card);
    if (selected) el.classList.remove("selected");
    else {
      document
        .querySelectorAll(".selected")
        .forEach((element) => element.classList.remove("selected"));
      el.classList.add("selected");
    }
  };
  el.className = "card";
  deck.append(el);
}

function findClosestNumber(unknownNumber) {
  let closestNumber = null;
  let minDistance = Infinity;
  const list = cards.slice(0,-1);

  for (let i = 0; i < list.length; i++) {
    const currentNumber = list[i];
    
    if (typeof currentNumber === 'number') {
      const distance = Math.abs(currentNumber - unknownNumber);

      if (distance < minDistance) {
        minDistance = distance;
        closestNumber = currentNumber;
      }
    }
  }

  return closestNumber;
}

function calcAverage() {
  const listVotes = Object.values(votes);
  const average = listVotes.reduce((acc,actual)=> ["?", "-", ""].includes(actual) ? acc : acc+actual,0) / listVotes.length
  return findClosestNumber(average);
}

function updateAverage(show) {
  if (show) {
    const closeNumber = calcAverage();
    showResult.innerHTML = `Media: <b>${closeNumber}</b><br>Esconder`;
  } else {
    showResult.innerHTML = "Revelar";
  }
}

function changeViewState(show) {
  if (show) {
    table.classList.add("show");
  } else {
    table.classList.remove("show");
  }
}

cards.forEach(generateCards);

showResult.onclick = function() {
  const show = !table.classList.contains("show");
  changeViewState(show);
  updateAverage(show);
  sendEveryone({ show });
}
