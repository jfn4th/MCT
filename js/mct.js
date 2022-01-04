$(document).ready(function() {
	// set up columns from template
	$(".col").each(function() {
		$(this).append($("#templates #colTemplate").html());
	});
});

function setup() {
	$(".col").each(function() {
		var col = $(this);
		
		// clear errors
		col.find(".error").remove();

		if (validate(col)) {
			// get challenge rating
			var cr = parseInt(col.find(".crInput").val());
			// get size
			var sz = col.find(".sizeSel").val();
			// get hit dice
			var hd = col.find(".hdSelect").val();

			// get modifiers
			var mods = accumulateMods(col);

			// calculate and set ACR
			var acr = cr + getCRMod(sz);
			col.find(".ACRRow .value").text(acr);

			// calculate and set initial hit points, if necessary
			var hp = acr * hd;
			if (col.find(".HPRow .value").text() == "") {
                col.find(".HPRow .value").text(hp);
            }

			// calculate and set dv
			var dv = acr + 10 + mods['dv'];
			col.find(".DVRow .value").text(dv);

			// set ov
			col.find(".OVRow .value").text(acr + mods['ov']);

			// show damage mod
			col.find(".DamRow .value").text(mods['dam']);

			// set extras field
			if (mods['spec']) {
				col.find(".statsright").removeAttr("style");
				col.find(".miscWrapper").empty();
				col.find(".miscWrapper").html(mods['spec']);
			}

			// NOW WE FIGHT!!
			fight();
		}
		else {
			$("<div class='error'>Please enter a challenge rating!</div>").insertAfter(col.find("h1"));
		}
	});
}

function fight() {
	// each army rolls a d20
	var attackerRoll = rollD20();
	var defenderRoll = rollD20();

	// get attacker and defender
	var att = $("#attacker");
	var def = $("#defender");


    var a_newHp = parseInt(att.find(".EndHPRow .value").text());
    if (a_newHp) {
        att.find(".HPRow .value").text(a_newHp);
    }

    var d_newHp = parseInt(def.find(".EndHPRow .value").text());
    if (d_newHp) {
        def.find(".HPRow .value").text(d_newHp);
    }

	// get attacker values
	var a_ov = parseInt(att.find(".OVRow .value").text());
	var a_dv = parseInt(att.find(".DVRow .value").text());
	var a_dm = parseInt(att.find(".DamRow .value").text());
    var a_hp = parseInt(att.find(".HPRow .value").text());

	
	// get defender values
	var d_ov = parseInt(def.find(".OVRow .value").text());
	var d_dv = parseInt(def.find(".DVRow .value").text());
	var d_dm = parseInt(def.find(".DamRow .value").text());
    var d_hp = parseInt(def.find(".HPRow .value").text());

	// calculate remaining attacker HP
    var a_attack = attackerRoll + a_ov;
    att.find(".RollRow .value").text(attackerRoll + " (" + a_attack + ")");
    if (a_attack > d_dv) {
        var a_diff = a_attack - d_dv;
        var d_newHp = d_hp - a_diff;
        def.find(".EndHPRow .value").text(d_newHp);
    } else {
        def.find(".EndHPRow .value").text(d_hp);
    }
	
	// calculate remaining defender HP
    var d_attack = defenderRoll + d_ov;
    def.find(".RollRow .value").text(defenderRoll + " (" + d_attack + ")");
    if (d_attack > a_dv) {
        var d_diff = d_attack - a_dv;
        var a_newHp = a_hp - d_diff;
        att.find(".EndHPRow .value").text(a_newHp);
    } else {
        att.find(".EndHPRow .value").text(a_hp);
    }
}

function validate(col) {
	if (col.find(".crInput").val()) {
		return true;
	}
	else {
		return false;
	}
}

function rollD20() {
    return Math.floor((Math.random() * 20) +1);
}

function addCondition(caller) {
	var container = caller.parentNode;
	container = $(container).find(".subrow");
	$(container).append($("#templates #condTemplate").html());
}

function addTactic(caller) {
	var container = caller.parentNode;
	container = $(container).find(".subrow");
	$(container).append($("#templates #tacticTemplate").html());
}

function addStrategy(caller) {
	var container = caller.parentNode;
	container = $(container).find(".subrow");
	$(container).append($("#templates #strategyTemplate").html());
}

