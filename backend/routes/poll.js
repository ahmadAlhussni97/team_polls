const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateJWT = require("../middlewares/auth");
const rateLimitPerUser = require("../middlewares/rateLimiter");

// Apply only to vote route
// router.post('/:id/vote', authenticateJWT,rateLimitPerUser, async (req, res) => {
//   const pollId = req.params.id;
//   const user = req.user; // You now have access to token data here

//   res.status(200).json({ message: `Vote accepted from ${user.sub}` });
// });

router.post("/", async (req, res) => {
  const { question, options, expiresAt } = req.body;

  if (
    !question ||
    !Array.isArray(options) ||
    options.length < 2 ||
    !expiresAt
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const result = await db.query(
      `INSERT INTO polls (question, options, expires_at) 
       VALUES ($1, $2, $3) RETURNING id`,
      [question, JSON.stringify(options), expiresAt]
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error("Error creating poll:", err);
    res.status(500).json({ error: "Failed to create poll" });
  }
});

router.post(
  "/:id/vote",
  authenticateJWT,
  rateLimitPerUser,
  async (req, res) => {
    const pollId = req.params.id;
    const userId = req.user.sub;
    const { option } = req.body;

    try {
      const poll = await db.query(
        `SELECT * FROM polls WHERE id = $1 AND expires_at > NOW()`,
        [pollId]
      );

      if (poll.rowCount === 0)
        return res.status(404).json({ error: "Poll not found or expired" });

      const validOptions = poll.rows[0].options;
      if (!validOptions.includes(option))
        return res.status(400).json({ error: "Invalid option" });

      await db.query(
        `INSERT INTO votes (poll_id, user_id, option)
       VALUES ($1, $2, $3)
       ON CONFLICT (poll_id, user_id) DO UPDATE SET option = EXCLUDED.option`,
        [pollId, userId, option]
      );

      // Get Socket.IO instance
      const io = req.app.get("io");

      // Query updated count for this option only (the delta)
      const countResult = await db.query(
        `SELECT COUNT(*) as count
       FROM votes
       WHERE poll_id = $1 AND option = $2`,
        [pollId, option]
      );

      const updatedCount = parseInt(countResult.rows[0].count, 10);

      // Broadcast delta update to the poll room
      io.to(`poll/${pollId}`).emit("vote_update", {
        option,
        count: updatedCount,
      });

      // Respond success
      res.json({ success: true });
    } catch (err) {
      console.error("Vote error:", err);
      res.status(500).json({ error: "Failed to vote" });
    }
  }
);

router.get("/:id", async (req, res) => {
  const pollId = req.params.id;

  try {
    const poll = await db.query(
      `SELECT * FROM polls WHERE id = $1 AND expires_at > NOW()`,
      [pollId]
    );
    if (poll.rowCount === 0)
      return res.status(404).json({ error: "Poll not found" });

    const voteCounts = await db.query(
      `SELECT option, COUNT(*) as count 
       FROM votes 
       WHERE poll_id = $1 
       GROUP BY option`,
      [pollId]
    );

    const votes = {};
    voteCounts.rows.forEach((row) => {
      votes[row.option] = parseInt(row.count);
    });

    res.json({
      id: poll.rows[0].id,
      question: poll.rows[0].question,
      options: poll.rows[0].options,
      votes,
    });
  } catch (err) {
    console.error("Fetch poll error:", err);
    res.status(500).json({ error: "Failed to fetch poll" });
  }
});

module.exports = router;
