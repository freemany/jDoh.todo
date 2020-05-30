const List = makeReactTemplate({
    $el: $('#app'),
    template: `<div id='app'>
              {{ Title.render() }}
               <ul>
               <% for(var i=0; i < todoData.list.length; i++) { %>
                   {{ Item.render(todoData.list[i]) }}
               <% } %>
               </ul>
               <input type='text' value="{{todoData.newValue}}" onfocus="this.select()" jd-model="newItem" ><button @click="add">+</button>
               </div>`,
    methods:{
        add(e, el) { 
            e.preventDefault();
            const name = this.newItem;
            let res = typeof todoData.list.get === 'function' ? todoData.list.get() : [];
            const newItem = {name: name, id: uuid(), done: '', editting: false};
            res.push(newItem);
            console.log('add', newItem);
            todoData.set('newValue', '');
            todoData.set('list', res);
        }
    }           
}, todoData).render();