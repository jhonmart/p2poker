<template>
  <article id="main">
    <Table />
    <Deck />
  </article>
</template>

<script>
import Deck from '@/components/Deck.vue';
import Table from '@/components/Table.vue';
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "Room",
  components: { Deck, Table },
  middleware: "hasName",
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters(["getMyID", "getMyName"]),
    room() {
      return this.$route.params.room;
    }
  },
  watch: {
    getMyID(myUID) {
      console.log(myUID)
      if (this.room) this.addConn(this.room);
      else if (myUID) this.$router.push("/sala/" + myUID);
    }
  },
  methods: {
    ...mapMutations(["addConn"])
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