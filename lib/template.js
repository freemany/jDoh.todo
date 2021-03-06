
// By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  var _ = _ || {};
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /{{([\s\S]+?)}}/g,
    escape: /<%-([\s\S]+?)%>/g,
    clickEvent: /@click="([\s\S]+?)"/g,
    keyupEvent: /@keyup="([\s\S]+?)"/g,
    dom: /#([\s\S]+?)#/g,
    model: /jd-model="([\s\S]+?)"/g,
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = $.extend({}, settings, _.templateSettings);

    // events
    var events = [];

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source,
      (settings.clickEvent || noMatch).source,
      (settings.keyupEvent || noMatch).source,
      (settings.dom || noMatch).source,
      (settings.model || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, clickEvent, keyupEvent, dom, model, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) { 
        source += "';\n" + evaluate + "\n__p+='";
      } else if (clickEvent) { 
        const token = "jd-" + String(Math.random()).substr(7);
        const add = token + " data-event-key=" + token + " data-event onClick=runDomEvent(this,event,\"" + token + "\")";
        source +=  add;  
        events.push({id: token, event: 'click', func: clickEvent});
        EventManager[token] = {event: 'click', func: clickEvent};
      } else if (keyupEvent) { 
        const token = "jd-" + String(Math.random()).substr(7);
        const add = token + " data-event-key=" + token + " data-event onkeyup=runDomEvent(this,event,\"" + token + "\")";
        source +=  add;  
        events.push({id: token, event: 'keyup', func: keyupEvent});
        EventManager[token] = {event: 'keyup', func: keyupEvent};
      } else if (dom) { 
        const token = "jd-" + String(Math.random()).substr(7);
        source +=  token;  
        DomManager[token] = dom;
      } else if (model) { 
        const token = "jd-" + String(Math.random()).substr(7);
        source +=  token + " oninput=runModelEvent(this,event,\"" + token + "\")";;  
        ModelManager[token] = {key: model};
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';
    // console.log(source)
    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return {template: render.call(this, data, _), event: events};
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

class Template {
    constructor(options) {
      this.$el = options.$el;
      this.template = options.template;
      this.complied = _.template(this.template);
      this.data = options.data;
      this.methods = options.methods;
      this.dynamic = options.dynamic;
    }

    render(data) { 
       const d = data || this.data; 
       let res;

       if (true === this.dynamic) {
        res = _.template(this.template)(d);
       } else {
        res = this.complied(d);
       }
       const template = res.template;
       const event = res.event;

       this.$innerEl = $(template); 
       this.domEvents = event;

       if (!this.$el) {
          this._pickupDom();
          this._initEvents(data);
          this._initModel();

          return this.$innerEl[0].outerHTML;
       } 
       
             
       this._initEvents();
       this._pickupDom();
       this._initModel();

       // root return
       if (undefined === this.vApp) { 
          this.vApp = makeVdom(this.$innerEl[0]); console.log('init', this.$innerEl[0], this.vApp)
          this.$rootEl = mount(render(this.vApp), this.$el[0]); 
       } else {
           this.vNewApp =  makeVdom(this.$innerEl[0]); console.log('diff', this.$innerEl[0], this.vNewApp, 'this.$rootEl', this.$rootEl);
           const patch = diff(this.vApp, this.vNewApp);
           this.$rootEl = patch(this.$rootEl); 
           this.vApp = this.vNewApp;
        // this.$rootEl = mount(render(this.vNewApp), this.$rootEl); 
       }
 
       return this;
    }

    _pickupDom() {
       for(const key in DomManager) {
        const $found = $('<div>' + this.$innerEl[0].outerHTML + '</div>').find('[' + key + ']'); 
        if ($found.length > 0) {
              this[DomManager[key]] = function() {
                  return $('body').find('[' + key + ']');
              }; 
        }
       }
    }

    _initModel() {
        for(const key in ModelManager) {
        const $found = $('<div>' + this.$innerEl[0].outerHTML + '</div>').find('[' + key + ']'); 
        if ($found.length > 0 && undefined === ModelManager[key]['ctx']) { 
              ModelManager[key]['ctx'] = this;
        }
       }
    }

    _initEvents(data) { 
       const that = this;
       this.domEvents.forEach((evt) => {
           const $found = $('<div>' + that.$innerEl[0].outerHTML + '</div>').find('[' + evt.id + ']'); 
           if ($found.length > 0) { 
               if (that.methods && that.methods[evt.func]) { 
                   EventManager[evt.id]['target'] = that.$innerEl;
                   EventManager[evt.id]['ctx'] = that;
                   EventManager[evt.id]['data'] = data;
               }
           }
       })
    }
}