const createElement = (tagName, { attrs = {}, children = [] } = {}) => {
    return {
      tagName,
      attrs,
      children,
    };
  };
  
  const zip = (xs, ys) => {
    const zipped = [];
    for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
      zipped.push([xs[i], ys[i]]);
    }
    return zipped;
  };
  
  const diffAttrs = (oldAttrs, newAttrs) => {  
    const patches = [];
  
    // set new attributes
    for (const [k, v] of Object.entries(newAttrs)) { 
      patches.push($node => { 
        if (typeof $node.setAttribute === 'function') $node.setAttribute(k, v);
        return $node;
      });
    }
  
    // remove old attributes
    for (const k in oldAttrs) {
      if (!(k in newAttrs)) {
        patches.push($node => {
          $node.removeAttribute(k);
          return $node;
        });
      }
    }
  
    return $node => {
      for (const patch of patches) {
        patch($node);
      }
    };
  };
  
  const diffChildren = (oldVChildren, newVChildren) => { 
    const childPatches = [];
  
    oldVChildren.forEach((oldVChild, i) => {
      childPatches.push(diff(oldVChild, newVChildren[i]));
    });
  
    const additionalPatches = [];
    for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
      additionalPatches.push($node => {
        $node.appendChild(render(additionalVChild));
        return $node;
      });
    }
  
    return $parent => { 
      for (const [patch, child] of zip(childPatches, $parent.childNodes)) {
          if (typeof patch === 'function') {
              patch(child);
          }
        
      }
  
      for (const patch of additionalPatches) {
        patch($parent);
      }
     
      return $parent;
    };
  };
  
  const renderElem = ({ tagName, attrs, children }) => {
      let $el;
      if (tagName === 'text') { 
          $el = document.createTextNode(attrs.content);
          // delete(attrs.content);
      } else {
          $el = document.createElement(tagName);
      }
    
  
  //   if (attrs.text) { 
  //     const text = document.createTextNode(attrs.text);
  //     // delete(attrs.text);
  //     $el.appendChild(text);
  //   }
  
    // set attributes
    if (tagName !== 'text') {
      for (const [k, v] of Object.entries(attrs)) {
      if ('text' === k) continue; 
         $el.setAttribute(k, v);
      }
    }
    
    // set children
    for (const child of children) {
      const $child = render(child);
      $el.appendChild($child);
    }
  
    return $el;
  };
  
  const render = (vNode) => {
    if (typeof vNode === 'string') {
      return document.createTextNode(vNode);
    }
  
    return renderElem(vNode);
  }
  
  const diff = (vOldNode, vNewNode) => { 
    
  if (vOldNode && vNewNode && vOldNode.tagName === 'text' && 'text' === vNewNode.tagName && vOldNode.attrs.content !== vNewNode.attrs.content) { 
      return $node => {
        const $newNode = render(vNewNode);
        $node.replaceWith($newNode);
        return $newNode;
    };
  }
  
    if (vNewNode === undefined) { 
        
      return $node => {
        $node.remove();
        return undefined;
      };
    }
  
    if (typeof vOldNode === 'string' ||
      typeof vNewNode === 'string') {
      if (vOldNode !== vNewNode) { 
        return $node => {
          const $newNode = render(vNewNode);
          $node.replaceWith($newNode);
          return $newNode;
        };
      } else {
        return $node => undefined;
      }
    }
  
    if (vOldNode.tagName !== vNewNode.tagName) { 
      return $node => {
        const $newNode = render(vNewNode);
        $node.replaceWith($newNode);
        return $newNode;
      };
    }
  
    const patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs);
    const patchChildren = diffChildren(vOldNode.children, vNewNode.children);
    
    return $node => { 
      patchAttrs($node);
      patchChildren($node); 
      return $node;
    };
  };
  
  const mount = ($node, $target) => {
    $target.replaceWith($node);
    return $node;
  };

  const makeVdom = (function(createElement) {
    if (typeof createElement !== 'function') {
        throw new Error('makeVdom depends on createElement but createElement is not available');
    }
    function _makeVdom($el) {
      const result = [], vd = [];
      const $children = $el.children(); 
      const textNodes = ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'span', 'li', 'a', 'button'];
  
      if ($children.length > 0) {
          $children.each(function() { 
             const attr = this.attributes; 
             const items = Object.keys(attr).map(index => Object.create({name: attr[index].name, val: attr[index].value}))
             const attrs = {};
             items.forEach((i) => {
                  attrs[i.name] = i.val;
             });
             const tagName = this.tagName.toLowerCase();
             const directText = $(this).clone().children().remove().end().text();
             const children = [];
             if (textNodes.indexOf(tagName) > -1 && String(directText) !== '') { 
                 children.push(createElement.apply(createElement, 
                 ['text', { attrs: {content: directText}, children: []}]));
             }
             const el = [
              tagName, {
              attrs: attrs, 
              children: children.concat(_makeVdom($(this)))
             }];
             result.push(createElement.apply(createElement, el)); 
          });
      }
  
      return result;
    }; 
  
    function makeVdom(el) {
      const $html = $('<div>' + el.outerHTML + '</div>'); 
      return _makeVdom($html)[0]
    }
  
    return makeVdom;
  
  })(createElement);