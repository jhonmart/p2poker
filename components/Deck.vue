<template>
  <section id="deck">
    <button
      v-for="(card, idx) in cards"
      :key="`card-${idx}`"
      class="card"
      :class="{ 'has-background-noturno': vote !== card, 'has-background-blue-oil': vote === card }"
      @click="setVote(card)"
    >
      {{ card }}
    </button>
  </section>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: 'Deck',
  data() {
    return {
      cards: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?"],
      vote: ""
    }
  },
  methods: {
    ...mapActions(["sendEveryone", "updateMe"]),
    setVote(card) {
      if (this.vote === card) this.vote = "-";
      else this.vote = card;
      this.sendEveryone({ card });
      this.updateMe({ vote: this.vote });
    }
  }
}
</script>

<style lang="scss" scoped>
/* cards */
#deck {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}
.card {
  padding: 20px 10px;
  min-width: 55px;
  font-size: 2rem;
  color: white;
  border: 1px white solid;
  border-radius: 5px;
}
.card:hover, .card.selected {
  background: #3f3f3f;
  cursor: pointer;
}

</style>