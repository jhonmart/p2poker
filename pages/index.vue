<template>
  <section>
    <div class="container mt-5">
      <aside class="is-flex p-5">
        <b-field label="Digite seu nome" class="flex-1 mr-5" label-position="on-border" type="is-white">
          <b-input v-model="userName" />
        </b-field>
        <b-button type="is-green" @click="saveName">Salvar</b-button>
      </aside>
    </div>
  </section>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "Acesso",
  middleware: "noHasName",
  data() {
    return {
      userName: ""
    };
  },
  computed: {
    ...mapGetters(["getMyID"])
  },
  methods: {
    ...mapMutations(["setMyName"]),
    saveName() {
      this.setMyName(this.userName);
      this.$router.push("/sala");
    }
  }
}
</script>

<style scoped lang="scss">
section {
  display: flex;
  height: 100vh;
  flex-wrap: wrap;
  align-content: center;
}
.flex-1 {
  flex: 1;
}
</style>