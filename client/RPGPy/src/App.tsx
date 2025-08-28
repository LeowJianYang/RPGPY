import NavBar from "./components/navigation";
import {FooterBar} from "./components/navigation";
import HomePage from "./page/HomePage";


function App() {
  // const [Msg,setMsg] = useState("");

  // useEffect(() => {
  //   fetch("http://localhost:3000/api/hello")
  //     .then((res) => res.json())
  //     .then((data) => setMsg(data.message));
  // }, []);

  return (
    <>
      <NavBar />
        <HomePage/>
      <FooterBar />
    </>
 
  );
}

export default App;
