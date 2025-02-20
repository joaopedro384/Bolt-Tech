var express = require('express');
var router = express.Router();
var sequelize = require('../models').sequelize;
var Leitura = require('../models').Leitura;
var env = process.env.NODE_ENV || 'development';

/* Recuperar as últimas N leituras */
router.get('/ultimas/:idSensor', function (req, res, next) {

	// quantas são as últimas leituras que quer? 7 está bom?
	const limite_linhas = 10;

	var idSensor = req.params.idSensor;

	console.log(`Recuperando as ultimas ${limite_linhas} leituras`);

	let instrucaoSql = "";

	if (env == 'dev') {
		// abaixo, escreva o select de dados para o Workbench
		instrucaoSql = `select 
		temperatura, 
		momento,
		DATE_FORMAT(momento,'%H:%i:%s') as momento_grafico
		from leitura
		where fkSensor = ${idSensor}
		order by idTemp desc limit ${limite_linhas}`;
	} else if (env == 'production') {
		// abaixo, escreva o select de dados para o SQL Server
		instrucaoSql = `select top ${limite_linhas} 
		temperatura, 
		 
		momento,
		FORMAT(momento,'HH:mm:ss') as momento_grafico
		from leitura
		where fkSensor = ${idSensor}
		order by idTemp desc`;
	} else {
		console.log("\n\n\n\nVERIFIQUE O VALOR DE LINHA 1 EM APP.JS!\n\n\n\n")
	}

	sequelize.query(instrucaoSql, {
		model: Leitura,
		mapToModel: true
	})
		.then(resultado => {
			console.log(`Encontrados: ${resultado.length}`);
			res.json(resultado);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});


router.get('/tempo-real/:idSensor', function (req, res, next) {
	console.log('Recuperando caminhões');

	//var idSensor = req.body.form_login; // depois de .body, use o nome (name) do campo em seu formulário de login
	var idSensor = req.params.idSensor;

	let instrucaoSql = "";

	if (env == 'dev') {
		// abaixo, escreva o select de dados para o Workbench
		instrucaoSql = `select temperatura, DATE_FORMAT(momento,'%H:%i:%s') as momento_grafico, fkSensor from leitura where fkSensor = ${idSensor} order by idTemp desc limit 1`;
	} else if (env == 'production') {
		// abaixo, escreva o select de dados para o SQL Server
		instrucaoSql = `select top 1 temperatura,  FORMAT(momento,'HH:mm:ss') as momento_grafico, fkSensor from leitura where fkSensor = ${idSensor} order by idTemp desc`;
	} else {
		console.log("\n\n\n\nVERIFIQUE O VALOR DE LINHA 1 EM APP.JS!\n\n\n\n")
	}

	console.log(instrucaoSql);

	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.SELECT })
		.then(resultado => {
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});

// estatísticas (max, min, média, mediana, quartis etc)
router.get('/estatisticas', function (req, res, next) {

	console.log(`Recuperando as estatísticas atuais`);

	const instrucaoSql = `select 
							max(temperatura) as temp_maxima, 
							min(temperatura) as temp_minima, 
							avg(temperatura) as temp_media,
						from leitura`;


	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.SELECT })
		.then(resultado => {
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});

});


module.exports = router;
