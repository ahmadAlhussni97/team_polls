import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:3000"); // Adjust based on backend URL

export default function PollVote() {

  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [tally, setTally] = useState({});
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    // Fetch poll data
    axios.get(`http://localhost:3000/poll/${pollId}`).then((res) => {

        console.log(res)
      setPoll(res.data);
      setTally(res.data);
    });

    // Join WebSocket room
    socket.emit("join", pollId);

    // Listen for vote updates
    socket.on("vote_update", (delta) => {
      setTally((prev) => ({
        ...prev,
        [delta.option]: (prev[delta.option] || 0) + 1,
      }));
    });

    return () => {
      socket.off("vote_update");
      socket.emit("leave", pollId);
    };
  }, [pollId]);

  const vote = async (option) => {
    if (voted) return;
    const token = localStorage.getItem("jwt");

    await axios.post(
      `http://localhost:3000/poll/${pollId}/vote`,
      { option },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setVoted(true);
  };
  if (!poll) return <p>Loading poll...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold">{poll.question}</h2>
      <ul className="mt-4 space-y-2">
        {poll.options.map((opt) => (
          <li key={opt}>
            <button
              onClick={() => vote(opt)}
              disabled={voted}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded"
            >
              {opt} ({(tally[opt] ?? 0) + (poll.votes?.[opt] ?? 0)})
            </button>
          </li>
        ))}
      </ul>
      {voted && <p className="mt-4 text-green-600">Thanks for voting!</p>}
    </div>
  );
}
