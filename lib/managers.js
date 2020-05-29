var ModelManager = {};
var EventManager = {};
var DomManager = {};    
var runDomEvent = function(el, e, key) { 
     if (EventManager[key] && EventManager[key]['func'] && EventManager[key]['ctx'] && EventManager[key]['target'] && EventManager[key]['ctx']['methods']) {

           return EventManager[key]['ctx']['methods'][EventManager[key]['func']].call(EventManager[key]['ctx'], 
           e, el, 
           EventManager[key]['data'] && typeof EventManager[key]['data'].get === 'function' ? EventManager[key]['data'].get() : EventManager[key]['data']);
     }
};

var runModelEvent = function(el, e, key) {
    if (ModelManager[key]) { 
        ModelManager[key]['ctx'][ModelManager[key]['key']] = el.value;
    }
}