let eventBus = new Vue()
Vue.component("list", {
    template: `
<div class="board">
    <ul  id="columns">
    <div class="form">
<form @submit.prevent="onSubmit">
    <label for="name">Заголовок</label>
    <input type="text" id="name" v-model="name" placeholder="Введите заголовок...">

    <label for="point1">Подзаголовок</label> 
    <input type="text" id="point1" v-model="point1" placeholder="Введите подзаголовок...">

    <label for="point2">Подзаголовок</label>
    <input type="text" id="point2" v-model="point2" placeholder="Введите подзаголовок...">

    <label for="point3">Подзаголовок</label>
    <input type="text" id="point3" v-model="point3" placeholder="Введите подзаголовок...">

    <label for="point4">Подзаголовок</label>
    <input type="text" id="point4" v-model="point4" placeholder="Введите подзаголовок...">

    <label for="point5">Подзаголовок</label>
    <input type="text" id="point5" v-model="point5" placeholder="Введите подзаголовок...">

<button type="submit" value="Submit">Создать</button>
</form>
<ul>
    <li class="error "v-for="error in errors">{{error}}</li>
</ul>
</div>
    <li  class="column">
    <h2>Column №1</h2>

    <ul class="cards">
        <li v-for="card in FirstColumn"><card :name="card.name" :column=1 :block="blockOne" :card_id="card.card_id" :count_of_checked="card.count_of_checked" :points="card.points" @to-two="toColumnTwo" >   </card></li>
    </ul>
</li>
<li class="column">
    <h2>Column №2</h2>
    <ul>
        <li  v-for="card in SecondColumn"><card :name="card.name" :column=2 :block=false :card_id="card.card_id" :count_of_checked="card.count_of_checked" :points="card.points" @to-three="toColumnThree" @to-one="toColumnOne" >  ></card></li>
    </ul>
</li>
<li class="column">
    <h2>Column №3</h2>
    <ul>
        <li  v-for="card in ThirdColumn"><card class="done_card" :name="card.name" :pblock=true :dat="card.dat" :column=3 :points="card.points" ></card></li>
    </ul>
</li>
</ul>
</div>
    `,
    data() {
        return{
            FirstColumn:[],
            SecondColumn:[],
            ThirdColumn:[],
            allColumns:[],
            cards:[],
            name:null,
            point1:null,
            point2:null,
            point3:null,
            point4:null,
            point5:null,
            points:[],
            errors:[],
            card_id:0,
            blockOne:false,
        }
    },
    mounted() {
        const storedColumns = localStorage.getItem('allColumns');
    
        if (storedColumns) {
            try {
                [this.FirstColumn, this.SecondColumn, this.ThirdColumn, this.blockOne] = JSON.parse(storedColumns);
            } catch (e) {
                localStorage.removeItem('allColumns');
            }
        }
    },    
    watch: {
        FirstColumn: 'updateColumns',
        SecondColumn: 'updateColumns',
        ThirdColumn: 'updateColumns',
    },
    methods: {
        updateColumns() {
            this.allColumns = [this.FirstColumn, this.SecondColumn, this.ThirdColumn, this.blockOne];
            const parsed = JSON.stringify(this.allColumns);
            localStorage.setItem('allColumns', parsed);
        },
        onSubmit() {
            this.errors = [];
            this.points = [];
        
            if (this.point1) this.points.push([this.point1, false]);
            if (this.point2) this.points.push([this.point2, false]);
            if (this.point3) this.points.push([this.point3, false]);
            if (this.point4) this.points.push([this.point4, false]);
            if (this.point5) this.points.push([this.point5, false]);
        
            if (this.points.length < 3) this.errors.push("Должно быть заполнено от 3 пунктов");                         
            if (!this.name) this.errors.push("Отсутствует заголовок");
            if (this.FirstColumn.length >= 3) this.errors.push("Лимит");
            if (this.blockOne) this.errors.push("Лимит");

            const uniquePoints = new Set(this.points.map(point => point[0]));
            if (uniquePoints.size !== this.points.length) {

                this.errors.push("Назвние должны быть уникальными!")
            }
        
            if (this.errors.length === 0) {
                let info = {
                    name: this.name,
                    points: this.points,
                    card_id: this.card_id,
                    count_of_checked: 0,
                };
                this.card_id += 1;
                this.FirstColumn.push(info);
            }
        },
        toColumnOne(name, points, card_id, count_of_checked) {
            if (this.FirstColumn.length < 3) {
                let info = {
                    name: name,
                    points: points,
                    card_id: card_id,
                    count_of_checked: count_of_checked
                };
        
                for (let i = 0; i < this.SecondColumn.length; i++) {
                    if (this.SecondColumn[i].card_id === card_id) {
                        this.SecondColumn.splice(i, 1);
                        break;
                    }
                }
        
                this.FirstColumn.push(info);
            }
        },
        toColumnTwo(name, points, card_id, count_of_checked) {
            if (this.SecondColumn.length === 5) {
                this.blockOne = true;
            } else {
                let info = {
                    name: name,
                    points: points,
                    card_id: card_id,
                    count_of_checked: count_of_checked
                };
        
                for (let i = 0; i < this.FirstColumn.length; i++) {
                    if (this.FirstColumn[i].card_id === card_id) {
                        this.FirstColumn.splice(i, 1);
                        break;
                    }
                }
        
                this.SecondColumn.push(info);
            }
        
            let checks = 1;
            eventBus.$emit('checkTwo', checks);
        },
        toColumnThree(name,points, card_id,now){
            let info = {
                name:name,
                points:points,
                card_id:card_id,
                dat:now,
            }
            for(i in this.SecondColumn){
                
                if(this.SecondColumn[i].card_id==card_id){
                    this.SecondColumn.splice(i, 1)
                    break
                }
            }

            this.ThirdColumn.push(info)
            this.blockOne =false;
            let checks = 1;
            eventBus.$emit('checkOne',checks)
        },
    }
});

