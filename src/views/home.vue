<template>
  <main class="todos">
    <h1 class="todos__title">Список дел</h1>
    <form class="todos__form" v-on:submit.prevent="addTodo">
      <textarea class="todos__form-title" v-model="formTitle" name="title" placeholder="Название дела"></textarea>
      <button class="todos__submit" type="submit">
        Добавить
      </button>
    </form>
    <div class="todos__error" v-if="error">
      {{ error }}
      <button class="todos__clear-error" v-on:click="clearErrors">
        Очистить
      </button>
    </div>
    <div class="todos__utils">
      <textarea class="todos__filter" placeholder="Поиск по названию" v-model="filters" v-on:input="filterByName"></textarea>
      <div class="todos__utils-buttons">
        <button class="todos__sort" v-on:click="sortBy('name')">
          Сортировка по названию {{ sortingTitle === 1 ? "по возрастанию" : '' }} {{ sortingTitle === -1 ? 'по убыванию' : '' }}
        </button>
        <button class="todos__sort" v-on:click="sortBy('id')">
          Сортировка по id {{ sortingId === 1 ? "по возрастанию" : '' }} {{ sortingId === -1 ? 'по убыванию' : '' }}
        </button>
      </div>
    </div>
    <ul class="todos__list">
      <li class="todos__item" :class=" todo.completed && 'todos__item--completed'" v-for="todo in todos">
        <span class="todos__name">
          {{ todo.title }}
        </span>
        <div class="todos__buttons">
          <button class="todos__complete" v-on:click="toggleCompleted(todo.id)">
            Завершить
          </button>
          <button class="todos__delete" v-on:click="deleteTodo(todo.id)">
            Удалить
          </button>
        </div>
      </li>
    </ul>
  </main>
</template>
<script>
import { addTodo } from "../services/api/post";
import { getTodos } from "../services/api/get";

export default {
  name: "Home",
  data: () => ({
    formTitle: '',
    initialTodos: [],
    todos: [],
    error: null,
    sortingId: 0,
    sortingTitle: 0,
    filters: '',
    timeOutId: 0
  }),
  methods: {
    filterByName() {
      if (this.filters.length === 0) {
        this.todos = this.initialTodos;
        return;
      }
      clearTimeout(this.timeOutId)
      this.timeOutId = setTimeout(() => {
        this.todos = this.todos.filter(({ title }) => title.toLowerCase().includes(this.filters.toLowerCase()));
      }, 500)
    },
    sortBy(type) {
      this.todos = this.sortTodos(type);
    },
    sortTodos(type) {
      if (type === 'id') {
        this.sortingTitle = 0;
        this.sortingId = this.checkSortDirection(this.sortingId);
        return this.todos.sort((a, b) => {
          if (a.id > b.id) {
            return this.sortingId;
          }

          if (b.id > a.id) {
            return -1 * this.sortingId;
          }

          return 0;
        });
      }

      if (type === 'name') {
        this.sortingId = 0;
        this.sortingTitle = this.checkSortDirection(this.sortingTitle);
        return this.todos.sort((a, b) => {
          if (a.id > b.id) {
            return this.sortingTitle;
          }

          if (b.id > a.id) {
            return -1 * this.sortingTitle;
          }

          return 0;
        });
      }
    },
    checkSortDirection(direction) {
      if (direction === 0) {
        return 1;
      }
      if (direction === 1) {
        return -1;
      }
      return 0;
    },
    toggleCompleted(todoId) {
      const existIndex = this.todos.findIndex(({ id }) => id === todoId);
      if (existIndex !== -1) {
        this.todos[existIndex].completed = !this.todos[existIndex].completed;
      } else {
        this.error = 'Дело удалено или не добавлено'
      }
    },
    deleteTodo(todoId){
      if(confirm("Вы уверены")) {
        this.todos = this.todos.filter(({ id }) => id !== todoId);
      }
    },
    clearErrors() {
      this.error = null
    },
    async addTodo() {
      try {
        if (this.formTitle.length === 0) {
          return;
        }
        const newTodo = await addTodo({ title: this.formTitle, completed: false });
        //id нового дела с апи всегда 201
        newTodo.id = this.todos.length
        this.todos.unshift(newTodo);
        this.formTitle = '';
      } catch (error) {
        this.error = error;
      }
    },
  },
  computed: {
    async loadTodos() {
      try {
        this.todos = await getTodos().then((response) => response.map((item, index) => {
          item.id = index;
          return item;
        })
        .sort((a, b) => b.id - a.id));
        this.initialTodos = [...this.todos];
      } catch (error) {
        this.error = error;
      }
    }
  },

  created() {
    this.loadTodos.then();
  }
}
</script>
<style scoped>
.todos {
  font-family: 'Arial', sans-serif;
}

