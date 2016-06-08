

var MenuPV = [
		{
			"Nome" : Msg.menu["home"],
			"Image" : Define.menu["home"],
			"ImageSelected" : Define.menu["homeSel"],
			"SubMenu" : [
					{
						"Nome" : Msg.menu["fv"],
						"Image" : Define.menu["fv"],
						"ImageSelected" : Define.menu["fvSel"],
						"Section" : Tracing.CONSUMPTIONS,
						"FuncEnter" : "CostiConsumi.GestFotoVoltaico()",
						"FuncExit" : "CostiConsumi.ExitFotoVoltaico()"
					},
					{
						"Nome" : Msg.menu["consumi"], // Msg.menu["costi"],
						"Image" : Define.menu["consumi"], // Define.menu["costi"],
						"ImageSelected" : Define.menu["consumiSel"], // Define.menu["costiSel"],
						"Section" : Tracing.CONSUMPTIONS,
						"FuncEnter" : "LazyScript.load('js/CostiConsumi3.js?201305315125',function(){CostiConsumi.GestConsumi();})", // "LazyScript.load('js/CostiConsumi2.js',function(){CostiConsumi.GestCosti();})",
						"FuncExit" : "CostiConsumi.ExitConsumi()"
					}, // "CostiConsumi.ExitCosti()" },
					{
						"Nome" : Msg.menu["dispositivi"],
						"Image" : Define.menu["dispositivi"],
						"ImageSelected" : Define.menu["dispositiviSel"],
						"Section" : Tracing.APPLIANCES,
						"FuncEnter" : "LazyScript.load('js/dispositivi/Elettrodomestici2.js?"
								+ Math.random()
								+ "',function(){ Elettrodomestici.GestElettrodomestici();})",
						"FuncExit" : "Elettrodomestici.ExitElettrodomestici()"
					},
					{
						"Nome" : Msg.menu["storico"],
						"Image" : Define.menu["storico"],
						"ImageSelected" : Define.menu["storicoSel"],
						"Section" : Tracing.HISTORY,
						"FuncEnter" : "LazyScript.load('js/Storico.js?201305315125',function(){Storico.GestStorico();})",
						"FuncExit" : "Storico.ExitStorico()"
					} ]
		},
		// "FuncEnter" : "NonDisponibile.GestND()",
		// "FuncExit": "NonDisponibile.ExitND()"}]},
		{
			"Nome" : Msg.menu["config"],
			"Image" : Define.menu["config"],
			"ImageSelected" : Define.menu["configSel"],
			"SubMenu" : [
					{
						"Nome" : Msg.menu["config"],
						"Image" : Define.menu["questionari"],
						"ImageSelected" : Define.menu["questionariSel"],
						// "FuncEnter" :
						// "LazyScript.load('js/registrazione.js?201305315125',function(){Registrazione.Init();})",
						"FuncEnter" : "LazyScript.load('js/iframeConfig.js?201305315125',function(){iFrameConfig.Init();})",
						// "FuncExit": "Registrazione.Exit()"},
						"FuncExit" : "iFrameConfig.Exit()"
					},
					{
						"Nome" : Msg.menu["registrazione"],
						"Image" : Define.menu["questionari"],
						"ImageSelected" : Define.menu["questionariSel"],
						"FuncEnter" : "LazyScript.load('js/registrazione.js?201305315125',function(){Registrazione.Init();})",
						"FuncExit" : "Registrazione.Exit()"
					}, {
						"Nome" : Msg.menu["opzioniLocal"],
						"Image" : Define.menu["opzioniLocal"],
						"ImageSelected" : Define.menu["opzioniLocalSel"],
						"Section" : Tracing.HISTORY,
						// "FuncEnter" :
						// "LazyScript.load('js/iframeoverload.js?201305315125',function(){iFrameOverload.Init();})",
						// "FuncExit": "iFrameOverload.Exit()"}]},
						"FuncEnter" : "NonDisponibile.GestNDUser()",
						"FuncExit" : "NonDisponibile.ExitND()"
					} ]
		},
		{
			"Nome" : Msg.menu["community"],
			"Image" : Define.menu["community"],
			"ImageSelected" : Define.menu["communitySel"],
			"SubMenu" : [ {
				"Nome" : Msg.menu["forum"],
				"Image" : Define.menu["forum"],
				"ImageSelected" : Define.menu["forumSel"],
				"Section" : Tracing.FORUM,
				"FuncEnter" : "LazyScript.load('js/iframeforum.js?n=201305241630',function(){iFrameForum.Init();})",
				"FuncExit" : "iFrameForum.Exit()"
			} ]
		},
		{
			"Nome" : Msg.menu["infotrial"],
			"Image" : Define.menu["infotrial"],
			"ImageSelected" : Define.menu["infotrialSel"],
			"SubMenu" : [
					{
						"Nome" : Msg.menu["informazioni"],
						"Image" : Define.menu["informazioni"],
						"ImageSelected" : Define.menu["informazioniSel"],
						"Section" : Tracing.INFO,
						"FuncEnter" : "LazyScript.load('js/Trial.js?201305315125',function(){Trial.GestInformazioni();})",
						"FuncExit" : "Trial.ExitInformazioni()"
					}, {
						"Nome" : Msg.menu["tariffa"],
						"Image" : Define.menu["tariffa"],
						"ImageSelected" : Define.menu["tariffaSel"],
						"Section" : Tracing.TARIFF,
						"FuncEnter" : "Trial.GestTariffa()",
						"FuncExit" : "Trial.ExitTariffa()"
					} ]
		} ];

