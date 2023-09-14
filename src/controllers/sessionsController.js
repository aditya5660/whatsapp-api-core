const { isSessionExists, createSession, getSession, deleteSession } = require('../services/whatsappService.js')
const responseHelper = require('./../utils/response.js')
const fs = require('fs');


const find = (req, res) => {
    responseHelper(res, 200, true, 'Session found.')
}

const findorFail = (req, res) => {
    responseHelper(res, 200, true, 'Session found.')
}


const status = (req, res) => {
   
    
    fs.readFile(`sessions/md_${res.locals.sessionId}/creds.json`, function( err, data )
    {
      if(err) 
      {
            
        const states = ['connecting', 'connected', 'disconnecting', 'disconnected']

        const session = getSession(res.locals.sessionId)
        let state = states[session.ws.readyState]

        state =
        state === 'connected' && typeof (session.isLegacy ? session.state.legacy.user : session.user) !== 'undefined'
        ? 'authenticated'
        : state

        responseHelper(res, 403, true, '', { status: state,valid_session:false })
      }
      else{
       const states = ['connecting', 'connected', 'disconnecting', 'disconnected']

       const session = getSession(res.locals.sessionId)
       let state = states[session.ws.readyState]

       state =
       state === 'connected' && typeof (session.isLegacy ? session.state.legacy.user : session.user) !== 'undefined'
       ? 'authenticated'
       : state


       let rawdata = fs.readFileSync(`sessions/md_${res.locals.sessionId}/creds.json`);
       let userdata = JSON.parse(rawdata);

       responseHelper(res, 200, true, '', { status: state,valid_session:true,userinfo: userdata.me })
      }
        
        
    });


    
}

const add = (req, res) => {
    const { id, isLegacy } = req.body

    if (isSessionExists(id)) {
        return responseHelper(res, 409, false, 'Session already exists, please use another id.')
    }

    createSession(id, isLegacy === 'true', res)
}

const del = async (req, res) => {
    const { id } = req.params
    const session = getSession(id)

    try {
        await session.logout()
    } catch {
    } finally {
        deleteSession(id, session.isLegacy)
    }

    responseHelper(res, 200, true, 'The session has been successfully deleted.')
}



module.exports = { find, status, add, del }
