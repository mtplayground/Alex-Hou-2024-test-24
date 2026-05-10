import { useAppStore } from "@/store/use-app-store";

export function resetAppStore() {
  useAppStore.persist.clearStorage();
  useAppStore.setState(useAppStore.getInitialState(), true);
}