var MenuBase = [
		{
			"Nome" : Msg.menu["home"],
			"Image" : Define.menu["home"],
			"ImageSelected" : Define.menu["homeSel"],
			"SubMenu" : [
					{
						"Nome" : Msg.menu["consumi"],
						"Image" : Define.menu["consumi"],
						"ImageSelected" : Define.menu["consumiSel"],
						"Section" : Tracing.CONSUMPTIONS,
						"FuncEnter" : "CostiConsumi.GestConsumi();",
						"FuncExit" : "CostiConsumi.ExitConsumi()"
					},
					{
						"Nome" : Msg.menu["costi"],
						"Image" : Define.menu["costi"],
						"ImageSelected" : Define.menu["costiSel"],
						"Section" : Tracing.COSTS,
						"FuncEnter" : "LazyScript.load('js/CostiConsumi2.js?201305315125',function(){CostiConsumi.GestCosti();})",
						"FuncExit" : "CostiConsumi.ExitCosti()"
					},
					{
						"Nome" : Msg.menu["dispositivi"],
						"Image" : Define.menu["dispositivi"],
						"ImageSelected" : Define.menu["dispositiviSel"],
						"Section" : Tracing.APPLIANCES,
						"FuncEnter" : "LazyScript.load('js/dispositivi/Elettrodomestici2.js?201305315125',function(){ Elettrodomestici.GestElettrodomestici();})",
						"FuncExit" : "Elettrodomestici.ExitElettrodomestici()"
					},
					{
						"Nome" : Msg.menu["storico"],
						"Image" : Define.menu["storico"],
						"ImageSelected" : Define.menu["storicoSel"],
						"Section" : Tracing.HISTORY,
						"FuncEnter" : "LazyScript.load('js/Storico.js?201305315125',function(){Storico.GestStorico();})",
						"FuncExit" : "Storico.ExitStorico()"
					},
					{
						"Nome" : Msg.menu["report"],
						"Image" : Define.menu["questionari"],
						"ImageSelected" : Define.menu["questionariSel"],
						"Section" : Tracing.FORMS,
						"FuncEnter" : "LazyScript.load('js/iframereport.js?201305315125',function(){iFrameReport.Init();})",
						"FuncExit" : "iFrameReport.Exit()"
					} ]
		},
		{
			"Nome" : Msg.menu["config"],
			"Image" : Define.menu["config"],
			"ImageSelected" : Define.menu["configSel"],
			"SubMenu" : [
					{
						"Nome" : Msg.menu["config"],
						"Image" : Define.menu["questionari"],
						"ImageSelected" : Define.menu["questionariSel"],
						// "FuncEnter" :
						// "LazyScript.load('js/registrazione.js?201305315125',function(){Registrazione.Init();})",
						"FuncEnter" : "LazyScript.load('js/iframeConfig.js?201305315125',function(){iFrameConfig.Init();})",
						// "FuncExit": "Registrazione.Exit()"},
						"FuncExit" : "iFrameConfig.Exit()"
					},
					{
						"Nome" : Msg.menu["registrazione"],
						"Image" : Define.menu["questionari"],
						"ImageSelected" : Define.menu["questionariSel"],
						"FuncEnter" : "LazyScript.load('js/registrazione.js?201305315125',function(){Registrazione.Init();})",
						"FuncExit" : "Registrazione.Exit()"
					}, {
						"Nome" : Msg.menu["opzioniLocal"],
						"Image" : Define.menu["opzioniLocal"],
						"ImageSelected" : Define.menu["opzioniLocalSel"],
						"Section" : Tracing.HISTORY,
						// "FuncEnter" :
						// "LazyScript.load('js/iframeoverload.js?201305315125',function(){iFrameOverload.Init();})",
						// "FuncExit": "iFrameOverload.Exit()"}]},
						"FuncEnter" : "NonDisponibile.GestND()",
						"FuncExit" : "NonDisponibile.ExitND()"
					} ]
		},
		{
			"Nome" : Msg.menu["community"],
			"Image" : Define.menu["community"],
			"ImageSelected" : Define.menu["communitySel"],
			"SubMenu" : [ {
				"Nome" : Msg.menu["forum"],
				"Image" : Define.menu["forum"],
				"ImageSelected" : Define.menu["forumSel"],
				"Section" : Tracing.FORUM,
				"FuncEnter" : "LazyScript.load('js/iframeforum.js?201305315125',function(){iFrameForum.Init();})",
				"FuncExit" : "iFrameForum.Exit()"
			} ]
		},
		{
			"Nome" : Msg.menu["infotrial"],
			"Image" : Define.menu["infotrial"],
			"ImageSelected" : Define.menu["infotrialSel"],
			"SubMenu" : [
					{
						"Nome" : Msg.menu["tariffa"],
						"Image" : Define.menu["tariffa"],
						"ImageSelected" : Define.menu["tariffaSel"],
						"Section" : Tracing.TARIFF,
						"FuncEnter" : "LazyScript.load('js/Trial.js?201305315125',function(){Trial.GestTariffa();})",
						"FuncExit" : "Trial.ExitTariffa()"
					}, {
						"Nome" : Msg.menu["informazioni"],
						"Image" : Define.menu["informazioni"],
						"ImageSelected" : Define.menu["informazioniSel"],
						"Section" : Tracing.INFO,
						"FuncEnter" : "Trial.GestInformazioni()",
						"FuncExit" : "Trial.ExitInformazioni()"
					}, {
						"Nome" : Msg.menu["contatti"],
						"Image" : Define.menu["contatti"],
						"ImageSelected" : Define.menu["contattiSel"],
						"Section" : Tracing.CONTACT,
						"FuncEnter" : "Trial.GestContatti()",
						"FuncExit" : "Trial.ExitContatti()"
					}, {
						"Nome" : Msg.menu["questionari"],
						"Image" : Define.menu["questionari"],
						"ImageSelected" : Define.menu["questionariSel"],
						"Section" : Tracing.FORMS,
						"FuncEnter" : "NonDisponibile.GestND()",
						"FuncExit" : "NonDisponibile.ExitND()"
					} ]
		} ];
