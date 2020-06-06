const Item = makeReactTemplate({ 
    template: `<li class="item {{done}} list-group-item">
              <% if (editting === false) { %>{{name}}
              <% } else { %>
                <input type="text" value="{{name}}" onfocus="this.select()" jd-model="edittingItem" >
              <% } %>  
              <button @click="delete">-</button>
              <button @click="makeDone">{{done === "" ? "done" : "undone"}}</button>
              <button @click="startEdit">{{editting === false ? "edit" : "save"}}</button></li>`,
    dynamic: true,
    methods: {
        startEdit(e, el, item) {
            e.preventDefault();

            const list = todoData.list.get();
            for(let i=0; i < list.length; i++) {
                if (list[i].id === item.id) {
                    if (true === list[i].editting) {
                        list[i].editting = false;
                        // const value = $(el).prev().prev().prev().val();
                        const value = this.edittingItem; 
                        list[i].name = value;
                    } else {
                        list[i].editting = true;
                    }
                } 
            }
            todoData.set('list', list);
        },
        makeDone(e, el, item) {
            e.preventDefault();

            console.log('todo done', item)
            const list = todoData.list.get();
            let res = [];
            for(let i=0; i < list.length; i++) {
                let done = list[i].done;
                if (list[i].id === item.id) {
                      done = done === '' ? 'done' : '';
                } 
                res.push({id: list[i].id, name: list[i].name, done: done, editting: false});
            }
            todoData.set('list', res);
        },
        delete(e, el, item) {
            e.preventDefault();

            const list = todoData.list.get();
            console.log('delete', item, list)
            let res = [];
            for(let i=0; i < list.length; i++) {
                if (list[i].id !== item.id) {
                      res.push(list[i]);
                }
            }
            todoData.set('list', res);
        }
    }
});