function accumulateMods(col) {
	var condMod = accumulateConds(col);
	var tactMod = accumulateTactics(col);
	var strtMod = accumulateStrats(col);

	var out = {
		ov: condMod['ov'] + tactMod['ov'] + strtMod['ov'],
		dv: condMod['dv'] + tactMod['dv'] + strtMod['dv'],
		dam: condMod['dam'] + tactMod['dam'] + strtMod['dam'],
		spec: condMod['spec'] + tactMod['spec'] + strtMod['spec'],
	};

	return out;

}

function accumulateConds(col) {
	var out = {ov: 0, dv: 0, dam: 0, spec: ""};

	col.find(".condChoice").each(function() {
		var cond = getCondMod($(this).val());

		out['ov'] += cond['ov'];
		out['dv'] += cond['dv'];
		out['dam'] += cond['dam'];

		if (cond['spec']) {
			if (!out['spec']) {
				out['spec'] = "<h2>Conditions</h2><ul class='conditionList'>";
			}
			out['spec'] += "<li>" + cond['spec'] + "</li>";
		}
	});

	if (out['spec']) { out['spec'] += "</ul>"; }

	return out;
}

function accumulateTactics(col) {
	var out = {ov: 0, dv: 0, dam: 0, spec: ""};

	col.find(".tacticChoice").each(function() {
		var cond = getTacticMod($(this).val());

		out['ov'] += cond['ov'];
		out['dv'] += cond['dv'];
		out['dam'] += cond['dam'];

		if (cond['spec']) {
			if (!out['spec']) { 
				out['spec'] = "<h2>Tactics</h2><ul class='tacticList'>"; 
			}
			out['spec'] += "<li>" + cond['spec'] + "</li>";
		}
	});

	if (out['spec']) { out['spec'] += "</ul>"; }

	return out;
}

function accumulateStrats(col) {
	var out = {ov: 0, dv: 0, dam: 0, spec: ""};

	col.find(".strategyChoice").each(function() {
		var cond = getStratMod($(this).val());

		out['ov'] += cond['ov'];
		out['dv'] += cond['dv'];
		out['dam'] += cond['dam'];

		if (cond['spec']) {
			if (!out['spec']) { 
				out['spec'] = "<h2>Srategies</h2><ul class='conditionList'>"; 
			}
			out['spec'] += "<li>" + cond['spec'] + "</li>";
		}
	});

	if (out['spec']) { out['spec'] += "</ul>"; }

	return out;
}

function getCondMod(condition) {
	var out = {};

	switch (condition) {
		case "1": // Fortifications
			out = {ov: 0, dv: 16, dam: 0, spec: ""};
			break;
		case "2": // Advantageous Terrain
			out = {ov: 0, dv: 2, dam: 0, spec: ""};
			break;
		default:
			out = {ov: 0, dv: 0, dam: 0, spec: ""};
	}
	return out;
}

function getTacticMod(tactic) {
	var out = null;

	switch (tactic) {
		case "1": // Defensive Wall
			out = {ov: -2, dv: 2, dam: 0, spec: ""};
			break;
		case "2": // relentless brutality
			out = {ov: 4, dv: -4, dam: 0, spec: ""};
			break;
		default:
			out = {ov: 0, dv: 0, dam: 0, spec: ""};
	}
	return out;
}

function getStratMod(strategy) {
	var out = {};

	switch (strategy) {
		case "1": // defensive
			out = {ov: -4, dv: +4, dam: -6, spec: ""};
			break;
		case "2": // cautious
			out = {ov: -2, dv: +2, dam: -3, spec: ""};
			break;
		case "3": // standard
			out = {ov: 0, dv: 0, dam: 0, spec: ""};
			break;
		case "4": // aggressive
			out = {ov: 2, dv: -2, dam: 3, spec: ""};
			break;
		case "5": // reckless
			out = {ov: 4, dv: -4, dam: 6, spec: ""};
			break;
		default: 
			out = {ov: 0, dv: 0, dam: 0, spec: ""};
	}
	return out;
}

function getCRMod(size) {
	var out = 0;

	switch(size) {
		case "1": // fine
			out = -8;
			break;
		case "2": // diminutive
			out = -6;
			break;
		case "3": // tiny
			out = -4;
			break;
		case "4": // small
			out = -2;
			break;
		case "5": // medium
			out = 0;
			break;
		case "6": // large
			out = 2;
			break;
		case "7": // huge
			out = 4;
			break;
		case "8": // gargantuan
			out = 6;
			break;
		case "9": // colossal
			out = 8;
			break;
		default:
			out = 0;
	}
	return out;
}

function removeModifier(caller) {
    $(caller).parent().remove();
}
