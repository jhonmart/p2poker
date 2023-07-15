const cards = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?"];

function genereteUser(user, idx, list) {
  // if (document.querySelector(`[user-name='${user.name}']`)) return; // Mudar para id
  const person = document.createElement("div");
  const count = list.length;

  person.classList.add("person");
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
}

function generateCards(card) {
  const el = document.createElement("button");
  el.innerText = card;
  el.onclick = () => {
    const selected = el.classList.contains("selected");
    sendCard(card, selected);
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

cards.forEach(generateCards);

showResult.onclick = function() {
  const show = table.classList.contains("show");
  showResult.innerText = show ? "Revelar" : "Esconder";
  if (show) table.classList.remove("show");
  else table.classList.add("show");
  sendEveryone({ show: true });
}
