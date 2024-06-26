var express = require('express');
var router = express.Router();

const pool = require('../../db.js');

const { checkAuthenticated } = require('../../middleware.js');

router.get('/voted', checkAuthenticated, function (req, res) {
  const userId = req.user.user_id;

  pool.query(
    'SELECT DISTINCT poll_id, Votes.option_id ' +
      'FROM Votes, Options ' +
      'WHERE Votes.option_id = Options.option_id ' +
      'AND user_id = ?',
    [userId],
    (error, results) => {
      if (error) {
        console.error(`Error fetching polls voted on by user ${userId}`, error);
        res.status(500).send('Error fetching polls voted on');
        return;
      }
      res.json(results);
    },
  );
});

router.get('/:pollId', function (req, res) {
  const pollId = req.params.pollId;
  pool.query(
    'SELECT Options.option_id, Options.option_text, COUNT(Votes.vote_id) as vote_count ' +
      'FROM Options ' +
      'LEFT JOIN Votes ON Options.option_id = Votes.option_id ' +
      'WHERE Options.poll_id = ? ' +
      'GROUP BY Options.option_id',
    [pollId],
    (error, results) => {
      if (error) {
        console.error(`Error fetching votes for poll ${pollId}`, error);
        res.status(500).send('Error fetching votes');
        return;
      }
      res.json(results);
    },
  );
});

//GET user_id of user who voted for option option_id
router.get('/:optionId/users', function (req, res) {
  const optionId = req.params.optionId;
  pool.query('SELECT user_id FROM Votes WHERE option_id = ?', [optionId], (error, results) => {
    if (error) {
      console.error(`Error get users who voted for option ${optionId}`, error);
      res.status(500).send(`Error get users who voted for option ${optionId}`);
      return;
    }
    res.json(results);
  });
});

router.post('/', checkAuthenticated, function (req, res) {
  const userId = req.user.user_id;
  const optionId = req.body.option_id;

  pool.query(
    'INSERT INTO Votes (user_id, option_id) VALUES (?, ?)',
    [userId, optionId],
    (error, results) => {
      if (error) {
        console.error(`Error when user ${userId} is voting for option ${optionId}`, error);
        return res.status(500).send('Error recording your vote');
      }
      res.status(201).send({
        message: 'Vote successfully recorded',
        voteId: results.insertId,
      });
    },
  );
});

//DELETE a vote (If user undo a vote)
router.delete('/:voteId', checkAuthenticated, function (req, res) {
  const voteId = req.params.voteId;
  pool.query('DELETE FROM Votes WHERE vote_id = ?', [voteId], (error, results) => {
    if (error) {
      console.error(`Error deleting vote`, error);
      res.status(500).send(`Error deleting vote`);
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send('Vote not found');
    } else {
      res.send(`Vote deleted successfully`);
    }
  });
});
module.exports = router;