.todos__title {
  text-align: center;
  font-size: 55px;
}

.todos__form {
  max-width: 1024px;
  margin: 0 auto 20px auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.todos__form-title {
  font-size: 32px;
  resize: none;
  word-break: break-all;
  background-color: #e5e3e3;
  color: #7471a5;
  padding: 10px;
  outline: none;
  width: 100%;
  height: 116px;
  border-radius: 10px;
  box-shadow: 2px 5px 17px skyblue;
  margin-bottom: 20px;
}

.todos__submit {
  background-color: #4d90fe;
  font-size: 32px;
  padding: 10px 20px;
  color: #fff;
  outline: none;
  border-radius: 6px;
  border: none;
  transition: .5s;
  cursor: pointer;
}

.todos__submit:hover {
  background-color: #274fff;
}

.todos__error {
  margin: 20px auto;
  background: #ec7474;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
}

.todos__clear-error {
  background-color: #4d90fe;
  font-size: 16px;
  padding: 5px 10px;
  color: #fff;
  outline: none;
  border-radius: 6px;
  border: none;
  transition: .5s;
  margin-top: 20px;
  cursor: pointer;
}

.todos__utils {
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  width: 1024px;
  margin: 20px auto 0 auto;
}

.todos__filter {
  font-size: 16px;
  height: 20px;
  padding: 2px 5px;
  width: 100%;
  resize: none;
  margin-bottom: 20px;
  word-break: break-all;
  background-color: #e5e3e3;
  color: #7471a5;
  outline: none;
  border-radius: 10px;
  box-shadow: 2px 5px 17px skyblue;
}

.todos__utils-buttons {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.todos__sort {
  outline: none;
  border: none;
  background-color: #4d90fe;
  padding: 10px 20px;
  border-radius: 10px;
  transition: .5s;
  cursor: pointer;
}

.todos__sort:hover {
  background-color: #274fff;
}

.todos__sort:not(last-child) {
  margin-bottom: 10px;
}

.todos__list {
  list-style: none;
  max-width: 1075px;
  margin:  0 auto;
  display: flex;
  flex-direction: column;
}

.todos__item {
  background-color: #f3b4b4;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 10px;
  transition: .5s;
}

.todos__item:hover {
  background-color: #dce2c1;
}

.todos__item:not(last-chold) {
  margin-bottom: 10px;
}

.todos__item--completed {
  background-color: #a0d04a;
}

.todos__name {
  padding: 10px;
  word-break: break-all;
}

.todos__buttons {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  min-width: 18%;
}

.todos__complete {
  outline: none;
  border-radius: 3px;
  border: none;
  font-size: 16px;
  padding: 5px 10px;
  cursor: pointer;
  background-color: #43a843;
  transition: .5s;
}

.todos__complete:hover {
  background-color: #c3d600;
}

.todos__delete {
  outline: none;
  border-radius: 3px;
  border: none;
  font-size: 16px;
  padding: 5px 10px;
  cursor: pointer;
  background-color: #ea2525;
  transition: .5s;
}

.todos__delete:hover {
  background-color: #ff7a7a;
}

</style>