// import { ToastProgrammatic as Toast } from "buefy";

export default function ({ store, redirect }) {
  if (!store.getters.getMyName) {
    // Toast.open({
    //   message: "Para ent",
    //   type: "is-warning",
    //   duration: 8e3
    // });
    return redirect("/");
  }
}
