import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000"); // Update to match backend

export default function LivePollProgressBar({ pollId }) {
  const [poll, setPoll] = useState(null);
  const [tally, setTally] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    // Fetch poll and initial tally
    axios.get(`http://localhost:3000/poll/${pollId}`).then((res) => {
      const { poll, tally } = res.data;
      setPoll(poll);
      setTally(tally);
      setTotalVotes(Object.values(tally).reduce((a, b) => a + b, 0));
    });

    socket.emit("join", `poll:${pollId}`);

    socket.on("vote_update", ({ option, delta }) => {
      setTally((prev) => {
        const updated = {
          ...prev,
          [option]: (prev[option] || 0) + delta,
        };
        setTotalVotes(
          Object.values(updated).reduce((a, b) => a + b, 0)
        );
        return updated;
      });
    });

    return () => {
      socket.emit("leave", `poll:${pollId}`);
      socket.off("vote_update");
    };
  }, [pollId]);

  if (!poll) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{poll.question}</h2>
      {poll.options.map((opt) => {
        const count = tally[opt] || 0;
        const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        return (
          <div key={opt} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{opt}</span>
              <span className="text-sm text-gray-600">{count} votes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-4 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
