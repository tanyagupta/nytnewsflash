// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
var requestlib = require('request');



const SKILL_NAME ="New York Times News"
const STOP_MESSAGE = 'Goodbye!';
var ALL_NEWS_SET;
var INTROS=["Leading the news today is the headline ","In other news we also have a story ", "Third on the list is the following headline ","The New York Times reports as follows: ","Another news for today is the following: ","Our last headline of the day is as follows: "]

// const LaunchRequestHandler = {
//     canHandle(handlerInput) {
//         return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
//     },
//     handle(handlerInput) {
//         const speakOutput = 'Would you like to hear the flash briefing for today?';
//         return handlerInput.responseBuilder
//             .speak(speakOutput)
//             .reprompt(speakOutput)
//             .getResponse();
//     }
// };
const GetNewsIntentHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'LaunchRequest'
        || (request.type === 'IntentRequest'
          && request.intent.name === 'GetNewsIntent');
        },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.invokeReason = 'another-news';
        var result = await getNews();

        var info_set = JSON.parse(result)
        //var info_set = [["For Trump and the Nation, a Final Test of Accountability","WASHINGTON — Barely 11 months after President Trump was acquitted in a momentous Senate trial, the nation now confronts the possibility of yet another impeachment battle in the twilight of his presidency, a final showdown that will test the boundaries of politics, accountability and the Constitution.","The push by Democrats to impeach the president for his role in inciting the attack on the Capitol underscores how American politics has been profoundly shaken in ways still hard to measure.","https://www.nytimes.com/2021/01/09/us/politics/trump-impeachment-possible.html","images/2021/01/09/us/politics/09dc-impeach-1/09dc-impeach-1-articleLarge.jpg","By Peter Baker","Washington","U.S.","Politics"]]
        ALL_NEWS_SET = info_set
        var response_string = ""
        for (var i=0;i<6;i++){
          response_string=response_string
          +INTROS[i]
          +" "+ALL_NEWS_SET[i][0]+"<break time='1s'/>"+ALL_NEWS_SET[i][2]+"<break time='1s'/>"+"<break time='1s'/>"+"Here's the lead Para: "+ALL_NEWS_SET[i][1]
          +"<break time='2s'/>"

        }

        var response_clean = response_string.replace(/\&/ig, 'and')
        sessionAttributes.lastSpeech = response_clean;
        var display_text = (ALL_NEWS_SET[0][0]).replace(/\&/ig, 'and')
        var display_image = ALL_NEWS_SET[0][4] ? "https://static01.nyt.com/"+ALL_NEWS_SET[0][4] : "skill-package/assets/social-media-1989152_640.jpg";

        const speakOutput = response_clean+" "+"Would you like more news?";
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.withSimpleCard(SKILL_NAME,"HELLO")
            .withStandardCard(SKILL_NAME,display_text,display_image)
            .withShouldEndSession(false)
            .reprompt('Would you like some more news?')
            .getResponse();
    }
};
const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Yes yes yes';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const NoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'No no no';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
      //  LaunchRequestHandler,
        GetNewsIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        )
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();

    function getNews() {
      return new Promise(function (resolve, reject) {
        //var url = 'https://script.google.com/macros/s/AKfycbxDldtSHoZoYMBct9BrmYohyFO10JdOeAaMoO3F0e9HSrOZQTEJ/exec'
        //var url = 'https://script.google.com/macros/s/AKfycbzdDlPW9-iZodsf45dEOTN2tlXqszE5atPDfuiIJCzdttjl_0f7/exec'
        var url = "https://script.google.com/macros/s/AKfycbzdDlPW9-iZodsf45dEOTN2tlXqszE5atPDfuiIJCzdttjl_0f7/exec"
          requestlib(url, function (error, res, body) {


          if (!error && res.statusCode == 200) {
            resolve(body);
          } else {
            reject(error);
          }
        });
      });

}
