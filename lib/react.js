var makeReactTemplate = function(opts, data) { 
    const t = new Template({
        $el: opts.$el,
        template: opts.template,
        data: data,
        methods: opts.methods,
        dynamic: opts.dynamic,
    });
 
    if (data && opts.$el) {
     makeReactObject(data, [function() {
        t.render();
     }]);
    }
   
    return t;
 };
 
 var makeReactObject = (function() {
 
  function _makeReactObject (
   object,
   key,
   val,
   notifiers
 ) { 
    const obj = object;
 
    obj.setterCallback = notifiers && notifiers[0] && typeof notifiers[0] === 'function' ? notifiers[0] : function() {};
    obj.getterCallback = notifiers && notifiers[1] && typeof notifiers[1] === 'function' ? notifiers[1] : function() {};
 
   const property = Object.getOwnPropertyDescriptor(obj, key)
   if (property && property.configurable === false) {
     return
   }
 
     if (!obj.set) {
      obj.set = function(key, val) {
               obj[key] = val;
               _makeReactObject(obj, key, val, notifiers);
      };
      obj.get = function() {
          let result = [];
          if (Array.isArray(this)) {
             for(let i=0; i<this.length; i++) {
                 let item = {};
                 Object.keys(this[i]).forEach((k) => { 
                   if (k === 'set' || k === 'get' || k === 'setterCallback' || k === 'getterCallback') return;
                      item[k] = this[i][k]
                 })
 
                 result.push(item);
             }
          } else {
             result = {}; 
             Object.keys(this).forEach((k, i) => { 
               if (k === 'set' || k === 'get' || k === 'setterCallback' || k === 'getterCallback') return;
               result[k] = obj[k];
             })
          }
          
          return result;
      }
     }
 
   Object.defineProperty(obj, key, {
     get: function reactiveGetter () {
       obj.getterCallback.call(obj, key, val);
   
       return val;
     },
     set: function reactiveSetter (newVal) {
         const oldVal = val;
       /* eslint-disable no-self-compare */
       if (newVal === val || (newVal !== newVal && val !== val)) {
         return
       }
      val = newVal
  
     obj.setterCallback.call(obj, key, oldVal, newVal);
     }
   });
 
   if (val === Object(val)) {
     makeReactObject(val, notifiers);
   }
 } 
    
    function makeReactObject(obj, notifiers) {
     for(const key in obj) {
         _makeReactObject(obj, key, obj[key], notifiers);
     }
    }
 
    return makeReactObject;
 })();