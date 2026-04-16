import styles from "./App.module.scss";
import { MainPage } from "./pages/MainPage";

function App() {
  return (
    <div className={styles.appShell}>
      <MainPage />
    </div>
  );
}

export default App;