Vue.component("card", {
    template: `
<div class="card">
    <h3>{{name}}</h3>
    <ul>
        <li v-for="point in points"><task :block="block" :point="point[0]" :pblock="pblock" :done="point[1]" @checked="updatechecked" @updatetwo="updatetwo"></task></li>
    </ul>
    <p>{{dat}}</p>
</div>
    `,
    data() {
        return{
        }
    },
    methods: {
        updatechecked(point) {
            this.count_of_checked += 1;
        
            for (let i in this.points) {
                if (this.points[i][0] == point && this.points[i][1] != true) {
                    this.points[i][1] = true;
                    break;
                }
            }
        
            if (this.count_of_tasks === this.count_of_checked) {
                const now = new Date().toString();
                console.log(this.name, this.points, this.card_id, now);
                this.$emit("to-three", this.name, this.points, this.card_id, now);
            } else if (this.count_of_tasks / 2 <= this.count_of_checked) {
                this.$emit("to-two", this.name, this.points, this.card_id, this.count_of_checked);
            }
        },
    updatetwo(point){
        this.count_of_checked-=1;
        if(this.column==2 || this.column==1){
            for(i in this.points){
                if(this.points[i][0]==point && this.points[i][1] == true){
                    this.points[i][1] = false
                    break
                }
            }
            if(this.column==2){
                if ((this.count_of_tasks/2) > (this.count_of_checked)){
                    this.$emit("to-one",this.name,this.points,this.card_id, this.count_of_checked);
                    }
            }           
        }
    }
    },
    mounted() {
        eventBus.$on('checkOne',checks => {
            this.count_of_checked = 0
            for(i in this.points){
                if(this.points[i][1] == true){
                    this.count_of_checked += 1
                }
            }    
            
            if ((this.count_of_tasks/2) <= (this.count_of_checked) && (this.count_of_tasks) != (this.count_of_checked)){
            this.$emit("to-two",this.name,this.points,this.card_id, this.count_of_checked);
        }
            
        })
        eventBus.$on('checkTwo',checks => {
            this.count_of_checked = 0
            for(i in this.points){
                if(this.points[i][1] == true){
                    this.count_of_checked += 1
                }
            }    
            if ((this.count_of_tasks/2) > (this.count_of_checked)){
            this.$emit("to-one",this.name,this.points,this.card_id, this.count_of_checked);
        }   
        })
    },
    props: {
        name: String,
        points: Array,
        card_id: Number,
        count_of_checked: Number,
        dat: String,
        block: Boolean,
        column: Number,
        pblock: Boolean
    },
    computed: {
        count_of_tasks() {
          return this.points.length;
        },
    }
});

Vue.component("task", {
    template: `
    <div class="task" @click="check" :class="{done:done}">{{point}}</div>
    `,
    data() {
        return{
            
        }
    },
    props: {
        point: String,
        done: Boolean,
        block: Boolean,
        pblock: Boolean
    },
    methods:{
        check() {
            if (!this.pblock && !this.block) {
                if (!this.done) {
                    this.done = true;
                    this.$emit("checked", this.point);
                } else {
                    this.done = false;
                    this.$emit("updatetwo", this.point);
                }
            }
        }
        
    }
});

let app = new Vue({
    el: "#app",
    data: {
    },
    methods: {

    },
});