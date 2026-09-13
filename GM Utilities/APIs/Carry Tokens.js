/*
 * Carry Tokens — Farsidegallery patch
 * Based on Ada Lindberg's Carry Tokens v2.0.1 (Roll20 One-Click)
 * https://github.com/Roll20/roll20-api-scripts/tree/master/CarryTokens/2.0.1
 *
 * v2.0.2-farside: Store carry relationships in state (token ids), not on Graphic
 * objects. Roll20's graphic Proxy rejects custom properties (carryList / carriedBy),
 * which broke !CARRY_TOKENS_CARRY_BELOW from ScriptCards.
 * v2.0.3-farside: Default state.carrytokens.useroptions.allowPlayerUse to on (no One-Click toggle).
 * v2.0.4-farside: Fix follow — change:graphic like stock; only sync-mark carried tokens; snap on carry.
 * v2.0.5-farside: Clearer missing-token errors; fix duplicate carrierId declaration in _carry.
 * v2.0.6-farside: Retry carry when tokens are not in the API yet (ScriptCards spawn race).
 *
 * Replace the One-Click Carry Tokens mod with this file. Requires HTML Builder.
 * Command interface unchanged: !CARRY_TOKENS_CARRY_BELOW, etc.
 */
var CarryTokens = (() => {
	'use strict';

	const VERSION = '2.0.6-farside';
	const STATE_KEY = 'carrytokens';

	const CARRY_MENU_CMD = '!CARRY_TOKENS_MENU';
	const CARRY_ABOVE_CMD = '!CARRY_TOKENS_CARRY_ABOVE';
	const CARRY_BELOW_CMD = '!CARRY_TOKENS_CARRY_BELOW';
	const DROP_ONE_CMD = '!CARRY_TOKENS_DROP_ONE';
	const DROP_ALL_CMD = '!CARRY_TOKENS_DROP_ALL';

	const SYNC_CLEAR_MS = 250;
	let syncingTokenIds = {};

	const MENU_CSS = {
		'centeredBtn': {
			'text-align': 'center'
		},
		'menu': {
			'background': '#fff',
			'border': 'solid 1px #000',
			'border-radius': '5px',
			'font-weight': 'bold',
			'margin-bottom': '1em',
			'overflow': 'hidden'
		},
		'menuBody': {
			'padding': '5px',
			'text-align': 'center'
		},
		'menuHeader': {
			'background': '#000',
			'color': '#fff',
			'text-align': 'center'
		}
	};

	const ensureState = () => {
		state[STATE_KEY] = state[STATE_KEY] || {};
		state[STATE_KEY].carries = state[STATE_KEY].carries || {};
		state[STATE_KEY].carriedBy = state[STATE_KEY].carriedBy || {};
		state[STATE_KEY].useroptions = state[STATE_KEY].useroptions || {};
		if (_.isUndefined(state[STATE_KEY].useroptions.allowPlayerUse)) {
			state[STATE_KEY].useroptions.allowPlayerUse = '1';
		}
	};

	const tokenId = (graphic) => {
		return graphic && typeof graphic.get === 'function' ? graphic.get('_id') : null;
	};

	const getGraphic = (id) => {
		return id ? getObj('graphic', id) : null;
	};

	const isToken = (graphic) => {
		return graphic && graphic.get('_subtype') === 'token';
	};

	const getCarriedIds = (carrierId) => {
		ensureState();
		return (state[STATE_KEY].carries[carrierId] || []).slice();
	};

	const getCarriedById = (carriedId) => {
		ensureState();
		return state[STATE_KEY].carriedBy[carriedId] || null;
	};

	const coordEq = (a, b) => {
		return parseInt(a, 10) === parseInt(b, 10);
	};

	const parseCommandIds = (msg) => {
		let argv = msg.content.trim().split(/\s+/);
		return {
			carrierId: argv[1],
			targetId: argv[2]
		};
	};

	const CARRY_RETRY_DELAY_MS = 300;
	const CARRY_RETRY_MAX = 10;

	const isLikelyTokenId = (id) => {
		return typeof id === 'string' && /^-/.test(id);
	};

	const runCarryWithRetry = (msg, attempt, carryFn) => {
		Commands._enforcePermission(msg.playerid);

		let ids = parseCommandIds(msg);
		let carrier = getGraphic(ids.carrierId);
		let target = getGraphic(ids.targetId);

		if (carrier && target) {
			carryFn(carrier, target, ids.carrierId, ids.targetId);
			return;
		}

		if (
			attempt < CARRY_RETRY_MAX
			&& isLikelyTokenId(ids.carrierId)
			&& isLikelyTokenId(ids.targetId)
		) {
			setTimeout(() => runCarryWithRetry(msg, attempt + 1, carryFn), CARRY_RETRY_DELAY_MS);
			return;
		}

		carryFn(carrier, target, ids.carrierId, ids.targetId);
	};

	const graphicMoved = (obj, prev) => {
		if (!prev) {
			return true;
		}
		return !coordEq(obj.get('left'), prev.left)
			|| !coordEq(obj.get('top'), prev.top)
			|| !coordEq(obj.get('rotation'), prev.rotation);
	};

	const snapCarriedToken = (carrier, carried) => {
		if (!carrier || !carried) {
			return;
		}
		let carriedId = tokenId(carried);
		carried.set({
			left: carrier.get('left'),
			top: carrier.get('top'),
			rotation: carrier.get('rotation')
		});
		markSyncing([carriedId]);
	};

	const markSyncing = (ids) => {
		_.each(ids, (id) => {
			if (id) {
				syncingTokenIds[id] = true;
			}
		});
		setTimeout(() => {
			_.each(ids, (id) => {
				delete syncingTokenIds[id];
			});
		}, SYNC_CLEAR_MS);
	};

	const isSyncing = (id) => {
		return !!syncingTokenIds[id];
	};

	const removeCarriedId = (carrierId, carriedId) => {
		ensureState();
		let list = state[STATE_KEY].carries[carrierId];
		if (!list) {
			return;
		}
		state[STATE_KEY].carries[carrierId] = _.without(list, carriedId);
		if (state[STATE_KEY].carries[carrierId].length === 0) {
			delete state[STATE_KEY].carries[carrierId];
		}
		delete state[STATE_KEY].carriedBy[carriedId];
	};

	const purgeTokenFromState = (id) => {
		if (!id) {
			return;
		}
		ensureState();

		let carrierId = getCarriedById(id);
		if (carrierId) {
			removeCarriedId(carrierId, id);
		}

		_.each(getCarriedIds(id), (carriedId) => {
			delete state[STATE_KEY].carriedBy[carriedId];
		});
		delete state[STATE_KEY].carries[id];
	};

	/**
	 * Handlers for chat commands
	 */
	class Commands {
		static carryAbove(msg) {
			runCarryWithRetry(msg, 0, carryAbove);
		}

		static carryBelow(msg) {
			runCarryWithRetry(msg, 0, carryBelow);
		}

		static dropOne(msg) {
			Commands._enforcePermission(msg.playerid);

			let argv = msg.content.split(' ');
			let carrier = getGraphic(argv[1]);
			let name = argv.slice(2).join(' ');

			if (!carrier) {
				throw new Error('Carrier token not found.');
			}

			let target = findObjs({
				_type: 'graphic',
				_pageid: carrier.get('_pageid'),
				name
			})[0];

			if (!target) {
				throw new Error(`Token ${name} not found.`);
			}

			drop(carrier, target);
		}

		static dropAll(msg) {
			Commands._enforcePermission(msg.playerid);

			let argv = msg.content.split(' ');
			let carrier = getGraphic(argv[1]);

			dropAll(carrier);
		}

		static _enforcePermission(playerId) {
			let allowPlayerUse = getOption('allowPlayerUse');
			let hasPermission = allowPlayerUse || _.isUndefined(allowPlayerUse) || playerIsGM(playerId);

			if (!hasPermission) {
				throw new Error(`Player ${playerId} tried to use a restricted part of this script without permission.`);
			}
		}

		static showMenu(msg) {
			Commands._enforcePermission(msg.playerid);
			_showMenu(msg.playerid);
		}
	}

	const _requireTokens = (carrier, target, carrierId, targetId) => {
		if (!carrier || !target) {
			throw new Error(
				'Carrier or target token not found.'
				+ ` (carrier id: ${carrierId || 'missing'}, target id: ${targetId || 'missing'})`
			);
		}
		if (!isToken(carrier) || !isToken(target)) {
			let carrierSub = carrier && carrier.get('_subtype');
			let targetSub = target && target.get('_subtype');
			throw new Error(
				'Carrier and target must be token graphics.'
				+ ` (carrier subtype: ${carrierSub || 'n/a'}, target subtype: ${targetSub || 'n/a'})`
			);
		}
	};

	function _carry(carrier, target, carrierIdHint, targetIdHint) {
		let carrierId = carrierIdHint || tokenId(carrier);
		let targetId = targetIdHint || tokenId(target);
		_requireTokens(carrier, target, carrierId, targetId);

		if (carrierId === targetId) {
			return;
		}

		let existingCarrierId = getCarriedById(targetId);
		if (existingCarrierId && existingCarrierId !== carrierId) {
			removeCarriedId(existingCarrierId, targetId);
		}

		ensureState();
		let list = state[STATE_KEY].carries[carrierId] || [];
		if (!_.contains(list, targetId)) {
			list.push(targetId);
			state[STATE_KEY].carries[carrierId] = list;
		}
		state[STATE_KEY].carriedBy[targetId] = carrierId;
	}

	function carryAbove(carrier, target, carrierIdHint, targetIdHint) {
		_carry(
			carrier,
			target,
			carrierIdHint || tokenId(carrier),
			targetIdHint || tokenId(target)
		);
		toFront(target);
		snapCarriedToken(carrier, target);
	}

	function carryBelow(carrier, target, carrierIdHint, targetIdHint) {
		_carry(
			carrier,
			target,
			carrierIdHint || tokenId(carrier),
			targetIdHint || tokenId(target)
		);
		toBack(target);
		snapCarriedToken(carrier, target);
	}

	function drop(carrier, target) {
		if (!carrier || !target) {
			return;
		}
		removeCarriedId(tokenId(carrier), tokenId(target));
	}

	function dropAll(carrier) {
		if (!carrier) {
			return;
		}
		_.each(getCarriedIds(tokenId(carrier)), (carriedId) => {
			delete state[STATE_KEY].carriedBy[carriedId];
		});
		delete state[STATE_KEY].carries[tokenId(carrier)];
	}

	function _fixWho(who) {
		return who.replace(/\(GM\)/g, '').trim();
	}

	function getCarriedTokens(carrier) {
		return _.compact(_.map(getCarriedIds(tokenId(carrier)), getGraphic));
	}

	function getOption(name) {
		ensureState();
		if (name === 'allowPlayerUse') {
			let value = state[STATE_KEY].useroptions.allowPlayerUse;
			if (value === '0' || value === 0 || value === false) {
				return false;
			}
			return '1';
		}
		let options = globalconfig && globalconfig.carrytokens;
		if (!options) {
			options = state[STATE_KEY].useroptions || {};
		}
		return options[name];
	}

	function moveCarriedTokens(carrier) {
		if (!carrier) {
			return;
		}

		let carrierId = tokenId(carrier);
		let carriedIds = getCarriedIds(carrierId);
		if (carriedIds.length === 0) {
			return;
		}

		let left = carrier.get('left');
		let top = carrier.get('top');
		let rotation = carrier.get('rotation');
		let syncIds = [];

		_.each(carriedIds, (carriedId) => {
			let carried = getGraphic(carriedId);
			if (!carried) {
				removeCarriedId(carrierId, carriedId);
				return;
			}
			syncIds.push(carriedId);
			carried.set({
				left: left,
				top: top,
				rotation: rotation
			});
			moveCarriedTokens(carried);
		});

		if (syncIds.length > 0) {
			markSyncing(syncIds);
		}
	}

	function _showMenu(playerid) {
		let content = new HtmlBuilder('div');
		content.append('.centeredBtn').append('a', 'Carry Above', {
			href: `${CARRY_ABOVE_CMD} @{selected|token_id} @{target|token_id}`,
			title: 'Make selected token carry target token on top.'
		});
		content.append('.centeredBtn').append('a', 'Carry Below', {
			href: `${CARRY_BELOW_CMD} @{selected|token_id} @{target|token_id}`,
			title: 'Make selected token carry target token underneath.'
		});
		content.append('.centeredBtn').append('a', 'Drop by Name', {
			href: `${DROP_ONE_CMD} @{selected|token_id} ?{Drop token name:}`,
			title: 'Make selected token drop a carried token.'
		});
		content.append('.centeredBtn').append('a', 'Drop All', {
			href: `${DROP_ALL_CMD} @{selected|token_id}`,
			title: 'Make selected token drop all carried tokens.'
		});

		let menu = _showMenuPanel('Carry Tokens', content);
		let player = getObj('player', playerid);
		_whisper(player, menu.toString(MENU_CSS));
	}

	function _showMenuPanel(header, content) {
		let menu = new HtmlBuilder('.menu');
		menu.append('.menuHeader', header);
		menu.append('.menuBody', content);
		return menu;
	}

	function _whisper(player, msg) {
		let who = player.get('_displayname');
		sendChat('Carry Tokens', '/w "' + _fixWho(who) + '" ' + msg);
	}

	const handleGraphicMove = (obj) => {
		if (!obj || obj.get('_subtype') !== 'token') {
			return;
		}

		let id = tokenId(obj);
		if (isSyncing(id)) {
			return;
		}

		let carrierId = getCarriedById(id);
		if (carrierId) {
			let carrier = getGraphic(carrierId);
			if (carrier) {
				let draggedAway = !coordEq(obj.get('left'), carrier.get('left'))
					|| !coordEq(obj.get('top'), carrier.get('top'));
				if (draggedAway) {
					removeCarriedId(carrierId, id);
				}
			} else {
				removeCarriedId(carrierId, id);
			}
			return;
		}

		moveCarriedTokens(obj);
	};

	on('chat:message', (msg) => {
		try {
			if (msg.content.startsWith(CARRY_MENU_CMD)) {
				Commands.showMenu(msg);
			}
			if (msg.content.startsWith(CARRY_ABOVE_CMD)) {
				Commands.carryAbove(msg);
			}
			if (msg.content.startsWith(CARRY_BELOW_CMD)) {
				Commands.carryBelow(msg);
			}
			if (msg.content.startsWith(DROP_ONE_CMD)) {
				Commands.dropOne(msg);
			}
			if (msg.content.startsWith(DROP_ALL_CMD)) {
				Commands.dropAll(msg);
			}
		} catch (err) {
			log('Carry Tokens ERROR: ' + err.message);
			sendChat('Carry Tokens ERROR:', '/w gm ' + err.message);
			log(err.stack);
		}
	});

	on('change:graphic', (obj, prev) => {
		try {
			if (!obj || obj.get('_subtype') !== 'token') {
				return;
			}
			if (!graphicMoved(obj, prev)) {
				return;
			}
			handleGraphicMove(obj);
		} catch (err) {
			log('Carry Tokens ERROR: ' + err.message);
			log(err.stack);
		}
	});

	on('destroy:graphic', (obj) => {
		try {
			purgeTokenFromState(tokenId(obj));
		} catch (err) {
			log('Carry Tokens ERROR: ' + err.message);
			log(err.stack);
		}
	});

	on('ready', () => {
		ensureState();

		let players = findObjs({ _type: 'player' });
		_.each(players, (player) => {
			let macro = findObjs({
				_type: 'macro',
				_playerid: player.get('_id'),
				name: 'CarryTokensMenu'
			})[0];

			if (macro) {
				macro.set('action', CARRY_MENU_CMD);
			} else {
				createObj('macro', {
					_playerid: player.get('_id'),
					name: 'CarryTokensMenu',
					action: CARRY_MENU_CMD
				});
			}
		});

		log(`--- Initialized Carry Tokens ${VERSION} (state-based carryList) ---`);
	});

	return {
		carryAbove,
		carryBelow,
		drop,
		dropAll,
		getCarriedTokens,
		getOption
	};
})();
