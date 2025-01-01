const startKeyboard = {
	reply_markup: {
		inline_keyboard: [
			[
				{
					text: "Add new todo ➕",
					callback_data: "new_todo"
				},
				{
					text: "My todos 📄",
					callback_data: "my_todos"
				}

			],
			[
				{ text: "Delete todo 🗑", callback_data: "delete_todo" }
		]
		]
	}
}

module.exports = startKeyboard