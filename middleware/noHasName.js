export default function ({ store, redirect }) {
  if (store.getters.getMyName) {
    return redirect("/sala");
  }
}
