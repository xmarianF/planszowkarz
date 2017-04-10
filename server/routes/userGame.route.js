var express = require('express');
var router = express.Router();
var userGame = require('../models/userGame.model');

router.route('/userGames')
	// get all games
	.get((req,res) => {
		userGame.find((err,games) => {
			if(err){
				return res.status(400).json({message: "Bad Requested"});
			}else{
				return res.status(200).json(games);
			}
		});
	})
	// post new game
	.post((req,res) => {
		var newGame = new userGame({
			title: req.body.title,
			description: req.body.description,
			userID: req.body.userID
		});
		// save the game
		newGame.save((err) => {
			if (err){
				return res.status(409).json({message: 'Wrong game'});
			} else {
				return res.status(201).json(newGame);
			}
		});
	});

router.route('/userGames/:id')
	.get((req, res) => {
		userGames.findById(req.params.id, (err, game) => {
			if(err){
				return res.status(400).json({message: "Bad Requested"});
			} else if(!game){
				return res.status(404).json({message: "Game not Found"});
			} else {
				return res.status(200).json(game);
			}
		});
	})

	.patch((req, res) => {
		userGame.findByIdAndUpdate({_id: req.params.id}, req.body, (err, game) => {
			if(err){
				return res.status(400).json({message: "Bad Requested"});
			} else if(!game){
				return res.status(404).json({message: "Game not Found"});
			} else {
				return res.status(200).json(game);
			}
		});
	})

	.delete((req, res) => {
		userGame.findById(req.params.id, (err, game) => {
			if(err){
				return res.status(400).json({message: "Bad Requested"});
			} else if(!game){
				return res.status(404).json({message: "Game not Found"});
			} else {
				userGame.remove({_id: req.params.id}, (err, game) => {
					if(err) {
						return res.status(400).json({message: "Bad Requested"});
					} else {
						return res.status(204).end();
					}
				});
			}
		})
	});

module.exports = router;