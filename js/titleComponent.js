const Title = makeReactTemplate({ 
    template: `<div class="row">
                <h2>{{title}}</h2>
                <input jd-model="newTitle" @keyup="update">
                <button @click="changeTitle">Click to change title</button>
               </div>`,
    methods: {
      update() {
        todoData.set('title', this.newTitle);
      },  
      changeTitle(val) { 
        todoData.set('title', (new Date).getTime());
      }
    },
}, todoData);