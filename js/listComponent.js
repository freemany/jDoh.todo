const list = makeReactTemplate({
    $el: $('#app'),
    template: `<div>
              {{ Title.render() }}
               <ul>
               <% for(var i=0; i < todoData.list.length; i++) { %>
                   {{ li.render(todoData.list[i]) }}
               <% } %>
               </ul>
               <input type='text' value="{{todoData.newValue}}" #new jd-model="newItem" ><button @click="add">+</button>
               </div>`,
    methods:{
        add(e, el) { 
            e.preventDefault();
            // const name = this.new().val();
            const name = this.newItem;
            let res = typeof todoData.list.get === 'function' ? todoData.list.get() : [];
            const newItem = {name: name, id: uuid(), done: '', editting: false};
            res.push(newItem);
            console.log('add', newItem);
            todoData.newValue = '';
            todoData.set('list', res);
        }
    }           
}, todoData).render();