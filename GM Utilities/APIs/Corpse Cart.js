var Corpsecart = (function() {	

	const scriptIndex = {"name":"corpsecart","version":"v0.06"};

	//commands
	const comMap = "map";
	const comMapAlias = ["map","bury","dig"];
	const comDel = "del";
	const comDelAlias = ["del","remove","rem","delete"];
	const flagTagDeadAlias = ["tag","look","find","search","flag"];
	const corpseMarker = "status_dead";
	const hpbarNum = "bar1_value";
	const autoBury = true;
	const buryDelayMs = 500;
	const buryMaxRetries = 2;

	const observers = { tokenChange: [] };
	const recentBurials = {};

	class CSS{
		static container = `position: relative; border:1px solid #333; background-color: #fff; padding:4px 6px 6px 6px;margin: -16px -6px 0px -6px;z-index:11;`;
		static text = `font-size:12px;`;
		static bullet = `font-family: Pictos; padding-right: 0.5em;`
		static btnInvis = `vertical-align: middle;color: #000; background-color: transparent; padding: 0; border: none; overflow: hidden; text-overflow: ellipsis; width:100%; margin: 0px;`;
		static icon(type){
			let char = `}`
			let col = `color: `
			switch(type){
				case `up`:
				case `{`:  char = `{`; col += `darkgreen`; break;
				case `#`:
				case `bin`:  char = `#`; col += `darkred`; break;
				case `down`:
				case `}`:
				default: char = `}`; col += `darkred`; break;
			}
			return `<span style="${CSS.bullet}${col}">${char}</span>`
		}
	}

	const isTokenGraphic = (obj) => {
		return obj && obj.get('_type') === 'graphic' && obj.get('_subtype') === 'token';
	};

	const parseStatusMarkerNames = (statusmarkers) => {
		return (statusmarkers || '').split(',').filter(Boolean).map((marker) => {
			return marker.split('@')[0].trim().toLowerCase();
		});
	};

	const markerWasJustApplied = (obj, prev, marker) => {
		marker = (marker || '').toLowerCase();
		if(obj.get(corpseMarker) && !prev[corpseMarker]) return true;
		let now = parseStatusMarkerNames(obj.get('statusmarkers'));
		let was = parseStatusMarkerNames(prev.statusmarkers);
		return now.includes(marker) && !was.includes(marker);
	};

	const isNpcToken = (obj) => {
		if(typeof obj.get !== "function" || obj.get('represents') === undefined || obj.get('represents') === ""){
			return true;
		}
		let character = getObj('character', obj.get('represents'));
		return !character || character.get('controlledby') === "";
	};

	const hasDeadMarker = (token) => {
		if(token.get(corpseMarker)) return true;
		return parseStatusMarkerNames(token.get('statusmarkers')).includes('dead');
	};

	const isCorpseCandidate = (token) => {
		return token.get('represents') !== ""
			&& isNpcToken(token)
			&& parseInt(token.get(hpbarNum), 10) <= 0;
	};

	const isTokenIdArg = (arg) => {
		return arg
			&& /^[-A-Za-z0-9_]+$/.test(arg)
			&& !comMapAlias.includes(arg)
			&& !comDelAlias.includes(arg)
			&& !flagTagDeadAlias.includes(arg);
	};

	const extractTokenId = (rawArgs) => {
		for (let i = 1; i < rawArgs.length; i++) {
			let arg = rawArgs[i];
			if (isTokenIdArg(arg.toLowerCase())) return arg;
		}
		return null;
	};

	const observeTokenChange = (handler) => {
		if(handler && _.isFunction(handler)){
			observers.tokenChange.push(handler);
		}
	};

	const notifyTokenChange = (obj, prev) => {
		_.each(observers.tokenChange, (handler) => {
			handler(obj, prev);
		});
	};

	const handleTokenStatusChange = (obj, prev) => {
		if(!isTokenGraphic(obj)) return;
		notifyTokenChange(obj, prev);
		if(!autoBury) return;
		if(markerWasJustApplied(obj, prev, 'dead') && isNpcToken(obj)){
			scheduleBuryToken(obj.id);
		}
	};

	const handleTokenHpChange = (obj, prev) => {
		if(!isTokenGraphic(obj)) return;
		if(!autoBury || obj.get(hpbarNum) > 0 || prev[hpbarNum] <= 0) return;
		if(isNpcToken(obj)){
			scheduleBuryToken(obj.id);
		}
	};

	//Automatically bury DEAD tokens
	on("change:graphic:statusmarkers", handleTokenStatusChange);
	on("change:graphic:bar1_value", handleTokenHpChange);

	function tryBuryToken(token, announce=true){
		if(!token || !isTokenGraphic(token) || !isNpcToken(token)) return false;
		if(token.get('layer') === 'map') return true;
		if(!hasDeadMarker(token) && !isCorpseCandidate(token)) return false;
		if(recentBurials[token.id] && (Date.now() - recentBurials[token.id]) < buryDelayMs * 4) return true;

		recentBurials[token.id] = Date.now();
		if(!hasDeadMarker(token)) token.set(corpseMarker, true);
		log(`Burying away: ${token.get("name")}`);
		token.set({layer:"map",tint_color:"000000"});
		if(announce){
			let msgContents = msgConstructor(`Buried ${token.get("name")}.`,`down`,[token.id]);
			chatter(msgContents,`w`,`gm`,`noarchive`);
		}
		return true;
	}

	function scheduleBuryToken(tokenId){
		setTimeout(() => {
			tryBuryToken(getObj('graphic', tokenId), true);
		}, buryDelayMs);
	}

	function msgConstructor(txt,icon=`bin`,ids=false){
		let html = ``
		html += `<div class="whohidder" style="${CSS.container}">`
		html += ids ? `<a style="${CSS.btnInvis}" href="!corpsecart undo ${String(ids)}">` : `` ;
		html += CSS.icon(icon)
		html += `<span style="${CSS.text}">`
		html += txt
		html += `</span>`
		html += ids ? `</a>` : `` ;
		html += `</div>`
		return html
	}

	//FIND CORPSES WHO DON'T REALISE IT
	function tagDead(mapID){
		['objects', 'map'].forEach((layer) => {
			findObjs({
				_type:"graphic",
				_subtype: "token",
				layer: layer,
				_pageid: mapID,
			}).filter((token) => !hasDeadMarker(token) && isCorpseCandidate(token))
				.forEach((token) => token.set(corpseMarker, true));
		});
	}

	function collectCorpseTokens(mapID, corpseCom){
		let corpseTokens = findObjs({
			_type:"graphic",
			_subtype: "token",
			layer: "objects",
			_pageid: mapID,
		}).filter((token) => hasDeadMarker(token) && token.get('represents') !== "" && isNpcToken(token));

		if (corpseCom === comDel){
			let corpseTokensMap = findObjs({
				_type:"graphic",
				_subtype: "token",
				status_dead : true,
				layer: "map",
				_pageid: mapID,
			}).filter((token) => hasDeadMarker(token) && token.get('represents') !== "" && isNpcToken(token));
			corpseTokens = corpseTokens.concat(corpseTokensMap);
		}

		return corpseTokens;
	}

	//FIND CORPSES TO DEL OR MAP
	function findCorpses(mapID,corpseCom,retryCount=0,quiet=false){
		let corpseTokens = collectCorpseTokens(mapID, corpseCom);

		if (corpseTokens.length === 0){
			if(retryCount < buryMaxRetries){
				setTimeout(() => {
					tagDead(mapID);
					findCorpses(mapID, corpseCom, retryCount + 1, quiet);
				}, buryDelayMs);
				return;
			}
			if(!quiet){
				sendChat("Corpse Cart", "/w gm No corpses found to cart.",null,{noarchive:true})
			}
			return;
		}
			let msgtext = ``;
			let ids = false;
			let names = ``;
			let i = 1;
			for(let corpse of corpseTokens){
				if(corpseTokens.length > 1 && i !== 1){
					if(corpseTokens.length > 2){
						names += `,`
					}
					if(i === corpseTokens.length){
						names += ` and`
					}
					names += ` ${corpse.get("name")}`
				}
				else{
					names += ` ${corpse.get("name")}`
				}
				i++;
			}
			msgtext += `.`
			if(corpseCom == comDel){
				corpseTokens.forEach(deleteCorpses);
				msgtext = `Carted away ${names}`;
				chatter(msgConstructor(msgtext,`bin`,ids),`w`,`gm`,`noarchive`)
			}
			else if(corpseCom == comMap){
				ids = [];
				corpseTokens.forEach(t => {ids.push(t.id)});
				corpseTokens.forEach(buryCorpses);
				msgtext = `Buried ${names}`;
				chatter(msgConstructor(msgtext,`down`,ids),`w`,`gm`,`noarchive`)
			}
	}

	function buryTokenById(tokenId){
		scheduleBuryToken(tokenId);
		return true;
	}

	function runTagAndCorpsePass(mapID, corpseCom, tokenId, retryCount=0){
		if(tokenId){
			scheduleBuryToken(tokenId);
			return;
		}
		tagDead(mapID);
		findCorpses(mapID, corpseCom, retryCount, false);
	}

	//DELETE CORPSES
	function deleteCorpses(body) {
		log("Carting away: "+body.get('name'));
		body.remove();
	}

	//BURY CORPSES
	function buryCorpses(body){
		tryBuryToken(body, false);
	}

	function tagAndBuryDeadOnPage(mapID, tokenId){
		setTimeout(() => runTagAndCorpsePass(mapID, comMap, tokenId, 0), buryDelayMs);
	}

	//undo
	function undoBurial(ids){
		ids = ids.split(",")
		let msgtext = `Undid burial of`;
		let i = 1;
		for(let id of ids){
			let token = getObj('graphic',id);
			token.set({layer:"objects",tint_color:"transparent"});
			if(ids.length > 1 && i !== 1){
				if(ids.length > 2){
					msgtext += `,`
				}
				if(i === ids.length){
					msgtext += ` and`
				}
				msgtext += ` ${token.get("name")}`
			}
			else{
				msgtext += ` ${token.get("name")}`
			}
			i++;
		}
		msgtext += `.`
		let msgContents = msgConstructor(msgtext,`up`);
		chatter(msgContents,`w`,`gm`,`noarchive`)
	}

	const isScriptCallableCommand = (args) => {
		if(!args || !args.length) return false;
		return comMapAlias.includes(args[0]) && args.some(arg => flagTagDeadAlias.includes(arg));
	};
		
	on("chat:message", function(msg) {
		if (msg.type!=="api" || msg.content.toLowerCase().indexOf("!corpsecart")!==0){
			return;
		}
		let args = msg.content.toLowerCase().split(/\s+/);
		args.shift();
		if(!playerIsGM(msg.playerid) && !isScriptCallableCommand(args)){
			return;
		}
		Chandler(msg);
	});

	//API CHAT HANDLER
	function Chandler(msg){
		let rawArgs = msg.content.split(/\s+/);
		rawArgs.shift();
		let args = rawArgs.map((arg) => arg.toLowerCase());
		
		if (args == undefined || args.length == 0){
			return;
		}
		
		var corpseCom = args[0];
		var tokenId = extractTokenId(rawArgs);
		
		var flagTagDead = false;
		args.some(arg => flagTagDeadAlias.includes(arg)) ? flagTagDead = true : false ;
		
		comMapAlias.includes(corpseCom) ? corpseCom = comMap : false ;
		comDelAlias.includes(corpseCom) ? corpseCom = comDel : false ;
		
		var mapID = Campaign().get("playerpageid");

		switch(corpseCom){
			case comMap:
				if(flagTagDead || tokenId){
					setTimeout(() => runTagAndCorpsePass(mapID, corpseCom, tokenId, 0), buryDelayMs);
				}else{
					findCorpses(mapID,corpseCom)
				}
				break;
			case comDel:
				if(flagTagDead || tokenId){
					setTimeout(() => runTagAndCorpsePass(mapID, corpseCom, tokenId, 0), buryDelayMs);
				}else{
					findCorpses(mapID,corpseCom)
				}
				break;
			case `undo`:
				let ids=msg.content.split(/\s+/)[2]
				undoBurial(ids)
				break;
			default:
				return;
		}
	};

	//error handler
	function errorHandler(errorMsg,who,useChat,useLog){
		useLog === false ? log(errorMsg) : false;
		useChat === false ? sendChat(`${scriptIndex.name} Error`,errorMsg,null,{noarchive:true}) : false;
		useLog === true ? logger(errorMsg) : false;
		useChat === true ? chatter(errorMsg,"w",who,"noarchive") : false;
		return;
	}

	//log stuff
    function logger(logtext){
        log(scriptIndex.name+", "+scriptIndex.version+": "+logtext);
    };

	//chat bullocks
    function chatter(msgText,slashCom,whisperTo,options,spkAs){
		if(slashCom && slashCom.toLowerCase() == "w"){
			if(typeof whisperTo === "string"){
				whisperTo = whisperTo.replace(/\(GM\)/, '').trim();
				slashCom = slashCom.concat(` ${whisperTo}`);
			}
			else if(Array.isArray(whisperTo)){
				if(whisperTo[0].toLowerCase() == "character"){
					switch(whisperTo[1].get("controlledby")){
						//whispering to everyone, DOH! change to public
						case "all":
							slashCom = "";
							whisperTo = "";
							break;
						//whispering to no one, change to GM
						case "":
							whisperTo = "gm";
							slashCom = slashCom.concat(` ${whisperTo}`);
							break;
						//whispering we hope to a name? go ahead
						default:
							whisperTo = `"${whisperTo[1].get("name")}"`;
							slashCom = slashCom.concat(` ${whisperTo}`);
							break;
					}
				}
				else{
					logger("whisper target not recognised as string or tagged array object");
					return;
				}
			}
		}

        let msgContents = "";
        spkAs ? false : spkAs = scriptIndex.name ;
        if(slashCom){
			msgContents = msgContents.concat(`/${slashCom}`);
		}
        msgText ? msgContents = msgContents.concat(` ${msgText}`) : logger("chat request but no msgText specified") ;
        options == "noarchive" ? options = {noarchive:true} : false ;
        sendChat(spkAs,msgContents,null,options);
    };

	return {
		...scriptIndex,
		ObserveTokenChange: observeTokenChange,
		TagAndBuryDeadOnPage: tagAndBuryDeadOnPage,
		BuryToken: buryCorpses,
		BuryTokenById: buryTokenById,
		IsNpcToken: isNpcToken
	};
})();