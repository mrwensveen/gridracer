/*
 * jsjac.simpleclient.js
 * Based on simpleclient.html: Copyright (C) 2004-2008 Stefan Strigler
 */

function handleMessage(con, packet) {
	console.log('handleMessage');
	console.log(packet.xml());
	//~ var html = '';
	//~ html += '<div class="msg"><b>Received Message from '+packet.getFromJID()+':</b><br/>';
	//~ html += packet.getBody().htmlEnc() + '</div>';
	//~ document.getElementById('iResp').innerHTML += html;
	//~ document.getElementById('iResp').lastChild.scrollIntoView();
}

function handlePresence(con, packet) {
	console.log('handlePresence');
	console.log(packet.xml());
	//~ var html = '<div class="msg">';
	//~ if (!packet.getType() && !packet.getShow()) 
		//~ html += '<b>'+packet.getFromJID()+' has become available.</b>';
	//~ else {
		//~ html += '<b>'+packet.getFromJID()+' has set his presence to ';
		//~ if (packet.getType())
			//~ html += packet.getType() + '.</b>';
		//~ else
			//~ html += packet.getShow() + '.</b>';
		//~ if (packet.getStatus())
			//~ html += ' ('+packet.getStatus().htmlEnc()+')';
	//~ }
	//~ html += '</div>';
//~ 
	//~ document.getElementById('iResp').innerHTML += html;
	//~ document.getElementById('iResp').lastChild.scrollIntoView();
}

function handleIQ(con, iq) {
	console.log('handleIQ');
	console.log(iq.xml());
	//~ document.getElementById('iResp').innerHTML += 
		//~ "<div class='msg'>IN (raw): " +aIQ.xml().htmlEnc() + '</div>';
	//~ document.getElementById('iResp').lastChild.scrollIntoView();

	con.send(iq.errorReply(ERR_FEATURE_NOT_IMPLEMENTED));
}

function handleError(con, e) {
	console.log('handleError');
	console.log(e.outerXml);
	//~ document.getElementById('err').innerHTML = "An error occured:<br />"+ 
		//~ ("Code: "+e.getAttribute('code')+"\nType: "+e.getAttribute('type')+
		//~ "\nCondition: "+e.firstChild.nodeName).htmlEnc(); 
	//~ document.getElementById('login_pane').style.display = '';
	//~ document.getElementById('sendmsg_pane').style.display = 'none';
	
	if (con.connected()) {
		con.disconnect();
	}
}

function handleStatusChanged(con, status) {
	console.log('handleStatusChanged');
	console.log(status);
	//~ oDbg.log("status changed: "+status);
}

function handleConnected(con) {
	console.log('handleConnected');
	//~ document.getElementById('login_pane').style.display = 'none';
	//~ document.getElementById('sendmsg_pane').style.display = '';
	//~ document.getElementById('err').innerHTML = '';

	con.send(new JSJaCPresence());
}

function handleDisconnected(con) {
	console.log('handleDisconnected');
	//~ document.getElementById('login_pane').style.display = '';
	//~ document.getElementById('sendmsg_pane').style.display = 'none';
}

function handleIqVersion(con, iq) {
	console.log('handleIqVersion');
	con.send(iq.reply([
		iq.buildNode('name', 'jsjac simpleclient'),
		iq.buildNode('version', JSJaC.Version),
		iq.buildNode('os', navigator.userAgent)
	]));
	
	return true;
}

function handleIqTime(con, iq) {
	console.log('handleIqTime');
	var now = new Date();
	con.send(iq.reply([
		iq.buildNode('display', now.toLocaleString()),
		iq.buildNode('utc', now.jabberDate()),
		iq.buildNode('tz',now.toLocaleString().substring(now.toLocaleString().lastIndexOf(' ')+1))
	]));
	
	return true;
}

function connectAndLogin(connectionArgs, loginArgs) {
	var con;
	try {
		if (connectionArgs.backend == 'binding') {
			con = new JSJaCHttpBindingConnection(connectionArgs);
		} else {
			con = new JSJaCHttpPollingConnection(connectionArgs);
		}

		setupCon(con);

		con.connect(loginArgs);
	} catch (e) {
		console.log(e);
	} finally {
		return con;
	}
}

function setupCon(con) {
	con.registerHandler('message', function(packet) { handleMessage(con, packet); });
	con.registerHandler('presence', function(packet) { handlePresence(con, packet); });
	con.registerHandler('iq', function(iq) { handleIQ(con, iq); });
	con.registerHandler('onerror', function(error) { handleError(con, error); });
	con.registerHandler('status_changed', function(status) { handleStatusChanged(con, status); });
	con.registerHandler('onconnect', function() { handleConnected(con); });
	con.registerHandler('ondisconnect', function() { handleDisconnected(con); });

	con.registerIQGet('query', NS_VERSION, function(iq) { handleIqVersion(con, iq); });
	con.registerIQGet('query', NS_TIME, function(iq) { handleIqTime(con, iq); });
}

function sendMsg(con, to, msg, type) {
	if (to.indexOf('@') == -1) {
		to += '@' + con.domain;
	}

	try {
		var aMsg = new JSJaCMessage();
		aMsg.setTo(new JSJaCJID(to));
		aMsg.setBody(msg);
		
		if (type != undefined) {
			aMsg.setType(type);
		}
		
		con.send(aMsg);
	} catch (e) {
		console.log(e.message);
	}
}

function quit(con) {
	var p = new JSJaCPresence();
	p.setType("unavailable");
	con.send(p);
	con.disconnect();
}

// TODO: clean up below

//~ onerror = function(e) { 
	//~ document.getElementById('err').innerHTML = e; 
//~ 
	//~ document.getElementById('login_pane').style.display = '';
	//~ document.getElementById('sendmsg_pane').style.display = 'none';
//~ 
	//~ if (con && con.connected())
		//~ con.disconnect();
	//~ return false; 
//~ };
//~ 
//~ onunload = function() {
	//~ if (typeof con != 'undefined' && con && con.connected()) {
	//~ // save backend type
		//~ if (con._hold) // must be binding
			//~ (new JSJaCCookie('btype','binding')).write();
		//~ else
			//~ (new JSJaCCookie('btype','polling')).write();
		//~ if (con.suspend) {
			//~ con.suspend(); 
		//~ }
	//~ }
//~ };
