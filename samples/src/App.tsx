import { useState } from "react";
import SideNavigation from "./components/SideNavigation";

function App() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="App">
      <SideNavigation isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
    </div>
  );
}

export default App;
