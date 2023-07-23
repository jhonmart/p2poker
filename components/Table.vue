<template>
  <section>
    <section id="table" ref="table" class="card-background">
      <div class="card-symbols"></div>
      <button id="showResult">Revelar</button>
      <span
        v-for="(person, idx) in getPeople"
        :key="person.id"
        :user-name="person.name"
        :user-id="person.id"
        :user-vote="person.vote"
        class="person"
        :class="{ voted: checkVote(person.vote)  }"
        :style="calcPosition(idx)"
      >
        <b>{{ emoji[idx] || "🌞" }}</b>
      </span>
    </section>
  </section>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Table",
  data() {
    return {
      emoji: ["😀", "😄", "😊", "😍", "🤩", "😎", "😂", "😇", "😋", "🥳", "🤗", "😃", "😘", "🙂", "😆", "😉", "😜", "😝", "🥰", "🙃"]
    };
  },
  computed: {
    ...mapGetters(["getPeople"])
  },
  methods: {
    calcPosition(idx) {
      const tableEl = this.$refs.table;
      if (!tableEl) return;
      const angle = (idx / this.getPeople.length) * 2 * Math.PI;
      const radius = tableEl.offsetWidth - 150;
      const left =
        Math.round(Math.cos(angle) * radius + tableEl.offsetWidth / 2) -
        tableEl.offsetWidth * 0.1;
      const top =
        Math.round(Math.sin(angle) * radius + tableEl.offsetHeight / 2) -
        tableEl.offsetHeight * 0.1;
      return `left: ${left}px;top: ${top}px`;
    },
    checkVote(vote) {
      return vote && vote !== "-";
    }
  }
}
</script>

<style lang="scss" scoped>
#table {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5px solid #101010;
  box-shadow: 3px 3px 10px 2px black;
}

#showResult {
  color: white;
  background: #2d0900;
  padding: 10px;
  border: 1px solid;
  z-index: 3;
  border-radius: 18px;
  font-weight: bold;
  box-shadow: 5px 5px 10px 2px black;
}
#showResult:hover {
  cursor: pointer;
  background-color: #791818;
}

.person {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #830a1d;
  position: absolute;
  justify-content: center;
  display: flex;
  b {
    font-size: 2rem;
  }
}

.person::after {
  content: attr(user-name);
  color: white;
  width: 100px;
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.person::before {
  content: attr(user-vote);
  color: black;
  font-weight: bold;
  font-family: sans-serif;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: none;
}
.person.voted {
  background-color: #0a834d;
}
#table.show .person::before {
  display: block;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(#004d00, #003300);
}

.card-symbols {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  font-size: 100px;
  color: rgba(255, 255, 255, 0.3);
  background-repeat: repeat;
  background-position: center;
  background-size: 35px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ctext x='25' y='25' font-size='45' text-anchor='middle' alignment-baseline='central' fill-opacity='0.3' transform='rotate(-90 25 25)'%3E♥♦♣♠%3C/text%3E%3C/svg%3E");
}
</style>