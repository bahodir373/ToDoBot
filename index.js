const { Telegraf } = require("telegraf");
const connectDB = require('./db/db')
require("dotenv").config();
const User = require('./models/userSchema')
const startKeyboard = require('./keyboards/keyboard')
const Todo = require('./models/toDoSchema')

const bot = new Telegraf(process.env.BOT_TOKEN);
let messageId;
const userStates = new Map();

connectDB()

bot.telegram.setMyCommands([
    { command: 'start', description: 'Botni ishga tushirish' }
]);

bot.start(async (ctx) => {
	try {
		const userId = ctx.from.id;
		const username = ctx.from.username
		const first_name = ctx.from.first_name
		const chatId = ctx.chat.id
		
		await ctx.telegram.deleteMessage(chatId, ctx.message.message_id)
		
		const ifExist = User.findOne({userId})

		if(!ifExist	){
			await User.create({userId, username, first_name})
		}

		const message = await ctx.replyWithHTML(`Hi <b>${ctx.from.first_name}</b>! You can add your todos here`, startKeyboard)
		messageId = message.message_id
	} catch (error) {
		console.log(error);
		ctx.replyWithHTML("Something went wrong. Please try again later");
	}
})

bot.action('new_todo', async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    
    if(messageId){
        await ctx.telegram.deleteMessage(chatId, messageId);
    }   

    userStates.set(userId, 'waiting_for_new_todo');
    const message = await ctx.replyWithHTML(`Add your todo here: `);
    messageId = message.message_id;
})

bot.action('my_todos', async (ctx) => {      
  const userId = ctx.from.id
  const chatId = ctx.chat.id

  if(messageId){
    await ctx.telegram.deleteMessage(chatId, messageId)
  }  

  const todos = await Todo.find({userId})

  if(todos.length === 0){
    const message = await ctx.replyWithHTML(`No todos found`, startKeyboard)
    messageId = message.message_id
    return
  }

  const message = await ctx.replyWithHTML(`My todos:\n${todos.map((todo, index) => `${index + 1}. ${todo.todo}`  ).join('\n')}`, startKeyboard)

  messageId = message.message_id
})

bot.action('delete_todo', async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    if(messageId){
        await ctx.telegram.deleteMessage(chatId, messageId);
    }

    const todos = await Todo.find({userId});

    if(todos.length === 0){
        const message = await ctx.replyWithHTML(`No todos found`, startKeyboard);
        messageId = message.message_id;
        return;
    }

    userStates.set(userId, 'waiting_for_delete_todo');
    const message = await ctx.replyWithHTML(
        `Send the number of the todo you want to delete:\n${
            todos.map((todo, index) => `${index + 1}. ${todo.todo}`).join('\n')
        }`
    );
    messageId = message.message_id;
});


bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const state = userStates.get(userId);

    if (!state) return;

    if (state === 'waiting_for_new_todo') {
        const todo = ctx.message.text;
        await Todo.create({todo, userId}).then(async () => {
            const message = await ctx.replyWithHTML(`Todo added`, startKeyboard);
            messageId = message.message_id;
        });
        userStates.delete(userId);
    }
    else if (state === 'waiting_for_delete_todo') {
        const todos = await Todo.find({userId});
        const todoIndex = parseInt(ctx.message.text) - 1;
        
        if(isNaN(todoIndex) || todoIndex < 0 || todoIndex >= todos.length) {
            const message = await ctx.replyWithHTML(`Invalid number, please enter a valid number!`, startKeyboard);
            messageId = message.message_id;
            userStates.delete(userId);
            return;
        }

        await Todo.findByIdAndDelete(todos[todoIndex]._id);
        const message = await ctx.replyWithHTML(`Todo deleted`, startKeyboard);
        messageId = message.message_id;
        userStates.delete(userId);
    }
});

bot.launch().then()
