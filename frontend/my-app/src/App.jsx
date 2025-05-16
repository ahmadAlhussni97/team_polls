// App.jsx
import  { useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import CreatePoll from './CreatePoll';
import PollVote from './PollVote';

function App() {
  useEffect(() => {
     axios.post("http://localhost:3000/auth/anon").then((res) => {
        localStorage.setItem("jwt", res.data.token);
      });
  }, []);

  return (
    <div>
      <h1>Team Polls Interface</h1>
      <nav>
        <Link to="/create">Create Poll</Link> |{" "}
        <Link to="/vote/07fd4b68-114c-4469-ad19-efd4c9747d78">Vote</Link>
      </nav>
  
      <Routes>
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/vote/:pollId" element={<PollVote />} />
      </Routes>
    </div>
  );
}

export default App;
