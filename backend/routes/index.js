/* eslint-disable spaced-comment */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const routes = require('express').Router()
const axios = require('axios')
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
const log4js = require('log4js');

log4js.configure({
  appenders: {
      out: { type: 'console' },
      //file: { type: 'file', filename: "C:\\Logs\\ACWS\\acws.log", maxLogSize: 10485760, backups: 3, compress: true }
  },
  categories: {
      default: { appenders: ['out'], level: 'debug'}
  }
  });

const logger = log4js.getLogger('default');


const getJWTTokenUrl = 'https://ims-na1.adobelogin.com/ims/exchange/jwt';
const sendAdobeEventsUrl = 'https://dcs.adobedc.net/collection/102196567b0765b13a9bf4aa24cef3dc82193737857aeca4996244590e964279?synchronousValidation=true';


const getAccessToken =  async (req, res, next) => {
  try {
    const dataParams = new FormData()
    dataParams.append('client_id', '25a26d467fac475dbbf3cf3e55ba0870')
    dataParams.append('client_secret', '0435f6d0-a70e-4765-800f-f515b6cd4ac6')
    dataParams.append(
      'jwt_token',
      'eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE2MjEzNTQ4NjAsImlzcyI6IkVGRTI0MzI0NURCOUQzREQwQTQ5NUU4MEBBZG9iZU9yZyIsInN1YiI6IjAwRkM1MTVBNUVGMTBDQUEwQTQ5NUZDMkB0ZWNoYWNjdC5hZG9iZS5jb20iLCJodHRwczovL2ltcy1uYTEuYWRvYmVsb2dpbi5jb20vcy9lbnRfZGF0YXNlcnZpY2VzX3NkayI6dHJ1ZSwiYXVkIjoiaHR0cHM6Ly9pbXMtbmExLmFkb2JlbG9naW4uY29tL2MvMjVhMjZkNDY3ZmFjNDc1ZGJiZjNjZjNlNTViYTA4NzAifQ.VjG3eEGmqRp3a75wj27QDvcLr7Y6gusx8mymcCpCFjPT6E7b1_bWm6DhgnmTB8uxZOI2re_riURxJWBHFNwRL26TYiHUzJ0CL_5Xrd2VWcnC9_9X5L2uac1ilom5dQ1qZStO-DndfB7UbsB6rJR4DXZGc2Z54AhWmtl2qBEYjjUpW8jQllIxYCSFEXW43loseCo6C3vduiBDNlwQbJOjObmz_VCPu0R6g1wKaccYFSzaZkscPS7lW13VgDCQLwpJyiwVnztHbdVb9CBbgvOEvn1Z_iJEulAnYHMn_riAqC9YT4Q-JJmkNHqbxI-7u_F9K4ZRIPQASTygee0ntfklLQ'
    )
    const myResponse = await axios.post(getJWTTokenUrl, dataParams, {headers: dataParams.getHeaders()})
    req.adobeAccessToken = myResponse.data.access_token;
    next();
  }
  catch (error) {
    logger.error(error)
    next(error)
  }

}

const sendAdobeRequest = async (req, res, next) => {

  try {

    if (!req.body.gdemo_email || !req.adobeAccessToken) {
      throw new Error('Access token invalid or gdemo_email property is missing from payload')
    } else {
      const myHeaders = { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + req.adobeAccessToken,
        'sandbox-name': 'genesysv2sandboxae'
      }
    
      const myDataObject = {
        "header":{
          "schemaRef":{
            "id":"https://ns.adobe.com/exchangesandboxbravo/schemas/bfb82b59e22220fca23dc069ffe171906443e1c75d0d36ac",
            "contentType":"application/vnd.adobe.xed-full+json;version=1.0"
          },
          "imsOrgId":"EFE243245DB9D3DD0A495E80@AdobeOrg",
          "datasetId":"609226fe5caefc1948eb7014",
          "source":{"name":"Streaming dataflow - 5/5/2021, 00:02 am "}
        },
        "body":
          {"_exchangesandboxbravo":
            {
              "applicationName":"Agent Desktop App",
              "channel":"web",
              "disposition": req.body.disposition || "Abandoned - Self Service",
              "gdemo_email": req.body.gdemo_email || "arnaud.lejeune@genesys.com",
              "origination":"Customer Service Representative",
              "reasonType": req.body.comments || "Create Account",
              "subject":"Lead Qualification"
            },
            "_id":uuidv4(),
            "eventType":"Personalized Offers Update",
            "timestamp":new Date().toJSON()
          }
        };
  
      const myData = JSON.stringify(myDataObject);
    
      const myResponse = await axios.post(sendAdobeEventsUrl, myData, {headers: myHeaders})
      req.adobeEventResponse = myResponse.data;
      next();
      }

  }
  catch (error) {
    logger.error(error)
    next(error)
  }
  
}


routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' })
})

/*routes.post('/login', , async (req, res, next) => {
  try{
    const response = await makeGetTokenRequest();
    res.json(response.data)
    accessToken = response.data.access_token;
    next()
  } catch (err) {
    next(err)
  }
})*/


routes.post('/sendAdobeEvents', getAccessToken, sendAdobeRequest, (req, res, next) => {
  try{
    return res.status(200).json(req.adobeEventResponse)
  } catch (err) {
    logger.error(error)
    next(err)
  }
})





module.exports = routes
