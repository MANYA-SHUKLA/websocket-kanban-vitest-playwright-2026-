import React from "react";
import KanbanBoard from "./components/KanbanBoard";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Real-time Kanban Board</h1>
      <KanbanBoard />
      <Footer />
    </div>
  );
}

export default App;
