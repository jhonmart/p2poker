<template>
  <article id="main">
    <Table />
    <Deck />
  </article>
</template>

<script>
import Deck from '@/components/Deck.vue';
import Table from '@/components/Table.vue';
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Room",
  components: { Deck, Table },
  middleware: "hasName",
  computed: {
    ...mapGetters(["getMyID", "getMyName", "getPeerInstance"]),
    room() {
      return this.$route.params.room;
    }
  },
  watch: {
    getPeerInstance() {
      const myUID = this.getMyID;
      if (this.room) this.addServe(this.room);
      else if (myUID) this.$router.push("/sala/" + myUID);
    }
  },
  methods: {
    ...mapActions(["addServe"])
  }
}
</script>

<style lang="scss" scoped>
#main {
  gap: 6rem;
  display: flex;
  height: 100vh;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
</style>