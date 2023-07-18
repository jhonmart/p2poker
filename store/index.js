import { Store } from "vuex";
import p2p from "./modules/p2p";


export default () => new Store({
  modules: {
    p2p
  }
});
